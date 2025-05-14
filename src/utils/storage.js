/**
 * Optimized storage utilities with throttling and error handling
 */

// Queue of pending storage operations to batch writes
let writeQueue = new Map();
let writeInProgress = false;

/**
 * Throttled storage setter with batching
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 * @param {number} delay - Delay in ms before writing to storage
 * @returns {Promise<boolean>} Success state
 */
export const setItem = (key, value, delay = 300) => {
  return new Promise(resolve => {
    // Add or update item in write queue
    writeQueue.set(key, { value, resolve });
    
    // Start write process if not already in progress
    if (!writeInProgress) {
      writeInProgress = true;
      setTimeout(processQueue, delay);
    }
  });
};

/**
 * Process the storage write queue
 */
const processQueue = () => {
  // Create a snapshot of the current queue
  const queue = new Map(writeQueue);
  writeQueue.clear();
  
  // Process each item
  queue.forEach(({ value, resolve }, key) => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      resolve(true);
    } catch (error) {
      console.error(`Storage error for key ${key}:`, error);
      
      // Try to free up space by removing old items if quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        try {
          // Remove some older items to make space
          pruneStorage();
          
          // Try again
          localStorage.setItem(key, JSON.stringify(value));
          resolve(true);
        } catch (fallbackError) {
          console.error('Failed to store even after pruning:', fallbackError);
          resolve(false);
        }
      } else {
        resolve(false);
      }
    }
  });
  
  // If more items were added during processing, schedule another run
  if (writeQueue.size > 0) {
    setTimeout(processQueue, 100);
  } else {
    writeInProgress = false;
  }
};

/**
 * Remove older or less important items to make space
 */
const pruneStorage = () => {
  // Implementation strategy: remove oldest items or less critical data
  const MAX_ITEMS = 50;
  
  try {
    // Get all keys and sort by priority
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }
    
    // Start removing items until we're under the limit
    if (keys.length > MAX_ITEMS) {
      // Sort keys by priorities (example implementation)
      // Higher priority items should be kept
      const lowPriorityKeys = keys.filter(key => 
        !key.includes('settings') && !key.includes('user')
      );
      
      // Remove lowest priority items
      lowPriorityKeys
        .slice(0, keys.length - MAX_ITEMS)
        .forEach(key => localStorage.removeItem(key));
    }
  } catch (e) {
    console.error('Failed to prune storage:', e);
  }
};

/**
 * Get item from storage with error handling and default value
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist or on error
 * @returns {any} Parsed value or default
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error getting item ${key} from storage:`, error);
    return defaultValue;
  }
};

/**
 * Remove item from storage with error handling
 * @param {string} key - Storage key to remove
 * @returns {boolean} Success state
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item ${key} from storage:`, error);
    return false;
  }
};

/**
 * Clear all items from storage with error handling
 * @returns {boolean} Success state
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

/**
 * Get storage usage statistics
 * @returns {Object} Storage statistics
 */
export const getStorageStats = () => {
  try {
    const usage = new TextEncoder().encode(
      Object.entries(localStorage).map(entry => entry[0] + entry[1]).join('')
    ).length;
    
    return {
      keys: localStorage.length,
      usageBytes: usage,
      usageKB: Math.round(usage / 1024),
      quota: navigator.storage?.quota || 5 * 1024 * 1024,
      percentUsed: navigator.storage?.quota ? 
        (usage / navigator.storage.quota) * 100 : null
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      keys: 0,
      usageBytes: 0,
      usageKB: 0,
      error: error.message
    };
  }
}; 