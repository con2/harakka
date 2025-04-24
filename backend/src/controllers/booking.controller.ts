import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { BookingService } from "../services/booking.service";
import { CreateBookingDto } from "../dto/create-booking.dto";

@Controller("bookings")
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // gets all bookings - use case: admin
  @Get()
  async getAll(@Req() req: any) {
    const userId = req.headers["x-user-id"] ?? req.user?.id;
    return this.bookingService.getAllOrders(userId);
  }

  // gets the bookings of the logged-in user
  @Get("my")
  async getOwnBookings(@Req() req: any) {
    const userId = req.headers["x-user-id"] ?? req.user?.id;
    return this.bookingService.getUserBookings(userId);
  }

  // gets the bookings of a specific user
  @Get("user/:userId")
  async getUserBookings(@Param("userId") userId: string) {
    if (!userId) {
      throw new UnauthorizedException("User ID is required");
    }
    return this.bookingService.getUserBookings(userId);
  }

  // creates a booking
  @Post()
  async createBooking(@Body() dto: CreateBookingDto, @Req() req: any) {
    return this.bookingService.createBooking(dto);
  }

  // confirms a booking
  @Put(":id/confirm") // admin confirms booking
  async confirm(@Param("id") id: string, @Req() req: any) {
    const userId = req.headers["x-user-id"] ?? req.user?.id;
    return this.bookingService.confirmBooking(id, userId);
  }

  // updates a booking
  @Put(":id/update") // user updates own booking or admin updates booking
  async updateBooking(
    @Param("id") id: string,
    @Body("items") items: any[],
    @Req() req: any,
  ) {
    const userId = req.headers["x-user-id"] ?? req.user?.id;
    return this.bookingService.updateBooking(id, userId, items);
  }

  // rejects a booking by admin
  @Put(":id/reject")
  async reject(@Param("id") id: string, @Req() req: any) {
    const userId = req.headers["x-user-id"] ?? req.user?.id;
    return this.bookingService.rejectBooking(id, userId);
  }

  // cancels own booking by user or admin cancels any booking
  @Delete(":id/cancel")
  async cancel(@Param("id") id: string, @Req() req: any) {
    const userId = req.headers["x-user-id"] ?? req.user?.id;
    return this.bookingService.cancelBooking(id, userId);
  }

  // admin deletes booking
  @Delete(":id/delete")
  async delete(@Param("id") id: string, @Req() req: any) {
    const userId = req.headers["x-user-id"] ?? req.user?.id;
    return this.bookingService.deleteBooking(id, userId);
  }

  // admin returns items
  @Post(":id/return")
  async returnItems(@Param("id") id: string, @Req() req: any) {
    const userId = req.headers["x-user-id"] ?? req.user?.id;
    return this.bookingService.returnItems(id, userId);
  }

  // checks availability of items by date range
  @Get("availability/:itemId")
  async getItemAvailability(
    @Param("itemId") itemId: string,
    @Query("start_date") startDate: string,
    @Query("end_date") endDate: string,
    @Req() req: any,
  ) {
    return this.bookingService.checkAvailability(
      itemId,
      startDate,
      endDate,
      req.user?.id,
    );
  }
}
// handles the booking process, including creating, confirming, rejecting, and canceling bookings.
