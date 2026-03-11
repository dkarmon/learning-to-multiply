// ABOUTME: Phaser game configuration with Arcade physics and responsive scaling.
// ABOUTME: Registers all game scenes and configures touch/pointer input.

import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Title } from './scenes/Title';
import { Game } from './scenes/Game';
import { LevelComplete } from './scenes/LevelComplete';
import { SessionEnd } from './scenes/SessionEnd';

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'phaser-container',
  backgroundColor: '#FFF8E1',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
    },
  },
  scene: [Boot, Title, Game, LevelComplete, SessionEnd],
  input: {
    activePointers: 3,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
};
