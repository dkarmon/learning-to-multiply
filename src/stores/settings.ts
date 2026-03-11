// ABOUTME: App settings store for language, sound, and music preferences.
// ABOUTME: Persists all settings to localStorage.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale, AppSettings } from '../types';

interface SettingsStore extends AppSettings {
  setLocale: (locale: Locale) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      locale: 'he',
      soundEnabled: true,
      musicEnabled: true,

      setLocale: (locale) => {
        set({ locale });
        document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
        document.documentElement.lang = locale;
      },

      setSoundEnabled: (enabled) => {
        set({ soundEnabled: enabled });
      },

      setMusicEnabled: (enabled) => {
        set({ musicEnabled: enabled });
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);
