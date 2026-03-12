// ABOUTME: Tests for question selection and level building logic.
// ABOUTME: Verifies interleaving, deduplication, retry handling, and build-up integration.

import { describe, it, expect } from 'vitest';
import { buildLevelQuestions, getNextQuestion } from '../question-selector';
import { startSession, recordAttempt } from '../session';
import { factKey } from '../../../types/learning';
import type { FactMasteryRecord, Question, LevelPlan } from '../../../types/learning';

function makeRecord(a: number, b: number, box: number, attempts: number = 5): [string, FactMasteryRecord] {
  const key = factKey(a, b);
  return [key, {
    kidId: 'kid1',
    factorA: Math.min(a, b),
    factorB: Math.max(a, b),
    leitnerBox: box,
    totalAttempts: attempts,
    correctAttempts: Math.floor(attempts * 0.8),
    avgResponseTimeMs: 1500,
    lastPracticedAt: new Date(),
    nextReviewAt: null,
  }];
}

describe('buildLevelQuestions', () => {
  it('fresh kid level 1 gets 5 questions from tier 1 multipliers', () => {
    const records = new Map<string, FactMasteryRecord>();
    const session = startSession('kid1', 1);
    const plan = buildLevelQuestions(1, records, session, 1, new Map());

    expect(plan.questions).toHaveLength(5);
    expect(plan.tier).toBe(1);
    for (const q of plan.questions) {
      const minFactor = Math.min(q.factorA, q.factorB);
      const maxFactor = Math.max(q.factorA, q.factorB);
      expect(
        [0, 1, 2].includes(minFactor) || [0, 1, 2].includes(maxFactor)
      ).toBe(true);
    }
  });

  it('kid at level 4 with mastery gets mix of new and review', () => {
    const records = new Map<string, FactMasteryRecord>([
      makeRecord(0, 1, 3),
      makeRecord(0, 2, 3),
      makeRecord(1, 2, 3),
      makeRecord(0, 0, 3),
      makeRecord(1, 1, 3),
      makeRecord(2, 2, 3),
    ]);
    const session = startSession('kid1', 4);
    const plan = buildLevelQuestions(4, records, session, 4, new Map());

    expect(plan.questions).toHaveLength(5);
    expect(plan.tier).toBe(2);
    expect(plan.reviewRatio).toBeGreaterThan(0);
  });

  it('no two consecutive questions test the same canonical fact', () => {
    const records = new Map<string, FactMasteryRecord>([
      makeRecord(0, 1, 2),
      makeRecord(0, 2, 2),
      makeRecord(1, 2, 2),
    ]);
    const session = startSession('kid1', 1);
    const plan = buildLevelQuestions(1, records, session, 1, new Map());

    for (let i = 1; i < plan.questions.length; i++) {
      const prevKey = factKey(plan.questions[i - 1].factorA, plan.questions[i - 1].factorB);
      const currKey = factKey(plan.questions[i].factorA, plan.questions[i].factorB);
      expect(prevKey).not.toBe(currKey);
    }
  });

  it('introduces at most 1 truly new fact per level', () => {
    // Provide enough mastery records that most questions are filled from known facts
    const records = new Map<string, FactMasteryRecord>();
    // All tier 1 facts (0,1,2 x 0-10) with some mastery
    for (let a = 0; a <= 2; a++) {
      for (let b = a; b <= 10; b++) {
        records.set(factKey(a, b), {
          kidId: 'kid1', factorA: a, factorB: b, leitnerBox: 2,
          totalAttempts: 3, correctAttempts: 2, avgResponseTimeMs: 2000,
          lastPracticedAt: new Date(), nextReviewAt: null,
        });
      }
    }
    // Remove a few so they're "truly new"
    records.delete(factKey(2, 8));
    records.delete(factKey(2, 9));
    records.delete(factKey(2, 10));

    const session = startSession('kid1', 1);
    const plan = buildLevelQuestions(1, records, session, 1, new Map());

    const trulyNewCount = plan.questions.filter(q => {
      const key = factKey(q.factorA, q.factorB);
      return !records.has(key);
    }).length;
    expect(trulyNewCount).toBeLessThanOrEqual(1);
  });
});

