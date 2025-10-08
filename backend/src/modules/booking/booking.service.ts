import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
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
  BookingItemInsert,
  OverdueRow,
  BookingStatus,
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

dayjs.extend(utc);
@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly mailService: MailService,
    private readonly locationsService: StorageLocationsService,
    private readonly roleService: RoleService,
    private readonly bookingItemsService: BookingItemsService,
  ) {}

  /**
   * List overdue bookings visible to the current user (scoped by RLS).
   * Uses the `view_bookings_overdue` view which applies Europe/Helsinki day boundaries.
   */
  async getOverdueBookings(req: AuthRequest, page: number, limit: number) {
    const { from, to } = getPaginationRange(page, limit);
    const supabase = req.supabase;

    const { data, error, count } = await supabase
      .from("view_bookings_overdue")
      .select(
        "booking_id, booking_number, user_id, full_name, user_email, earliest_due_date, days_overdue",
        { count: "exact" },
      )
      .order("days_overdue", { ascending: false })
      .range(from, to);

    if (error) handleSupabaseError(error);

    const metadata = getPaginationMeta(count ?? 0, page, limit);
    return {
      data: (data ?? []) as OverdueRow[],
      count: count ?? 0,
      error: null,
      status: 200,
      statusText: "OK",
      metadata,
    };
  }

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
    // First, get all bookings that have items from the specified organization
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

    if (bookingIds.length === 0) {
      return {
        data: [],
        count: 0,
        error: null,
        status: 200,
        statusText: "OK",
        metadata: getPaginationMeta(0, page, limit),
      };
    }

    // Get all bookings from the organization and calculate their org-specific status
    const allBookingsQuery = supabase
      .from("view_bookings_with_user_info")
      .select("*")
      .in("id", bookingIds);

    if (searchquery) {
      allBookingsQuery.or(
        `booking_number.ilike.%${searchquery}%,` +
          `full_name.ilike.%${searchquery}%,` +
          `created_at_text.ilike.%${searchquery}%`,
      );
    }

    const allBookingsResult = await allBookingsQuery;
    if (allBookingsResult.error) handleSupabaseError(allBookingsResult.error);

    let bookingsWithOrgStatus: (BookingPreview & {
      org_status_for_active_org?: string;
      start_date?: string;
    })[] = [];

    // Calculate org-specific status for each booking
    if (allBookingsResult.data && allBookingsResult.data.length > 0) {
      const availableBookingIds = allBookingsResult.data
        .map((b) => b.id)
        .filter(Boolean) as string[];

      if (availableBookingIds.length > 0) {
        const orgItemsRes = await supabase
          .from("booking_items")
          .select("booking_id,status,start_date")
          .in("booking_id", availableBookingIds)
          .eq("provider_organization_id", org_id);
        if (orgItemsRes.error) handleSupabaseError(orgItemsRes.error);

        // Map booking_id to array of statuses for this org
        const statusMap = new Map<string, string[]>();
        const startDateMap = new Map<string, string>();
        (orgItemsRes.data || []).forEach((row) => {
          const r = row as {
            booking_id: string;
            status: string;
            start_date: string;
          };
          const arr = statusMap.get(r.booking_id) || [];
          arr.push(r.status);
          statusMap.set(r.booking_id, arr);

          // Store the start_date (all items in a booking have the same date range)
          if (!startDateMap.has(r.booking_id)) {
            startDateMap.set(r.booking_id, r.start_date);
          }
        });

        // Attach org_status_for_active_org and start_date to each booking row
        bookingsWithOrgStatus = (
          allBookingsResult.data as BookingPreview[]
        ).map((b) => {
          const bid = b.id;
          const statuses = statusMap.get(bid) || [];
          const orgStatus = deriveOrgStatus(statuses);
          const startDate = startDateMap.get(bid);
          return {
            ...b,
            org_status_for_active_org: orgStatus,
            start_date: startDate,
          };
        });
      }
    }

    // Apply status filter based on org-specific status
    if (status_filter) {
      bookingsWithOrgStatus = bookingsWithOrgStatus.filter(
        (booking) => booking.org_status_for_active_org === status_filter,
      );
    }

    // Filter out past bookings when ordering by start_date (upcoming bookings only)
    if (order_by === "start_date") {
      const today = dayjs().utc().startOf("day").toISOString();
      bookingsWithOrgStatus = bookingsWithOrgStatus.filter((booking) => {
        if (!booking.start_date) return false;
        const bookingDate = dayjs(booking.start_date)
          .utc()
          .startOf("day")
          .toISOString();
        return bookingDate >= today;
      });
    }

    // Sort the filtered results
    bookingsWithOrgStatus.sort((a, b) => {
      const aValue = a[order_by as keyof typeof a];
      const bValue = b[order_by as keyof typeof b];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return ascending ? 1 : -1;
      if (bValue === undefined) return ascending ? -1 : 1;

      if (aValue < bValue) return ascending ? -1 : 1;
      if (aValue > bValue) return ascending ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const totalCount = bookingsWithOrgStatus.length;
    const { from, to } = getPaginationRange(page, limit);
    const paginatedData = bookingsWithOrgStatus.slice(from, to + 1);

    const metadata = getPaginationMeta(totalCount, page, limit);
    return {
      data: paginatedData,
      count: totalCount,
      error: null,
      status: 200,
      statusText: "OK",
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
    activeOrgId: string,
  ) {
    const { from, to } = getPaginationRange(page, limit);
    const supabase = req.supabase;
    const userId = req.user.id;

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

  async getMyBookings(
    req: AuthRequest,
    page: number,
    limit: number,
    userId: string,
    status_filter?: BookingStatus | "all",
    searchquery?: string,
  ) {
    const { supabase } = req;
    const { from, to } = getPaginationRange(page, limit);

    const baseQuery = supabase
      .from("view_bookings_with_user_info")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to)
      .eq("user_id", userId)
      .is("booked_by_org", null);

    // Optional filters
    if (status_filter && status_filter !== "all") {
      const narrowed = status_filter;
      baseQuery.eq("status", narrowed);
    }
    if (searchquery) {
      baseQuery.or(
        `booking_number.ilike.%${searchquery}%,` +
          `full_name.ilike.%${searchquery}%,` +
          `created_at_text.ilike.%${searchquery}%`,
      );
    }
    const bookingItemsQuery = supabase
      .from("booking_items")
      .select(
        "booking_id, status, self_pickup, location_id, provider_organization_id, organizations(name), storage_locations (name)",
      );

    const bookingItemsResult = await bookingItemsQuery;
    if (bookingItemsResult.error) handleSupabaseError(bookingItemsResult.error);
    const result = await baseQuery;
    if (result.error) handleSupabaseError(result.error);

    const mappedResult = result.data.map((booking) => {
      const bi = bookingItemsResult.data.filter(
        (data) => data.booking_id === booking.id,
      );

      const org_booking_status = deriveOrgStatus(bi.map((s) => s.status));

      // Group items by organization id
      const orgMap = new Map();
      bi.forEach((item) => {
        const orgId = item.provider_organization_id;
        if (!orgMap.has(orgId)) {
          orgMap.set(orgId, {
            id: orgId,
            name: item.organizations?.name,
            org_booking_status,
            locations: new Map(), // nested map for locations
          });
        }

        const orgEntry = orgMap.get(orgId);

        // Deduplicate locations by location_id
        if (!orgEntry.locations.has(item.location_id)) {
          orgEntry.locations.set(item.location_id, {
            id: item.location_id,
            name: item.storage_locations.name,
            self_pickup: item.self_pickup,
            pickup_status: item.status,
          });
        }
      });

      // Convert maps to arrays
      const orgs = Array.from(orgMap.values()).map((org) => ({
        ...org,
        locations: Array.from(org.locations.values()),
      }));

      return {
        ...booking,
        orgs,
      };
    });

    const pagination = getPaginationMeta(result.count, page, limit);
    return {
      ...result,
      data: mappedResult,
      metadata: pagination,
    };
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
  async getOrgBookings(
    req: AuthRequest,
    page: number,
    limit: number,
    userId: string,
    activeOrgId: string,
    activeRole: string,
    status_filter?: BookingStatus | "all",
    searchquery?: string,
  ) {
    const { from, to } = getPaginationRange(page, limit);
    const supabase = req.supabase;
    const BOOKED_BY_ORG_ROLES = [
      "tenant_admin",
      "storage_manager",
      "requester",
    ];
    const isRequesterRole = BOOKED_BY_ORG_ROLES.includes(activeRole);

    if (!isRequesterRole)
      throw new BadRequestException(
        "Organization bookings can only be retrieved by an admin role",
      );

    const baseQuery = supabase
      .from("view_bookings_with_user_info")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to)
      .eq("booked_by_org", activeOrgId);

    // Optional filters
    if (status_filter && status_filter !== "all") {
      const narrowed = status_filter;
      baseQuery.eq("status", narrowed);
    }
    if (searchquery) {
      baseQuery.or(
        `booking_number.ilike.%${searchquery}%,` +
          `full_name.ilike.%${searchquery}%,` +
          `created_at_text.ilike.%${searchquery}%`,
      );
    }

    const bookingItemsQuery = supabase
      .from("booking_items")
      .select(
        "booking_id, status, self_pickup, location_id, provider_organization_id, organizations(name), storage_locations (name)",
      );

    const bookingItemsResult = await bookingItemsQuery;
    if (bookingItemsResult.error) handleSupabaseError(bookingItemsResult.error);

    const result = await baseQuery;
    if (result.error) handleSupabaseError(result.error);

    const mappedResult = result.data.map((booking) => {
      const bi = bookingItemsResult.data.filter(
        (data) => data.booking_id === booking.id,
      );

      const org_booking_status = deriveOrgStatus(bi.map((s) => s.status));

      // Group items by organization id
      const orgMap = new Map();
      bi.forEach((item) => {
        const orgId = item.provider_organization_id;
        if (!orgMap.has(orgId)) {
          orgMap.set(orgId, {
            id: orgId,
            name: item.organizations?.name,
            org_booking_status,
            locations: new Map(), // nested map for locations
          });
        }

        const orgEntry = orgMap.get(orgId);

        // Deduplicate locations by location_id
        if (!orgEntry.locations.has(item.location_id)) {
          orgEntry.locations.set(item.location_id, {
            id: item.location_id,
            name: item.storage_locations.name,
            self_pickup: item.self_pickup,
            pickup_status: item.status,
          });
        }
      });

      // Convert maps to arrays
      const orgs = Array.from(orgMap.values()).map((org) => ({
        ...org,
        locations: Array.from(org.locations.values()),
      }));

      return {
        ...booking,
        orgs,
      };
    });

    const pagination = getPaginationMeta(result.count, page, limit);
    return {
      ...result,
      data: mappedResult,
      metadata: pagination,
    };
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
    providerOrgId?: string,
  ): Promise<
    ApiSingleResponse<
      BookingPreview & {
        booking_items: (import("../booking_items/interfaces/booking-items.interfaces").BookingItemsRow & {
          storage_items: Partial<StorageItemRow>;
        })[];
        has_items_from_multiple_orgs?: boolean;
      }
    >
  > {
    const result: PostgrestSingleResponse<BookingPreview> = await supabase
      .from("view_bookings_with_user_info")
      .select(`*`)
      .eq("id", booking_id)
      .single();

    if (result.error) handleSupabaseError(result.error);

    // Get total booking items count
    const { count: totalBookingItemsCount } = await this.supabaseService
      .getServiceClient()
      .from("booking_items")
      .select("*", { count: "exact", head: true })
      .eq("booking_id", booking_id);

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
    // Calculate if booking has items from multiple organizations
    const orgBookingItemsCount = booking_items_result.data?.length || 0;
    const has_items_from_multiple_orgs =
      totalBookingItemsCount !== null &&
      totalBookingItemsCount !== orgBookingItemsCount;

    // Spread result.data and allow extra property
    const bookingData: BookingPreview & {
      booking_items: (import("../booking_items/interfaces/booking-items.interfaces").BookingItemsRow & {
        storage_items: Partial<StorageItemRow>;
      })[];
      org_status_for_active_org?: string;
      has_items_from_multiple_orgs?: boolean;
    } = {
      ...result.data,
      booking_items: booking_items_result.data,
      has_items_from_multiple_orgs,
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

  // inside your class
  async createBooking(
    dto: CreateBookingDto,
    supabase: SupabaseClient<Database>,
    activeRole: { roleName: string; orgId: string },
  ) {
    const userId = dto.user_id;
    const { roleName, orgId } = activeRole;
    if (!userId) {
      throw new BadRequestException("No userId found: user_id is required");
    }

    const { data: profileAddr, error: profileAddrErr } = await supabase
      .from("user_addresses")
      .select("street_address, city, postal_code, country")
      .eq("user_id", userId);

    if (profileAddrErr) {
      throw new BadRequestException("Could not retrieve user addresses");
    }

    if (!profileAddr || profileAddr.length === 0) {
      throw new BadRequestException(
        "User must have at least one address before creating a booking",
      );
    }

    const hasValidAddress = profileAddr.some(
      (addr) =>
        addr.street_address &&
        addr.street_address.trim() !== "" &&
        addr.city &&
        addr.city.trim() !== "" &&
        addr.postal_code &&
        addr.postal_code.trim() !== "" &&
        addr.country &&
        addr.country.trim() !== "",
    );
    if (!hasValidAddress) {
      throw new BadRequestException(
        "User must have at least one valid address before creating a booking",
      );
    }

    // Check availability for each item in the booking before we create it
    const unavailableItems: {
      item_id: string;
      availableQuantity: number;
    }[] = [];
    for (const item of dto.items) {
      const { item_id, quantity, start_date, end_date } = item;

      const { availableQuantity } = await calculateAvailableQuantity(
        supabase,
        item_id,
        start_date,
        end_date,
      );

      if (quantity > availableQuantity) {
        unavailableItems.push({
          item_id,
          availableQuantity,
        });
      }
    }
    if (unavailableItems.length > 0) {
      throw new BadRequestException({
        message:
          "Unfortunately, some of your items have just been booked by another user",
      });
    }

    // ... your profile checks and availability checks BEFORE any writes ...
    // (keep the existing code you posted up to and including availability checks)

    // ---------- DB write phase with rollback ----------
    let booking: BookingRow | null = null;
    const createdBookingItemIds: string[] = [];

    // helper to attempt rollback of any partial inserts.
    const cleanupPartialBooking = async (bookingId?: string) => {
      if (!bookingId) return;
      try {
        // delete booking items that reference this booking
        // use .delete().eq('booking_id', bookingId) so it cascades for the rows your service created
        const { error: delItemsErr } = await supabase
          .from("booking_items")
          .delete()
          .eq("booking_id", bookingId);

        if (delItemsErr) {
          console.error(
            "Failed to delete booking_items during rollback",
            delItemsErr,
          );
          // continue to try deleting booking anyway
        }

        // delete the booking itself
        const { error: delBookingErr } = await supabase
          .from("bookings")
          .delete()
          .eq("id", bookingId);

        if (delBookingErr) {
          console.error(
            "Failed to delete booking during rollback",
            delBookingErr,
          );
        } else {
          console.info(`Rollback: removed booking ${bookingId} and its items`);
        }
      } catch (cleanupErr) {
        // final fallback: log cleanup error
        console.error("Unexpected error during rollback cleanup", cleanupErr);
      }
    };

    // perform writes inside try/catch so we can rollback on any failure
    try {
      let bookingNumber: string;
      try {
        bookingNumber = await generateBookingNumber(supabase);
      } catch (err) {
        console.error("Booking number generation error:", err);
        throw new BadRequestException(
          "Could not generate a unique booking number, please try again",
        );
      }

      const BOOKED_BY_ORG_ROLES = [
        "tenant_admin",
        "storage_manager",
        "requester",
      ];

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: userId,
          booking_number: bookingNumber,
          status: "pending",
          booked_by_org: BOOKED_BY_ORG_ROLES.includes(roleName) ? orgId : null,
        })
        .select()
        .single<BookingRow>();

      if (bookingError || !bookingData) {
        // nothing to rollback yet
        throw new BadRequestException("Could not create booking");
      }

      booking = bookingData; // track booking for possible rollback

      // 3.5. Create booking items using BookingItemsService
      for (const item of dto.items) {
        const start = new Date(item.start_date);
        const end = new Date(item.end_date);
        const totalDays = calculateDuration(start, end);

        // add loan period validation
        if (totalDays < 1) {
          throw new BadRequestException("Booking must be at least 1 day long");
        }

        if (totalDays > 42) {
          throw new BadRequestException("Booking cannot exceed 6 weeks");
        }

        // Prepare booking item
        const bookingItemData: BookingItemsInsert = {
          ...item,
          booking_id: booking.id,
          total_days: totalDays,
          status: "pending",
        };

        // Use BookingItemsService (assume it throws on error)
        // If your createBookingItem returns the created row, collect its id; otherwise we'll rely on cleanup by booking_id
        const created = await this.bookingItemsService.createBookingItems(
          supabase,
          bookingItemData,
        );

        // if service returns the created row/object with id, capture it for debugging or targeted cleanup
        if (created) {
          if (Array.isArray(created.data))
            createdBookingItemIds.push(...created.data.map((i) => i.id));
          else if (created.data) createdBookingItemIds.push(created.data.id);
        }
      }
      // 3.7 Fetch the complete booking with items and translations using the view
      const { data: createdBookings, error: fetchError } = await supabase
        .from("view_bookings_with_details")
        .select("*")
        .eq("id", booking.id);
      if (fetchError || !createdBookings || createdBookings.length === 0) {
        this.logger.error("Fetch created booking error:", fetchError); // Keep for backend
        throw new BadRequestException(
          "Could not fetch created booking details",
        );
      }

      // filtering to get active role
      // Extend the type to include role_name and requester_org_id
      type BookingWithRole = (typeof createdBookings)[0] & {
        role_name?: string;
        requester_org_id?: string;
        user_role_id?: string;
        role_id?: string;
      };

      const createdBooking =
        (createdBookings.find(
          (b: BookingWithRole) =>
            b.role_name === activeRole.roleName &&
            b.requester_org_id === activeRole.orgId,
        ) as BookingWithRole) || (createdBookings[0] as BookingWithRole);

      // attach role info to the response
      const bookingWithRole = {
        ...createdBooking,
        user_role_id: createdBooking.user_role_id,
        role_id: createdBooking.role_id,
        role_name: createdBooking.role_name, // "user" | "requester"
        requester_org_id: createdBooking.requester_org_id, // if requester
      };

      // All DB writes succeeded. Now send email.
      try {
        await this.mailService.sendBookingMail(BookingMailType.Creation, {
          bookingId: booking.id,
          triggeredBy: userId,
        });
      } catch (emailErr) {
        console.error("Booking created but email failed:", emailErr);
      }
      // return the booking (or assembled DTO) to caller
      return {
        message: "Booking created",
        booking: bookingWithRole,
      };
    } catch (err) {
      // Something failed during the DB-write phase (not email).
      // Attempt rollback of any partially inserted rows.
      try {
        await cleanupPartialBooking(booking?.id);
      } catch (cleanupErr) {
        // we already log in cleanupPartialBooking — but surface if needed
        console.error("Error during rollback attempt", cleanupErr);
      }
      // rethrow original error so upstream can handle it
      throw err;
    }
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

    // Validate and confirm items for the organization
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

    // Permission: must be tenant admin or storage manager
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

    // Check if all items in the booking are confirmed (excluding cancelled)
    const { data: items, error: itemsErr } = await supabase
      .from("booking_items")
      .select("status")
      .eq("booking_id", bookingId);

    if (itemsErr || !items) {
      throw new BadRequestException("Failed to fetch booking items");
    }

    // Filter out cancelled items when determining booking status
    const activeItems = items.filter((it) => it.status !== "cancelled");

    const allRejected =
      activeItems.length > 0 &&
      activeItems.every((it) => it.status === "rejected");

    const noPending =
      activeItems.length > 0 &&
      activeItems.every((it) => it.status !== "pending");

    const hasRejectedItems = activeItems.some((it) => it.status === "rejected");

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

      if (hasRejectedItems) {
        // There are both confirmed and rejected items - fetch full details
        const { data: bookingWithItems, error: detailsError } = await supabase
          .from("view_bookings_with_details")
          .select(
            `
            id,
            booking_items(
              id,
              status,
              quantity,
              storage_items (
                translations
              )
            )
          `,
          )
          .eq("id", bookingId)
          .single();

        if (detailsError || !bookingWithItems) {
          console.error(
            "Failed to fetch booking details for email:",
            detailsError,
          );
        } else {
          const itemsWithDetails = bookingWithItems.booking_items || [];

          // Prepare confirmed items with translations
          const confirmedItems = itemsWithDetails
            .filter((item) => item.status === "confirmed")
            .map((item) => {
              const translations = item.storage_items?.translations
                ? JSON.parse(JSON.stringify(item.storage_items.translations))
                : {};

              return {
                ...item,
                translations: {
                  fi: {
                    name: translations.fi?.item_name,
                  },
                  en: {
                    name: translations.en?.item_name,
                  },
                },
              };
            });

          const rejectedItems = itemsWithDetails
            .filter((item) => item.status === "rejected")
            .map((item) => {
              const translations = item.storage_items?.translations
                ? JSON.parse(JSON.stringify(item.storage_items.translations))
                : {};

              return {
                ...item,
                translations: {
                  fi: {
                    name: translations.fi?.item_name,
                  },
                  en: {
                    name: translations.en?.item_name,
                  },
                },
              };
            });

          try {
            await this.mailService.sendBookingMail(
              BookingMailType.PartlyConfirmed,
              {
                bookingId,
                triggeredBy: req.user.id,
                extraData: { confirmedItems, rejectedItems },
              },
            );
          } catch (emailErr) {
            console.error(
              "Booking confirmed, but notification about mixed status items failed:",
              emailErr,
            );
          }
        }
      } else {
        // All items are confirmed (no rejections), send standard confirmation email
        try {
          await this.mailService.sendBookingMail(BookingMailType.Confirmation, {
            bookingId,
            triggeredBy: req.user.id,
          });
        } catch (emailErr) {
          console.error(
            "All items confirmed, but email notification failed:",
            emailErr,
          );
        }
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

    // Validate and reject items for the organization
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

    // Permission: must be tenant admin or storage manager
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

    // Reject items: either a selected subset (itemIds) or all items for the org; only pending can be confirmed
    const updateQuery = supabase
      .from("booking_items")
      .update({ status: "rejected" })
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

    // Check if all items in the booking are rejected (excluding cancelled)
    const { data: items, error: itemsErr } = await supabase
      .from("booking_items")
      .select("status")
      .eq("booking_id", bookingId);

    if (itemsErr || !items) {
      throw new BadRequestException("Failed to fetch booking items");
    }

    // Filter out cancelled items when determining booking status
    const activeItems = items.filter((it) => it.status !== "cancelled");

    const allConfirmed =
      activeItems.length > 0 &&
      activeItems.every((it) => it.status === "confirmed");

    const noPending =
      activeItems.length > 0 &&
      activeItems.every((it) => it.status !== "pending");

    const hasConfirmedItems = activeItems.some(
      (it) => it.status === "confirmed",
    );

    if (allConfirmed) {
      const { error: bookingUpdateErr } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);

      if (bookingUpdateErr) {
        throw new BadRequestException(
          "Failed to confirm booking after all items rejected",
        );
      }
    } else if (noPending) {
      const { error: bookingUpdateErr } = await supabase
        .from("bookings")
        .update({ status: "rejected" })
        .eq("id", bookingId);

      if (bookingUpdateErr) {
        throw new BadRequestException(
          "Failed to reject booking after all items resolved",
        );
      }

      if (hasConfirmedItems) {
        // There are both confirmed and rejected items - fetch full details
        const { data: bookingWithItems, error: detailsError } = await supabase
          .from("view_bookings_with_details")
          .select(
            `
            id,
            booking_items(
              id,
              status,
              quantity,
              storage_items (
                translations
              )
            )
          `,
          )
          .eq("id", bookingId)
          .single();

        if (detailsError || !bookingWithItems) {
          console.error(
            "Failed to fetch booking details for email:",
            detailsError,
          );
        } else {
          const itemsWithDetails = bookingWithItems.booking_items || [];

          // Prepare confirmed items with translations
          const confirmedItems = itemsWithDetails
            .filter((item) => item.status === "confirmed")
            .map((item) => {
              const translations = item.storage_items?.translations
                ? JSON.parse(JSON.stringify(item.storage_items.translations))
                : {};

              return {
                ...item,
                translations: {
                  fi: {
                    name: translations.fi?.item_name,
                  },
                  en: {
                    name: translations.en?.item_name,
                  },
                },
              };
            });

          const rejectedItems = itemsWithDetails
            .filter((item) => item.status === "rejected")
            .map((item) => {
              const translations = item.storage_items?.translations
                ? JSON.parse(JSON.stringify(item.storage_items.translations))
                : {};

              return {
                ...item,
                translations: {
                  fi: {
                    name: translations.fi?.item_name,
                  },
                  en: {
                    name: translations.en?.item_name,
                  },
                },
              };
            });

          try {
            await this.mailService.sendBookingMail(
              BookingMailType.PartlyConfirmed,
              {
                bookingId,
                triggeredBy: req.user.id,
                extraData: { confirmedItems, rejectedItems },
              },
            );
          } catch (emailErr) {
            console.error(
              "Booking confirmed, but notification about mixed status items failed:",
              emailErr,
            );
          }
        }
      } else {
        // All items are rejected (no confirmations), send standard rejection email
        try {
          await this.mailService.sendBookingMail(BookingMailType.Rejection, {
            bookingId,
            triggeredBy: req.user.id,
          });
        } catch (emailErr) {
          console.error(
            "All items rejected, but email notification failed:",
            emailErr,
          );
        }
      }
    }

    return {
      message: noPending
        ? "Items rejected and booking status updated"
        : "Items rejected for organization",
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

    // 5.3 Status check (users are restricted)
    if (booking.status !== "pending") {
      throw new ForbiddenException(
        "Your booking has been confirmed. You can't update it.",
      );
    }

    // 5.4 Check if any booking items have non-pending status
    const { data: existingItems, error: itemsError } = await supabase
      .from("booking_items")
      .select("id, status, item_id, quantity, start_date, end_date")
      .eq("booking_id", booking_id);

    if (itemsError) {
      throw new BadRequestException("Could not fetch existing booking items");
    }

    const hasNonPendingItems = existingItems?.some(
      (item) => item.status !== "pending",
    );

    if (hasNonPendingItems) {
      throw new ForbiddenException(
        "Cannot update booking items when some items have already been confirmed or processed",
      );
    }

    // 5.5 Handle case where all items are removed
    if (!dto.items || dto.items.length === 0) {
      // Cancel the entire booking if no items are provided
      return await this.cancelBooking(booking_id, userId, req);
    }

    // 5.6. Delete existing items from booking_items to avoid duplicates
    await supabase.from("booking_items").delete().eq("booking_id", booking_id);

    // 5.7. insert updated items with validations and availability checks
    const checkedItems: BookingItemInsert[] = [];
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
      if (totalDays < 1) {
        throw new BadRequestException("Booking must be at least 1 day long");
      }

      if (totalDays > 42) {
        throw new BadRequestException("Booking cannot exceed 6 weeks");
      }

      // 5.8. Check availability for the time range
      const { availableQuantity } = await calculateAvailableQuantity(
        supabase,
        item_id,
        start_date,
        end_date,
      );

      if (quantity > availableQuantity) {
        throw new BadRequestException(
          `Requested quantity exceeds available quantity for item: ${item_id}. Requested quantity: ${quantity}, available: ${availableQuantity}`,
        );
      }

      // 5.9. Fetch location_id and org_id (provider_organization_id)
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

      checkedItems.push({
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
    await this.bookingItemsService.createBookingItems(supabase, checkedItems);

    // 5.10 notify user via centralized mail service
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
      "requester",
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
    location_id?: string,
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

      if (location_id) selectQuery.eq("location_id", location_id);
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
    if (location_id) updateQuery.eq("location_id", location_id);
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
    location_id: string,
    itemIds?: string[],
  ) {
    if (!location_id) {
      throw new BadRequestException("location_id is required for pickup");
    }
    // Current timestamp in ISO for consistent comparisons
    const nowIso = new Date().toISOString();

    // If a specific list of items is provided, validate both status and start_date
    if (itemIds && itemIds.length > 0) {
      const selectQuery = supabase
        .from("booking_items")
        .select("id, status, start_date")
        .eq("booking_id", bookingId)
        .eq("provider_organization_id", orgId)
        .eq("location_id", location_id)
        .in("id", itemIds);

      const { data: selectData, error } = await selectQuery;
      if (error) handleSupabaseError(error);

      if (!selectData || selectData.length !== itemIds.length) {
        throw new BadRequestException(
          "All selected items must belong to the provided location",
        );
      }

      const unconfirmed = selectData.filter((r) => r.status !== "confirmed");
      if (unconfirmed.length > 0)
        throw new BadRequestException(
          `Cannot pick up items which are not confirmed`,
        );

      const tooEarly = selectData.filter(
        (r) => new Date(r.start_date).toISOString() > nowIso,
      );
      if (tooEarly.length > 0) {
        throw new BadRequestException(
          `Cannot pick up items before their start date`,
        );
      }
    }

    const updateQuery = supabase
      .from("booking_items")
      .update({ status: "picked_up" })
      .eq("booking_id", bookingId)
      .eq("provider_organization_id", orgId)
      .eq("status", "confirmed")
      .eq("location_id", location_id)
      // Guardrail: never allow pickup prior to start_date
      .lte("start_date", nowIso);
    if (itemIds && itemIds.length > 0) updateQuery.in("id", itemIds);
    const { error: itemsUpdateError } = await updateQuery;
    if (itemsUpdateError) handleSupabaseError(itemsUpdateError);

    const { data: bookingDetails } = await supabase
      .from("booking_items")
      .select("status")
      .eq("booking_id", bookingId);

    if (
      bookingDetails?.some(
        (org_booking) => org_booking.status === "picked_up",
      ) &&
      bookingDetails?.every((org_booking) => org_booking.status !== "pending")
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

    // Check if all booking items are now cancelled and update parent booking status
    const { data: allItems, error: allItemsError } = await supabase
      .from("booking_items")
      .select("status")
      .eq("booking_id", bookingId);

    if (allItemsError) handleSupabaseError(allItemsError);

    if (allItems && allItems.length > 0) {
      const allStatuses = allItems.map((item) => item.status);

      // If all items are cancelled, update booking status to cancelled
      if (allStatuses.every((status) => status === "cancelled")) {
        const { error: bookingUpdateError } = await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", bookingId);

        if (bookingUpdateError) {
          console.error(
            "Failed to update booking status to cancelled:",
            bookingUpdateError,
          );
        }
      }
    }

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

  /**
   * Update self_pickup status of a booking portion
   * self_pickup is PER org and PER location
   */
  async updateSelfPickup(
    supabase: SupabaseClient,
    bookingId: string,
    orgId: string,
    body: {
      location_id: string;
      newStatus: boolean;
    },
  ) {
    const { location_id, newStatus } = body;
    const result = await supabase
      .from("booking_items")
      .update({ self_pickup: newStatus })
      .eq("booking_id", bookingId)
      .eq("provider_organization_id", orgId)
      .eq("location_id", location_id);

    if (result.error) handleSupabaseError(result.error);
    return {
      message: `Self pickup was successfully ${newStatus === true ? "enabled" : "disabled"}`,
    };
  }
}
