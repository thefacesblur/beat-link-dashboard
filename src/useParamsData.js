import { useEffect, useState, useCallback, useRef } from 'react';
import { useSettings } from './SettingsContext';

export default function useParamsData() {
  const { pollingInterval } = useSettings();
  const effectiveInterval = pollingInterval || 2000;
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Refs to prevent recreating functions on each render
  const lastFetchTime = useRef(0);
  const abortControllerRef = useRef(null);
  
  // Memoize fetchData to prevent recreation on each render
  const fetchData = useCallback(async () => {
    // Debounce requests that come in too quickly
    const now = Date.now();
    if (now - lastFetchTime.current < 500) {
      return;
    }
    lastFetchTime.current = now;
    
    // Cancel previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      const res = await fetch('/params.json', { 
        signal: abortControllerRef.current.signal,
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      // Ignore abort errors as they're expected when we cancel requests
      if (err.name !== 'AbortError') {
        console.error('Fetch error:', err);
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    let timer = null;
    
    // Initial fetch
    fetchData();
    
    // Set up polling interval
    const startPolling = () => {
      timer = setInterval(() => {
        if (isMounted) {
          fetchData();
        }
      }, effectiveInterval);
    };
    
    startPolling();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [effectiveInterval, fetchData]);
  
  return { data, error, loading };
}