import { useEffect, useState } from 'react';


/**
 * Get a debounced value after a desired amount of time
 * @param value string value that will be resolved after x milliseconds
 * @param delay time to debounce in ms. Default 2000
 * @returns value
 */
export const useDebouncedValue = (value: string, delay: number = 1000) => {
  const [debouncedValue, setDebouncedValue] = useState<string>(value);
  const [TO, setTO] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (TO) clearTimeout(TO)
    setTO(setTimeout(() => setDebouncedValue(value), delay))
  }, [value])

  return debouncedValue;
}