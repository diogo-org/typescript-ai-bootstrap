#!/usr/bin/env node

import { init } from '../dist/index.js';

init().catch((error) => {
  console.error('Error initializing project:', error);
  process.exit(1);
});
