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
} from "@nestjs/common";
import { BookingService } from "../services/booking.service";
import { CreateBookingDto } from "../dto/create-booking.dto";

@Controller("bookings")
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  async getAll() {
    return this.bookingService.getAllOrders();
  }

  @Get("my") // gets the bookings of the logged-in user
  async getOwnBookings(@Req() req: any) {
    const userId = req.user?.id;
    return this.bookingService.getUserBookings(userId);
  }

  /*   @Get("my") // for testing
  async getOwnBookings(@Req() req: any) {
    const userId = req.headers["x-user-id"] ?? req.user?.id;
    return this.bookingService.getUserBookings(userId);
  } */

  @Post()
  async createBooking(@Body() dto: CreateBookingDto, @Req() req: any) {
    return this.bookingService.createBooking(dto);
  }

  @Put(":id/confirm") // admin confirms booking
  async confirm(@Param("id") id: string) {
    return this.bookingService.confirmBooking(id);
  }

  @Put(":id/update") // user updates own booking or admin updates booking
  async updateBooking(
    @Param("id") id: string,
    @Body("items") items: any[],
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.bookingService.updateBooking(id, userId, items);
  }

  @Put(":id/reject") // admin rejects booking
  async reject(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.bookingService.rejectBooking(id, userId);
  }

  @Delete(":id/cancel") // user cancels own booking
  async cancel(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.bookingService.cancelOwnBooking(id, userId);
  }

  @Delete(":id/delete") // admin deletes booking
  async delete(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.bookingService.deleteBooking(id, userId);
  }

  @Post(":id/return") // admin returns items
  async returnItems(@Param("id") id: string) {
    return this.bookingService.returnItems(id);
  }

  @Get("availability/:itemId")
  async getItemAvailability(
    @Param("itemId") itemId: string,
    @Query("start_date") startDate: string,
    @Query("end_date") endDate: string,
  ) {
    return this.bookingService.checkAvailability(itemId, startDate, endDate);
  }
}
// handles the booking process, including creating, confirming, rejecting, and canceling bookings.
