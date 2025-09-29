export type CSVItem = {
  en_item_name: string;
  en_item_description: string;
  fi_item_name: string;
  fi_item_description: string;
  quantity: number;
  category_id: string;
};

export type ProcessedCSV = {
  processed: number;
  errors: {
    row: number;
    errors: string[];
  }[];
  data: CSVItem[];
};
