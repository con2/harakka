describe("Basic App Flows (Real Data) for 'user' user", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.loginAsSuperVeraUser();
    cy.get('[data-cy="nav-admin"]').should("exist").click();
    cy.url().should("include", "/admin");
  });

  it("superVera user can access admin panel", () => {
    cy.get('[data-cy="nav-admin"]').should("exist").click();
    cy.wait(5000);
  });

  it("shows all admin navigation links", () => {
    cy.get('[data-cy="admin-nav-dashboard"]').should("exist");
    cy.get('[data-cy="admin-nav-bookings"]').should("exist");
    cy.get('[data-cy="admin-nav-items"]').should("exist");
    cy.get('[data-cy="admin-nav-tags"]').should("exist");
    cy.get('[data-cy="admin-nav-users"]').should("exist");
    cy.get('[data-cy="admin-nav-roles"]').should("exist");
    cy.get('[data-cy="admin-nav-organizations"]').should("exist");
    cy.get('[data-cy="admin-nav-logs"]').should("exist");
    cy.get('[data-cy="admin-nav-settings"]').should("exist");
  });
});
