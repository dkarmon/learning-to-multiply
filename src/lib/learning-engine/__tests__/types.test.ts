// ABOUTME: Tests for canonicalize() and factKey() utility functions.
// ABOUTME: Verifies canonical ordering and consistent string key generation.

import { describe, it, expect } from 'vitest';
import { canonicalize, factKey } from '../../../types/learning';

describe('canonicalize', () => {
  it('orders (5,3) as {factorA:3, factorB:5}', () => {
    expect(canonicalize(5, 3)).toEqual({ factorA: 3, factorB: 5 });
  });

  it('orders (3,5) as {factorA:3, factorB:5}', () => {
    expect(canonicalize(3, 5)).toEqual({ factorA: 3, factorB: 5 });
  });

  it('handles equal factors (4,4)', () => {
    expect(canonicalize(4, 4)).toEqual({ factorA: 4, factorB: 4 });
  });
});

describe('factKey', () => {
  it('returns "3x5" for factKey(5,3)', () => {
    expect(factKey(5, 3)).toBe('3x5');
  });

  it('returns "3x5" for factKey(3,5)', () => {
    expect(factKey(3, 5)).toBe('3x5');
  });

  it('returns "0x0" for factKey(0,0)', () => {
    expect(factKey(0, 0)).toBe('0x0');
  });
});
