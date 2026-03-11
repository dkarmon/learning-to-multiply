// ABOUTME: Zustand store for game state, bridging the Learning Engine and Phaser.
// ABOUTME: Tracks session progress, current questions, bricks earned, and level state.

import { create } from 'zustand';
import type { Question, QuestionAttempt } from '../types';

interface SessionState {
  totalQuestions: number;
  correctAnswers: number;
  totalBricks: number;
  levelsCompleted: number;
}

interface GameState {
  sessionId: string | null;
  kidId: string | null;
  currentLevel: number;
  currentQuestionIndex: number;
  currentQuestions: Question[];
  attempts: QuestionAttempt[];
  buildingHeight: number;
  totalBricksAllTime: number;
  isActive: boolean;
  startedAt: string | null;
  currentSession: SessionState;

  startSession: (kidId: string, level: number, questions: Question[]) => void;
  recordAttempt: (attempt: QuestionAttempt) => void;
  recordResult: (data: {
    isCorrect: boolean;
    bricksEarned: number;
    bonusBricks: number;
  }) => void;
  completeLevel: (data: {
    levelNumber: number;
    totalBricks: number;
    accuracy: number;
  }) => void;
  advanceLevel: () => void;
  startNewSession: () => void;
  addBricks: (count: number) => void;
  nextQuestion: () => void;
  endSession: () => void;
  reset: () => void;
}

const initialSession: SessionState = {
  totalQuestions: 0,
  correctAnswers: 0,
  totalBricks: 0,
  levelsCompleted: 0,
};

export const useGameStore = create<GameState>()((set) => ({
  sessionId: null,
  kidId: null,
  currentLevel: 1,
  currentQuestionIndex: 0,
  currentQuestions: [],
  attempts: [],
  buildingHeight: 0,
  totalBricksAllTime: 0,
  isActive: false,
  startedAt: null,
  currentSession: { ...initialSession },

  startSession: (kidId, level, questions) => {
    set({
      sessionId: crypto.randomUUID(),
      kidId,
      currentLevel: level,
      currentQuestionIndex: 0,
      currentQuestions: questions,
      attempts: [],
      buildingHeight: 0,
      isActive: true,
      startedAt: new Date().toISOString(),
      currentSession: { ...initialSession },
    });
  },

  recordAttempt: (attempt) => {
    set((state) => ({
      attempts: [...state.attempts, attempt],
    }));
  },

  recordResult: (data) => {
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        totalQuestions: state.currentSession.totalQuestions + 1,
        correctAnswers: state.currentSession.correctAnswers + (data.isCorrect ? 1 : 0),
        totalBricks: state.currentSession.totalBricks + data.bricksEarned + data.bonusBricks,
      },
      totalBricksAllTime: state.totalBricksAllTime + data.bricksEarned + data.bonusBricks,
    }));
  },

  completeLevel: (_data) => {
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        levelsCompleted: state.currentSession.levelsCompleted + 1,
      },
    }));
  },

  advanceLevel: () => {
    set((state) => ({
      currentLevel: state.currentLevel + 1,
    }));
  },

  startNewSession: () => {
    set({
      currentSession: { ...initialSession },
    });
  },

  addBricks: (count) => {
    set((state) => ({
      buildingHeight: state.buildingHeight + count,
    }));
  },

  nextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    }));
  },

  endSession: () => {
    set({ isActive: false });
  },

  reset: () => {
    set({
      sessionId: null,
      kidId: null,
      currentLevel: 1,
      currentQuestionIndex: 0,
      currentQuestions: [],
      attempts: [],
      buildingHeight: 0,
      isActive: false,
      startedAt: null,
      currentSession: { ...initialSession },
    });
  },
}));
