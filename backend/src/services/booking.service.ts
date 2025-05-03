import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import { CreateBookingDto } from "../dto/create-booking.dto";
import { calculateAvailableQuantity } from "src/utils/booking.utils";

@Injectable()
export class BookingService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // TODO!:
  // use getClientByRole again!
  // refactor code so that the supabase client is not created in every function
  // every function should update the order_items status to "pending", "confirmed" or "cancelled"

  /*
ORDER ITEM STATUS:
status::text = ANY (ARRAY['pending'::character varying, 'confirmed'::character varying, 'cancelled'::character varying, 'picked_up'::character varying, 'returned'::character varying]::text[])
  */

  // 1. get all orders
  async getAllOrders(userId: string) {
    //const supabase = await this.supabaseService.getClientByRole(userId);
    const supabase = this.supabaseService.getServiceClient(); //TODO:remove later

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
              name: userData.full_name,
              email: userData.email,
            };
          }
        }

        const itemWithNamesAndLocation =
          order.order_items?.map((item) => ({
            ...item,
            item_name:
              item.storage_items?.translations?.en?.item_name ?? "Unknown",
            location_name:
              item.storage_items?.storage_locations?.name ?? "Unknown",
          })) ?? [];

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
  async getUserBookings(userId: string) {
    //const supabase = await this.supabaseService.getClientByRole(userId);
    const supabase = this.supabaseService.getServiceClient(); //TODO:remove later

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
      order_items: order.order_items?.map((item) => ({
        ...item,
        item_name: item.storage_items?.translations?.en?.item_name ?? "Unknown",
        location_name:
          locationMap.get(item.storage_items?.location_id) ??
          "Unknown Location",
      })),
    }));

    return ordersWithNames;
  }

  // 3. create a Booking
  async createBooking(dto: CreateBookingDto) {
    //const supabase = await this.supabaseService.getClientByRole(userId);
    const supabase = this.supabaseService.getServiceClient(); //TODO:remove later

    const userId = dto.user_id;

    if (!userId) {
      throw new BadRequestException("No userId found: user_id is required");
    }

    for (const item of dto.items) {
      const { item_id, quantity, start_date, end_date } = item;

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

    return order;
  }

  // 4. confirm a Booking
  async confirmBooking(orderId: string, userId: string) {
    //const supabase = await this.supabaseService.getClientByRole(userId);
    const supabase = this.supabaseService.getServiceClient(); //TODO:remove later

    // Get all the order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("item_id, quantity")
      .eq("order_id", orderId);

    if (itemsError) {
      throw new BadRequestException("Could not load order items");
    }

    // check availability of the items
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

    // Change the order status to 'confirmed'
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

    return { message: "Booking confirmed" };
  }

  // 5. update a Booking (Admin/SuperVera OR Owner)
  async updateBooking(orderId: string, userId: string, updatedItems: any[]) {
    //const supabase = await this.supabaseService.getClientByRole(userId);
    const supabase = this.supabaseService.getServiceClient(); //TODO:remove later

    // 5.1 check the order
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single();

    if (!order) throw new BadRequestException("Order not found");

    // 5.2. check the user role
    const { data: user } = await supabase
      .from("user_profiles")
      .select("role")
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
    return { message: "Booking updated" };
  }

  // 6. reject a Booking (Admin/SuperVera only)
  async rejectBooking(orderId: string, userId: string) {
    //const supabase = await this.supabaseService.getClientByRole(userId);
    const supabase = this.supabaseService.getServiceClient(); //TODO:remove later

    // 6.1 user role check
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!user) {
      throw new ForbiddenException("User not found");
    }

    const role = user.role?.trim();

    if (role !== "admin" && role !== "superVera") {
      throw new ForbiddenException("Only admins can reject bookings");
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

    return { message: "Booking rejected" };
  }

  // 7. cancel a Booking (User if not confirmed, Admins/SuperVera always)
  async cancelBooking(orderId: string, userId: string) {
    //const supabase = await this.supabaseService.getClientByRole(userId);
    const supabase = this.supabaseService.getServiceClient(); //TODO:remove later

    // 7.1 check user role
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single<{
        user_id: string;
        status: string;
      }>();

    if (!order) throw new BadRequestException("Order not found");

    const { data: userProfile, error: userProfileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (userProfileError || !userProfile) {
      throw new BadRequestException("User profile not found");
    }

    const isAdmin =
      userProfile.role === "admin" || userProfile.role === "superVera";
    const isOwner = order.user_id === userId;

    // 7.2 permissions check
    if (!isAdmin) {
      if (!isOwner) {
        throw new ForbiddenException("You can only cancel your own bookings");
      }
      if (!isAdmin && order.status === "confirmed") {
        throw new ForbiddenException(
          "You can't cancel a booking that has already been confirmed",
        );
      }
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

    return {
      message: `Booking cancelled by ${isAdmin ? "admin" : "user"}`,
    };
  }

  // 8. delete a Booking and mark it as deleted
  async deleteBooking(orderId: string, userId: string) {
    //const supabase = await this.supabaseService.getClientByRole(userId);
    const supabase = this.supabaseService.getServiceClient(); //TODO:remove later

    // 8.1 check order in database
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single();

    if (!order) throw new BadRequestException("Order not found");

    // 8.2 check user role
    const { data: userProfile, error: userProfileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (userProfileError || !userProfile) {
      throw new BadRequestException("User profile not found");
    }

    const isAdmin =
      userProfile.role === "admin" || userProfile.role === "superVera";

    if (!isAdmin) {
      throw new ForbiddenException(
        "You are not allowed to delete this booking",
      );
    }

    // 8.3 ancel all related order_items to restore virtual stock
    const { error: itemUpdateError } = await supabase
      .from("order_items")
      .update({ status: "cancelled" })
      .eq("order_id", orderId);

    if (itemUpdateError) {
      console.error("Order items update error:", itemUpdateError);
      throw new BadRequestException("Could not cancel related order items");
    }

    // 8.4 Soft-delete the order (update only)
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

    return {
      message: "Booking deleted (soft delete)",
    };
  }

  // 9. return items (when items are brought back)
  async returnItems(orderId: string, userId: string) {
    //const supabase = await this.supabaseService.getClientByRole(userId);
    const supabase = this.supabaseService.getServiceClient(); //TODO:remove later

    const { data: items } = await supabase
      .from("order_items")
      .select("item_id, quantity")
      .eq("order_id", orderId);

    if (!items || items.length === 0) {
      throw new BadRequestException("No items found for return");
    }

    for (const item of items) {
      await supabase.rpc("increment_item_quantity", {
        item_id: item.item_id,
        quantity: item.quantity,
      });
    }

    return { message: "Items returned successfully" };
  }

  // 10. check availability of item by date range
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
      .eq("item_id", itemId)
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

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

  // 11. confirm pickup of items
  async confirmPickup(orderItemId: string) {
    const supabase = this.supabaseService.getServiceClient();
    const today = new Date().toISOString().split("T")[0];

    // 11.1. Get the order item
    const { data: orderItem, error: itemError } = await supabase
      .from("order_items")
      .select("item_id, quantity, start_date, end_date, status")
      .eq("id", orderItemId)
      .single();

    if (itemError || !orderItem) {
      throw new BadRequestException("Order item not found");
    }

    if (orderItem.status !== "confirmed") {
      throw new BadRequestException("Order item is not confirmed");
    }

    if (orderItem.start_date > today) {
      throw new BadRequestException(
        "Cannot confirm pickup before the booking start date",
      );
    }

    if (orderItem.end_date < today) {
      throw new BadRequestException(
        "Booking period has already ended. Pickup not allowed.",
      );
    }

    // 11.2. Get associated storage item
    const { data: storageItem, error: storageError } = await supabase
      .from("storage_items")
      .select("items_number_currently_in_storage")
      .eq("id", orderItem.item_id)
      .eq("status", "confirmed")
      .single();

    if (storageError || !storageItem) {
      throw new BadRequestException("Storage item not found or not confirmed");
    }

    const newCount =
      (storageItem.items_number_currently_in_storage || 0) -
      (orderItem.quantity || 0);

    if (newCount < 0) {
      throw new BadRequestException("Not enough stock to confirm pickup");
    }

    // 11.3. Update storage stock
    const { error: updateStockError } = await supabase
      .from("storage_items")
      .update({ items_number_currently_in_storage: newCount })
      .eq("id", orderItem.item_id);

    if (updateStockError) {
      throw new BadRequestException("Failed to update storage stock");
    }

    // 11.4. Update order item status to "picked_up"
    const { error: updateStatusError } = await supabase
      .from("order_items")
      .update({ status: "picked_up" })
      .eq("id", orderItemId);

    if (updateStatusError) {
      throw new BadRequestException("Failed to update order item status");
    }

    return {
      message: `Pickup confirmed for item ${orderItem.item_id}`,
      newStorageCount: newCount,
    };
  }
}
