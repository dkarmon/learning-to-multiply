// ABOUTME: Manages in-session state including timing, retry queue, and break suggestions.
// ABOUTME: Tracks attempts in memory and provides batch write data for Firestore at session end.

import type {
  SessionState,
  SessionStats,
  QuestionAttempt,
  CanonicalFact,
  FactMasteryRecord,
  FluencyQuality,
} from '../../types/learning';
import { factKey, canonicalize } from '../../types/learning';
import { classifyError } from './error-classifier';
import { scoreFluency, isCloseAnswer } from './fluency';

const SOFT_TIME_LIMIT_MS = 10 * 60 * 1000;
const HARD_SUGGESTION_MS = 15 * 60 * 1000;
const RETRY_DELAY_MIN = 2;

export function startSession(kidId: string, currentLevel: number): SessionState {
  return {
    sessionId: crypto.randomUUID(),
    kidId,
    startedAt: new Date(),
    currentLevel,
    attempts: [],
    retryQueue: [],
    missedThisSession: new Set(),
  };
}

export function recordAttempt(
  session: SessionState,
  factorA: number,
  factorB: number,
  givenAnswer: number | null,
  responseTimeMs: number,
  hintLevel: 0 | 1 | 2,
  masteryRecords: Map<string, FactMasteryRecord>
): { session: SessionState; attempt: QuestionAttempt; fluencyQuality: FluencyQuality } {
  const correctAnswer = factorA * factorB;
  const isCorrect = givenAnswer === correctAnswer;

  const close = givenAnswer !== null && !isCorrect
    ? isCloseAnswer(correctAnswer, givenAnswer)
    : false;
  const fluencyQuality = scoreFluency(isCorrect, responseTimeMs, close);

  let errorType = null;
  if (!isCorrect && givenAnswer !== null) {
    const classification = classifyError(
      { factorA, factorB, correctAnswer, givenAnswer },
      masteryRecords
    );
    errorType = classification.errorType;
  }

  const attempt: QuestionAttempt = {
    factorA,
    factorB,
    correctAnswer,
    givenAnswer,
    isCorrect,
    responseTimeMs,
    hintLevel,
    errorType,
    fluencyQuality,
    attemptedAt: new Date(),
  };

  const newAttempts = [...session.attempts, attempt];
  const newMissed = new Set(session.missedThisSession);
  const newRetryQueue = [...session.retryQueue];

  if (!isCorrect) {
    const key = factKey(factorA, factorB);
    newMissed.add(key);
    newRetryQueue.push(canonicalize(factorA, factorB));
  }

  return {
    session: {
      ...session,
      attempts: newAttempts,
      retryQueue: newRetryQueue,
      missedThisSession: newMissed,
    },
    attempt,
    fluencyQuality,
  };
}

export function getRetryFact(
  session: SessionState
): { fact: CanonicalFact | null; updatedQueue: CanonicalFact[] } {
  if (session.retryQueue.length === 0) {
    return { fact: null, updatedQueue: [] };
  }

  const totalAttempts = session.attempts.length;
  const firstRetry = session.retryQueue[0];
  const firstRetryKey = factKey(firstRetry.factorA, firstRetry.factorB);

  let questionsElapsed = 0;
  for (let i = session.attempts.length - 1; i >= 0; i--) {
    const a = session.attempts[i];
    if (factKey(a.factorA, a.factorB) === firstRetryKey && !a.isCorrect) {
      questionsElapsed = totalAttempts - 1 - i;
      break;
    }
  }

  if (questionsElapsed >= RETRY_DELAY_MIN) {
    return {
      fact: firstRetry,
      updatedQueue: session.retryQueue.slice(1),
    };
  }

  return { fact: null, updatedQueue: session.retryQueue };
}

export function shouldSuggestBreak(
  session: SessionState,
  now: Date = new Date()
): 'none' | 'soft' | 'strong' {
  const elapsed = now.getTime() - session.startedAt.getTime();

  if (elapsed >= HARD_SUGGESTION_MS) return 'strong';
  if (elapsed >= SOFT_TIME_LIMIT_MS) return 'soft';
  return 'none';
}

export function getSessionStats(session: SessionState, now: Date = new Date()): SessionStats {
  const totalQuestions = session.attempts.length;
  const correctAnswers = session.attempts.filter(a => a.isCorrect).length;
  const accuracyPercent = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  const avgResponseTimeMs = totalQuestions > 0
    ? Math.round(
        session.attempts.reduce((sum, a) => sum + a.responseTimeMs, 0) / totalQuestions
      )
    : 0;

  const durationSeconds = Math.round(
    (now.getTime() - session.startedAt.getTime()) / 1000
  );

  const correctFacts = new Set<string>();
  const missedFacts = new Set<string>();
  for (const a of session.attempts) {
    const key = factKey(a.factorA, a.factorB);
    if (a.isCorrect) {
      correctFacts.add(key);
    } else {
      missedFacts.add(key);
    }
  }

  const factsLearned: CanonicalFact[] = [];
  for (const key of correctFacts) {
    const [aStr, bStr] = key.split('x');
    factsLearned.push({ factorA: parseInt(aStr), factorB: parseInt(bStr) });
  }

  const factsMissed: CanonicalFact[] = [];
  for (const key of missedFacts) {
    if (!correctFacts.has(key)) {
      const [aStr, bStr] = key.split('x');
      factsMissed.push({ factorA: parseInt(aStr), factorB: parseInt(bStr) });
    }
  }

  return {
    totalQuestions,
    correctAnswers,
    accuracyPercent,
    avgResponseTimeMs,
    durationSeconds,
    factsLearned,
    factsMissed,
  };
}

export function endSession(session: SessionState, now: Date = new Date()): {
  gameSession: {
    id: string;
    kid_id: string;
    started_at: string;
    ended_at: string;
    level: number;
    total_questions: number;
    correct_answers: number;
    duration_seconds: number;
  };
  attempts: Array<{
    session_id: string;
    kid_id: string;
    factor_a: number;
    factor_b: number;
    correct_answer: number;
    given_answer: number | null;
    is_correct: boolean;
    response_time_ms: number;
    hint_level: number;
    error_type: string | null;
    attempted_at: string;
  }>;
} {
  const stats = getSessionStats(session, now);

  const gameSession = {
    id: session.sessionId,
    kid_id: session.kidId,
    started_at: session.startedAt.toISOString(),
    ended_at: now.toISOString(),
    level: session.currentLevel,
    total_questions: stats.totalQuestions,
    correct_answers: stats.correctAnswers,
    duration_seconds: stats.durationSeconds,
  };

  const attempts = session.attempts.map(a => ({
    session_id: session.sessionId,
    kid_id: session.kidId,
    factor_a: a.factorA,
    factor_b: a.factorB,
    correct_answer: a.correctAnswer,
    given_answer: a.givenAnswer,
    is_correct: a.isCorrect,
    response_time_ms: a.responseTimeMs,
    hint_level: a.hintLevel,
    error_type: a.errorType,
    attempted_at: a.attemptedAt.toISOString(),
  }));

  return { gameSession, attempts };
}
