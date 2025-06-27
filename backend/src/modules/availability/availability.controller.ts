import { Controller, Get, Param, Query } from "@nestjs/common";
import { AvailabilityService } from "./availability.service";
import { SupabaseService } from "../supabase/supabase.service";

@Controller("availability")
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * @param item_id ID of item
   * @param start_date The start date of which to calculate availability
   * @param end_date The end date of which to calculate availability
   * @returns
   */
  @Get(":item_id")
  async getItemAvailability(
    @Param() item_id: string,
    @Query("start_date") start_date: string,
    @Query("end_date") end_date: string,
  ): Promise<number> {
    const supabase = this.supabaseService.getServiceClient();
    const result = await this.availabilityService.getItemAvailability(
      supabase,
      item_id,
      start_date,
      end_date,
    );
    return result;
  }
}
