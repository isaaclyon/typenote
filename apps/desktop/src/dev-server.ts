#!/usr/bin/env node
/**
 * Development HTTP Server
 *
 * Starts the HTTP API server for web mode development.
 * This allows running the app in a browser without Electron.
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { InMemoryFileService } from '@typenote/storage';
import { createHttpServer } from '@typenote/http-server';

const PORT = 3000;
const DB_PATH = process.env['TYPENOTE_DB_PATH'] || './typenote-dev.db';

console.log('🚀 Starting TypeNote HTTP server...');
console.log(`   Database: ${DB_PATH}`);
console.log(`   Port: ${PORT}`);

// Create database instance
const sqlite = new Database(DB_PATH);
const db = drizzle(sqlite);

// Create file service (in-memory for dev)
const fileService = new InMemoryFileService();

// Create HTTP server
const server = createHttpServer({ db, fileService, port: PORT });

// Start server
await server.start();

console.log(`✅ Server running at http://localhost:${PORT}`);
console.log('   API endpoints available at /api/v1/*');
console.log('   Press Ctrl+C to stop');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down...');
  await server.stop();
  sqlite.close();
  process.exit(0);
});
