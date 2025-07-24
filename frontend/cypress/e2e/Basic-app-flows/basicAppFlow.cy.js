describe("Basic App Flows (Real Data)", () => {
  it("Unregistered user can view items", () => {
    cy.visit("/storage");
    cy.get('[data-cy="items-card"]').should("exist");
  });
});
