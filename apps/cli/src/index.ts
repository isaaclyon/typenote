#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program.name('typenote').description('TypeNote CLI - Backend testing interface').version('0.1.0');

program
  .command('hello')
  .description('Hello world test command')
  .action(() => {
    console.log('Hello from TypeNote CLI!');
    console.log('Backend services will be accessible here.');
  });

program.parse();
