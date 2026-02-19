# {{PROJECT_TITLE}}

> A high-quality TypeScript project built with best practices

## Getting Started

```bash
npm install
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Check code quality
- `npm run hash:update` - Refresh scaffold hash manifest after intentional managed-file changes

## Project Structure

```
src/
  ├── components/     # React components
  ├── hooks/          # Custom React hooks
  ├── utils/          # Utility functions
  └── main.tsx        # Application entry point
```

## Code Quality

This project enforces high-quality standards:
- 80% minimum test coverage
- No magic numbers
- Strict TypeScript
- ESLint for code consistency
