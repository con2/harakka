# Cypress Tests

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

Add the following configuration to `cypress.config.ts`:

```ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5180', // frontend port from vite.config.ts
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  video: false, // no video recording to save disk space
});
```

4. Add scripts to package.json:

```json
"scripts": {
  "cy:open": "cypress open",
  "cy:run": "cypress run",
  "test:e2e": "start-server-and-test dev http://localhost:5180 cy:run"
}
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

## Writing Tests

1. Create a couple of tests in the `cypress/e2e` directory.

For example,

- `homepage.cy.ts`:

```ts
describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the page title', () => {
    cy.contains('h1', 'Storage').should('be.visible');
  });

  it('should navigate to storage items page', () => {
    cy.get('a[href*="storage"]').click();
    cy.url().should('include', '/storage');
  });
});
```

- `storage.cy.ts`:

```ts
describe('Storage Items Page', () => {
  beforeEach(() => {
    // Mock the API response for items
    cy.intercept('GET', 'http://localhost:3000/storage-items', {
      fixture: 'storage-items.json',
    }).as('getItems');

    cy.visit('/storage');
  });

  it('should display storage items', () => {
    cy.wait('@getItems');
    cy.get('[data-cy="items-card"]').should('be.visible');
  });

  it('should show loading state before items load', () => {
    // Before waiting for the response
    cy.get('.animate-spin').should('be.visible');
    cy.wait('@getItems');
    cy.get('.animate-spin').should('not.exist');
  });
});
```

2. Create a mock data file in the `cypress/fixtures` directory:

- `storage-items.json`:

```json
[
  {
    "id": "0292cb9e-542c-4878-a03d-94ed697ee311",
    "location_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "compartment_id": "0ffa5562-82a9-4352-b804-1adebbb7d80c",
    "items_number_total": 8,
    "items_number_available": 8,
    "price": 1,
    "average_rating": 0,
    "is_active": true,
    "created_at": "2025-04-08T12:05:40.385845+00:00",
    "translations": {
      "en": {
        "item_name": "Combat vest",
        "item_type": "Combat vests",
        "item_description": "Combat vest x 5, black (old model) + combat vest x 3, black (light), with EL tapes. Stored in storage box on storage shelves, near entrance."
      },
      "fi": {
        "item_name": "Taisteluliivi",
        "item_type": "Taisteluliivejä",
        "item_description": "Taisteluliivi x 5, musta (vanha malli) + taisteluliivi x 3, musta (kevyt), EL-nauhoilla. Varastolaatikossa varastohyllyillä, sisäänkäynnin puolella."
      }
    }
  },
  {
    "id": "5eb0e1b8-cb83-4d33-9c0c-23018579900b",
    "location_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "compartment_id": "0ffa5562-82a9-4352-b804-1adebbb7d80c",
    "items_number_total": 17,
    "items_number_available": 17,
    "price": 333,
    "average_rating": 0,
    "is_active": true,
    "created_at": "2025-04-08T12:08:34.904265+00:00",
    "translations": {
      "en": {
        "item_name": "Protective glasses/masks",
        "item_type": "Protective gear",
        "item_description": "Protective glasses/masks x 17, EL tape (2x3m, 3x2m), MOLLE-mounted phone holder. In black storage box at the back of front storage."
      },
      "fi": {
        "item_name": "Suojalasit/-maskit",
        "item_type": "Suojavarusteita",
        "item_description": "Suojalasit/-maski x 17, EL-nauhaa (2x3m, 3x2m), Molle-kiinnitteinen kännykkäpidike. Etuvaraston perällä, musta laatikko."
      }
    }
  }
]
```

3. Create support files in the `cypress/support` directory:

- `e2e.ts`:

```ts
import './commands'; // Custom commands
```

- `commands.ts`:

```ts
// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
});

// Declare the types for your custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}
```

4. Add data attributes to components to make them easier to target in tests:

- In `src/components/Items/ItemsCard.tsx`, add `data-cy` attributes to the card elements:

```tsx
<Card data-cy="items-card" />
```

## Running Tests

- Run tests in the Cypress UI:

```sh
npm run cy:run
```

- Run tests in headless mode:

```sh
npm run cy:run
```

- Run tests with the frontend server started automatically:

```sh
npm run test:e2e
```
