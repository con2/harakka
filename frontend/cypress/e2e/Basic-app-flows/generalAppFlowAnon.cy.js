describe("Basic App Flows (Real Data) for anon user", () => {
  it("Unregistered user can view items with proper details", () => {
    cy.visit("/storage");
    cy.get('[data-cy="items-card"]')
      .should("exist")
      .and("have.length.greaterThan", 0);

    cy.get('[data-cy="items-card"]').each(($card) => {
      cy.wrap($card).find('[data-cy="item-image-section"]').should("exist");
      cy.wrap($card)
        .find('[data-cy="item-name"]')
        .should("exist")
        .and("not.be.empty");
      cy.wrap($card).find('[data-cy="item-details"]').should("exist");
      cy.wrap($card).find('[data-cy="item-quantity-section"]').should("exist");
      cy.wrap($card).find('[data-cy="item-add-to-cart-btn"]').should("exist");
      cy.wrap($card).find('[data-cy="item-view-details-btn"]').should("exist");
    });
  });

  it("Anon user can view item details with all relevant info", () => {
    cy.visit("/storage/items/e609e371-1d7a-4b8d-a2a8-b4a9f391e994"); //example item - Viper helmet

    cy.get('[data-cy="item-details-root"]').should("exist");
    cy.get('[data-cy="item-details-back-btn"]').should("exist");
    cy.get('[data-cy="item-details-images"]').should("exist");
    cy.get('[data-cy="item-details-main-image"]').should("exist");
    cy.get('[data-cy="item-details-info"]').should("exist");
    cy.get('[data-cy="item-details-name"]').should("exist").and("not.be.empty");
    cy.get('[data-cy="item-details-description"]').should("exist");
    cy.get('[data-cy="item-details-location"]').should("exist");

    // If rating exists
    cy.get('[data-cy="item-details-rating"]').should("exist");

    // If no dates selected, check for info
    cy.get('[data-cy="item-details-no-dates"]').should("exist");
    cy.get('[data-cy="item-details-here-link"]').should("exist");
  });

  it("Anon user can navigate to User Guide and see relevant info", () => {
    cy.visit("/");
    cy.get('[data-cy="nav-guide"]').click();
    cy.url().should("include", "/how-it-works");
    cy.get('[data-cy="guide-heading"]').should("exist");
    cy.get('[data-cy="guide-section"]').should("exist");
    cy.get('[data-cy="guide-accordion"]').should("exist");
    cy.get('[data-cy="guide-getstarted-trigger"]').should("exist");
    cy.get('[data-cy="guide-howtobook-trigger"]').should("exist");
    cy.get('[data-cy="faq-section"]').should("exist");
    cy.get('[data-cy="faq-heading"]').should("exist");
    cy.get('[data-cy="faq-accordion"]').should("exist");
  });

  it("Anon user can navigate to Contact Us and see contact info", () => {
    cy.visit("/");
    cy.get('[data-cy="nav-contact"]').click();
    cy.url().should("include", "/contact-us");
    cy.get("form").should("exist");
    cy.get('[data-cy="contact-info"]').should("exist");
  });

  it("Anon user can see cart link", () => {
    cy.visit("/");
    cy.get('[data-cy="nav-cart"]').should("exist");
  });

  it("Anon user can see login link", () => {
    cy.visit("/");
    cy.get('[data-cy="nav-login-btn"]').should("exist");
  });

  it("Anon user does NOT see profile, signout or Admin buttons", () => {
    cy.visit("/");
    cy.get('[data-cy="nav-profile-btn"]').should("not.exist");
    cy.get('[data-cy="nav-signout-btn"]').should("not.exist");
    cy.get('[data-cy="nav-admin"]').should("not.exist");
  });
});
