import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  Query,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { BookingService } from "../services/booking.service";
import { CreateBookingDto } from "../dto/create-booking.dto";
import { InvoiceService } from "../services/invoice.service";

@Controller("bookings")
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly invoiceService: InvoiceService,
  ) {}

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
    try {
      const userId = req.headers["x-user-id"] ?? req.user?.id;
      if (!userId) {
        throw new BadRequestException("No userId found: user_id is required");
      }
      return this.bookingService.createBooking({ ...dto, user_id: userId });
    } catch (error) {
      console.error("Booking creation failed:", error);

      // Return a structured error but avoid 500
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error; // Keep the original error if it's already properly typed
      }
      throw new BadRequestException(
        "There was an issue processing your booking. If this persists, please contact support.",
      );
    }
  }

  // confirms a booking
  @Put(":id/confirm") // admin confirms booking
  async confirm(@Param("id") id: string, @Req() req: any) {
    console.log("Headers:", req.headers);
    console.log("x-user-id header:", req.headers["x-user-id"]);
    console.log("user.id:", req.user?.id);

    const userId = req.headers["x-user-id"] ?? req.user?.id;
    console.log("Final userId:", userId);

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
    const userId = req.headers["x-user-id"] ?? req.user?.id;
    return this.bookingService.checkAvailability(
      itemId,
      startDate,
      endDate,
      userId, //TODO: check if userId is needed here
    );
  }

  // get virtual number of items for a specific date
  @Get("available-quantity")
  async getAvailableQuantity(
    @Query("item_id") itemId: string,
    @Query("date") date: string,
  ) {
    if (!itemId || !date) {
      throw new BadRequestException("item_id and date are mendatory");
    }
    // Calling the method from the service class and returning the booked quantity
    const availableQuantity =
      await this.bookingService.getAvailableQuantityForDate(itemId, date);
    return { availableQuantity };
  }

  // commented out because it is not used atm
  /* @Get(":orderId/generate") // unsafe - anyone can create files
  async generateInvoice(@Param("orderId") orderId: string) {
    const url = await this.invoiceService.generateInvoice(orderId);

    return url; // should not send url, becaause it is not a public url - will get new endpoint with auth and so on...
  } */
}
// handles the booking process, including creating, confirming, rejecting, and canceling bookings.
