// ABOUTME: Tests for the build-up sequence generator.
// ABOUTME: Verifies scaffold/question step generation based on mastery state.

import { describe, it, expect } from 'vitest';
import { generateBuildUpSequence, shouldUseBuildUp } from '../build-up';
import type { FactMasteryRecord } from '../../../types/learning';
import { factKey } from '../../../types/learning';

function makeRecord(a: number, b: number, box: number): [string, FactMasteryRecord] {
  const key = factKey(a, b);
  return [key, {
    kidId: 'kid1',
    factorA: Math.min(a, b),
    factorB: Math.max(a, b),
    leitnerBox: box,
    totalAttempts: box > 0 ? 5 : 0,
    correctAttempts: box > 0 ? 4 : 0,
    avgResponseTimeMs: 1500,
    lastPracticedAt: new Date(),
    nextReviewAt: null,
  }];
}

describe('generateBuildUpSequence', () => {
  it('6x5 nothing mastered generates 5 question steps', () => {
    const records = new Map<string, FactMasteryRecord>();
    const result = generateBuildUpSequence(6, 5, records);

    expect(result.targetFact).toEqual({ factorA: 5, factorB: 6 });
    expect(result.steps).toHaveLength(5);
    expect(result.steps.every(s => s.isQuestion)).toBe(true);
    expect(result.steps.every(s => !s.isScaffold)).toBe(true);
    expect(result.steps[0]).toMatchObject({ factorA: 6, factorB: 1, correctAnswer: 6 });
    expect(result.steps[4]).toMatchObject({ factorA: 6, factorB: 5, correctAnswer: 30 });
  });

  it('6x5 with 6x1-6x3 mastered starts scaffold at 6x3', () => {
    const records = new Map<string, FactMasteryRecord>([
      makeRecord(6, 1, 3),
      makeRecord(6, 2, 3),
      makeRecord(6, 3, 3),
    ]);
    const result = generateBuildUpSequence(6, 5, records);

    expect(result.steps).toHaveLength(3);
    expect(result.steps[0]).toMatchObject({ factorA: 6, factorB: 3, isScaffold: true, isQuestion: false });
    expect(result.steps[1]).toMatchObject({ factorA: 6, factorB: 4, isScaffold: false, isQuestion: true });
    expect(result.steps[2]).toMatchObject({ factorA: 6, factorB: 5, isScaffold: false, isQuestion: true });
  });

  it('6x5 with all sub-facts mastered starts scaffold at 6x4', () => {
    const records = new Map<string, FactMasteryRecord>([
      makeRecord(6, 1, 3),
      makeRecord(6, 2, 3),
      makeRecord(6, 3, 3),
      makeRecord(6, 4, 3),
    ]);
    const result = generateBuildUpSequence(6, 5, records);

    expect(result.steps).toHaveLength(2);
    expect(result.steps[0]).toMatchObject({ factorA: 6, factorB: 4, isScaffold: true, isQuestion: false });
    expect(result.steps[1]).toMatchObject({ factorA: 6, factorB: 5, isScaffold: false, isQuestion: true });
  });

  it('6x1 edge case returns single question step', () => {
    const records = new Map<string, FactMasteryRecord>();
    const result = generateBuildUpSequence(6, 1, records);

    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]).toMatchObject({ factorA: 6, factorB: 1, isQuestion: true });
  });

  it('6x0 edge case returns single question step', () => {
    const records = new Map<string, FactMasteryRecord>();
    const result = generateBuildUpSequence(6, 0, records);

    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]).toMatchObject({ factorA: 6, factorB: 0, isQuestion: true });
  });

  it('3x2 with 3x1 mastered returns scaffold + question', () => {
    const records = new Map<string, FactMasteryRecord>([
      makeRecord(3, 1, 3),
    ]);
    const result = generateBuildUpSequence(3, 2, records);

    expect(result.steps).toHaveLength(2);
    expect(result.steps[0]).toMatchObject({ factorA: 3, factorB: 1, isScaffold: true, isQuestion: false });
    expect(result.steps[1]).toMatchObject({ factorA: 3, factorB: 2, isScaffold: false, isQuestion: true });
  });
});

describe('shouldUseBuildUp', () => {
  it('returns true for 6x5 not mastered', () => {
    const records = new Map<string, FactMasteryRecord>();
    expect(shouldUseBuildUp(6, 5, records)).toBe(true);
  });

  it('returns false for 6x2 (targetStep too small)', () => {
    const records = new Map<string, FactMasteryRecord>();
    expect(shouldUseBuildUp(6, 2, records)).toBe(false);
  });

  it('returns false for 6x5 already mastered (box 3+)', () => {
    const records = new Map<string, FactMasteryRecord>([
      makeRecord(6, 5, 3),
    ]);
    expect(shouldUseBuildUp(6, 5, records)).toBe(false);
  });

  it('returns false for 6x1 (targetStep=1)', () => {
    const records = new Map<string, FactMasteryRecord>();
    expect(shouldUseBuildUp(6, 1, records)).toBe(false);
  });
});
