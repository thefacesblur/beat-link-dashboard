import { useEffect, useState, useCallback, useRef } from 'react';
import { useSettings } from './SettingsContext';

// Mock data for development when API is unavailable
const MOCK_DATA = {
  players: {
    player1: {
      number: 1,
      'is-playing': true,
      'is-paused': false,
      'is-track-loaded': true,
      'beat-within-bar': 2,
      'time-played': {
        'raw-milliseconds': 45000
      },
      track: {
        id: 'mock-track-1',
        artist: 'Demo Artist',
        title: 'Development Track',
        bpm: 128,
        duration: 320,
        genre: 'House'
      }
    },
    player2: {
      number: 2,
      'is-playing': false,
      'is-paused': true,
      'is-track-loaded': true,
      'beat-within-bar': 4,
      'time-played': {
        'raw-milliseconds': 15000
      },
      track: {
        id: 'mock-track-2',
        artist: 'Test Producer',
        title: 'Fallback Demo',
        bpm: 140,
        duration: 280,
        genre: 'Techno'
      }
    }
  }
};

// Check if we're in development mode
const isDev = import.meta.env?.MODE === 'development' || 
              window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1';

export default function useParamsData() {
  const { pollingInterval } = useSettings();
  const effectiveInterval = pollingInterval || 2000;
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  
  // Refs to prevent recreating functions on each render
  const lastFetchTime = useRef(0);
  const abortControllerRef = useRef(null);
  const failedAttemptsRef = useRef(0);
  
  // Memoize fetchData to prevent recreation on each render
  const fetchData = useCallback(async () => {
    // If we're already using fallback data, don't try to fetch again
    if (useFallback && isDev) {
      return;
    }
    
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
        headers: { 'Cache-Control': 'no-cache' },
        // Add a timeout to prevent hanging requests
        timeout: 5000
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      
      const json = await res.json();
      setData(json);
      setError(null);
      failedAttemptsRef.current = 0; // Reset failed attempts counter
    } catch (err) {
      // Ignore abort errors as they're expected when we cancel requests
      if (err.name !== 'AbortError') {
        console.error('Fetch error:', err);
        
        // In development mode, switch to mock data after several failed attempts
        failedAttemptsRef.current++;
        
        if (isDev && failedAttemptsRef.current >= 3) {
          console.info('Switching to mock data for development');
          setData(MOCK_DATA);
          setUseFallback(true);
          setError(new Error('Using mock data (API unavailable)'));
        } else {
          setError(err);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [useFallback]);
  
  useEffect(() => {
    let isMounted = true;
    let timer = null;
    
    // Initial fetch
    fetchData();
    
    // Set up polling interval
    const startPolling = () => {
      // Clear any existing timer
      if (timer) clearInterval(timer);
      
      // Set up new timer
      timer = setInterval(() => {
        if (isMounted) {
          fetchData().catch(err => {
            // Catch any unhandled promise rejections
            console.error('Unhandled error in fetch:', err);
          });
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
  
  // Reset fallback mode when polling interval changes
  useEffect(() => {
    if (useFallback) {
      setUseFallback(false);
      failedAttemptsRef.current = 0;
    }
  }, [pollingInterval]);
  
  return { 
    data, 
    error, 
    loading,
    isUsingMockData: useFallback && isDev
  };
}