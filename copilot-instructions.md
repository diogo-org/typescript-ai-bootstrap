# Copilot Instructions for TypeScript Bootstrap

## Project Overview

This is a reusable npm package that provides high-quality TypeScript project scaffolding. It extracts the best practices and tooling configuration from real-world projects to create a standardized, AI-friendly development environment.

## Architecture Principles

### #0 Rule: Self-Dogfooding Architecture - CRITICAL ⚠️

**This project uses its own configurations before distributing them to generated projects.**

**Why:** We want this project's settings, scripts, and configurations to be **identical** to those in generated projects, so we test these settings in:
- Unit tests (npm test)
- Feature tests (project initialization)
- Deployment environment (CI/CD workflows)

**Before** replicating configurations to other projects via `init()` and `update()`.

**Implementation:**

**Shared configs (copied from root):**
- `.github/` - Workflows and AI instructions (stored in root, copied at runtime)
- `.husky/` - Git hooks for pre-commit checks (stored in root, copied at runtime)
- `eslint.config.js` - Linting rules (stored in root, copied at runtime)
- `src/test.setup.ts` - Test environment setup (stored in root, copied at runtime)
- `.gitignore` - Git ignore patterns (stored in root, copied at runtime)

**Template-specific configs (copied from templates/[template-name]/):**
- `vitest.config.ts` - Test configuration (React needs 'happy-dom', TypeScript needs 'node')
- `tsconfig.json` - TypeScript settings (React needs JSX support, TypeScript doesn't need DOM types)
- `tsconfig.node.json` - TypeScript for build tools
- `vite.config.ts` - Build configuration (React needs JSX plugin, TypeScript is vanilla)
- `package.json` - Dependencies and scripts (merged at runtime)
- `README.md` - Template-specific documentation
- Template-specific source files in `src/`

Root `package.json` must include shared directories (`.github/`, `.husky/`, etc.) in `"files"` array for npm publishing.

**DO NOT:**
- ❌ Move shared config files into `templates/` to avoid publishing them separately
- ❌ Duplicate template-specific configs in root (they need different settings per template)
- ❌ Skip testing configs before distributing them

**DO:**
- ✅ Keep shared configs in root, template-specific configs in `templates/[template-name]/`
- ✅ Test both shared and template-specific configs in this project first
- ✅ Include required directories in `package.json` `"files"` array
- ✅ Copy from root using `copyFile()` and `copyDirectory()` helpers
- ✅ Copy template-specific files using `copyTemplate()` helper

## Core Philosophy

1. **Quality First**: Enforce strict standards through automation
2. **AI-Friendly**: Clear patterns and structure that AI assistants can understand and maintain
3. **Zero Compromises**: Block commits that don't meet quality standards
4. **Reusable**: Configuration that works across multiple projects

## Key Components

### 1. Pre-commit Hooks (Most Important!)

The `.husky/pre-commit.cjs` script is the heart of this template. It runs 6 checks:

1. **ESLint** - Code style and quality
2. **Tests with Coverage** - Must pass with ≥80% coverage
3. **Code Duplication** - Maximum 1% duplication
4. **Secrets Detection** - No API keys, tokens, or passwords
5. **TypeScript** - No type errors
6. **Build** - Production build must succeed

**Never modify these thresholds without good reason.** They ensure quality.

### 2. Configuration Files

- `eslint.config.js` - Strict linting (no magic numbers, strict TypeScript)
- `vitest.config.ts` - Testing with 80% coverage requirement
- `vite.config.ts` - Fast development and builds
- `tsconfig.json` - Strict TypeScript configuration

### 3. Template Structure

Files in `templates/` are copied to new projects when `typescript-bootstrap` is run.

## Code Standards

### No Magic Numbers

```typescript
// ❌ Bad
const width = 500;
if (items.length > 10) { }

// ✅ Good
const DEFAULT_WIDTH = 500;
const MAX_ITEMS = 10;
const width = DEFAULT_WIDTH;
if (items.length > MAX_ITEMS) { }
```

Exceptions: 0, 1, 2, -1 are allowed in common patterns.

### Test Coverage

- Minimum 80% for lines, functions, branches, statements
- Excluded: main.tsx, *.d.ts, *.config.*, test.setup.ts

### Code Duplication

- Maximum 1% duplication allowed
- Use jscpd to detect duplicates
- Refactor common patterns into utilities

## Development Workflow

### Making Changes to Templates

1. Edit files in `templates/`
2. Build: `npm run build`
3. Test locally: `npm link` then create a test project
4. Verify all generated files are correct
5. Commit and publish

### Adding New Features

- Add to templates, not to the CLI logic
- Keep the CLI simple (just copy files and replace placeholders)
- Document in README.md

### Modifying Pre-commit Checks

The pre-commit hook is critical. Changes should be:
- Clearly justified
- Tested thoroughly
- Documented

## Common Tasks

### Update Dependencies

When updating template dependencies:
1. Update `templates/package.json`
2. Test in a generated project
3. Verify all scripts still work
4. Check pre-commit hooks still pass

### Add New Configuration

1. Create config file in `templates/`
2. Update CLI to handle placeholders if needed
3. Document in README.md
4. Test generation

## Publishing

Package is published to GitHub Packages as `@diogo/typescript-bootstrap`.

Build and publish:
```bash
npm run build
npm publish
```

## Important Notes

- **Pre-commit hooks are non-negotiable** - They enforce quality
- **80% coverage is the minimum** - Not a suggestion
- **No magic numbers** - Use named constants
- **Template files must be generic** - No project-specific code

## AI Assistant Guidelines

When helping with this project:

1. **Preserve Quality Standards**: Never lower thresholds or disable checks
2. **Keep Templates Clean**: Templates should work for any project
3. **Test Changes**: Suggest testing via `npm link` before publishing
4. **Maintain Philosophy**: Quality over convenience
5. **Document Changes**: Update README.md for user-facing changes

## File Structure

```
typescript-bootstrap/
├── src/
│   └── index.ts           # CLI logic
├── bin/
│   └── cli.js            # Executable entry point
├── templates/            # Files copied to new projects
│   ├── .husky/           # Pre-commit hooks ⭐
│   ├── .github/workflows/
│   ├── src/
│   ├── eslint.config.js
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── tsconfig.json
│   └── package.json
├── package.json          # Package metadata
└── README.md            # User documentation
```

## Success Criteria

A successful project using this bootstrap:
- ✅ Cannot commit code with linting errors
- ✅ Cannot commit code with failing tests
- ✅ Cannot commit code with low coverage
- ✅ Cannot commit code with type errors
- ✅ Cannot commit code that doesn't build
- ✅ Has clear, maintainable structure
- ✅ Is easy for AI to understand and modify
