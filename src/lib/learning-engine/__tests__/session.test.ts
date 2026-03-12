// ABOUTME: Tests for session management functions.
// ABOUTME: Verifies session lifecycle, attempt recording, retry queue, and break suggestions.

import { describe, it, expect } from 'vitest';
import {
  startSession,
  recordAttempt,
  getRetryFact,
  shouldSuggestBreak,
  getSessionStats,
  endSession,
} from '../session';
import type { FactMasteryRecord, SessionState } from '../../../types/learning';

describe('startSession', () => {
  it('returns valid state with empty attempts and retryQueue', () => {
    const session = startSession('kid1', 1);
    expect(session.kidId).toBe('kid1');
    expect(session.currentLevel).toBe(1);
    expect(session.attempts).toHaveLength(0);
    expect(session.retryQueue).toHaveLength(0);
    expect(session.missedThisSession.size).toBe(0);
    expect(session.sessionId).toBeTruthy();
    expect(session.startedAt).toBeInstanceOf(Date);
  });
});

describe('recordAttempt', () => {
  const emptyRecords = new Map<string, FactMasteryRecord>();

  it('correct answer adds attempt with no retry or missed', () => {
    const session = startSession('kid1', 1);
    const result = recordAttempt(session, 3, 5, 15, 1000, 0, emptyRecords);

    expect(result.attempt.isCorrect).toBe(true);
    expect(result.attempt.errorType).toBeNull();
    expect(result.session.attempts).toHaveLength(1);
    expect(result.session.retryQueue).toHaveLength(0);
    expect(result.session.missedThisSession.size).toBe(0);
  });

  it('wrong answer classifies error and adds to retry queue', () => {
    const session = startSession('kid1', 1);
    const result = recordAttempt(session, 6, 4, 10, 2000, 0, emptyRecords);

    expect(result.attempt.isCorrect).toBe(false);
    expect(result.attempt.errorType).not.toBeNull();
    expect(result.session.retryQueue).toHaveLength(1);
    expect(result.session.missedThisSession.size).toBe(1);
  });

  it('null answer treated as incorrect', () => {
    const session = startSession('kid1', 1);
    const result = recordAttempt(session, 3, 5, null, 5000, 0, emptyRecords);

    expect(result.attempt.isCorrect).toBe(false);
    expect(result.attempt.givenAnswer).toBeNull();
    expect(result.session.retryQueue).toHaveLength(1);
  });
});

describe('getRetryFact', () => {
  const emptyRecords = new Map<string, FactMasteryRecord>();

  it('returns null for empty queue', () => {
    const session = startSession('kid1', 1);
    const { fact } = getRetryFact(session);
    expect(fact).toBeNull();
  });

  it('returns null when not enough questions elapsed', () => {
    let session = startSession('kid1', 1);
    // Miss a fact
    const result1 = recordAttempt(session, 3, 5, 10, 2000, 0, emptyRecords);
    session = result1.session;
    // Only 1 more question
    const result2 = recordAttempt(session, 2, 4, 8, 1000, 0, emptyRecords);
    session = result2.session;

    const { fact } = getRetryFact(session);
    expect(fact).toBeNull();
  });

  it('returns fact when 2+ questions elapsed', () => {
    let session = startSession('kid1', 1);
    // Miss a fact
    const result1 = recordAttempt(session, 3, 5, 10, 2000, 0, emptyRecords);
    session = result1.session;
    // Answer 2 more questions
    const result2 = recordAttempt(session, 2, 4, 8, 1000, 0, emptyRecords);
    session = result2.session;
    const result3 = recordAttempt(session, 1, 7, 7, 1000, 0, emptyRecords);
    session = result3.session;

    const { fact, updatedQueue } = getRetryFact(session);
    expect(fact).not.toBeNull();
    expect(fact!.factorA).toBe(3);
    expect(fact!.factorB).toBe(5);
    expect(updatedQueue).toHaveLength(session.retryQueue.length - 1);
  });

  it('processes retries in FIFO order', () => {
    let session = startSession('kid1', 1);
    // Miss two facts
    const r1 = recordAttempt(session, 3, 5, 10, 2000, 0, emptyRecords);
    session = r1.session;
    const r2 = recordAttempt(session, 4, 6, 10, 2000, 0, emptyRecords);
    session = r2.session;
    // Answer 2 more to allow retry
    const r3 = recordAttempt(session, 1, 1, 1, 1000, 0, emptyRecords);
    session = r3.session;
    const r4 = recordAttempt(session, 2, 2, 4, 1000, 0, emptyRecords);
    session = r4.session;

    const { fact } = getRetryFact(session);
    expect(fact).not.toBeNull();
    // First missed was 3x5
    expect(fact!.factorA).toBe(3);
    expect(fact!.factorB).toBe(5);
  });
});

