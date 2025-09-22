/**
 * Utility functions for managing item quantities in booking forms
 */

import { Dispatch, SetStateAction } from "react";

/**
 * Interface for items that can have their quantity modified
 */
interface QuantityItem {
  id: string | number;
  quantity: number;
  item_id: string;
}

/**
 * Decrements the quantity of an item by 1, with a minimum of 0
 * @param item - The item to decrement
 * @param itemQuantities - Current quantity state
 * @param setItemQuantities - State setter for quantities
 */
export const decrementQuantity = <T extends QuantityItem>(
  item: T,
  itemQuantities: Record<string, number>,
  setItemQuantities: Dispatch<SetStateAction<Record<string, number>>>,
) => {
  const key = String(item.id);
  const current = itemQuantities[key] ?? item.quantity ?? 0;
  const next = Math.max(0, current - 1);
  setItemQuantities((prev) => ({ ...prev, [key]: next }));
};

/**
 * Increments the quantity of an item by 1, respecting availability limits
 * @param item - The item to increment
 * @param itemQuantities - Current quantity state
 * @param setItemQuantities - State setter for quantities
 * @param availability - Available quantities per item_id
 */
export const incrementQuantity = <T extends QuantityItem>(
  item: T,
  itemQuantities: Record<string, number>,
  setItemQuantities: Dispatch<SetStateAction<Record<string, number>>>,
  availability: { [itemId: string]: number },
) => {
  const key = String(item.id);
  const current = itemQuantities[key] ?? item.quantity ?? 0;
  const avail = availability[item.item_id];
  const max = avail !== undefined ? avail : Infinity;
  const next = Math.min(max, current + 1);
  setItemQuantities((prev) => ({ ...prev, [key]: next }));
};

/**
 * Updates the quantity of an item directly
 * @param item - The item to update
 * @param newQuantity - The new quantity value
 * @param setItemQuantities - State setter for quantities
 * @param availability - Available quantities per item_id (optional)
 */
export const updateQuantity = <T extends QuantityItem>(
  item: T,
  newQuantity: number,
  setItemQuantities: Dispatch<SetStateAction<Record<string, number>>>,
  availability?: { [itemId: string]: number },
) => {
  if (isNaN(newQuantity) || newQuantity < 0) return;

  const key = String(item.id);
  const avail = availability?.[item.item_id];
  const maxAllowed = avail !== undefined ? avail : Infinity;
  const finalQuantity = Math.min(newQuantity, maxAllowed);

  setItemQuantities((prev) => ({ ...prev, [key]: finalQuantity }));
};
