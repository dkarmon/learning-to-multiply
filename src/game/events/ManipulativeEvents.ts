// ABOUTME: Shared event bus for communication between ManipulativesScene and Game scene.
// ABOUTME: Decouples the two scenes so neither holds a direct reference to the other.

import Phaser from 'phaser';

export const ManipulativeEvents = new Phaser.Events.EventEmitter();

// Expose for E2E testing
if (typeof window !== 'undefined') {
  (window as any).__MANIP_EVENT_BUS__ = ManipulativeEvents;
}

export const MANIP_EVENTS = {
  // Game scene -> Manipulatives scene
  SHOW: 'manip:show',                     // { factorA, factorB, correctAnswer }
  HIDE: 'manip:hide',
  SHOW_HINT_TIER1: 'manip:hint:tier1',    // { factorA, factorB, correctAnswer }
  SHOW_HINT_TIER2: 'manip:hint:tier2',    // { factorA, factorB, correctAnswer }
  SHOW_ANSWER: 'manip:answer:show',       // { answer }
  START_BUILD_UP: 'manip:buildup:start',  // { factorA, factorB, previousGroups }
  RESET: 'manip:reset',

  // Manipulatives scene -> Game scene
  TOTAL_CHANGED: 'manip:total:changed',   // { total }
  CORRECT_TOTAL: 'manip:total:correct',   // { total } -- total matches correct answer
  CLOSED: 'manip:closed',
  HINT_ANIMATION_DONE: 'manip:hint:done',
  ANSWER_ANIMATION_DONE: 'manip:answer:done',
} as const;

export interface ManipShowPayload {
  factorA: number;
  factorB: number;
  correctAnswer: number;
}

export interface ManipAnswerPayload {
  answer: number;
}

export interface ManipBuildUpPayload {
  factorA: number;
  factorB: number;
  previousGroups: number;
}

export interface ManipTotalPayload {
  total: number;
}
