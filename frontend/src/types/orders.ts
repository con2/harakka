export interface BookingItem {
  item_id: string;
  quantity: number;
  start_date: string;
  end_date: string;
}

export interface BookingOrder {
  id?: string;
  user_id?: string;
  order_number?: string;
  status?: "pending" | "confirmed" | "cancelled";
  created_at?: string;
  items: BookingItem[];
}
