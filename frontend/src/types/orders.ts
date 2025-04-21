export interface BookingItem {
  id?: string;
  item_id: string;
  quantity: number;
  start_date: string;
  end_date: string;
  unit_price?: number;
  total_days?: number;
  subtotal?: number;
  status?: "pending" | "confirmed" | "cancelled";
  location_id?: string;
  item_name?: string;
}

export interface BookingOrder {
  id?: string;
  user_id?: string;
  order_number?: string;
  status?:
    | "pending"
    | "confirmed"
    | "paid"
    | "completed"
    | "cancelled"
    | "cancelled by user"
    | "rejected"
    | "refunded";
  total_amount?: number;
  discount_amount?: number;
  final_amount?: number;
  payment_status?: "pending" | "partial" | "paid" | "refunded";
  created_at?: string;
  updated_at?: string;
  order_items?: BookingItem[];
  user_profile?: {
    name?: string;
    email?: string;
  };
}
