/// <reference types="cypress" />

// Authentication commands
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");
  cy.get('input[type="email"]').should("be.visible").clear().type(email);
  cy.get('input[type="password"]').should("be.visible").clear().type(password);
  cy.get('button[type="submit"]').should("be.visible").click();
  cy.url({ timeout: 1000 }).should("not.include", "/login");
});

// Logout command
Cypress.Commands.add("logout", () => {
  cy.visit("/");
  cy.get("body").then(() => {
    cy.get("body").then(() => {
      cy.get("[data-cy=nav-signout-btn]", { timeout: 1000 })
        .should("be.visible")
        .then(($btn) => {
          if ($btn.length) {
            cy.wrap($btn).click();
            cy.get('[data-cy="toast-confirm-btn"]', { timeout: 1000 })
              .should("exist")
              .click();
            cy.get('[data-cy="nav-login-btn"]', { timeout: 1000 }).should(
              "exist",
            );
          } else {
            cy.log("No signout button found, user may already be logged out.");
          }
        });
    });
  });
});

// Login as a regular user
Cypress.Commands.add("loginAsRegularUser", () => {
  const email = Cypress.env("CYPRESS_REGULAR_USER_EMAIL");
  const password = Cypress.env("CYPRESS_REGULAR_USER_PASSWORD");
  cy.login(email, password);
});

// Login as a superVera user
Cypress.Commands.add("loginAsSuperVeraUser", () => {
  const email = Cypress.env("CYPRESS_SUPERVERA_USER_EMAIL");
  const password = Cypress.env("CYPRESS_SUPERVERA_USER_PASSWORD");
  cy.login(email, password);
  cy.reload(); //TODO: remove later, now navbar needs this reload to update
});

// Declare the types for your custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      logout(): Chainable<void>;
      login(email: string, password: string): Chainable<void>;
      loginAsRegularUser(): Chainable<void>;
      loginAsSuperVeraUser(): Chainable<void>;
    }
  }
}
