import { Injectable, BadRequestException } from "@nestjs/common";
import * as dayjs from "dayjs"; // Keep this as a named import to avoid issues.
import { SupabaseService } from "../supabase/supabase.service";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@common/supabase.types";

/**
 * Shape consumed by all booking‑related React e‑mail templates.
 */
export interface BookingEmailPayload {
  recipient: string;
  userName: string;
  location: string;
  pickupDate: string;
  today: string;
  items: {
    item_id: string;
    quantity: number;
    start_date: string;
    end_date: string;
    locationId: string;
    locationName: string;
    translations: {
      fi: { name: string };
      en: { name: string };
    };
  }[];
}

/**
 * Composes a rich e‑mail payload for booking notifications in **one** query
 * round‑trip (thanks to Supabase's nested selects).
 *
 * Usage:
 * ```ts
 * const payload = await assembler.buildPayload(bookingId);
 * const template = BookingCreationEmail(payload);
 * await mailService.sendMail({ to: payload.recipient, template, subject });
 * ```
 */
@Injectable()
export class BookingEmailAssembler {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Build a fully‑hydrated {@link BookingEmailPayload} from an `bookingId`.
   *
   * Queries:
   * 1. `bookings` with nested `booking_items → storage_items → storage_locations`
   * 2. `user_profiles` for the booking owner
   *
   * Also formats dates (DD.MM.YYYY) and maps translations.
   *
   * @throws BadRequestException when either the booking or user is not found.
   */
  async buildPayload(bookingId: string): Promise<BookingEmailPayload> {
    const supabase =
      this.supabaseService.getServiceClient() as SupabaseClient<Database>;

    // Fetch booking with items and related locations
    const { data: bookingDetails, error: bookingError } = await supabase
      .from("view_bookings_with_details")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !bookingDetails) {
      throw new BadRequestException("Could not load booking for email payload");
    }

    // Check if user_id exists before using it
    if (!bookingDetails.user_id) {
      throw new BadRequestException("Booking has no associated user ID");
    }

    // Handle booking items whether they come as a string or already parsed
    let bookingItems: any[] = [];
    if (bookingDetails.booking_items) {
      if (typeof bookingDetails.booking_items === "string") {
        // Parse if it's a string
        bookingItems = JSON.parse(bookingDetails.booking_items);
      } else {
        // If it's already parsed (array or object), use directly
        bookingItems = bookingDetails.booking_items as any[];
      }
    }

    // 2. Load user
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("full_name, email")
      .eq("id", bookingDetails.user_id)
      .single();

    if (userError || !user) {
      throw new BadRequestException("User profile not found for email payload");
    }

    // Get location names for all location_ids in the booking
    const locationIds = [
      ...new Set(bookingItems.map((item) => item.location_id)),
    ];
    const { data: locations, error: locationsError } = await supabase
      .from("storage_locations")
      .select("id, name, address")
      .in("id", locationIds);

    if (locationsError) {
      throw new BadRequestException("Could not fetch location details");
    }

    const locationMap = new Map();
    locations?.forEach((location) => {
      locationMap.set(location.id, {
        name: location.name,
        address: location.address,
      });
    });

    // 3. Enrich items with location information
    const enrichedItems = bookingItems.map((item) => {
      const locationInfo = locationMap.get(item.location_id) || {
        name: "Unknown location",
        address: "",
      };
      const translations = item.storage_items?.translations || {};

      return {
        item_id: item.item_id,
        quantity: item.quantity || 0,
        start_date: item.start_date,
        end_date: item.end_date,
        locationId: item.location_id,
        locationName: locationInfo.name,
        locationAddress: locationInfo.address,
        translations: {
          fi: { name: translations.fi?.item_name || "Unknown" },
          en: { name: translations.en?.item_name || "Unknown" },
        },
      };
    });

    // 4. Derive date & location (use first item's data for backward compatibility)
    const pickupDate =
      enrichedItems.length > 0
        ? dayjs(enrichedItems[0].start_date).format("DD.MM.YYYY")
        : dayjs().format("DD.MM.YYYY");

    // Use the first location as the default location (for backward compatibility)
    const defaultLocation =
      enrichedItems.length > 0
        ? enrichedItems[0].locationName
        : "Unknown location";

    return {
      recipient: user.email || "unknown@incognito.fi",
      userName: user.full_name || "Unknown",
      location: defaultLocation, // Keep for backward compatibility
      pickupDate,
      today: dayjs().format("DD.MM.YYYY"),
      items: enrichedItems,
    };
  }
}
