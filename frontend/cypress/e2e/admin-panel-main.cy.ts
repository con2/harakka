describe('Admin Panel', () => {
  // Setup: Different user roles for testing
  const adminUser = { email: 'admin@example.com', password: 'password123' };
  const superVeraUser = {
    email: 'supervera@example.com',
    password: 'password123',
  };
  const regularUser = { email: 'user@example.com', password: 'password123' };

  // Custom command to login through Supabase Auth UI
  Cypress.Commands.add('loginWithSupabase', (email, password) => {
    cy.visit('/login');
    // Target elements based on Supabase Auth UI structure
    cy.get('input[name="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
  });

  describe('Authentication and Authorization', () => {
    it('should redirect to login when not authenticated', () => {
      cy.visit('/admin');
      cy.url().should('include', '/login');
    });

    it('should not allow regular users to access admin panel', () => {
      cy.intercept('GET', '**/users', { fixture: 'regular-user.json' }).as(
        'getUser',
      );

      // Login as regular user using the new command
      cy.loginWithSupabase(regularUser.email, regularUser.password);

      cy.visit('/admin');
      cy.url().should('include', '/unauthorized');
    });

    it('should allow admin users to access admin panel', () => {
      cy.intercept('GET', '**/users/current', {
        fixture: 'admin-user.json',
      }).as('getAdminUser');
      cy.intercept('GET', '**/users', { fixture: 'users-list.json' }).as(
        'getUsers',
      );

      // Login as admin using the new command
      cy.loginWithSupabase(adminUser.email, adminUser.password);

      cy.visit('/admin');
      cy.url().should('include', '/admin');
      cy.contains('Admin Panel').should('be.visible');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/users/current', {
        fixture: 'admin-user.json',
      }).as('getAdminUser');
      cy.intercept('GET', '**/users', { fixture: 'users-list.json' }).as(
        'getUsers',
      );

      // Login as admin using the new command
      cy.loginWithSupabase(adminUser.email, adminUser.password);

      cy.visit('/admin');
      cy.wait('@getUsers');
    });

    it('should navigate to users section', () => {
      cy.contains('Users').click();
      cy.url().should('include', '/admin/users');
      cy.contains('Manage Users').should('be.visible');
    });

    it('should navigate to items section', () => {
      cy.contains('Items').click();
      cy.url().should('include', '/admin/items');
    });

    it('should navigate to settings section', () => {
      cy.contains('Settings').click();
      cy.url().should('include', '/admin/settings');
    });
  });

  describe('SuperVera specific functionality', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/users/current', {
        fixture: 'supervera-user.json',
      }).as('getSuperVeraUser');
      cy.intercept('GET', '**/users', { fixture: 'users-list.json' }).as(
        'getUsers',
      );

      // Login as SuperVera using the new command
      cy.loginWithSupabase(superVeraUser.email, superVeraUser.password);

      cy.visit('/admin');
      cy.wait('@getUsers');
    });

    it('should show Team management for SuperVera', () => {
      cy.contains('Team').should('be.visible');
      cy.contains('Team').click();
      cy.url().should('include', '/admin/team');
    });

    it('should not show Team management for regular admin', () => {
      cy.intercept('GET', '**/users/current', {
        fixture: 'admin-user.json',
      }).as('getAdminUser');
      cy.reload();
      cy.wait('@getAdminUser');

      cy.contains('Team').should('not.exist');
    });
  });
});
