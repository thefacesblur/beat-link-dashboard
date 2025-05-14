import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for lazy loading and managing media assets (images, audio)
 * with proper error handling and cleanup
 *
 * @param {string} url - URL of the media to load
 * @param {string} type - Type of media ('image' or 'audio')
 * @param {Object} options - Additional options
 * @returns {Object} Media state and control functions
 */
export default function useMediaLoader(url, type = 'image', options = {}) {
  const {
    crossOrigin = 'anonymous',
    shouldPreload = true,
    timeout = 10000, // 10 seconds timeout
    placeholderUrl = '',
    onLoad,
    onError,
  } = options;

  const [loading, setLoading] = useState(shouldPreload);
  const [error, setError] = useState(null);
  const [mediaObject, setMediaObject] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const mediaRef = useRef(null);
  const timeoutRef = useRef(null);

  // Clean up function to abort loading and clear timeouts
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (mediaRef.current) {
      // Clean up event listeners
      if (type === 'image') {
        mediaRef.current.onload = null;
        mediaRef.current.onerror = null;
      } else if (type === 'audio') {
        mediaRef.current.oncanplaythrough = null;
        mediaRef.current.onerror = null;
      }

      // If it's an audio element, stop playback and release resources
      if (type === 'audio' && !mediaRef.current.paused) {
        mediaRef.current.pause();
        mediaRef.current.src = '';
        mediaRef.current.load(); // Releases the audio resources
      }

      mediaRef.current = null;
    }
  }, [type]);

  // Function to load the media
  const loadMedia = useCallback((mediaUrl = url) => {
    if (!mediaUrl) {
      setError(new Error('No URL provided'));
      setLoading(false);
      return;
    }

    // Clean up any previous loading attempt
    cleanup();
    
    // Start loading state
    setLoading(true);
    setError(null);

    // Create media element based on type
    let media;
    if (type === 'image') {
      media = new Image();
      media.crossOrigin = crossOrigin;
      
      media.onload = () => {
        setDimensions({
          width: media.naturalWidth,
          height: media.naturalHeight
        });
        setMediaObject(media);
        setLoading(false);
        if (onLoad) onLoad(media);
      };
    } else if (type === 'audio') {
      media = new Audio();
      media.crossOrigin = crossOrigin;
      
      media.oncanplaythrough = () => {
        setMediaObject(media);
        setLoading(false);
        if (onLoad) onLoad(media);
      };
    } else {
      setError(new Error(`Unsupported media type: ${type}`));
      setLoading(false);
      return;
    }

    // Common error handler
    media.onerror = (e) => {
      const errorMessage = `Failed to load ${type}: ${mediaUrl}`;
      console.error(errorMessage, e);
      setError(new Error(errorMessage));
      setLoading(false);
      
      // If placeholder is available, try to load that instead
      if (placeholderUrl && placeholderUrl !== mediaUrl) {
        loadMedia(placeholderUrl);
      }
      
      if (onError) onError(e);
    };

    // Set timeout to prevent hanging loads
    timeoutRef.current = setTimeout(() => {
      setError(new Error(`Loading ${type} timed out: ${mediaUrl}`));
      setLoading(false);
      cleanup();
      
      // If placeholder is available, try to load that instead
      if (placeholderUrl && placeholderUrl !== mediaUrl) {
        loadMedia(placeholderUrl);
      }
    }, timeout);

    // Start loading
    media.src = mediaUrl;
    mediaRef.current = media;
    
    if (type === 'audio') {
      media.load(); // For audio, we need to call load() to begin loading
    }
  }, [url, type, crossOrigin, cleanup, onLoad, onError, placeholderUrl, timeout]);

  // Handle playing audio if that's the media type
  const play = useCallback(() => {
    if (type === 'audio' && mediaObject && !loading && !error) {
      mediaObject.play().catch(err => {
        console.error('Error playing audio:', err);
        setError(err);
      });
    }
  }, [type, mediaObject, loading, error]);

  // Handle pausing audio
  const pause = useCallback(() => {
    if (type === 'audio' && mediaObject) {
      mediaObject.pause();
    }
  }, [type, mediaObject]);

  // Start loading on mount or when URL changes
  useEffect(() => {
    if (shouldPreload && url) {
      loadMedia();
    } else {
      setLoading(false);
    }

    // Cleanup when unmounting or URL changes
    return cleanup;
  }, [url, shouldPreload, loadMedia, cleanup]);

  return {
    loading,
    error,
    media: mediaObject,
    dimensions,
    loadMedia,
    play,
    pause,
    cleanup
  };
} 