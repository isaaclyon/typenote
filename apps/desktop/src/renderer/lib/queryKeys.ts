/**
 * Centralized query key factory for consistent cache management.
 *
 * Pattern: [entity, ...identifiers, ...filters]
 * Example: ['object', '01HZX...'] or ['objects', { typeKey: 'Page' }]
 */
export const queryKeys = {
  // Objects
  object: (id: string) => ['object', id] as const,
  objects: () => ['objects'] as const,
  objectsByType: (typeKey: string, sort?: { sortBy?: string; sortDirection?: 'asc' | 'desc' }) =>
    ['objects', { typeKey, ...sort }] as const,

  // Types
  types: () => ['types'] as const,
  type: (id: string) => ['type', id] as const,
  typeCounts: () => ['types', 'counts'] as const,
  typeMetadata: () => ['types', 'metadata'] as const,

  // Pinned objects
  pinnedObjects: () => ['pinned-objects'] as const,

  // Backlinks
  backlinks: (objectId: string) => ['backlinks', objectId] as const,
  unlinkedMentions: (objectId: string) => ['unlinked-mentions', objectId] as const,

  // Documents
  document: (objectId: string) => ['document', objectId] as const,

  // Settings
  settings: () => ['settings'] as const,

  // Calendar
  datesWithNotes: (year: number, month: number) => ['dates-with-notes', year, month] as const,
  objectsCreatedOnDate: (dateKey: string) => ['objects-created-on-date', dateKey] as const,

  // Recent objects
  recentObjects: (limit: number) => ['recent-objects', limit] as const,

  // Search
  searchBlocks: (query: string) => ['search-blocks', query] as const,
} as const;
