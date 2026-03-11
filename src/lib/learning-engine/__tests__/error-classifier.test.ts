// ABOUTME: Tests for the error classification system.
// ABOUTME: Verifies detection of addition substitution, off-by-one, neighbor confusion, and more.

import { describe, it, expect } from 'vitest';
import { classifyError } from '../error-classifier';
import type { FactMasteryRecord } from '../../../types/learning';

describe('classifyError', () => {
  describe('addition_substitution', () => {
    it('detects 6x4 gave 10', () => {
      const result = classifyError({ factorA: 6, factorB: 4, correctAnswer: 24, givenAnswer: 10 });
      expect(result.errorType).toBe('addition_substitution');
    });

    it('detects 3x5 gave 8', () => {
      const result = classifyError({ factorA: 3, factorB: 5, correctAnswer: 15, givenAnswer: 8 });
      expect(result.errorType).toBe('addition_substitution');
    });

    it('detects 7x3 gave 10', () => {
      const result = classifyError({ factorA: 7, factorB: 3, correctAnswer: 21, givenAnswer: 10 });
      expect(result.errorType).toBe('addition_substitution');
    });
  });

  describe('zero_one_confusion', () => {
    it('detects 5x0 gave 5', () => {
      const result = classifyError({ factorA: 5, factorB: 0, correctAnswer: 0, givenAnswer: 5 });
      expect(result.errorType).toBe('zero_one_confusion');
    });

    it('detects 5x1 gave 0', () => {
      const result = classifyError({ factorA: 5, factorB: 1, correctAnswer: 5, givenAnswer: 0 });
      expect(result.errorType).toBe('zero_one_confusion');
    });

    it('detects 0x7 gave 7', () => {
      const result = classifyError({ factorA: 0, factorB: 7, correctAnswer: 0, givenAnswer: 7 });
      expect(result.errorType).toBe('zero_one_confusion');
    });

    it('detects 8x0 gave 1', () => {
      const result = classifyError({ factorA: 8, factorB: 0, correctAnswer: 0, givenAnswer: 1 });
      expect(result.errorType).toBe('zero_one_confusion');
    });

    it('detects 1x6 gave 1', () => {
      const result = classifyError({ factorA: 1, factorB: 6, correctAnswer: 6, givenAnswer: 1 });
      expect(result.errorType).toBe('zero_one_confusion');
    });
  });

  describe('off_by_one', () => {
    it('detects 6x4=24 gave 28 (off by 4)', () => {
      const result = classifyError({ factorA: 6, factorB: 4, correctAnswer: 24, givenAnswer: 28 });
      expect(result.errorType).toBe('off_by_one');
    });

    it('detects 6x4=24 gave 18 (off by 6)', () => {
      const result = classifyError({ factorA: 6, factorB: 4, correctAnswer: 24, givenAnswer: 18 });
      expect(result.errorType).toBe('off_by_one');
    });

    it('detects 7x8=56 gave 48 (off by 8)', () => {
      const result = classifyError({ factorA: 7, factorB: 8, correctAnswer: 56, givenAnswer: 48 });
      expect(result.errorType).toBe('off_by_one');
    });

    it('detects 7x8=56 gave 49 (off by 7)', () => {
      const result = classifyError({ factorA: 7, factorB: 8, correctAnswer: 56, givenAnswer: 49 });
      expect(result.errorType).toBe('off_by_one');
    });
  });

  describe('neighbor_confusion', () => {
    // Adjacent-fact errors where diff equals a factor are classified as off_by_one
    // (the more specific diagnosis). Neighbor confusion fires for cases where
    // the answer matches an adjacent product but diff doesn't equal either factor.
    it('classifies adjacent-fact errors as off_by_one when diff matches a factor', () => {
      // 6x8=48 gave 54 (6x9): diff=6=factorA
      const result = classifyError({ factorA: 6, factorB: 8, correctAnswer: 48, givenAnswer: 54 });
      expect(result.errorType).toBe('off_by_one');
    });

    it('classifies 7x8=56 gave 63 (7x9) as off_by_one', () => {
      // diff=7=factorA
      const result = classifyError({ factorA: 7, factorB: 8, correctAnswer: 56, givenAnswer: 63 });
      expect(result.errorType).toBe('off_by_one');
    });

    it('classifies 6x7=42 gave 48 (6x8) as off_by_one', () => {
      // diff=6=factorA
      const result = classifyError({ factorA: 6, factorB: 7, correctAnswer: 42, givenAnswer: 48 });
      expect(result.errorType).toBe('off_by_one');
    });
  });

  describe('commutative_gap', () => {
    it('detects when canonical fact has high mastery but answer is wrong', () => {
      const records = new Map<string, FactMasteryRecord>();
      records.set('3x7', {
        kidId: 'kid1',
        factorA: 3,
        factorB: 7,
        leitnerBox: 3,
        totalAttempts: 10,
        correctAttempts: 8,
        avgResponseTimeMs: 1500,
        lastPracticedAt: new Date(),
        nextReviewAt: null,
      });
      // givenAnswer=15 doesn't match addition(10), zero/one, neighbor, or off_by_one
      const result = classifyError(
        { factorA: 7, factorB: 3, correctAnswer: 21, givenAnswer: 15 },
        records
      );
      expect(result.errorType).toBe('commutative_gap');
    });
  });

  describe('other', () => {
    it('returns other for 6x4=24 gave 12', () => {
      const result = classifyError({ factorA: 6, factorB: 4, correctAnswer: 24, givenAnswer: 12 });
      expect(result.errorType).toBe('other');
    });

    it('returns other for 5x5=25 gave 35', () => {
      // 35 doesn't match addition(10), zero/one, neighbor, or off_by_one for 5x5
      const result = classifyError({ factorA: 5, factorB: 5, correctAnswer: 25, givenAnswer: 35 });
      expect(result.errorType).toBe('other');
    });
  });

  describe('correct answer edge case', () => {
    it('returns other with detail for correct answer', () => {
      const result = classifyError({ factorA: 3, factorB: 5, correctAnswer: 15, givenAnswer: 15 });
      expect(result.errorType).toBe('other');
      expect(result.detail).toBe('Answer is correct');
    });
  });
});
