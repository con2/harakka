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
  storage_items?: {
    location_id?: string;
    translations?: {
      fi: { name: string };
      en: { name: string };
    };
  };
}
