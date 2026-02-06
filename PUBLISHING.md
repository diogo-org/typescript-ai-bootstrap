# Publishing Guide

## Prerequisites

1. You need a GitHub account and a Personal Access Token (PAT) with `write:packages` permission
2. You need to be authenticated to GitHub Packages

## Setup Authentication

### For Publishing (One-time setup)

1. Create a Personal Access Token:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `write:packages` and `read:packages` scopes
   - Copy the token

2. Authenticate npm with GitHub:
   ```bash
   npm login --registry=https://npm.pkg.github.com
   Username: YOUR_GITHUB_USERNAME
   Password: YOUR_PERSONAL_ACCESS_TOKEN
   Email: YOUR_EMAIL
   ```

### For CI/CD

The included GitHub Actions workflow (`.github/workflows/publish.yml`) automatically publishes when you create a GitHub release. The `GITHUB_TOKEN` is provided automatically.

## Publishing Steps

### 1. Update Version

```bash
npm version patch  # or minor, or major
```

### 2. Build the Package

```bash
npm run build
```

### 3. Publish to GitHub Packages

```bash
npm publish
```

### 4. (Optional) Create GitHub Release

Tag the version and create a release on GitHub. The CI/CD workflow will automatically publish.

```bash
git tag v1.0.0
git push origin v1.0.0
```

Then create a release on GitHub from this tag.

## Using the Package in Other Projects

### 1. Create `.npmrc` in project root:

```
@diogo:registry=https://npm.pkg.github.com
```

### 2. Install:

```bash
npm install @diogo/typescript-bootstrap
```

### 3. Initialize your project:

```bash
npx typescript-bootstrap
npm install
```

## Troubleshooting

### Authentication Issues

If you get 401 or 403 errors:
1. Verify your PAT has the correct scopes
2. Check your `.npmrc` file is correctly configured
3. Try logging out and back in: `npm logout --registry=https://npm.pkg.github.com`

### Package Not Found

Make sure:
1. The package name in `package.json` matches the GitHub organization/user: `@diogo/typescript-bootstrap`
2. The package has been successfully published at least once
3. You have access to read packages from the repository

### Build Errors

Make sure TypeScript compiles without errors:
```bash
npm run build
```

Check for any TypeScript errors in `src/` files.
