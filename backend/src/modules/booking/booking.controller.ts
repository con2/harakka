import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Post,
  Put,
  Req,
  Patch,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { DecisionDto } from "./dto/decision.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { BookingStatus, ValidBookingOrder } from "./types/booking.interface";
import { UpdateBookingItemDto } from "./dto/update-booking-item.dto";
import { Public, Roles } from "src/decorators/roles.decorator";
import { handleSupabaseError } from "@src/utils/handleError.utils";
import {
  normalizeCreateBookingDtoDates,
  normalizeUpdateItemsDates,
} from "@src/utils/booking.utils";

@Controller("bookings")
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // gets all bookings - use case: admin
  @Public()
  @Get()
  async getAll(
    @Req() req: AuthRequest,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const supabase = req.supabase;
    return this.bookingService.getAllBookings(
      supabase,
      pageNumber,
      limitNumber,
    );
  }

  // gets the bookings of the logged-in user
  @Get("my")
  async getOwnBookings(
    @Req() req: AuthRequest,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const userId = req.user.id;
    const supabase = req.supabase;
    return this.bookingService.getUserBookings(
      userId,
      supabase,
      pageNumber,
      limitNumber,
    );
  }

  @Get("count")
  async getBookingsCount(@Req() req: AuthRequest) {
    const supabase = req.supabase;
    return this.bookingService.getBookingsCount(supabase);
  }

  // per-organization availability for an item
  @Get("availability/org")
  @Public()
  async getPerOrgAvailability(
    @Req() req: AuthRequest,
    @Query("item_id") item_id: string,
    @Query("start") start: string,
    @Query("end") end: string,
  ) {
    if (!item_id || !start || !end)
      throw new BadRequestException("item_id, start and end are required");
    return this.bookingService.getPerOrgAvailability(item_id, start, end);
  }

  // gets the bookings of a specific user
  @Get("user/:userId")
  async getUserBookings(
    @Param("userId") userId: string,
    @Req() req: AuthRequest,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    if (!userId) {
      throw new UnauthorizedException("User ID is required");
    }
    const supabase = req.supabase;
    return this.bookingService.getUserBookings(
      userId,
      supabase,
      pageNumber,
      limitNumber,
    );
  }

  // any user creates a booking
  @Post()
  @Roles([
    "admin",
    "user",
    "main_admin",
    "super_admin",
    "superVera",
    "storage_manager",
    "requester",
  ])
  async createBooking(@Body() dto: CreateBookingDto, @Req() req: AuthRequest) {
    if (!dto?.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException(
        "items array is required and must contain at least one item",
      );
    }
    try {
      const userId = req.user.id;
      if (!userId)
        throw new BadRequestException("No userId found: user_id is required");

      // put user-ID to DTO
      const dtoNormalized = normalizeCreateBookingDtoDates(dto);
      const dtoWithUserId = { ...dtoNormalized, user_id: userId };
      return this.bookingService.createBooking(dtoWithUserId, req.supabase);
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  // confirms a booking
  @Put(":id/confirm") // admin confirms booking
  async confirm(@Param("id") bookingId: string, @Req() req: AuthRequest) {
    console.log("userRoles", req.userRoles);
    return this.bookingService.confirmBooking(bookingId, req);
  }

  // updates a booking
  @Put(":id/update") // user updates own booking or admin updates booking
  async updateBooking(
    @Param("id") id: string,
    @Body("items") updatedItems: UpdateBookingItemDto[],
    @Req() req: AuthRequest,
  ) {
    try {
      if (
        !updatedItems ||
        !Array.isArray(updatedItems) ||
        updatedItems.length === 0
      ) {
        throw new BadRequestException(
          "items array is required and must contain at least one item",
        );
      }
      const userId = req.user.id;
      const normalized = normalizeUpdateItemsDates(updatedItems);
      return this.bookingService.updateBooking(id, userId, normalized, req);
    } catch (error) {
      handleSupabaseError(error);
    }
    if (
      !updatedItems ||
      !Array.isArray(updatedItems) ||
      updatedItems.length === 0
    ) {
      throw new BadRequestException(
        "items array is required and must contain at least one item",
      );
    }
    const userId = req.user.id;
    const normalized = normalizeUpdateItemsDates(updatedItems);
    return this.bookingService.updateBooking(id, userId, normalized, req);
  }

  // rejects a booking by admin
  @Put(":id/reject")
  async reject(@Param("id") id: string, @Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.bookingService.rejectBooking(id, userId, req);
  }

  // cancels own booking by user or admin cancels any booking
  @Delete(":id/cancel")
  async cancel(@Param("id") id: string, @Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.bookingService.cancelBooking(id, userId, req);
  }

  // admin deletes booking
  @Delete(":id/delete")
  async delete(@Param("id") id: string, @Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.bookingService.deleteBooking(id, userId, req);
  }

  // admin returns items
  @Post(":id/return")
  async returnItems(@Param("id") id: string, @Req() req: AuthRequest) {
    const userId = req.user.id;
    const supabase = req.supabase;
    return this.bookingService.returnItems(id, userId, supabase);
  }

  // admin marks items as picked up
  @Post(":bookingId/pickup")
  async pickup(@Param("bookingId") bookingId: string, @Req() req: AuthRequest) {
    // const userId = req.user.id;
    const supabase = req.supabase;
    return this.bookingService.confirmPickup(bookingId, supabase);
  }

  // per-organization approval of a single booking item
  @Patch(":bookingId/items/:bookingItemId/approve")
  @Roles(["admin", "storage_manager", "super_admin", "main_admin", "superVera"])
  async approveBookingItem(
    @Param("bookingId") bookingId: string,
    @Param("bookingItemId") bookingItemId: string,
    @Body() body: DecisionDto,
    @Req() req: AuthRequest,
  ) {
    return await this.bookingService.approveBookingItem(
      bookingId,
      bookingItemId,
      body?.reason,
      req,
    );
  }

  // per-organization rejection of a single booking item
  @Patch(":bookingId/items/:bookingItemId/reject")
  @Roles(["admin", "storage_manager", "super_admin", "main_admin", "superVera"])
  async rejectBookingItem(
    @Param("bookingId") bookingId: string,
    @Param("bookingItemId") bookingItemId: string,
    @Body() body: DecisionDto,
    @Req() req: AuthRequest,
  ) {
    return await this.bookingService.rejectBookingItem(
      bookingId,
      bookingItemId,
      body?.reason,
      req,
    );
  }

  // change payment status
  @Patch("payment-status")
  async updatePaymentStatus(
    @Body() dto: UpdatePaymentStatusDto,
    @Req() req: AuthRequest,
  ) {
    // const userId = req.user.id;
    const supabase = req.supabase;
    return this.bookingService.updatePaymentStatus(
      dto.bookingId,
      dto.status,
      supabase,
    );
  }

  @Get("ordered")
  getOrderedBookings(
    @Req() req: AuthRequest,
    @Query("search") searchquery: string,
    @Query("order") ordered_by: ValidBookingOrder = "booking_number",
    @Query("status") status_filter: BookingStatus,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("ascending") ascending: string = "true",
  ) {
    const supabase = req.supabase;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const is_ascending = ascending.toLowerCase() === "true";
    return this.bookingService.getOrderedBookings(
      supabase,
      pageNum,
      limitNum,
      is_ascending,
      ordered_by,
      searchquery,
      status_filter,
    );
  }

  @Get("id/:id")
  @Roles(["admin", "main_admin", "super_admin"])
  async getBookingByID(
    @Req() req: AuthRequest,
    @Param("id") booking_id: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const supabase = req.supabase;
    return this.bookingService.getBookingByID(
      supabase,
      booking_id,
      pageNum,
      limitNum,
    );
  }
}
// handles the booking process, including creating, confirming, rejecting, and canceling bookings.
