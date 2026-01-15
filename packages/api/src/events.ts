/**
 * TypeNote Event System
 *
 * Domain events emitted by the main process and consumed by renderer windows.
 * Enables real-time UI updates across all windows when data changes.
 */

// Event type discriminator
export type EventType = 'object:created' | 'object:restored';

/**
 * Emitted when a new object is successfully created
 */
export interface ObjectCreatedEvent {
  type: 'object:created';
  payload: {
    id: string;
    typeKey: string;
    title: string;
    createdAt: Date;
  };
}

/**
 * Emitted when a deleted object is successfully restored
 */
export interface ObjectRestoredEvent {
  type: 'object:restored';
  payload: {
    id: string;
    title: string;
    typeKey: string;
  };
}

/**
 * Union of all TypeNote events
 *
 * To add new event types:
 * 1. Define the interface (e.g., ObjectUpdatedEvent)
 * 2. Add to EventType union
 * 3. Add to TypenoteEvent union
 * 4. Emit from relevant IPC handler in main process
 */
export type TypenoteEvent = ObjectCreatedEvent | ObjectRestoredEvent;
