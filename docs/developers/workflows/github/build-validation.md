# Build Validation Workflow

## Table of Contents

- [Overview](#overview)
- [Trigger Conditions](#trigger-conditions)
- [Workflow Configuration](#workflow-configuration)
- [Jobs and Steps](#jobs-and-steps)
  - [1. Checkout Repository](#1-checkout-repository)
  - [2. Setup Node.js](#2-setup-nodejs)
  - [3. Install Common Dependencies](#3-install-common-dependencies)
  - [4. Frontend Build Process](#4-frontend-build-process)
  - [5. Backend Build Process](#5-backend-build-process)
  - [6. Verify Build Outputs](#6-verify-build-outputs)
- [Success Criteria](#success-criteria)
- [Local Testing](#local-testing)
- [Troubleshooting](#troubleshooting)

## Overview

The Build Validation workflow ensures that pull requests don't introduce build failures. It validates that both the frontend and backend applications can be successfully built before merging changes into the main branches.

**Workflow File:** `.github/workflows/build-validation.yml`

**Purpose:**

- Verify frontend builds successfully
- Verify backend builds successfully
- Confirm build artifacts are generated
- Catch build-breaking changes early in the development cycle

## Trigger Conditions

The workflow runs automatically on:

```yaml
on:
  pull_request:
    branches: [develop, main]
```

**Triggered by:**

- Pull requests targeting the `develop` branch
- Pull requests targeting the `main` branch

**Permissions:**

```yaml
permissions:
  contents: read
```

## Workflow Configuration

**Runner:** `ubuntu-latest`

**Node.js Version:** 20 (LTS)

**Cache Strategy:** npm cache based on package-lock.json files

## Jobs and Steps

### 1. Checkout Repository

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

Checks out the repository code to the runner workspace.

### 2. Setup Node.js

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "20"
    cache: "npm"
```

**Configuration:**

- Installs Node.js version 20
- Enables npm caching to speed up subsequent runs
- Cache key is automatically generated based on package-lock.json files

### 3. Install Common Dependencies

```yaml
- name: Install common dependencies
  run: npm ci --prefix common
```

Installs dependencies for the shared `common` package used by both frontend and backend.

**Note:** Uses `npm ci` (clean install) for reproducible builds based on package-lock.json.

### 4. Frontend Build Process

The frontend build includes several steps to handle dependency installation issues:

#### Step 4a: Clean Frontend Environment

```yaml
- name: Clean frontend lockfile and node_modules (optional fix for CI)
  run: rm -rf frontend/node_modules frontend/package-lock.json
```

**Purpose:** Removes potentially cached or corrupted dependencies that could cause CI build issues.

#### Step 4b: Reinstall Dependencies

```yaml
- name: Reinstall frontend dependencies cleanly
  run: npm install --legacy-peer-deps --prefix frontend
```

**Key Flag:** `--legacy-peer-deps`

- Bypasses peer dependency conflicts
- Allows installation when peer dependencies don't exactly match
- Necessary due to some frontend package compatibility issues

#### Step 4c: Build Frontend

```yaml
- name: Build frontend
  run: npm run build --prefix frontend
```

Executes the frontend build script, which:

- Compiles TypeScript code
- Bundles assets using Vite
- Generates production-ready files in `frontend/dist/`

### 5. Backend Build Process

#### Step 5a: Install Backend Dependencies

```yaml
- name: Install backend dependencies
  run: npm ci --prefix backend
```

Uses `npm ci` for a clean, reproducible installation.

#### Step 5b: Build Backend

```yaml
- name: Build backend
  run: npm run build --prefix backend
```

Executes the backend build script using NestJS compiler:

- Compiles TypeScript to JavaScript
- Generates production files in `backend/dist/`

### 6. Verify Build Outputs

```yaml
- name: Verify builds completed
  run: |
    echo "Checking build outputs..."
    if [ ! -d "frontend/dist" ]; then
      echo "❌ Frontend build failed"
      exit 1
    fi
    if [ ! -d "backend/dist" ]; then
      echo "❌ Backend build failed" 
      exit 1
    fi
    echo "✅ Both builds completed successfully!"
```

**Verification Steps:**

1. Checks if `frontend/dist/` directory exists
2. Checks if `backend/dist/` directory exists
3. Fails the workflow if either directory is missing
4. Outputs success message if both directories exist

## Success Criteria

The workflow succeeds when:

✅ Repository checkout completes  
✅ Node.js setup completes  
✅ Common dependencies install successfully  
✅ Frontend dependencies install successfully  
✅ Frontend builds without errors  
✅ Backend dependencies install successfully  
✅ Backend builds without errors  
✅ Both `frontend/dist/` and `backend/dist/` directories exist  

## Local Testing

To replicate the build validation locally:

### Test Frontend Build

```bash
# Navigate to frontend directory
cd frontend

# Clean existing build artifacts (optional)
rm -rf node_modules package-lock.json dist

# Install dependencies
npm install --legacy-peer-deps

# Build the application
npm run build

# Verify dist folder exists
ls -la dist
```

### Test Backend Build

```bash
# Navigate to backend directory
cd backend

# Clean existing build artifacts (optional)
rm -rf node_modules dist

# Install dependencies
npm ci

# Build the application
npm run build

# Verify dist folder exists
ls -la dist
```

### Test Complete Flow

```bash
# From project root
npm ci --prefix common
npm install --legacy-peer-deps --prefix frontend
npm run build --prefix frontend
npm ci --prefix backend
npm run build --prefix backend

# Verify both builds
ls -la frontend/dist backend/dist
```

## Troubleshooting

### Frontend Build Fails

**Issue:** TypeScript compilation errors

**Solution:**

```bash
cd frontend
npx tsc --noEmit
# Fix any reported type errors
```

**Issue:** Dependency conflicts

**Solution:**

```bash
# Try clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Issue:** Vite build errors

**Solution:**

- Check for syntax errors in source files
- Ensure all imports are correct
- Verify environment variables are properly configured

### Backend Build Fails

**Issue:** NestJS compilation errors

**Solution:**

```bash
cd backend
npx tsc --noEmit
# Fix any reported type errors
```

**Issue:** Missing dependencies

**Solution:**

```bash
# Ensure package-lock.json is committed
npm ci
```

**Issue:** Module resolution errors

**Solution:**

- Check tsconfig.json path mappings
- Verify all imports use correct paths
- Ensure common package is properly linked

### Common Issues

**Issue:** Workflow fails but local build succeeds

**Possible causes:**

- Environment variable differences
- Node version mismatch (ensure you're using Node 20)
- Cache issues (clear Actions cache in GitHub)

**Issue:** Build artifacts not found

**Solution:**

- Ensure build scripts in package.json specify correct output directories
- Check that `.gitignore` isn't accidentally excluding dist folders in CI
- Verify build script actually runs (check for script errors)

**Issue:** Out of memory during build

**Solution:**

- This is rare with current configuration
- If it occurs, builds may need to be adjusted or runner specs increased

### Getting Help

If you encounter issues:

1. Check the workflow logs in GitHub Actions tab
2. Run the build locally following the steps above
3. Compare local environment with CI environment
4. Ensure all dependencies are properly committed in package-lock.json files
5. Check for any recent changes to build configurations
