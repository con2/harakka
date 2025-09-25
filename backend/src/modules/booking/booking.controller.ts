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
  BadRequestException,
  Patch,
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
   * Get ordered bookings with optional filters.
   * Accessible by all admins within their organization.
   * @param req - Request object
   * @param searchquery - Search query for filtering bookings
   * @param ordered_by - Column to order by (default: created_at)
   * @param status_filter - Filter by booking status
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @param ascending - Whether to sort in ascending order (default: false)
   * @param org_id - Organization ID for scoping (required)
   * @returns Paginated and filtered list of bookings
   */
  @Get("ordered")
  @Roles(["requester", "storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  getOrderedBookings(
    @Req() req: AuthRequest,
    @Query("search") searchquery: string,
    @Query("order") ordered_by: ValidBookingOrder = "created_at",
    @Query("status") status_filter: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("ascending") ascending: string = "false",
  ) {
    const org_id = req.headers["x-org-id"] as string;
    if (!org_id) {
      throw new BadRequestException("Organization context is required");
    }
    const supabase = req.supabase;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const is_ascending = ascending.toLowerCase() === "true";

    return this.bookingService.getOrderedBookings(
      supabase,
      org_id,
      pageNum,
      limitNum,
      is_ascending,
      ordered_by,
      searchquery,
      status_filter,
    );
  }

  /**
   * Overdue bookings for the active organization context (RLS-scoped).
   */
  @Get("overdue")
  @Roles(["storage_manager", "tenant_admin"], { match: "any", sameOrg: true })
  async getOverdue(
    @Req() req: AuthRequest,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.bookingService.getOverdueBookings(req, pageNum, limitNum);
  }

  /**
   * Get bookings of the current authenticated user.
   * Accessible by users and all admins within their organization.
   * @param req - Authenticated request object
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @returns Paginated list of the user's bookings
   */
  @Get("my")
  @Roles(["user", "requester", "storage_manager", "tenant_admin"], {
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
    const activeOrgId = req.headers["x-org-id"] as string;
    const activeRole = req.headers["x-role-name"] as string;
    const userId = req.user.id;
    if (!activeOrgId || !activeRole) {
      throw new BadRequestException("Organization context is required");
    }

    return this.bookingService.getMyBookings(
      req,
      pageNumber,
      limitNumber,
      userId,
      activeOrgId,
      activeRole,
    );
  }

  /**
   * Get a specific booking by its ID.
   * Accessible by tenant admins and storage managers within their organization.
   * @param req - Authenticated request object
   * @param booking_id - ID of the booking to retrieve
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @param org_id - Organization ID for scoping (required)
   * @returns Booking details
   */
  //TODO: limit to activeContext organization
  @Get("id/:id")
  @Roles(["tenant_admin", "storage_manager"])
  async getBookingByID(
    @Req() req: AuthRequest,
    @Param("id") booking_id: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const supabase = req.supabase;
    const org_id = req.headers["x-org-id"] as string;
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

  /**
   * Get the total count of bookings in the system.
   * Tenant admins can only see the count of bookings in their organization.
   * @param req - Authenticated request object
   * @returns Total bookings count
   */
  //TODO: limit to activeContext organization
  @Get("count")
  @Roles(["storage_manager", "tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async getBookingsCount(@Req() req: AuthRequest) {
    const supabase = req.supabase;
    const activeOrgId = req.headers["x-org-id"] as string | undefined;
    const activeRole = req.headers["x-role-name"] as string | undefined;
    return this.bookingService.getBookingsCount(
      supabase,
      activeOrgId,
      activeRole,
    );
  }

  /**
   * Get bookings of a specific user by their ID.
   * Accessible by tenant admins and super admins within their organization.
   * @param userId - ID of the user whose bookings to retrieve
   * @param req - Authenticated request object
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @returns Paginated list of the user's bookings
   */
  @Get("user/:userId")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async getUserBookings(
    @Param("userId") userId: string,
    @Req() req: AuthRequest,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const activeOrgId = req.headers["x-org-id"] as string;
    const activeRole = req.headers["x-role-name"] as string;

    if (!activeOrgId || !activeRole) {
      throw new BadRequestException("Organization context is required");
    }

    return this.bookingService.getUserBookings(
      req,
      pageNumber,
      limitNumber,
      activeOrgId,
    );
  }

  /**
   * Create a new booking.
   * Accessible by users, requesters, storage managers, and tenant admins within their organization.
   * @param dto - Booking data
   * @param req - Authenticated request object
   * @returns Created booking
   */
  @Post()
  @Roles(["user", "requester", "storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async createBooking(@Body() dto: CreateBookingDto, @Req() req: AuthRequest) {
    try {
      const userId = req.user.id;
      if (!userId)
        throw new BadRequestException("No userId found: user_id is required");
      const supabase = req.supabase;
      const activeOrgId = req.headers["x-org-id"] as string;
      const activeRoleName = req.headers["x-role-name"] as string;

      if (!activeOrgId || !activeRoleName) {
        throw new BadRequestException(
          "Organization context and role are required",
        );
      }
      // put user-ID to DTO
      const dtoWithUserId = { ...dto, user_id: userId };
      return this.bookingService.createBooking(dtoWithUserId, supabase, {
        roleName: activeRoleName,
        orgId: activeOrgId,
      });
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  /**
   * Update an existing booking.
   * Users can update their own bookings, while storage managers and tenant admins can update bookings within their organization.
   * @param id - ID of the booking to update
   * @param dto - Updated booking data
   * @param req - Authenticated request object
   * @returns Updated booking
   */
  //TODO: limit to activeContext organization, check own bookings handling
  @Put(":id/update")
  @Roles(["user", "requester", "storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async updateBooking(
    @Param("id") id: string,
    @Body() dto: UpdateBookingDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    return this.bookingService.updateBooking(id, userId, dto, req);
  }

  /**
   * Confirm a booking.
   * Accessible by storage managers and tenant admins within their organization.
   * @param bookingId - ID of the booking to confirm
   * @param req - Authenticated request object
   * @returns Confirmation result
   */
  //TODO: limit to activeContext organization
  @Put(":id/confirm")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async confirm(@Param("id") bookingId: string, @Req() req: AuthRequest) {
    const userId = req.user.id;
    const supabase = req.supabase;

    return this.bookingService.confirmBooking(bookingId, userId, supabase);
  }

  /**
   * Reject a booking.
   * Accessible by storage managers and tenant admins within their organization.
   * @param id - ID of the booking to reject
   * @param req - Authenticated request object
   * @returns Rejection result
   */
  //TODO: limit to activeContext organization
  @Put(":id/reject")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async reject(@Param("id") id: string, @Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.bookingService.rejectBooking(id, userId, req);
  }

  //TODO: remove and replace by id/confirm, it already contain activeRole
  // Confirm booking items for the active organization; supports all or a selected subset via item_ids
  @Put(":id/confirm-for-org")
  async confirmForOrg(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query("org_id") org_id?: string,
    @Body()
    itemIds?: string[],
  ) {
    const orgId = org_id || "";
    if (!orgId) throw new BadRequestException("org_id query param is required");
    return this.bookingService.confirmBookingItemsForOrg(
      id,
      orgId,
      req,
      itemIds,
    );
  }

  //TODO: remove and replace by id/reject, it already contain activeRole
  // Reject booking items for the active organization; supports all or a selected subset via item_ids
  @Put(":id/reject-for-org")
  async rejectForOrg(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query("org_id") org_id?: string,
    @Body()
    itemIds?: string[],
  ) {
    const orgId = org_id || "";
    if (!orgId) throw new BadRequestException("org_id query param is required");
    return this.bookingService.rejectBookingItemsForOrg(
      id,
      orgId,
      req,
      itemIds,
    );
  }

  /**
   * Cancel a booking.
   * Users can cancel their own bookings, while storage managers and tenant admins can cancel bookings within their organization.
   * @param id - ID of the booking to cancel
   * @param req - Authenticated request object
   * @returns Cancellation result
   */
  //TODO: limit to activeContext
  @Delete(":id/cancel")
  @Roles(["user", "requester", "storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async cancel(@Param("id") id: string, @Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.bookingService.cancelBooking(id, userId, req);
  }

  /**
   * Delete a booking.
   * Accessible only by tenant admins within their organization.
   * @param id - ID of the booking to delete
   * @param req - Authenticated request object
   * @returns Deletion result
   */
  //TODO: update or remove completely depending on the customer feedback, do we really delete any orders? If yes, limit by activeContext
  @Delete(":id/delete")
  @Roles(["tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async delete(@Param("id") id: string, @Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.bookingService.deleteBooking(id, userId, req);
  }

  /**
   * Mark a booking as "returned."
   * Accessible by storage managers and tenant admins within their organization.
   * @param id - ID of the booking to mark as returned
   * @param req - Authenticated request object
   * @returns Return result
   */
  @Patch(":id/return")
  async returnItems(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: { itemIds: string[]; location_id: string; org_id: string },
  ) {
    const { itemIds, location_id, org_id } = body;
    const orgId = org_id ?? req.headers["x-org-id"];
    if (!orgId) throw new Error("Missing org ID");
    return this.bookingService.returnItems(
      req,
      id,
      orgId,
      location_id,
      itemIds,
    );
  }

  /**
   * Mark a booking as "picked up."
   * Accessible by storage managers and tenant admins within their organization.
   * @param bookingId - ID of the booking to mark as picked up
   * @param req - Authenticated request object
   * @returns Pickup confirmation result
   */
  @Patch(":bookingId/pickup")
  async pickup(
    @Param("bookingId") bookingId: string,
    @Req() req: AuthRequest,
    @Body() body: { item_ids: string[]; location_id: string; org_id?: string },
  ) {
    const supabase = req.supabase;
    const { item_ids: itemIds, location_id, org_id } = body;

    // Org ID is either provided in the body (self_pickup) or the headers (admin pickup)
    const orgId = org_id ?? (req.headers["x-org-id"] as string);
    return this.bookingService.confirmPickup(
      supabase,
      bookingId,
      orgId,
      location_id,
      itemIds,
    );
  }

  /**
   * Mark items as cancelled from a booking.
   * Meaning they will not be picked up
   */
  @Patch(":bookingId/cancel")
  async cancelItems(
    @Param("bookingId") bookingId: string,
    @Req() req: AuthRequest,
    @Body() itemIds: string[],
  ) {
    const supabase = req.supabase;
    const orgId = req.headers["x-org-id"] as string;
    return this.bookingService.cancelBookingItem(
      supabase,
      bookingId,
      orgId,
      itemIds,
    );
  }
  /**
   * Set items to be marked as picked up by user and not admin
   */
  @Patch(":bookingId/self-pickup")
  async updateSelfPickup(
    @Param("bookingId") bookingId: string,
    @Req() req: AuthRequest,
    @Body() body: { location_id: string; newStatus: boolean },
  ) {
    try {
      const supabase = req.supabase;
      const orgId = (req.headers["x-org-id"] as string) ?? "";

      if (!orgId) {
        throw new BadRequestException(
          "Organization context is required (x-org-id header)",
        );
      }

      if (
        !body ||
        typeof body.location_id !== "string" ||
        body.location_id.trim() === ""
      ) {
        throw new BadRequestException(
          "'location_id' (UUID string) is required in body",
        );
      }

      if (typeof body.newStatus !== "boolean") {
        throw new BadRequestException(
          "'newStatus' (boolean) is required in body",
        );
      }

      return this.bookingService.updateSelfPickup(
        supabase,
        bookingId,
        orgId,
        body,
      );
    } catch (error) {
      handleSupabaseError(error);
    }
  }
}
