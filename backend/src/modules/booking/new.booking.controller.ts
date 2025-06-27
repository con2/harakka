import { Controller, Get, Param, Query, Req } from "@nestjs/common";
// import { BookingService } from "./booking.service";
import { AuthenticatedRequest } from "src/middleware/Auth.middleware";
import { NewBookingService } from "./new.booking.service";
import { AvailabilityService } from "../availability/availability.service";

@Controller("bookings")
export class NewBookingController {
  constructor(
    private readonly bookingService: NewBookingService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  /**
   * Get all orders
   * @param req Authenticated request handled by middleware
   * @param offset Starting range of orders to retrieve. Defaults to 0
   * @param limit Total amount of orders to retrieve. Defaults to 20
   * @returns
   */
  @Get()
  getAll(
    @Req() req: AuthenticatedRequest,
    @Query("offset") offset: number,
    @Query("limit") limit: number,
  ) {
    const supabase = req.supabase;
    return this.bookingService.getAllOrders(supabase, offset, limit);
  }

  /**
   * Get bookings of whomever sends the request
   */
  @Get("my")
  getOwnBookings(
    @Req() req: AuthenticatedRequest,
    @Query("offset") offset?: number,
    @Query("limit") limit?: number,
  ) {
    const supabase = req.supabase;
    const user_id = req.user.id;
    return this.bookingService.getUserBookings(
      supabase,
      user_id,
      offset,
      limit,
    );
  }

  /**
   * Get bookings of specified user
   */
  @Get("user/:user_id")
  getUserBookings(
    @Req() req: AuthenticatedRequest,
    @Param("user_id") user_id: string,
    @Query("offset") offset: number,
    @Query("limit") limit: number,
  ) {
    const supabase = req.supabase;
    return this.bookingService.getUserBookings(
      supabase,
      user_id,
      offset,
      limit,
    );
  }
  @Get("availability/:item_id")
  getItemAvailability(
    @Param("item_id") item_id: string,
    @Query("start_date") start_date: string,
    @Query("end_date") end_date: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const supabase = req.supabase;
    return this.availabilityService.getItemAvailability(
      supabase,
      item_id,
      start_date,
      end_date,
    );
  }
}
