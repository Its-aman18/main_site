// Real-Time Event Bus for ZERO -> ONE (Single Source of Truth Event Stream)
// Uses BroadcastChannel across tabs/devices and Local Storage fallback

import { resolveApiUrl } from '../lib/apiBase';

export type SimulationEventType =
  | 'EVENT_STATE_CHANGED'
  | 'CLOCK_SYNC'
  | 'LOCKDOWN_TRIGGERED'
  | 'PURCHASE_PROPOSED'
  | 'PURCHASE_COMMITTED'
  | 'PURCHASE_REVERSED'
  | 'FUNDS_UPDATED'
  | 'PRICE_UPDATED'
  | 'STOCK_UPDATED'
  | 'MARKET_UPDATED'
  | 'CRISIS_DISPATCHED'
  | 'CRISIS_RESPONSE_RECEIVED'
  | 'CRISIS_TIMEOUT'
  | 'CRISIS_RESOLVED'
  | 'MARKET_ITEM_ADDED'
  | 'TEAM_UPDATED'
  | 'EVENT_CONFIG_UPDATED'
  | 'LIVE_SCREEN_CONFIG_UPDATED'
  | 'CRISIS_CARD_ADDED'
  | 'JUDGING_CRITERIA_UPDATED'
  | 'AUCTION_OPENED'
  | 'AUCTION_BID_RECEIVED'
  | 'AUCTION_CLOSED'
  | 'TRADE_PROPOSED'
  | 'TRADE_COMMITTED'
  | 'CANVAS_UPDATED'
  | 'ARTIFACT_SUBMITTED'
  | 'SCORE_SUBMITTED'
  | 'SCORES_LOCKED'
  | 'RESULTS_REVEALED'
  | 'ROLE_REASSIGNED'
  | 'ANNOUNCEMENT_BROADCAST'
  | 'EMERGENCY_OVERRIDE'
  | 'SIMULATION_RESET'
  | 'ADMIN_AUTH_UPDATED'
  | 'ADMIN_VERIFIED'
  | 'ADMIN_SUSPENDED'
  | 'ADMIN_REVOKED'
  | 'ADMIN_REACTIVATED'
  | 'SERVER_TIME_SYNC'
  | 'PURCHASE_APPROVED'
  | 'PURCHASE_REJECTED'
  | 'ROLE_CLAIMED'
  | 'LOCKDOWN_RELEASED'
  | 'SNAPSHOT_RESTORED'
  | 'CONNECTED';

export interface SimulationEvent<T = any> {
  id: string;
  type: SimulationEventType;
  payload: T;
  actor: string;
  timestamp: string;
  authoritativeServerTimestamp: number;
}

type EventListener<T = any> = (event: SimulationEvent<T>) => void;

class RealtimeEventStream {
  private channel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;
  private listeners: Map<SimulationEventType | '*', Set<EventListener>> = new Map();
  private processedEventIds: Set<string> = new Set();

  constructor() {
    this.initBroadcastChannel();
    this.initServerRealtimeStream();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('zero_one_authoritative_event_bus');
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type) {
            this.handleIncomingEvent(event.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization fallback:', err);
      }
    }
  }

  private initServerRealtimeStream() {
    if (typeof window !== 'undefined' && typeof EventSource !== 'undefined') {
      try {
        // Same-origin in dev (:5175 middleware) and prod (:5003 standalone);
        // absolute only for split deployments (VITE_ZERO_ONE_API_URL).
        // withCredentials carries the scriet_session cookie when the backend
        // shares the .codescriet.dev parent domain.
        this.eventSource = new EventSource(resolveApiUrl('/api/realtime/stream'), {
          withCredentials: true,
        });
        this.eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data && data.type) {
              this.handleIncomingEvent(data);
            }
          } catch (err) {
            // Ignore parse errors on keepalive comments
          }
        };
        this.eventSource.onerror = () => {
          // Reconnection is handled automatically by EventSource
        };
      } catch (err) {
        console.warn('Server SSE stream initialization fallback:', err);
      }
    }
  }

  private handleIncomingEvent(event: SimulationEvent) {
    if (event.id && this.processedEventIds.has(event.id)) {
      return; // Deduplicate
    }
    if (event.id) {
      this.processedEventIds.add(event.id);
      if (this.processedEventIds.size > 200) {
        const first = this.processedEventIds.values().next().value;
        if (first) this.processedEventIds.delete(first);
      }
    }
    this.notifyListeners(event);
  }

  public emit<T = any>(type: SimulationEventType, payload: T, actor = 'SYSTEM'): SimulationEvent<T> {
    const simEvent: SimulationEvent<T> = {
      id: 'evt-' + Math.random().toString(36).substring(2, 9),
      type,
      payload,
      actor,
      timestamp: new Date().toISOString(),
      authoritativeServerTimestamp: Date.now(),
    };

    // Broadcast across windows/tabs
    if (this.channel) {
      try {
        this.channel.postMessage(simEvent);
      } catch (err) {
        console.error('Failed to broadcast event:', err);
      }
    }

    // Also notify local listeners
    this.notifyListeners(simEvent);

    return simEvent;
  }

  public on<T = any>(type: SimulationEventType | '*', callback: EventListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback as EventListener);

    return () => {
      this.off(type, callback);
    };
  }

  public off<T = any>(type: SimulationEventType | '*', callback: EventListener<T>) {
    const set = this.listeners.get(type);
    if (set) {
      set.delete(callback as EventListener);
    }
  }

  private notifyListeners(event: SimulationEvent) {
    const specificListeners = this.listeners.get(event.type);
    if (specificListeners) {
      specificListeners.forEach((cb) => {
        try {
          cb(event);
        } catch (e) {
          console.error(`Error in event listener for ${event.type}:`, e);
        }
      });
    }

    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach((cb) => {
        try {
          cb(event);
        } catch (e) {
          console.error('Error in wildcard event listener:', e);
        }
      });
    }
  }
}

export const realtimeBus = new RealtimeEventStream();
