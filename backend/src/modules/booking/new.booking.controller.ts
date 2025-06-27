import { Controller, Get, Query, Req } from "@nestjs/common";
// import { BookingService } from "./booking.service";
import { AuthenticatedRequest } from "src/middleware/Auth.middleware";
import { NewBookingService } from "./new.booking.service";

@Controller("bookings")
export class NewBookingController {
  constructor(private readonly bookingService: NewBookingService) {}

  @Get()
  getAll(
    @Req() req: AuthenticatedRequest,
    @Query() offset: number,
    @Query() limit: number,
  ) {
    const supabase = req.supabase;
    return this.bookingService.getAllOrders(supabase, offset, limit);
  }
}
