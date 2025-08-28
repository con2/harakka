describe("Basic App Flows (Real Data) for 'user' user", () => {
  it("Registered user can view items with proper details", () => {
    cy.visit("/storage");

    cy.loginAsRegularUser();

    cy.logout();

    cy.get('[data-cy="nav-login-btn"]').should("exist");
    cy.get('[data-cy="nav-signout-btn"]').should("not.exist");
    cy.get('[data-cy="nav-profile-btn"]').should("not.exist");
    cy.visit("/storage");
  });
});
