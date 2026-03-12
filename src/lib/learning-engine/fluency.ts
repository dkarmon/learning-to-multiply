// ABOUTME: Scores response time into fluency quality levels (0-5).
// ABOUTME: Quality score determines Leitner box promotion eligibility.

import type { FluencyQuality } from '../../types/learning';

const THRESHOLDS = {
  INSTANT: 1500,
  HESITANT: 3000,
  SLOW: 5000,
} as const;

export function scoreFluency(
  isCorrect: boolean,
  responseTimeMs: number,
  isCloseAnswer: boolean = false
): FluencyQuality {
  if (!isCorrect) {
    return isCloseAnswer ? 1 : 0;
  }

  if (responseTimeMs < THRESHOLDS.INSTANT) return 5;
  if (responseTimeMs < THRESHOLDS.HESITANT) return 4;
  if (responseTimeMs < THRESHOLDS.SLOW) return 3;
  return 2;
}

export function isFluentRecall(isCorrect: boolean, responseTimeMs: number): boolean {
  if (!isCorrect) return false;
  return responseTimeMs < THRESHOLDS.HESITANT;
}

export function isCloseAnswer(
  correctAnswer: number,
  givenAnswer: number
): boolean {
  if (correctAnswer === 0) {
    return givenAnswer <= 2;
  }
  const relativeError = Math.abs(givenAnswer - correctAnswer) / correctAnswer;
  return relativeError <= 0.15;
}
