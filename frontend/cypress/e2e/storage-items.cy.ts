describe("Storage Items Page", () => {
  beforeEach(() => {
    // Use the custom command defined in commands.ts
    cy.mockStorageItems();
    cy.visit("/storage");
  });

  it("should display storage items correctly", () => {
    cy.wait("@getItems");

    // Check multiple items are displayed
    cy.get('[data-cy="items-card"]').should("have.length.at.least", 2);

    // Check specific item content from the fixture
    cy.get('[data-cy="items-card"]')
      .first()
      .within(() => {
        // Testing content from the fixture
        cy.contains("Combat vest").should("be.visible");
        cy.contains("1").should("be.visible"); // Price check
      });
  });

  it("should show loading state before items load", () => {
    // Reset the intercept to delay the response
    cy.intercept("GET", "http://localhost:3000/storage-items", (req) => {
      req.reply({
        delay: 1000,
        fixture: "storage-items.json",
      });
    }).as("delayedItems");

    cy.visit("/storage");
    cy.get(".animate-spin").should("be.visible");
    cy.wait("@delayedItems");
    cy.get(".animate-spin").should("not.exist");
  });

  it("should navigate to item detail page when clicked", () => {
    cy.wait("@getItems");
    cy.get('[data-cy="items-card"]').first().click();

    // Check URL has changed to item detail page
    // Using regex since your code navigates to /items/${itemPrice}
    cy.url().should("match", /\/items\/\d+/);
  });

  it("should display error state when API fails", () => {
    // Mock a failed API response
    cy.intercept("GET", "http://localhost:3000/storage-items", {
      statusCode: 500,
      body: "Server error",
    }).as("failedRequest");

    cy.visit("/storage");
    cy.wait("@failedRequest");
    cy.contains("Failed to load items").should("be.visible");
  });

  it("should display the correct page title", () => {
    cy.wait("@getItems");
    cy.contains("h1", "Storage Inventory").should("be.visible");
  });
});
