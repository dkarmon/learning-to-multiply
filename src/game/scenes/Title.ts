// ABOUTME: Title screen with character idle animation and a large Play button.
// ABOUTME: Transitions to the Game scene when Play is tapped.

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';
import { t, isRtl } from '../i18n';

export class Title extends Phaser.Scene {
  constructor() {
    super({ key: 'Title' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add.image(width / 2, height / 2, 'sky')
      .setDisplaySize(width, height);

    this.add.tileSprite(width / 2, height - 60, width, 120, 'ground-street');

    const rtl = isRtl();

    const titleText = this.add.text(width / 2, height * 0.2, t('game.title'), {
      fontFamily: 'Arial Black',
      fontSize: '64px',
      color: '#3c0f0f',
      stroke: '#e46b43',
      strokeThickness: 6,
      rtl,
    });
    titleText.setOrigin(0.5);

    this.add.text(width / 2, height * 0.3, t('game.subtitle'), {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#06628d',
      rtl,
    }).setOrigin(0.5);

    const character = this.add.sprite(width / 2, height * 0.55, 'wrecker');
    character.setScale(3);
    character.play('wrecker-idle');

    const playBtn = this.add.container(width / 2, height * 0.8);

    const btnBg = this.add.rectangle(0, 0, 240, 80, 0x4caf50, 1);
    btnBg.setStrokeStyle(4, 0x388e3c);
    btnBg.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(0, 0, t('game.play'), {
      fontFamily: 'Arial Black',
      fontSize: '40px',
      color: '#ffffff',
      rtl,
    });
    btnText.setOrigin(0.5);

    playBtn.add([btnBg, btnText]);

    btnBg.on('pointerdown', () => {
      btnBg.setFillStyle(0x388e3c);
      btnBg.setScale(0.95);
      btnText.setScale(0.95);
    });

    btnBg.on('pointerup', () => {
      btnBg.setFillStyle(0x4caf50);
      btnBg.setScale(1);
      btnText.setScale(1);
      EventBus.emit(GameEvents.PLAY_PRESSED);
      this.scene.start('Game');
    });

    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x4caf50);
      btnBg.setScale(1);
      btnText.setScale(1);
    });

    this.tweens.add({
      targets: titleText,
      y: titleText.y - 8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    EventBus.emit(GameEvents.SCENE_READY, this);
  }
}
