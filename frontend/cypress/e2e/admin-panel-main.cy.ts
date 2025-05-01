describe("Admin Panel", () => {
  // Test users configuration
  const users = {
    admin: {
      email: "ermegilius4@gmail.com",
      password: "12345678",
      role: "admin",
    },
    superVera: {
      email: "ermegilius5@gmail.com",
      password: "12345678",
      role: "superVera",
    },
    regular: {
      email: "ermegilius3@gmail.com",
      password: "12345678",
      role: "user",
    },
  };

  // Protected routes that should be tested
  const protectedRoutes = [
    "/admin",
    "/admin/users",
    "/admin/items",
    "/admin/settings",
    "/admin/team",
  ];

  // Define route access permissions
  // const routePermissions = {
  //   '/admin': ['admin', 'superVera'],
  //   '/admin/users': ['admin', 'superVera'],
  //   '/admin/items': ['admin', 'superVera'],
  //   '/admin/settings': ['admin', 'superVera'],
  //   '/admin/team': ['superVera'],
  // };

  /**
   * Custom commands
   */
  // Login through Supabase Auth UI with improved session handling
  Cypress.Commands.add("loginWithSupabase", (email, password) => {
    cy.session(
      [email, password],
      () => {
        cy.visit("/login");
        cy.get('input[name="email"]').should("be.visible").type(email);
        cy.get('input[type="password"]').should("be.visible").type(password);
        cy.get('button[type="submit"]').should("be.visible").click();

        // Wait for login to complete - using a more reliable approach
        cy.url().should("not.include", "/login", { timeout: 10000 });
      },
      {
        cacheAcrossSpecs: false,
      },
    );
  });

  // Setup user role and fixtures
  Cypress.Commands.add("setupUserRole", (role) => {
    if (role === "admin") {
      cy.intercept("GET", "**/users/current", {
        fixture: "admin-user.json",
        statusCode: 200,
      }).as("getCurrentUserAdmin");
    } else if (role === "superVera") {
      cy.intercept("GET", "**/users/current", {
        fixture: "supervera-user.json",
        statusCode: 200,
      }).as("getCurrentUserSuperVera");
    } else {
      cy.intercept("GET", "**/users/current", {
        fixture: "regular-user.json",
        statusCode: 200,
      }).as("getCurrentUserRegular");
    }

    // Common intercept for all users
    cy.intercept("GET", "**/users", {
      fixture: "users-list.json",
      statusCode: 200,
    }).as("getUsers");
  });

  /**
   * Test scenarios
   */
  describe("Authentication and Authorization", () => {
    // Test anonymous users
    it("should redirect anonymous users to unauthorized page when accessing protected routes", () => {
      // Test each protected route with clearer failure messages
      protectedRoutes.forEach((route) => {
        cy.visit(route, { failOnStatusCode: false });
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

    // Test regular user access - improved assertions
    it('should show "Access Denied" when regular users try to access admin panel', () => {
      cy.setupUserRole("user");
      cy.loginWithSupabase(users.regular.email, users.regular.password);

      cy.visit("/admin", { failOnStatusCode: false });

      // Verify redirect to unauthorized page
      cy.url().should("include", "/unauthorized");

      // Verify specific Access Denied message
      cy.get("h1").should("contain.text", "Access Denied");
      cy.contains("p", "You do not have permission to view this page.").should(
        "be.visible",
      );
    });

    // Test regular user accessing other admin routes
    it('should show "Access Denied" when regular users try to access any admin routes', () => {
      cy.setupUserRole("user");
      cy.loginWithSupabase(users.regular.email, users.regular.password);

      // Test each admin route
      [
        "/admin/users",
        "/admin/items",
        "/admin/settings",
        "/admin/team",
      ].forEach((route) => {
        cy.visit(route, { failOnStatusCode: false });
        cy.url().should("include", "/unauthorized");
        cy.get("h1").should("contain.text", "Access Denied");
      });
    });

    //   // Test admin access with better content verification
    //   it('should allow admin users to access admin panel', () => {
    //     cy.setupUserRole('admin');
    //     cy.loginWithSupabase(users.admin.email, users.admin.password);

    //     cy.visit('/admin');
    //     cy.url().should('include', '/admin');
    //     cy.contains('Admin Panel').should('be.visible');

    //     // Verify dashboard elements
    //     cy.contains('Dashboard').should('be.visible');
    //     cy.contains('Users').should('be.visible');
    //   });

    //   // Test SuperVera access with better content verification
    //   it('should allow superVera users to access admin panel', () => {
    //     cy.setupUserRole('superVera');
    //     cy.loginWithSupabase(users.superVera.email, users.superVera.password);

    //     cy.visit('/admin');
    //     cy.url().should('include', '/admin');
    //     cy.contains('Admin Panel').should('be.visible');

    //     // Verify SuperVera specific elements
    //     cy.contains('Team').should('be.visible');
    //   });
    // });

    // describe('Navigation as Admin', () => {
    //   beforeEach(() => {
    //     cy.setupUserRole('admin');
    //     cy.loginWithSupabase(users.admin.email, users.admin.password);
    //     cy.visit('/admin');
    //     cy.wait('@getUsers');
    //   });

    //   it('should navigate to users section and show user management', () => {
    //     cy.contains('Users').click();
    //     cy.url().should('include', '/admin/users');
    //     cy.contains('Manage Users').should('be.visible');

    //     // Verify table and actions are present
    //     cy.get('table').should('be.visible');
    //     cy.contains('button', /add|create/i).should('exist');
    //   });

    //   it('should navigate to items section and show inventory', () => {
    //     cy.contains('Items').click();
    //     cy.url().should('include', '/admin/items');

    //     // Verify content specific to items page
    //     cy.contains(/inventory|items/i).should('be.visible');
    //   });

    //   it('should navigate to settings section', () => {
    //     cy.contains('Settings').click();
    //     cy.url().should('include', '/admin/settings');

    //     // Verify settings page content
    //     cy.contains(/settings|configuration/i).should('exist');
    //   });

    //   it('should not show Team management for regular admin', () => {
    //     // First verify it's not in the sidebar
    //     cy.contains('Team').should('not.exist');

    //     // Also verify direct navigation is prevented
    //     cy.visit('/admin/team', { failOnStatusCode: false });
    //     cy.url().should('not.include', '/admin/team');
    //   });
  });

  // // describe('SuperVera specific functionality', () => {
  // //   beforeEach(() => {
  //     cy.setupUserRole('superVera');
  //     cy.loginWithSupabase(users.superVera.email, users.superVera.password);
  //     cy.visit('/admin');
  //     cy.wait('@getUsers');
  //   });

  //   it('should show and navigate to Team management for SuperVera', () => {
  //     cy.contains('Team').should('be.visible');
  //     cy.contains('Team').click();
  //     cy.url().should('include', '/admin/team');

  //     // Verify team management specific content
  //     cy.contains(/manage team|team members/i).should('be.visible');
  //   });

  //   it('should provide access to all admin sections', () => {
  //     // SuperVera should have access to all admin sections
  //     cy.contains('Users').should('be.visible');
  //     cy.contains('Items').should('be.visible');
  //     cy.contains('Settings').should('be.visible');
  //     cy.contains('Team').should('be.visible');

  //     // Verify navigation works for each section
  //     ['Users', 'Items', 'Settings', 'Team'].forEach((section) => {
  //       cy.contains(section).click();
  //       cy.url().should('include', `/admin/${section.toLowerCase()}`);
  //       cy.visit('/admin'); // Go back to admin home
  //     });
  //   });
  // });

  // // Improved version of permission testing - more focused and reliable
  // describe('Specific route permissions', () => {
  //   const testCases = [
  //     { route: '/admin/team', role: 'admin', expectedResult: 'denied' },
  //     { route: '/admin/team', role: 'superVera', expectedResult: 'allowed' },
  //     { route: '/admin/users', role: 'admin', expectedResult: 'allowed' },
  //     { route: '/admin/users', role: 'user', expectedResult: 'denied' },
  //   ];

  //   testCases.forEach(({ route, role, expectedResult }) => {
  //     it(`should ${
  //       expectedResult === 'allowed' ? 'allow' : 'deny'
  //     } ${role} access to ${route}`, () => {
  //       // Setup user and login
  //       cy.setupUserRole(role);
  //       const userCredentials = users[role as keyof typeof users];
  //       cy.loginWithSupabase(userCredentials.email, userCredentials.password);

  //       // Visit route and check result
  //       cy.visit(route, { failOnStatusCode: false });

  //       if (expectedResult === 'allowed') {
  //         cy.url().should('include', route);
  //       } else {
  //         cy.url().should('not.include', route);
  //         cy.url().should('include', '/unauthorized');
  //       }
  //     });
  //   });
  // });
});
