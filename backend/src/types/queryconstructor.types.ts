export type ColumnMeta = {
  column_name: string;
  data_type: string;
};

export type Filter = {
  column: string;
  type:
    | "uuid_search"
    | "number_search"
    | "text_search"
    | "date_search"
    | "boolean_search"
    | "exact_search"
    | "skip_search";
};

export type Eq = {
  column: string;
  value: string | number | boolean | null;
};
