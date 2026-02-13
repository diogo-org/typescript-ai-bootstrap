#!/usr/bin/env node

import { init, update } from '../dist/index.js';

const args = process.argv.slice(2);
const command = args[0];

if (command === 'update') {
  update().catch((error) => {
    console.error('Error updating project:', error);
    process.exit(1);
  });
} else {
  // Parse template flag
  const templateIndex = args.indexOf('--template');
  const template = templateIndex !== -1 && args[templateIndex + 1] 
    ? args[templateIndex + 1] 
    : undefined;

  // Default to init command
  init({ template }).catch((error) => {
    console.error('Error initializing project:', error);
    process.exit(1);
  });
}
