export interface Address {
  id?: string; // Not actually required when creating a new address
  user_id: string;
  address_type: "both" | "billing" | "shipping";
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}
// DTO-shape for POST /users/:id/addresses (matches backend CreateAddressDto)
export type CreateAddressInput = {
  address_type: "both" | "billing" | "shipping";
  street_address: string;
  city: string;
  postal_code: string; // validated with IsPostalCode('any') on the server
  country: string;
  is_default: boolean;
};

export type AddressForm = Omit<Address, "id"> & Partial<Pick<Address, "id">>;
