import { Module } from "@nestjs/common";
import { UserBanningController } from "./user-banning.controller";
import { UserBanningService } from "./user-banning.service";

@Module({
  controllers: [UserBanningController],
  providers: [UserBanningService],
  exports: [UserBanningService],
})
export class UserBanningModule {}
