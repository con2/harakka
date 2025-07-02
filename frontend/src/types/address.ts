export interface Address {
  id?: string;
  user_id: string;
  address_type: "both" | "billing" | "shipping";
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export type AddressForm = Omit<Address, "id"> & Partial<Pick<Address, "id">>;
