import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { OrganizationLocationsController } from "./organization_locations.controller";
import { OrganizationLocationsService } from "./organization_locations.service";

@Module({
  imports: [SupabaseModule],
  controllers: [OrganizationLocationsController],
  providers: [OrganizationLocationsService],
})
export class OrganizationLocationsModule {}
