describe("Anonymous User Access", () => {
  // Define protected routes that should be tested
  const protectedRoutes = [
    "/admin",
    "/admin/users",
    "/admin/items",
    //'/admin/settings', //component not ready yet
    "/admin/team",
  ];

  // Define public routes that should be accessible
  // const publicRoutes = ['/', '/storage'];

  // Test public page access
  describe("Public Pages Access", () => {
    it("should be able to access the main page", () => {
      cy.visit("/");
      cy.url().should("eq", Cypress.config().baseUrl + "/");

      // Verify some content on the main page
      cy.contains(/Storage|Welcome|Home/i).should("be.visible");
    });

    it("should be able to view storage items list", () => {
      // Mock the API response for items
      cy.intercept("GET", "**/storage-items", {
        fixture: "storage-items.json",
      }).as("getItems");

      cy.visit("/storage");
      cy.wait("@getItems");

      // Verify items are displayed
      cy.get('[data-cy="items-card"]').should("be.visible");
      cy.contains(/Taisteluliivi|Suojalasit/i).should("exist");
    });

    it("should be able to navigate between public pages", () => {
      cy.visit("/");

      // Find and click a navigation link to storage
      cy.get('a[href*="storage"]').click();
      cy.url().should("include", "/storage");

      // Verify navigation remains visible
      cy.get("nav").should("be.visible");
    });
  });

  // Test admin panel access restrictions
  describe("Admin Panel access restrictions", () => {
    it("should be redirected to unauthorized page when accessing admin routes", () => {
      // Test each protected route
      protectedRoutes.forEach((route) => {
        cy.visit(route, { failOnStatusCode: false });

        // Verify redirect to unauthorized page
        cy.url().should(
          "include",
          "/unauthorized",
          `Expected ${route} to redirect to unauthorized page`,
        );

        // Verify "Access Denied" message is displayed
        cy.get("h1").should("contain.text", "Access Denied");
        cy.contains(
          "p",
          "You do not have permission to view this page.",
        ).should("be.visible");
      });
    });

    //TODO: Uncomment this test when admin UI elements (conditional rendering) are available
    // it('should not show admin-only UI elements', () => {
    //   cy.visit('/');

    //   // Verify admin-specific navigation items are not shown
    //   cy.contains('Admin Panel').should('not.exist');
    //   cy.contains('Admin Dashboard').should('not.exist');

    //   // Check user menu doesn't have admin options
    //   // This assumes your app has some kind of user menu or profile indicator
    //   cy.get('header').then(($header) => {
    //     // If there's a user menu button, open it and check for admin options
    //     if ($header.find('[data-cy="user-menu"]').length) {
    //       cy.get('[data-cy="user-menu"]').click();
    //       cy.contains('Admin Dashboard').should('not.exist');
    //     }
    //   });
    // });
  });

  describe("Login prompt behavior", () => {
    it("should show login option for anonymous users", () => {
      cy.visit("/");

      // Verify login button/link is available
      cy.contains(/login|sign in/i).should("exist");
    });

    it("should navigate to login page when login is clicked", () => {
      cy.visit("/");
      cy.contains(/login|sign in/i).click();
      cy.url().should("include", "/login");

      // Verify login form elements are present
      cy.get('input[name="email"]').should("be.visible");
      cy.get('input[type="password"]').should("be.visible");
    });
  });
});
