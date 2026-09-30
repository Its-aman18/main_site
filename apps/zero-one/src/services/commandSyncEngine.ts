// ZERO → ONE Client-Side Command Queue & Synchronization Engine
// Implements authoritative client-server command execution, optimistic updates,
// offline command queueing in IndexedDB, and automatic reconciliation upon network reconnect.

import { Command, CommandType, CommandExecutionResult, EventFact } from '../types';
import { offlineStorage } from './offlineStorage';
import { realtimeBus } from './eventBus';
import { resolveApiUrl } from '../lib/apiBase';
import { getZeroOneStoredToken } from '../lib/authToken';

export type SyncStatusListener = (status: {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}) => void;

class CommandSyncEngine {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private pendingCount: number = 0;
  private listeners: Set<SyncStatusListener> = new Set();
  private syncTimer: any = null;

  constructor() {
    this.initNetworkListeners();
    this.updatePendingCount();
  }

  private initNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyStatus();
        this.reconcileAndDrainQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyStatus();
      });

      // Background periodic drain every 10 seconds if online
      this.syncTimer = setInterval(() => {
        if (this.isOnline && !this.isSyncing) {
          this.drainPendingCommands();
        }
      }, 10000);
    }
  }

  public subscribeStatus(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    listener({
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.pendingCount,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyStatus() {
    for (const listener of this.listeners) {
      listener({
        isOnline: this.isOnline,
        isSyncing: this.isSyncing,
        pendingCount: this.pendingCount,
      });
    }
  }

  private async updatePendingCount() {
    try {
      const pending = await offlineStorage.getPendingCommands();
      this.pendingCount = pending.length;
      this.notifyStatus();
    } catch {
      // Ignore
    }
  }

  // --- Dispatch Command ---
  public async dispatch<T = any>(
    type: CommandType,
    payload: T,
    metadata?: {
      userId?: string;
      userEmail?: string;
      teamId?: string;
      role?: Command['role'];
      deviceId?: string;
    }
  ): Promise<CommandExecutionResult> {
    const meta = metadata || {};
    // One stable device id per browser (persisted). Previously every dispatch
    // minted a fresh random id, so CLAIM_ROLE and BIND_DEVICE bound DIFFERENT
    // devices and role sessions fragmented across calls.
    let deviceId = meta.deviceId || null;
    if (!deviceId && typeof localStorage !== 'undefined') {
      deviceId = localStorage.getItem('zero_one_device_token');
      if (!deviceId) {
        deviceId =
          'dev-' +
          Date.now().toString(36) +
          '-' +
          Math.random().toString(36).substring(2, 9);
        try {
          localStorage.setItem('zero_one_device_token', deviceId);
        } catch {
          // storage blocked — fall through to the ephemeral id below
        }
      }
    }
    if (!deviceId) {
      deviceId = 'dev-client-' + Math.random().toString(36).substring(2, 9);
    }

    const command: Command<T> = {
      commandId: 'cmd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      deviceId,
      userId: meta.userId || 'anonymous',
      userEmail: meta.userEmail,
      teamId: meta.teamId,
      role: meta.role || 'CEO',
      type,
      payload,
      clientCreatedAt: new Date().toISOString(),
      attemptCount: 1,
      status: 'PENDING',
    };

    // Store in IndexedDB Command Queue
    await offlineStorage.enqueueCommand(command);
    await this.updatePendingCount();

    // If offline, return optimistic pending result
    if (!this.isOnline) {
      return {
        success: true,
        commandId: command.commandId,
        message: 'Saved offline. Will synchronize immediately when network reconnects.',
      };
    }

    // If online, execute immediately
    return this.executeDirect(command);
  }

  // --- Execute Direct via HTTP ---
  private async executeDirect(command: Command): Promise<CommandExecutionResult> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (command.userEmail) headers['x-user-email'] = command.userEmail;
      if (command.role) headers['x-user-role'] = command.role;
      if (command.deviceId) headers['x-device-id'] = command.deviceId;
      // Main-site session (shared-JWT handoff). The backend prefers the
      // verified JWT identity over the self-asserted x-user-email header.
      const sessionToken = getZeroOneStoredToken();
      if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;

      const res = await fetch(resolveApiUrl('/api/zero-one/commands'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(command),
      });

      const result: CommandExecutionResult = await res.json();

      if (result.success) {
        await offlineStorage.updateCommandStatus(command.commandId, 'ACCEPTED');
        await offlineStorage.removeCommand(command.commandId);
      } else {
        await offlineStorage.updateCommandStatus(
          command.commandId,
          result.retryable ? 'RETRY' : 'REJECTED',
          result.message
        );
      }

      await this.updatePendingCount();
      return result;
    } catch (err: any) {
      // Network failure during transmission -> mark for RETRY
      await offlineStorage.updateCommandStatus(command.commandId, 'RETRY', err.message);
      await this.updatePendingCount();
      return {
        success: false,
        commandId: command.commandId,
        retryable: true,
        message: 'Network error: Command queued in IndexedDB for retry.',
      };
    }
  }

  // --- Reconnection & Queue Drain ---
  public async reconcileAndDrainQueue(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.notifyStatus();

    try {
      // 1. Fetch missed facts since latest local sequence
      const latestLocalSeq = await offlineStorage.getLatestSequence();
      try {
        const eventsRes = await fetch(resolveApiUrl(`/api/zero-one/events?sinceSequence=${latestLocalSeq}`), {
          credentials: 'include',
        });
        if (eventsRes.ok) {
          const { facts }: { facts: EventFact[] } = await eventsRes.json();
          if (Array.isArray(facts)) {
            for (const fact of facts) {
              await offlineStorage.storeFact(fact);
              // Re-emit into client event stream for local replica reconciliation
              realtimeBus.emit(fact.type as any, fact.payload, fact.actor);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to catch up missed facts:', err);
      }

      // 2. Drain pending commands
      await this.drainPendingCommands();
    } finally {
      this.isSyncing = false;
      this.notifyStatus();
    }
  }

  private async drainPendingCommands(): Promise<void> {
    const pending = await offlineStorage.getPendingCommands();
    for (const cmd of pending) {
      try {
        await this.executeDirect(cmd);
      } catch {
        break; // Stop drain on network disconnect
      }
    }
    await this.updatePendingCount();
  }
}

export const commandSync = new CommandSyncEngine();
