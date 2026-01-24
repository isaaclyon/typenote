#!/usr/bin/env tsx
/**
 * Development HTTP Server
 *
 * Starts the HTTP API server for web mode development.
 * Uses the same database as the Electron app.
 */

import { homedir } from 'os';
import { join } from 'path';
import { createFileDb, InMemoryFileService } from '@typenote/storage';
import { createHttpServer } from './server.js';

const PORT = 3000;
const DB_PATH = join(homedir(), '.typenote', 'typenote.db');

console.log('🚀 Starting TypeNote HTTP server...');
console.log(`   Database: ${DB_PATH}`);

// Create database connection (with migrations)
const db = createFileDb(DB_PATH);

// Create file service
const fileService = new InMemoryFileService();

// Create and start HTTP server
const server = createHttpServer({ db, fileService, port: PORT });

await server.start();

console.log(`   API: http://localhost:${PORT}/api/v1`);
console.log('   Press Ctrl+C to stop\n');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down...');
  await server.stop();
  db.sqlite.close();
  process.exit(0);
});
