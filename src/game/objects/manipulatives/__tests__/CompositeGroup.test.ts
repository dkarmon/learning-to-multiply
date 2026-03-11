// ABOUTME: Unit tests for decomposition and cell width calculations.
// ABOUTME: Validates the core math: splitting numbers into 5s and 1s.

import { describe, it, expect } from 'vitest';
import { decompose, widthInCells } from '../decompose';

describe('decompose', () => {
  it('decomposes 0', () => {
    expect(decompose(0)).toEqual({ fives: 0, ones: 0 });
  });

  it('decomposes 1', () => {
    expect(decompose(1)).toEqual({ fives: 0, ones: 1 });
  });

  it('decomposes 5', () => {
    expect(decompose(5)).toEqual({ fives: 1, ones: 0 });
  });

  it('decomposes 6', () => {
    expect(decompose(6)).toEqual({ fives: 1, ones: 1 });
  });

  it('decomposes 13', () => {
    expect(decompose(13)).toEqual({ fives: 2, ones: 3 });
  });

  it('decomposes 25', () => {
    expect(decompose(25)).toEqual({ fives: 5, ones: 0 });
  });

  it('decomposes 47', () => {
    expect(decompose(47)).toEqual({ fives: 9, ones: 2 });
  });
});

describe('widthInCells', () => {
  it('returns 3 for {fives:0, ones:3}', () => {
    expect(widthInCells({ fives: 0, ones: 3 })).toBe(3);
  });

  it('returns 6 for {fives:1, ones:1}', () => {
    expect(widthInCells({ fives: 1, ones: 1 })).toBe(6);
  });

  it('returns 13 for {fives:2, ones:3}', () => {
    expect(widthInCells({ fives: 2, ones: 3 })).toBe(13);
  });
});
