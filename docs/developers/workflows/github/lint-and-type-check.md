# Lint and Type Check Workflow

## Table of Contents

- [Overview](#overview)
- [Trigger Conditions](#trigger-conditions)
- [Workflow Configuration](#workflow-configuration)
- [Jobs Overview](#jobs-overview)
- [Frontend Checks Job](#frontend-checks-job)
  - [Frontend Setup Steps](#frontend-setup-steps)
  - [Rollup Dependencies Workaround](#rollup-dependencies-workaround)
  - [Frontend Code Quality Checks](#frontend-code-quality-checks)
- [Backend Checks Job](#backend-checks-job)
  - [Backend Setup Steps](#backend-setup-steps)
  - [Backend Code Quality Checks](#backend-code-quality-checks)
- [Security Audit Job](#security-audit-job)
  - [Security Audit Setup Steps](#security-audit-setup-steps)
  - [Frontend Security Audit](#frontend-security-audit)
  - [Backend Security Audit](#backend-security-audit)
- [Continue-on-Error Behavior](#continue-on-error-behavior)
- [Local Testing](#local-testing)
  - [Frontend Checks](#frontend-checks)
  - [Backend Checks](#backend-checks)
  - [Security Audits](#security-audits)
  - [Complete Local Validation](#complete-local-validation)
- [Troubleshooting](#troubleshooting)
  - [Frontend Issues](#frontend-issues)
  - [Backend Issues](#backend-issues)
  - [Security Audit Issues](#security-audit-issues)
  - [Common Issues](#common-issues)
  - [Getting Help](#getting-help)

## Overview

The Lint and Type Check workflow performs comprehensive code quality and security checks on pull requests. It runs three parallel jobs to validate code formatting, linting, type safety, and dependency security for both frontend and backend.

**Workflow File:** `.github/workflows/lint-and-type-check.yml`

**Purpose:**

- Enforce code formatting standards
- Catch linting errors and code quality issues
- Validate TypeScript type safety
- Run unit tests (optional)
- Audit dependencies for security vulnerabilities
- Maintain consistent code quality across the codebase

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

**Environment Variables:**

```yaml
env:
  NODE_VERSION: "20"
```

## Workflow Configuration

**Runner:** `ubuntu-latest` (all jobs)

**Node.js Version:** 20 (defined as environment variable)

**Parallelization:** Three jobs run in parallel:

1. `frontend-checks`
2. `backend-checks`
3. `security-audit`

**Cache Strategy:** npm cache based on package-lock.json files for each component

## Jobs Overview

| Job Name | Purpose | Blocking |
|----------|---------|----------|
| `frontend-checks` | Validates frontend code quality and types | Partially* |
| `backend-checks` | Validates backend code quality and types | Yes |
| `security-audit` | Scans for dependency vulnerabilities | No |

*Most frontend checks use `continue-on-error: true`

## Frontend Checks Job

### Frontend Setup Steps

#### 1. Checkout Code

```yaml
- name: Checkout code
  uses: actions/checkout@v4
```

#### 2. Setup Node.js with Caching

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: "npm"
    cache-dependency-path: "frontend/package-lock.json"
```

**Cache Configuration:**

- Caches npm dependencies based on `frontend/package-lock.json`
- Speeds up subsequent workflow runs significantly

#### 3. Install Common Dependencies

```yaml
- name: Install common dependencies
  working-directory: ./common
  run: npm ci
```

Installs the shared `common` package dependencies.

### Rollup Dependencies Workaround

#### 4. Fix Rollup Optional Dependencies

```yaml
- name: Fix Rollup optional dependencies
  working-directory: ./frontend
  run: npm install --no-optional && npm install
```

**Why this step exists:**

- Rollup (used by Vite) has optional dependencies that can cause issues in CI
- First install skips optional dependencies
- Second install ensures all required dependencies are present
- This workaround prevents CI failures related to optional dependency conflicts

**Note:** The standard `npm ci` step is commented out in favor of this workaround.

### Frontend Code Quality Checks

#### 5. Format Code Check

```yaml
- name: Format Code
  working-directory: ./frontend
  run: npm run format
  continue-on-error: true
```

**What it does:**

- Runs Prettier or configured formatter
- Checks if code follows formatting standards
- **Non-blocking:** `continue-on-error: true` means the workflow continues even if formatting issues are found

#### 6. Run Linting

```yaml
- name: Run linting
  working-directory: ./frontend
  run: npm run lint
  continue-on-error: true
```

**What it does:**

- Runs ESLint with project configuration
- Checks for code quality issues, unused variables, potential bugs, etc.
- **Non-blocking:** Linting errors won't fail the workflow

#### 7. TypeScript Compilation Check

```yaml
- name: TypeScript compilation check
  working-directory: ./frontend
  run: npx tsc --noEmit
  continue-on-error: true
```

**What it does:**

- Runs TypeScript compiler without emitting files
- Validates type safety across the entire codebase
- Catches type errors that might not appear during development
- **Non-blocking:** Type errors are reported but don't block the PR

**Why `--noEmit`:**

- Only checks types, doesn't generate JavaScript files
- Faster than full compilation
- Focuses on type validation rather than build output

## Backend Checks Job

### Backend Setup Steps

#### 1. Backend Checkout Code

```yaml
- name: Checkout code
  uses: actions/checkout@v4
```

#### 2. Backend Setup Node.js with Caching

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: "npm"
    cache-dependency-path: "backend/package-lock.json"
```

**Cache Configuration:**

- Caches npm dependencies based on `backend/package-lock.json`

#### 3. Install Dependencies

```yaml
- name: Install common dependencies
  working-directory: ./common
  run: npm ci

- name: Install dependencies
  working-directory: ./backend
  run: npm ci
```

Standard clean install for both common and backend packages.

### Backend Code Quality Checks

#### 4. Format Code Check

```yaml
- name: Format Code
  working-directory: ./backend
  run: npm run format
  continue-on-error: true
```

**What it does:**

- Checks backend code formatting
- **Non-blocking:** Formatting issues are reported but don't fail the workflow

#### 5. Run Linting

```yaml
- name: Run linting
  working-directory: ./backend
  run: npm run lint
```

**What it does:**

- Runs ESLint for backend code
- **Blocking:** Unlike frontend, backend linting failures will fail the workflow
- Enforces stricter code quality standards for backend

#### 6. Run Tests

```yaml
- name: Run tests (optional)
  working-directory: ./backend
  run: npm run test
  continue-on-error: true
```

**What it does:**

- Executes backend unit tests
- Runs tests with coverage reporting
- **Non-blocking:** Test failures are reported but don't block the PR

**Why optional:**

- Tests may be in development or flaky
- Allows for iterative test improvements without blocking development

## Security Audit Job

### Security Audit Setup Steps

```yaml
- name: Checkout code
  uses: actions/checkout@v4

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}

- name: Install common dependencies
  working-directory: ./common
  run: npm ci
```

Standard setup without caching (audit is typically fast).

### Frontend Security Audit

```yaml
- name: Audit frontend dependencies
  working-directory: ./frontend
  run: |
    npm ci
    npm install --no-optional && npm install
    echo "Running frontend security audit..."
    npm audit --audit-level=high || echo "Frontend audit found vulnerabilities but continuing..."
  continue-on-error: true
```

**What it does:**

1. Installs frontend dependencies (with Rollup workaround)
2. Runs npm audit with high severity threshold
3. Reports any high or critical severity vulnerabilities
4. **Non-blocking:** Continues even if vulnerabilities are found

**Audit Level:** `--audit-level=high`

- Only reports high and critical severity issues
- Ignores low and moderate severity vulnerabilities
- Reduces noise from minor security issues

### Backend Security Audit

```yaml
- name: Audit backend dependencies
  working-directory: ./backend
  run: |
    npm ci
    echo "Running backend security audit..."
    npm audit --audit-level=high || echo "Backend audit found vulnerabilities but continuing..."
  continue-on-error: true
```

**What it does:**

1. Installs backend dependencies
2. Runs npm audit with high severity threshold
3. Reports any high or critical severity vulnerabilities
4. **Non-blocking:** Continues even if vulnerabilities are found

## Continue-on-Error Behavior

The workflow uses `continue-on-error: true` strategically:

### Non-Blocking Checks

- ✓ Frontend formatting
- ✓ Frontend linting
- ✓ Frontend TypeScript compilation
- ✓ Backend formatting
- ✓ Backend tests
- ✓ All security audits

### Blocking Checks

- ✗ Backend linting (must pass)
- ✗ Dependency installation (must succeed)

**Philosophy:**

- Allows teams to see issues without blocking development
- Provides visibility into code quality problems
- Encourages fixing issues but doesn't enforce it at PR time
- Backend linting is stricter due to production criticality

## Local Testing

### Frontend Checks

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install --no-optional && npm install

# Run formatting check
npm run format

# Run linting
npm run lint

# Run TypeScript check
npx tsc --noEmit
```

### Backend Checks

```bash
# Navigate to backend
cd backend

# Install dependencies
npm ci

# Run formatting check
npm run format

# Run linting
npm run lint

# Run tests
npm run test
```

### Security Audits

```bash
# Frontend audit
cd frontend
npm audit --audit-level=high

# Backend audit
cd backend
npm audit --audit-level=high

# To fix automatically fixable vulnerabilities
npm audit fix

# To see detailed vulnerability report
npm audit
```

### Complete Local Validation

```bash
# From project root

# Common setup
cd common && npm ci && cd ..

# Frontend
cd frontend
npm install --no-optional && npm install
npm run format
npm run lint
npx tsc --noEmit
npm audit --audit-level=high
cd ..

# Backend
cd backend
npm ci
npm run format
npm run lint
npm run test
npm audit --audit-level=high
cd ..
```

## Troubleshooting

### Frontend Issues

**Issue:** Rollup optional dependencies error

**Solution:**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --no-optional && npm install
```

**Issue:** TypeScript compilation errors

**Solution:**

```bash
npx tsc --noEmit
# Review and fix reported type errors
# Check tsconfig.json for configuration issues
```

**Issue:** Linting failures

**Solution:**

```bash
# Auto-fix where possible
npm run lint -- --fix

# Check .eslintrc configuration
# Review and fix remaining manual errors
```

### Backend Issues

**Issue:** Linting blocks PR merge

**Solution:**

```bash
cd backend
npm run lint -- --fix
# Fix any remaining issues manually
git add -A
git commit -m "fix: resolve linting issues"
```

**Issue:** Test failures

**Solution:**

```bash
# Run tests locally
npm run test

# Run specific test file
npm run test -- path/to/test.spec.ts

# Run with coverage
npm run test:cov
```

**Issue:** Module not found errors

**Solution:**

- Ensure common dependencies are installed
- Check import paths in tsconfig.json
- Verify all dependencies are in package.json

### Security Audit Issues

**Issue:** High severity vulnerabilities reported

**Solution:**

```bash
# Check what vulnerabilities exist
npm audit

# Try automatic fix
npm audit fix

# For vulnerabilities in transitive dependencies
npm audit fix --force  # Be cautious with this

# Check if updates are available
npm outdated
```

**Issue:** Vulnerabilities can't be fixed

**Options:**

1. Wait for maintainers to release a fix
2. Find alternative packages
3. Document the vulnerability and assess risk
4. Consider using `npm audit` overrides in package.json (npm 8.3.0+)

### Common Issues

**Issue:** Cache problems causing false failures

**Solution:**

- Clear GitHub Actions cache via repository settings
- Delete node_modules locally and reinstall

**Issue:** Workflow runs but shows no output

**Solution:**

- Check workflow logs in Actions tab
- Ensure scripts exist in package.json
- Verify working directories are correct

**Issue:** Different results locally vs. CI

**Solution:**

- Ensure same Node.js version (20)
- Check for environment-specific configurations
- Verify package-lock.json is committed and up-to-date
- Look for .env file differences

### Getting Help

If you encounter issues:

1. Check the workflow logs in GitHub Actions tab
2. Run the specific failing command locally
3. Compare Node.js versions (should be 20)
4. Verify all package-lock.json files are committed
5. Check for recent changes to linting or TypeScript configurations
6. Review the audit report for specific vulnerabilities and their sources
