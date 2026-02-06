# Local Development Guide

## Testing typescript-bootstrap Locally (Before Publishing)

When developing changes to typescript-bootstrap, you want to test them in easy-logic before publishing. Here's how:

### Option 1: Using npm link (Recommended)

1. **In typescript-bootstrap directory:**
   ```bash
   cd typescript-bootstrap
   npm run build
   npm link
   ```

2. **In easy-logic directory:**
   ```bash
   cd ../easy-logic
   npm link @diogo/typescript-bootstrap
   ```

3. **Test your changes**
   ```bash
   npm run dev
   npm test
   npm run lint
   ```

4. **After testing, unlink:**
   ```bash
   npm unlink @diogo/typescript-bootstrap
   npm install
   ```

### Option 2: Using local file path

1. **In easy-logic's package.json:**
   ```json
   {
     "devDependencies": {
       "@diogo/typescript-bootstrap": "file:../typescript-bootstrap"
     }
   }
   ```

2. **Install:**
   ```bash
   npm install
   ```

3. **Important**: Every time you change typescript-bootstrap code:
   ```bash
   cd typescript-bootstrap
   npm run build
   cd ../easy-logic
   npm install
   ```

### Option 3: Direct path references (Quick testing)

Instead of installing the package, directly reference files:

**In easy-logic package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite --config ../typescript-bootstrap/templates/vite.config.ts",
    "lint": "eslint src --config ../typescript-bootstrap/templates/eslint.config.js"
  }
}
```

## Development Workflow

### Making Changes to typescript-bootstrap

1. Make changes to files in `typescript-bootstrap/src/` or `typescript-bootstrap/templates/`
2. Build: `npm run build`
3. If linked to easy-logic, the changes are immediately available
4. Test in easy-logic
5. Commit changes
6. Update version: `npm version patch`
7. Publish: `npm publish`

### Typical Development Cycle

```bash
# 1. Setup (once)
cd typescript-bootstrap
npm install
npm link
cd ../easy-logic
npm link @diogo/typescript-bootstrap

# 2. Make changes
cd ../typescript-bootstrap
# Edit files...
npm run build

# 3. Test in easy-logic
cd ../easy-logic
npm run dev
npm test

# 4. Iterate until satisfied

# 5. Publish
cd ../typescript-bootstrap
npm version patch
npm run build
npm publish

# 6. Update easy-logic to use published version
cd ../easy-logic
npm unlink @diogo/typescript-bootstrap
npm install @diogo/typescript-bootstrap@latest
```

## Testing the CLI

To test the CLI tool locally:

```bash
cd typescript-bootstrap
npm run build
npm link

# Now you can use it anywhere:
mkdir test-project
cd test-project
typescript-bootstrap
```

## Debugging Tips

### Watch mode for development

In typescript-bootstrap, you can use TypeScript's watch mode:

```bash
cd typescript-bootstrap
npx tsc --watch
```

This will rebuild automatically when you save files.

### Check what files will be published

```bash
cd typescript-bootstrap
npm pack --dry-run
```

This shows what files would be included in the published package.

### Verify the built output

```bash
cd typescript-bootstrap
ls dist/
cat dist/index.js
```

## Common Issues

### Changes not reflecting

- Make sure you ran `npm run build` after making changes
- If using npm link, try unlinking and re-linking
- Clear node_modules and reinstall if needed

### TypeScript errors

- Ensure both projects have their dependencies installed
- Run `npx tsc --noEmit` to check for type errors

### Template files not copying

- Verify files are included in the `files` array in package.json
- Check that templates folder exists after build
- Use `npm pack` to inspect the packaged files

## Project Structure During Development

```
project/
├── typescript-bootstrap/
│   ├── src/              # Source code
│   ├── templates/        # Template files
│   ├── dist/            # Built output
│   └── package.json
└── easy-logic/
    ├── src/             # App code
    ├── node_modules/    
    │   └── @diogo/
    │       └── typescript-bootstrap/  # Linked or installed
    └── package.json
```
