// ABOUTME: Tests for game session state store.
// ABOUTME: Validates session lifecycle, attempt recording, and brick counting.

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../game';
import type { Question, QuestionAttempt } from '../../types';

const mockQuestions: Question[] = [
  {
    factorA: 3,
    factorB: 5,
    correctAnswer: 15,
    isBuildingUp: false,
    buildUpSequenceIndex: 0,
    isReview: false,
    leitnerBox: 0,
  },
  {
    factorA: 2,
    factorB: 4,
    correctAnswer: 8,
    isBuildingUp: false,
    buildUpSequenceIndex: 0,
    isReview: true,
    leitnerBox: 2,
  },
];

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('starts a session with correct initial state', () => {
    useGameStore.getState().startSession('kid1', 3, mockQuestions);
    const state = useGameStore.getState();

    expect(state.isActive).toBe(true);
    expect(state.kidId).toBe('kid1');
    expect(state.currentLevel).toBe(3);
    expect(state.currentQuestions).toHaveLength(2);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.buildingHeight).toBe(0);
    expect(state.sessionId).toBeTruthy();
    expect(state.startedAt).toBeTruthy();
    expect(state.currentSession.totalBricks).toBe(0);
    expect(state.currentSession.totalQuestions).toBe(0);
  });

  it('generates a unique sessionId on each start', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    const firstId = useGameStore.getState().sessionId;

    useGameStore.getState().reset();
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    const secondId = useGameStore.getState().sessionId;

    expect(firstId).not.toBe(secondId);
  });

  it('records an attempt and appends to attempts array', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);

    const attempt: QuestionAttempt = {
      factorA: 3,
      factorB: 5,
      correctAnswer: 15,
      givenAnswer: 15,
      isCorrect: true,
      responseTimeMs: 2000,
      hintLevel: 0,
      errorType: null,
    };
    useGameStore.getState().recordAttempt(attempt);

    expect(useGameStore.getState().attempts).toHaveLength(1);
    expect(useGameStore.getState().attempts[0].isCorrect).toBe(true);
  });

  it('records multiple attempts in order', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);

    const attempt1: QuestionAttempt = {
      factorA: 3,
      factorB: 5,
      correctAnswer: 15,
      givenAnswer: 15,
      isCorrect: true,
      responseTimeMs: 2000,
      hintLevel: 0,
      errorType: null,
    };
    const attempt2: QuestionAttempt = {
      factorA: 2,
      factorB: 4,
      correctAnswer: 8,
      givenAnswer: 6,
      isCorrect: false,
      responseTimeMs: 3000,
      hintLevel: 0,
      errorType: 'off_by_one',
    };
    useGameStore.getState().recordAttempt(attempt1);
    useGameStore.getState().recordAttempt(attempt2);

    expect(useGameStore.getState().attempts).toHaveLength(2);
    expect(useGameStore.getState().attempts[0].givenAnswer).toBe(15);
    expect(useGameStore.getState().attempts[1].givenAnswer).toBe(6);
  });

  it('adds bricks and increases building height', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().addBricks(15);
    useGameStore.getState().addBricks(8);

    expect(useGameStore.getState().buildingHeight).toBe(23);
  });

  it('records results and updates session counters', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().recordResult({
      isCorrect: true,
      bricksEarned: 15,
      bonusBricks: 2,
    });

    const session = useGameStore.getState().currentSession;
    expect(session.totalQuestions).toBe(1);
    expect(session.correctAnswers).toBe(1);
    expect(session.totalBricks).toBe(17);
    expect(useGameStore.getState().totalBricksAllTime).toBe(17);
  });

  it('records incorrect results without incrementing correct count', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().recordResult({
      isCorrect: false,
      bricksEarned: 0,
      bonusBricks: 0,
    });

    const session = useGameStore.getState().currentSession;
    expect(session.totalQuestions).toBe(1);
    expect(session.correctAnswers).toBe(0);
    expect(session.totalBricks).toBe(0);
  });

  it('advances to next question', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().nextQuestion();
    expect(useGameStore.getState().currentQuestionIndex).toBe(1);
  });

  it('ends session by setting isActive to false', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().endSession();
    expect(useGameStore.getState().isActive).toBe(false);
  });

  it('preserves other state when ending session', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().addBricks(10);
    useGameStore.getState().endSession();

    const state = useGameStore.getState();
    expect(state.isActive).toBe(false);
    expect(state.buildingHeight).toBe(10);
    expect(state.sessionId).toBeTruthy();
  });

  it('resets to initial state', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().addBricks(10);
    useGameStore.getState().reset();

    const state = useGameStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.kidId).toBeNull();
    expect(state.buildingHeight).toBe(0);
    expect(state.isActive).toBe(false);
    expect(state.currentQuestions).toHaveLength(0);
    expect(state.attempts).toHaveLength(0);
    expect(state.startedAt).toBeNull();
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.currentLevel).toBe(1);
    expect(state.currentSession.totalBricks).toBe(0);
    expect(state.currentSession.totalQuestions).toBe(0);
  });

  it('advances level', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().advanceLevel();
    expect(useGameStore.getState().currentLevel).toBe(2);
  });

  it('completes level and increments levelsCompleted', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().completeLevel({
      levelNumber: 1,
      totalBricks: 50,
      accuracy: 80,
    });

    expect(useGameStore.getState().currentSession.levelsCompleted).toBe(1);
  });
});
