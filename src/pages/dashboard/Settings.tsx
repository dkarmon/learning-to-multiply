// ABOUTME: Settings page for language, sound, and music preferences.
// ABOUTME: All settings persist to localStorage via Zustand.

import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/settings';
import { LanguageToggle } from '../../components/LanguageToggle';

export function Settings() {
  const { t } = useTranslation();
  const {
    soundEnabled,
    musicEnabled,
    setSoundEnabled,
    setMusicEnabled,
  } = useSettingsStore();

  const toggleStyle = (active: boolean) => ({
    padding: '8px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: active ? '#4CAF50' : '#ccc',
    color: 'white',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
  });

  return (
    <div style={{
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      <h1 style={{ color: '#06628d', marginBottom: '32px' }}>
        {t('settings.title')}
      </h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        {/* Language */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '18px' }}>{t('settings.language')}</span>
          <LanguageToggle />
        </div>

        {/* Sound */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '18px' }}>{t('settings.sound')}</span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={toggleStyle(soundEnabled)}
          >
            {soundEnabled ? t('settings.on') : t('settings.off')}
          </button>
        </div>

        {/* Music */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '18px' }}>{t('settings.music')}</span>
          <button
            onClick={() => setMusicEnabled(!musicEnabled)}
            style={toggleStyle(musicEnabled)}
          >
            {musicEnabled ? t('settings.on') : t('settings.off')}
          </button>
        </div>
      </div>
    </div>
  );
}
