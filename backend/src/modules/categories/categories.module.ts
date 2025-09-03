import { Module } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CategoriesController } from "./categories.controller";
import { SupabaseService } from "../supabase/supabase.service";

@Module({
  providers: [CategoriesService, SupabaseService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
