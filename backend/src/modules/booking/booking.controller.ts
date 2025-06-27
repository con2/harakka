// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Post,
//   Put,
//   Req,
//   Query,
//   Patch,
//   UnauthorizedException,
//   BadRequestException,
//   ForbiddenException,
// } from "@nestjs/common";
// //import { BookingService } from "./booking.service";
// import { CreateBookingDto } from "./dto/create-booking.dto";
// import { InvoiceService } from "./invoice.service";
// import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";
// import { AuthenticatedRequest } from "src/middleware/Auth.middleware";

// @Controller("bookings")
// export class BookingController {
//   constructor(
//     private readonly bookingService: BookingService,
//     private readonly invoiceService: InvoiceService,
//   ) {}

//   // gets all bookings - use case: admin
//   @Get()
//   async getAll(
//     @Req() req: AuthenticatedRequest,
//     @Query() offset: number,
//     @Query() limit: number,
//   ) {
//     const supabase = req.supabase;
//     return this.bookingService.getAllOrders(supabase, offset, limit);
//   }

//   // gets the bookings of the logged-in user
//   @Get("my")
//   async getOwnBookings(
//     @Req() req: AuthenticatedRequest,
//     @Query() offset: number,
//     @Query() limit: number,
//   ) {
//     const userId = req.user.id;
//     const supabase = req.supabase;
//     return this.bookingService.getUserBookings(userId, supabase, offset, limit);
//   }

//   // gets the bookings of a specific user
//   @Get("user/:userId")
//   async getUserBookings(
//     @Param("userId") userId: string,
//     @Req() req: AuthenticatedRequest,
//   ) {
//     if (!userId) {
//       throw new UnauthorizedException("User ID is required");
//     }
//     const supabase = req.supabase;
//     return this.bookingService.getUserBookings(userId, supabase);
//   }

//   // any user creates a booking
//   @Post()
//   async createBooking(
//     @Body() dto: CreateBookingDto,
//     @Req() req: AuthenticatedRequest,
//   ) {
//     try {
//       const userId = req.user?.id;
//       if (!userId) {
//         throw new BadRequestException("No userId found: user_id is required");
//       }
//       // put user-ID to DTO
//       const dtoWithUserId = { ...dto, user_id: userId };
//       return this.bookingService.createBooking(dtoWithUserId, req.supabase);
//     } catch (error) {
//       console.error("Booking creation failed:", error);

//       // Return a structured error but avoid 500
//       if (
//         error instanceof BadRequestException ||
//         error instanceof ForbiddenException
//       ) {
//         throw error;
//       }
//       throw new BadRequestException(
//         "There was an issue processing your booking. If this persists, please contact support.",
//       );
//     }
//   }

//   // confirms a booking
//   @Put(":id/confirm") // admin confirms booking
//   async confirm(
//     @Param("id") orderId: string,
//     @Req() req: AuthenticatedRequest,
//   ) {
//     const userId = req.user.id;
//     const supabase = req.supabase;

//     return this.bookingService.confirmBooking(orderId, userId, supabase);
//   }

//   // updates a booking
//   @Put(":id/update") // user updates own booking or admin updates booking
//   async updateBooking(
//     @Param("id") id: string,
//     @Body("items") updatedItems: any[],
//     @Req() req: AuthenticatedRequest,
//   ) {
//     const userId = req.user.id;
//     const supabase = req.supabase;
//     return this.bookingService.updateBooking(
//       id,
//       userId,
//       updatedItems,
//       supabase,
//     );
//   }

//   // rejects a booking by admin
//   @Put(":id/reject")
//   async reject(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
//     const userId = req.user.id;
//     const supabase = req.supabase;
//     return this.bookingService.rejectBooking(id, userId, supabase);
//   }

//   // cancels own booking by user or admin cancels any booking
//   @Delete(":id/cancel")
//   async cancel(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
//     const userId = req.user.id;
//     const supabase = req.supabase;
//     return this.bookingService.cancelBooking(id, userId, supabase);
//   }

//   // admin deletes booking
//   @Delete(":id/delete")
//   async delete(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
//     const userId = req.user.id;
//     const supabase = req.supabase;
//     return this.bookingService.deleteBooking(id, userId, supabase);
//   }

//   // admin returns items
//   @Post(":id/return")
//   async returnItems(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
//     const userId = req.user.id;
//     const supabase = req.supabase;
//     return this.bookingService.returnItems(id, userId, supabase);
//   }

//   // admin marks items as picked up
//   @Post(":orderId/pickup")
//   async pickup(
//     @Param("orderId") orderId: string,
//     @Req() req: AuthenticatedRequest,
//   ) {
//     // const userId = req.user.id;
//     const supabase = req.supabase;
//     return this.bookingService.confirmPickup(orderId, supabase);
//   }

//   // checks availability of items by date range
//   @Get("availability/:itemId")
//   async getItemAvailability(
//     @Param("itemId") itemId: string,
//     @Query("start_date") startDate: string,
//     @Query("end_date") endDate: string,
//     @Req() req: AuthenticatedRequest,
//   ) {
//     const userId = req.user.id;
//     const supabase = req.supabase;
//     return this.bookingService.checkAvailability(
//       itemId,
//       startDate,
//       endDate,
//       userId, //TODO: check if userId is needed here
//       supabase,
//     );
//   }

//   // get virtual number of items for a specific date
//   @Get("virtual-quantity")
//   async getAvailableQuantity(
//     @Query("item_id") itemId: string,
//     @Query("startdate") startdate: string,
//     @Query("enddate") enddate: string,
//   ) {
//     if (!itemId || !startdate) {
//       throw new BadRequestException("item_id and date are mendatory");
//     }
//     // Calling the method from the service class and returning the booked quantity
//     const availableQuantity =
//       await this.bookingService.getAvailableQuantityForDate(
//         itemId,
//         startdate,
//         enddate,
//       );
//     return { availableQuantity };
//   }

//   // change payment status
//   @Patch("payment-status")
//   async updatePaymentStatus(
//     @Body() dto: UpdatePaymentStatusDto,
//     @Req() req: AuthenticatedRequest,
//   ) {
//     // const userId = req.user.id;
//     const supabase = req.supabase;
//     return this.bookingService.updatePaymentStatus(
//       dto.orderId,
//       dto.status,
//       supabase,
//     );
//   }

//   // commented out because it is not used atm
//   /* @Get(":orderId/generate") // unsafe - anyone can create files
//   async generateInvoice(@Param("orderId") orderId: string) {
//     const url = await this.invoiceService.generateInvoice(orderId);

//     return url; // should not send url, becaause it is not a public url - will get new endpoint with auth and so on...
//   } */
// }
// // handles the booking process, including creating, confirming, rejecting, and canceling bookings.
