
export interface EnrichedItem {
  item_id: string;
  quantity: number;
  start_date?: string;
  end_date?: string;
  translations?: {
    fi: { item_name: string };
    en: { item_name: string };
  };
  location_id?: string;
}

export type UserBookingOrder = {
  order_items?: {
    storage_items?: {
      location_id?: string;
    };
  };
};
