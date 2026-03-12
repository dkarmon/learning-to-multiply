// ABOUTME: Translation helper for Phaser scenes (which can't use React hooks).
// ABOUTME: Reads locale from settings store and looks up keys in translation files.

import en from '../i18n/locales/en.json';
import he from '../i18n/locales/he.json';
import { useSettingsStore } from '../stores/settings';
import type { Locale } from '../types';

type TranslationMap = Record<string, string | Record<string, string>>;

const translations: Record<Locale, TranslationMap> = { en, he };

function resolve(obj: TranslationMap, path: string): string | undefined {
  const parts = path.split('.');
  let current: TranslationMap | string = obj;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, TranslationMap | string>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const locale = useSettingsStore.getState().locale;
  const value = resolve(translations[locale], key);
  if (value === undefined) return key;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_match, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{{${name}}}`
  );
}

export function isRtl(): boolean {
  return useSettingsStore.getState().locale === 'he';
}

const ENCOURAGEMENT_KEYS = [
  'game.encouragement1',
  'game.encouragement2',
  'game.encouragement3',
  'game.encouragement4',
  'game.encouragement5',
  'game.encouragement6',
];

export function randomEncouragement(): string {
  const key = ENCOURAGEMENT_KEYS[Math.floor(Math.random() * ENCOURAGEMENT_KEYS.length)];
  return t(key);
}
