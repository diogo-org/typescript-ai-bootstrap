# TypeScript Bootstrap

Authored by Copilot, guided by Diogo.

> High-quality TypeScript project scaffolding optimized for AI-assisted development

## Features

- ⚡️ **Vite** - Lightning fast HMR and build tooling
- 🎯 **TypeScript** - Strict type checking with best practices
- ✅ **Vitest** - Fast unit testing with 80% coverage requirements
- 🔍 **ESLint** - Strict linting rules for quality code
- 🧪 **Testing Library** - React component testing utilities
- 🎨 **React** - Modern React 18 with TypeScript
- � **Pre-commit Hooks** - Automated quality checks before every commit
- �📦 **Ready for CI/CD** - Pre-configured for GitHub Actions

## Philosophy

This scaffolding enforces high-quality code standards ideal for AI-assisted development:

- **No Magic Numbers**: All numeric literals must be named constants
- **Strict TypeScript**: Full type safety with strict compiler options
- **High Test Coverage**: 80% minimum coverage for lines, functions, branches, and statements
- **Consistent Code Style**: ESLint enforces consistent patterns
- **Pre-commit Quality Gates**: Automated checks prevent bad commits
- **AI-Friendly Structure**: Clear separation of concerns and predictable patterns

## Installation

```bash
npm install -g @diogo-raphael-cravo/typescript-bootstrap
```

## Usage

### Initialize a New Project

```bash
mkdir my-project
cd my-project
typescript-bootstrap
npm install
```

### Update an Existing Project

When a new version of `typescript-bootstrap` is released, you can update your existing project to get the latest configuration files and tooling:

```bash
cd my-project

# Check for updates
npm outdated @diogo-raphael-cravo/typescript-bootstrap

# Update to latest version
npm install @diogo-raphael-cravo/typescript-bootstrap@latest

# Apply template updates
typescript-bootstrap update

# Install any new dependencies
npm install
```

The update command will:
- ✅ Update configuration files (tsconfig, vite.config, vitest.config, eslint.config, etc.) to match the template (your local changes to these files will be overwritten)
- ✅ Merge package.json scripts and dependencies by applying the latest template values and adding any extra custom scripts/dependencies you've defined (note: changes to template-provided entries will be overwritten)
- ✅ Update .gitignore with latest patterns
- ✅ Preserve your source code in `src/` directory
- ✅ Preserve additional custom dependencies, scripts, and settings that are not part of the template while resetting template-provided configuration to the latest version

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run preview` - Preview production build locally
- `npm test` - Run all tests once
- `npm run test:ui` - Run tests with interactive UI
- `npm run test:coverage` - Generate coverage report (requires 80% minimum)
- `npm run lint` - Check code for linting issues
- `npm run lint:fix` - Auto-fix linting issues

## Project Structure

```
my-project/
├── src/
│   ├── main.tsx          # Application entry point
│   ├── test.setup.ts     # Test environment setup
│   └── vite-env.d.ts     # Vite type declarations
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript config for app
├── tsconfig.node.json    # TypeScript config for build tools
├── vite.config.ts        # Vite configuration
├── vitest.config.ts      # Vitest test configuration
└── eslint.config.js      # ESLint rules
```

## Code Quality Standards

### Pre-commit Hooks

Every commit is automatically validated with:

1. **ESLint** - Code style and quality checks
2. **Tests with Coverage** - All tests must pass with ≥80% coverage
3. **Code Duplication** - Maximum 1% duplication allowed
4. **Secrets Detection** - No API keys, tokens, or passwords allowed
5. **TypeScript** - No type errors allowed
6. **Build** - Production build must succeed

If any check fails, the commit is blocked with clear error messages.

### No Magic Numbers

```typescript
// ❌ Bad
const width = container.width * 0.5;

// ✅ Good
const HALF_WIDTH_MULTIPLIER = 0.5;
const width = container.width * HALF_WIDTH_MULTIPLIER;
```

Common indices (0, 1, 2, -1) are allowed in array operations.

### Test Coverage

All code must maintain minimum 80% coverage across:
- Lines of code
- Functions
- Branches
- Statements

Files excluded from coverage:
- Entry points (`main.tsx`)
- Type declarations (`*.d.ts`)
- Configuration files (`*.config.*`)
- Test setup files

### TypeScript Strictness

The configuration enables all strict TypeScript checks:
- No implicit any
- Strict null checks
- No unused locals or parameters
- No fallthrough cases in switch statements

## Publishing to GitHub Packages

This package publishes from `main` using the version already present in `package.json`. When you push to the `main` branch, GitHub Actions reads `package.json`, builds, tags, and publishes.

### Automatic Publishing Workflow

1. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "feat: add new template file"
   ```

2. **Update the version in `package.json`** (commit the change):
   ```bash
   npm version minor  # or patch, or major
   git push --follow-tags
   ```

3. **Push to main branch**:
   ```bash
   git push origin main
   ```

4. **GitHub Actions automatically**:
   - Reads the version from `package.json`
   - Builds the package
   - Creates a git tag (e.g., `1.1.0`)
   - Publishes to GitHub Packages
   - Pushes the tag back to the repository

**Note:** The workflow fails if a tag matching the `package.json` version already exists or if a prerelease version is on `main`.

### Manual Publishing (Alternative)

If you prefer manual control:

```bash
# 1. Commit your changes
git add .
git commit -m "feat: add new feature"

# 2. Manually bump version without creating a v-prefixed tag
npm version minor --no-git-tag-version  # or patch, or major

# 3. Build and publish
npm run build
npm publish

# 4. Create and push a release tag that matches package.json
VERSION=$(node -p "require('./package.json').version")
git tag "$VERSION" -m "Release $VERSION"
git push && git push --tags
```

### Setup for Installation

To install this package in other projects, create a `.npmrc` file:

```
@diogo-raphael-cravo:registry=https://npm.pkg.github.com
```

Authenticate with GitHub:

```bash
npm login --registry=https://npm.pkg.github.com
```

### Using in Other Projects

Add to your `.npmrc`:

```
@diogo-raphael-cravo:registry=https://npm.pkg.github.com
```

Then install:

```bash
npm install @diogo-raphael-cravo/typescript-bootstrap
```

## Customization

After initialization, you can customize:

1. **ESLint Rules** - Modify `eslint.config.js` to adjust or add rules
2. **Test Coverage** - Adjust thresholds in `vitest.config.ts`
3. **TypeScript Config** - Fine-tune `tsconfig.json` for your needs
4. **Dependencies** - Add project-specific dependencies to `package.json`

## Integration with Easy-Logic

This package was extracted from the `easy-logic` project to provide reusable scaffolding. After setup, `easy-logic` uses this package for all its build tooling and quality standards, keeping only its UI and business logic.

## Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0

## Author

Created by diogo with 100% copilot code

## Repository

https://github.com/diogo/typescript-bootstrap
