/**
 * Query Result Types
 *
 * Types representing results from read operations.
 * These are transport-agnostic and can be used in any layer.
 */

/**
 * A block in a document tree.
 */
export interface DocumentBlock {
  id: string;
  parentBlockId: string | null;
  orderKey: string;
  blockType: string;
  content: unknown;
  meta: { collapsed?: boolean } | null;
  children: DocumentBlock[];
}

/**
 * Result of a getDocument operation.
 */
export interface GetDocumentResult {
  objectId: string;
  docVersion: number;
  blocks: DocumentBlock[];
}

/**
 * Summary of an object (minimal info for listings).
 */
export interface ObjectSummary {
  id: string;
  title: string;
  typeId: string;
  typeKey: string;
  updatedAt: Date;
}
