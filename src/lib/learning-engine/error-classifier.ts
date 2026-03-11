// ABOUTME: Classifies wrong answers into specific error patterns for adaptive response.
// ABOUTME: Detects addition substitution, off-by-one, neighbor confusion, and more.

import type { ErrorType, FactMasteryRecord } from '../../types/learning';
import { factKey } from '../../types/learning';

interface ClassificationInput {
  factorA: number;
  factorB: number;
  correctAnswer: number;
  givenAnswer: number;
}

interface ClassificationResult {
  errorType: ErrorType;
  detail: string;
}

export function classifyError(
  input: ClassificationInput,
  masteryRecords?: Map<string, FactMasteryRecord>
): ClassificationResult {
  const { factorA, factorB, correctAnswer, givenAnswer } = input;

  if (givenAnswer === correctAnswer) {
    return { errorType: 'other', detail: 'Answer is correct' };
  }

  if (isZeroOneConfusion(factorA, factorB, correctAnswer, givenAnswer)) {
    return {
      errorType: 'zero_one_confusion',
      detail: 'Confused x0 and x1 rules',
    };
  }

  if (givenAnswer === factorA + factorB) {
    return {
      errorType: 'addition_substitution',
      detail: `Gave ${factorA}+${factorB}=${givenAnswer} instead of ${factorA}x${factorB}=${correctAnswer}`,
    };
  }

  const diff = Math.abs(givenAnswer - correctAnswer);
  if (diff === factorA || diff === factorB) {
    return {
      errorType: 'off_by_one',
      detail: `Off by one group of ${diff === factorA ? factorA : factorB}`,
    };
  }

  const neighborMatch = findNeighborConfusion(factorA, factorB, givenAnswer);
  if (neighborMatch !== null) {
    return {
      errorType: 'neighbor_confusion',
      detail: `Gave answer for ${neighborMatch.a}x${neighborMatch.b}=${givenAnswer}`,
    };
  }

  if (masteryRecords && factorA !== factorB) {
    const commGap = detectCommutativeGap(factorA, factorB, masteryRecords);
    if (commGap) {
      return {
        errorType: 'commutative_gap',
        detail: `Reverse fact ${factorB}x${factorA} has higher mastery`,
      };
    }
  }

  return { errorType: 'other', detail: 'No specific pattern detected' };
}

function isZeroOneConfusion(
  factorA: number,
  factorB: number,
  correctAnswer: number,
  givenAnswer: number
): boolean {
  if (factorA === 0 && givenAnswer === factorB) return true;
  if (factorB === 0 && givenAnswer === factorA) return true;

  if (factorA === 1 && givenAnswer === 0) return true;
  if (factorB === 1 && givenAnswer === 0) return true;

  if (factorA === 1 && givenAnswer === 1 && correctAnswer !== 1) return true;
  if (factorB === 1 && givenAnswer === 1 && correctAnswer !== 1) return true;

  if (factorA === 0 && givenAnswer === 1) return true;
  if (factorB === 0 && givenAnswer === 1) return true;

  return false;
}

function findNeighborConfusion(
  factorA: number,
  factorB: number,
  givenAnswer: number
): { a: number; b: number } | null {
  const neighbors = [
    { a: factorA, b: factorB - 1 },
    { a: factorA, b: factorB + 1 },
    { a: factorA - 1, b: factorB },
    { a: factorA + 1, b: factorB },
  ];

  for (const n of neighbors) {
    if (n.a < 0 || n.b < 0 || n.a > 10 || n.b > 10) continue;
    if (n.a * n.b === givenAnswer) {
      return n;
    }
  }

  return null;
}

function detectCommutativeGap(
  factorA: number,
  factorB: number,
  masteryRecords: Map<string, FactMasteryRecord>
): boolean {
  const key = factKey(factorA, factorB);
  const record = masteryRecords.get(key);
  if (!record) return false;

  return record.leitnerBox >= 3 && record.correctAttempts > 3;
}
