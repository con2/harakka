// to be updated

export interface UserProfile {
  id: number;
  role: string;
  full_name: string;
  visible_name: string;
  phone: string;
  email: string;
  saved_lists: string[];
  preferences: string[];
  createdAt: string;
}

export interface UserAddresses {
  address_type: "billing" | "shipping" | "both";
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface UserState {
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  selectedUser: UserProfile | null;
}