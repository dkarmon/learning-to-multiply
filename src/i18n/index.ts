// ABOUTME: Internationalization setup using react-i18next.
// ABOUTME: Supports Hebrew (RTL) and English (LTR) with browser language detection.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import he from './locales/he.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    fallbackLng: 'he',
    interpolation: {
      escapeValue: false, // React handles escaping
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'settings-storage',
    },
  });

export default i18n;
