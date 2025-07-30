describe("Basic App Flows (Real Data) for 'user' user", () => {
  it("superVera user can view items with proper details", () => {
    cy.visit("/storage");

    cy.loginAsSuperVeraUser();

    cy.wait(5000);
    cy.logout();
    cy.get('[data-cy="nav-login-btn"]').should("exist");
    cy.get('[data-cy="nav-signout-btn"]').should("not.exist");
    cy.get('[data-cy="nav-profile-btn"]').should("not.exist");
    cy.visit("/storage");
  });

  it("superVera user can access admin panel", () => {
    cy.visit("/");
    cy.loginAsSuperVeraUser();

    cy.get('[data-cy="nav-admin"]').should("exist").click();
  });
});
