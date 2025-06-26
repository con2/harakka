export interface BookingItem {
  item_id: string;
  quantity: number;
  start_date: string;
  end_date: string;
}

export interface BookingRequest {
  user_email?: string; // optional because for ddmin-booking
  items: BookingItem[];
}
