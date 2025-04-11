# Cypress Tests for Storage and Booking App

## Setup Cypress

1. Install Cypress in the frontend directory

```sh
cd frontend
npm install cypress --save-dev
```

2. Open Cypress

```sh
npx cypress open
```

This will open the Cypress Test Runner, where you can run tests interactively.

3. Configure Cypress for the Project

```sh
touch cypress.config.ts
```

The project uses Cypress for end-to-end testing with the following configuration:

```ts
// cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5180',
    video: true, // Enable video recording
    videoCompression: 0, // No compression for highest quality in demos
    videosFolder: 'cypress/videos', // Where videos are saved
    viewportWidth: 1280, // Wider viewport for demos
    viewportHeight: 800, // Taller viewport for demos
    setupNodeEvents(on, config) {
      return config;
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
```

We take videos for demo purposes, but you can disable it by setting `video: false` in the configuration.

4. Add scripts to package.json:

```json
"scripts": {
  "cy:open": "cypress open",
  "cy:run": "cypress run",
  "test:e2e": "start-server-and-test dev http://localhost:5180 cy:run"
}
```

Commands to run tests:

```sh
# Open Cypress Test Runner (interactive UI)
npx cypress open

# Run all tests headless with video recording
npx cypress run

# Run specific test files
npx cypress run --spec "cypress/e2e/autorization.cy.ts"

# Run with specific browser
npx cypress run --browser chrome
```

## Folders structure

```
frontend/
├── cypress/
│   ├── e2e/            <- e2e test files here
│   ├── fixtures/       <- Mock data here
│   └── support/        <- Custom commands here
└── cypress.config.ts   <- configuration file for Cypress
```

## Custom Commands

we created some custom commands to make the tests easier to write and maintain:

```ts
// Login using regular form
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type(email);
    cy.get('[data-cy=password-input]').type(password);
    cy.get('[data-cy=login-button]').click();
    cy.url().should('not.include', '/login');
  });
});

// Login using Supabase
Cypress.Commands.add('loginWithSupabase', (email, password) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/login');
      cy.get('input[name="email"]').should('be.visible').type(email);
      cy.get('input[type="password"]').should('be.visible').type(password);
      cy.get('button[type="submit"]').should('be.visible').click();
      cy.wait(500);
      cy.visit('/');
    },
    {
      cacheAcrossSpecs: false,
    },
  );
});

// Setup user roles with mock API responses
Cypress.Commands.add('setupUserRole', (role) => {
  if (role === 'admin') {
    cy.intercept('GET', '**/users/**', {
      fixture: 'admin-user.json',
      statusCode: 200,
    }).as('getCurrentUserAdmin');
  } else if (role === 'superVera') {
    cy.intercept('GET', '**/users/**', {
      fixture: 'supervera-user.json',
      statusCode: 200,
    }).as('getCurrentUserSuperVera');
  } else {
    cy.intercept('GET', '**/users/**', {
      fixture: 'regular-user.json',
      statusCode: 200,
    }).as('getCurrentUserRegular');
  }

  // Common intercept for all users
  cy.intercept('GET', '**/users', {
    fixture: 'users-list.json',
    statusCode: 200,
  }).as('getUsers');
});

// Mock storage items API
Cypress.Commands.add('mockStorageItems', () => {
  cy.intercept('GET', '**/storage-items', { fixture: 'storage-items.json' }).as(
    'getItems',
  );
});

// Add pauses for demo recordings
Cypress.Commands.add('demoPause', (ms = 500) => {
  cy.wait(ms);
});
```

## Writing Tests

1. Create a couple of tests in the `cypress/e2e` directory.

Testing Authorization

```ts
describe('User Authorization', () => {
  // Test users configuration
  const users = {
    admin: {
      email: 'ermegilius4@gmail.com',
      password: '12345678',
      role: 'admin',
    },
    superVera: {
      email: 'ermegilius5@gmail.com',
      password: '12345678',
      role: 'superVera',
    },
    regular: {
      email: 'ermegilius3@gmail.com',
      password: '12345678',
      role: 'user',
    },
  };

  // Regular user login test
  it('should allow regular user to log in successfully', () => {
    cy.setupUserRole('user');
    cy.visit('/login');
    cy.get('input[name="email"]')
      .should('be.visible')
      .type(users.regular.email);
    cy.get('input[type="password"]')
      .should('be.visible')
      .type(users.regular.password);
    cy.get('button[type="submit"]').should('be.visible').click();
    cy.wait('@getCurrentUserRegular');
    cy.contains(users.regular.email).should('be.visible');
    cy.contains(/Dashboard|Home|Profile/i).should('be.visible');
  });

  // Admin navigation test
  it('should show admin navigation options', () => {
    cy.setupUserRole('admin');
    cy.loginWithSupabase(users.admin.email, users.admin.password);
    cy.visit('/');
    cy.contains('Admin Panel').should('be.visible').click();
    cy.url().should('include', '/admin');

    cy.get('aside nav').within(() => {
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Users').should('be.visible');
      cy.contains('Items').should('be.visible');
      cy.contains('Settings').should('be.visible');
      cy.contains('Team').should('not.exist'); // Admin should not see Team option
    });
  });
});
```

2. Testing Storage Items

```ts
describe('Storage Items Page', () => {
  beforeEach(() => {
    cy.mockStorageItems();
    cy.visit('/storage');
  });

  it('should display storage items correctly', () => {
    cy.wait('@getItems');
    cy.get('[data-cy="items-card"]').should('have.length.at.least', 2);
    cy.get('[data-cy="items-card"]')
      .first()
      .within(() => {
        cy.contains('Combat vest').should('be.visible');
        cy.contains('1').should('be.visible'); // Price check
      });
  });

  it('should show loading state before items load', () => {
    // Reset the intercept to delay the response
    cy.intercept('GET', 'http://localhost:3000/storage-items', (req) => {
      req.reply({
        delay: 1000,
        fixture: 'storage-items.json',
      });
    }).as('delayedItems');

    cy.visit('/storage');
    cy.get('.animate-spin').should('be.visible');
    cy.wait('@delayedItems');
    cy.get('.animate-spin').should('not.exist');
  });
});
```

## Creating Demo Videos

To create high-quality demo videos with pauses at key points:

Use the demo-specific test files that include demoPause() calls
Run tests with Chrome for better video quality:

```sh
npx cypress run --spec "cypress/e2e/demo.autorization.cy.ts" --browser chrome
```

## Best Practices

- Use data-cy attributes to target elements for testing. <!-- TODO: add later -->
- Mock API responses using fixtures to make tests reliable and fast
- Use custom commands for common operations
- Add appropriate assertions to validate both UI elements and application state
- For demo recordings, add strategic pauses with cy.demoPause() to highlight important aspects
