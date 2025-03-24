# DEVELOPMENT STAGE of Full-Stack Storage & Booking App:

## Folder Structure:

/full-stack-booking-app/
|
├── /frontend # React.js application code
|
├── /backend # Node.js server code
|
├── /docs # Documentation (project overview, API docs)
|
├── /ci-cd # CI/CD configuration files
|
├── .gitignore # Git ignore patterns
|
├── README.md # Project overview
|
└── package.json # Project dependencies

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

## Development Workflow

### Pull Request (PR) Process:

1. Developers should create a branch from develop for new features (e.g., feature/authentication).
2. When a feature is ready, create a PR from the feature branch to develop.

### Merge Process:

1. After the code is reviewed, merge it into the develop branch. TODO: set rules of reviewing. Think about automate testing and deployment.

2. Once the develop branch reaches a stable state with all features for the sprint, merge it into main. TODO: set rules of main merging.

### Versioning:

Use semantic versioning for version tags (major.minor.patch). For example, v1.0.0 for the first stable release.
