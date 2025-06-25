import { BadRequestException, Injectable } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { NewOrderItemDto } from "./dto/new-order-item.dto";

@Injectable()
export class OrderItemsService {
  async getAll(
    supabase: SupabaseClient
  ) {
    const { data, error } = await supabase
      .from("order_items")
      .select("*")

    if (!data) throw new BadRequestException("Could not retrieve order data");

    console.log(`Range of order data: `, data);
  }

  async getOrderItems(supabase: SupabaseClient, order_id: string) {
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order_id);
    if (!data) throw new BadRequestException("Order not found");
    console.log(`Singular order data: `, data);
  }

  async getUserOrder(
    supabase: SupabaseClient,
    user_id: string,
    offset: number = 0,
    limit: number = 20,
  ) {
    const { data, error } = await supabase
      .from("order-items")
      .select("*")
      .eq("user_id", user_id)
      .range(offset, offset + limit);
  }

  async createOrderItem(supabase: SupabaseClient, order_item: NewOrderItemDto) {
    const {data, error} = await supabase.from("order_items").insert(order_item);
    if (!data || error) throw new BadRequestException("Could not create order-item");
  }
}
