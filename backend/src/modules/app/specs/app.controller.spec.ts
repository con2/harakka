import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "../app.controller";
import { AppService } from "../app.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("Welcome to the Storage and Booking App API!", () => {
      expect(appController.getHello()).toBe(
        "Welcome to the Storage and Booking App API!",
      );
    });
  });
});
