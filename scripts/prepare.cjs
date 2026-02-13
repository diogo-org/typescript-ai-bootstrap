#!/usr/bin/env node

/**
 * Cross-platform prepare script that installs husky only in local development.
 * Skips husky installation in CI environments to allow publishing without dev dependencies.
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { resolve } = require('path');

// Check if we're in a CI environment
// Only treat 'true' or '1' as truthy to avoid false positives from CI=false or CI=0
const isCI = process.env.CI === 'true' || process.env.CI === '1';

if (isCI) {
  console.log('CI environment detected, skipping husky install');
  process.exit(0);
}

// Check if husky is available (installed in node_modules)
const huskyPath = resolve(process.cwd(), 'node_modules', 'husky');
if (!existsSync(huskyPath)) {
  console.log('Husky not installed (devDependencies may be omitted), skipping husky install');
  process.exit(0);
}

try {
  console.log('Installing husky hooks...');
  execSync('npx husky install', { stdio: 'inherit' });
  console.log('Husky hooks installed successfully');
} catch (error) {
  console.error('Failed to install husky hooks:', error.message);
  process.exit(1);
}
