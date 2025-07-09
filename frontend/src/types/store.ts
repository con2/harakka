import { Action, ThunkDispatch } from "@reduxjs/toolkit";
import { UserState } from "./user";
import { ItemState } from "./item";
import { BookingsState } from "./booking";
import { CartState } from "./cart";
import { TimeframeState } from "./timeframe";
import { TagState } from "./tag";

/**
 * Root state type for the Redux store
 */
export interface RootState {
  users: UserState;
  items: ItemState;
  bookings: BookingsState;
  cart: CartState;
  timeframe: TimeframeState;
  tags: TagState;
}

/**
 * Typed dispatch function for Redux actions
 * Supports both plain actions and thunks
 */
export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;
