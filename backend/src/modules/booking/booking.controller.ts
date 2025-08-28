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
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { BookingService } from "./booking.service";
import { RoleService } from "../role/role.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { ValidBookingOrder } from "./types/booking.interface";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { Roles } from "src/decorators/roles.decorator";
import { handleSupabaseError } from "@src/utils/handleError.utils";

@Controller("bookings")
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly roleService: RoleService,
  ) {}

  /**
   * Get all bookings.
   * Accessible only by super admins.
   */
  @Roles(["super_admin"])
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

  /**
   * Get bookings of the logged-in user.
   * Accessible by users and requesters.
   */
  //TODO: return bookings of my activeContext organization only
  @Get("my")
  @Roles(["user", "requester"], {
    match: "any",
    sameOrg: true,
  })
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
    "user",
    "tenant_admin",
    "super_admin",
    "superVera",
    "storage_manager",
    "requester",
  ])
  async createBooking(@Body() dto: CreateBookingDto, @Req() req: AuthRequest) {
    try {
      const userId = req.user.id;
      if (!userId)
        throw new BadRequestException("No userId found: user_id is required");
      const supabase = req.supabase;
      // put user-ID to DTO
      const dtoWithUserId = { ...dto, user_id: userId };
      return this.bookingService.createBooking(dtoWithUserId, supabase);
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  // updates a booking
  @Put(":id/update") // user updates own booking or admin updates booking
  async updateBooking(
    @Param("id") id: string,
    @Body() dto: UpdateBookingDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    return this.bookingService.updateBooking(id, userId, dto, req);
  }

  // confirms a booking
  @Put(":id/confirm") // admin confirms booking
  async confirm(@Param("id") bookingId: string, @Req() req: AuthRequest) {
    const userId = req.user.id;
    const supabase = req.supabase;

    return this.bookingService.confirmBooking(bookingId, userId, supabase);
  }

  // rejects a booking by admin
  @Put(":id/reject")
  async reject(@Param("id") id: string, @Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.bookingService.rejectBooking(id, userId, req);
  }

  // Confirm booking items for the active organization; supports all or a selected subset via item_ids
  @Put(":id/confirm-for-org")
  async confirmForOrg(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query("org_id") org_id?: string,
    @Body()
    body?: {
      item_ids?: string[];
    },
  ) {
    const orgId = org_id || "";
    if (!orgId) throw new BadRequestException("org_id query param is required");
    return this.bookingService.confirmBookingItemsForOrg(
      id,
      orgId,
      req,
      body?.item_ids,
    );
  }

  // Reject booking items for the active organization; supports all or a selected subset via item_ids
  @Put(":id/reject-for-org")
  async rejectForOrg(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query("org_id") org_id?: string,
    @Body()
    body?: {
      item_ids?: string[];
    },
  ) {
    const orgId = org_id || "";
    if (!orgId) throw new BadRequestException("org_id query param is required");
    return this.bookingService.rejectBookingItemsForOrg(
      id,
      orgId,
      req,
      body?.item_ids,
    );
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

  @Get("ordered")
  getOrderedBookings(
    @Req() req: AuthRequest,
    @Query("search") searchquery: string,
    @Query("order") ordered_by: ValidBookingOrder = "created_at",
    @Query("status") status_filter: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("ascending") ascending: string = "false",
    @Query("org_id") org_id?: string,
  ) {
    const supabase = req.supabase;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const is_ascending = ascending.toLowerCase() === "true";
    // Require scoping to an organization and validate membership
    const requestedOrg = (org_id ?? "").trim();
    if (!requestedOrg) {
      throw new BadRequestException("org_id query param is required");
    }
    const isMember = this.roleService.hasAnyRole(
      req,
      ["tenant_admin", "storage_manager"],
      requestedOrg,
    );
    if (!isMember) {
      throw new ForbiddenException(
        "You don't have access to this organization's bookings",
      );
    }
    return this.bookingService.getOrderedBookings(
      supabase,
      pageNum,
      limitNum,
      is_ascending,
      ordered_by,
      searchquery,
      status_filter,
      requestedOrg,
    );
  }

  @Get("id/:id")
  @Roles(["tenant_admin", "storage_manager"])
  async getBookingByID(
    @Req() req: AuthRequest,
    @Param("id") booking_id: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("org_id") org_id?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const supabase = req.supabase;
    if (!org_id)
      throw new BadRequestException("org_id query param is required");
    return this.bookingService.getBookingByID(
      supabase,
      booking_id,
      pageNum,
      limitNum,
      org_id,
    );
  }
}
// handles the booking process, including creating, confirming, rejecting, and canceling bookings.
