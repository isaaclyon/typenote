/**
 * TypeNote Event Emitter
 *
 * Typed wrapper around Node's EventEmitter for domain events in the main process.
 * Events are broadcast to all renderer windows via setupEventBroadcasting() in index.ts.
 */

import { EventEmitter } from 'node:events';
import type { TypenoteEvent } from '@typenote/api';

/**
 * Main process event emitter for TypeNote domain events.
 *
 * Usage:
 *   typenoteEvents.emit({ type: 'object:created', payload: { ... } });
 *   typenoteEvents.on((event) => { console.log('Event:', event); });
 */
export class TypenoteEventEmitter {
  private emitter = new EventEmitter();

  /**
   * Emit a TypeNote event to all listeners
   */
  emit(event: TypenoteEvent): void {
    this.emitter.emit('typenote:event', event);
  }

  /**
   * Subscribe to TypeNote events
   * @returns void - subscribers don't need cleanup in main process
   */
  on(listener: (event: TypenoteEvent) => void): void {
    this.emitter.on('typenote:event', listener);
  }

  /**
   * Unsubscribe from TypeNote events
   */
  off(listener: (event: TypenoteEvent) => void): void {
    this.emitter.off('typenote:event', listener);
  }
}

// Singleton instance
export const typenoteEvents = new TypenoteEventEmitter();
