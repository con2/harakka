/// <reference types="cypress" />

// Authentication commands
Cypress.Commands.add("login", (email, password) => {
  cy.session([email, password], () => {
    cy.visit("/login");
    cy.get("[data-cy=email-input]").type(email);
    cy.get("[data-cy=password-input]").type(password);
    cy.get("[data-cy=login-button]").click();

    // Verify successful login by checking for authenticated element
    cy.url().should("not.include", "/login");
  });
});

// Add the setupUserRole command
Cypress.Commands.add("setupUserRole", (role) => {
  if (role === "admin") {
    cy.intercept("GET", "**/users/**", {
      fixture: "admin-user.json",
      statusCode: 200,
    }).as("getCurrentUserAdmin");
  } else if (role === "superVera") {
    cy.intercept("GET", "**/users/**", {
      fixture: "supervera-user.json",
      statusCode: 200,
    }).as("getCurrentUserSuperVera");
  } else {
    cy.intercept("GET", "**/users/**", {
      fixture: "regular-user.json",
      statusCode: 200,
    }).as("getCurrentUserRegular");
  }

  // Common intercept for all users
  cy.intercept("GET", "**/users", {
    fixture: "users-list.json",
    statusCode: 200,
  }).as("getUsers");
});

// Add the loginWithSupabase command
Cypress.Commands.add("loginWithSupabase", (email, password) => {
  cy.session(
    [email, password],
    () => {
      cy.visit("/login");
      cy.get('input[name="email"]').should("be.visible").type(email);
      cy.get('input[type="password"]').should("be.visible").type(password);
      cy.get('button[type="submit"]').should("be.visible").click();

      // Give the auth request time to complete and handle possible redirects
      cy.wait(500);

      // Force navigation to home and ensure authentication is complete
      cy.visit("/");
      cy.url().should("eq", `${Cypress.config().baseUrl}/`);

      // Wait for user data to finish loading
      cy.wait(500);
    },
    {
      cacheAcrossSpecs: false,
    },
  );
});

// Storage item commands
Cypress.Commands.add("viewStorageItems", () => {
  cy.visit("/storage");
  cy.wait("@getItems");
});

Cypress.Commands.add("mockStorageItems", () => {
  cy.intercept("GET", "**/storage-items", { fixture: "storage-items.json" }).as(
    "getItems",
  );
});

// Demo pause - used for customer presentations
Cypress.Commands.add("demoPause", (ms = 500) => {
  // Always pause when running demo - no environment check needed for demos
  cy.wait(ms);
});

// Declare the types for your custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      viewStorageItems(): Chainable<void>;
      mockStorageItems(): Chainable<void>;
      setupUserRole(role: string): Chainable<void>;
      loginWithSupabase(email: string, password: string): Chainable<void>;
      demoPause(ms?: number): Chainable<void>;
    }
  }
}
