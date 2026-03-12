// ABOUTME: Integration test for the full learning engine session lifecycle.
// ABOUTME: Verifies start -> build level -> answer -> retry -> advance -> end flow.

import { describe, it, expect } from 'vitest';
import {
  startSession,
  recordAttempt,
  buildLevelQuestions,
  getNextQuestion,
  canAdvanceLevel,
  processAttempt,
  endSession,
  getSessionStats,
  getAllMastery,
  getAllCanonicalFacts,
  getStrugglingFacts,
  scoreFluency,
  isCloseAnswer,
  classifyError,
  getMasteryHeatMap,
} from '../index';
import { factKey } from '../../../types/learning';
import type { FactMasteryRecord } from '../../../types/learning';

describe('full session lifecycle', () => {
  it('runs a complete session from start to end', () => {
    const masteryRecords = new Map<string, FactMasteryRecord>();

    // 1. Start a session
    let session = startSession('kid1', 1);
    expect(session.sessionId).toBeTruthy();
    expect(session.attempts).toHaveLength(0);

    // 2. Build a level plan
    const levelPlan = buildLevelQuestions(
      1, masteryRecords, session, 1, new Map()
    );
    expect(levelPlan.questions).toHaveLength(5);
    expect(levelPlan.tier).toBe(1);

    // 3. Answer questions
    for (let i = 0; i < levelPlan.questions.length; i++) {
      const { question } = getNextQuestion(levelPlan, i, session, masteryRecords);
      const correctAnswer = question.factorA * question.factorB;

      // Answer correctly except the 3rd question
      const givenAnswer = i === 2 ? correctAnswer + 1 : correctAnswer;
      const result = recordAttempt(
        session,
        question.factorA,
        question.factorB,
        givenAnswer,
        1000 + i * 200,
        0,
        masteryRecords
      );
      session = result.session;

      // Process mastery update
      const key = factKey(question.factorA, question.factorB);
      const existingRecord = masteryRecords.get(key) ?? {
        kidId: 'kid1',
        factorA: Math.min(question.factorA, question.factorB),
        factorB: Math.max(question.factorA, question.factorB),
        leitnerBox: 1,
        totalAttempts: 0,
        correctAttempts: 0,
        avgResponseTimeMs: null,
        lastPracticedAt: null,
        nextReviewAt: null,
      };
      const updatedRecord = processAttempt(
        existingRecord,
        result.attempt.isCorrect,
        result.attempt.responseTimeMs,
        result.fluencyQuality
      );
      masteryRecords.set(key, updatedRecord);
    }

    // 4. Check retry queue has the missed fact
    expect(session.retryQueue.length).toBeGreaterThanOrEqual(1);
    expect(session.missedThisSession.size).toBeGreaterThanOrEqual(1);

    // 5. Check advancement
    const levelAttempts = session.attempts.map(a => ({
      isCorrect: a.isCorrect,
      responseTimeMs: a.responseTimeMs,
    }));
    const canAdvance = canAdvanceLevel(levelAttempts);
    expect(canAdvance).toBe(true); // 4/5 correct at fast speed

    // 6. End session
    const endData = endSession(session);
    expect(endData.gameSession.id).toBe(session.sessionId);
    expect(endData.gameSession.total_questions).toBe(5);
    expect(endData.gameSession.correct_answers).toBe(4);
    expect(endData.attempts).toHaveLength(5);
    expect(endData.attempts.every(a => typeof a.attempted_at === 'string')).toBe(true);

    // 7. Verify mastery updates
    const stats = getSessionStats(session);
    expect(stats.totalQuestions).toBe(5);
    expect(stats.correctAnswers).toBe(4);
    expect(stats.accuracyPercent).toBe(80);
    expect(stats.factsLearned.length).toBeGreaterThan(0);

    // 8. Check overall mastery
    const overall = getAllMastery(masteryRecords);
    expect(overall.totalFacts).toBe(66);
    expect(overall.mastered + overall.learning + overall.struggling + overall.notStarted).toBe(66);
  });
});

describe('barrel exports resolve correctly', () => {
  it('all exported functions are callable', () => {
    expect(typeof startSession).toBe('function');
    expect(typeof recordAttempt).toBe('function');
    expect(typeof buildLevelQuestions).toBe('function');
    expect(typeof getNextQuestion).toBe('function');
    expect(typeof canAdvanceLevel).toBe('function');
    expect(typeof processAttempt).toBe('function');
    expect(typeof endSession).toBe('function');
    expect(typeof getSessionStats).toBe('function');
    expect(typeof getAllMastery).toBe('function');
    expect(typeof getAllCanonicalFacts).toBe('function');
    expect(typeof getStrugglingFacts).toBe('function');
    expect(typeof scoreFluency).toBe('function');
    expect(typeof isCloseAnswer).toBe('function');
    expect(typeof classifyError).toBe('function');
    expect(typeof getMasteryHeatMap).toBe('function');
  });
});
