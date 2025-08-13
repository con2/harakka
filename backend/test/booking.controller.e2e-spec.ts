import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { BookingController } from "../src/modules/booking/booking.controller";
import { BookingService } from "../src/modules/booking/booking.service";

describe("BookingController (routes)", () => {
  let app: INestApplication;

  const bookingServiceMock = {
    getPerOrgAvailability: jest.fn().mockResolvedValue([
      {
        item_id: "item-1",
        organization_id: "org-1",
        ownedTotal: 10,
        alreadyBookedQuantity: 2,
        availableQuantity: 8,
      },
    ]),
    approveBookingItem: jest
      .fn()
      .mockResolvedValue({ message: "Booking item approved" }),
    rejectBookingItem: jest
      .fn()
      .mockResolvedValue({ message: "Booking item rejected" }),
    createBooking: jest.fn().mockResolvedValue({ id: "booking-1" }),
    updateBooking: jest
      .fn()
      .mockResolvedValue({ message: "Booking updated", booking: { id: "b1" } }),
    getBookingsCount: jest.fn().mockResolvedValue({ data: 0 }),
  } as unknown as BookingService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [{ provide: BookingService, useValue: bookingServiceMock }],
    }).compile();

    app = moduleRef.createNestApplication();

    // Inject a minimal req.user and req.supabase for controller methods
    app.use((req: any, _res, next) => {
      req.user = { id: "user-1" };
      req.userRoles = ["admin"];
      req.supabase = {} as any;
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /bookings/availability/org requires query params", async () => {
    const res = await request(app.getHttpServer())
      .get("/bookings/availability/org")
      .expect(400);
    expect(res.body.message).toContain("item_id, start and end are required");
  });

  it("GET /bookings/availability/org returns per-org availability", async () => {
    const res = await request(app.getHttpServer())
      .get(
        "/bookings/availability/org?item_id=item-1&start=2025-08-20&end=2025-08-25",
      )
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({ organization_id: "org-1" });
  });

  it("PATCH /bookings/:bookingId/items/:bookingItemId/approve returns message", async () => {
    const res = await request(app.getHttpServer())
      .patch("/bookings/booking-1/items/item-1/approve")
      .send({ reason: "ok" })
      .expect(200);
    expect(res.body).toMatchObject({ message: "Booking item approved" });
  });

  it("PATCH /bookings/:bookingId/items/:bookingItemId/reject returns message", async () => {
    const res = await request(app.getHttpServer())
      .patch("/bookings/booking-1/items/item-1/reject")
      .send({ reason: "nope" })
      .expect(200);
    expect(res.body).toMatchObject({ message: "Booking item rejected" });
  });

  it("POST /bookings uses req.user.id and forwards to service", async () => {
    const res = await request(app.getHttpServer())
      .post("/bookings")
      .send({
        items: [
          {
            storage_item_id: "item-1",
            quantity: 1,
            start_date: "2025-08-20",
            end_date: "2025-08-21",
          },
        ],
      })
      .expect(201);
    expect(res.body).toMatchObject({ id: "booking-1" });
  });

  it("PUT /bookings/:id/update forwards to service with items", async () => {
    const res = await request(app.getHttpServer())
      .put("/bookings/b1/update")
      .send({
        items: [
          {
            storage_item_id: "item-1",
            quantity: 2,
            start_date: "2025-08-22",
            end_date: "2025-08-24",
          },
        ],
      })
      .expect(200);
    expect(res.body).toMatchObject({ message: "Booking updated" });
  });
});
