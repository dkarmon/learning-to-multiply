// ABOUTME: Singleton event bus bridging React and Phaser communication.
// ABOUTME: Both layers emit/listen on this shared EventEmitter instance.

import Phaser from 'phaser';

export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  // Phaser -> React
  SCENE_READY: 'current-scene-ready',
  ASSETS_LOADED: 'assets-loaded',
  ANSWER_RESULT: 'answer-result',
  LEVEL_COMPLETE: 'level-complete',
  BRICKS_EARNED: 'bricks-earned',
  BRICK_PLACED: 'brick-placed',
  SESSION_ENDED: 'session-ended',
  GO_HOME: 'go-home',
  PLAY_PRESSED: 'play-pressed',
  BUTTON_TAP: 'button-tap',

  // Internal (Phaser scene <-> Phaser objects)
  ANSWER_SUBMITTED: 'answer-submitted',
  HINT_REQUESTED: 'hint-requested',
  SHOW_HINT: 'show-hint',
} as const;
