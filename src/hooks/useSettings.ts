import { useState, useEffect, useCallback } from 'react';
import { CompanionSettings } from '../types';
import { loadStoredSettings, saveStoredSettings, DEFAULT_SETTINGS } from '../store/companionStore';

export function useSettings() {
  const [settings, setSettings] = useState<CompanionSettings>(() => loadStoredSettings());

  useEffect(() => {
    saveStoredSettings(settings);

    // Apply alwaysOnTop via Electron IPC if available
    if (window.mikoAPI?.setAlwaysOnTop) {
      window.mikoAPI.setAlwaysOnTop(settings.alwaysOnTop).catch(console.error);
    }

    // Apply startWithWindows if available
    if (window.mikoAPI?.setStartWithWindows) {
      window.mikoAPI.setStartWithWindows(settings.startWithWindows).catch(console.error);
    }
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<CompanionSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
