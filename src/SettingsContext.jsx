import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultFields = ['Time', 'Deck', 'Artist', 'Title', 'BPM', 'Genre'];
const STORAGE_KEY = 'dj-dashboard-settings';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // Load settings from localStorage if available
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    return null;
  };

  const savedSettings = loadSettings();
  
  const [pollingInterval, setPollingInterval] = useState(savedSettings?.pollingInterval || 500);
  const [theme, setTheme] = useState(savedSettings?.theme || 'dark');
  const [analyticsEnabled, setAnalyticsEnabled] = useState(savedSettings?.analyticsEnabled ?? true);
  const [trackHistoryFields, setTrackHistoryFields] = useState(savedSettings?.trackHistoryFields || defaultFields);

  // Save settings to localStorage when they change
  useEffect(() => {
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

  return (
    <SettingsContext.Provider value={{
      pollingInterval, setPollingInterval,
      theme, setTheme,
      analyticsEnabled, setAnalyticsEnabled,
      trackHistoryFields, setTrackHistoryFields,
      defaultFields
    }}>
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