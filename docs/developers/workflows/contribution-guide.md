# Contribution Guide

This guide explains how to contribute to the Storage and Booking Application project. Following these guidelines helps maintain code quality and consistency across the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Merge Process](#merge-process)
- [Code Review](#code-review)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Versioning](#versioning)

## Getting Started

1. **Fork the repository** - Create a fork of the main repository on GitHub.
2. **Clone the repository** - `git clone https://github.com/your-username/FullStack_Storage_and_Booking_App.git`
3. **Setup the development environment** - See [Development Environment Setup](#development-environment-setup)

## Coding Standards

### General Guidelines

- Use TypeScript for type safety
- Follow the DRY (Don't Repeat Yourself) principle
- Write self-documenting code with clear variable and function names
- Add comments for complex logic, but prefer readable code over excessive comments

### Frontend Guidelines

- Follow the component structure established in the project
- Use functional components with React hooks
- Use Shadcn/UI for styling following the project's design system
- Implement responsive design for all UI components

### Backend Guidelines

- Follow NestJS architectural patterns
- Implement proper error handling and validation
- Use DTOs (Data Transfer Objects) for data validation
- Keep controllers thin, move business logic to services

## Git Workflow

### Branching Strategy

We use a simplified version of Git Flow with the following branch structure:

- `main`: Stable production-ready code
- `develop`: Integration branch where features are merged
- `feature/<ISSUE-KEY>-[feature-name]`: Branches for new features or tasks
- `bugfix/<ISSUE-KEY>-[bug-name]`: Branches for fixing bugs
- `hotfix/<ISSUE-KEY>-[hotfix-name]`: Quick fixes for urgent issues in production
- `deployment`: Branch for deployment

> Note: `ISSUE-KEY` comes from Jira (e.g., SCRUM-123)

#### Working with Feature Branches

```sh
# Create a feature branch from develop
git checkout develop
git checkout -b feature/SCRUM-123-add-new-feature

# After completing the feature, merge back to develop
git checkout develop
git merge feature/SCRUM-123-add-new-feature
```

#### Working with Bugfix Branches

```sh
# Create a bugfix branch from develop
git checkout develop
git checkout -b bugfix/SCRUM-321-fix-login-error

# After fixing the bug, merge back to develop
git checkout develop
git merge bugfix/SCRUM-321-fix-login-error
```

#### Working with Hotfix Branches

```sh
# Create a hotfix branch from main
git checkout main
git checkout -b hotfix/SCRUM-777-critical-login-bug

# After fixing the critical issue, merge to both main and develop
git checkout main
git merge hotfix/SCRUM-777-critical-login-bug
git checkout develop
git merge hotfix/SCRUM-777-critical-login-bug
```

### Commit Messages

Follow the Conventional Commits standard:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to build process, tools, etc.

#### Commit Message Guidelines

- Use imperative, present tense (e.g., "add" not "added" or "adds")
- Don't capitalize the first letter
- No period at the end
- Keep the description under 50 characters
- Be specific and descriptive
- Use the body to explain "why" instead of "how"
- Wrap the body at 72 characters
- Use a blank line to separate from description

#### Examples

```
feat(auth): implement JWT authentication

fix(api): correct timeout handling in user requests

docs(readme): update installation instructions

refactor(storage): simplify booking validation logic
```

#### Special Annotations

- Use `BREAKING CHANGE:` in the footer for breaking changes
- Reference issues with `Fixes SCRUM-777` or `Resolves SCRUM-999`

#### Atomic Commits

- Each commit should represent a single logical change
- Don't mix unrelated changes in one commit

## Pull Request Process

1. **Update your fork** - Make sure your fork is up to date with the main repository.
2. **Create a branch** - Create a branch following the [branching strategy](#branching-strategy).
3. **Make changes** - Implement your changes following the [coding standards](#coding-standards).
4. **Write tests** - Add tests for your changes if applicable.
5. **Update documentation** - Update any relevant documentation.
6. **Submit a pull request** - Create a pull request against the develop branch.
   - Include a descriptive title
   - Provide detailed description of changes
   - Reference related issues using the Jira issue key (e.g., SCRUM-123)
   - Complete the PR template

## Merge Process

- We have two sub-teams: Frontend and Backend. Each sub-team will review code accordingly.
- The timeframe for code review should be 24 hours.
- After code is reviewed and approved, the author merges it into the develop branch.
- Pull requests from develop to main are created once the develop branch reaches a stable state with all features for the sprint.
- The team decides to merge pull requests to main during the sprint review meeting.

## Code Review

Each pull request must be reviewed before being merged. The review process involves:

1. Automated checks (CI/CD pipeline, linting, tests)
2. Peer review by at least one team member
3. Addressing feedback and making necessary changes

### Review Checklist

- Does the code follow the project's coding standards?
- Are there appropriate tests for the changes?
- Is the documentation updated?
- Does the code work as expected?
- Is the code efficient and maintainable?

## Testing Guidelines

### Frontend Testing

- Write unit tests for utility functions
- Create component tests for UI components
- Add integration tests for complex features
- Use Cypress for end-to-end testing

### Backend Testing

- Write unit tests for services and utilities
- Create integration tests for controllers
- Test error handling and edge cases
- Maintain high test coverage

### Running Tests

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm run test
```

## Documentation

- Document all public APIs
- Add JSDoc comments for complex functions
- Keep the README up to date
- Update the tech-stack.md document when adding new dependencies
- Write documentation for new features in the docs directory

### API Documentation

Backend API endpoints should be documented using Swagger:

```typescript
@ApiTags('users')
@ApiOperation({ summary: 'Get all users' })
@ApiResponse({ status: 200, description: 'Return all users.' })
@Get()
async getAllUsers() {
  // ...
}
```

## Versioning

We use semantic versioning for version tags (major.minor.patch):

- **Major**: Incompatible API changes
- **Minor**: Add functionality in a backward-compatible manner
- **Patch**: Backward-compatible bug fixes

Example: v1.0.0 for the first stable release.

## Questions and Support

If you have any questions or need help with your contribution, please:

1. Check the existing documentation
2. Look for similar issues in the issue tracker
3. Contact the project maintainers
4. Ask for help in the project's communication channels

Thank you for contributing to the Storage and Booking Application project!
