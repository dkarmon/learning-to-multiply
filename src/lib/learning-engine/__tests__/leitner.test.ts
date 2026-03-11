// ABOUTME: Tests for the Leitner box spaced repetition system.
// ABOUTME: Verifies promotion, demotion, review scheduling, and attempt processing.

import { describe, it, expect } from 'vitest';
import {
  promoteFact,
  demoteFact,
  isDueForReview,
  getBoxForFact,
  calculateNextReviewDate,
  processAttempt,
} from '../leitner';
import type { FactMasteryRecord } from '../../../types/learning';

function makeRecord(overrides: Partial<FactMasteryRecord> = {}): FactMasteryRecord {
  return {
    kidId: 'kid1',
    factorA: 3,
    factorB: 5,
    leitnerBox: 1,
    totalAttempts: 0,
    correctAttempts: 0,
    avgResponseTimeMs: null,
    lastPracticedAt: null,
    nextReviewAt: null,
    ...overrides,
  };
}

describe('promoteFact', () => {
  it('promotes box 1 quality 5 to box 2', () => {
    expect(promoteFact(1, 5)).toBe(2);
  });

  it('promotes box 4 quality 4 to box 5', () => {
    expect(promoteFact(4, 4)).toBe(5);
  });

  it('caps at box 5 for box 5 quality 5', () => {
    expect(promoteFact(5, 5)).toBe(5);
  });

  it('stays in box 3 for quality 2 (too slow)', () => {
    expect(promoteFact(3, 2)).toBe(3);
  });
});

describe('demoteFact', () => {
  it('demotes box 3 to box 2', () => {
    expect(demoteFact(3)).toBe(2);
  });

  it('floors at box 1', () => {
    expect(demoteFact(1)).toBe(1);
  });

  it('demotes box 5 to box 4', () => {
    expect(demoteFact(5)).toBe(4);
  });
});

describe('isDueForReview', () => {
  it('box 1 is always due (any session gap)', () => {
    const record = makeRecord({ leitnerBox: 1, lastPracticedAt: new Date() });
    expect(isDueForReview(record, 5, 4)).toBe(true);
  });

  it('box 2 with 1 session gap is not due', () => {
    const record = makeRecord({ leitnerBox: 2, lastPracticedAt: new Date() });
    expect(isDueForReview(record, 5, 4)).toBe(false);
  });

  it('box 2 with 2 session gap is due', () => {
    const record = makeRecord({ leitnerBox: 2, lastPracticedAt: new Date() });
    expect(isDueForReview(record, 6, 4)).toBe(true);
  });

  it('box 3 with 3 session gap is not due', () => {
    const record = makeRecord({ leitnerBox: 3, lastPracticedAt: new Date() });
    expect(isDueForReview(record, 7, 4)).toBe(false);
  });

  it('box 3 with 4 session gap is due', () => {
    const record = makeRecord({ leitnerBox: 3, lastPracticedAt: new Date() });
    expect(isDueForReview(record, 8, 4)).toBe(true);
  });

  it('box 4 with 7 session gap is not due', () => {
    const record = makeRecord({ leitnerBox: 4, lastPracticedAt: new Date() });
    expect(isDueForReview(record, 11, 4)).toBe(false);
  });

  it('box 4 with 8 session gap is due', () => {
    const record = makeRecord({ leitnerBox: 4, lastPracticedAt: new Date() });
    expect(isDueForReview(record, 12, 4)).toBe(true);
  });

  it('box 5 with 13 days gap is not due', () => {
    const now = new Date('2026-03-14');
    const lastPracticed = new Date('2026-03-01');
    const record = makeRecord({ leitnerBox: 5, lastPracticedAt: lastPracticed });
    expect(isDueForReview(record, 10, 5, now)).toBe(false);
  });

  it('box 5 with 14 days gap is due', () => {
    const now = new Date('2026-03-15');
    const lastPracticed = new Date('2026-03-01');
    const record = makeRecord({ leitnerBox: 5, lastPracticedAt: lastPracticed });
    expect(isDueForReview(record, 10, 5, now)).toBe(true);
  });

  it('no lastPracticedAt is always due', () => {
    const record = makeRecord({ leitnerBox: 3, lastPracticedAt: null });
    expect(isDueForReview(record, 1, 0)).toBe(true);
  });
});

describe('getBoxForFact', () => {
  it('returns 0 for missing record', () => {
    const records = new Map<string, FactMasteryRecord>();
    expect(getBoxForFact(records, '3x5')).toBe(0);
  });

  it('returns the box number for existing record', () => {
    const records = new Map<string, FactMasteryRecord>();
    records.set('3x5', makeRecord({ leitnerBox: 4 }));
    expect(getBoxForFact(records, '3x5')).toBe(4);
  });
});

describe('calculateNextReviewDate', () => {
  it('returns date 14 days out for box 5', () => {
    const now = new Date('2026-03-01T00:00:00Z');
    const result = calculateNextReviewDate(5, now);
    expect(result).not.toBeNull();
    expect(result!.getDate()).toBe(15);
  });

  it('returns null for boxes 1-4', () => {
    expect(calculateNextReviewDate(1)).toBeNull();
    expect(calculateNextReviewDate(2)).toBeNull();
    expect(calculateNextReviewDate(3)).toBeNull();
    expect(calculateNextReviewDate(4)).toBeNull();
  });
});

describe('processAttempt', () => {
  it('correct with quality 5 promotes box and updates counts', () => {
    const record = makeRecord({ leitnerBox: 2, totalAttempts: 5, correctAttempts: 4, avgResponseTimeMs: 1000 });
    const result = processAttempt(record, true, 800, 5);
    expect(result.leitnerBox).toBe(3);
    expect(result.totalAttempts).toBe(6);
    expect(result.correctAttempts).toBe(5);
    expect(result.lastPracticedAt).not.toBeNull();
  });

  it('correct with quality 2 keeps box same', () => {
    const record = makeRecord({ leitnerBox: 2, totalAttempts: 3, correctAttempts: 2, avgResponseTimeMs: 2000 });
    const result = processAttempt(record, true, 6000, 2);
    expect(result.leitnerBox).toBe(2);
    expect(result.totalAttempts).toBe(4);
    expect(result.correctAttempts).toBe(3);
  });

  it('incorrect demotes box by one', () => {
    const record = makeRecord({ leitnerBox: 3, totalAttempts: 5, correctAttempts: 3, avgResponseTimeMs: 2000 });
    const result = processAttempt(record, false, 3000, 0);
    expect(result.leitnerBox).toBe(2);
    expect(result.totalAttempts).toBe(6);
    expect(result.correctAttempts).toBe(3);
  });

  it('calculates running average response time correctly', () => {
    const record = makeRecord({ leitnerBox: 1, totalAttempts: 3, correctAttempts: 3, avgResponseTimeMs: 1000 });
    const result = processAttempt(record, true, 2000, 5);
    // Running average: 1000 + (2000 - 1000) / 4 = 1250
    expect(result.avgResponseTimeMs).toBe(1250);
  });

  it('handles null avgResponseTimeMs on first attempt', () => {
    const record = makeRecord({ totalAttempts: 0, avgResponseTimeMs: null });
    const result = processAttempt(record, true, 1500, 5);
    // prevAvg = responseTimeMs (1500), newAvg = 1500 + (1500-1500)/1 = 1500
    expect(result.avgResponseTimeMs).toBe(1500);
  });
});
