import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * Debounce một value - useful cho search input, scroll events, etc.
 * 
 * @param {any} value - Value cần debounce
 * @param {number} delay - Delay time in milliseconds (default: 300ms)
 * @returns {any} - Debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // API call chỉ trigger sau khi user ngừng gõ 500ms
 *   if (debouncedSearchTerm) {
 *     searchAPI(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout để update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: clear timeout nếu value thay đổi trước khi delay hết
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useThrottle Hook
 * Throttle một value - giới hạn số lần update trong một khoảng thời gian
 * 
 * @param {any} value - Value cần throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {any} - Throttled value
 */
export const useThrottle = (value, limit = 200) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useState(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit, lastRan]);

  return throttledValue;
};

export default useDebounce;

