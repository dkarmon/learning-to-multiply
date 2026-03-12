// ABOUTME: Persists game session summaries and attempt records to Firestore.
// ABOUTME: Called from GameWrapper when a level completes or an answer is submitted.

import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export async function persistSession(data: {
  sessionId: string;
  kidId: string;
  startedAt: string;
  level: number;
  totalQuestions: number;
  correctAnswers: number;
}): Promise<void> {
  if (!data.kidId || !data.sessionId) return;

  try {
    const sessionRef = doc(db, 'sessions', data.sessionId);
    const startedDate = new Date(data.startedAt);
    const durationSeconds = Math.round((Date.now() - startedDate.getTime()) / 1000);

    await setDoc(sessionRef, {
      kid_id: data.kidId,
      started_at: Timestamp.fromDate(startedDate),
      ended_at: serverTimestamp(),
      level: data.level,
      total_questions: data.totalQuestions,
      correct_answers: data.correctAnswers,
      duration_seconds: durationSeconds,
    }, { merge: true });
  } catch (err) {
    console.error('Failed to persist session:', err);
  }
}

export async function persistAttempt(data: {
  sessionId: string;
  kidId: string;
  factorA: number;
  factorB: number;
  correctAnswer: number;
  givenAnswer: number;
  isCorrect: boolean;
  responseTimeMs: number;
  hintLevel: number;
}): Promise<void> {
  if (!data.kidId || !data.sessionId) return;

  try {
    const attemptsRef = collection(db, 'attempts');
    await addDoc(attemptsRef, {
      session_id: data.sessionId,
      kid_id: data.kidId,
      factor_a: data.factorA,
      factor_b: data.factorB,
      correct_answer: data.correctAnswer,
      given_answer: data.givenAnswer,
      is_correct: data.isCorrect,
      response_time_ms: data.responseTimeMs,
      hint_level: data.hintLevel,
      error_type: null,
      attempted_at: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to persist attempt:', err);
  }
}
