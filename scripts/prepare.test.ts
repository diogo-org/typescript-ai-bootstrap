import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, renameSync, writeFileSync } from 'fs';
import { join } from 'path';

describe('prepare.cjs', () => {
  const scriptPath = join(process.cwd(), 'scripts', 'prepare.cjs');
  const huskyPath = join(process.cwd(), 'node_modules', 'husky');
  const huskyTempPath = join(process.cwd(), 'node_modules', 'husky_test_backup');
  let huskyWasPresent = false;

  beforeEach(() => {
    // Backup husky if it exists
    huskyWasPresent = existsSync(huskyPath);
    if (huskyWasPresent) {
      renameSync(huskyPath, huskyTempPath);
    }
  });

  afterEach(() => {
    // Restore husky if it was present
    if (huskyWasPresent && existsSync(huskyTempPath)) {
      if (existsSync(huskyPath)) {
        rmSync(huskyPath, { recursive: true, force: true });
      }
      renameSync(huskyTempPath, huskyPath);
    }
  });

  it('should skip husky install when CI=true', () => {
    const result = spawnSync('node', [scriptPath], {
      env: { ...process.env, CI: 'true' },
      encoding: 'utf8'
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('CI environment detected, skipping husky install');
  });

  it('should skip husky install when CI=1', () => {
    const result = spawnSync('node', [scriptPath], {
      env: { ...process.env, CI: '1' },
      encoding: 'utf8'
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('CI environment detected, skipping husky install');
  });

  it('should NOT skip husky install when CI=false', () => {
    // Create a fake husky directory
    mkdirSync(huskyPath, { recursive: true });
    writeFileSync(join(huskyPath, 'package.json'), '{}');

    const result = spawnSync('node', [scriptPath], {
      env: { ...process.env, CI: 'false' },
      encoding: 'utf8'
    });

    // Will fail because husky binary isn't really there, but it should try
    expect(result.stdout).toContain('Installing husky hooks...');
    expect(result.stdout).not.toContain('CI environment detected');
    
    // Cleanup
    rmSync(huskyPath, { recursive: true, force: true });
  });

  it('should NOT skip husky install when CI=0', () => {
    // Create a fake husky directory
    mkdirSync(huskyPath, { recursive: true });
    writeFileSync(join(huskyPath, 'package.json'), '{}');

    const result = spawnSync('node', [scriptPath], {
      env: { ...process.env, CI: '0' },
      encoding: 'utf8'
    });

    // Will fail because husky binary isn't really there, but it should try
    expect(result.stdout).toContain('Installing husky hooks...');
    expect(result.stdout).not.toContain('CI environment detected');
    
    // Cleanup
    rmSync(huskyPath, { recursive: true, force: true });
  });

  it('should skip husky install when husky is not installed', () => {
    // Ensure husky directory doesn't exist
    if (existsSync(huskyPath)) {
      rmSync(huskyPath, { recursive: true, force: true });
    }

    const envWithoutCI = { ...process.env };
    delete envWithoutCI.CI;

    const result = spawnSync('node', [scriptPath], {
      env: envWithoutCI,
      encoding: 'utf8'
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Husky not installed (devDependencies may be omitted), skipping husky install');
  });

  it('should install husky hooks successfully when husky is installed and not in CI', () => {
    // Restore husky for this test
    if (huskyWasPresent && existsSync(huskyTempPath)) {
      if (existsSync(huskyPath)) {
        rmSync(huskyPath, { recursive: true, force: true });
      }
      renameSync(huskyTempPath, huskyPath);
    }

    const envWithoutCI = { ...process.env };
    delete envWithoutCI.CI;

    const result = spawnSync('node', [scriptPath], {
      env: envWithoutCI,
      encoding: 'utf8'
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Installing husky hooks...');
    expect(result.stdout).toContain('Husky hooks installed successfully');
    
    // Backup again for cleanup
    if (existsSync(huskyPath)) {
      renameSync(huskyPath, huskyTempPath);
    }
  });

  it('should prioritize CI check over husky availability', () => {
    // Ensure husky directory doesn't exist
    if (existsSync(huskyPath)) {
      rmSync(huskyPath, { recursive: true, force: true });
    }

    const result = spawnSync('node', [scriptPath], {
      env: { ...process.env, CI: 'true' },
      encoding: 'utf8'
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('CI environment detected, skipping husky install');
    expect(result.stdout).not.toContain('Husky not installed');
  });
});
