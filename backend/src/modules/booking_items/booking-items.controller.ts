import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { BookingItemsService } from "./booking-items.service";
import { RoleService } from "../role/role.service";
import {
  BookingItemsInsert,
  BookingItemsUpdate,
} from "./interfaces/booking-items.interfaces";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { Public, Roles } from "src/decorators/roles.decorator";

@Controller("booking-items")
export class BookingItemsController {
  constructor(
    private readonly bookingItemsService: BookingItemsService,
    private readonly roleService: RoleService,
  ) {}

  /**
   * Get all booked items from the backend
   * @param req
   * @returns
   */
  @Get()
  @Public()
  async getAllBookingItems(
    @Req() req: AuthRequest,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const supabase = req.supabase;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.bookingItemsService.getAll(
      supabase,
      pageNumber,
      limitNumber,
    );
  }

  /**
   * Get booked items of a certain booking
   * @param req
   * @param booking_id The ID of the booking
   * @param offset What index to paginate from. Default 0
   * @param limit Amount of booking items to return. Default 20
   * @returns
   */
  @Get(":booking_id")
  @Public()
  async getBookingItems(
    @Req() req: AuthRequest,
    @Param("booking_id") booking_id: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("item-details") storage_item_columns: string = "translations",
  ) {
    const supabase = req.supabase;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.bookingItemsService.getBookingItems(
      supabase,
      booking_id,
      pageNumber,
      limitNumber,
      storage_item_columns,
      undefined,
    );
  }

  /**
   * Endpoint to create a new booking item
   * Accessible by users, requesters, storage managers, and tenant admins.
   * @param req
   * @body Item to add to a booking
   * @returns
   */
  @Post()
  @Roles(["user", "requester", "storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async createBookingItem(
    @Req() req: AuthRequest,
    @Body() booking_item: BookingItemsInsert | BookingItemsInsert[],
  ) {
    const supabase = req.supabase;
    return await this.bookingItemsService.createBookingItems(
      supabase,
      booking_item,
    );
  }

  @Delete(":booking_id/:booking_item_id")
  @Roles(["user", "requester", "storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async removeBookingItem(
    @Req() req: AuthRequest,
    @Param("booking_id") booking_id: string,
    @Param("booking_item_id") booking_item_id: string,
  ) {
    const supabase = req.supabase;
    return await this.bookingItemsService.removeBookingItem(
      supabase,
      booking_id,
      booking_item_id,
    );
  }

  @Delete(":booking_id/:booking_item_id/permanent")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async deleteBookingItem(
    @Req() req: AuthRequest,
    @Param("booking_id") booking_id: string,
    @Param("booking_item_id") booking_item_id: string,
  ) {
    const supabase = req.supabase;
    return await this.bookingItemsService.deleteBookingItem(
      supabase,
      booking_id,
      booking_item_id,
    );
  }

  @Patch(":booking_item_id")
  @Roles(["user", "requester", "storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async updateBookingItem(
    @Req() req: AuthRequest,
    @Param("booking_item_id") booking_item_id: string,
    @Body() updated_booking_item: BookingItemsUpdate,
  ) {
    const supabase = req.supabase;
    return await this.bookingItemsService.updateBookingItem(
      supabase,
      booking_item_id,
      updated_booking_item,
    );
  }
}
