// ABOUTME: Leitner box spaced repetition system with 5 boxes and gentle regression.
// ABOUTME: Manages fact promotion, demotion, and review scheduling.

import type { FactMasteryRecord, FluencyQuality } from '../../types/learning';

const BOX_SESSION_INTERVALS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: -1,
};

const BOX_5_REVIEW_DAYS = 14;
const MAX_BOX = 5;
const MIN_BOX = 1;

export function promoteFact(currentBox: number, fluencyQuality: FluencyQuality): number {
  if (fluencyQuality < 3) {
    return currentBox;
  }
  return Math.min(currentBox + 1, MAX_BOX);
}

export function demoteFact(currentBox: number): number {
  return Math.max(currentBox - 1, MIN_BOX);
}

export function isDueForReview(
  record: FactMasteryRecord,
  currentSessionNumber: number,
  lastReviewedAtSession: number,
  now: Date = new Date()
): boolean {
  if (record.lastPracticedAt === null) {
    return true;
  }

  const box = record.leitnerBox;

  if (box === 5) {
    const daysSinceLastPractice = Math.floor(
      (now.getTime() - record.lastPracticedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastPractice >= BOX_5_REVIEW_DAYS;
  }

  const interval = BOX_SESSION_INTERVALS[box];
  if (interval === undefined) {
    return true;
  }

  const sessionsSinceReview = currentSessionNumber - lastReviewedAtSession;
  return sessionsSinceReview >= interval;
}

export function getBoxForFact(
  records: Map<string, FactMasteryRecord>,
  factKeyStr: string
): number {
  const record = records.get(factKeyStr);
  if (!record) return 0;
  return record.leitnerBox;
}

export function calculateNextReviewDate(box: number, now: Date = new Date()): Date | null {
  if (box !== 5) {
    return null;
  }
  const next = new Date(now);
  next.setDate(next.getDate() + BOX_5_REVIEW_DAYS);
  return next;
}

export function processAttempt(
  record: FactMasteryRecord,
  isCorrect: boolean,
  responseTimeMs: number,
  fluencyQuality: FluencyQuality,
  now: Date = new Date()
): FactMasteryRecord {
  const newTotalAttempts = record.totalAttempts + 1;
  const newCorrectAttempts = record.correctAttempts + (isCorrect ? 1 : 0);
  const newBox = isCorrect
    ? promoteFact(record.leitnerBox, fluencyQuality)
    : demoteFact(record.leitnerBox);

  const prevAvg = record.avgResponseTimeMs ?? responseTimeMs;
  const newAvgResponseTime = Math.round(
    prevAvg + (responseTimeMs - prevAvg) / newTotalAttempts
  );

  return {
    ...record,
    leitnerBox: newBox,
    totalAttempts: newTotalAttempts,
    correctAttempts: newCorrectAttempts,
    avgResponseTimeMs: newAvgResponseTime,
    lastPracticedAt: now,
    nextReviewAt: calculateNextReviewDate(newBox, now),
  };
}
