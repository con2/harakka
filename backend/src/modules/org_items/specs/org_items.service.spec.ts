import { Test, TestingModule } from "@nestjs/testing";
import { OrgItemsService } from "../org_items.service";

describe("OrgItemsService", () => {
  let service: OrgItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrgItemsService],
    }).compile();

    service = module.get<OrgItemsService>(OrgItemsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
