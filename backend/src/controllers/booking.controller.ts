import { Body,
    Controller,
    Delete,
    Param,
    Post,
    Put,
    Req,
    UseGuards, } from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async createBooking(@Body() dto: CreateBookingDto, @Req() req: any) {
    const userEmail = req.user?.email ?? '';
    return this.bookingService.createBooking(dto, userEmail);
  }

  @Put(':id/confirm')
  async confirm(@Param('id') id: string) {
    return this.bookingService.confirmBooking(id);
  }

  @Delete(':id/reject')
  async reject(@Param('id') id: string) {
    return this.bookingService.rejectBooking(id);
  }

  @Delete(':id/cancel')
  async cancel(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.bookingService.cancelBooking(id, userId);
  }
}
// handles the booking process, including creating, confirming, rejecting, and canceling bookings.