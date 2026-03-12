// ABOUTME: Tests for the question generator that bridges learning engine to game store.
// ABOUTME: Verifies questions are generated correctly for different levels.

import { describe, it, expect } from 'vitest';
import { generateLevelQuestions } from '../question-generator';
import type { FactMasteryRecord } from '../../types/learning';

describe('generateLevelQuestions', () => {
  it('generates 5 questions for level 1', () => {
    const mastery = new Map<string, FactMasteryRecord>();
    const questions = generateLevelQuestions(1, mastery);
    expect(questions).toHaveLength(5);
  });

  it('all questions have valid factors and correct answers', () => {
    const mastery = new Map<string, FactMasteryRecord>();
    const questions = generateLevelQuestions(1, mastery);

    for (const q of questions) {
      expect(q.factorA).toBeGreaterThanOrEqual(0);
      expect(q.factorA).toBeLessThanOrEqual(10);
      expect(q.factorB).toBeGreaterThanOrEqual(0);
      expect(q.factorB).toBeLessThanOrEqual(10);
      expect(q.correctAnswer).toBe(q.factorA * q.factorB);
    }
  });

  it('level 1 questions only use factors 0, 1, 2', () => {
    const mastery = new Map<string, FactMasteryRecord>();
    const questions = generateLevelQuestions(1, mastery);

    for (const q of questions) {
      const minFactor = Math.min(q.factorA, q.factorB);
      expect([0, 1, 2]).toContain(minFactor);
    }
  });

  it('higher levels include harder facts', () => {
    const mastery = new Map<string, FactMasteryRecord>();
    const questions = generateLevelQuestions(12, mastery);

    const factors = new Set(
      questions.flatMap((q) => [q.factorA, q.factorB])
    );
    const hasHardFact = [6, 7, 8].some((f) => factors.has(f));
    expect(hasHardFact).toBe(true);
  });

  it('generates questions when mastery records have undefined leitnerBox/totalAttempts', () => {
    const mastery = new Map<string, FactMasteryRecord>();
    // Simulate records loaded from Firestore where leitner_box/total_attempts were never written
    for (let a = 0; a <= 2; a++) {
      for (let b = a; b <= 10; b++) {
        const key = `${a}x${b}`;
        mastery.set(key, {
          kidId: 'kid1',
          factorA: a,
          factorB: b,
          leitnerBox: undefined as unknown as number,
          totalAttempts: undefined as unknown as number,
          correctAttempts: undefined as unknown as number,
          avgResponseTimeMs: null,
          lastPracticedAt: null,
          nextReviewAt: null,
        });
      }
    }
    const questions = generateLevelQuestions(1, mastery);
    expect(questions).toHaveLength(5);
  });

  it('questions have required shape', () => {
    const mastery = new Map<string, FactMasteryRecord>();
    const questions = generateLevelQuestions(1, mastery);

    for (const q of questions) {
      expect(q).toHaveProperty('factorA');
      expect(q).toHaveProperty('factorB');
      expect(q).toHaveProperty('correctAnswer');
      expect(q).toHaveProperty('isBuildingUp');
      expect(q).toHaveProperty('buildUpSequenceIndex');
      expect(q).toHaveProperty('isReview');
      expect(q).toHaveProperty('leitnerBox');
    }
  });
});
