import { getDateISO } from "../../support/utils";

describe("Anon user booking attempt", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("body").then(($body) => {
      if ($body.find("[data-cy=nav-signout-btn]").length) {
        cy.get("[data-cy=nav-signout-btn]").click();
      }
    });
    cy.visit("/storage");
    cy.get("[data-cy=timeframe-start-btn]", { timeout: 10000 }).should("exist");
  });

  it("should prevent anonymous user from booking an item", () => {
    // Select the first item card
    cy.get("[data-cy=items-card]").first().as("itemCard");

    // Select booking dates using the popover calendar
    const startDate = getDateISO(1);
    const endDate = getDateISO(2);

    // Open start date picker and select a date
    cy.get("[data-cy=timeframe-start-btn]")
      .scrollIntoView()
      .click({ force: true });
    cy.get(".day").contains(new Date(startDate).getDate().toString()).click();

    // Open end date picker and select a date
    cy.get("[data-cy=timeframe-end-btn]")
      .scrollIntoView()
      .click({ force: true });
    cy.get(".day").contains(new Date(endDate).getDate().toString()).click();

    // Set quantity to 1
    cy.get("@itemCard")
      .find("[data-cy=item-quantity-section] input")
      .clear()
      .type("1");

    // Try to add to cart
    cy.get("@itemCard")
      .find("[data-cy=item-add-to-cart-btn]")
      .should("not.be.disabled")
      .click();

    // Should redirect to login or show login required toast/message
    cy.url().should("include", "/login");
    cy.contains(/please log in|kirjaudu/i).should("exist");
  });
});
