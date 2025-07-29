describe("Basic App Flows (Real Data) for 'user' user", () => {
  it("Unregistered user can view items with proper details", () => {
    cy.visit("/storage");
    cy.loginAsRegularUser();
  });
});
