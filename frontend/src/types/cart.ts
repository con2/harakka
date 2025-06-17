import { ErrorContext } from "./common";
import { Item } from "./item";

/**
 * Item in a shopping cart
 */
export interface CartItem {
  item: Item;
  quantity: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Cart state in Redux store
 */
export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  errorContext: ErrorContext;
}

/**
 * Payload for updating cart item quantity
 */
export interface UpdateQuantityPayload {
  id: string;
  quantity: number;
}

/**
 * Payload for updating cart item date range
 */
export interface UpdateDateRangePayload {
  id: string;
  startDate?: string;
  endDate?: string;
}
