#!/usr/bin/env node

/**
 * Cross-platform prepare script that installs husky only in local development.
 * Skips husky installation in CI environments to allow publishing without dev dependencies.
 */

const { execSync } = require('child_process');

// Check if we're in a CI environment
const isCI = process.env.CI === 'true' || 
             process.env.CI === '1' || 
             Boolean(process.env.CI);

if (isCI) {
  console.log('CI environment detected, skipping husky install');
  process.exit(0);
}

try {
  console.log('Installing husky hooks...');
  execSync('husky install', { stdio: 'inherit' });
  console.log('Husky hooks installed successfully');
} catch (error) {
  console.error('Failed to install husky hooks:', error.message);
  process.exit(1);
}
