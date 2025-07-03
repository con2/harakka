describe("User Authorization", () => {
  // Test users configuration - matching existing test users
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

  beforeEach(() => {
    // Intercept the current user endpoint to establish role
    cy.intercept("GET", "**/users/current").as("getCurrentUser");
  });

  describe("Regular User Login", () => {
    it("should allow regular user to log in successfully", () => {
      // Setup the user role first
      cy.setupUserRole("user");

      cy.visit("/login");

      // Type login credentials
      cy.get('input[name="email"]')
        .should("be.visible")
        .type(users.regular.email);

      cy.get('input[type="password"]')
        .should("be.visible")
        .type(users.regular.password);

      cy.get('button[type="submit"]').should("be.visible").click();

      // Wait for the network request that happens after login
      cy.wait("@getCurrentUserRegular");

      // Verify user email is displayed somewhere in the UI
      cy.contains(users.regular.email).should("be.visible");

      // Additional verification
      cy.contains(/Dashboard|Home|Profile/i).should("be.visible");
    });
  });

  describe("Admin User Login", () => {
    it("should allow admin user to log in successfully", () => {
      // Setup the user role first
      cy.setupUserRole("admin");

      cy.visit("/login");

      // Type login credentials
      cy.get('input[name="email"]')
        .should("be.visible")
        .type(users.admin.email);

      cy.get('input[type="password"]')
        .should("be.visible")
        .type(users.admin.password);

      cy.get('button[type="submit"]').should("be.visible").click();

      // Wait for the network request that happens after login
      cy.wait("@getCurrentUserAdmin");
      // Verify user email is displayed somewhere in the UI
      cy.contains(users.admin.email).should("be.visible");

      // Additional verification
      cy.contains(/Dashboard|Home|Profile/i).should("be.visible");

      // Verify admin elements are visible
      cy.contains("Admin Panel").should("be.visible");
    });

    it("Admin can visit admin panel after login", () => {
      cy.setupUserRole("admin");
      cy.loginWithSupabase(users.admin.email, users.admin.password);

      cy.visit("/");

      cy.contains("Admin Panel").click();

      // Verify user email is displayed somewhere in the UI
      cy.contains(users.regular.email).should("be.visible");

      // Should be able to visit admin section
      cy.contains("Admin Panel").should("be.visible").click();
    });

    // Add pauses to highlight navigation and admin features
    it("should show admin navigation options", () => {
      // First set up the intercepts
      cy.setupUserRole("admin");

      // Then login (which creates a session)
      cy.loginWithSupabase(users.admin.email, users.admin.password);

      // Now visit the admin page with our established session and intercepts
      cy.visit("/");
      // Show the homepage first
      cy.contains("Admin Panel").should("be.visible").click();
      // Highlight admin panel navigation

      // Now we should be on the admin page with proper navigation
      cy.url().should("include", "/admin");
      // Pause to show the admin panel page

      // Check for admin navigation items in the sidebar specifically
      cy.get("aside nav").within(() => {
        // Pause to highlight the navigation sidebar
        cy.contains("Dashboard").should("be.visible");

        cy.contains("Users").should("be.visible");

        cy.contains("Items").should("be.visible");

        cy.contains("Settings").should("be.visible");
        // Longer pause to emphasize available options

        // But should not include SuperVera-only features
        cy.contains("Team").should("not.exist");
        // Emphasize that Team option is missing for regular admin
      });
    });

    it("should allow admin to manage users", () => {
      // Setup the interceptors first
      cy.setupUserRole("admin");

      // Login and ensure we're properly authenticated
      cy.loginWithSupabase(users.admin.email, users.admin.password);

      // Visit home page, then verify we see admin panel link
      cy.visit("/");

      cy.contains("Admin Panel").should("be.visible").click();

      // Now verify we reached the admin panel and aren't redirected
      cy.url().should("include", "/admin");
      cy.contains("Admin Panel").should("exist");

      // Now navigate to users page from within admin panel
      cy.contains("Users").click();
      // Longer pause to emphasize user management section

      // Verify we're on the users page
      cy.url().should("include", "/admin/users");

      // Admin should see user management interface
      cy.contains("Manage Users").should("be.visible");

      cy.contains("Add New User").should("be.visible");
      // Final emphasis on user management capabilities
    });
  });

  describe("SuperVera User Login", () => {
    it("should allow superVera user to log in successfully", () => {
      // Setup the user role first
      cy.setupUserRole("superVera");

      cy.visit("/login");

      // Type login credentials
      cy.get('input[name="email"]')
        .should("be.visible")
        .type(users.superVera.email);
      cy.get('input[type="password"]')
        .should("be.visible")
        .type(users.superVera.password);
      cy.get('button[type="submit"]').should("be.visible").click();

      // Wait for the network request that happens after login
      cy.wait("@getCurrentUserSuperVera");

      // Instead of waiting for redirect, force navigation to home page
      cy.visit("/");

      // Verify superVera specific elements
      cy.contains("Admin Panel").should("be.visible");

      // Verify user email is displayed somewhere in the UI
      cy.contains(users.superVera.email).should("be.visible");
    });

    it("should show all admin navigation options including Team management", () => {
      cy.setupUserRole("superVera");
      cy.loginWithSupabase(users.superVera.email, users.superVera.password);

      // First navigate to admin through UI
      cy.visit("/");

      cy.contains("Admin Panel").should("be.visible").click();

      // Verify we've reached the admin panel
      cy.url().should("include", "/admin");

      // Check standard admin navigation plus team option
      cy.get("aside nav").within(() => {
        // Highlight sidebar
        cy.contains("Dashboard").should("be.visible");

        cy.contains("Users").should("be.visible");

        cy.contains("Items").should("be.visible");

        cy.contains("Settings").should("be.visible");

        // SuperVera should have Team option - key differentiator
        cy.contains("Team").should("be.visible");
        // Extended pause to emphasize SuperVera's extra privileges
      });
    });

    it("should allow superVera to access team management", () => {
      cy.setupUserRole("superVera");
      cy.loginWithSupabase(users.superVera.email, users.superVera.password);

      // First navigate to admin through UI
      cy.visit("/");

      cy.contains("Admin Panel").should("be.visible").click();

      // Verify we've reached the admin panel
      cy.url().should("include", "/admin");

      // Now look for and click the Team link
      cy.contains("Team").should("be.visible").click();
      // Extended pause to emphasize SuperVera's extra privileges

      // Verify we're on the team page
      cy.url().should("include", "/admin/team");

      // Wait for team management content
      cy.contains("Manage Team").should("be.visible");
      cy.contains("Add New Team Member").should("be.visible");
    });
  });

  describe("Failed Login Attempts", () => {
    it("should show error message with invalid credentials", () => {
      cy.visit("/login");

      cy.get('input[name="email"]').type("wrong@example.com");

      cy.get('input[type="password"]').type("wrongpassword");

      cy.get('button[type="submit"]').click();

      // Should show error message
      cy.contains(/invalid/i).should("be.visible");
      // Emphasize security feature
    });
  });
});
