describe("Basic App Flows (Real Data)", () => {
  it("Unregistered user can view items and add to cart", () => {
    cy.visit("/storage");
    cy.get('[data-cy="items-card"]').should("exist");
    cy.get('[data-cy="items-card"]').first().click();
    cy.get('[data-cy="quantity-input"]').clear().type("1");
    cy.get('[data-cy="add-to-cart-button"]').click();
    cy.get('[data-cy="cart-icon"]').click();
    cy.get('[data-cy="cart-item"]').should("exist");
  });

  it("Unregistered user can check item availability", () => {
    cy.visit("/storage");
    cy.get('[data-cy="items-card"]').first().click();
    cy.get('[data-cy="availability-info"]').should("be.visible");
  });

  it("Unregistered user cannot access admin panel", () => {
    cy.visit("/");
    cy.contains("Admin").should("not.exist");
  });

  it("Unregistered user cannot access profile page", () => {
    cy.visit("/profile");
    cy.url().should("include", "/login");
  });

  it("Unregistered user can see login and register options", () => {
    cy.visit("/");
    cy.contains(/login|register/i).should("be.visible");
  });
});
