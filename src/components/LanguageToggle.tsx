// ABOUTME: Toggle button that switches between Hebrew and English.
// ABOUTME: Updates i18n language, document direction, and settings store.

import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../stores/settings';
import type { Locale } from '../types';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const { locale, setLocale } = useSettingsStore();

  const toggle = () => {
    const newLocale: Locale = locale === 'he' ? 'en' : 'he';
    setLocale(newLocale);
    i18n.changeLanguage(newLocale);
  };

  return (
    <button
      onClick={toggle}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: '2px solid #06628d',
        backgroundColor: 'white',
        color: '#06628d',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        cursor: 'pointer',
      }}
    >
      {locale === 'he' ? 'English' : 'עברית'}
    </button>
  );
}
