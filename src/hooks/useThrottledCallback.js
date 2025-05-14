import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for throttling function calls to prevent excessive execution
 * 
 * @param {Function} callback - The function to throttle
 * @param {number} delay - The delay in milliseconds
 * @param {Object} options - Additional options
 * @returns {Function} The throttled callback
 */
export default function useThrottledCallback(callback, delay = 300, options = {}) {
  const {
    leading = true,   // Whether to call the function on the leading edge
    trailing = true,  // Whether to call the function on the trailing edge
  } = options;
  
  // Store the callback in a ref to avoid unnecessary re-renders
  const callbackRef = useRef(callback);
  // Last call timestamp
  const lastCallTimeRef = useRef(0);
  // Timeout ID for trailing edge call
  const timeoutIdRef = useRef(null);
  // Store arguments for trailing edge call
  const lastArgsRef = useRef([]);
  // Track whether the leading edge has been executed
  const hasLeadingExecuted = useRef(false);

  // Update the callback ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup function to clear any pending timeouts
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, []);

  return useCallback((...args) => {
    const now = Date.now();
    const elapsed = now - lastCallTimeRef.current;
    
    // Store the latest arguments for potential trailing edge call
    lastArgsRef.current = args;
    
    // If enough time has passed since the last call
    if (elapsed >= delay) {
      lastCallTimeRef.current = now;
      hasLeadingExecuted.current = true;
      
      // Execute immediately if leading edge is enabled
      if (leading) {
        callbackRef.current(...args);
      }
    } else if (!hasLeadingExecuted.current && leading) {
      // If this is the first call and leading edge is enabled
      lastCallTimeRef.current = now;
      hasLeadingExecuted.current = true;
      callbackRef.current(...args);
    } else if (trailing) {
      // Clear any existing timeout to prevent duplicates
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      
      // Schedule a call for the trailing edge
      timeoutIdRef.current = setTimeout(() => {
        // Only execute if enough time has passed
        const timeSinceLastCall = Date.now() - lastCallTimeRef.current;
        if (timeSinceLastCall >= delay) {
          lastCallTimeRef.current = Date.now();
          callbackRef.current(...lastArgsRef.current);
          timeoutIdRef.current = null;
        }
      }, delay - elapsed);
    }
  }, [delay, leading, trailing]);
} 