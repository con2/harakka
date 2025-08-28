describe("Cypress Environment Variables", () => {
  it("should have all expected env variables", () => {
    const keys = [
      "VITE_SUPABASE_URL",
      "VITE_SUPABASE_ANON_KEY",
      "SUPABASE_PROJECT_ID",
      "SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_URL",
      "SUPABASE_JWT_SECRET",
      "Supabase_CLI_db_password",
      "SUPABASE_STORAGE_URL",
      "PORT",
      "NODE_ENV",
      "ALLOWED_ORIGINS",
    ];
    keys.forEach((key) => {
      cy.log(`${key}: ${Cypress.env(key)}`);
      expect(Cypress.env(key), `${key} should be defined`).to.exist;
    });
  });
});