describe('interleaving', () => {
  it('alternates new and review questions', () => {
    const records = new Map<string, FactMasteryRecord>([
      makeRecord(0, 1, 3),
      makeRecord(0, 2, 3),
      makeRecord(1, 2, 3),
      makeRecord(0, 0, 3),
      makeRecord(1, 1, 3),
    ]);
    const session = startSession('kid1', 1);
    const plan = buildLevelQuestions(1, records, session, 1, new Map());

    // Should have both review and non-review
    const hasReview = plan.questions.some(q => q.isReview);
    const hasNew = plan.questions.some(q => !q.isReview);
    if (hasReview && hasNew) {
      // Should be interleaved, not all grouped
      let lastWasReview = plan.questions[0].isReview;
      let switches = 0;
      for (let i = 1; i < plan.questions.length; i++) {
        if (plan.questions[i].isReview !== lastWasReview) {
          switches++;
          lastWasReview = plan.questions[i].isReview;
        }
      }
      expect(switches).toBeGreaterThan(0);
    }
  });

  it('handles all review with no new', () => {
    // All facts mastered but still practicing
    const records = new Map<string, FactMasteryRecord>();
    // Fill all tier 1 facts with high mastery
    for (let a = 0; a <= 2; a++) {
      for (let b = a; b <= 10; b++) {
        records.set(factKey(a, b), {
          kidId: 'kid1',
          factorA: a,
          factorB: b,
          leitnerBox: 4,
          totalAttempts: 10,
          correctAttempts: 9,
          avgResponseTimeMs: 1000,
          lastPracticedAt: new Date(),
          nextReviewAt: null,
        });
      }
    }
    const session = startSession('kid1', 1);
    const plan = buildLevelQuestions(1, records, session, 1, new Map());
    expect(plan.questions).toHaveLength(5);
  });
});

describe('deduplication', () => {
  it('swaps consecutive same-fact questions', () => {
    const records = new Map<string, FactMasteryRecord>();
    const session = startSession('kid1', 1);
    const plan = buildLevelQuestions(1, records, session, 1, new Map());

    for (let i = 1; i < plan.questions.length; i++) {
      const prevKey = factKey(plan.questions[i - 1].factorA, plan.questions[i - 1].factorB);
      const currKey = factKey(plan.questions[i].factorA, plan.questions[i].factorB);
      expect(prevKey).not.toBe(currKey);
    }
  });
});

describe('getNextQuestion', () => {
  const emptyRecords = new Map<string, FactMasteryRecord>();

  function makeLevelPlan(questions: Question[]): LevelPlan {
    return { levelNumber: 1, questions, tier: 1, reviewRatio: 0 };
  }

  function makeQuestion(a: number, b: number, isReview: boolean = false): Question {
    return {
      factorA: a, factorB: b, correctAnswer: a * b,
      isBuildingUp: false, buildUpSequenceIndex: 0,
      isReview, leitnerBox: 0,
    };
  }

  it('returns question from level plan when no retry due', () => {
    const session = startSession('kid1', 1);
    const plan = makeLevelPlan([makeQuestion(2, 3), makeQuestion(4, 5)]);

    const result = getNextQuestion(plan, 0, session, emptyRecords);
    expect(result.isRetry).toBe(false);
    expect(result.question.factorA).toBe(2);
    expect(result.question.factorB).toBe(3);
  });

  it('returns retry fact when due', () => {
    let session = startSession('kid1', 1);
    // Miss a fact
    const r1 = recordAttempt(session, 3, 5, 10, 2000, 0, emptyRecords);
    session = r1.session;
    // Answer 2 more questions
    const r2 = recordAttempt(session, 2, 4, 8, 1000, 0, emptyRecords);
    session = r2.session;
    const r3 = recordAttempt(session, 1, 7, 7, 1000, 0, emptyRecords);
    session = r3.session;

    const plan = makeLevelPlan([makeQuestion(6, 7)]);
    const result = getNextQuestion(plan, 0, session, emptyRecords);

    expect(result.isRetry).toBe(true);
    expect(result.question.correctAnswer).toBe(15); // 3x5
  });

  it('returns buildUpSequence for eligible new fact', () => {
    const session = startSession('kid1', 1);
    const plan = makeLevelPlan([makeQuestion(6, 5)]);

    const result = getNextQuestion(plan, 0, session, emptyRecords);
    expect(result.buildUpSequence).not.toBeNull();
    expect(result.buildUpSequence!.length).toBeGreaterThan(1);
  });

  it('returns null buildUpSequence for small factors', () => {
    const session = startSession('kid1', 1);
    const plan = makeLevelPlan([makeQuestion(2, 1)]);

    const result = getNextQuestion(plan, 0, session, emptyRecords);
    expect(result.buildUpSequence).toBeNull();
  });
});
