// ABOUTME: Game state store tracking the current play session.
// ABOUTME: Manages questions, attempts, brick counts, and session lifecycle.

import { create } from 'zustand';
import type { Question, QuestionAttempt, GameSessionState } from '../types';

interface GameStore extends GameSessionState {
  startSession: (kidId: string, level: number, questions: Question[]) => void;
  recordAttempt: (attempt: QuestionAttempt) => void;
  addBricks: (count: number) => void;
  nextQuestion: () => void;
  endSession: () => void;
  reset: () => void;
}

const initialState: GameSessionState = {
  sessionId: null,
  kidId: null,
  currentLevel: 1,
  currentQuestionIndex: 0,
  questions: [],
  attempts: [],
  buildingHeight: 0,
  totalBricks: 0,
  isActive: false,
  startedAt: null,
};

export const useGameStore = create<GameStore>()((set) => ({
  ...initialState,

  startSession: (kidId, level, questions) => {
    set({
      sessionId: crypto.randomUUID(),
      kidId,
      currentLevel: level,
      currentQuestionIndex: 0,
      questions,
      attempts: [],
      buildingHeight: 0,
      totalBricks: 0,
      isActive: true,
      startedAt: new Date().toISOString(),
    });
  },

  recordAttempt: (attempt) => {
    set((state) => ({
      attempts: [...state.attempts, attempt],
    }));
  },

  addBricks: (count) => {
    set((state) => ({
      totalBricks: state.totalBricks + count,
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
    set(initialState);
  },
}));
