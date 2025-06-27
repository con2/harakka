import { BadRequestException, Injectable } from "@nestjs/common";
import { MailService } from "../mail/mail.service";
import { UserService } from "../user/user.service";
import { SupabaseClient } from "@supabase/supabase-js";
import { OrderRow } from "./types/booking.interface";
import { OrderItemsRow } from "../order-items/interfaces/order-items.types";
import { AvailabilityService } from "../availability/availability.service";

@Injectable()
export class NewBookingService {
  constructor(
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async getAllOrders(
    supabase: SupabaseClient,
    offset: number = 0,
    limit: number = 20,
  ) {
    const result = await supabase.rpc("get_all_full_orders", {
      in_offset: offset,
      in_limit: limit,
    });
    return result;
  }

  async getOrder(supabase: SupabaseClient, order_id: string) {
    const result = await supabase.rpc("get_full_order", order_id);
    return result;
  }

  async getUserBookings(
    supabase: SupabaseClient,
    user_id: string,
    offset: number = 0,
    limit: number = 20,
  ) {
    if (!user_id) throw new BadRequestException("Invalid or missing User ID");
    const result = await supabase.rpc("get_full_user_order", {
      in_user_id: user_id,
      in_offset: offset,
      in_limit: limit,
    });
    return result;
  }

  async updateBooking(
    supabase: SupabaseClient,
    order_id: string,
    values: Partial<OrderRow>,
  ) {
    await supabase.from("orders").update(values).eq("id", order_id);
  }

  async deleteBooking(supabase: SupabaseClient, order_id: string) {
    await supabase.from("orders").delete().eq("id", order_id);
  }

  async getOrderDetails(
    supabase: SupabaseClient,
    order_id: string,
    fields: string[],
  ): Promise<Partial<OrderItemsRow>> {
    if (!fields || fields.length < 1)
      throw new BadRequestException("Missing fields");

    const { data, error } = await supabase
      .from("orders")
      .select(fields.join(", "))
      .eq("id", order_id)
      .single();

    if (error || !data) {
      console.error(error);
      throw new BadRequestException("Failed to retrieve order details");
    }

    return (data as Partial<OrderItemsRow>) ?? null;
  }
}
