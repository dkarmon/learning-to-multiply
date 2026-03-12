// ABOUTME: Pure scoring functions for brick calculations.
// ABOUTME: Determines bonus bricks based on hint usage and answer correctness.

import type { HintLevel } from '../../types';

export function calculateBonusBricks(hintLevel: HintLevel): number {
  switch (hintLevel) {
    case 0: return 3;
    case 1: return 1;
    case 2: return 0;
  }
}

export function calculateBricksEarned(
  answer: number,
  hintLevel: HintLevel,
  isCorrect: boolean,
): { answerBricks: number; bonusBricks: number; totalBricks: number } {
  if (!isCorrect) {
    return { answerBricks: 0, bonusBricks: 0, totalBricks: 0 };
  }

  const bonusBricks = calculateBonusBricks(hintLevel);
  return {
    answerBricks: answer,
    bonusBricks,
    totalBricks: answer + bonusBricks,
  };
}
