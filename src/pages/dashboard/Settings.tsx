// ABOUTME: Settings page for language, sound, music, session limit, and account info.
// ABOUTME: All settings persist to localStorage via Zustand.

import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/settings';
import { useAuthStore } from '../../stores/auth';
import { LanguageToggle } from '../../components/LanguageToggle';

type SessionLimitOption = 0 | 10 | 15 | 20;

const SESSION_LIMIT_OPTIONS: { value: SessionLimitOption; labelKey: string }[] = [
  { value: 0, labelKey: 'settings.noLimit' },
  { value: 10, labelKey: 'settings.tenMin' },
  { value: 15, labelKey: 'settings.fifteenMin' },
  { value: 20, labelKey: 'settings.twentyMin' },
];

export function Settings() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    soundEnabled, musicEnabled,
    setSoundEnabled, setMusicEnabled,
  } = useSettingsStore();

  const toggleButton = (active: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-correct text-white'
          : 'bg-gray-200 text-gray-500'
      }`}
    >
      {active ? t('settings.on') : t('settings.off')}
    </button>
  );

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <h1 className="text-2xl font-bold text-deep-brand">{t('settings.title')}</h1>

      {/* Language */}
      <div className="flex items-center justify-between">
        <span className="text-lg">{t('settings.language')}</span>
        <LanguageToggle />
      </div>

      {/* Sound Effects */}
      <div className="flex items-center justify-between">
        <span className="text-lg">{t('settings.sound')}</span>
        {toggleButton(soundEnabled, () => setSoundEnabled(!soundEnabled))}
      </div>

      {/* Background Music */}
      <div className="flex items-center justify-between">
        <span className="text-lg">{t('settings.music')}</span>
        {toggleButton(musicEnabled, () => setMusicEnabled(!musicEnabled))}
      </div>

      {/* Session Length */}
      <div className="flex flex-col gap-2">
        <span className="text-lg">{t('settings.sessionLimit')}</span>
        <div className="flex gap-2 flex-wrap">
          {SESSION_LIMIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:border-deep-brand hover:text-deep-brand transition-colors cursor-pointer bg-white"
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-bold text-deep-brand mb-3">{t('settings.account')}</h2>
        <p className="text-sm text-gray-600">
          {t('settings.linkedGoogle')}: {user?.email ?? '--'}
        </p>
      </div>

      {/* About */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-bold text-deep-brand mb-3">{t('settings.about')}</h2>
        <p className="text-sm text-gray-600">{t('settings.aboutText')}</p>
        <p className="text-xs text-gray-400 mt-2">{t('settings.version')} 0.1.0</p>
      </div>
    </div>
  );
}
