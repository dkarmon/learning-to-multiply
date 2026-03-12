// ABOUTME: Tests for fluency scoring functions.
// ABOUTME: Verifies response time bucketing, fluent recall detection, and close answer logic.

import { describe, it, expect } from 'vitest';
import { scoreFluency, isFluentRecall, isCloseAnswer } from '../fluency';

describe('scoreFluency', () => {
  it('scores correct at 800ms as 5 (instant)', () => {
    expect(scoreFluency(true, 800)).toBe(5);
  });

  it('scores correct at 1500ms as 4 (at threshold)', () => {
    expect(scoreFluency(true, 1500)).toBe(4);
  });

  it('scores correct at 2500ms as 4 (hesitant)', () => {
    expect(scoreFluency(true, 2500)).toBe(4);
  });

  it('scores correct at 3000ms as 3 (at threshold)', () => {
    expect(scoreFluency(true, 3000)).toBe(3);
  });

  it('scores correct at 4500ms as 3 (slow)', () => {
    expect(scoreFluency(true, 4500)).toBe(3);
  });

  it('scores correct at 5000ms as 2 (at threshold)', () => {
    expect(scoreFluency(true, 5000)).toBe(2);
  });

  it('scores correct at 8000ms as 2 (barely)', () => {
    expect(scoreFluency(true, 8000)).toBe(2);
  });

  it('scores wrong and not close as 0', () => {
    expect(scoreFluency(false, 1000, false)).toBe(0);
  });

  it('scores wrong but close as 1', () => {
    expect(scoreFluency(false, 1000, true)).toBe(1);
  });
});

describe('isFluentRecall', () => {
  it('returns true for correct at 1000ms', () => {
    expect(isFluentRecall(true, 1000)).toBe(true);
  });

  it('returns true for correct at 2999ms', () => {
    expect(isFluentRecall(true, 2999)).toBe(true);
  });

  it('returns false for correct at 3000ms', () => {
    expect(isFluentRecall(true, 3000)).toBe(false);
  });

  it('returns false for wrong at 500ms', () => {
    expect(isFluentRecall(false, 500)).toBe(false);
  });
});

describe('isCloseAnswer', () => {
  it('returns true for correct=24 given=25 (4% off)', () => {
    expect(isCloseAnswer(24, 25)).toBe(true);
  });

  it('returns false for correct=24 given=30 (25% off)', () => {
    expect(isCloseAnswer(24, 30)).toBe(false);
  });

  it('returns true for correct=0 given=1', () => {
    expect(isCloseAnswer(0, 1)).toBe(true);
  });

  it('returns false for correct=0 given=3', () => {
    expect(isCloseAnswer(0, 3)).toBe(false);
  });

  it('returns true for correct=56 given=54 (3.6% off)', () => {
    expect(isCloseAnswer(56, 54)).toBe(true);
  });
});
