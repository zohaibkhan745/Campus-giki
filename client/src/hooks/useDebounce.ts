import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * Delays updating the debounced value until after the specified delay has passed
 * since the last time the input value was modified.
 * 
 * Complies with the HCI RAIL model and Doherty Threshold:
 * - Keeps UI inputs reactive at native 60/120fps
 * - Prevents network saturation and thread contention
 *
 * @param value The value to debounce (e.g. search string)
 * @param delayMs Delay in milliseconds (defaults to 250ms)
 */
export function useDebounce<T>(value: T, delayMs: number = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
