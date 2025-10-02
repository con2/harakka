/**
 * Utility functions for managing item quantities in booking forms
 */

import { Dispatch, SetStateAction } from "react";
import { itemsApi } from "@/api/services/items";

/**
 * Interface for items that can have their quantity modified
 */
interface QuantityItem {
  id: string | number;
  quantity: number;
  item_id: string;
}

/**
 * Decrements the quantity of an item by 1, with a minimum of 1
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
  const current = itemQuantities[key] ?? item.quantity ?? 1;
  const next = Math.max(1, current - 1);
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
  if (isNaN(newQuantity) || newQuantity < 1) return;

  const key = String(item.id);
  const avail = availability?.[item.item_id];
  const maxAllowed = avail !== undefined ? avail : Infinity;
  const finalQuantity = Math.min(Math.max(1, newQuantity), maxAllowed);

  setItemQuantities((prev) => ({ ...prev, [key]: finalQuantity }));
};

/**
 * Fetches availability for a list of items within a date range
 * @param items - Array of items to check availability for
 * @param startDate - Start date for availability check
 * @param endDate - End date for availability check
 * @param setAvailability - State setter for availability data
 * @param setLoadingAvailability - State setter for loading state
 */
export const fetchItemsAvailability = async <T extends QuantityItem>(
  items: T[],
  startDate: string,
  endDate: string,
  setAvailability: Dispatch<SetStateAction<{ [itemId: string]: number }>>,
  setLoadingAvailability: Dispatch<SetStateAction<boolean>>,
) => {
  if (!startDate || !endDate || items.length === 0) return;

  setLoadingAvailability(true);

  try {
    const promises = items.map(async (item) => {
      try {
        const data = await itemsApi.checkAvailability(
          item.item_id,
          new Date(startDate),
          new Date(endDate),
        );
        // Add current item quantity back to available quantity
        // (since the item is currently "using" that quantity)
        const corrected = data.availableQuantity + (item.quantity ?? 0);
        return { itemId: item.item_id, availability: corrected };
      } catch {
        // Return null for failed availability checks
        return { itemId: item.item_id, availability: null };
      }
    });

    const results = await Promise.all(promises);

    // Update availability state with results
    setAvailability((prev) => {
      const newAvailability = { ...prev };
      results.forEach(({ itemId, availability }) => {
        if (availability !== null) {
          newAvailability[itemId] = availability;
        }
      });
      return newAvailability;
    });
  } catch (error) {
    console.error("Failed to fetch item availability:", error);
  } finally {
    setLoadingAvailability(false);
  }
};
