export interface BookingItem {
  id?: string;
  item_id: string;
  quantity: number;
  start_date: string;
  end_date: string;
  total_days?: number;
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
