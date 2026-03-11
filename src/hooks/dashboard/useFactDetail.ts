// ABOUTME: Hook that fetches detailed attempt history for a single multiplication fact.
// ABOUTME: Provides data for accuracy-over-time and response-time charts.

import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, getDocs,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { FactMastery } from '../../types';

export interface FactAttempt {
  id: string;
  isCorrect: boolean;
  responseTimeMs: number;
  hintLevel: number;
  errorType: string | null;
  attemptedAt: string;
  givenAnswer: number | null;
}

export interface AccuracyDataPoint {
  date: string;
  accuracy: number;
  attempts: number;
}

export interface ResponseTimeDataPoint {
  date: string;
  avgTimeMs: number;
}

export interface ErrorBreakdown {
  type: string;
  count: number;
}

export type TrendDirection = 'improving' | 'plateau' | 'declining';

interface UseFactDetailReturn {
  attempts: FactAttempt[];
  mastery: FactMastery | null;
  accuracyOverTime: AccuracyDataPoint[];
  responseTimeTrend: ResponseTimeDataPoint[];
  errorBreakdown: ErrorBreakdown[];
  trend: TrendDirection;
  loading: boolean;
  error: string | null;
}

function computeTrend(accuracyData: AccuracyDataPoint[]): TrendDirection {
  if (accuracyData.length < 3) return 'plateau';

  const third = Math.ceil(accuracyData.length / 3);
  const firstThird = accuracyData.slice(0, third);
  const lastThird = accuracyData.slice(-third);

  const avgFirst = firstThird.reduce((s, d) => s + d.accuracy, 0) / firstThird.length;
  const avgLast = lastThird.reduce((s, d) => s + d.accuracy, 0) / lastThird.length;

  const diff = avgLast - avgFirst;
  if (diff > 10) return 'improving';
  if (diff < -10) return 'declining';
  return 'plateau';
}

function groupByDay(attempts: FactAttempt[]): Map<string, FactAttempt[]> {
  const groups = new Map<string, FactAttempt[]>();
  for (const attempt of attempts) {
    const day = attempt.attemptedAt.split('T')[0];
    const existing = groups.get(day) ?? [];
    existing.push(attempt);
    groups.set(day, existing);
  }
  return groups;
}

export function useFactDetail(
  kidId: string | null,
  factorA: number,
  factorB: number
): UseFactDetailReturn {
  const [attempts, setAttempts] = useState<FactAttempt[]>([]);
  const [mastery, setMastery] = useState<FactMastery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canonA = Math.min(factorA, factorB);
  const canonB = Math.max(factorA, factorB);

  const fetchDetail = useCallback(async () => {
    if (!kidId) return;
    setLoading(true);
    setError(null);

    try {
      const attemptsRef = collection(db, 'attempts');

      const q1 = query(
        attemptsRef,
        where('kid_id', '==', kidId),
        where('factor_a', '==', canonA),
        where('factor_b', '==', canonB),
        orderBy('attempted_at', 'asc')
      );
      const q2 = query(
        attemptsRef,
        where('kid_id', '==', kidId),
        where('factor_a', '==', canonB),
        where('factor_b', '==', canonA),
        orderBy('attempted_at', 'asc')
      );

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const allDocs = [...snap1.docs, ...snap2.docs];

      const mappedAttempts: FactAttempt[] = allDocs.map((d) => {
        const row = d.data();
        return {
          id: d.id,
          isCorrect: row.is_correct,
          responseTimeMs: row.response_time_ms,
          hintLevel: row.hint_level,
          errorType: row.error_type,
          attemptedAt: row.attempted_at?.toDate?.()?.toISOString() ?? '',
          givenAnswer: row.given_answer,
        };
      });

      mappedAttempts.sort((a, b) => a.attemptedAt.localeCompare(b.attemptedAt));
      setAttempts(mappedAttempts);

      const masteryRef = collection(db, 'mastery');
      const mq = query(
        masteryRef,
        where('kid_id', '==', kidId),
        where('factor_a', '==', canonA),
        where('factor_b', '==', canonB)
      );
      const masterySnap = await getDocs(mq);

      if (!masterySnap.empty) {
        const masteryData = masterySnap.docs[0].data();
        setMastery({
          kidId: masteryData.kid_id,
          factorA: masteryData.factor_a,
          factorB: masteryData.factor_b,
          leitnerBox: masteryData.leitner_box,
          totalAttempts: masteryData.total_attempts,
          correctAttempts: masteryData.correct_attempts,
          avgResponseTimeMs: masteryData.avg_response_time_ms,
          lastPracticedAt: masteryData.last_practiced_at?.toDate?.()?.toISOString() ?? null,
          nextReviewAt: masteryData.next_review_at?.toDate?.()?.toISOString() ?? null,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fact detail');
    }

    setLoading(false);
  }, [kidId, canonA, canonB]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const grouped = groupByDay(attempts);

  const accuracyOverTime: AccuracyDataPoint[] = Array.from(grouped.entries()).map(
    ([date, dayAttempts]) => {
      const correct = dayAttempts.filter((a) => a.isCorrect).length;
      return {
        date,
        accuracy: Math.round((correct / dayAttempts.length) * 100),
        attempts: dayAttempts.length,
      };
    }
  );

  const responseTimeTrend: ResponseTimeDataPoint[] = Array.from(grouped.entries()).map(
    ([date, dayAttempts]) => {
      const avgTime = dayAttempts.reduce((s, a) => s + a.responseTimeMs, 0) / dayAttempts.length;
      return {
        date,
        avgTimeMs: Math.round(avgTime),
      };
    }
  );

  const errorCounts = new Map<string, number>();
  for (const attempt of attempts) {
    if (attempt.errorType && !attempt.isCorrect) {
      errorCounts.set(attempt.errorType, (errorCounts.get(attempt.errorType) ?? 0) + 1);
    }
  }
  const errorBreakdown: ErrorBreakdown[] = Array.from(errorCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const trend = computeTrend(accuracyOverTime);

  return {
    attempts,
    mastery,
    accuracyOverTime,
    responseTimeTrend,
    errorBreakdown,
    trend,
    loading,
    error,
  };
}
