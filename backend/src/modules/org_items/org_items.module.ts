import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { OrgItemsController } from "./org_items.controller";
import { OrgItemsService } from "./org_items.service";
@Module({
  imports: [SupabaseModule],
  controllers: [OrgItemsController],
  providers: [OrgItemsService],
  exports: [],
})
export class Org_ItemsModule {}
