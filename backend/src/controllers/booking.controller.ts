import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
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

  @Post()
  async createBooking(@Body() dto: CreateBookingDto, @Req() req: any) {
    const userEmail = req.user?.email ?? "";
    return this.bookingService.createBooking(dto, userEmail);
  }

  @Put(":id/confirm")
  async confirm(@Param("id") id: string) {
    return this.bookingService.confirmBooking(id);
  }

  @Put(":id/update")
  async updateBooking(
    @Param("id") id: string,
    @Body("items") items: any[],
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.bookingService.updateBooking(id, userId, items);
  }

  @Put(":id/reject")
  async reject(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.bookingService.rejectBooking(id, userId);
  }

  @Delete(":id/cancel")
  async cancel(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.bookingService.cancelOwnBooking(id, userId);
  }

  @Delete(":id/delete")
  async delete(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.bookingService.deleteBooking(id, userId);
  }

  @Post(":id/return")
  async returnItems(@Param("id") id: string) {
    return this.bookingService.returnItems(id);
  }
}
// handles the booking process, including creating, confirming, rejecting, and canceling bookings.
