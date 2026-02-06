# Migration Guide: Using TypeScript Bootstrap in Easy-Logic

This guide explains how to integrate the `@diogo/typescript-bootstrap` package into the `easy-logic` project, removing scaffolding code and keeping only business logic and UI.

## Overview

After migration, easy-logic will:
- ✅ Use `@diogo/typescript-bootstrap` for all configuration and scaffolding
- ✅ Keep only UI components and business logic (formula, proof, truth table)
- ✅ Have a cleaner, more maintainable structure
- ✅ Benefit from centralized quality standards

## Migration Steps

### 1. Publish typescript-bootstrap to GitHub Packages

First, ensure typescript-bootstrap is published (see [PUBLISHING.md](../typescript-bootstrap/PUBLISHING.md)):

```bash
cd typescript-bootstrap
npm run build
npm publish
```

### 2. Install typescript-bootstrap in easy-logic

Add to easy-logic's `.npmrc`:
```
@diogo:registry=https://npm.pkg.github.com
```

Install the package:
```bash
cd easy-logic
npm install @diogo/typescript-bootstrap --save-dev
```

### 3. Remove Scaffolding Files from easy-logic

Delete these files (they'll come from typescript-bootstrap):

```bash
# Configuration files to remove
rm vite.config.ts
rm vitest.config.ts
rm eslint.config.js
rm tsconfig.json
rm tsconfig.node.json
```

**DO NOT DELETE:**
- `package.json` (needs modification, not deletion)
- `src/` folder (contains business logic)
- `index.html` (contains app-specific content)

### 4. Update easy-logic package.json

Modify `easy-logic/package.json` to reference the bootstrap configs:

**Before:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    // ...
  }
}
```

**After:**
```json
{
  "scripts": {
    "dev": "vite --config node_modules/@diogo/typescript-bootstrap/templates/vite.config.ts",
    "build": "tsc --project node_modules/@diogo/typescript-bootstrap/templates/tsconfig.json && vite build --config node_modules/@diogo/typescript-bootstrap/templates/vite.config.ts",
    "test": "vitest --run --config node_modules/@diogo/typescript-bootstrap/templates/vitest.config.ts",
    "test:ui": "vitest --ui --config node_modules/@diogo/typescript-bootstrap/templates/vitest.config.ts",
    "test:coverage": "vitest --run --coverage --config node_modules/@diogo/typescript-bootstrap/templates/vitest.config.ts",
    "lint": "eslint src --config node_modules/@diogo/typescript-bootstrap/templates/eslint.config.js",
    "lint:fix": "eslint src --fix --config node_modules/@diogo/typescript-bootstrap/templates/eslint.config.js"
  }
}
```

### 5. Add TypeScript Configuration Extends

Create a minimal `tsconfig.json` in easy-logic that extends the bootstrap:

```json
{
  "extends": "./node_modules/@diogo/typescript-bootstrap/templates/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 6. Update Vite Config (if needed)

If easy-logic needs custom Vite configuration:

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import baseConfig from '@diogo/typescript-bootstrap/templates/vite.config'

export default defineConfig({
  ...baseConfig,
  // Add easy-logic specific overrides
  base: process.env.CI ? '/easy-logic/' : '/',
})
```

### 7. Update ESLint Config for i18n

Since easy-logic uses i18n, create a custom ESLint config that extends the base:

Create `eslint.config.js`:
```javascript
import baseConfig from '@diogo/typescript-bootstrap/templates/eslint.config.js';
import i18next from 'eslint-plugin-i18next';

export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      i18next,
    },
    rules: {
      'i18next/no-literal-string': ['error', {
        mode: 'jsx-text-only',
        'jsx-attributes': {
          include: ['title', 'aria-label', 'placeholder', 'alt'],
        },
        'jsx-components': {
          exclude: ['Trans'],
        },
        words: {
          exclude: [
            '[A-Z]',
            '[TF]',
            '^[.:;,!?]$',
            '.*[🎉🎊🌟⭐✨💫🎆🎇🏆👏🙌💯🔥💪].*',
          ],
        },
      }],
    },
  },
];
```

### 8. Test the Migration

Run all checks to ensure everything works:

```bash
cd easy-logic

# Install dependencies
npm install

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Dev server
npm run dev
```

## Expected Results

After migration, easy-logic should:
- ✅ Build successfully
- ✅ Pass all tests
- ✅ Pass linting
- ✅ Have no TypeScript errors
- ✅ Run in development mode
- ✅ Have a cleaner repository with less configuration clutter

## Structure Comparison

### Before Migration

```
easy-logic/
├── src/                    # Business logic + UI
├── vite.config.ts         # ← Remove
├── vitest.config.ts       # ← Remove
├── eslint.config.js       # ← Remove or extend
├── tsconfig.json          # ← Remove or extend
├── tsconfig.node.json     # ← Remove
└── package.json           # Modify
```

### After Migration

```
easy-logic/
├── src/                    # Business logic + UI only!
├── tsconfig.json          # Extends bootstrap (optional)
├── eslint.config.js       # Extends bootstrap (optional)
└── package.json           # References bootstrap configs
```

## Advantages

1. **Less Maintenance**: Configuration updates happen in typescript-bootstrap
2. **Consistency**: All TypeScript projects use the same quality standards
3. **Cleaner Repository**: Focus on business logic, not scaffolding
4. **Easier Onboarding**: New developers see only relevant code
5. **Reusability**: Other projects can use the same bootstrap

## Troubleshooting

### Issue: Cannot find module '@diogo/typescript-bootstrap'

**Solution**: Ensure you're authenticated to GitHub Packages and have the correct `.npmrc` file.

### Issue: Tests failing after migration

**Solution**: Check that `src/test.setup.ts` is properly configured and all test dependencies are installed.

### Issue: Linting errors

**Solution**: The bootstrap enforces strict rules. Either fix the issues or add overrides in your local `eslint.config.js`.

### Issue: Build errors

**Solution**: Ensure TypeScript compiles with the extended config. Check that all paths and imports are correct.

## Rollback Plan

If needed, you can rollback:

1. `npm uninstall @diogo/typescript-bootstrap`
2. Restore the original config files from git: `git checkout vite.config.ts vitest.config.ts eslint.config.js tsconfig.json tsconfig.node.json`
3. Update package.json scripts back to original

## Next Steps

After successful migration:

1. Update CI/CD pipelines if needed
2. Document the dependency on typescript-bootstrap
3. Create similar migrations for other projects
4. Contribute improvements back to typescript-bootstrap

## Questions?

See [typescript-bootstrap README](../typescript-bootstrap/README.md) for more details on the bootstrap package itself.
