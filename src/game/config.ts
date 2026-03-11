// ABOUTME: Phaser game configuration shared across all scenes.
// ABOUTME: Sets up canvas rendering, scaling, and physics for the game.

import Phaser from 'phaser';
import { Boot } from './scenes/Boot';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#FFF8E1',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: false,
    },
  },
  scene: [Boot],
};
