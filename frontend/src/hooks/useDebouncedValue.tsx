import { useEffect, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

/**
 * Get a debounced value after a desired amount of time
 * @param value value (any type) that will be resolved after x milliseconds
 * @param delay time to debounce in ms. Default 1000.
 * @returns value
 */
export const useDebouncedValue = (value: any, delay: number = 1000) => {
  const [debouncedValue, setDebouncedValue] = useState<any>(value);
  const [TO, setTO] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (TO) clearTimeout(TO);
    setTO(setTimeout(() => setDebouncedValue(value), delay));
  }, [value]);

  return debouncedValue;
};
