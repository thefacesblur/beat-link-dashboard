/**
 * Track analytics utilities with memoization and optimized algorithms
 */

// Cache for memoizing analytics results
const memoizationCache = new Map();

/**
 * Get frequently played tracks from history with stats
 * 
 * @param {Array} history - Track history array
 * @param {Object} options - Analysis options
 * @returns {Array} Sorted array of tracks by play count
 */
export const getFrequentTracks = (history, options = {}) => {
  const { 
    limit = 10, 
    minPlays = 1,
    timeRange = null // in milliseconds, e.g., 24 * 60 * 60 * 1000 for 24 hours
  } = options;
  
  // Generate cache key based on input parameters
  const cacheKey = `freq_${JSON.stringify(history.length)}_${limit}_${minPlays}_${timeRange}`;
  
  // Return cached result if available
  if (memoizationCache.has(cacheKey)) {
    return memoizationCache.get(cacheKey);
  }
  
  // Apply time range filter if specified
  const filteredHistory = timeRange ? 
    history.filter(entry => Date.now() - entry.timestamp <= timeRange) : 
    history;
  
  // Group and count plays by track ID
  const trackCounts = filteredHistory.reduce((acc, entry) => {
    const trackKey = `${entry.trackId}_${entry.title}_${entry.artist}`;
    
    if (!acc[trackKey]) {
      acc[trackKey] = {
        trackId: entry.trackId,
        title: entry.title || 'Unknown',
        artist: entry.artist || 'Unknown',
        genre: entry.genre || 'Unknown',
        bpm: entry.bpm,
        count: 0,
        lastPlayed: 0,
        decks: new Set(),
      };
    }
    
    acc[trackKey].count++;
    acc[trackKey].decks.add(entry.player);
    acc[trackKey].lastPlayed = Math.max(acc[trackKey].lastPlayed, entry.timestamp);
    
    return acc;
  }, {});
  
  // Convert to array and sort by play count
  const result = Object.values(trackCounts)
    .filter(track => track.count >= minPlays)
    .map(track => ({
      ...track,
      decks: Array.from(track.decks),
      lastPlayed: new Date(track.lastPlayed)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  
  // Cache the result
  memoizationCache.set(cacheKey, result);
  
  return result;
};

/**
 * Analyze genre distribution in the track history
 * 
 * @param {Array} history - Track history array
 * @returns {Array} Genre distribution data for visualization
 */
export const getGenreDistribution = (history) => {
  const cacheKey = `genre_${JSON.stringify(history.length)}`;
  
  if (memoizationCache.has(cacheKey)) {
    return memoizationCache.get(cacheKey);
  }
  
  // Count plays by genre
  const genreCounts = history.reduce((acc, entry) => {
    const genre = entry.genre || 'Unknown';
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});
  
  // Format for visualization
  const result = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  memoizationCache.set(cacheKey, result);
  return result;
};

/**
 * Get BPM progression over time
 * 
 * @param {Array} history - Track history array
 * @param {Object} options - Analysis options
 * @returns {Array} BPM data points for visualization
 */
export const getBpmProgression = (history, options = {}) => {
  const { 
    smoothing = false,
    windowSize = 3
  } = options;
  
  const cacheKey = `bpm_${JSON.stringify(history.length)}_${smoothing}_${windowSize}`;
  
  if (memoizationCache.has(cacheKey)) {
    return memoizationCache.get(cacheKey);
  }
  
  // First map to data points with valid BPM values
  const dataPoints = history
    .filter(entry => entry.bpm)
    .map((entry, index) => ({
      index,
      timestamp: entry.timestamp,
      bpm: parseFloat(entry.bpm),
      title: entry.title,
      artist: entry.artist
    }));
  
  // Apply smoothing if requested
  const result = smoothing ? 
    applyMovingAverage(dataPoints, windowSize) : 
    dataPoints;
  
  memoizationCache.set(cacheKey, result);
  return result;
};

/**
 * Apply moving average smoothing to a data series
 * 
 * @param {Array} data - Data points array
 * @param {number} windowSize - Smoothing window size
 * @returns {Array} Smoothed data
 */
const applyMovingAverage = (data, windowSize) => {
  if (data.length <= windowSize) return data;
  
  return data.map((point, index) => {
    // Calculate the window bounds
    const start = Math.max(0, index - Math.floor(windowSize / 2));
    const end = Math.min(data.length - 1, index + Math.floor(windowSize / 2));
    
    // Calculate the average for the window
    let sum = 0;
    for (let i = start; i <= end; i++) {
      sum += data[i].bpm;
    }
    
    return {
      ...point,
      bpm: sum / (end - start + 1)
    };
  });
};

/**
 * Get transition analysis between consecutive tracks
 * 
 * @param {Array} history - Track history array
 * @returns {Array} Transitions with analysis
 */
export const getTransitionAnalysis = (history) => {
  const cacheKey = `transitions_${JSON.stringify(history.length)}`;
  
  if (memoizationCache.has(cacheKey)) {
    return memoizationCache.get(cacheKey);
  }
  
  // Group by deck
  const tracksByDeck = history.reduce((acc, track) => {
    if (!acc[track.player]) acc[track.player] = [];
    acc[track.player].push(track);
    return acc;
  }, {});
  
  // For each deck, analyze transitions between consecutive tracks
  const transitions = [];
  
  Object.values(tracksByDeck).forEach(deckTracks => {
    // Sort by timestamp
    deckTracks.sort((a, b) => a.timestamp - b.timestamp);
    
    // Analyze consecutive pairs
    for (let i = 1; i < deckTracks.length; i++) {
      const fromTrack = deckTracks[i - 1];
      const toTrack = deckTracks[i];
      
      // Calculate BPM difference
      const fromBpm = parseFloat(fromTrack.bpm) || 0;
      const toBpm = parseFloat(toTrack.bpm) || 0;
      const bpmDiff = toBpm - fromBpm;
      
      // Calculate time between tracks
      const timeDiff = toTrack.timestamp - fromTrack.timestamp;
      
      transitions.push({
        from: {
          title: fromTrack.title,
          artist: fromTrack.artist,
          bpm: fromBpm,
          genre: fromTrack.genre
        },
        to: {
          title: toTrack.title,
          artist: toTrack.artist,
          bpm: toBpm,
          genre: toTrack.genre
        },
        bpmDiff,
        bpmDiffPercent: fromBpm ? (bpmDiff / fromBpm) * 100 : 0,
        timeBetween: timeDiff,
        timeBetweenMinutes: Math.round(timeDiff / 60000),
        deck: fromTrack.player,
        sameGenre: fromTrack.genre && toTrack.genre && 
                  fromTrack.genre.toLowerCase() === toTrack.genre.toLowerCase()
      });
    }
  });
  
  const result = transitions.sort((a, b) => b.timestamp - a.timestamp);
  memoizationCache.set(cacheKey, result);
  return result;
};

/**
 * Clear analytics cache for refreshed data
 */
export const clearAnalyticsCache = () => {
  memoizationCache.clear();
};

/**
 * Get session statistics summary
 * 
 * @param {Array} history - Track history array 
 * @returns {Object} Session statistics
 */
export const getSessionStats = (history) => {
  const cacheKey = `stats_${JSON.stringify(history.length)}`;
  
  if (memoizationCache.has(cacheKey)) {
    return memoizationCache.get(cacheKey);
  }
  
  if (!history.length) {
    return {
      totalTracks: 0,
      uniqueTracks: 0,
      sessionDuration: 0,
      averageTrackDuration: 0,
      startTime: null,
      endTime: null,
      tracksPerDeck: {},
      averageBpm: 0
    };
  }
  
  // Track unique tracks
  const uniqueTrackIds = new Set();
  let totalBpm = 0;
  let bpmCount = 0;
  
  // Count tracks per deck
  const tracksPerDeck = {};
  
  history.forEach(track => {
    uniqueTrackIds.add(track.trackId);
    if (track.bpm) {
      totalBpm += parseFloat(track.bpm);
      bpmCount++;
    }
    
    tracksPerDeck[track.player] = (tracksPerDeck[track.player] || 0) + 1;
  });
  
  // Sort by timestamp to find session duration
  const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
  const startTime = sortedHistory[0].timestamp;
  const endTime = sortedHistory[sortedHistory.length - 1].timestamp;
  const sessionDuration = endTime - startTime;
  
  const stats = {
    totalTracks: history.length,
    uniqueTracks: uniqueTrackIds.size,
    sessionDuration,
    sessionDurationHours: Math.round(sessionDuration / 3600000 * 10) / 10,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    tracksPerDeck,
    averageBpm: bpmCount ? Math.round(totalBpm / bpmCount) : 0
  };
  
  memoizationCache.set(cacheKey, stats);
  return stats;
}; 