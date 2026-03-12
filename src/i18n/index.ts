// ABOUTME: Internationalization setup using react-i18next.
// ABOUTME: Supports Hebrew (RTL) and English (LTR) with browser language detection.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import he from './locales/he.json';

function detectLocaleFromSettings(): string {
  try {
    const raw = localStorage.getItem('settings-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      const locale = parsed?.state?.locale;
      if (locale === 'en' || locale === 'he') return locale;
    }
  } catch {
    // ignore parse errors
  }
  return 'he';
}

const detectedLocale = detectLocaleFromSettings();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    lng: detectedLocale,
    fallbackLng: 'he',
    interpolation: {
      escapeValue: false, // React handles escaping
    },
  });

export default i18n;
