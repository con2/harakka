/// <reference types="cypress" />

// Authentication commands
Cypress.Commands.add("login", (email, password) => {
  cy.session([email, password], () => {
    cy.visit("/login");

    // Use only type selectors for Supabase Auth UI fields
    cy.get('input[type="email"]').should("be.visible").clear().type(email);
    cy.get('input[type="password"]')
      .should("be.visible")
      .clear()
      .type(password);

    cy.get('button[type="submit"]').should("be.visible").click();

    cy.url({ timeout: 10000 }).should("not.include", "/login");
  });
  cy.visit("/storage");
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

// Login as a regular user
Cypress.Commands.add("loginAsRegularUser", () => {
  const email = Cypress.env("CYPRESS_REGULAR_USER_EMAIL");
  const password = Cypress.env("CYPRESS_REGULAR_USER_PASSWORD");
  cy.login(email, password);
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
      loginAsRegularUser(): Chainable<void>;
    }
  }
}
