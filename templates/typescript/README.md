# {{PROJECT_TITLE}}

> A high-quality vanilla TypeScript project for Node.js applications

## Overview

This is a **vanilla TypeScript project** for building Node.js applications, CLIs, libraries, or backend services. No web frameworks, no DOM - just pure TypeScript for server-side or command-line applications.

## Getting Started

```bash
npm install
npm run dev
```

The dev server uses `tsx` with watch mode for instant feedback during development.

## Available Scripts

- `npm run dev` - Run with tsx watch mode (auto-reloads on file changes)
- `npm run build` - Build for production (TypeScript compilation + Vite bundling)
- `npm run preview` - Run the built application
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Check code quality
- `npm run hash:update` - Refresh scaffold hash manifest after intentional managed-file changes

## Project Structure

```
src/
  ├── utils/          # Utility functions
  └── main.ts         # Application entry point
```

## Building Node.js Applications

This template is perfect for:
- CLI tools and scripts
- Node.js backend services
- TypeScript libraries
- Automation scripts
- Server-side utilities

Example:
```typescript
function main(): void {
  console.log('Hello from Node.js!');
  // Your Node.js logic here
}

main();
```

## Code Quality

This project enforces high-quality standards:
- 80% minimum test coverage
- No magic numbers
- Strict TypeScript
- ESLint for code consistency
- Pre-commit hooks to prevent bad commits
