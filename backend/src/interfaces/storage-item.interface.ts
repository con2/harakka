export interface StorageItem {
  id: string;
  location_id: string;
  compartment_id: string;
  items_number_total: number;
  items_number_available: number;
  price: number;
  is_active: boolean;
  translations: {
    fi: {
      item_type: string;
      item_name: string;
      item_description: string;
    };
    en: {
      item_type: string;
      item_name: string;
      item_description: string;
    };
  };
  average_rating?: number;
  created_at?: string;
  updated_at?: string;
}
