import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { calculateAvailableQuantity } from "src/utils/booking.utils";
import { MailService } from "../mail/mail.service";
/*import {
  generateBarcodeImage,
  generateInvoicePDF,
  generateVirtualBarcode,
  generateFinnishReferenceNumber,
} from "../utils/invoice-functions";
 import { InvoiceService } from "./invoice.service"; */
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import BookingConfirmationEmail from "src/emails/BookingConfirmationEmail";
import { EmailProps } from "../mail/interfaces/mail.interface";
import { BookingCancelledEmail } from "src/emails/BookingCancelledEmail";
import { start } from "repl";
import BookingCreationEmail from "src/emails/BookingCreationEmail";
import BookingUpdateEmail from "src/emails/BookingUpdateEmail";
import BookingRejectionEmail from "src/emails/BookingRejectionEmail";
import BookingDeleteMail from "src/emails/BookingDeleteMail";
import ItemsReturnedMail from "src/emails/ItemsReturned";
import ItemsPickedUpMail from "src/emails/ItemsPickedUp";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "src/types/supabase.types";
import { Translations } from "./types/translations.types";

@Injectable()
export class BookingService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly mailService: MailService,
  ) {}

  // 1. get all orders
  async getAllOrders(userId: string, supabase: SupabaseClient<Database>) {
    const { data: orders, error } = await supabase.from("orders").select(`
      *,
      order_items (
        *,
        storage_items (
          translations,
          storage_locations (
            name
          )
        )
      )
    `);

    if (error) {
      console.error("Supabase error in getAllOrders():", error);
      throw new BadRequestException("Could not load orders");
    }
    if (!orders || orders.length === 0) {
      throw new BadRequestException("No orders found");
    }

    // get corresponding user profile for each booking (via user_id)
    const ordersWithUserProfiles = await Promise.all(
      orders.map(async (order) => {
        let user: { name: string; email: string } | null = null;

        if (order.user_id) {
          const { data: userData } = await supabase
            .from("user_profiles")
            .select("full_name, email")
            .eq("id", order.user_id)
            .maybeSingle();

          if (userData) {
            user = {
              name: userData.full_name ?? "unknown",
              email: userData.email ?? "unknown@incognito.fi",
            };
          }
        }

        const itemWithNamesAndLocation =
          order.order_items?.map((item) => {
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
          ...order,
          user_profile: user,
          order_items: itemWithNamesAndLocation,
        };
      }),
    );

    return ordersWithUserProfiles;
  }

  // 2. get all bookings of a user
  async getUserBookings(userId: string, supabase: SupabaseClient<Database>) {
    if (!userId || userId === "undefined") {
      throw new BadRequestException("Valid user ID is required");
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          storage_items (
            translations,
            location_id
          )
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        `Supabase error in getUserBookings(): ${JSON.stringify(error)}`,
      );
      throw new Error(`Failed to fetch user bookings: ${error.message}`);
    }

    if (!orders || orders.length === 0) {
      return [];
    }

    // Get unique location_ids from all order_items
    const locationIds = Array.from(
      new Set(
        orders
          .flatMap((order) => order.order_items ?? [])
          .map((item) => item.storage_items?.location_id)
          .filter((id): id is string => !!id),
      ),
    );

    // Load all relevant storage locations
    const { data: locationsData, error: locationError } = await supabase
      .from("storage_locations")
      .select("id, name")
      .in("id", locationIds);

    if (locationError) {
      console.error(
        `Supabase error loading locations: ${JSON.stringify(locationError)}`,
      );
      throw new Error(`Failed to fetch locations: ${locationError.message}`);
    }

    const locationMap = new Map(
      (locationsData ?? []).map((loc) => [loc.id, loc.name]),
    );

    // Add location_name and item_name to each item
    const ordersWithNames = orders.map((order) => ({
      ...order,
      order_items: order.order_items?.map((item) => {
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

    return ordersWithNames;
  }

  // 3. create a Booking
  async createBooking(dto: CreateBookingDto, supabase: SupabaseClient) {
    const userId = dto.user_id;

    if (!userId) {
      throw new BadRequestException("No userId found: user_id is required");
    }
    // variables for date check
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight

    let warningMessage: string | null = null;

    for (const item of dto.items) {
      const { item_id, quantity, start_date, end_date } = item;

      const start = new Date(start_date);
      start.setHours(0, 0, 0, 0);

      const differenceInDays = Math.ceil(
        (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

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

      if (quantity > available) {
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

      if (quantity > storageItem.items_number_currently_in_storage) {
        throw new BadRequestException(
          `Not enough physical stock in storage for item ${item_id}`,
        );
      }
    }

    // 3.3. generate the order number
    const orderNumber = `ORD-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

    // 3.4. Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        order_number: orderNumber,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new BadRequestException("Could not create order");
    }

    // 3.5. Create order items
    for (const item of dto.items) {
      const start = new Date(item.start_date);
      const end = new Date(item.end_date);
      const totalDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );

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

      // insert order item
      const { error: insertError } = await supabase.from("order_items").insert({
        order_id: order.id,
        item_id: item.item_id,
        location_id: storageItem.location_id,
        quantity: item.quantity,
        start_date: item.start_date,
        end_date: item.end_date,
        total_days: totalDays,
        status: "pending",
      });

      if (insertError) {
        throw new BadRequestException("Could not create order items");
      }
    }

    // 3.6 send mail to user:
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      throw new BadRequestException("User not found");
    }

    type EnrichedItem = {
      item_id: string;
      quantity: number;
      start_date: string;
      translations?: {
        fi: { item_name: string };
        en: { item_name: string };
      };
      location_id?: string;
    };

    const enrichedItems: EnrichedItem[] = dto.items || [];

    for (const item of enrichedItems) {
      const { data: storageItem, error: storageItemError } = await supabase
        .from("storage_items")
        .select("translations, location_id")
        .eq("id", item.item_id)
        .single();

      if (storageItemError || !storageItem) {
        throw new BadRequestException("Could not fetch storage item details");
      }

      item.translations = storageItem.translations;
      item.location_id = storageItem.location_id;
    }

    // adapt to email:
    const pickupDate = dayjs(enrichedItems[0].start_date).format("DD.MM.YYYY");

    const { data: location, error: locationError } = await supabase
      .from("storage_locations")
      .select("name, address")
      .eq("id", enrichedItems[0].location_id)
      .single();

    const emailItems = enrichedItems.map((item) => ({
      item_id: item.item_id,
      quantity: item.quantity,
      translations: {
        fi: {
          name: item.translations?.fi.item_name ?? "Unknown",
        },
        en: {
          name: item.translations?.en.item_name ?? "Unknown",
        },
      },
    }));

    const emailData: EmailProps = {
      name: user.full_name,
      email: user.email,
      pickupDate,
      today: dayjs().format("DD.MM.YYYY"),
      location: location?.name,
      items: emailItems,
    };

    await this.mailService.sendMail({
      to: emailData.email,
      subject: "Vastaanotettu varaus - Booking received!",
      template: BookingCreationEmail(emailData),
    });

    // send mail to admin
    const adminEmailData = {
      ...emailData,
      email: "illusia.rental.service@gmail.com",
      name: "Admin",
    };

    await this.mailService.sendMail({
      to: "illusia.rental.service@gmail.com",
      subject:
        "Uusi varaus vastaanotettu (kopio) - odottamassa toimenpiteitä -- New booking received (copy) - waiting for action",
      template: BookingCreationEmail(adminEmailData),
    });

    return warningMessage ? { order, warning: warningMessage } : order;
  }

  // 4. confirm a Booking
  async confirmBooking(
    orderId: string,
    userId: string,
    supabase: SupabaseClient,
  ) {
    // 4.1 check if already confirmed
    const { data: order } = await supabase
      .from("orders")
      .select("status, user_id")
      .eq("id", orderId)
      .single();

    if (!order) throw new BadRequestException("Order not found");

    // prevent re-confirmation
    if (order.status === "confirmed") {
      throw new BadRequestException("Booking is already confirmed");
    }

    // 4.2 Get all the order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("item_id, quantity, start_date, item_id, quantity")
      .eq("order_id", orderId);

    if (itemsError) {
      throw new BadRequestException("Could not load order items");
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

    // 4.4 Change the order status to 'confirmed'
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", orderId);

    if (updateError) {
      throw new BadRequestException("Could not confirm booking");
    }

    // Change the order items' status to 'confirmed'
    const { error: itemsUpdateError } = await supabase
      .from("order_items")
      .update({ status: "confirmed" })
      .eq("order_id", orderId);

    if (itemsUpdateError) {
      throw new BadRequestException("Could not confirm order items");
    }

    // uncomment this when you want the invoice generation inside the app
    /*  // 4.5 create invoice and save to database
    const invoice = new InvoiceService(this.supabaseService);
    invoice.generateInvoice(orderId); */

    // 4.6 send mail to user:
    const today = dayjs().format("DD.MM.YYYY");

    // get user profile
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("full_name, email")
      .eq("id", order.user_id)
      .single();

    if (userError || !user) {
      throw new BadRequestException("Could not load user profile");
    }

    type EnrichedItem = {
      item_id: string;
      quantity: number;
      start_date: string;
      translations?: {
        fi: { item_name: string };
        en: { item_name: string };
      };
      location_id?: string;
    };

    const enrichedItems: EnrichedItem[] = items || [];

    for (const item of enrichedItems) {
      const { data: storageItem, error: storageItemError } = await supabase
        .from("storage_items")
        .select("translations, location_id")
        .eq("id", item.item_id)
        .single();

      if (storageItemError || !storageItem) {
        throw new BadRequestException("Could not fetch storage item details");
      }

      item.translations = storageItem.translations;
      item.location_id = storageItem.location_id;
    }

    // adapt to email:
    const pickupDate = dayjs(enrichedItems[0].start_date).format("DD.MM.YYYY");

    const { data: location, error: locationError } = await supabase
      .from("storage_locations")
      .select("name, address")
      .eq("id", enrichedItems[0].location_id)
      .single();

    const emailItems = enrichedItems.map((item) => ({
      item_id: item.item_id,
      quantity: item.quantity,
      translations: {
        fi: {
          name: item.translations?.fi.item_name ?? "Unknown",
        },
        en: {
          name: item.translations?.en.item_name ?? "Unknown",
        },
      },
    }));

    const emailData: EmailProps = {
      name: user.full_name,
      email: user.email,
      pickupDate,
      today,
      location: location?.name,
      items: emailItems,
    };

    /*  await this.mailService.sendMail({
      to: emailData.email,
      subject: "Varausvahvistus! - Booking confirmed!",
      template: BookingConfirmationEmail(emailData),
    });
 */
    // send mail to admin
    const adminEmailData = {
      ...emailData,
      email: "illusia.rental.service@gmail.com",
      name: "Admin",
    };

    /*   await this.mailService.sendMail({
      to: "illusia.rental.service@gmail.com",
      subject: "Varausvahvistus onnistui - Booking confirmed successfully",
      template: BookingConfirmationEmail(adminEmailData),
    }); */

    return { message: "Booking confirmed" };
  }

  // 5. update a Booking (Admin/SuperVera OR Owner)
  async updateBooking(
    orderId: string,
    userId: string,
    updatedItems: any[],
    supabase: SupabaseClient,
  ) {
    // 5.1 check the order
    const { data: order } = await supabase
      .from("orders")
      .select("status, user_id, order_number")
      .eq("id", orderId)
      .single();

    if (!order) throw new BadRequestException("Order not found");

    // 5.2. check the user role
    const { data: user } = await supabase
      .from("user_profiles")
      .select("role, email, full_name")
      .eq("id", userId)
      .single();

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const isAdmin = user?.role === "admin" || user?.role === "superVera";
    if (
      !(
        user.role === "admin" ||
        userId === order.user_id ||
        user.role === "service_role"
      )
    ) {
      throw new ForbiddenException("Not allowed to update this booking");
    }

    const isOwner = order.user_id === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException("Not allowed to update this booking");
    }

    // 5.4 Status check (users are restricted)
    if (!isAdmin && order.status !== "pending") {
      throw new ForbiddenException(
        "Your order has been confirmed. You can't update it.",
      );
    }

    // 5.3. Delete existing items from order_items to avoid douplicates
    await supabase.from("order_items").delete().eq("order_id", orderId);

    // 5.4. insert updated items with availability check
    for (const item of updatedItems) {
      const { item_id, quantity, start_date, end_date } = item;

      const totalDays = Math.ceil(
        (new Date(end_date).getTime() - new Date(start_date).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // 5.5. Check virtual availability for the time range
      const available = await calculateAvailableQuantity(
        supabase,
        item_id,
        start_date,
        end_date,
      );

      if (quantity > available) {
        throw new BadRequestException(
          `Not enough virtual stock available for item ${item_id}`,
        );
      }

      // 5.6. Fetch location_id
      const { data: storageItem, error: storageError } = await supabase
        .from("storage_items")
        .select("location_id")
        .eq("id", item_id)
        .single();

      if (storageError || !storageItem) {
        throw new BadRequestException(
          `Could not find storage item for item ${item_id}`,
        );
      }

      // 5.7. insert new order item
      const { error: itemInsertError } = await supabase
        .from("order_items")
        .insert({
          order_id: orderId,
          item_id: item.item_id,
          location_id: storageItem.location_id,
          quantity: item.quantity,
          start_date: item.start_date,
          end_date: item.end_date,
          total_days: totalDays,
          status: "pending",
        });
      if (itemInsertError) {
        console.error("Order item insert error:", itemInsertError);
        throw new BadRequestException("Could not create updated order items");
      }
    }
    // 5.8 send mail to user:
    type EnrichedItem = {
      item_id: string;
      quantity: number;
      start_date: string;
      translations?: {
        fi: { item_name: string };
        en: { item_name: string };
      };
      location_id?: string;
    };

    const enrichedItems: EnrichedItem[] = updatedItems || [];

    for (const item of enrichedItems) {
      const { data: storageItem, error: storageItemError } = await supabase
        .from("storage_items")
        .select("translations, location_id")
        .eq("id", item.item_id)
        .single();

      if (storageItemError || !storageItem) {
        throw new BadRequestException("Could not fetch storage item details");
      }

      item.translations = storageItem.translations;
      item.location_id = storageItem.location_id;
    }

    // adapt to email:
    const pickupDate = dayjs(enrichedItems[0].start_date).format("DD.MM.YYYY");

    const { data: location, error: locationError } = await supabase
      .from("storage_locations")
      .select("name, address")
      .eq("id", enrichedItems[0].location_id)
      .single();

    const emailItems = enrichedItems.map((item) => ({
      item_id: item.item_id,
      quantity: item.quantity,
      translations: {
        fi: {
          name: item.translations?.fi.item_name ?? "Unknown",
        },
        en: {
          name: item.translations?.en.item_name ?? "Unknown",
        },
      },
    }));

    const emailData: EmailProps = {
      name: user.full_name,
      email: user.email,
      pickupDate,
      today: dayjs().format("DD.MM.YYYY"),
      location: location?.name,
      items: emailItems,
    };

    /* await this.mailService.sendMail({
      to: emailData.email,
      subject: "Varaus päivitetty - Booking updated",
      template: BookingUpdateEmail(emailData),
    }); */

    // send mail to admin
    const adminEmailData = {
      ...emailData,
      email: "illusia.rental.service@gmail.com",
      name: "Admin",
    };

    /*  await this.mailService.sendMail({
      to: "illusia.rental.service@gmail.com",
      subject: "Varaus päivitetty - Booking updated - waiting to be confirmed",
      template: BookingUpdateEmail(adminEmailData),
    }); */

    const { data: updatedOrder, error: orderError } = await supabase
      .from("orders")
      .select(
        `
    *,
    order_items (
      *,
      storage_items (
        translations
      )
    )
  `,
      )
      .eq("id", orderId)
      .single();

    if (orderError || !updatedOrder) {
      throw new BadRequestException("Could not fetch updated booking details");
    }

    return {
      message: "Booking updated",
      booking: updatedOrder,
    };
  }

  // 6. reject a Booking (Admin/SuperVera only)
  async rejectBooking(
    orderId: string,
    userId: string,
    supabase: SupabaseClient,
  ) {
    // check if already rejected
    const { data: order } = await supabase
      .from("orders")
      .select("status, user_id, order_number")
      .eq("id", orderId)
      .single();

    if (!order) throw new BadRequestException("Order not found");

    // prevent re-rejection
    if (order.status === "rejected") {
      throw new BadRequestException("Booking is already rejected");
    }

    // 6.1 user role check
    const { data: user } = await supabase
      .from("user_profiles")
      .select("role, email, full_name")
      .eq("id", userId)
      .single();

    if (!user) {
      throw new ForbiddenException("User not found");
    }

    const isAdmin = ["admin", "superVera"].includes(user.role?.trim());

    if (!isAdmin) {
      throw new ForbiddenException("Only admins can reject bookings");
    }

    // fetch order items for email
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("item_id, quantity, start_date, end_date")
      .eq("order_id", orderId);

    if (orderItemsError || !orderItems) {
      throw new BadRequestException(
        "Could not fetch order items for rejection",
      );
    }

    // 6.2 set order_item status to cancelled
    const { error: itemUpdateError } = await supabase
      .from("order_items")
      .update({ status: "cancelled" }) // Trigger watches for change
      .eq("order_id", orderId);

    if (itemUpdateError) {
      console.error("Order items update error:", itemUpdateError);
      throw new BadRequestException(
        "Could not update order items for cancellation",
      );
    }

    // 6.3 set order status to rejected
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "rejected" })
      .eq("id", orderId);

    if (updateError) {
      console.error("Failed to reject booking:", updateError);
      throw new BadRequestException("Could not reject the booking");
    }

    // 6.6 send mail to user:
    const today = dayjs().format("DD.MM.YYYY");

    // get user profile
    type EnrichedItem = {
      item_id: string;
      quantity: number;
      start_date: string;
      translations?: {
        fi: { item_name: string };
        en: { item_name: string };
      };
      location_id?: string;
    };

    const enrichedItems: EnrichedItem[] = orderItems || [];

    for (const item of enrichedItems) {
      const { data: storageItem, error: storageItemError } = await supabase
        .from("storage_items")
        .select("translations, location_id")
        .eq("id", item.item_id)
        .single();

      if (storageItemError || !storageItem) {
        throw new BadRequestException("Could not fetch storage item details");
      }

      item.translations = storageItem.translations;
      item.location_id = storageItem.location_id;
    }

    // adapt to email:
    const pickupDate = dayjs(enrichedItems[0].start_date).format("DD.MM.YYYY");

    const { data: location, error: locationError } = await supabase
      .from("storage_locations")
      .select("name, address")
      .eq("id", enrichedItems[0].location_id)
      .single();

    const emailItems = enrichedItems.map((item) => ({
      item_id: item.item_id,
      quantity: item.quantity,
      translations: {
        fi: {
          name: item.translations?.fi.item_name ?? "Unknown",
        },
        en: {
          name: item.translations?.en.item_name ?? "Unknown",
        },
      },
    }));

    const emailData: EmailProps = {
      name: user.full_name,
      email: user.email,
      pickupDate,
      today,
      location: location?.name,
      items: emailItems,
    };

    /*    await this.mailService.sendMail({
      to: emailData.email,
      subject: "Varaus hylätty - Booking rejected!",
      template: BookingRejectionEmail(emailData),
    }); */

    // send mail to admin
    const adminEmailData = {
      ...emailData,
      email: "illusia.rental.service@gmail.com",
      name: "Admin",
    };

    /*   await this.mailService.sendMail({
      to: "illusia.rental.service@gmail.com",
      subject: "Varaus hylätty - Booking rejected sucessfully - (copy)",
      template: BookingRejectionEmail(adminEmailData),
    }); */

    return { message: "Booking rejected" };
  }

  // 7. cancel a Booking (User if not confirmed, Admins/SuperVera always)
  async cancelBooking(
    orderId: string,
    userId: string,
    supabase: SupabaseClient,
  ) {
    // 7.1 check order status
    const { data: order } = await supabase
      .from("orders")
      .select("status, user_id, order_number")
      .eq("id", orderId)
      .single();

    if (!order) throw new BadRequestException("Order not found");

    // prevent re-cancellation
    const finalStates = new Set(["cancelled by user", "cancelled by admin"]);

    if (finalStates.has(order.status)) {
      throw new BadRequestException(`Booking has already been ${order.status}`);
    }

    // get user profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from("user_profiles")
      .select("role, email, full_name")
      .eq("id", userId)
      .single();

    if (userProfileError || !userProfile) {
      throw new BadRequestException("User profile not found");
    }

    // 7.2 permissions check

    const isAdmin = ["admin", "superVera"].includes(userProfile.role?.trim());
    const isOwner = order.user_id === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException("You can only cancel your own bookings");
    }

    if (!isAdmin && order.status === "confirmed") {
      throw new ForbiddenException(
        "You can't cancel a booking that has already been confirmed",
      );
    }

    // 7.5 Cancel all related order_items
    const { error: itemUpdateError } = await supabase
      .from("order_items")
      .update({ status: "cancelled" })
      .eq("order_id", orderId);

    if (itemUpdateError) {
      console.error("Order items update error:", itemUpdateError);
      throw new BadRequestException(
        "Could not update order items for cancellation",
      );
    }

    // 7.4 update order_items
    const { error } = await supabase
      .from("orders")
      .update({ status: isAdmin ? "cancelled by admin" : "cancelled by user" })
      .eq("id", orderId);

    if (error) {
      throw new BadRequestException("Could not cancel the booking");
    }

    // 7.6 Fetch order items for email details
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("item_id, quantity, start_date, end_date")
      .eq("order_id", orderId);

    if (orderItemsError || !orderItems) {
      throw new BadRequestException(
        "Could not fetch order items for cancellation",
      );
    }

    // 7.7 send email to user
    type EnrichedItem = {
      item_id: string;
      quantity: number;
      start_date: string;
      end_date: string;
      translations?: {
        fi: { item_name: string };
        en: { item_name: string };
      };
      location_id?: string;
    };

    const enrichedItems: EnrichedItem[] = orderItems || [];

    for (const item of enrichedItems) {
      const { data: storageItem, error: storageItemError } = await supabase
        .from("storage_items")
        .select("translations, location_id")
        .eq("id", item.item_id)
        .single();

      if (storageItemError || !storageItem) {
        throw new BadRequestException("Could not fetch storage item details");
      }
      item.translations = storageItem.translations;
      item.location_id = storageItem.location_id;
    }

    const startDate = dayjs(orderItems[0].start_date).format("DD.MM.YYYY");
    const emailItems = enrichedItems.map((item) => ({
      item_id: item.item_id,
      quantity: item.quantity,
      start_date: item.start_date,
      end_date: item.end_date,
      translations: {
        fi: {
          name: item.translations?.fi.item_name ?? "Unknown",
        },
        en: {
          name: item.translations?.en.item_name ?? "Unknown",
        },
      },
    }));

    const { data: orderNum } = await supabase
      .from("orders")
      .select("order_number")
      .eq("id", orderId)
      .single();

    // send mail
    /*    await this.mailService.sendMail({
      to: userProfile.email,
      subject: "Varaus peruttu - Booking Cancelled",
      template: BookingCancelledEmail({
        orderId: orderNum?.order_number?.toString() ?? "Unknown",
        startDate,
        items: emailItems,
        recipientRole: "user", // TODO: set dynamically!!!
      }),
    }); */

    // send mail to admin
    /*   await this.mailService.sendMail({
      to: "illusia.rental.service@gmail.com",
      subject: "Varaus peruttu - Booking Cancelled",
      template: BookingCancelledEmail({
        orderId: orderNum?.order_number?.toString() ?? "Unknown",
        startDate,
        items: emailItems,
        recipientRole: "admin",
      }),
    }); */

    return {
      message: `Booking cancelled by ${isAdmin ? "admin" : "user"}`,
      orderId,
      cancelledBy: isAdmin ? "admin" : "user",
      items: orderItems.map((item) => ({
        item_id: item.item_id,
        quantity: item.quantity,
        start_date: item.start_date,
        end_date: item.end_date,
      })),
    };
  }

  // 8. delete a Booking and mark it as deleted
  async deleteBooking(
    orderId: string,
    userId: string,
    supabase: SupabaseClient,
  ) {
    // 8.1 check order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("status, user_id, order_number")
      .eq("id", orderId)
      .single();

    if (orderError || !order) throw new BadRequestException("Order not found");

    // prevent re-deletion
    if (order.status === "deleted") {
      throw new BadRequestException("Booking is already deleted");
    }

    // 8.2 check user role
    const { data: userProfile, error: userProfileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (userProfileError || !userProfile) {
      throw new BadRequestException("User profile not found");
    }

    const isAdmin = ["admin", "superVera"].includes(userProfile.role?.trim());

    if (!isAdmin) {
      throw new ForbiddenException(
        "You are not allowed to delete this booking",
      );
    }

    // 8.3 cancel all related order_items to restore virtual stock
    const { error: itemUpdateError } = await supabase
      .from("order_items")
      .update({ status: "cancelled" })
      .eq("order_id", orderId);

    if (itemUpdateError) {
      console.error("Order items update error:", itemUpdateError);
      throw new BadRequestException("Could not cancel related order items");
    }

    // 8.4 fetch order_items for email
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("item_id, quantity, start_date, end_date")
      .eq("order_id", orderId);

    if (orderItemsError || !orderItems) {
      throw new BadRequestException("Could not fetch order items for email");
    }

    // 8.5 Soft-delete the order (update only)
    const deletedAt = new Date().toISOString();
    const { error: deleteError } = await supabase
      .from("orders")
      .update({
        status: "deleted",
      })
      .eq("id", orderId);

    if (deleteError) {
      throw new BadRequestException("Could not mark booking as deleted");
    }

    // 8.6 send notification email to admin
    const adminEmailDataObject = {
      order: order.order_number,
      email: "illusia.rental.service@gmail.com",
      name: "Admin",
    };

    /*     await this.mailService.sendMail({
      to: "illusia.rental.service@gmail.com",
      subject: "Varaus poistettu - Booking deleted",
      template: BookingDeleteMail(adminEmailDataObject),
    }); */

    return {
      message: "Booking deleted",
    };
  }

  // 9. return items (when items are brought back)
  async returnItems(orderId: string, userId: string, supabase: SupabaseClient) {
    const { data: items } = await supabase
      .from("order_items")
      .select("item_id, quantity, status")
      .eq("order_id", orderId);

    if (!items || items.length === 0) {
      throw new BadRequestException("No items found for return");
    }

    for (const item of items) {
      if (item.status === "returned") {
        throw new BadRequestException("Items are already returned");
      }
    }

    // set order status to completed
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId);

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
        .single();

      if (error || !storageItem) {
        throw new BadRequestException("Could not find item in storage");
      }

      const updatedCount =
        (storageItem.items_number_currently_in_storage || 0) + item.quantity;

      const { error: updateItemsError } = await supabase
        .from("storage_items")
        .update({ items_number_currently_in_storage: updatedCount })
        .eq("id", item.item_id);

      if (updateItemsError) {
        throw new BadRequestException("Failed to update storage stock");
      }
    }

    //  Fetch user email
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      throw new BadRequestException(
        "User profile not found for email notification",
      );
    }

    // send mail to user:
    const today = dayjs().format("DD.MM.YYYY");

    type EnrichedItem = {
      item_id: string;
      quantity: number;
      status: string;
      translations?: {
        fi: { item_name: string };
        en: { item_name: string };
      };
      location_id?: string;
    };

    const enrichedItems: EnrichedItem[] = items || [];

    for (const item of enrichedItems) {
      const { data: storageItem, error: storageItemError } = await supabase
        .from("storage_items")
        .select("translations, location_id")
        .eq("id", item.item_id)
        .single();

      if (storageItemError || !storageItem) {
        throw new BadRequestException("Could not fetch storage item details");
      }

      item.translations = storageItem.translations;
      item.location_id = storageItem.location_id;
    }

    // adapt to email:
    const { data: location, error: locationError } = await supabase
      .from("storage_locations")
      .select("name, address")
      .eq("id", enrichedItems[0].location_id)
      .single();

    const emailItems = enrichedItems.map((item) => ({
      item_id: item.item_id,
      quantity: item.quantity,
      translations: {
        fi: {
          name: item.translations?.fi.item_name ?? "Unknown",
        },
        en: {
          name: item.translations?.en.item_name ?? "Unknown",
        },
      },
    }));

    const emailData = {
      name: user.full_name,
      email: user.email,
      today,
      location: location?.name,
      items: emailItems,
    };

    /*   await this.mailService.sendMail({
      to: emailData.email,
      subject: "Palautetut tuotteet - Items returned",
      template: ItemsReturnedMail(emailData),
    }); */

    // send mail to admin
    const adminEmailData = {
      ...emailData,
      email: "illusia.rental.service@gmail.com",
      name: "Admin",
    };

    /*  await this.mailService.sendMail({
      to: "illusia.rental.service@gmail.com",
      subject: "Palautetut tuotteet - Items returned",
      template: ItemsReturnedMail(adminEmailData),
    }); */

    return { message: "Items returned successfully" };
  }

  // 10. confirm pickup of items
  async confirmPickup(orderId: string, supabase: SupabaseClient) {
    const today = new Date().toISOString().split("T")[0];

    // 10.1. Get the order item
    const { data: items } = await supabase
      .from("order_items")
      .select("item_id, quantity, status, start_date, end_date")
      .eq("order_id", orderId);

    if (!items || items.length === 0) {
      throw new BadRequestException("No items found for return");
    }

    for (const item of items) {
      if (item.status === "picked_up")
        throw new BadRequestException("Items are already picked_up");

      if (item.status !== "confirmed") {
        throw new BadRequestException(
          "Order item is not confirmed and can't be picked up",
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

      // 10.4. Update order item status to "picked_up"
      const { error: updateStatusError } = await supabase
        .from("order_items")
        .update({ status: "picked_up" })
        .eq("id", item.item_id);

      if (updateStatusError) {
        throw new BadRequestException("Failed to update order item status");
      }
    }

    // 10.5. Get user email from related order
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single();

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("email, full_name")
      .eq("id", order.user_id)
      .single();

    if (userError || !user) {
      throw new BadRequestException(
        "User profile not found for email notification",
      );
    }
    // send mail to user:
    type EnrichedItem = {
      item_id: string;
      quantity: number;
      status: string;
      translations?: {
        fi: { item_name: string };
        en: { item_name: string };
      };
      location_id?: string;
    };

    const enrichedItems: EnrichedItem[] = items || [];

    for (const item of enrichedItems) {
      const { data: storageItem, error: storageItemError } = await supabase
        .from("storage_items")
        .select("translations, location_id")
        .eq("id", item.item_id)
        .single();

      if (storageItemError || !storageItem) {
        throw new BadRequestException("Could not fetch storage item details");
      }

      item.translations = storageItem.translations;
      item.location_id = storageItem.location_id;
    }

    // adapt to email:
    const { data: location, error: locationError } = await supabase
      .from("storage_locations")
      .select("name, address")
      .eq("id", enrichedItems[0].location_id)
      .single();

    const emailItems = enrichedItems.map((item) => ({
      item_id: item.item_id,
      quantity: item.quantity,
      translations: {
        fi: {
          name: item.translations?.fi.item_name ?? "Unknown",
        },
        en: {
          name: item.translations?.en.item_name ?? "Unknown",
        },
      },
    }));

    const emailData = {
      name: user.full_name,
      email: user.email,
      location: location?.name,
      pickupDate: items[0].start_date,
      items: emailItems,
    };

    /*     await this.mailService.sendMail({
      to: emailData.email,
      subject: "Noudetut tuotteet - Items picked up",
      template: ItemsPickedUpMail(emailData),
    });
 */
    // send mail to admin
    const adminEmailData = {
      ...emailData,
      email: "illusia.rental.service@gmail.com",
      name: "Admin",
    };

    /*    await this.mailService.sendMail({
      to: "illusia.rental.service@gmail.com",
      subject: "Noudetut tuotteet - Items picked up",
      template: ItemsPickedUpMail(adminEmailData),
    }); */

    return {
      message: `Pickup confirmed for order ${orderId}`,
    };
  }

  // 11. check availability of item by date range
  async checkAvailability(
    itemId: string,
    startDate: string,
    endDate: string,
    userId: string,
  ) {
    //const supabase = await this.supabaseService.getClientByRole(userId);
    const supabase = this.supabaseService.getServiceClient(); //TODO:remove later

    // Sum all overlapping bookings
    const { data: overlappingOrders, error: overlapError } = await supabase
      .from("order_items")
      .select("quantity")
      .eq("item_id", itemId) // item_id = :itemId
      .lte("start_date", endDate) // AND start_date <= :endDate
      .gte("end_date", startDate); // AND end_date   >= :startDate

    if (overlapError) {
      throw new BadRequestException("Error checking overlapping bookings");
    }

    const alreadyBookedQuantity =
      overlappingOrders?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ??
      0;

    // Get total quantity of item from storage
    const { data: itemData, error: itemError } = await supabase
      .from("storage_items")
      .select("items_number_total")
      .eq("id", itemId)
      .single();

    if (itemError || !itemData) {
      throw new BadRequestException("Item data not found");
    }

    const availableQuantity =
      itemData.items_number_total - alreadyBookedQuantity;

    return {
      item_id: itemId,
      availableQuantity,
      alreadyBookedQuantity,
      totalQuantity: itemData.items_number_total,
      startDate,
      endDate,
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

  // 13. Update payment status
  async updatePaymentStatus(
    orderId: string,
    status: "invoice-sent" | "paid" | "payment-rejected" | "overdue" | null,
  ) {
    const supabase = this.supabaseService.getServiceClient();

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .single();

    if (!order || orderError) {
      throw new BadRequestException("Order not found");
    }

    // Update payment_status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ payment_status: status })
      .eq("id", orderId);

    if (updateError) {
      console.error("Supabase error in updatePaymentStatus():", updateError);
      throw new BadRequestException("Failed to update payment status");
    }

    return {
      message: `Payment status updated to '${status}' for order ${orderId}`,
    };
  }
}
