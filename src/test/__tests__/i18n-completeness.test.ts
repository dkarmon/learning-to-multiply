// ABOUTME: Validates that Hebrew and English translations have identical key sets.
// ABOUTME: Catches missing translations before they reach production.

import { describe, it, expect } from 'vitest';
import en from '../../i18n/locales/en.json';
import he from '../../i18n/locales/he.json';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, fullKey);
    }
    return [fullKey];
  });
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>(
    (current, key) =>
      typeof current === 'object' && current !== null
        ? (current as Record<string, unknown>)[key]
        : undefined,
    obj,
  );
}

describe('i18n completeness', () => {
  const enKeys = new Set(flattenKeys(en));
  const heKeys = new Set(flattenKeys(he));

  it('English and Hebrew have the same number of keys', () => {
    expect(enKeys.size).toBe(heKeys.size);
  });

  it('every English key exists in Hebrew', () => {
    const missingInHe = [...enKeys].filter((k) => !heKeys.has(k));
    expect(missingInHe).toEqual([]);
  });

  it('every Hebrew key exists in English', () => {
    const missingInEn = [...heKeys].filter((k) => !enKeys.has(k));
    expect(missingInEn).toEqual([]);
  });

  it('no translation value is an empty string', () => {
    const emptyEn = [...enKeys].filter(
      (k) => getNestedValue(en as Record<string, unknown>, k) === '',
    );
    const emptyHe = [...heKeys].filter(
      (k) => getNestedValue(he as Record<string, unknown>, k) === '',
    );
    expect(emptyEn).toEqual([]);
    expect(emptyHe).toEqual([]);
  });
});
