// ABOUTME: Preloads all game assets and displays a loading progress bar.
// ABOUTME: Generates placeholder textures until art assets are available.

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';

export class Boot extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    const { width, height } = this.cameras.main;
    const barWidth = width * 0.6;
    const barHeight = 32;
    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    const bgBar = this.add.rectangle(
      width / 2, barY, barWidth, barHeight, 0x06628d
    );
    bgBar.setStrokeStyle(2, 0x3c0f0f);

    const fillBar = this.add.rectangle(
      barX + 2, barY, 0, barHeight - 4, 0x2aa7c9
    );
    fillBar.setOrigin(0, 0.5);

    const loadingText = this.add.text(width / 2, barY - 40, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#3c0f0f',
    });
    loadingText.setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      fillBar.width = (barWidth - 4) * value;
    });

    this.load.on('complete', () => {
      loadingText.destroy();
      bgBar.destroy();
      fillBar.destroy();
    });
  }

  create(): void {
    this.generatePlaceholderTextures();
    this.createAnimations();

    EventBus.emit(GameEvents.ASSETS_LOADED);
    this.scene.start('Title');
  }

  private generatePlaceholderTextures(): void {
    this.generateRect('brick', 16, 12, 0xc0392b);
    this.generateRect('brick-alt', 16, 12, 0xe74c3c);
    this.generateRect('door', 24, 32, 0x5d4037);
    this.generateRect('window-empty', 32, 32, 0x90caf9);
    this.generateRect('flag', 32, 32, 0xff5722);
    this.generateRect('roof', 200, 16, 0x795548);

    this.generateRect('sky', 1024, 768, 0x87ceeb);
    this.generateRect('ground', 1024, 80, 0x8bc34a);
    this.generateRect('clouds', 1024, 120, 0xeceff1);

    this.generateRect('brick-debris', 6, 6, 0xbf360c);

    this.generateRect('confetti-red', 8, 8, 0xf44336);
    this.generateRect('confetti-blue', 8, 8, 0x2196f3);
    this.generateRect('confetti-yellow', 8, 8, 0xffeb3b);
    this.generateRect('confetti-green', 8, 8, 0x4caf50);

    this.generateSpritesheet('wrecker', 64, 64, 0x6a1b9a, 26);
    this.generateSpritesheet('fixer', 48, 48, 0x1565c0, 8);
    this.generateSpritesheet('sidekick', 48, 48, 0x2e7d32, 10);
  }

  private generateRect(
    key: string,
    w: number,
    h: number,
    color: number,
  ): void {
    const g = this.make.graphics({ add: false });
    g.fillStyle(color);
    g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private generateSpritesheet(
    key: string,
    frameW: number,
    frameH: number,
    color: number,
    frameCount: number,
  ): void {
    const cols = Math.ceil(Math.sqrt(frameCount));
    const rows = Math.ceil(frameCount / cols);
    const totalW = cols * frameW;
    const totalH = rows * frameH;

    const g = this.make.graphics({ add: false });

    for (let i = 0; i < frameCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const shade = color + (i * 0x040404);
      g.fillStyle(shade);
      g.fillRect(col * frameW + 2, row * frameH + 2, frameW - 4, frameH - 4);
      g.lineStyle(1, 0xffffff, 0.5);
      g.strokeRect(col * frameW + 2, row * frameH + 2, frameW - 4, frameH - 4);
    }

    g.generateTexture(key, totalW, totalH);
    g.destroy();

    const texture = this.textures.get(key);
    const source = texture.source[0];
    texture.add('__BASE', 0, 0, 0, source.width, source.height);

    for (let i = 0; i < frameCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      texture.add(i, 0, col * frameW, row * frameH, frameW, frameH);
    }
  }

  private createAnimations(): void {
    this.anims.create({
      key: 'wrecker-idle',
      frames: this.anims.generateFrameNumbers('wrecker', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: 'wrecker-happy',
      frames: this.anims.generateFrameNumbers('wrecker', { start: 4, end: 9 }),
      frameRate: 8,
      repeat: 0,
    });
    this.anims.create({
      key: 'wrecker-sad',
      frames: this.anims.generateFrameNumbers('wrecker', { start: 10, end: 15 }),
      frameRate: 6,
      repeat: 0,
    });
    this.anims.create({
      key: 'wrecker-climbing',
      frames: this.anims.generateFrameNumbers('wrecker', { start: 16, end: 21 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'wrecker-waving',
      frames: this.anims.generateFrameNumbers('wrecker', { start: 22, end: 25 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'fixer-waving',
      frames: this.anims.generateFrameNumbers('fixer', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: 'fixer-idle',
      frames: this.anims.generateFrameNumbers('fixer', { start: 4, end: 7 }),
      frameRate: 3,
      repeat: -1,
    });

    this.anims.create({
      key: 'sidekick-silly',
      frames: this.anims.generateFrameNumbers('sidekick', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'sidekick-idle',
      frames: this.anims.generateFrameNumbers('sidekick', { start: 6, end: 9 }),
      frameRate: 3,
      repeat: -1,
    });
  }
}
