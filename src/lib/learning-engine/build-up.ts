// ABOUTME: Generates building-up sequences for learning new multiplication facts.
// ABOUTME: Uses derived fact strategy: 6x2 -> 6x3 -> 6x4 -> 6x5 starting from highest mastered.

import type {
  BuildUpSequence,
  BuildUpStep,
  FactMasteryRecord,
} from '../../types/learning';
import { factKey } from '../../types/learning';

const MASTERED_BOX_THRESHOLD = 3;

export function generateBuildUpSequence(
  targetA: number,
  targetB: number,
  masteryRecords: Map<string, FactMasteryRecord>
): BuildUpSequence {
  const base = Math.max(targetA, targetB);
  const targetStep = Math.min(targetA, targetB);

  if (targetStep <= 1) {
    return {
      targetFact: { factorA: Math.min(targetA, targetB), factorB: Math.max(targetA, targetB) },
      steps: [{
        factorA: base,
        factorB: targetStep,
        correctAnswer: base * targetStep,
        isScaffold: false,
        isQuestion: true,
      }],
    };
  }

  const allSteps: { step: number; isMastered: boolean }[] = [];
  for (let s = 1; s <= targetStep; s++) {
    const key = factKey(base, s);
    const record = masteryRecords.get(key);
    const isMastered = record !== undefined && record.leitnerBox >= MASTERED_BOX_THRESHOLD;
    allSteps.push({ step: s, isMastered });
  }

  let highestMastered = 0;
  for (const entry of allSteps) {
    if (entry.isMastered) {
      highestMastered = entry.step;
    } else {
      break;
    }
  }

  const steps: BuildUpStep[] = [];

  for (const entry of allSteps) {
    const s = entry.step;
    if (s <= highestMastered) {
      if (s === highestMastered) {
        steps.push({
          factorA: base,
          factorB: s,
          correctAnswer: base * s,
          isScaffold: true,
          isQuestion: false,
        });
      }
    } else {
      steps.push({
        factorA: base,
        factorB: s,
        correctAnswer: base * s,
        isScaffold: false,
        isQuestion: true,
      });
    }
  }

  return {
    targetFact: { factorA: Math.min(targetA, targetB), factorB: Math.max(targetA, targetB) },
    steps,
  };
}

export function shouldUseBuildUp(
  targetA: number,
  targetB: number,
  masteryRecords: Map<string, FactMasteryRecord>
): boolean {
  const targetStep = Math.min(targetA, targetB);
  if (targetStep < 3) return false;

  const key = factKey(targetA, targetB);
  const record = masteryRecords.get(key);

  if (record && record.leitnerBox >= MASTERED_BOX_THRESHOLD) return false;

  return true;
}
