import type { Database as BetterSqlite3Database, RunResult } from 'better-sqlite3';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema.js';
import { FTS_BLOCKS_CREATE_SQL } from './schema.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory containing this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Drizzle migrations directory (relative to package root)
const MIGRATIONS_PATH = join(__dirname, '..', 'drizzle');

/**
 * TypeNote database type - Drizzle ORM with schema + raw query helpers
 */
export interface TypenoteDb extends BetterSQLite3Database<typeof schema> {
  /**
   * Execute a raw SQL query and return all rows
   */
  all<T>(sql: string, params?: unknown[]): T[];

  /**
   * Execute a raw SQL statement
   */
  run(sql: string, params?: unknown[]): RunResult;

  /**
   * Execute a function within a SQLite transaction.
   * Uses better-sqlite3's native transaction support (synchronous).
   * If the function throws, the transaction is rolled back.
   * Returns the result of the function.
   */
  atomic<T>(fn: () => T): T;

  /**
   * Get the underlying better-sqlite3 database
   */
  readonly sqlite: BetterSqlite3Database;
}

/**
 * Create a database connection with Drizzle ORM.
 */
function createDb(sqlite: BetterSqlite3Database): TypenoteDb {
  const db = drizzle(sqlite, { schema });

  // Create the drizzle wrapper with raw query helpers
  return Object.assign(db, {
    all<T>(sql: string, params?: unknown[]): T[] {
      const stmt = sqlite.prepare(sql);
      return (params ? stmt.all(...params) : stmt.all()) as T[];
    },

    run(sql: string, params?: unknown[]): RunResult {
      const stmt = sqlite.prepare(sql);
      return params ? stmt.run(...params) : stmt.run();
    },

    atomic<T>(fn: () => T): T {
      // better-sqlite3's transaction() returns a function that executes the transaction
      const txFn = sqlite.transaction(fn);
      return txFn();
    },

    get sqlite() {
      return sqlite;
    },
  }) as TypenoteDb;
}

/**
 * Run migrations on the database.
 * Also creates FTS5 table which Drizzle doesn't support natively.
 */
function runMigrations(db: TypenoteDb) {
  migrate(db, { migrationsFolder: MIGRATIONS_PATH });

  // Drizzle doesn't handle FTS5 tables, so we create it manually
  // This is idempotent due to IF NOT EXISTS
  db.run(FTS_BLOCKS_CREATE_SQL);
}

/**
 * Create an in-memory test database with migrations applied.
 * Each call creates a fresh isolated database.
 */
export function createTestDb(): TypenoteDb {
  const sqlite = new Database(':memory:');
  const db = createDb(sqlite);
  runMigrations(db);
  return db;
}

/**
 * Create a file-based database at the given path.
 */
export function createFileDb(path: string): TypenoteDb {
  const sqlite = new Database(path);
  const db = createDb(sqlite);
  runMigrations(db);
  return db;
}

/**
 * Close the database connection.
 */
export function closeDb(db: TypenoteDb): void {
  db.sqlite.close();
}
