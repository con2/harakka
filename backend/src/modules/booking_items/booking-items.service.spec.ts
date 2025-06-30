import { Test, TestingModule } from "@nestjs/testing";
import { BookingItemsService } from "./booking-items.service";

describe("BookingItemsService", () => {
  let service: BookingItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingItemsService],
    }).compile();

    service = module.get<BookingItemsService>(BookingItemsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
