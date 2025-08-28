# Development Cycle

This document outlines the development cycle used in the FullStack Storage and Booking App project, from feature planning through deployment.

## Table of Contents

- [Sprint Planning](#sprint-planning)
- [Feature Development](#feature-development)
- [Code Reviews](#code-reviews)
- [Testing](#testing)
- [Integration](#integration)
- [Deployment](#deployment)
- [Hotfixes](#hotfixes)

## Sprint Planning

Our development follows a Scrum-based approach with two-week sprints:

1. **Backlog Refinement:** Product backlog items are prioritized and clarified
2. **Sprint Planning:** The team selects work for the upcoming sprint
3. **Task Creation:** Work items are broken down into technical tasks in Jira
4. **Estimation:** Story points are assigned using consensus estimation

Each task should be assigned a Jira issue key (e.g., `SCRUM-123`) that will be used in branch names and commit messages.

## Feature Development

### 1. Create Feature Branch

```bash
# Start from latest develop branch
git checkout develop
git pull origin develop

# Create feature branch with Jira issue key
git checkout -b feature/SCRUM-123-add-new-feature
```

### 2. Implement Feature

When implementing a feature:

- Follow the [project coding standards](../coding-standards.md)
- Break work into logical, atomic commits
- Use the Conventional Commits format for commit messages:

```text
feat(component): add item availability check

This adds real-time availability checking for storage items based on the
selected date range to prevent double bookings.

Refs SCRUM-123
```

- Write tests for your code (unit tests, integration tests)
- Update documentation as needed

### 3. Keep Feature Branch Updated

```bash
# Update from develop periodically
git checkout develop
git pull origin develop
git checkout feature/SCRUM-123-add-new-feature
git merge develop

# Resolve any conflicts
```

### 4. Push Feature Branch

```bash
git push origin feature/SCRUM-123-add-new-feature
```

## Code Reviews

1. **Create Pull Request:** Create a PR from your feature branch to the `develop` branch
2. **PR Template:** Fill out the PR template with:

   - Summary of changes
   - Link to Jira ticket
   - Testing instructions
   - Screenshots (for UI changes)

3. **Review Process:**

   - At least one team member must review the PR
   - Frontend changes are reviewed by frontend team members
   - Backend changes are reviewed by backend team members
   - Team members have 24 hours to review PRs
   - Address all review feedback with additional commits

4. **Approval:** Once approved, the PR author merges the code

## Testing

Each feature should include appropriate tests:

### Frontend Testing

- Unit tests for utility functions
- Component tests for UI components
- Integration tests for complex features
- End-to-end tests with Cypress for critical user flows

### Backend Testing

- Unit tests for services and controllers
- Integration tests for API endpoints
- Database query tests
- Authentication/authorization tests

Run tests locally before creating your PR:

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm test
```

## Integration

1. **Feature Integration:** When a feature branch is merged into `deployment`, the CI pipeline automatically:

   - Builds the application
     <!-- - Runs all tests -->
     <!-- - Performs code quality checks -->
   - Deploys to the development environment

2. **Integration Testing:** The team performs integration testing on the development environment
   - Verify feature works as expected
   - Verify no regressions in existing functionality
   - Test on different browsers/devices (for frontend changes)

## Deployment

Our deployment process follows two primary paths:

### Incremental Deployments

For significant feature completions between sprints:

1. **Feature Readiness Assessment:**

   - Review completed features in `develop` branch
   - Perform integration testing on the develop branch
   - Team decides if changes warrant a deployment

2. **Deploy to Staging:**

   - Create a PR from `develop` to `deployment` branch
   - Run automated tests
   - Review changes and approve PR
   - Merge to `deployment` branch

3. **Deployment Process:**

   - The CI/CD pipeline detects changes in `deployment` branch
   - Builds and deploys to staging environment
   - Uses deployment YAML files from the deployment branch
   - Team verifies deployment in staging

4. **Production Deployment:**
   - After successful staging verification
   - Deploy to production from `deployment` branch
   - Monitor for any post-deployment issues

### Sprint Release Deployments

At the end of each sprint:

1. **Release Preparation:**

   - Create a PR from `develop` to `deployment`
   - Verify all tests pass
   - Update version numbers
   - Finalize release notes

2. **Deployment Approval:**

   - The team reviews the PR during the sprint review
   - Once approved, merge to `deployment`
   - CI/CD pipeline:
     - Creates a release tag
     - Builds production artifacts
     - Deploys to production using the deployment YAML files

For detailed information on the deployment process and environments, see the [Deployment Guide](deployment.md).

## Hotfixes

For urgent production issues:

1. **Create Hotfix Branch:**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/SCRUM-777-critical-login-bug
   ```

2. **Implement Fix:**

   - Make minimal changes to fix the issue
   - Write tests to verify the fix
   - Use appropriate commit message format:

     ```text
     fix(auth): resolve login session timeout issue

     Fixes SCRUM-777
     ```

3. **PR and Review:**

   - Create PR to `main` with expedited review
   - Once approved, merge to `main`
   - CI/CD pipeline deploys the fix to production

4. **Sync Changes:**
   - Create PR from `hotfix` to `develop` to ensure fix is included in future releases
   - Merge to `develop` after production deployment is verified

## Continuous Improvement

After each sprint:

- Conduct sprint retrospective
- Identify process improvements
- Update documentation as needed
- Refine workflow practices

The development cycle is iterative and should evolve based on team feedback and project needs.
