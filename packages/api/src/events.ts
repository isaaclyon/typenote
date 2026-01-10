/**
 * TypeNote Event System
 *
 * Domain events emitted by the main process and consumed by renderer windows.
 * Enables real-time UI updates across all windows when data changes.
 */

// Event type discriminator
export type EventType = 'object:created';

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
 * Union of all TypeNote events
 *
 * To add new event types:
 * 1. Define the interface (e.g., ObjectUpdatedEvent)
 * 2. Add to EventType union
 * 3. Add to TypenoteEvent union
 * 4. Emit from relevant IPC handler in main process
 */
export type TypenoteEvent = ObjectCreatedEvent;
