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
  getUniqueLocationIDs,
} from "src/utils/booking.utils";
import { MailService } from "../mail/mail.service";
import { BookingMailType } from "../mail/interfaces/mail.interface";
/*import {
  generateBarcodeImage,
  generateInvoicePDF,
  generateVirtualBarcode,
  generateFinnishReferenceNumber,
} from "../utils/invoice-functions";
 import { InvoiceService } from "./invoice.service"; */
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "src/types/supabase.types";
import { Translations } from "./types/translations.types";
import {
  CancelBookingResponse,
  BookingItem,
  BookingItemRow,
  BookingWithItems,
  StorageItemsRow,
  UserProfilesRow,
  BookingRow,
  ValidBookingOrder,
} from "./types/booking.interface";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";
import { StorageLocationsService } from "../storage-locations/storage-locations.service";
import { BookingItemsService } from "../booking_items/booking-items.service";
dayjs.extend(utc);
@Injectable()
export class BookingService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly mailService: MailService,
    private readonly locationsService: StorageLocationsService,
    private readonly bookingItemsService: BookingItemsService,
  ) {}

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

    const {
      data: bookings,
      error,
      count,
    } = await supabase
      .from("bookings")
      .select(
        `
        *,
        booking_items (
          *,
          storage_items (
            translations,
            location_id
          )
        )
      `,
        { count: "exact" },
      )
      .eq("user_id", userId)
      .booking("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error(
        `Supabase error in getUserBookings(): ${JSON.stringify(error)}`,
      );
      throw new Error(`Failed to fetch user bookings: ${error.message}`);
    }

    if (!bookings || bookings.length === 0) {
      return [];
    }

    // Get unique location_ids from all booking_items
    const locationIds = getUniqueLocationIDs(bookings);

    // Load all relevant storage locations
    const result = await this.locationsService.getMatchingLocations(
      { id: locationIds },
      ["id", "name"],
    );

    const { data: locationsData, error: locationsError } = result;

    if (locationsError) {
      console.error(
        `Supabase error loading locations: ${JSON.stringify(locationsError)}`,
      );
      throw new Error(`Failed to fetch locations: ${locationsError.message}`);
    }

    const locationMap = new Map(
      (locationsData ?? []).map((loc) => [loc.id, loc.name]),
    );
    const metadata = getPaginationMeta(count, page, limit);

    // Add location_name and item_name to each item
    const bookingsWithNames = bookings.map((booking) => ({
      ...booking,
      booking_items: booking.booking_items?.map((item) => {
        const translations = item.storage_items
          ?.translations as Translations | null;
        return {
          ...item,
          item_name: translations?.en?.item_name ?? "Unknown",
          location_name:
            locationMap.get(item.storage_items?.location_id ?? "") ??
            "Unknown Location",
        };
      }),
    }));

    return { ...result, data: bookingsWithNames, metadata };
  }

  // 3. create a Booking
  async createBooking(
    dto: CreateBookingDto,
    supabase: SupabaseClient<Database>,
  ) {
    const userId = dto.user_id;

    if (!userId) {
      throw new BadRequestException("No userId found: user_id is required");
    }
    // variables for date check
    let warningMessage: string | null = null;

    for (const item of dto.items) {
      const { item_id, quantity, start_date, end_date } = item;

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
        .select("items_number_currently_in_storage")
        .eq("id", item_id)
        .single();

      if (itemError || !storageItem) {
        throw new BadRequestException("Storage item data not found");
      }

      const currentStock = storageItem.items_number_currently_in_storage ?? 0;
      if (quantity > currentStock) {
        throw new BadRequestException(
          `Not enough physical stock in storage for item ${item_id}`,
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

    // 3.5. Create booking items
    for (const item of dto.items) {
      const start = new Date(item.start_date);
      const end = new Date(item.end_date);
      const totalDays = calculateDuration(start, end);

      // get location_id
      const { data: storageItem, error: locationError } = await supabase
        .from("storage_items")
        .select("location_id")
        .eq("id", item.item_id)
        .single();

      if (locationError || !storageItem) {
        throw new BadRequestException(
          `Location ID not found for item ${item.item_id}`,
        );
      }

      // insert booking item
      const { error: insertError } = await supabase
        .from("booking_items")
        .insert({
          booking_id: booking.id,
          item_id: item.item_id,
          location_id: storageItem.location_id,
          quantity: item.quantity,
          start_date: item.start_date,
          end_date: item.end_date,
          total_days: totalDays,
          status: "pending",
        });

      if (insertError) {
        throw new BadRequestException("Could not create booking items");
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
        .select("items_number_currently_in_storage")
        .eq("id", item.item_id)
        .single();

      if (storageItemError || !storageItem) {
        throw new BadRequestException("Could not fetch storage item details");
      }

      // check if stock is enough
      if (storageItem.items_number_currently_in_storage < item.quantity) {
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
    updatedItems: BookingItem[],
    supabase: SupabaseClient,
  ) {
    // 5.1 check the booking
    const { data: booking } = await supabase
      .from("bookings")
      .select("status, user_id, booking_number")
      .eq("id", booking_id)
      .single();

    if (!booking) throw new BadRequestException("Booking not found");

    // 5.2. check the user role
    const { data: user } = await supabase
      .from("user_profiles")
      .select("role, email, full_name")
      .eq("id", userId)
      .single();

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const isAdmin = ["admin", "superVera", "service_role"].includes(user.role);
    const isOwner = booking.user_id === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException("Not allowed to update this booking");
    }

    // 5.4 Status check (users are restricted)
    if (!isAdmin && booking.status !== "pending") {
      throw new ForbiddenException(
        "Your booking has been confirmed. You can't update it.",
      );
    }

    // 5.3. Delete existing items from booking_items to avoid duplicates
    await this.bookingItemsService.removeAllBookingItems(supabase, booking_id);

    // 5.4. insert updated items with availability check
    for (const item of updatedItems) {
      const { item_id, quantity, start_date, end_date } = item;

      const totalDays = calculateDuration(
        new Date(start_date),
        new Date(end_date),
      );

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

      // 5.6. Fetch location_id
      const { data: storageItem, error: storageError } = await supabase
        .from("storage_items")
        .select("location_id")
        .eq("id", item_id)
        .single<StorageItemsRow>();

      if (storageError || !storageItem) {
        throw new BadRequestException(
          `Could not find storage item for item ${item_id}`,
        );
      }

      // 5.7. insert new booking item
      const newBookingItem = {
        booking_id: booking_id,
        item_id: item.item_id,
        location_id: storageItem.location_id,
        quantity: item.quantity,
        start_date: item.start_date,
        end_date: item.end_date,
        total_days: totalDays,
        status: "pending",
      };

      const { error: itemInsertError } =
        await this.bookingItemsService.createBookingItem(
          supabase,
          newBookingItem,
        );

      if (itemInsertError) {
        console.error("Booking item insert error:", itemInsertError);
        throw new BadRequestException("Could not create updated booking items");
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
  async rejectBooking(
    bookingId: string,
    userId: string,
    supabase: SupabaseClient,
  ) {
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

    // 6.1 user role check
    const { data: user } = await supabase
      .from("user_profiles")
      .select("role, email, full_name")
      .eq("id", userId)
      .single<UserProfilesRow>();

    if (!user) {
      throw new ForbiddenException("User not found");
    }

    const isAdmin = ["admin", "superVera"].includes(user.role?.trim());

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
    supabase: SupabaseClient,
  ): Promise<CancelBookingResponse> {
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

    // get user profile
    // We should think about replacing these kinds of querries with just checking the request for the information we need. -Jon
    const { data: userProfile, error: userProfileError } = await supabase
      .from("user_profiles")
      .select("role, email, full_name")
      .eq("id", userId)
      .single<UserProfilesRow>();

    if (userProfileError || !userProfile) {
      throw new BadRequestException("User profile not found");
    }

    // 7.2 permissions check

    const isAdmin = ["admin", "superVera"].includes(userProfile.role?.trim());
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
  async deleteBooking(
    bookingId: string,
    userId: string,
    supabase: SupabaseClient,
  ) {
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

    // 8.2 check user role
    const { data: userProfile, error: userProfileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single<UserProfilesRow>();

    if (userProfileError || !userProfile) {
      throw new BadRequestException("User profile not found");
    }

    const isAdmin = ["admin", "superVera"].includes(userProfile.role?.trim());

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
   * Get bookings in an bookinged list
   * @param supabase The supabase client provided by request
   * @param page What page number is requested
   * @param limit How many rows to retrieve
   * @param ascending If to sort booking smallest-largest (e.g a-z) or descending (z-a). Default true / ascending.
   * @param filter What to filter the bookings by
   * @param booking_by What column to booking the columns by. Default "booking_number"
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
      .order(order_by ?? "order_number", { ascending: ascending });

    if (status_filter) query.eq("status", status_filter);
    // Match any field if there is a searchquery
    if (searchquery) {
      query.or(
        `order_number.ilike.%${searchquery}%,` +
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
}
