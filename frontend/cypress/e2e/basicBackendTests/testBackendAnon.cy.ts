import { getDateISO } from "../../support/utils";
const API_URL = Cypress.env("VITE_API_URL");

describe("Backend API endpoints, not logged in (anon user)", () => {
  it("GET /health returns status ok", () => {
    cy.request(`${API_URL}/health`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq("ok");
    });
  });

  it("GET /storage-items returns items with expected structure", () => {
    cy.request(`${API_URL}/storage-items`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.be.greaterThan(0);

      response.body.forEach((item: Record<string, unknown>) => {
        expect(item).to.have.all.keys(
          "id",
          "location_id",
          "compartment_id",
          "items_number_total",
          "average_rating",
          "is_active",
          "created_at",
          "translations",
          "items_number_currently_in_storage",
          "is_deleted",
          "items_number_available",
          "storage_item_tags",
          "storage_locations",
          "location_details",
        );
      });
    });
  });

  it("GET /storage-items/availability/:itemId returns availability data with expected structure", () => {
    const startDate = getDateISO(20);
    const endDate = getDateISO(22);
    cy.request({
      url: `${API_URL}/storage-items/availability/64bc7d39-1664-4448-94f7-e672e4f0feea?start_date=${startDate}&end_date=${endDate}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("data");
      expect(response.body.data).to.have.all.keys(
        "item_id",
        "alreadyBookedQuantity",
        "availableQuantity",
      );
      expect(response.body).to.have.property("error");
      expect(response.body).to.have.property("status");
      expect(response.body).to.have.property("statusText");
      expect(response.body).to.have.property("count");
    });
  });

  it("GET /storage-items/:id returns item details", () => {
    cy.request(
      `${API_URL}/storage-items/a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0`,
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("id");
    });
  });

  it("GET /tags returns tags with expected structure", () => {
    cy.request(`${API_URL}/tags`).then((response) => {
      expect([200, 206]).to.include(response.status);
      expect(response.body).to.have.property("data");
      expect(response.body.data).to.be.an("array");
      response.body.data.forEach((tag: Record<string, unknown>) => {
        expect(tag).to.have.property("id");
        expect(tag).to.have.property("created_at");
        expect(tag).to.have.property("translations");
        expect(tag.translations).to.have.property("en");
        expect(tag.translations).to.have.property("fi");
      });
      expect(response.body).to.have.property("error");
      expect(response.body).to.have.property("count");
      expect(response.body).to.have.property("status");
      expect(response.body).to.have.property("statusText");
      expect(response.body).to.have.property("metadata");
      expect(response.body.metadata).to.have.property("total");
      expect(response.body.metadata).to.have.property("totalPages");
      expect(response.body.metadata).to.have.property("page");
    });
  });

  it("GET /tags/item/:itemId returns tags for item", () => {
    cy.request(
      `${API_URL}/tags/item/a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0`,
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
    });
  });

  it("GET /api/storage-locations returns locations with expected structure", () => {
    cy.request(`${API_URL}/api/storage-locations`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("data");
      expect(response.body.data).to.be.an("array");
      expect(response.body.data.length).to.be.greaterThan(0);

      response.body.data.forEach((location: Record<string, unknown>) => {
        expect(location).to.have.all.keys(
          "id",
          "name",
          "description",
          "address",
          "latitude",
          "longitude",
          "created_at",
          "is_active",
          "image_url",
        );
      });

      expect(response.body).to.have.property("total");
      expect(response.body).to.have.property("totalPages");
      expect(response.body).to.have.property("page");
    });
  });

  it("GET /org-items returns organization items with expected structure", () => {
    cy.request(`${API_URL}/org-items`).then((response) => {
      expect([200, 206]).to.include(response.status);
      expect(response.body).to.have.property("data");
      expect(response.body.data).to.be.an("array");
      response.body.data.forEach((item: Record<string, unknown>) => {
        expect(item).to.have.all.keys(
          "id",
          "organization_id",
          "storage_item_id",
          "owned_quantity",
          "is_active",
          "created_at",
          "updated_at",
          "created_by",
          "updated_by",
          "storage_location_id",
        );
      });
      expect(response.body).to.have.property("count");
      expect(response.body).to.have.property("status");
      expect(response.body).to.have.property("statusText");
      expect(response.body).to.have.property("metadata");
      expect(response.body.metadata).to.have.property("total");
      expect(response.body.metadata).to.have.property("totalPages");
      expect(response.body.metadata).to.have.property("page");
    });
  });

  it("GET /item-images/:itemId returns item images with expected structure", () => {
    cy.request({
      url: `${API_URL}/item-images/a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0`,
      failOnStatusCode: false,
    }).then((response) => {
      expect([200, 404]).to.include(response.status);
      if (response.status === 200) {
        expect(response.body).to.be.an("array");
        response.body.forEach((img: Record<string, unknown>) => {
          expect(img).to.have.all.keys(
            "id",
            "item_id",
            "image_url",
            "image_type",
            "display_order",
            "alt_text",
            "is_active",
            "created_at",
            "storage_path",
          );
        });
      }
    });
  });
});
