"use client";

import { useState, useEffect } from 'react';
import type { Settings } from '@/lib/definitions';
import { DEFAULT_IDR_TO_TON_FORMAT, DEFAULT_TON_TO_IDR_FORMAT } from '@/lib/constants';

const SETTINGS_KEY = 'dazai-convert-settings';

const defaultSettings: Settings = {
  profitMode: 'percentage',
  profitValue: 2.5,
  idrToTonFormat: DEFAULT_IDR_TO_TON_FORMAT,
  tonToIdrFormat: DEFAULT_TON_TO_IDR_FORMAT,
};

export function useSettings() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Migration for old settings format
        if (parsedSettings.buyFormat || parsedSettings.sellFormat) {
            parsedSettings.idrToTonFormat = parsedSettings.buyFormat || DEFAULT_IDR_TO_TON_FORMAT;
            delete parsedSettings.buyFormat;
            parsedSettings.tonToIdrFormat = parsedSettings.sellFormat || DEFAULT_TON_TO_IDR_FORMAT;
            delete parsedSettings.sellFormat;
        }
        
        // Ensure all keys are present
        const validatedSettings = { ...defaultSettings, ...parsedSettings };
        
        setSettings(validatedSettings);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
      setSettings(defaultSettings); // fallback to defaults on error
    }
    setIsLoaded(true);
  }, []);

  const handleSetSettings = (newSettings: Settings | ((prevSettings: Settings) => Settings)) => {
    const updatedSettings = typeof newSettings === 'function' ? newSettings(settings) : newSettings;
    setSettings(updatedSettings);
    if (isLoaded) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      } catch (error) {
        console.error("Failed to save settings to localStorage", error);
      }
    }
  };

  return { settings, setSettings: handleSetSettings, isLoaded };
}
