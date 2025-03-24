# DEVELOPMENT STAGE of Full-Stack Storage & Booking App:

## Folder Structure:

```
full-stack-booking-app/
├── frontend/        # React.js application code
├── backend/         # Node.js server code
├── docs/            # Documentation (project overview, API docs)
├── ci-cd/           # CI/CD configuration files
├── .gitignore       # Git ignore patterns
├── README.md        # Project overview
└── package.json     # Project dependencies
```

-   frontend: Contains all the React.js application code.
-   backend: Contains the Node.js server code.
-   docs: Contains documentation (e.g., project overview, API docs).
-   ci-cd: Contains configuration files for continuous integration and deployment

## Branching Strategy

### As we use Scrum, we will use simplifies version of Git Flow. Our structure is:

-   main: Stable production-ready code.

-   develop: The integration branch where features are merged.

-   feature/[feature-name]: Branches for new features or tasks.

-   bugfix/[bug-name]: Branches for fixing bugs.

-   hotfix/[hotfix-name]: Quick fixes for urgent issues in production.

1. Main Branches:
   main: This branch should always represent the latest stable version of the application. It's the version that will be deployed to production.

develop: This branch is used for integration. It contains the latest development changes and features that are ready to be tested but not yet deployed to production. After completing each sprint or milestone, you merge changes from feature branches into develop.

2. Feature Branches:
   feature/<name>: These branches are used for individual features or tasks you work on during the development process. For example, if you’re working on implementing the background music functionality, you could create a feature/background-music branch from develop.

Example:

```sh
git checkout develop
git checkout -b feature/background-music
```

Once the feature is complete, you can merge it back into the develop branch:

```sh
git checkout develop
git merge feature/background-music
```

3. Bugfix Branches:
   bugfix/<name>: These branches are used for fixing bugs. They are created from the develop branch (or main if the bug is in production).

Example:

```sh
git checkout develop
git checkout -b bugfix/fix-login-error
```

After fixing the bug, merge it back into develop:

```sh
git checkout develop
git merge bugfix/fix-login-error
```

4. Hotfix Branches:
   hotfix/<name>: These branches are used to fix critical issues in the production environment. If there's a bug that needs to be fixed on main immediately, you create a hotfix branch from main, fix the issue, and then merge it back into both main and develop.

Example:

```sh
git checkout main
git checkout -b hotfix/critical-login-bug
```

After fixing the issue, you merge it into both main and develop:

```sh
git checkout main
git merge hotfix/critical-login-bug
git checkout develop
git merge hotfix/critical-login-bug
```

## Development Workflow

### Commit Message Guidelines:

1. Format: All commit messages should follow the Conventional Commits format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

2. Types:

-   feat: A new feature
-   fix: A bug fix
-   docs: Documentation changes
-   style: Code style changes (formatting, missing semicolons, etc.)
-   refactor: Code changes that neither fix bugs nor add features
-   perf: Performance improvements
-   test: Adding or correcting tests
-   chore: Changes to build process, tools, etc.

3. Description:

-   Use imperative, present tense (e.g., "add" not "added" or "adds")
-   Don't capitalize the first letter
-   No period at the end
-   Keep it under 50 characters
-   Be specific and descriptive

3. Body:

-   Use when additional context is needed
-   Explain "why" instead of "how"
-   Wrap at 72 characters
-   Use blank line to separate from description

Examples:

```
feat(auth): implement JWT authentication

fix(api): correct timeout handling in user requests

docs(readme): update installation instructions

refactor(storage): simplify booking validation logic

test(booking): add tests for conflict detection
```

6. Special Annotations:

-   BREAKING CHANGE: in the footer for breaking changes
-   Issues references: Fixes #123, Resolves #456

7. Atomic Commits:

-   Each commit should represent a single logical change
-   Don't mix unrelated changes in one commit

### Pull Request (PR) Process:

1. Developers should create a branch from develop for new features (e.g., feature/authentication).
2. When a feature is ready, create a PR from the feature branch to develop.

### Merge Process:

1. After the code is reviewed, merge it into the develop branch. TODO: set rules of reviewing. Think about automate testing and deployment.

2. Once the develop branch reaches a stable state with all features for the sprint, merge it into main. TODO: set rules of main merging.

### Versioning:

Use semantic versioning for version tags (major.minor.patch). For example, v1.0.0 for the first stable release.
