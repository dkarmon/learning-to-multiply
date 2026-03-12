// ABOUTME: Hook that generates actionable plain-language insights from mastery and session data.
// ABOUTME: Prioritizes insights by recency and severity for parent-facing display.

import { useMemo } from 'react';
import type { FactMastery } from '../../types';
import type { SessionSummary } from './useSessions';

export interface Insight {
  id: string;
  type: 'struggling_cluster' | 'short_sessions' | 'hint_dependency'
       | 'plateau' | 'celebration' | 'error_pattern';
  priority: number;
  i18nKey: string;
  i18nParams: Record<string, string | number>;
}

interface UseInsightsReturn {
  insights: Insight[];
}

function findStrugglingClusters(
  masteryMap: Map<string, FactMastery>,
  kidName: string
): Insight[] {
  const factorStruggles = new Map<number, number>();
  const factorTotals = new Map<number, number>();

  for (const mastery of masteryMap.values()) {
    for (const factor of [mastery.factorA, mastery.factorB]) {
      factorTotals.set(factor, (factorTotals.get(factor) ?? 0) + 1);
      if (mastery.leitnerBox <= 1 && mastery.totalAttempts > 0) {
        factorStruggles.set(factor, (factorStruggles.get(factor) ?? 0) + 1);
      }
    }
  }

  const insights: Insight[] = [];
  for (const [factor, struggles] of factorStruggles.entries()) {
    const total = factorTotals.get(factor) ?? 1;
    if (factor >= 2 && struggles >= 3 && struggles / total >= 0.4) {
      insights.push({
        id: `struggling-${factor}`,
        type: 'struggling_cluster',
        priority: 80 + struggles,
        i18nKey: 'insights.strugglingCluster',
        i18nParams: { name: kidName, factor },
      });
    }
  }
  return insights;
}

function findShortSessions(sessions: SessionSummary[]): Insight[] {
  const recent = sessions.slice(0, 10);
  if (recent.length < 3) return [];

  const shortCount = recent.filter(
    (s) => s.durationSeconds !== null && s.durationSeconds < 300
  ).length;

  if (shortCount / recent.length >= 0.5) {
    return [{
      id: 'short-sessions',
      type: 'short_sessions',
      priority: 70,
      i18nKey: 'insights.shortSessions',
      i18nParams: {},
    }];
  }
  return [];
}

function findHintDependency(
  kidName: string,
  hintRate: number | null
): Insight[] {
  if (hintRate === null || hintRate < 60) return [];
  return [{
    id: 'hint-dependency',
    type: 'hint_dependency',
    priority: 75,
    i18nKey: 'insights.hintDependency',
    i18nParams: { name: kidName, percent: Math.round(hintRate) },
  }];
}

function findPlateaus(masteryMap: Map<string, FactMastery>): Insight[] {
  const insights: Insight[] = [];
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  for (const mastery of masteryMap.values()) {
    if (
      mastery.leitnerBox <= 2 &&
      mastery.totalAttempts >= 10 &&
      mastery.lastPracticedAt &&
      new Date(mastery.lastPracticedAt) > twoWeeksAgo
    ) {
      const accuracy = mastery.totalAttempts > 0
        ? mastery.correctAttempts / mastery.totalAttempts
        : 0;
      if (accuracy < 0.6) {
        const weeks = Math.ceil(
          (Date.now() - new Date(mastery.lastPracticedAt).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
        );
        insights.push({
          id: `plateau-${mastery.factorA}x${mastery.factorB}`,
          type: 'plateau',
          priority: 60 + (mastery.totalAttempts - mastery.correctAttempts),
          i18nKey: 'insights.plateau',
          i18nParams: { a: mastery.factorA, b: mastery.factorB, weeks: Math.max(2, weeks) },
        });
      }
    }
  }
  return insights;
}

function findCelebrations(
  masteryMap: Map<string, FactMastery>,
  kidName: string
): Insight[] {
  const insights: Insight[] = [];
  const factorMastery = new Map<number, { mastered: number; total: number }>();

  for (const mastery of masteryMap.values()) {
    for (const factor of [mastery.factorA, mastery.factorB]) {
      const entry = factorMastery.get(factor) ?? { mastered: 0, total: 0 };
      entry.total++;
      if (mastery.leitnerBox >= 4) entry.mastered++;
      factorMastery.set(factor, entry);
    }
  }

  const totalMastered = Array.from(masteryMap.values()).filter(
    (m) => m.leitnerBox >= 4
  ).length;

  for (const [factor, data] of factorMastery.entries()) {
    if (factor >= 2 && data.mastered === data.total && data.total >= 5) {
      insights.push({
        id: `celebration-${factor}`,
        type: 'celebration',
        priority: 90,
        i18nKey: 'insights.celebration',
        i18nParams: { name: kidName, factor, count: totalMastered },
      });
    }
  }
  return insights;
}

function findErrorPatterns(
  kidName: string,
  dominantErrorType: string | null
): Insight[] {
  if (!dominantErrorType) return [];

  const descriptionKey: Record<string, string> = {
    addition_substitution: 'insights.addInsteadOfMultiply',
    off_by_one: 'insights.offByOne',
    neighbor_confusion: 'insights.neighborConfusion',
    zero_one_confusion: 'insights.zeroOneConfusion',
  };

  const key = descriptionKey[dominantErrorType];
  if (!key) return [];

  return [{
    id: `error-${dominantErrorType}`,
    type: 'error_pattern',
    priority: 65,
    i18nKey: 'insights.errorPattern',
    i18nParams: { name: kidName, errorDescription: key },
  }];
}

export function useInsights(
  kidName: string,
  masteryMap: Map<string, FactMastery>,
  sessions: SessionSummary[],
  hintRate: number | null,
  dominantErrorType: string | null,
): UseInsightsReturn {
  const insights = useMemo(() => {
    const all: Insight[] = [
      ...findStrugglingClusters(masteryMap, kidName),
      ...findShortSessions(sessions),
      ...findHintDependency(kidName, hintRate),
      ...findPlateaus(masteryMap),
      ...findCelebrations(masteryMap, kidName),
      ...findErrorPatterns(kidName, dominantErrorType),
    ];

    all.sort((a, b) => b.priority - a.priority);
    return all.slice(0, 3);
  }, [kidName, masteryMap, sessions, hintRate, dominantErrorType]);

  return { insights };
}
