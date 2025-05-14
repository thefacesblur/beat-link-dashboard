import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const defaultFields = ['Time', 'Deck', 'Artist', 'Title', 'BPM', 'Genre'];
const STORAGE_KEY = 'dj-dashboard-settings';

// Create the context
const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // Load settings from localStorage (only once on mount)
  const initialSettings = useMemo(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    
    // Default settings
    return {
      pollingInterval: 500,
      theme: 'dark',
      analyticsEnabled: true,
      trackHistoryFields: defaultFields
    };
  }, []);
  
  // Individual state values with their setters
  const [pollingInterval, setPollingInterval] = useState(initialSettings.pollingInterval);
  const [theme, setTheme] = useState(initialSettings.theme);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(initialSettings.analyticsEnabled);
  const [trackHistoryFields, setTrackHistoryFields] = useState(initialSettings.trackHistoryFields);

  // Debounced save to localStorage
  const saveSettings = useCallback(() => {
    const settings = {
      pollingInterval,
      theme,
      analyticsEnabled,
      trackHistoryFields
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [pollingInterval, theme, analyticsEnabled, trackHistoryFields]);

  // Debounce settings save to avoid frequent localStorage writes
  useEffect(() => {
    const timer = setTimeout(saveSettings, 500);
    return () => clearTimeout(timer);
  }, [saveSettings]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    pollingInterval, 
    setPollingInterval,
    theme, 
    setTheme,
    analyticsEnabled, 
    setAnalyticsEnabled,
    trackHistoryFields, 
    setTrackHistoryFields,
    defaultFields
  }), [pollingInterval, theme, analyticsEnabled, trackHistoryFields]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    console.error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 