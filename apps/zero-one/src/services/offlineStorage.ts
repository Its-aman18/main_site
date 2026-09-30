// ZERO → ONE IndexedDB Offline-First Storage Engine
// Authoritative local replica and persistent command queue.
// Never uses localStorage as the primary event database.

import { Command, EventFact, StartupCanvas } from '../types';

const DB_NAME = 'zero_one_offline_db';
const DB_VERSION = 1;

export class OfflineStorageEngine {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  public async getDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        return reject(new Error('IndexedDB not supported in this environment'));
      }

      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (evt: IDBVersionChangeEvent) => {
        const db = (evt.target as IDBOpenDBRequest).result;

        // 1. Command Queue Store (for offline intent and idempotent retry)
        if (!db.objectStoreNames.contains('command_queue')) {
          const cmdStore = db.createObjectStore('command_queue', { keyPath: 'commandId' });
          cmdStore.createIndex('status', 'status', { unique: false });
          cmdStore.createIndex('clientCreatedAt', 'clientCreatedAt', { unique: false });
        }

        // 2. Fact Log Store (event replay)
        if (!db.objectStoreNames.contains('fact_log')) {
          const factStore = db.createObjectStore('fact_log', { keyPath: 'sequence' });
          factStore.createIndex('type', 'type', { unique: false });
        }

        // 3. State Replica Snapshot
        if (!db.objectStoreNames.contains('state_replica')) {
          db.createObjectStore('state_replica', { keyPath: 'key' });
        }

        // 4. Canvas Offline Store
        if (!db.objectStoreNames.contains('canvas_drafts')) {
          db.createObjectStore('canvas_drafts', { keyPath: 'teamId' });
        }
      };

      req.onsuccess = () => {
        this.db = req.result;
        resolve(this.db);
      };

      req.onerror = () => {
        reject(req.error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.initPromise;
  }

  // --- Command Queue Operations ---
  public async enqueueCommand(cmd: Command): Promise<void> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('command_queue', 'readwrite');
        const store = tx.objectStore('command_queue');
        const req = store.put(cmd);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to enqueue command in IndexedDB:', err);
    }
  }

  public async getPendingCommands(): Promise<Command[]> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('command_queue', 'readonly');
        const store = tx.objectStore('command_queue');
        const req = store.getAll();
        req.onsuccess = () => {
          const all: Command[] = req.result || [];
          const pending = all.filter((c) => c.status === 'PENDING' || c.status === 'RETRY');
          // Sort deterministically by clientCreatedAt
          pending.sort((a, b) => new Date(a.clientCreatedAt).getTime() - new Date(b.clientCreatedAt).getTime());
          resolve(pending);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  public async updateCommandStatus(
    commandId: string,
    status: Command['status'],
    error?: string
  ): Promise<void> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('command_queue', 'readwrite');
        const store = tx.objectStore('command_queue');
        const getReq = store.get(commandId);
        getReq.onsuccess = () => {
          const cmd: Command = getReq.result;
          if (cmd) {
            cmd.status = status;
            if (error) cmd.error = error;
            if (status === 'RETRY') cmd.attemptCount = (cmd.attemptCount || 0) + 1;
            store.put(cmd);
          }
          resolve();
        };
        getReq.onerror = () => reject(getReq.error);
      });
    } catch (err) {
      console.warn('Failed to update command status in IndexedDB:', err);
    }
  }

  public async removeCommand(commandId: string): Promise<void> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('command_queue', 'readwrite');
        const store = tx.objectStore('command_queue');
        const req = store.delete(commandId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to remove command from IndexedDB:', err);
    }
  }

  // --- Fact Log Operations ---
  public async storeFact(fact: EventFact): Promise<void> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('fact_log', 'readwrite');
        const store = tx.objectStore('fact_log');
        const req = store.put(fact);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to store event fact in IndexedDB:', err);
    }
  }

  public async getLatestSequence(): Promise<number> {
    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction('fact_log', 'readonly');
        const store = tx.objectStore('fact_log');
        const req = store.openCursor(null, 'prev');
        req.onsuccess = () => {
          const cursor = req.result;
          if (cursor && cursor.value && typeof cursor.value.sequence === 'number') {
            resolve(cursor.value.sequence);
          } else {
            resolve(0);
          }
        };
        req.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  }

  // --- State Replica Cache ---
  public async saveStateReplica(key: string, data: any): Promise<void> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('state_replica', 'readwrite');
        const store = tx.objectStore('state_replica');
        const req = store.put({ key, data, updatedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to save state replica in IndexedDB:', err);
    }
  }

  public async getStateReplica<T = any>(key: string): Promise<T | null> {
    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction('state_replica', 'readonly');
        const store = tx.objectStore('state_replica');
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && req.result.data) {
            resolve(req.result.data);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  // --- Canvas Offline Draft ---
  public async saveCanvasDraft(teamId: string, canvas: StartupCanvas): Promise<void> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('canvas_drafts', 'readwrite');
        const store = tx.objectStore('canvas_drafts');
        const req = store.put(canvas);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to save canvas draft in IndexedDB:', err);
    }
  }

  public async getCanvasDraft(teamId: string): Promise<StartupCanvas | null> {
    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction('canvas_drafts', 'readonly');
        const store = tx.objectStore('canvas_drafts');
        const req = store.get(teamId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }
}

export const offlineStorage = new OfflineStorageEngine();
