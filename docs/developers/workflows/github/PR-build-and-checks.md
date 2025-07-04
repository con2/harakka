# GitHub Actions Workflows

This repository includes automated CI/CD workflows to ensure code quality and build integrity for pull requests.

## Available Workflows

### 1. Build Validation (`build-validation.yml`)

**Purpose**: Simple build verification for pull requests

- **Triggers**: Pull requests to `develop` or `deployment` branches
- **What it does**:
  - Builds both frontend and backend
  - Verifies TypeScript compilation (implicit in the build scripts)
  - Confirms build artifacts exist
  - Provides build status summary

### 2. Comprehensive PR Checks (`lint-and-type-check.yml`)

**Purpose**: Complete code quality and security checks

- **Triggers**: Pull requests to `develop` or `deployment` branches
- **What it does**:
  - Code formatting verification
  - Linting checks
  - TypeScript type checking without emitting files
  - Unit tests (non‑blocking)
  - Security dependency audits

## Workflow Details

> **Note**:

- The *Frontend* and *Backend* build steps described below run **only** in the **Build Validation** workflow.
- All checks `continue-on-error`

### Frontend Checks

- **Dependencies**: Installs via `npm ci` for reproducible builds
- **TypeScript**: Validates compilation without emitting files
- **Build**: Creates production build in `dist/` folder
- **Verification**: Confirms build artifacts exist

### Backend Checks

- **Dependencies**: Installs via `npm ci` for reproducible builds
- **Build**: Creates production build using NestJS compiler
- **Verification**: Confirms build artifacts exist
- **Testing**: Runs unit tests (continues on failure)

### Security Audits

- **Dependency Scanning**: Checks for known vulnerabilities
- **Audit Level**: Set to moderate (configurable)
- **Continues on Error**: Won't block PRs but provides warnings

## Configuration

### Node.js Version

- **Current**: Node.js 18 (LTS)
- **Why**: Stable, well-supported, matches modern development standards

### Caching

- **npm dependencies**: Cached to speed up workflow runs
- **Cache key**: Based on package-lock.json files

### Build Verification

The Build Validation workflow confirms that production bundles are created in `frontend/dist/` and `backend/dist/`, but it deliberately does **not** upload those artifacts. This keeps the workflow lightweight while still guaranteeing that a deployable bundle can be produced.

## Status Indicators

### ✅ Success Indicators

- All builds complete successfully
- TypeScript compilation passes
- No critical dependency vulnerabilities

### ❌ Failure Indicators

- Build compilation errors
- TypeScript type errors
- Missing build artifacts

### ⚠️ Warning Indicators

- Linting issues (non-blocking)
- Test failures (non-blocking)
- Moderate dependency vulnerabilities (non-blocking)

## Troubleshooting Common Issues

### Build Failures

1. **TypeScript Errors**: Check `npx tsc --noEmit` locally
2. **Missing Dependencies**: Ensure `package-lock.json` is committed
3. **Memory Issues**: Large builds may need workflow adjustments

### Security Audit Failures

1. **High Vulnerabilities**: Run `npm audit` locally and fix
2. **False Positives**: Review and potentially adjust audit level

### Workflow Not Running

1. **Branch Names**: Ensure PRs target `develop` or `deployment`
2. **File Changes**: Workflows only run for relevant file changes
3. **Permissions**: Check repository Actions permissions

## Customization

### Adding New Checks

To add additional checks, modify the workflow files:

```yaml
- name: Your Custom Check
  working-directory: ./frontend # or ./backend
  run: npm run your-custom-script
```

### Changing Trigger Branches

Update the `branches` array in workflow files:

```yaml
on:
  pull_request:
    branches: [develop, deployment, main] # Add/remove branches
```

### Adjusting Security Levels

Change audit levels in security checks:

```yaml
npm audit --audit-level=high # or low, moderate, high, critical
```

## Local Development

To run the same checks locally before pushing:

### Frontend

```bash
cd frontend
npm ci
npm run format:check
npm run lint
npx tsc --noEmit
npm run build
```

### Backend

```bash
cd backend
npm ci
npm run lint
npm run test
npm run build
```

## Monitoring

- **GitHub Actions Tab**: View workflow runs and logs
- **PR Status Checks**: See results directly on pull requests
- **Build Summaries**: Detailed results in workflow run summaries

## Support

If you encounter issues with the workflows:

1. Check the workflow logs in GitHub Actions
2. Verify local builds work correctly
3. Ensure all dependencies are properly installed
4. Check for any custom environment requirements
