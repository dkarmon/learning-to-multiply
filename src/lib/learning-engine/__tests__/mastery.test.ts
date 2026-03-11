// ABOUTME: Tests for mastery calculation and aggregation functions.
// ABOUTME: Verifies fact summaries, overall mastery, heat map, trends, and struggling fact detection.

import { describe, it, expect } from 'vitest';
import {
  getAllCanonicalFacts,
  getFactMastery,
  getAllMastery,
  getMasteryHeatMap,
  getStrugglingFacts,
} from '../mastery';
import { factKey } from '../../../types/learning';
import type { FactMasteryRecord, QuestionAttempt, FluencyQuality } from '../../../types/learning';

function makeAttempt(isCorrect: boolean): QuestionAttempt {
  return {
    factorA: 3, factorB: 5, correctAnswer: 15,
    givenAnswer: isCorrect ? 15 : 10,
    isCorrect,
    responseTimeMs: 1000,
    hintLevel: 0,
    errorType: isCorrect ? null : 'other',
    fluencyQuality: (isCorrect ? 5 : 0) as FluencyQuality,
    attemptedAt: new Date(),
  };
}

describe('getAllCanonicalFacts', () => {
  it('returns exactly 66 facts', () => {
    expect(getAllCanonicalFacts()).toHaveLength(66);
  });

  it('first is (0,0) and last is (10,10)', () => {
    const facts = getAllCanonicalFacts();
    expect(facts[0]).toEqual({ factorA: 0, factorB: 0 });
    expect(facts[facts.length - 1]).toEqual({ factorA: 10, factorB: 10 });
  });

  it('has no duplicates', () => {
    const facts = getAllCanonicalFacts();
    const keys = facts.map(f => factKey(f.factorA, f.factorB));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('getFactMastery', () => {
  it('no record returns box 0, 0% accuracy, stable trend', () => {
    const summary = getFactMastery(undefined, []);
    expect(summary.leitnerBox).toBe(0);
    expect(summary.accuracyPercent).toBe(0);
    expect(summary.trend).toBe('stable');
    expect(summary.lastPracticedAt).toBeNull();
  });

  it('record with 10 attempts 8 correct returns 80% accuracy', () => {
    const record: FactMasteryRecord = {
      kidId: 'kid1', factorA: 3, factorB: 5, leitnerBox: 3,
      totalAttempts: 10, correctAttempts: 8, avgResponseTimeMs: 1500,
      lastPracticedAt: new Date(), nextReviewAt: null,
    };
    const summary = getFactMastery(record, []);
    expect(summary.accuracyPercent).toBe(80);
    expect(summary.leitnerBox).toBe(3);
  });

  it('trend from [wrong, wrong, right, right, right] is improving', () => {
    const record: FactMasteryRecord = {
      kidId: 'kid1', factorA: 3, factorB: 5, leitnerBox: 2,
      totalAttempts: 5, correctAttempts: 3, avgResponseTimeMs: 2000,
      lastPracticedAt: new Date(), nextReviewAt: null,
    };
    const attempts = [
      makeAttempt(false), makeAttempt(false),
      makeAttempt(true), makeAttempt(true), makeAttempt(true),
    ];
    const summary = getFactMastery(record, attempts);
    expect(summary.trend).toBe('improving');
  });
});

describe('getAllMastery', () => {
  it('empty records returns 66 not_started', () => {
    const records = new Map<string, FactMasteryRecord>();
    const mastery = getAllMastery(records);
    expect(mastery.totalFacts).toBe(66);
    expect(mastery.notStarted).toBe(66);
    expect(mastery.mastered).toBe(0);
    expect(mastery.learning).toBe(0);
    expect(mastery.struggling).toBe(0);
  });

  it('correctly categorizes mixed records', () => {
    const records = new Map<string, FactMasteryRecord>();
    // Mastered (box 4-5)
    records.set(factKey(3, 5), {
      kidId: 'kid1', factorA: 3, factorB: 5, leitnerBox: 4,
      totalAttempts: 10, correctAttempts: 9, avgResponseTimeMs: 1000,
      lastPracticedAt: new Date(), nextReviewAt: null,
    });
    records.set(factKey(4, 6), {
      kidId: 'kid1', factorA: 4, factorB: 6, leitnerBox: 5,
      totalAttempts: 15, correctAttempts: 14, avgResponseTimeMs: 800,
      lastPracticedAt: new Date(), nextReviewAt: null,
    });
    // Learning (box 2-3)
    records.set(factKey(2, 7), {
      kidId: 'kid1', factorA: 2, factorB: 7, leitnerBox: 2,
      totalAttempts: 5, correctAttempts: 3, avgResponseTimeMs: 2000,
      lastPracticedAt: new Date(), nextReviewAt: null,
    });
    // Struggling (box 1 with attempts)
    records.set(factKey(6, 8), {
      kidId: 'kid1', factorA: 6, factorB: 8, leitnerBox: 1,
      totalAttempts: 4, correctAttempts: 1, avgResponseTimeMs: 4000,
      lastPracticedAt: new Date(), nextReviewAt: null,
    });

    const mastery = getAllMastery(records);
    expect(mastery.mastered).toBe(2);
    expect(mastery.learning).toBe(1);
    expect(mastery.struggling).toBe(1);
    expect(mastery.notStarted).toBe(66 - 4);
  });
});

describe('getMasteryHeatMap', () => {
  it('returns exactly 121 cells', () => {
    const records = new Map<string, FactMasteryRecord>();
    const cells = getMasteryHeatMap(records);
    expect(cells).toHaveLength(121);
  });

  it('(3,5) and (5,3) share the same status', () => {
    const records = new Map<string, FactMasteryRecord>();
    records.set(factKey(3, 5), {
      kidId: 'kid1', factorA: 3, factorB: 5, leitnerBox: 4,
      totalAttempts: 10, correctAttempts: 9, avgResponseTimeMs: 1000,
      lastPracticedAt: new Date(), nextReviewAt: null,
    });

    const cells = getMasteryHeatMap(records);
    const cell35 = cells.find(c => c.factorA === 3 && c.factorB === 5);
    const cell53 = cells.find(c => c.factorA === 5 && c.factorB === 3);
    expect(cell35!.status).toBe(cell53!.status);
    expect(cell35!.leitnerBox).toBe(cell53!.leitnerBox);
  });

  it('unstarted facts show not_started', () => {
    const records = new Map<string, FactMasteryRecord>();
    const cells = getMasteryHeatMap(records);
    expect(cells.every(c => c.status === 'not_started')).toBe(true);
  });
});

describe('calculateTrend (via getFactMastery)', () => {
  it('less than 4 attempts returns stable', () => {
    const record: FactMasteryRecord = {
      kidId: 'kid1', factorA: 3, factorB: 5, leitnerBox: 1,
      totalAttempts: 3, correctAttempts: 2, avgResponseTimeMs: 2000,
      lastPracticedAt: new Date(), nextReviewAt: null,
    };
    const attempts = [makeAttempt(true), makeAttempt(false), makeAttempt(true)];
    expect(getFactMastery(record, attempts).trend).toBe('stable');
  });

  it('first half wrong, second half right returns improving', () => {
    const record: FactMasteryRecord = {
      kidId: 'kid1', factorA: 3, factorB: 5, leitnerBox: 2,
      totalAttempts: 6, correctAttempts: 3, avgResponseTimeMs: 2000,
      lastPracticedAt: new Date(), nextReviewAt: null,
    };
    const attempts = [
      makeAttempt(false), makeAttempt(false), makeAttempt(false),
      makeAttempt(true), makeAttempt(true), makeAttempt(true),
    ];
    expect(getFactMastery(record, attempts).trend).toBe('improving');
  });

  it('first half right, second half wrong returns declining', () => {
    const record: FactMasteryRecord = {
      kidId: 'kid1', factorA: 3, factorB: 5, leitnerBox: 2,
      totalAttempts: 6, correctAttempts: 3, avgResponseTimeMs: 2000,
      lastPracticedAt: new Date(), nextReviewAt: null,
    };
    const attempts = [
      makeAttempt(true), makeAttempt(true), makeAttempt(true),
      makeAttempt(false), makeAttempt(false), makeAttempt(false),
    ];
    expect(getFactMastery(record, attempts).trend).toBe('declining');
  });

  it('mixed results returns stable', () => {
    const record: FactMasteryRecord = {
      kidId: 'kid1', factorA: 3, factorB: 5, leitnerBox: 2,
      totalAttempts: 4, correctAttempts: 2, avgResponseTimeMs: 2000,
      lastPracticedAt: new Date(), nextReviewAt: null,
    };
    const attempts = [
      makeAttempt(true), makeAttempt(false),
      makeAttempt(true), makeAttempt(false),
    ];
    expect(getFactMastery(record, attempts).trend).toBe('stable');
  });
});

describe('getStrugglingFacts', () => {
  it('returns facts sorted by lowest box then lowest accuracy', () => {
    const records = new Map<string, FactMasteryRecord>();
    records.set(factKey(3, 5), {
      kidId: 'kid1', factorA: 3, factorB: 5, leitnerBox: 2,
      totalAttempts: 10, correctAttempts: 7, avgResponseTimeMs: 2000,
      lastPracticedAt: new Date(), nextReviewAt: null,
    });
    records.set(factKey(6, 8), {
      kidId: 'kid1', factorA: 6, factorB: 8, leitnerBox: 1,
      totalAttempts: 8, correctAttempts: 2, avgResponseTimeMs: 4000,
      lastPracticedAt: new Date(), nextReviewAt: null,
    });
    records.set(factKey(4, 7), {
      kidId: 'kid1', factorA: 4, factorB: 7, leitnerBox: 1,
      totalAttempts: 6, correctAttempts: 3, avgResponseTimeMs: 3000,
      lastPracticedAt: new Date(), nextReviewAt: null,
    });

    const struggling = getStrugglingFacts(records);
    // Box 1 facts first (6x8 and 4x7), sorted by accuracy
    expect(struggling[0].factorA).toBe(6); // 6x8: 25% accuracy
    expect(struggling[1].factorA).toBe(4); // 4x7: 50% accuracy
    expect(struggling[2].factorA).toBe(3); // 3x5: 70% accuracy
  });

  it('respects limit parameter', () => {
    const records = new Map<string, FactMasteryRecord>();
    for (let i = 3; i <= 8; i++) {
      records.set(factKey(i, i + 1), {
        kidId: 'kid1', factorA: i, factorB: i + 1, leitnerBox: 1,
        totalAttempts: 5, correctAttempts: 1, avgResponseTimeMs: 3000,
        lastPracticedAt: new Date(), nextReviewAt: null,
      });
    }
    expect(getStrugglingFacts(records, 3)).toHaveLength(3);
  });

  it('excludes facts with 0 attempts', () => {
    const records = new Map<string, FactMasteryRecord>();
    records.set(factKey(3, 5), {
      kidId: 'kid1', factorA: 3, factorB: 5, leitnerBox: 0,
      totalAttempts: 0, correctAttempts: 0, avgResponseTimeMs: null,
      lastPracticedAt: null, nextReviewAt: null,
    });
    expect(getStrugglingFacts(records)).toHaveLength(0);
  });
});
