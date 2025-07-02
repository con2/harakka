import { Test, TestingModule } from "@nestjs/testing";
import { BookingItemsController } from "./booking-items.controller";

describe("BookingItemsController", () => {
  let controller: BookingItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingItemsController],
    }).compile();

    controller = module.get<BookingItemsController>(BookingItemsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
