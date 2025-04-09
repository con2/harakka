/// <reference types="cypress" />

// Authentication commands
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type(email);
    cy.get('[data-cy=password-input]').type(password);
    cy.get('[data-cy=login-button]').click();

    // Verify successful login by checking for authenticated element
    cy.url().should('not.include', '/login');
  });
});

// Storage item commands
Cypress.Commands.add('viewStorageItems', () => {
  cy.visit('/storage');
  cy.wait('@getItems'); // Assumes you've set up this route interception
});

Cypress.Commands.add('mockStorageItems', () => {
  cy.intercept('GET', '**/storage-items', { fixture: 'storage-items.json' }).as(
    'getItems',
  );
});

// Declare the types for your custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      viewStorageItems(): Chainable<void>;
      mockStorageItems(): Chainable<void>;
    }
  }
}
