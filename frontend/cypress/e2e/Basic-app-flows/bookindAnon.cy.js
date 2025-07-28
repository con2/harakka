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
    cy.get("[data-cy=timeframe-start-btn]").should("exist");
  });

  it("should allow anonymous user to add item to cart, but block checkout", () => {
    cy.get("[data-cy=items-card]").first().as("itemCard");

    const startDateISO = getDateISO(1); //TODO: refactor later. It can't set a date outside current month (picks from Calendar)
    const endDateISO = getDateISO(2);

    // Convert ISO string to Date object for day number
    const startDay = new Date(startDateISO).getDate();
    const endDay = new Date(endDateISO).getDate();

    // Open start date picker and select a valid date
    cy.get("[data-cy=timeframe-start-btn]").click();
    cy.get('button[role="gridcell"]:not([disabled])')
      .contains(startDay.toString())
      .click();

    // Wait for the end date popover to open
    cy.wait(300);

    // Open end date picker and select a valid date
    cy.get("[data-cy=timeframe-end-btn]").click();
    cy.get('button[role="gridcell"]:not([disabled])')
      .contains(endDay.toString())
      .click();

    // Set quantity
    cy.get("@itemCard")
      .find("[data-cy=item-quantity-section] input")
      .clear()
      .type("1");

    // Add to cart
    cy.get("@itemCard")
      .find("[data-cy=item-add-to-cart-btn]")
      .should("not.be.disabled")
      .click();

    // Go to cart and try to checkout
    cy.get("[data-cy=nav-cart]").click();
    cy.get("[data-cy=cart-checkout-btn]").should("exist").click();

    // Check if now user sees Login page
    cy.url().should("include", "/login");
    cy.get("[data-cy=login-root]").should("exist");
    cy.get("[data-cy=login-card]").should("exist");
  });
});
