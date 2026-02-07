# TypeScript Bootstrap

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
npm install -g @diogo/typescript-bootstrap
```

## Usage

### Initialize a New Project

```bash
mkdir my-project
cd my-project
typescript-bootstrap
npm install
```

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
4. **TypeScript** - No type errors allowed
5. **Build** - Production build must succeed

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

This package is designed to be published to GitHub Packages.

### Setup

1. Create a `.npmrc` file in your project root:

```
@diogo:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

2. Authenticate with GitHub:

```bash
npm login --registry=https://npm.pkg.github.com
```

3. Publish:

```bash
npm run build
npm publish
```

### Using in Other Projects

Add to your `.npmrc`:

```
@diogo:registry=https://npm.pkg.github.com
```

Then install:

```bash
npm install @diogo/typescript-bootstrap
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
