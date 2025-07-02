describe("Homepage", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display the page title", () => {
    cy.contains("h1", "Storage").should("be.visible");
  });

  it("should navigate to storage items page", () => {
    cy.get('a[href*="storage"]').click();
    cy.url().should("include", "/storage");
  });
});
