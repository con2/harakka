import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { BookingItemsInsert } from "../booking_items/interfaces/booking-items.interfaces";
import {
  calculateAvailableQuantity,
  calculateDuration,
  generateBookingNumber,
  dayDiffFromToday,
} from "src/utils/booking.utils";
import { MailService } from "../mail/mail.service";
import { BookingMailType } from "../mail/interfaces/mail.interface";
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { Database } from "@common/supabase.types";
import {
  CancelBookingResponse,
  BookingItemRow,
  BookingRow,
  ValidBookingOrder,
} from "./types/booking.interface";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";
import { deriveOrgStatus } from "src/utils/booking.utils";
import { StorageLocationsService } from "../storage-locations/storage-locations.service";
import { RoleService } from "../role/role.service";
import { AuthRequest } from "@src/middleware/interfaces/auth-request.interface";
import { ApiResponse, ApiSingleResponse } from "@common/response.types";
import { handleSupabaseError } from "@src/utils/handleError.utils";
import { BookingPreview } from "@common/bookings/booking.types";
import { BookingItemsService } from "../booking_items/booking-items.service";
import { StorageItemRow } from "../storage-items/interfaces/storage-item.interface";
import { BookingWithOrgStatus } from "./types/booking.interface";

dayjs.extend(utc);
@Injectable()
export class BookingService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly mailService: MailService,
    private readonly locationsService: StorageLocationsService,
    private readonly roleService: RoleService,
    private readonly bookingItemsService: BookingItemsService,
  ) {}

  /**
   * Get bookings in an ordered list
   * Accessible by storage_manager, tenant_admin
   * @param supabase The Supabase client provided by the request.
   * @param org_id The organization ID to filter bookings by.
   * @param page The page number requested for pagination.
   * @param limit The number of rows to retrieve per page.
   * @param ascending Whether to sort bookings in ascending order (default: true).
   * @param order_by The column to order the bookings by (default: "booking_number").
   * @param searchquery (Optional) A string to filter bookings by.
   * @param status_filter (Optional) A filter for the booking status.
   *
   * @returns Matching bookings with pagination metadata.
   *
   */
  async getOrderedBookings(
    supabase: SupabaseClient,
    org_id: string,
    page: number,
    limit: number,
    ascending: boolean,
    order_by: ValidBookingOrder,
    searchquery?: string,
    status_filter?: string,
  ): Promise<ApiResponse<BookingPreview>> {
    const { from, to } = getPaginationRange(page, limit);

    const query = supabase
      .from("view_bookings_with_user_info")
      .select("*", { count: "exact" })
      .range(from, to)
      .order(order_by ?? "booking_number", { ascending: ascending });

    if (status_filter) query.eq("status", status_filter);

    // Match any field if there is a searchquery
    if (searchquery) {
      query.or(
        `booking_number.ilike.%${searchquery}%,` +
          `full_name.ilike.%${searchquery}%,` +
          `created_at_text.ilike.%${searchquery}%`,
      );
    }

    // Filter bookings by organization ID
    const itemsRes = await supabase
      .from("booking_items")
      .select("booking_id")
      .eq("provider_organization_id", org_id);
    if (itemsRes.error) handleSupabaseError(itemsRes.error);

    const bookingIds = Array.from(
      new Set(
        ((itemsRes.data || []) as BookingItemRow[]).map((r) => r.booking_id),
      ),
    );
    if (bookingIds.length > 0) {
      query.in("id", bookingIds);
    } else {
      // Force empty results if no matching bookings
      query.eq("id", "00000000-0000-0000-0000-000000000000");
    }

    const result = await query;

    // Attach derived organization status for each booking indicating whether all items for this org are confirmed
    if (result.data && result.data.length > 0) {
      const bookingIds = result.data
        .map((b) => b.id)
        .filter(Boolean) as string[];

      if (bookingIds.length > 0) {
        const itemsRes = await supabase
          .from("booking_items")
          .select("booking_id,status")
          .in("booking_id", bookingIds)
          .eq("provider_organization_id", org_id);
        if (itemsRes.error) handleSupabaseError(itemsRes.error);

        // Map booking_id to array of statuses for this org
        const statusMap = new Map<string, string[]>();
        (itemsRes.data || []).forEach((row) => {
          const r = row as { booking_id: string; status: string };
          const arr = statusMap.get(r.booking_id) || [];
          arr.push(r.status);
          statusMap.set(r.booking_id, arr);
        });

        // Attach org_status_for_active_org to each booking row
        (result.data as BookingPreview[]).forEach((b) => {
          const bid = b.id;
          const statuses = statusMap.get(bid) || [];
          (b as BookingWithOrgStatus).org_status_for_active_org =
            deriveOrgStatus(statuses);
        });
      }
    }
    const { error, count } = result;
    if (error) handleSupabaseError(error);

    const metadata = getPaginationMeta(count, page, limit);
    return {
      ...result,
      metadata,
    };
  }

  /**
   * Get bookings for a specific user by their ID, filtered by organization.
   *
   * This method is designed to fetch bookings for a specific user within the context of an organization.
   * It ensures that only bookings associated with the given user ID and organization ID are returned.
   *
   * @param req - The authenticated request object containing user and role details.
   * @param page - The page number for pagination (default: 1).
   * @param limit - The number of items per page for pagination (default: 10).
   * @param userId - The ID of the user whose bookings are to be retrieved.
   * @param activeOrgId - The organization ID to filter bookings by.
   *
   * @returns A paginated list of bookings for the specified user, filtered by organization.
   */
  async getUserBookings(
    req: AuthRequest,
    page: number,
    limit: number,
    userId: string,
    activeOrgId: string,
  ) {
    const { from, to } = getPaginationRange(page, limit);
    const supabase = req.supabase;

    // All bookings from the view
    const query = supabase
      .from("view_bookings_with_user_info")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    const bookingIdsResult = await supabase
      .from("booking_items")
      .select("booking_id")
      .eq("provider_organization_id", activeOrgId);

    if (bookingIdsResult.error) {
      throw new BadRequestException(
        "Could not fetch bookings for the organization",
      );
    }

    const bookingIds = bookingIdsResult.data.map((item) => item.booking_id);
    if (bookingIds.length > 0) {
      query.in("id", bookingIds);
    } else {
      return {
        data: [],
        count: 0,
        error: null,
        status: 200,
        statusText: "OK",
        metadata: getPaginationMeta(0, page, limit),
      };
    }

    const result = await query;
    const pagination = getPaginationMeta(result.count, page, limit);
    return { ...result, metadata: pagination };
  }

  /**
   * Get bookings for the authenticated user or their organization.
   * **user**: gets only the bookings created by the user.
   * **requester/storage_manager/tenant_admin**: gets all bookings associated with the user's organization.
   *
   * @param req - The authenticated request object containing user and role details.
   * @param page - The page number for pagination (default: 1).
   * @param limit - The number of items per page for pagination (default: 10).
   * @param userId - The ID of the authenticated user.
   * @param activeOrgId - The organization ID to filter bookings by.
   * @param activeRole - The role of the authenticated user (e.g., "user", "requester", "storage_manager", "tenant_admin").
   *
   * @returns A paginated list of bookings with metadata.
   */
  async getMyBookings(
    req: AuthRequest,
    page: number,
    limit: number,
    userId: string,
    activeOrgId: string,
    activeRole: string,
  ) {
    const { from, to } = getPaginationRange(page, limit);
    const supabase = req.supabase;

    const query = supabase
      .from("view_bookings_with_user_info")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (activeRole === "user") {
      // Regular users only see their own bookings
      query.eq("user_id", userId);
    } else if (
      activeRole === "requester" ||
      activeRole === "storage_manager" ||
      activeRole === "tenant_admin"
    ) {
      // Admins see all bookings for their organization
      const bookingIdsResult = await supabase
        .from("booking_items")
        .select("booking_id")
        .eq("provider_organization_id", activeOrgId);

      if (bookingIdsResult.error) {
        throw new BadRequestException(
          "Could not fetch bookings for the organization",
        );
      }

      const bookingIds = bookingIdsResult.data.map((item) => item.booking_id);
      if (bookingIds.length > 0) {
        query.in("id", bookingIds);
      } else {
        return {
          data: [],
          count: 0,
          error: null,
          status: 200,
          statusText: "OK",
          metadata: getPaginationMeta(0, page, limit),
        };
      }
    } else {
      throw new ForbiddenException("You do not have access to view bookings");
    }

    const result = await query;
    const pagination = getPaginationMeta(result.count, page, limit);
    return { ...result, metadata: pagination };
  }

  /**
   * Retrieve a specific booking by its ID.
   *
   * Accessible by roles: `tenant_admin`, `storage_manager`.
   *
   * @param supabase The Supabase client instance for database operations.
   * @param booking_id The unique ID of the booking to retrieve.
   * @param page The page number for pagination of booking items (default: 1).
   * @param limit The number of items per page for pagination (default: 10).
   * @param providerOrgId The organization ID to filter booking items by (optional).
   *
   * @returns A detailed booking object, including its items and metadata.
   */
  async getBookingByID(
    supabase: SupabaseClient,
    booking_id: string,
    page: number,
    limit: number,
    providerOrgId: string,
  ): Promise<
    ApiSingleResponse<
      BookingPreview & {
        booking_items: (import("../booking_items/interfaces/booking-items.interfaces").BookingItemsRow & {
          storage_items: Partial<StorageItemRow>;
        })[];
      }
    >
  > {
    const result: PostgrestSingleResponse<BookingPreview> = await supabase
      .from("view_bookings_with_user_info")
      .select(`*`)
      .eq("id", booking_id)
      .single();

    if (result.error) handleSupabaseError(result.error);

    const booking_items_result: ApiResponse<
      import("../booking_items/interfaces/booking-items.interfaces").BookingItemsRow & {
        storage_items: Partial<StorageItemRow>;
      }
    > = await this.bookingItemsService.getBookingItems(
      supabase,
      booking_id,
      page,
      limit,
      "translations",
      providerOrgId,
    );

    if (booking_items_result.error)
      handleSupabaseError(booking_items_result.error);

    // Attach org_status_for_active_org if providerOrgId is present
    let org_status_for_active_org: string | undefined = undefined;
    if (providerOrgId && result.data) {
      const itemsRes = await supabase
        .from("booking_items")
        .select("status")
        .eq("booking_id", booking_id)
        .eq("provider_organization_id", providerOrgId);
      if (!itemsRes.error && Array.isArray(itemsRes.data)) {
        const statuses = itemsRes.data.map((row) => row.status);
        org_status_for_active_org = deriveOrgStatus(statuses);
      }
    }
    // Spread result.data and allow extra property
    const bookingData: BookingPreview & {
      booking_items: (import("../booking_items/interfaces/booking-items.interfaces").BookingItemsRow & {
        storage_items: Partial<StorageItemRow>;
      })[];
      org_status_for_active_org?: string;
    } = {
      ...result.data,
      booking_items: booking_items_result.data,
    };
    if (org_status_for_active_org !== undefined) {
      bookingData.org_status_for_active_org = org_status_for_active_org;
    }
    return {
      ...result,
      data: bookingData,
      metadata: booking_items_result.metadata,
    };
  }

  async getBookingsCount(
    supabase: SupabaseClient,
    orgId?: string,
    activeRole?: string,
  ): Promise<ApiSingleResponse<number>> {
    // Super admin should always receive global count
    if (activeRole === "super_admin") {
      const result: PostgrestResponse<undefined> = await supabase
        .from("bookings")
        .select(undefined, { count: "exact" });

      if (result.error) handleSupabaseError(result.error);

      return {
        ...result,
        data: result.count ?? 0,
      };
    }

    // If orgId provided, count distinct booking_ids that have booking_items for that org
    if (orgId) {
      const res = await supabase
        .from("booking_items")
        .select("booking_id")
        .eq("provider_organization_id", orgId);

      if (res.error) handleSupabaseError(res.error);

      const ids = Array.from(
        new Set((res.data || []).map((r) => r.booking_id)),
      );
      return {
        data: ids.length,
        count: ids.length,
        error: null,
        status: 200,
        statusText: "OK",
      } as ApiSingleResponse<number>;
    }

    const result: PostgrestResponse<undefined> = await supabase
      .from("bookings")
      .select(undefined, { count: "exact" });

    if (result.error) handleSupabaseError(result.error);

    return {
      ...result,
      data: result.count ?? 0,
    };
  }

  // 3. create a Booking
  async createBooking(
    dto: CreateBookingDto,
    supabase: SupabaseClient<Database>,
    activeRole: { roleName: string; orgId: string },
  ) {
    const userId = dto.user_id;

    if (!userId) {
      throw new BadRequestException("No userId found: user_id is required");
    }

    // 3.0. Check if user has completed required profile information
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("full_name, phone")
      .eq("id", userId)
      .single();

    if (profileError || !userProfile) {
      throw new BadRequestException("User profile not found");
    }

    // Require full name for booking (phone is optional but recommended)
    if (!userProfile.full_name || userProfile.full_name.trim() === "") {
      // Use a specific error code that frontend can catch to show the modal
      const error = new BadRequestException({
        message: "Profile incomplete: Full name is required to create bookings",
        errorCode: "PROFILE_INCOMPLETE",
        missingFields: ["full_name"],
        hasPhone: !!(userProfile.phone && userProfile.phone.trim()),
      });
      throw error;
    }

    // Check for phone number and prepare warning message
    let warningMessage: string | null = null;
    if (!userProfile.phone || userProfile.phone.trim() === "") {
      warningMessage =
        "We recommend adding a phone number to your profile for easier communication about your bookings.";
    }

    for (const item of dto.items) {
      const { item_id, quantity, start_date, end_date } = item;

      const start = new Date(start_date);
      const diffDays = dayDiffFromToday(start);

      // Prevent past start times
      if (diffDays < 0) {
        throw new BadRequestException("start_date cannot be in the past");
      }

      // Warn for short notice (< 24h). dayDiffFromToday returns 0 for same-day future times.
      if (diffDays < 1) {
        const shortNoticeWarning =
          "Heads up: bookings made less than 24 hours in advance might not be approved in time.";

        // Combine warnings if both exist
        if (warningMessage) {
          warningMessage = `${warningMessage} ${shortNoticeWarning}`;
        } else {
          warningMessage = shortNoticeWarning;
        }
      }

      // 3.1. Check availability for requested date range
      const available = await calculateAvailableQuantity(
        supabase,
        item_id,
        start_date,
        end_date,
      );

      if (quantity > available.availableQuantity) {
        throw new BadRequestException(
          `Not enough virtual stock available for item ${item_id}`,
        );
      }

      // 3.2. Check physical stock (currently in storage)
      const { data: storageItem, error: itemError } = await supabase
        .from("storage_items")
        .select("available_quantity")
        .eq("id", item_id)
        .single();

      if (itemError) handleSupabaseError(itemError);

      if (!storageItem)
        throw new BadRequestException("Storage item data not found");

      const currentStock = storageItem.available_quantity ?? 0;
      if (quantity > currentStock) {
        throw new BadRequestException(
          `Not enough physical stock in storage for item ${item_id}`,
        );
      }
    }

    // 3.4. Create the booking
    // generate a unique booking number (check collisions in DB)
    let bookingNumber: string;
    try {
      bookingNumber = await generateBookingNumber(supabase);
    } catch (err) {
      console.error("Booking number generation error:", err);
      throw new BadRequestException(
        "Could not generate a unique booking number, please try again",
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        booking_number: bookingNumber,
        status: "pending",
      })
      .select()
      .single<BookingRow>();

    if (bookingError || !booking) {
      throw new BadRequestException("Could not create booking");
    }

    // 3.5. Create booking items using BookingItemsService
    for (const item of dto.items) {
      const start = new Date(item.start_date);
      const end = new Date(item.end_date);
      const totalDays = calculateDuration(start, end);

      // add loan period validation
      if (totalDays < 3) {
        throw new BadRequestException("Booking must be at least 3 days long");
      }

      if (totalDays > 35) {
        throw new BadRequestException("Booking cannot exceed 35 days");
      }

      // get location_id from storage_items
      const { data: storageItem, error: locationError } = await supabase
        .from("storage_items")
        .select("location_id, org_id")
        .eq("id", item.item_id)
        .single();

      if (locationError || !storageItem) {
        throw new BadRequestException(
          `Storage item data not found for item ${item.item_id}`,
        );
      }

      // Create booking item using service, automatically tracking the provider organization
      const bookingItemData: BookingItemsInsert = {
        booking_id: booking.id,
        item_id: item.item_id,
        location_id: storageItem.location_id,
        provider_organization_id: storageItem.org_id,
        quantity: item.quantity,
        start_date: item.start_date,
        end_date: item.end_date,
        total_days: totalDays,
        status: "pending",
      };

      // Use BookingItemsService instead of direct insert
      await this.bookingItemsService.createBookingItem(
        supabase,
        bookingItemData,
      );
    }

    // 3.6 notify user via centralized mail service
    await this.mailService.sendBookingMail(BookingMailType.Creation, {
      bookingId: booking.id,
      triggeredBy: userId,
    });

    // 3.7 Fetch the complete booking with items and translations using the view
    const { data: createdBookings, error: fetchError } = await supabase
      .from("view_bookings_with_details")
      .select("*")
      .eq("id", booking.id);

    if (fetchError || !createdBookings || createdBookings.length === 0) {
      throw new BadRequestException("Could not fetch created booking details");
    }

    // filtering to get active role
    const createdBooking =
      createdBookings.find(
        (b) =>
          b.role_name === activeRole.roleName &&
          b.requester_org_id === activeRole.orgId,
      ) || createdBookings[0];

    // attach role info to the response
    const bookingWithRole = {
      ...createdBooking,
      user_role_id: createdBooking.user_role_id,
      role_id: createdBooking.role_id,
      role_name: createdBooking.role_name, // "user" | "requester"
      requester_org_id: createdBooking.requester_org_id, // if requester
    };

    return warningMessage
      ? {
          message: "Booking created",
          booking: bookingWithRole,
          warning: warningMessage,
        }
      : {
          message: "Booking created",
          booking: bookingWithRole,
        };
  }

  // 4. confirm a Booking - no longer in use; replaced by confirmBookingItemsForOrg
  async confirmBooking(
    bookingId: string,
    userId: string,
    supabase: SupabaseClient,
  ) {
    // 4.1 check if already confirmed
    const { data: booking } = await supabase
      .from("bookings")
      .select("status, user_id")
      .eq("id", bookingId)
      .single();

    if (!booking) throw new BadRequestException("Booking not found");

    // prevent re-confirmation
    if (booking.status === "confirmed") {
      throw new BadRequestException("Booking is already confirmed");
    }

    // 4.2 Get all the booking items
    const { data: items, error: itemsError } = await supabase
      .from("booking_items")
      .select("item_id, quantity, start_date, item_id, quantity")
      .eq("booking_id", bookingId);

    if (itemsError) {
      throw new BadRequestException("Could not load booking items");
    }

    // 4.3 check availability of the items
    for (const item of items) {
      // get availability of item
      const { data: storageItem, error: storageItemError } = await supabase
        .from("storage_items")
        .select("available_quantity")
        .eq("id", item.item_id)
        .single();

      if (storageItemError || !storageItem) {
        throw new BadRequestException("Could not fetch storage item details");
      }

      // check if stock is enough
      if (storageItem.available_quantity < item.quantity) {
        throw new BadRequestException(
          `Not enough available quantity for item ${item.item_id}`,
        );
      }
    }

    // 4.4 Change the booking status to 'confirmed'
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);

    if (updateError) {
      throw new BadRequestException("Could not confirm booking");
    }

    // Change the booking items' status to 'confirmed'
    const { error: itemsUpdateError } = await supabase
      .from("booking_items")
      .update({ status: "confirmed" })
      .eq("booking_id", bookingId);

    if (itemsUpdateError) {
      throw new BadRequestException("Could not confirm booking items");
    }

    // 4.6 notify user via centralized mail service
    await this.mailService.sendBookingMail(BookingMailType.Confirmation, {
      bookingId,
      triggeredBy: userId,
    });
    return { message: "Booking confirmed" };
  }

  /**
   * Confirm all booking_items owned by a provider organization for a given booking.
   * If all items in the booking become confirmed, the parent booking is set to confirmed.
   */
  async confirmBookingItemsForOrg(
    bookingId: string,
    providerOrgId: string,
    req: AuthRequest,
    itemIds?: string[],
  ) {
    const supabase = req.supabase;
    if (itemIds && itemIds.length > 0) {
      const { data: statusCheck } = await supabase
        .from("booking_items")
        .select("status")
        .eq("booking_id", bookingId)
        .eq("provider_organization_id", providerOrgId)
        .in("id", itemIds);
      const hasNonPending = statusCheck
        ?.map((i) => i.status)
        .some((status) => status !== "pending");
      if (hasNonPending)
        throw new BadRequestException(
          "Cannot confirm items which are not pending",
        );
    }

    // Permission: must be admin in that organization (or global admin)
    const isAdminOfOrg = this.roleService.hasAnyRole(
      req,
      ["tenant_admin", "storage_manager"],
      providerOrgId,
    );
    if (!isAdminOfOrg) {
      throw new ForbiddenException(
        "Not allowed to confirm items for this organization",
      );
    }

    // Confirm items: either a selected subset (itemIds) or all items for the org; only pending can be confirmed
    const updateQuery = supabase
      .from("booking_items")
      .update({ status: "confirmed" })
      .eq("booking_id", bookingId)
      .eq("provider_organization_id", providerOrgId)
      .eq("status", "pending");
    if (itemIds && itemIds.length > 0) {
      updateQuery.in("id", itemIds);
    }
    const { error: updateErr } = await updateQuery;
    if (updateErr) {
      throw new BadRequestException("Failed to confirm booking items");
    }

    // Check booking roll-up based on all items after update
    const { data: items, error: itemsErr } = await supabase
      .from("booking_items")
      .select("status")
      .eq("booking_id", bookingId);
    if (itemsErr || !items) {
      throw new BadRequestException("Failed to fetch booking items");
    }

    const allRejected =
      items.length > 0 && items.every((it) => it.status === "rejected");
    const noPending =
      items.length > 0 && items.every((it) => it.status !== "pending");

    if (allRejected) {
      const { error: bookingUpdateErr } = await supabase
        .from("bookings")
        .update({ status: "rejected" })
        .eq("id", bookingId);
      if (bookingUpdateErr) {
        throw new BadRequestException(
          "Failed to reject booking after all items rejected",
        );
      }
    } else if (noPending) {
      const { error: bookingUpdateErr } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);
      if (bookingUpdateErr) {
        throw new BadRequestException(
          "Failed to confirm booking after all items resolved",
        );
      }
    }

    return {
      message: noPending
        ? "Items confirmed and booking status updated"
        : "Items confirmed for organization",
    };
  }

  /**
   * Reject booking_items owned by a provider organization for a given booking.
   * The parent booking is set to 'rejected' only when ALL booking items in the
   * parent booking have status 'rejected'. Otherwise the booking status is
   * rolled up to 'confirmed' if there are no pending items, or left unchanged.
   */
  async rejectBookingItemsForOrg(
    bookingId: string,
    providerOrgId: string,
    req: AuthRequest,
    itemIds?: string[],
  ) {
    const supabase = req.supabase;
    if (itemIds && itemIds.length > 0) {
      const { data: statusCheck } = await supabase
        .from("booking_items")
        .select("status")
        .eq("booking_id", bookingId)
        .eq("provider_organization_id", providerOrgId)
        .in("id", itemIds);
      const hasNonPending = statusCheck
        ?.map((i) => i.status)
        .some((status) => status !== "pending");
      if (hasNonPending)
        throw new BadRequestException(
          "Cannot reject items which are not pending",
        );
    }

    const isAdminOfOrg = this.roleService.hasAnyRole(
      req,
      ["tenant_admin", "storage_manager"],
      providerOrgId,
    );
    if (!isAdminOfOrg) {
      throw new ForbiddenException(
        "Not allowed to reject items for this organization",
      );
    }

    // Only update status to 'rejected' for selected items (pending/confirmed)
    const updateQuery = supabase
      .from("booking_items")
      .update({ status: "rejected" })
      .eq("booking_id", bookingId)
      .eq("provider_organization_id", providerOrgId)
      .in("status", ["pending"]);
    if (itemIds && itemIds.length > 0) updateQuery.in("id", itemIds);

    const { error: updateErr } = await updateQuery;
    if (updateErr) {
      handleSupabaseError(updateErr);
    }

    // Roll-up booking status based on all items
    const { data: items, error: itemsErr } = await supabase
      .from("booking_items")
      .select("status")
      .eq("booking_id", bookingId);
    if (itemsErr) {
      handleSupabaseError(itemsErr);
    }
    if (!items) {
      throw new BadRequestException("Failed to fetch booking items");
    }

    const allRejected =
      items.length > 0 && items.every((it) => it.status === "rejected");
    const noPending =
      items.length > 0 && items.every((it) => it.status !== "pending");

    if (allRejected) {
      const { error: bookingUpdateErr } = await supabase
        .from("bookings")
        .update({ status: "rejected" })
        .eq("id", bookingId);
      if (bookingUpdateErr) {
        throw new BadRequestException("Failed to set booking to rejected");
      }
    } else if (noPending) {
      const { error: bookingUpdateErr } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);
      if (bookingUpdateErr) {
        throw new BadRequestException("Failed to set booking to confirmed");
      }
    }

    return {
      message: "Items rejected; booking status rolled up where applicable",
    };
  }

  /**
   * Bulk update selected booking_items to a given status for a provider org.
   * - status 'confirmed': only pending items are updated
   * - status 'cancelled': pending and confirmed items are updated
   * After the update, rolls up the parent booking status:
   *   - If any item is 'cancelled' => booking 'rejected'
   *   - Else if all items are 'confirmed' => booking 'confirmed'
   *   - Else booking remains 'pending'
   */
  // updateBookingItemsStatusForOrg removed; use confirm/reject methods with optional itemIds instead

  // 5. update a Booking (tenant_admin/storage_manager OR Owner)
  async updateBooking(
    booking_id: string,
    userId: string,
    dto: UpdateBookingDto,
    req: AuthRequest,
  ) {
    const supabase = req.supabase;

    let warningMessage: string | null = null;

    // 5.1 check the booking
    const { data: booking } = await supabase
      .from("bookings")
      .select("status, user_id, booking_number")
      .eq("id", booking_id)
      .single();

    if (!booking) throw new BadRequestException("Booking not found");

    // 5.2. check permissions using RoleService
    const isElevated = this.roleService.hasAnyRole(req, [
      "tenant_admin",
      "storage_manager",
    ]);

    const isOwner = booking.user_id === userId;

    if (!isElevated && !isOwner) {
      throw new ForbiddenException("Not allowed to update this booking");
    }

    // 5.4 Status check (users are restricted)
    if (booking.status !== "pending") {
      throw new ForbiddenException(
        "Your booking has been confirmed. You can't update it.",
      );
    }

    // 5.3. Delete existing items from booking_items to avoid douplicates
    await supabase.from("booking_items").delete().eq("booking_id", booking_id);

    // 5.4. insert updated items with validations and availability checks
    for (const item of dto.items) {
      const { item_id, quantity, start_date, end_date } = item;

      const start = new Date(start_date);

      const diffDays = dayDiffFromToday(start);

      if (diffDays < 0) {
        throw new BadRequestException("start_date cannot be in the past");
      }

      if (diffDays < 1) {
        warningMessage =
          "Heads up: bookings made less than 24 hours in advance might not be confirmd in time.";
      }

      const totalDays = calculateDuration(
        new Date(start_date),
        new Date(end_date),
      );

      // add loan period validation if needed
      if (totalDays < 3) {
        throw new BadRequestException("Booking must be at least 3 days long");
      }

      if (totalDays > 35) {
        throw new BadRequestException("Booking cannot exceed 35 days");
      }

      // 5.5. Check virtual availability for the time range
      const available = await calculateAvailableQuantity(
        supabase,
        item_id,
        start_date,
        end_date,
      );

      if (quantity > available.availableQuantity) {
        throw new BadRequestException(
          `Not enough virtual stock available for item ${item_id}`,
        );
      }

      // Check physical stock (currently in storage)
      const { data: storageCountRow, error: itemError } = await supabase
        .from("storage_items")
        .select("available_quantity")
        .eq("id", item_id)
        .single();

      if (itemError || !storageCountRow) {
        throw new BadRequestException("Storage item data not found");
      }

      const currentStock = storageCountRow.available_quantity ?? 0;
      if (quantity > currentStock) {
        throw new BadRequestException(
          `Not enough physical stock in storage for item ${item_id}`,
        );
      }

      // 5.6. Fetch location_id and org_id (provider_organization_id)
      const { data: storageItem, error: storageError } = await supabase
        .from("storage_items")
        .select("location_id, org_id")
        .eq("id", item_id)
        .single();

      if (storageError || !storageItem) {
        throw new BadRequestException(
          `Could not find storage item for item ${item_id}`,
        );
      }

      // Create booking item using service, automatically tracking the provider organization
      await this.bookingItemsService.createBookingItem(supabase, {
        booking_id: booking_id,
        item_id: item.item_id,
        location_id: storageItem.location_id,
        provider_organization_id: storageItem.org_id,
        quantity: item.quantity,
        start_date: item.start_date,
        end_date: item.end_date,
        total_days: totalDays,
        status: "pending",
      });
    }

    // 5.8 notify user via centralized mail service
    await this.mailService.sendBookingMail(BookingMailType.Update, {
      bookingId: booking_id,
      triggeredBy: userId,
    });

    const { data: updatedBooking, error: bookingError } = await supabase
      .from("view_bookings_with_details")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (bookingError || !updatedBooking) {
      throw new BadRequestException("Could not fetch updated booking details");
    }

    return warningMessage
      ? {
          message: "Booking updated",
          booking: updatedBooking,
          warning: warningMessage,
        }
      : { message: "Booking updated", booking: updatedBooking };
  }

  // 6. reject a Booking - no longer in use; replaced by rejectBookingItemsForOrg
  async rejectBooking(bookingId: string, userId: string, req: AuthRequest) {
    const supabase = req.supabase;
    // check if already rejected
    const { data: booking } = await supabase
      .from("bookings")
      .select("status, user_id, booking_number")
      .eq("id", bookingId)
      .single();

    if (!booking) throw new BadRequestException("Booking not found");

    // prevent re-rejection
    if (booking.status === "rejected") {
      throw new BadRequestException("Booking is already rejected");
    }

    // 6.1 user role check using RoleService
    const isAdmin = this.roleService.hasAnyRole(req, [
      "super_admin",
      "tenant_admin",
      "storage_manager",
    ]);

    if (!isAdmin) {
      throw new ForbiddenException("Only admins can reject bookings");
    }

    // fetch booking items for email
    const { data: bookingItems, error: bookingItemsError } = await supabase
      .from("booking_items")
      .select("item_id, quantity, start_date, end_date")
      .eq("booking_id", bookingId);

    if (bookingItemsError || !bookingItems) {
      throw new BadRequestException(
        "Could not fetch booking items for rejection",
      );
    }

    // 6.2 set booking_item status to cancelled
    const { error: itemUpdateError } = await supabase
      .from("booking_items")
      .update({ status: "cancelled" }) // Trigger watches for change
      .eq("booking_id", bookingId);

    if (itemUpdateError) {
      console.error("Booking items update error:", itemUpdateError);
      throw new BadRequestException(
        "Could not update booking items for cancellation",
      );
    }

    // 6.3 set booking status to rejected
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "rejected" })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Failed to reject booking:", updateError);
      throw new BadRequestException("Could not reject the booking");
    }

    // 6.6 notify via centralized mail service
    await this.mailService.sendBookingMail(BookingMailType.Rejection, {
      bookingId,
      triggeredBy: userId,
    });

    return { message: "Booking rejected" };
  }

  // 7. cancel a Booking (User if not confirmed, Admins always)
  async cancelBooking(
    bookingId: string,
    userId: string,
    req: AuthRequest,
  ): Promise<CancelBookingResponse> {
    const supabase = req.supabase;
    // 7.1 check booking status
    const { data: booking } = await supabase
      .from("bookings")
      .select("status, user_id, booking_number")
      .eq("id", bookingId)
      .single();
    if (!booking) throw new BadRequestException("Booking not found");

    // prevent re-cancellation: booking already in final 'cancelled' state
    const finalStates = new Set(["cancelled"]);

    if (finalStates.has(booking.status)) {
      throw new BadRequestException(
        "Booking has already been " + booking.status,
      );
    }

    // 7.2 permissions check using RoleService
    const isAdmin = this.roleService.hasAnyRole(req, [
      "tenant_admin",
      "storage_manager",
    ]);
    const isOwner = booking.user_id === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException("You can only cancel your own bookings");
    }

    if (!isAdmin && booking.status === "confirmed") {
      throw new ForbiddenException(
        "You can't cancel a booking that has already been confirmed",
      );
    }

    // 7.5 Cancel all related booking_items
    const { error: itemUpdateError } = await supabase
      .from("booking_items")
      .update({ status: "cancelled" })
      .eq("booking_id", bookingId);

    if (itemUpdateError) {
      console.error("Booking items update error:", itemUpdateError);
      throw new BadRequestException(
        "Could not update booking items for cancellation",
      );
    }

    // 7.4 update booking_items
    const { error: bookingUpdateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (bookingUpdateError) {
      // Log supabase error details to help debugging (RLS/policy/constraint issues)
      console.error("Failed to cancel booking", {
        bookingId,
        error: bookingUpdateError,
      });
      throw new BadRequestException("Could not cancel the booking");
    }

    // 7.6 Fetch booking items for email details
    const { data: bookingItems, error: bookingItemsError } = await supabase
      .from("booking_items")
      .select("item_id, quantity, start_date, end_date")
      .eq("booking_id", bookingId)
      .overrideTypes<BookingItemRow[]>();

    if (bookingItemsError || !bookingItems) {
      throw new BadRequestException(
        "Could not fetch booking items for cancellation",
      );
    }

    // notify via centralized mail service
    await this.mailService.sendBookingMail(BookingMailType.Cancellation, {
      bookingId,
      triggeredBy: userId,
    });

    return {
      message: `Booking cancelled by ${isAdmin ? "admin" : "user"}`,
      bookingId,
      cancelledBy: isAdmin ? "admin" : "user",
      items: bookingItems.map((item) => ({
        item_id: item.item_id,
        quantity: item.quantity,
        start_date: item.start_date,
        end_date: item.end_date,
      })),
    };
  }

  // 8. delete a Booking and mark it as deleted
  async deleteBooking(bookingId: string, userId: string, req: AuthRequest) {
    const supabase = req.supabase;
    // 8.1 check booking in database
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("status, user_id, booking_number")
      .eq("id", bookingId)
      .single()
      .overrideTypes<BookingRow>();

    if (bookingError || !booking)
      throw new BadRequestException("Booking not found");

    // prevent re-deletion
    //if (booking.status === "deleted") {
    //  throw new BadRequestException("Booking is already deleted");
    //}

    // 8.2 check user role using RoleService
    const isAdmin = this.roleService.hasAnyRole(req, [
      "tenant_admin",
      "storage_manager",
    ]);

    if (!isAdmin) {
      throw new ForbiddenException(
        "You are not allowed to delete this booking",
      );
    }

    // 8.3 cancel all related booking_items to restore virtual stock
    const { error: itemUpdateError } = await supabase
      .from("booking_items")
      .update({ status: "cancelled" })
      .eq("booking_id", bookingId);

    if (itemUpdateError) {
      console.error("Booking items update error:", itemUpdateError);
      throw new BadRequestException("Could not cancel related booking items");
    }

    // 8.4 fetch booking_items for email
    const { data: bookingItems, error: bookingItemsError } = await supabase
      .from("booking_items")
      .select("item_id, quantity, start_date, end_date")
      .eq("booking_id", bookingId);

    if (bookingItemsError || !bookingItems) {
      throw new BadRequestException("Could not fetch booking items for email");
    }

    // 8.5 Soft-delete the booking (update only)
    const { error: deleteError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
      })
      .eq("id", bookingId);

    if (deleteError) {
      throw new BadRequestException("Could not mark booking as deleted");
    }

    // 8.6 send notification email user and admin
    await this.mailService.sendBookingMail(BookingMailType.Cancellation, {
      bookingId,
      triggeredBy: userId,
    });

    return {
      message: "Booking deleted",
    };
  }

  /**
   *
   * @param bookingId
   * @param orgId
   * @param supabase
   * @returns
   */
  async returnItems(
    req: AuthRequest,
    bookingId: string,
    orgId: string,
    itemIds?: string[],
  ) {
    const supabase = req.supabase;
    const userId = req.user.id;
    if (itemIds) {
      const selectQuery = supabase
        .from("booking_items")
        .select("status")
        .eq("booking_id", bookingId)
        .eq("provider_organization_id", orgId)
        .in("id", itemIds);
      const { data: selectData, error } = await selectQuery;

      if (error) handleSupabaseError(error);
      const unconfirmed = selectData.filter((r) => r.status !== "picked_up");
      if (unconfirmed.length > 0)
        throw new BadRequestException(
          `Cannot return items which are not picked up`,
        );
    }

    const updateQuery = supabase
      .from("booking_items")
      .update({ status: "returned" })
      .eq("status", "picked_up")
      .eq("booking_id", bookingId)
      .eq("provider_organization_id", orgId);
    if (itemIds && itemIds.length > 0) updateQuery.in("id", itemIds);

    const { error: updateError } = await updateQuery;
    if (updateError) handleSupabaseError(updateError);

    const { data: bookingStatus } = await supabase
      .from("booking_items")
      .select("status")
      .eq("booking_id", bookingId);

    // Mark parent booking as "completed" if all parts have been acted upon (booking_item.status is either "cancelled", "rejected", "returned")
    const isNotCompleted = ["confirmed", "pending", "picked_up"];
    if (bookingStatus?.every((part) => !isNotCompleted.includes(part.status))) {
      await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", bookingId);
    }

    // notify via centralized mail service
    await this.mailService.sendBookingMail(BookingMailType.ItemsReturned, {
      bookingId,
      triggeredBy: userId,
    });

    return { message: "Items returned successfully" };
  }

  /**
   * Mark items as picked up
   * @param supabase An authorized supabase client
   * @param bookingId ID of booking which to confirm pick-up
   * @param orgId Org ID of which to confirm booking portion
   * @param itemIds Optional Item IDs to mark as picked up. If not provided, ALL confirmed items are marked as picked-up from booking.
   */
  async confirmPickup(
    supabase: SupabaseClient,
    bookingId: string,
    orgId: string,
    itemIds?: string[],
  ) {
    if (itemIds && itemIds.length > 0) {
      const selectQuery = supabase
        .from("booking_items")
        .select("status")
        .eq("booking_id", bookingId)
        .eq("provider_organization_id", orgId)
        .in("id", itemIds);
      const { data: selectData, error } = await selectQuery;

      if (error) handleSupabaseError(error);
      const unconfirmed = selectData.filter((r) => r.status !== "confirmed");
      if (unconfirmed.length > 0)
        throw new BadRequestException(
          `Cannot pick-up items which are not confirmed`,
        );
    }

    const updateQuery = supabase
      .from("booking_items")
      .update({ status: "picked_up" })
      .eq("booking_id", bookingId)
      .eq("provider_organization_id", orgId)
      .eq("status", "confirmed");
    if (itemIds && itemIds.length > 0) updateQuery.in("id", itemIds);
    const { error: itemsUpdateError } = await updateQuery;
    if (itemsUpdateError) handleSupabaseError(itemsUpdateError);

    const { data: bookingDetails } = await supabase
      .from("booking_items")
      .select("status")
      .eq("booking_id", bookingId);

    if (
      bookingDetails?.every((org_booking) => org_booking.status === "picked_up")
    ) {
      const { error: bookingUpdateError } = await supabase
        .from("bookings")
        .update({ status: "picked_up" })
        .eq("id", bookingId);

      if (bookingUpdateError) handleSupabaseError(bookingUpdateError);
    }

    // look up the booking owner so we can tag who triggered the mail
    const { data: bookingRow } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("id", bookingId)
      .single<BookingRow>();

    const triggeredBy = bookingRow?.user_id ?? "system";

    // notify via centralized mail service
    await this.mailService.sendBookingMail(BookingMailType.ItemsPickedUp, {
      bookingId,
      triggeredBy,
    });

    return {
      message: `Pickup confirmed for booking ${bookingId}`,
    };
  }

  /**
   * Mark items as cancelled from a booking.
   * Meaning they will not be picked up
   * @param supabase An authorized supabase client
   * @param bookingId ID of booking which to cancel items from
   * @param orgId Org ID of which to cancel items from
   * @param itemIds item IDs. Optiona. Items which to cancel from the booking. If omitted, ALL booking items are cancelled
   */
  async cancelBookingItem(
    supabase: SupabaseClient,
    bookingId: string,
    orgId: string,
    itemIds?: string[],
  ) {
    const selectQuery = supabase
      .from("booking_items")
      .select("status")
      .eq("booking_id", bookingId)
      .eq("provider_organization_id", orgId);
    if (itemIds && itemIds.length > 0) selectQuery.in("id", itemIds);
    const { data: selectData } = await selectQuery;

    // Throw error if any item is already picked up
    const statuses = selectData?.map((i) => i.status);
    if (statuses?.includes("picked_up"))
      throw new BadRequestException("Cannot cancel picked up items");

    const updateQuery = supabase
      .from("booking_items")
      .update({ status: "cancelled" })
      .eq("booking_id", bookingId)
      .eq("provider_organization_id", orgId)
      .eq("status", "confirmed");

    if (itemIds && itemIds.length > 0) updateQuery.in("id", itemIds);
    const { error: itemsUpdateError } = await updateQuery;
    if (itemsUpdateError) handleSupabaseError(itemsUpdateError);

    return {
      message: `Items cancelled for booking ${bookingId}`,
    };
  }

  // 12. virtual number of items for a specific date
  async getAvailableQuantityForDate(
    itemId: string,
    startdate: string,
    enddate: string,
  ) {
    const supabase = this.supabaseService.getServiceClient();

    if (!itemId || !startdate) {
      throw new BadRequestException("item_id and date are mandatory");
    }

    const num_available = await calculateAvailableQuantity(
      supabase,
      itemId,
      startdate,
      enddate,
    );

    return num_available ?? 0;
  }
}