describe('shouldSuggestBreak', () => {
  it('returns none for 5 min elapsed', () => {
    const session = startSession('kid1', 1);
    const now = new Date(session.startedAt.getTime() + 5 * 60 * 1000);
    expect(shouldSuggestBreak(session, now)).toBe('none');
  });

  it('returns soft for 10 min elapsed', () => {
    const session = startSession('kid1', 1);
    const now = new Date(session.startedAt.getTime() + 10 * 60 * 1000);
    expect(shouldSuggestBreak(session, now)).toBe('soft');
  });

  it('returns strong for 15 min elapsed', () => {
    const session = startSession('kid1', 1);
    const now = new Date(session.startedAt.getTime() + 15 * 60 * 1000);
    expect(shouldSuggestBreak(session, now)).toBe('strong');
  });
});

describe('getSessionStats', () => {
  const emptyRecords = new Map<string, FactMasteryRecord>();

  it('calculates 80% accuracy for 4/5 correct', () => {
    let session = startSession('kid1', 1);
    const questions = [
      { a: 1, b: 2, answer: 2, time: 1000 },
      { a: 2, b: 3, answer: 6, time: 1500 },
      { a: 3, b: 4, answer: 12, time: 2000 },
      { a: 4, b: 5, answer: 20, time: 2500 },
      { a: 5, b: 6, answer: 10, time: 3000 }, // wrong
    ];

    for (const q of questions) {
      const result = recordAttempt(session, q.a, q.b, q.answer, q.time, 0, emptyRecords);
      session = result.session;
    }

    const now = new Date(session.startedAt.getTime() + 60000);
    const stats = getSessionStats(session, now);

    expect(stats.totalQuestions).toBe(5);
    expect(stats.correctAnswers).toBe(4);
    expect(stats.accuracyPercent).toBe(80);
    expect(stats.avgResponseTimeMs).toBe(2000);
    expect(stats.durationSeconds).toBe(60);
  });

  it('factsLearned includes ever-correct facts', () => {
    let session = startSession('kid1', 1);
    // Get 1x2 right, then wrong on another try
    const r1 = recordAttempt(session, 1, 2, 2, 1000, 0, emptyRecords);
    session = r1.session;
    const r2 = recordAttempt(session, 1, 2, 5, 1000, 0, emptyRecords);
    session = r2.session;

    const stats = getSessionStats(session);
    expect(stats.factsLearned.some(f => f.factorA === 1 && f.factorB === 2)).toBe(true);
  });

  it('factsMissed includes only-wrong facts', () => {
    let session = startSession('kid1', 1);
    // Get 3x4 wrong twice, never right
    const r1 = recordAttempt(session, 3, 4, 10, 1000, 0, emptyRecords);
    session = r1.session;
    const r2 = recordAttempt(session, 3, 4, 11, 1000, 0, emptyRecords);
    session = r2.session;
    // Get 1x2 right
    const r3 = recordAttempt(session, 1, 2, 2, 1000, 0, emptyRecords);
    session = r3.session;

    const stats = getSessionStats(session);
    expect(stats.factsMissed.some(f => f.factorA === 3 && f.factorB === 4)).toBe(true);
    expect(stats.factsMissed.some(f => f.factorA === 1 && f.factorB === 2)).toBe(false);
  });
});

describe('endSession', () => {
  const emptyRecords = new Map<string, FactMasteryRecord>();

  it('returns correctly shaped Firestore data', () => {
    let session = startSession('kid1', 1);
    const r1 = recordAttempt(session, 3, 5, 15, 1000, 0, emptyRecords);
    session = r1.session;

    const now = new Date();
    const result = endSession(session, now);

    expect(result.gameSession.id).toBe(session.sessionId);
    expect(result.gameSession.kid_id).toBe('kid1');
    expect(result.gameSession.level).toBe(1);
    expect(result.gameSession.started_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.gameSession.ended_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.gameSession.total_questions).toBe(1);
    expect(result.gameSession.correct_answers).toBe(1);

    expect(result.attempts).toHaveLength(1);
    expect(result.attempts[0].session_id).toBe(session.sessionId);
    expect(result.attempts[0].factor_a).toBe(3);
    expect(result.attempts[0].factor_b).toBe(5);
    expect(result.attempts[0].is_correct).toBe(true);
    expect(result.attempts[0].attempted_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
