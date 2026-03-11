// ABOUTME: Hook that fetches game session history for a kid.
// ABOUTME: Supports date range filtering and loading individual session attempts.

import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, getDocs, Timestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface SessionSummary {
  id: string;
  startedAt: string;
  endedAt: string | null;
  level: number;
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds: number | null;
  accuracy: number;
}

export interface SessionAttempt {
  id: string;
  factorA: number;
  factorB: number;
  correctAnswer: number;
  givenAnswer: number | null;
  isCorrect: boolean;
  responseTimeMs: number;
  hintLevel: number;
  errorType: string | null;
  attemptedAt: string;
}

export type DateFilter = 'all' | 'week' | 'month' | 'three_months';

interface UseSessionsReturn {
  sessions: SessionSummary[];
  loading: boolean;
  error: string | null;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  refresh: () => Promise<void>;
  fetchSessionAttempts: (sessionId: string) => Promise<SessionAttempt[]>;
  totalPlayTimeMinutes: number;
}

function getFilterDate(filter: DateFilter): string | null {
  if (filter === 'all') return null;
  const now = new Date();
  const days = filter === 'week' ? 7 : filter === 'month' ? 30 : 90;
  now.setDate(now.getDate() - days);
  return now.toISOString();
}

export function useSessions(kidId: string | null): UseSessionsReturn {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const fetchSessions = useCallback(async () => {
    if (!kidId) return;
    setLoading(true);
    setError(null);

    try {
      const sessionsRef = collection(db, 'sessions');
      const constraints = [
        where('kid_id', '==', kidId),
        orderBy('started_at', 'desc'),
      ];

      const filterDate = getFilterDate(dateFilter);
      if (filterDate) {
        constraints.push(where('started_at', '>=', Timestamp.fromDate(new Date(filterDate))));
      }

      const q = query(sessionsRef, ...constraints);
      const snapshot = await getDocs(q);

      const mapped: SessionSummary[] = snapshot.docs.map((d) => {
        const row = d.data();
        return {
          id: d.id,
          startedAt: row.started_at?.toDate?.()?.toISOString() ?? '',
          endedAt: row.ended_at?.toDate?.()?.toISOString() ?? null,
          level: row.level,
          totalQuestions: row.total_questions,
          correctAnswers: row.correct_answers,
          durationSeconds: row.duration_seconds,
          accuracy: row.total_questions > 0
            ? Math.round((row.correct_answers / row.total_questions) * 100)
            : 0,
        };
      });

      setSessions(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    }
    setLoading(false);
  }, [kidId, dateFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const fetchSessionAttempts = useCallback(async (sessionId: string): Promise<SessionAttempt[]> => {
    try {
      const attemptsRef = collection(db, 'attempts');
      const q = query(
        attemptsRef,
        where('session_id', '==', sessionId),
        orderBy('attempted_at', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((d) => {
        const row = d.data();
        return {
          id: d.id,
          factorA: row.factor_a,
          factorB: row.factor_b,
          correctAnswer: row.correct_answer,
          givenAnswer: row.given_answer,
          isCorrect: row.is_correct,
          responseTimeMs: row.response_time_ms,
          hintLevel: row.hint_level,
          errorType: row.error_type,
          attemptedAt: row.attempted_at?.toDate?.()?.toISOString() ?? '',
        };
      });
    } catch (err) {
      console.error('Failed to fetch session attempts:', err);
      return [];
    }
  }, []);

  const totalPlayTimeMinutes = sessions.reduce((sum, s) => {
    return sum + Math.round((s.durationSeconds ?? 0) / 60);
  }, 0);

  return {
    sessions,
    loading,
    error,
    dateFilter,
    setDateFilter,
    refresh: fetchSessions,
    fetchSessionAttempts,
    totalPlayTimeMinutes,
  };
}
