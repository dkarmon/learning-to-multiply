// ABOUTME: Boot scene that loads initial assets and transitions to the game.
// ABOUTME: Displays a loading indicator while assets are being fetched.

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x06628d, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x2aa7c9, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.text(width / 2, height / 2, 'Multiplication Builder', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#06628d',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, 'Game scenes coming soon...', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#666666',
    }).setOrigin(0.5);

    EventBus.emit(GameEvents.SCENE_READY, this);
  }
}
