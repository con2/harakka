describe("Backend health endpoint", () => {
  it("should return health status", () => {
    cy.request("http://127.0.0.1:3000/health").then((response) => {
      expect(response.status).to.eq(200);
      cy.log(JSON.stringify(response.body));
    });
  });
});
