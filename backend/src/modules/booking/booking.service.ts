import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import {
  calculateAvailableQuantity,
  calculateDuration,
  generateBookingNumber,
  dayDiffFromToday,
} from "@src/utils/booking.utils";
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
import { Translations } from "./types/translations.types";
import {
  CancelBookingResponse,
  BookingItemInsert,
  BookingItemRow,
  BookingWithItems,
  StorageItemsRow,
  BookingRow,
  ValidBookingOrder,
} from "./types/booking.interface";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";
import { StorageLocationsService } from "../storage-locations/storage-locations.service";
import { RoleService } from "../role/role.service";
import { AuthRequest } from "@src/middleware/interfaces/auth-request.interface";
import { ApiResponse, ApiSingleResponse } from "@common/response.types";
import { handleSupabaseError } from "@src/utils/handleError.utils";
import { BookingPreview } from "@common/bookings/booking.types";
import { BookingItemsService } from "../booking_items/booking-items.service";
import { BookingItem } from "@common/bookings/booking-items.types";
import { StorageItemRow } from "../storage-items/interfaces/storage-item.interface";
import { calculateAvailableQuantityGroupedByOrg } from "@src/utils/booking.utils";
import { UpdateBookingItemDto } from "./dto/update-booking-item.dto";
import { calculateAvailableQuantityForOrg } from "@src/utils/booking.utils";
// import { OrgItemRow } from "../org_items/interfaces/org_items.interface";
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
   * Resolve which organization "provides" an item for a booking.
   * Strategy:
   * 1) Prefer orgs that own the item *and* are linked to the item's location.
   * 2) If multiple remain, pick the one with the largest owned_quantity.
   * 3) If none are linked to that location, pick the org with the largest owned_quantity overall.
   * Returns `null` if no owning orgs exist.
   */
  private async resolveProviderOrganizationId(
    supabase: SupabaseClient<Database>,
    itemId: string,
    locationId: string | null,
  ): Promise<string | null> {
    const { data: ownerships } = await supabase
      .from("organization_items")
      .select("organization_id, owned_quantity")
      .eq("item_id", itemId);

    if (!ownerships || ownerships.length === 0) return null;

    let candidates = ownerships;

    if (locationId) {
      const { data: orgAtLoc } = await supabase
        .from("organization_locations")
        .select("organization_id")
        .eq("storage_location_id", locationId);

      if (orgAtLoc && orgAtLoc.length > 0) {
        const allowed = new Set(orgAtLoc.map((o) => o.organization_id));
        const filtered = ownerships.filter((o) =>
          allowed.has(o.organization_id),
        );
        if (filtered.length > 0) candidates = filtered;
      }
    }

    candidates.sort(
      (a, b) => (b.owned_quantity ?? 0) - (a.owned_quantity ?? 0),
    );

    return candidates[0]?.organization_id ?? null;
  }

  // 1. get all bookings
  async getAllBookings(
    supabase: SupabaseClient<Database>,
    page: number,
    limit: number,
  ) {
    const { from, to } = getPaginationRange(page, limit);

    const result = await supabase
      .from("bookings")
      .select(
        `
      *,
      booking_items (
        *,
        storage_items (
          translations,
          storage_locations (
            name
          )
        )
      )
    `,
        { count: "exact" },
      )
      .range(from, to);

    const { data: bookings, error, count } = result;
    const metadata = getPaginationMeta(count, page, limit);

    if (error) {
      console.error("Supabase error in getAllBookings():", error);
      throw new BadRequestException("Could not load bookings");
    }
    if (!bookings || bookings.length === 0) {
      throw new BadRequestException("No bookings found");
    }

    // get corresponding user profile for each booking (via user_id)
    const bookingsWithUserProfiles = await Promise.all(
      bookings.map(async (booking) => {
        let user: { name: string; email: string } | null = null;

        if (booking.user_id) {
          const { data: userData } = await supabase
            .from("user_profiles")
            .select("full_name, email")
            .eq("id", booking.user_id)
            .maybeSingle();

          if (userData) {
            user = {
              name: userData.full_name ?? "unknown",
              email: userData.email ?? "unknown@incognito.fi",
            };
          }
        }

        const itemWithNamesAndLocation =
          booking.booking_items?.map((item) => {
            const translations = item.storage_items
              ?.translations as Translations | null;

            return {
              ...item,
              item_name: translations?.en?.item_name ?? "Unknown",
              location_name:
                item.storage_items?.storage_locations?.name ?? "Unknown",
            };
          }) ?? [];

        return {
          ...booking,
          user_profile: user,
          booking_items: itemWithNamesAndLocation,
        };
      }),
    );

    return {
      ...result,
      data: bookingsWithUserProfiles,
      metadata,
    };
  }

  async getUserBookings(
    userId: string,
    supabase: SupabaseClient<Database>,
    page: number,
    limit: number,
  ) {
    const { from, to } = getPaginationRange(page, limit);

    if (!userId || userId === "undefined") {
      throw new BadRequestException("Valid user ID is required");
    }

    const result = await supabase
      .from("view_bookings_with_user_info")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    const pagination = getPaginationMeta(result.count, page, limit);
    return { ...result, metadata: pagination };
  }

  // 3. create a Booking
  async createBooking(
    dto: CreateBookingDto,
    supabase: SupabaseClient<Database>,
  ) {
    // Use service client for reads that must see all rows (bypass RLS)
    const svc =
      this.supabaseService.getServiceClient() as SupabaseClient<Database>;
    const userId = dto.user_id;

    if (!userId) {
      throw new BadRequestException("No userId found: user_id is required");
    }
    // variables for date check
    let warningMessage: string | null = null;

    for (const item of dto.items) {
      // Accept either storage_item_id or item_id (which may be an organization_items.id)
      const rawItemId = item.storage_item_id;
      const { quantity, start_date, end_date } = item;

      const start = new Date(start_date);
      const differenceInDays = dayDiffFromToday(start);

      if (differenceInDays <= 0) {
        throw new BadRequestException(
          "Bookings must start at least one day in the future",
        );
      }

      if (differenceInDays <= 2) {
        warningMessage =
          "This is a short-notice booking. Please be aware that it might not be fulfilled in time.";
      }

      // Resolve to an effective storage_item_id
      let effectiveItemId: string | null = null;
      if (rawItemId) {
        // Try as storage_items.id
        const { data: si } = await supabase
          .from("storage_items")
          .select("id")
          .eq("id", rawItemId)
          .maybeSingle();

        if (si?.id) {
          effectiveItemId = si.id;
        } else {
          // Try as organization_items.id
          const { data: orgItem } = await supabase
            .from("organization_items")
            .select("storage_item_id")
            .eq("id", rawItemId)
            .maybeSingle();
          if (orgItem?.storage_item_id) {
            effectiveItemId = orgItem.storage_item_id;
          }
        }
      }

      if (!effectiveItemId) {
        throw new BadRequestException(
          `Invalid item identifier. Provide storage_item_id (storage_items.id) or organization_items.id in each item. Received: ${rawItemId}`,
        );
      }

      // 3.1. Check availability for requested date range
      const available = await calculateAvailableQuantity(
        svc,
        effectiveItemId,
        start_date,
        end_date,
      );

      if (quantity > available.availableQuantity) {
        throw new BadRequestException(
          `Not enough virtual stock available for item ${effectiveItemId}`,
        );
      }

      // 3.2. Physical stock: enforce strictly at creation to avoid overbook.
      const { data: storageItem, error: itemError } = await supabase
        .from("storage_items")
        .select("items_number_currently_in_storage")
        .eq("id", effectiveItemId)
        .single();
      if (itemError || !storageItem) {
        throw new BadRequestException("Storage item data not found");
      }
      const currentStock = storageItem.items_number_currently_in_storage ?? 0;
      if (quantity > currentStock) {
        throw new BadRequestException(
          `Not enough physical stock in storage for item ${effectiveItemId}`,
        );
      }
    }

    // 3.4. Create the booking

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        status: "pending",
        booking_number: generateBookingNumber(),
      })
      .select()
      .single<BookingRow>();

    if (bookingError || !booking) {
      console.error("Booking insert error:", bookingError);
      console.error("Booking result:", booking);
      throw new BadRequestException("Could not create booking");
    }

    // 3.5. Create booking items with provider organization ownership
    for (const item of dto.items) {
      const start = new Date(item.start_date);
      const end = new Date(item.end_date);
      const totalDays = calculateDuration(start, end);

      // Resolve effective storage item id again (accept storage_item_id or item_id that points to org-item)
      const rawItemId = item.storage_item_id;
      let effectiveItemId: string | null = null;
      if (rawItemId) {
        const { data: si } = await supabase
          .from("storage_items")
          .select("id, location_id")
          .eq("id", rawItemId)
          .maybeSingle();
        if (si?.id) {
          effectiveItemId = si.id;
        } else {
          const { data: orgItem } = await supabase
            .from("organization_items")
            .select("storage_item_id")
            .eq("id", rawItemId)
            .maybeSingle();
          if (orgItem?.storage_item_id) {
            effectiveItemId = orgItem.storage_item_id;
          }
        }
      }

      if (!effectiveItemId) {
        throw new BadRequestException(
          `Invalid item identifier. Provide storage_item_id (storage_items.id) or organization_items.id in each item. Received: ${rawItemId}`,
        );
      }

      // 3.5.1 Get location_id for the storage item
      const { data: storageItem, error: locationError } = await supabase
        .from("storage_items")
        .select("location_id")
        .eq("id", effectiveItemId)
        .single();

      if (locationError || !storageItem) {
        throw new BadRequestException(
          `Location ID not found for item ${effectiveItemId}`,
          handleSupabaseError(locationError),
        );
      }

      // 3.5.2 Find owning organizations for this item at this location
      const { data: orgLinks, error: orgError } = await supabase
        .from("organization_items")
        .select("organization_id, owned_quantity")
        .eq("storage_item_id", effectiveItemId)
        .eq("storage_location_id", storageItem.location_id)
        .eq("is_active", true);

      if (orgError) {
        throw new BadRequestException(
          `Failed to resolve owning organization for item ${effectiveItemId}`,
          handleSupabaseError(orgError),
        );
      }

      if (!orgLinks || orgLinks.length === 0) {
        throw new BadRequestException(
          `No owning organization configured for item ${effectiveItemId} at its location`,
        );
      }

      // 3.5.3 If frontend asked for a specific org, allocate only from that org
      const requestedQty = item.quantity;

      if (item.provider_organization_id) {
        const target = orgLinks.find(
          (l) => l.organization_id === item.provider_organization_id,
        );
        if (!target) {
          throw new BadRequestException(
            `Organization ${item.provider_organization_id} does not own item ${effectiveItemId} at this location`,
          );
        }

        // Enforce per-org virtual capacity and owned capacity
        // Availability is implicitly enforced by owned capacity and overlapping rows per org
        // Owned capacity for org at this location
        const ownedForOrg = target.owned_quantity ?? 0;
        if (requestedQty > ownedForOrg) {
          throw new BadRequestException(
            `Requested quantity (${requestedQty}) exceeds org-owned quantity (${ownedForOrg}) for item ${effectiveItemId}`,
          );
        }
        // Also enforce per-org virtual availability across overlapping bookings
        const perOrgAvail = await calculateAvailableQuantityForOrg(
          svc,
          effectiveItemId,
          item.start_date,
          item.end_date,
          item.provider_organization_id,
          storageItem.location_id,
        );
        if (requestedQty > perOrgAvail.availableQuantity) {
          throw new BadRequestException(
            `Not enough virtual availability for org ${item.provider_organization_id}; requested ${requestedQty}, available ${perOrgAvail.availableQuantity}`,
          );
        }
        // Insert single row tied to the requested org
        const { error: insertError } = await supabase
          .from("booking_items")
          .insert({
            booking_id: booking.id,
            item_id: effectiveItemId,
            location_id: storageItem.location_id,
            provider_organization_id: item.provider_organization_id,
            quantity: requestedQty,
            start_date: item.start_date,
            end_date: item.end_date,
            total_days: totalDays,
            status: "pending",
          });

        if (insertError) handleSupabaseError(insertError);
        continue;
      }

      if (orgLinks.length === 1) {
        const providerOrgId = orgLinks[0].organization_id;
        const { error: insertError } = await supabase
          .from("booking_items")
          .insert({
            booking_id: booking.id,
            item_id: effectiveItemId,
            location_id: storageItem.location_id,
            provider_organization_id: providerOrgId,
            quantity: requestedQty,
            start_date: item.start_date,
            end_date: item.end_date,
            total_days: totalDays,
            status: "pending",
          });

        if (insertError) {
          handleSupabaseError(insertError);
        }
        continue;
      }

      // Multiple orgs: allocate quantity across orgs up to their owned_quantity
      const totalOwned = orgLinks.reduce(
        (sum, l) => sum + (l.owned_quantity ?? 0),
        0,
      );

      if (requestedQty > totalOwned) {
        throw new BadRequestException(
          `Requested quantity (${requestedQty}) exceeds total owned across organizations (${totalOwned}) for item ${effectiveItemId}`,
        );
      }

      let remaining = requestedQty;
      // Simple allocation strategy: iterate in given order; could sort by owned_quantity desc if desired
      for (const link of orgLinks) {
        if (remaining <= 0) break;
        const allocatable = Math.min(remaining, link.owned_quantity ?? 0);
        if (allocatable <= 0) continue;

        const { error: insertError } = await supabase
          .from("booking_items")
          .insert({
            booking_id: booking.id,
            item_id: effectiveItemId,
            location_id: storageItem.location_id,
            provider_organization_id: link.organization_id,
            quantity: allocatable,
            start_date: item.start_date,
            end_date: item.end_date,
            total_days: totalDays,
            status: "pending",
          });

        if (insertError) {
          throw new BadRequestException(
            "Could not create booking items",
            handleSupabaseError(insertError),
          );
        }

        remaining -= allocatable;
      }

      if (remaining > 0) {
        // Defensive: should not happen due to previous check
        throw new BadRequestException(
          `Internal allocation error: ${remaining} units could not be allocated to any organization for item ${effectiveItemId}`,
        );
      }
    }

    // 3.6 notify user via centralized mail service
    await this.mailService.sendBookingMail(BookingMailType.Creation, {
      bookingId: booking.id,
      triggeredBy: userId,
    });

    return warningMessage ? { booking, warning: warningMessage } : booking;
  }

  // 4. confirm a Booking
  async confirmBooking(bookingId: string, req: AuthRequest) {
    const supabase = req.supabase;
    const userId = req.user.id;
    console.log(req.userRoles);
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
        .select("items_number_currently_in_storage")
        .eq("id", item.item_id)
        .single();

      if (storageItemError || !storageItem) {
        throw new BadRequestException("Could not fetch storage item details");
      }

      // check if stock is enough
      if (
        (storageItem.items_number_currently_in_storage ?? 0) < item.quantity
      ) {
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

    // uncomment this when you want the invoice generation inside the app
    /*  // 4.5 create invoice and save to database
    const invoice = new InvoiceService(this.supabaseService);
    invoice.generateInvoice(bookingId); */

    // 4.6 notify user via centralized mail service
    await this.mailService.sendBookingMail(BookingMailType.Confirmation, {
      bookingId,
      triggeredBy: userId,
    });
    return { message: "Booking confirmed" };
  }

  // 5. update a Booking (Admin/SuperVera OR Owner)
  async updateBooking(
    booking_id: string,
    userId: string,
    updatedItems: UpdateBookingItemDto[],
    req: AuthRequest,
  ) {
    // Used for availability checks only
    const svc =
      this.supabaseService.getServiceClient() as SupabaseClient<Database>;

    const supabase = req.supabase;
    // 5.1 check the booking
    const { data: booking } = await supabase
      .from("bookings")
      .select("status, user_id, booking_number")
      .eq("id", booking_id)
      .single();

    if (!booking) throw new BadRequestException("Booking not found");

    // 5.2. check permissions using RoleService
    const isElevated = this.roleService.hasAnyRole(req, [
      "admin",
      "super_admin",
      "main_admin",
      "superVera",
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

    // 5.3. Delete existing items from booking_items to avoid duplicates
    await this.bookingItemsService.removeAllBookingItems(supabase, booking_id);

    // 5.4. insert updated items with availability check
    for (const item of updatedItems) {
      // Accept storage_item_id (preferred) or item_id fallback
      const rawItemId = item.storage_item_id ?? item.item_id;
      if (!rawItemId) {
        throw new BadRequestException(
          "Each item must provide storage_item_id or item_id",
        );
      }

      // Resolve to a storage_items.id
      let effectiveItemId: string | null = null;
      const { data: si } = await supabase
        .from("storage_items")
        .select("id, location_id")
        .eq("id", rawItemId)
        .maybeSingle();
      if (si?.id) {
        effectiveItemId = si.id;
      } else {
        const { data: orgItem } = await supabase
          .from("organization_items")
          .select("storage_item_id")
          .eq("id", rawItemId)
          .maybeSingle();
        if (orgItem?.storage_item_id) {
          effectiveItemId = orgItem.storage_item_id;
        }
      }

      if (!effectiveItemId) {
        throw new BadRequestException(
          `Invalid item identifier. Provide storage_item_id (storage_items.id) or organization_items.id. Received: ${rawItemId}`,
        );
      }

      const { quantity, start_date, end_date } = item;

      const totalDays = calculateDuration(
        new Date(start_date),
        new Date(end_date),
      );

      // 5.5. Check virtual availability for the time range
      const available = await calculateAvailableQuantity(
        svc,
        effectiveItemId,
        start_date,
        end_date,
      );

      if (quantity > available.availableQuantity) {
        throw new BadRequestException(
          `Not enough virtual stock available for item ${effectiveItemId}`,
        );
      }

      // 5.6. Fetch location_id
      const { data: storageItem, error: storageError } = await supabase
        .from("storage_items")
        .select("location_id")
        .eq("id", effectiveItemId)
        .single<StorageItemsRow>();

      if (storageError || !storageItem) {
        throw new BadRequestException(
          `Could not find storage item for item ${effectiveItemId}`,
        );
      }
      // 5.7. Determine provider org(s) and insert booking_items accordingly (same logic as create)
      const { data: orgLinks, error: orgError } = await supabase
        .from("organization_items")
        .select("organization_id, owned_quantity")
        .eq("storage_item_id", effectiveItemId)
        .eq("storage_location_id", storageItem.location_id)
        .eq("is_active", true);

      if (orgError) {
        throw new BadRequestException(
          `Failed to resolve owning organization for item ${effectiveItemId}`,
        );
      }

      if (!orgLinks || orgLinks.length === 0) {
        throw new BadRequestException(
          `No owning organization configured for item ${effectiveItemId} at its location`,
        );
      }

      // If a specific provider org is requested, validate and insert only for that org
      if (item.provider_organization_id) {
        const target = orgLinks.find(
          (l) => l.organization_id === item.provider_organization_id,
        );
        if (!target) {
          throw new BadRequestException(
            `Organization ${item.provider_organization_id} does not own item ${effectiveItemId} at this location`,
          );
        }
        const ownedForOrg = target.owned_quantity ?? 0;
        if (quantity > ownedForOrg) {
          throw new BadRequestException(
            `Requested quantity (${quantity}) exceeds org-owned quantity (${ownedForOrg}) for item ${effectiveItemId}`,
          );
        }
        const perOrgAvail = await calculateAvailableQuantityForOrg(
          svc,
          effectiveItemId,
          start_date,
          end_date,
          item.provider_organization_id,
          storageItem.location_id,
        );
        if (quantity > perOrgAvail.availableQuantity) {
          throw new BadRequestException(
            `Not enough virtual availability for org ${item.provider_organization_id}; requested ${quantity}, available ${perOrgAvail.availableQuantity}`,
          );
        }

        const res = await this.bookingItemsService.createBookingItem(supabase, {
          booking_id: booking_id,
          item_id: effectiveItemId,
          location_id: storageItem.location_id,
          provider_organization_id: item.provider_organization_id,
          quantity: quantity,
          start_date: start_date,
          end_date: end_date,
          total_days: totalDays,
          status: "pending",
        } as BookingItemInsert);
        if (res.error) handleSupabaseError(res.error);
        continue;
      }

      if (orgLinks.length === 1) {
        const providerOrgId = orgLinks[0].organization_id;
        const res = await this.bookingItemsService.createBookingItem(supabase, {
          booking_id: booking_id,
          item_id: effectiveItemId,
          location_id: storageItem.location_id,
          provider_organization_id: providerOrgId,
          quantity: quantity,
          start_date: start_date,
          end_date: end_date,
          total_days: totalDays,
          status: "pending",
        } as BookingItemInsert);
        if (res.error) handleSupabaseError(res.error);
        continue;
      }

      const totalOwned = orgLinks.reduce(
        (sum, l) => sum + (l.owned_quantity ?? 0),
        0,
      );
      if (quantity > totalOwned) {
        throw new BadRequestException(
          `Requested quantity (${quantity}) exceeds total owned across organizations (${totalOwned}) for item ${effectiveItemId}`,
        );
      }

      let remaining = quantity;
      for (const link of orgLinks) {
        if (remaining <= 0) break;
        const allocatable = Math.min(remaining, link.owned_quantity ?? 0);
        if (allocatable <= 0) continue;

        const res = await this.bookingItemsService.createBookingItem(supabase, {
          booking_id: booking_id,
          item_id: effectiveItemId,
          location_id: storageItem.location_id,
          provider_organization_id: link.organization_id,
          quantity: allocatable,
          start_date: start_date,
          end_date: end_date,
          total_days: totalDays,
          status: "pending",
        } as BookingItemInsert);
        if (res.error) handleSupabaseError(res.error);
        remaining -= allocatable;
      }

      if (remaining > 0) {
        throw new BadRequestException(
          `Internal allocation error: ${remaining} units could not be allocated to any organization for item ${effectiveItemId}`,
        );
      }
    }

    // 5.8 notify user via centralized mail service
    await this.mailService.sendBookingMail(BookingMailType.Update, {
      bookingId: booking_id,
      triggeredBy: userId,
    });

    const { data: updatedBooking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
    *,
    booking_items (
      *,
      storage_items (
        translations
      )
    )
  `,
      )
      .eq("id", booking_id)
      .single()
      .overrideTypes<BookingWithItems>();

    if (bookingError || !updatedBooking) {
      throw new BadRequestException("Could not fetch updated booking details");
    }

    return {
      message: "Booking updated",
      booking: updatedBooking,
    };
  }

  // 6. reject a Booking (Admin/SuperVera only)
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
      "admin",
      "super_admin",
      "main_admin",
      "superVera",
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

  // 7. cancel a Booking (User if not confirmed, Admins/SuperVera always)
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

    // prevent re-cancellation
    const finalStates = new Set(["cancelled by user", "cancelled by admin"]);

    if (finalStates.has(booking.status)) {
      throw new BadRequestException(
        `Booking has already been ${booking.status}`,
      );
    }

    // 7.2 permissions check using RoleService
    const isAdmin = this.roleService.hasAnyRole(req, [
      "admin",
      "super_admin",
      "main_admin",
      "superVera",
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
    const { error } = await supabase
      .from("bookings")
      .update({ status: isAdmin ? "cancelled by admin" : "cancelled by user" })
      .eq("id", bookingId);

    if (error) {
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
    if (booking.status === "deleted") {
      throw new BadRequestException("Booking is already deleted");
    }

    // 8.2 check user role using RoleService
    const isAdmin = this.roleService.hasAnyRole(req, [
      "admin",
      "super_admin",
      "main_admin",
      "superVera",
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
        status: "deleted",
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

  // 9. return items (when items are brought back)
  async returnItems(
    bookingId: string,
    userId: string,
    supabase: SupabaseClient,
  ) {
    const { data: items } = await supabase
      .from("booking_items")
      .select("item_id, quantity, status")
      .eq("booking_id", bookingId)
      .overrideTypes<BookingItemRow[]>();

    if (!items || items.length === 0) {
      throw new BadRequestException("No items found for return");
    }

    for (const item of items) {
      if (item.status === "returned") {
        throw new BadRequestException("Items are already returned");
      }
    }

    // set booking status to completed
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "completed" })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Failed to complete booking:", updateError);
      throw new BadRequestException("Could not complete the booking");
    }

    // update number currently in storage
    for (const item of items) {
      const { data: storageItem, error } = await supabase
        .from("storage_items")
        .select("items_number_currently_in_storage")
        .eq("id", item.item_id)
        .single<StorageItemsRow>();

      if (error || !storageItem) {
        throw new BadRequestException("Could not find item in storage");
      }

      const updatedCount =
        (storageItem.items_number_currently_in_storage || 0) +
        (item.quantity ?? 0);

      const { error: updateItemsError } = await supabase
        .from("storage_items")
        .update({ items_number_currently_in_storage: updatedCount })
        .eq("id", item.item_id);

      if (updateItemsError) {
        throw new BadRequestException("Failed to update storage stock");
      }
    }

    // notify via centralized mail service
    await this.mailService.sendBookingMail(BookingMailType.ItemsReturned, {
      bookingId,
      triggeredBy: userId,
    });

    return { message: "Items returned successfully" };
  }

  // 10. confirm pickup of items
  async confirmPickup(bookingId: string, supabase: SupabaseClient) {
    // 10.1. Get the booking item
    const { data: items } = await supabase
      .from("booking_items")
      .select("item_id, quantity, status, start_date, end_date")
      .eq("booking_id", bookingId)
      .overrideTypes<BookingItemRow[]>();

    if (!items || items.length === 0) {
      throw new BadRequestException("No items found for return");
    }

    for (const item of items) {
      if (item.status === "picked_up")
        throw new BadRequestException("Items are already picked_up");

      if (item.status !== "confirmed") {
        throw new BadRequestException(
          "Booking item is not confirmed and can't be picked up",
        );
      }
      /* if (item.start_date > today) { // TODO uncomment this when the booking system is ready!!!!!!!!!!!
        throw new BadRequestException(
          "Cannot confirm pickup before the booking start date",
        );
      }

      if (item.end_date < today) {
        throw new BadRequestException(
          "Booking period has already ended. Pickup not allowed.",
        );
      } */

      // 10.2. Get associated storage item
      const { data: storageItem, error: storageError } = await supabase
        .from("storage_items")
        .select("items_number_currently_in_storage")
        .eq("id", item.item_id)
        .single();

      if (storageError || !storageItem) {
        throw new BadRequestException(
          "Storage item not found or not confirmed",
        );
      }

      const newCount =
        (storageItem.items_number_currently_in_storage || 0) -
        (item.quantity || 0);

      if (newCount < 0) {
        throw new BadRequestException("Not enough stock to confirm pickup");
      }

      // 10.3. Update storage stock
      const { error: updateStockError } = await supabase
        .from("storage_items")
        .update({ items_number_currently_in_storage: newCount })
        .eq("id", item.item_id);

      if (updateStockError) {
        throw new BadRequestException("Failed to update storage stock");
      }

      // 10.4. Update booking item status to "picked_up"
      const { error: updateStatusError } = await supabase
        .from("booking_items")
        .update({ status: "picked_up" })
        .eq("id", item.item_id);

      if (updateStatusError) {
        throw new BadRequestException("Failed to update booking item status");
      }
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
   * Approve a single booking item by an authorized org/admin user.
   * Only allowed if the user has roles in the provider_organization_id of the item
   * or has elevated roles (admin, super_admin, main_admin, superVera, storage_manager).
   */
  async approveBookingItem(
    bookingId: string,
    bookingItemId: string,
    reason: string | undefined,
    req: AuthRequest,
  ) {
    const supabase = req.supabase;
    // Fetch the item and validate it belongs to booking
    const { data: item, error } = await supabase
      .from("booking_items")
      .select("id, booking_id, provider_organization_id, status")
      .eq("id", bookingItemId)
      .maybeSingle();

    if (error || !item || item.booking_id !== bookingId) {
      throw new BadRequestException("Booking item not found for booking");
    }

    // Permission: user must be elevated or have a role in the provider org
    const isElevated = this.roleService.hasAnyRole(req, [
      "admin",
      "super_admin",
      "main_admin",
      "superVera",
      "storage_manager",
    ]);

    const inProviderOrg = item.provider_organization_id
      ? this.roleService.hasAnyRole(
          req,
          ["admin", "storage_manager", "user", "requester"],
          item.provider_organization_id,
        )
      : false;

    if (!isElevated && !inProviderOrg) {
      throw new ForbiddenException(
        "Not allowed to approve items for this organization",
      );
    }

    // Update item to confirmed and set decision fields
    const { error: updErr } = await supabase
      .from("booking_items")
      .update({
        status: "confirmed",
        decision_by_user_id: req.user.id,
        decision_at: new Date().toISOString(),
        decision_reason: reason ?? null,
      })
      .eq("id", bookingItemId)
      .eq("booking_id", bookingId);

    if (updErr) throw new BadRequestException("Failed to approve booking item");

    // Optional: mail could be sent when whole booking becomes confirmed via trigger aggregation
    return { message: "Booking item approved" };
  }

  /**
   * Reject a single booking item by an authorized org/admin user.
   * Same permissions as approve.
   */
  async rejectBookingItem(
    bookingId: string,
    bookingItemId: string,
    reason: string | undefined,
    req: AuthRequest,
  ) {
    const supabase = req.supabase;
    // Fetch the item and validate it belongs to booking
    const { data: item, error } = await supabase
      .from("booking_items")
      .select("id, booking_id, provider_organization_id, status")
      .eq("id", bookingItemId)
      .maybeSingle();

    if (error || !item || item.booking_id !== bookingId) {
      throw new BadRequestException("Booking item not found for booking");
    }

    // Permission checks
    const isElevated = this.roleService.hasAnyRole(req, [
      "admin",
      "super_admin",
      "main_admin",
      "superVera",
      "storage_manager",
    ]);
    const inProviderOrg = item.provider_organization_id
      ? this.roleService.hasAnyRole(
          req,
          ["admin", "storage_manager", "user", "requester"],
          item.provider_organization_id,
        )
      : false;
    if (!isElevated && !inProviderOrg) {
      throw new ForbiddenException(
        "Not allowed to reject items for this organization",
      );
    }

    const { error: updErr } = await supabase
      .from("booking_items")
      .update({
        status: "rejected",
        decision_by_user_id: req.user.id,
        decision_at: new Date().toISOString(),
        decision_reason: reason ?? null,
      })
      .eq("id", bookingItemId)
      .eq("booking_id", bookingId);

    if (updErr) throw new BadRequestException("Failed to reject booking item");

    // Aggregation to booking.status is handled by DB trigger in migration
    return { message: "Booking item rejected" };
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

  // 11. Update payment status
  async updatePaymentStatus(
    bookingId: string,
    status: "invoice-sent" | "paid" | "payment-rejected" | "overdue" | null,
    supabase: SupabaseClient,
  ) {
    // Check if booking exists
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id")
      .eq("id", bookingId)
      .single();

    if (!booking || bookingError) {
      throw new BadRequestException("Booking not found");
    }

    // Update payment_status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ payment_status: status })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Supabase error in updatePaymentStatus():", updateError);
      throw new BadRequestException("Failed to update payment status");
    }

    return {
      message: `Payment status updated to '${status}' for booking ${bookingId}`,
    };
  }

  /**
   * Get bookings in an ordered list
   * @param supabase The supabase client provided by request
   * @param page What page number is requested
   * @param limit How many rows to retrieve
   * @param ascending If to sort booking smallest-largest (e.g a-z) or descending (z-a). Default true / ascending.
   * @param filter What to filter the bookings by
   * @param order_by What column to order the columns by. Default "booking_number"
   * @param searchquery Optional. Filter bookings by a string
   * @returns Matching bookings
   */
  async getOrderedBookings(
    supabase: SupabaseClient,
    page: number,
    limit: number,
    ascending: boolean,
    order_by: ValidBookingOrder,
    searchquery?: string,
    status_filter?: string,
  ) {
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
          `status.ilike.%${searchquery}%,` +
          `full_name.ilike.%${searchquery}%,` +
          `created_at_text.ilike.%${searchquery}%,` +
          `final_amount_text.ilike.%${searchquery}%,` +
          `payment_status.ilike.%${searchquery}%`,
      );
    }

    const result = await query;

    const { error, count } = result;
    if (error) {
      console.log(error);
      throw new Error("Failed to get matching bookings");
    }

    const pagination_meta = getPaginationMeta(count, page, limit);
    return {
      ...result,
      metadata: pagination_meta,
    };
  }

  /**
   * Get full booking details with paginated booking-items and item details
   * @param supabase The users supabase client
   * @param booking_id ID of the booking to retrieve
   * @returns
   */
  async getBookingByID(
    supabase: SupabaseClient,
    booking_id: string,
    page: number,
    limit: number,
  ): Promise<
    ApiSingleResponse<BookingPreview & { booking_items: BookingItemRow[] }>
  > {
    const result: PostgrestSingleResponse<BookingPreview> = await supabase
      .from("view_bookings_with_user_info")
      .select(`*`)
      .eq("id", booking_id)
      .single();

    if (result.error) handleSupabaseError(result.error);

    const booking_items_result: ApiResponse<
      BookingItem & {
        storage_items: Partial<StorageItemRow>;
      }
    > = await this.bookingItemsService.getBookingItems(
      supabase,
      booking_id,
      page,
      limit,
    );

    if (booking_items_result.error)
      handleSupabaseError(booking_items_result.error);

    return {
      ...result,
      data: { ...result.data, booking_items: booking_items_result.data },
      metadata: booking_items_result.metadata,
    };
  }

  async getBookingsCount(
    supabase: SupabaseClient,
  ): Promise<ApiSingleResponse<number>> {
    const result: PostgrestResponse<undefined> = await supabase
      .from("bookings")
      .select(undefined, { count: "exact" });

    if (result.error) handleSupabaseError(result.error);

    return {
      ...result,
      data: result.count ?? 0,
    };
  }

  /** Per-organization availability for an item and date range */
  async getPerOrgAvailability(
    supabase: SupabaseClient,
    item_id: string,
    start: string,
    end: string,
    location_id?: string,
  ) {
    // Use service client so RLS doesn't hide booking_items from anon/user contexts
    const svc =
      this.supabaseService.getServiceClient() as SupabaseClient<Database>;
    const rows = await calculateAvailableQuantityGroupedByOrg(
      svc,
      item_id,
      start,
      end,
      location_id,
    );
    return rows;
  }
}
