// ABOUTME: Tests for app settings state store.
// ABOUTME: Validates locale switching, sound/music toggles, and persistence.

import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../settings';

describe('useSettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      locale: 'he',
      soundEnabled: true,
      musicEnabled: true,
    });
  });

  it('defaults to Hebrew locale', () => {
    expect(useSettingsStore.getState().locale).toBe('he');
  });

  it('switches locale to English', () => {
    useSettingsStore.getState().setLocale('en');
    expect(useSettingsStore.getState().locale).toBe('en');
  });

  it('switches locale back to Hebrew', () => {
    useSettingsStore.getState().setLocale('en');
    useSettingsStore.getState().setLocale('he');
    expect(useSettingsStore.getState().locale).toBe('he');
  });

  it('sets document direction to RTL for Hebrew', () => {
    useSettingsStore.getState().setLocale('he');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('he');
  });

  it('sets document direction to LTR for English', () => {
    useSettingsStore.getState().setLocale('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });

  it('toggles sound off', () => {
    useSettingsStore.getState().setSoundEnabled(false);
    expect(useSettingsStore.getState().soundEnabled).toBe(false);
  });

  it('toggles sound on', () => {
    useSettingsStore.getState().setSoundEnabled(false);
    useSettingsStore.getState().setSoundEnabled(true);
    expect(useSettingsStore.getState().soundEnabled).toBe(true);
  });

  it('toggles music off', () => {
    useSettingsStore.getState().setMusicEnabled(false);
    expect(useSettingsStore.getState().musicEnabled).toBe(false);
  });

  it('toggles music on', () => {
    useSettingsStore.getState().setMusicEnabled(false);
    useSettingsStore.getState().setMusicEnabled(true);
    expect(useSettingsStore.getState().musicEnabled).toBe(true);
  });

  it('defaults with sound and music enabled', () => {
    expect(useSettingsStore.getState().soundEnabled).toBe(true);
    expect(useSettingsStore.getState().musicEnabled).toBe(true);
  });
});
