# Pre-Publish Checklist

Use this checklist before publishing typescript-bootstrap to GitHub Packages.

## 📋 Package Configuration

- [x] Package name is `@diogo/typescript-bootstrap` in package.json
- [x] Version is set to `1.0.0`
- [x] `publishConfig.registry` points to `https://npm.pkg.github.com`
- [x] `files` array includes `dist`, `templates`, and `bin`
- [x] `bin` field points to `./bin/cli.js`
- [x] License is set to `MIT`

## 🔨 Build & Files

- [x] `npm run build` completes without errors
- [x] `dist/` directory exists with compiled files
- [x] `dist/index.js` exists
- [x] `dist/index.d.ts` exists (TypeScript declarations)
- [x] `bin/cli.js` exists and has shebang (`#!/usr/bin/env node`)
- [x] `templates/` directory contains all config files

## 📚 Documentation

- [x] README.md is comprehensive and clear
- [x] MIGRATION.md explains easy-logic integration
- [x] PUBLISHING.md has publishing instructions
- [x] LOCAL_DEV.md explains development workflow
- [x] QUICKSTART.md provides quick start guide
- [x] LICENSE file exists

## 🧪 Testing

- [ ] Test CLI locally with `npm link`
- [ ] Create a test project and verify it works
- [ ] Test `npm run dev` in generated project
- [ ] Test `npm run build` in generated project
- [ ] Test `npm run lint` in generated project
- [ ] Test `npm test` in generated project
- [ ] Verify all templates are copied correctly

## 🔐 Authentication

- [ ] GitHub Personal Access Token created with `write:packages` scope
- [ ] Authenticated to npm.pkg.github.com: `npm login --registry=https://npm.pkg.github.com`
- [ ] `.npmrc` file exists in package root
- [ ] Can verify auth: `npm whoami --registry=https://npm.pkg.github.com`

## 📦 Pre-Publish Steps

```bash
# 1. Verify git status
git status
# Should be clean or have new changes to commit

# 2. Run build
npm run build

# 3. Verify package contents
npm pack --dry-run
# Check that it includes: dist/, templates/, bin/, README.md, LICENSE

# 4. Check for any npm audit issues (optional)
npm audit

# 5. Verify version
npm version  # Should show 1.0.0
```

## 🚀 Publish Steps

```bash
# 1. Final build
npm run build

# 2. Test the package locally first
npm link
cd ../test-directory
npx typescript-bootstrap
# Verify it creates all files correctly
cd ../typescript-bootstrap
npm unlink

# 3. Publish
npm publish

# 4. Verify it's published
npm view @diogo/typescript-bootstrap
```

## ✅ Post-Publish Verification

- [ ] Package appears at: https://github.com/diogo?tab=packages
- [ ] Can install in a new project: `npm install @diogo/typescript-bootstrap`
- [ ] CLI command works: `npx typescript-bootstrap`
- [ ] All templates are included in published version

## 🔄 If Publishing Fails

### Common Issues:

1. **401 Unauthorized**
   - Re-authenticate: `npm login --registry=https://npm.pkg.github.com`
   - Verify token has correct permissions

2. **404 Not Found**
   - Check package name starts with `@diogo/`
   - Verify registry URL in `.npmrc` and `package.json`

3. **403 Forbidden**
   - Package name might conflict with existing package
   - Verify you have permissions to publish to @diogo scope

4. **EBADENGINE**
   - Node version too old
   - Upgrade to Node >= 18.0.0

5. **Files not included**
   - Check `files` array in package.json
   - Run `npm pack --dry-run` to see what will be included

## 🎯 Ready to Publish?

When all checkboxes are checked:

```bash
npm run build
npm publish
```

If successful, you'll see:
```
+ @diogo/typescript-bootstrap@1.0.0
```

## 📝 After First Publish

1. Update easy-logic to use the published version
2. Test the migration
3. Create a GitHub release for v1.0.0
4. Document any issues found

## 🔖 Version Updates

For future updates:

```bash
# Bug fixes
npm version patch  # 1.0.0 -> 1.0.1

# New features (backward compatible)
npm version minor  # 1.0.1 -> 1.1.0

# Breaking changes
npm version major  # 1.1.0 -> 2.0.0

# Then publish
npm run build
npm publish
```

---

**Current Status**: Package is built and ready. Complete the testing checklist, then publish!
