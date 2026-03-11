// ABOUTME: Event bus for communication between React components and Phaser scenes.
// ABOUTME: Phaser scenes emit events that React listens to, and vice versa.

import Phaser from 'phaser';

// Singleton event emitter shared between React and Phaser
export const EventBus = new Phaser.Events.EventEmitter();

// Event name constants to prevent typos
export const GameEvents = {
  // Phaser -> React
  SCENE_READY: 'scene-ready',
  ANSWER_SUBMITTED: 'answer-submitted',
  LEVEL_COMPLETE: 'level-complete',
  HINT_REQUESTED: 'hint-requested',

  // React -> Phaser
  SHOW_QUESTION: 'show-question',
  SHOW_RESULT: 'show-result',
  ADD_BRICKS: 'add-bricks',
  START_LEVEL: 'start-level',
  CRUMBLE_BRICKS: 'crumble-bricks',
} as const;
