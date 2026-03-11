// ABOUTME: Aggregates mastery data from mastery collection records for display and analysis.
// ABOUTME: Provides per-fact summaries, overall progress, and heat map data for the dashboard.

import type {
  FactMasteryRecord,
  FactMasterySummary,
  OverallMastery,
  HeatMapCell,
  CanonicalFact,
  QuestionAttempt,
} from '../../types/learning';
import { factKey } from '../../types/learning';

export function getAllCanonicalFacts(): CanonicalFact[] {
  const facts: CanonicalFact[] = [];
  for (let a = 0; a <= 10; a++) {
    for (let b = a; b <= 10; b++) {
      facts.push({ factorA: a, factorB: b });
    }
  }
  return facts;
}

export function getFactMastery(
  record: FactMasteryRecord | undefined,
  recentAttempts: QuestionAttempt[]
): FactMasterySummary {
  const fact = record
    ? { factorA: record.factorA, factorB: record.factorB }
    : { factorA: 0, factorB: 0 };

  if (!record) {
    return {
      fact,
      leitnerBox: 0,
      accuracyPercent: 0,
      avgResponseTimeMs: null,
      trend: 'stable',
      lastPracticedAt: null,
    };
  }

  const accuracyPercent = record.totalAttempts > 0
    ? Math.round((record.correctAttempts / record.totalAttempts) * 100)
    : 0;

  const trend = calculateTrend(recentAttempts);

  return {
    fact: { factorA: record.factorA, factorB: record.factorB },
    leitnerBox: record.leitnerBox,
    accuracyPercent,
    avgResponseTimeMs: record.avgResponseTimeMs,
    trend,
    lastPracticedAt: record.lastPracticedAt,
  };
}

export function getAllMastery(
  records: Map<string, FactMasteryRecord>
): OverallMastery {
  const allFacts = getAllCanonicalFacts();
  let mastered = 0;
  let learning = 0;
  let struggling = 0;
  let notStarted = 0;

  for (const fact of allFacts) {
    const key = factKey(fact.factorA, fact.factorB);
    const record = records.get(key);

    if (!record || record.totalAttempts === 0) {
      notStarted++;
    } else if (record.leitnerBox >= 4) {
      mastered++;
    } else if (record.leitnerBox >= 2) {
      learning++;
    } else {
      struggling++;
    }
  }

  return {
    totalFacts: allFacts.length,
    mastered,
    learning,
    notStarted,
    struggling,
  };
}

export function getMasteryHeatMap(
  records: Map<string, FactMasteryRecord>
): HeatMapCell[] {
  const cells: HeatMapCell[] = [];

  for (let a = 0; a <= 10; a++) {
    for (let b = 0; b <= 10; b++) {
      const key = factKey(a, b);
      const record = records.get(key);

      let status: HeatMapCell['status'];
      let leitnerBox = 0;
      let accuracyPercent: number | null = null;

      if (!record || record.totalAttempts === 0) {
        status = 'not_started';
      } else {
        leitnerBox = record.leitnerBox;
        accuracyPercent = Math.round(
          (record.correctAttempts / record.totalAttempts) * 100
        );

        if (record.leitnerBox >= 4) {
          status = 'mastered';
        } else if (record.leitnerBox >= 2) {
          status = 'learning';
        } else {
          status = 'struggling';
        }
      }

      cells.push({ factorA: a, factorB: b, status, leitnerBox, accuracyPercent });
    }
  }

  return cells;
}

function calculateTrend(
  recentAttempts: QuestionAttempt[]
): 'improving' | 'stable' | 'declining' {
  if (recentAttempts.length < 4) return 'stable';

  const midpoint = Math.floor(recentAttempts.length / 2);
  const firstHalf = recentAttempts.slice(0, midpoint);
  const secondHalf = recentAttempts.slice(midpoint);

  const firstAccuracy = firstHalf.filter(a => a.isCorrect).length / firstHalf.length;
  const secondAccuracy = secondHalf.filter(a => a.isCorrect).length / secondHalf.length;

  const diff = secondAccuracy - firstAccuracy;

  if (diff > 0.2) return 'improving';
  if (diff < -0.2) return 'declining';
  return 'stable';
}

export function getStrugglingFacts(
  records: Map<string, FactMasteryRecord>,
  limit: number = 10
): FactMasteryRecord[] {
  const allRecords = Array.from(records.values())
    .filter(r => r.totalAttempts > 0);

  allRecords.sort((a, b) => {
    if (a.leitnerBox !== b.leitnerBox) return a.leitnerBox - b.leitnerBox;
    const accA = a.totalAttempts > 0 ? a.correctAttempts / a.totalAttempts : 0;
    const accB = b.totalAttempts > 0 ? b.correctAttempts / b.totalAttempts : 0;
    if (accA !== accB) return accA - accB;
    return b.totalAttempts - a.totalAttempts;
  });

  return allRecords.slice(0, limit);
}
