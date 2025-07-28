describe("Basic App Flows (Real Data) for anon user", () => {
  it("Unregistered user can view items", () => {
    cy.visit("/storage");
    cy.get('[data-cy="items-card"]').should("exist");
  });
  it("should NOT show Admin button in navigation", () => {
    cy.visit("/");
    cy.get("nav").should("exist");
    cy.contains("Admin").should("not.exist");
  });

  it("Anon user can navigate to User Guide and see relevant info", () => {
    cy.visit("/");
    cy.contains(/howItWorks/i).click();
    cy.url().should("include", "/howItWorks");
    cy.get("h2")
      .should("contain.text", "Guide")
      .or("contain.text", "How It Works")
      .or("contain.text", "User Guide");
    cy.contains(/Getting Started|How to Book|FAQ/i).should("exist");
  });
});
