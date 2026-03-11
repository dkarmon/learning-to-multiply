// ABOUTME: Generates questions for a game level using the learning engine.
// ABOUTME: Bridges difficulty tiers and mastery records into Question[] for the game store.

import type { Question } from '../types';
import type { FactMasteryRecord } from '../types/learning';
import { factKey } from '../types/learning';
import { getLevelPlan } from './learning-engine/difficulty';

const QUESTIONS_PER_LEVEL = 5;
const REVIEW_RATIO = 0.4;

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateLevelQuestions(
  level: number,
  masteryRecords: Map<string, FactMasteryRecord>,
): Question[] {
  const plan = getLevelPlan(level, masteryRecords);

  const reviewCount = Math.round(QUESTIONS_PER_LEVEL * REVIEW_RATIO);
  const newCount = QUESTIONS_PER_LEVEL - reviewCount;

  const shuffledNew = shuffle(plan.newFacts);
  const shuffledReview = shuffle(plan.reviewFacts);

  const newQuestions: Question[] = shuffledNew.slice(0, newCount).map((f) => {
    const key = factKey(f.factorA, f.factorB);
    const record = masteryRecords.get(key);
    const shouldSwap = Math.random() > 0.5;
    const a = shouldSwap ? f.factorB : f.factorA;
    const b = shouldSwap ? f.factorA : f.factorB;

    return {
      factorA: a,
      factorB: b,
      correctAnswer: a * b,
      isBuildingUp: false,
      buildUpSequenceIndex: 0,
      isReview: false,
      leitnerBox: record?.leitnerBox ?? 1,
    };
  });

  const reviewQuestions: Question[] = shuffledReview.slice(0, reviewCount).map((f) => {
    const key = factKey(f.factorA, f.factorB);
    const record = masteryRecords.get(key);
    const shouldSwap = Math.random() > 0.5;
    const a = shouldSwap ? f.factorB : f.factorA;
    const b = shouldSwap ? f.factorA : f.factorB;

    return {
      factorA: a,
      factorB: b,
      correctAnswer: a * b,
      isBuildingUp: false,
      buildUpSequenceIndex: 0,
      isReview: true,
      leitnerBox: record?.leitnerBox ?? 1,
    };
  });

  const combined = [...newQuestions, ...reviewQuestions];

  if (combined.length < QUESTIONS_PER_LEVEL) {
    const allFacts = shuffle([...plan.newFacts, ...plan.reviewFacts]);
    for (const f of allFacts) {
      if (combined.length >= QUESTIONS_PER_LEVEL) break;
      const shouldSwap = Math.random() > 0.5;
      const a = shouldSwap ? f.factorB : f.factorA;
      const b = shouldSwap ? f.factorA : f.factorB;
      combined.push({
        factorA: a,
        factorB: b,
        correctAnswer: a * b,
        isBuildingUp: false,
        buildUpSequenceIndex: 0,
        isReview: false,
        leitnerBox: 1,
      });
    }
  }

  return shuffle(combined).slice(0, QUESTIONS_PER_LEVEL);
}
