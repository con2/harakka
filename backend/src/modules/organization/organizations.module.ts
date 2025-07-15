import { Module } from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { OrganizationsController } from "./organizations.controller";
import { SupabaseService } from "../supabase/supabase.service";

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService, SupabaseService],
})
export class OrganizationsModule {}
