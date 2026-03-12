// ABOUTME: Tests for the Phaser-side i18n helper.
// ABOUTME: Validates translation lookup and RTL detection.

import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../../stores/settings';
import { t, isRtl } from '../i18n';

describe('game i18n helper', () => {
  beforeEach(() => {
    useSettingsStore.setState({ locale: 'en' });
  });

  it('translates a simple key in English', () => {
    expect(t('game.levelComplete')).toBe('Level Complete!');
  });

  it('translates a simple key in Hebrew', () => {
    useSettingsStore.setState({ locale: 'he' });
    expect(t('game.levelComplete')).toContain('!');
  });

  it('handles interpolation', () => {
    expect(t('game.showAnswer', { answer: 42 })).toContain('42');
  });

  it('returns the key when translation is missing', () => {
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('isRtl returns false for English', () => {
    useSettingsStore.setState({ locale: 'en' });
    expect(isRtl()).toBe(false);
  });

  it('isRtl returns true for Hebrew', () => {
    useSettingsStore.setState({ locale: 'he' });
    expect(isRtl()).toBe(true);
  });
});
