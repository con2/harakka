// to be updated

// returned user object
export interface UserProfile {
  id?: string;
  role: "user" | "admin" | "superVera";
  full_name: string;
  visible_name: string;
  phone?: string;
  email: string;
  saved_lists: string[];
  preferences?: Record<string, any>;
  createdAt: string;
}

// type for creating a user, matching backedn DTO
export interface CreateUserDto {
  email: string;
  password?: string; //optional because backend only needs password at submit time
  full_name: string;
  visible_name?: string;
  phone?: string;
  role?: "user" | "admin" | "superVera";
  preferences?: Record<string, any>;
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
  selectedUserLoading?: boolean;
}