// ABOUTME: Hook that fetches all fact mastery data for a kid.
// ABOUTME: Builds a lookup map for the 11x11 heat map grid.

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { FactMastery } from '../../types';

export type MasteryStatus = 'mastered' | 'learning' | 'struggling' | 'not_introduced';

export interface MasteryCell {
  factorA: number;
  factorB: number;
  status: MasteryStatus;
  mastery: FactMastery | null;
}

export type MasteryGrid = MasteryCell[][];

function classifyStatus(mastery: FactMastery | null): MasteryStatus {
  if (!mastery) return 'not_introduced';
  if (mastery.leitnerBox >= 4) return 'mastered';
  if (mastery.leitnerBox >= 2) return 'learning';
  return 'struggling';
}

function canonicalKey(a: number, b: number): string {
  return `${Math.min(a, b)},${Math.max(a, b)}`;
}

interface UseFactMasteryReturn {
  grid: MasteryGrid;
  masteryMap: Map<string, FactMastery>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  stats: {
    mastered: number;
    learning: number;
    struggling: number;
    notIntroduced: number;
    totalFacts: number;
  };
}

export function useFactMastery(kidId: string | null): UseFactMasteryReturn {
  const [masteryMap, setMasteryMap] = useState<Map<string, FactMastery>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMastery = useCallback(async () => {
    if (!kidId) return;
    setLoading(true);
    setError(null);

    try {
      const masteryRef = collection(db, 'mastery');
      const q = query(masteryRef, where('kid_id', '==', kidId));
      const snapshot = await getDocs(q);

      const map = new Map<string, FactMastery>();
      for (const d of snapshot.docs) {
        const row = d.data();
        const key = canonicalKey(row.factor_a, row.factor_b);
        map.set(key, {
          kidId: row.kid_id,
          factorA: row.factor_a,
          factorB: row.factor_b,
          leitnerBox: row.leitner_box,
          totalAttempts: row.total_attempts,
          correctAttempts: row.correct_attempts,
          avgResponseTimeMs: row.avg_response_time_ms,
          lastPracticedAt: row.last_practiced_at?.toDate?.()?.toISOString() ?? null,
          nextReviewAt: row.next_review_at?.toDate?.()?.toISOString() ?? null,
        });
      }

      setMasteryMap(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mastery');
    }
    setLoading(false);
  }, [kidId]);

  useEffect(() => {
    fetchMastery();
  }, [fetchMastery]);

  const grid: MasteryGrid = [];
  let masteredCount = 0;
  let learningCount = 0;
  let strugglingCount = 0;
  let notIntroducedCount = 0;
  const counted = new Set<string>();

  for (let row = 0; row <= 10; row++) {
    const gridRow: MasteryCell[] = [];
    for (let col = 0; col <= 10; col++) {
      const key = canonicalKey(row, col);
      const mastery = masteryMap.get(key) ?? null;
      const status = classifyStatus(mastery);
      gridRow.push({ factorA: row, factorB: col, status, mastery });

      if (!counted.has(key)) {
        counted.add(key);
        switch (status) {
          case 'mastered': masteredCount++; break;
          case 'learning': learningCount++; break;
          case 'struggling': strugglingCount++; break;
          case 'not_introduced': notIntroducedCount++; break;
        }
      }
    }
    grid.push(gridRow);
  }

  return {
    grid,
    masteryMap,
    loading,
    error,
    refresh: fetchMastery,
    stats: {
      mastered: masteredCount,
      learning: learningCount,
      struggling: strugglingCount,
      notIntroduced: notIntroducedCount,
      totalFacts: counted.size,
    },
  };
}
