// ABOUTME: Preloads all game assets and displays a loading progress bar.
// ABOUTME: Loads sprite atlases, images, and tileset; creates character animations.

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';
import { t } from '../i18n';

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

    const loadingText = this.add.text(width / 2, barY - 40, t('common.loading'), {
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

    this.load.atlas('wrecker', '/assets/sprites/wrecker.png', '/assets/sprites/wrecker.json');
    this.load.atlas('sidekick', '/assets/sprites/sidekick.png', '/assets/sprites/sidekick.json');
    this.load.atlas('fixer', '/assets/sprites/fixer.png', '/assets/sprites/fixer.json');
    this.load.atlas('manipulatives', '/assets/sprites/manipulatives.png', '/assets/sprites/manipulatives.json');
    this.load.atlas('ui', '/assets/sprites/ui.png', '/assets/sprites/ui.json');
    this.load.atlas('particles', '/assets/sprites/particles.png', '/assets/sprites/particles.json');

    this.load.image('sky', '/assets/sprites/sky.png');
    this.load.image('ground', '/assets/sprites/ground.png');

    this.load.spritesheet('bricks', '/assets/tiles/bricks.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create(): void {
    this.generateBuildingTextures();
    this.createAnimations();

    EventBus.emit(GameEvents.ASSETS_LOADED);
    this.scene.start('Title');
  }

  private generateBuildingTextures(): void {
    this.generateRect('clouds', 1024, 120, 0xeceff1);
    this.generateRect('door', 24, 32, 0x5d4037);
    this.generateRect('window-empty', 32, 32, 0x90caf9);
    this.generateRect('flag', 32, 32, 0xff5722);
    this.generateRect('roof', 200, 16, 0x795548);
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

  private createAnimations(): void {
    this.anims.create({
      key: 'wrecker-idle',
      frames: this.anims.generateFrameNames('wrecker', {
        prefix: 'wrecker-idle-',
        start: 0,
        end: 3,
      }),
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: 'wrecker-happy',
      frames: this.anims.generateFrameNames('wrecker', {
        prefix: 'wrecker-happy-',
        start: 0,
        end: 5,
      }),
      frameRate: 8,
      repeat: 0,
    });
    this.anims.create({
      key: 'wrecker-sad',
      frames: this.anims.generateFrameNames('wrecker', {
        prefix: 'wrecker-frustrated-',
        start: 0,
        end: 5,
      }),
      frameRate: 6,
      repeat: 0,
    });
    this.anims.create({
      key: 'wrecker-climbing',
      frames: this.anims.generateFrameNames('wrecker', {
        prefix: 'wrecker-climbing-',
        start: 0,
        end: 5,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'wrecker-waving',
      frames: this.anims.generateFrameNames('wrecker', {
        prefix: 'wrecker-waving-',
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'fixer-waving',
      frames: this.anims.generateFrameNames('fixer', {
        prefix: 'fixer-waving-',
        start: 0,
        end: 3,
      }),
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: 'fixer-idle',
      frames: this.anims.generateFrameNames('fixer', {
        prefix: 'fixer-idle-',
        start: 0,
        end: 3,
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.anims.create({
      key: 'sidekick-silly',
      frames: this.anims.generateFrameNames('sidekick', {
        prefix: 'sidekick-cheering-',
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'sidekick-idle',
      frames: this.anims.generateFrameNames('sidekick', {
        prefix: 'sidekick-idle-',
        start: 0,
        end: 3,
      }),
      frameRate: 3,
      repeat: -1,
    });
  }
}
