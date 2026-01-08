#!/usr/bin/env node
import { Command } from 'commander';
import { registerExportCommand, registerImportCommand } from './commands/export.js';
import { registerAttachmentCommand } from './commands/attachment.js';
import { registerTemplateCommand } from './commands/template.js';
import { registerTagCommand } from './commands/tag.js';
import { registerBacklinksCommand } from './commands/backlinks.js';
import { registerTaskCommand } from './commands/task.js';
import { registerDevCommand } from './commands/dev.js';
import { registerCoreCommands } from './commands/core.js';

// ============================================================================
// CLI Program
// ============================================================================

const program = new Command();

program.name('typenote').description('TypeNote CLI - Backend testing interface').version('0.1.0');

program
  .command('hello')
  .description('Hello world test command')
  .action(() => {
    console.log('Hello from TypeNote CLI!');
    console.log('Backend services will be accessible here.');
  });

// Register command modules
registerCoreCommands(program);
registerTaskCommand(program);
registerDevCommand(program);
registerExportCommand(program);
registerImportCommand(program);
registerAttachmentCommand(program);
registerTemplateCommand(program);
registerTagCommand(program);
registerBacklinksCommand(program);

program.parse();
