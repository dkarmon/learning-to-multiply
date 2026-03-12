// ABOUTME: Session summary screen shown when the child takes a break or finishes.
// ABOUTME: Displays session stats and provides navigation back to play or home.

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';
import { useGameStore } from '../../stores/game';
import { t, isRtl } from '../i18n';

export class SessionEnd extends Phaser.Scene {
  constructor() {
    super({ key: 'SessionEnd' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    const store = useGameStore.getState();
    const session = store.currentSession;

    this.add.rectangle(width / 2, height / 2, width, height, 0xfff8e1);

    const rtl = isRtl();

    this.add.text(width / 2, height * 0.1, t('game.sessionDone'), {
      fontFamily: 'Arial Black',
      fontSize: '44px',
      color: '#06628d',
      stroke: '#FFF8E1',
      strokeThickness: 3,
      rtl,
    }).setOrigin(0.5);

    const character = this.add.sprite(width / 2, height * 0.3, 'wrecker');
    character.setScale(3);
    character.play('wrecker-waving');

    const statsY = height * 0.48;
    const lineHeight = 40;

    const stats = [
      { label: t('game.questionsAnswered'), value: `${session.totalQuestions}` },
      { label: t('game.correctAnswers'), value: `${session.correctAnswers}` },
      {
        label: t('game.accuracy'),
        value: session.totalQuestions > 0
          ? `${Math.round((session.correctAnswers / session.totalQuestions) * 100)}%`
          : '\u2014',
      },
      { label: t('game.bricksEarnedLabel'), value: `${session.totalBricks}` },
      { label: t('game.levelsCompleted'), value: `${session.levelsCompleted}` },
    ];

    const divTopY = statsY - 16;
    this.add.rectangle(width / 2, divTopY, 320, 2, 0x06628d);

    for (let i = 0; i < stats.length; i++) {
      const stat = stats[i];
      const y = statsY + i * lineHeight;

      this.add.text(rtl ? width / 2 + 140 : width / 2 - 140, y, stat.label, {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#3c0f0f',
        rtl,
      }).setOrigin(rtl ? 1 : 0, 0.5);

      this.add.text(rtl ? width / 2 - 140 : width / 2 + 140, y, stat.value, {
        fontFamily: 'Arial Black',
        fontSize: '24px',
        color: '#e46b43',
      }).setOrigin(rtl ? 0 : 1, 0.5);
    }

    const divBottomY = statsY + stats.length * lineHeight + 8;
    this.add.rectangle(width / 2, divBottomY, 320, 2, 0x06628d);

    const buttonY = height * 0.88;

    const playAgainBg = this.add.rectangle(
      width / 2 - 130, buttonY, 220, 64, 0x4caf50,
    );
    playAgainBg.setStrokeStyle(3, 0x3c0f0f);
    playAgainBg.setInteractive({ useHandCursor: true });
    this.add.text(width / 2 - 130, buttonY, t('game.playAgain'), {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: '#ffffff',
      rtl,
    }).setOrigin(0.5);

    playAgainBg.on('pointerdown', () => playAgainBg.setScale(0.95));
    playAgainBg.on('pointerup', () => {
      playAgainBg.setScale(1);
      const gameStore = useGameStore.getState();
      gameStore.startNewSession();
      this.scene.start('Game');
    });
    playAgainBg.on('pointerout', () => playAgainBg.setScale(1));

    const homeBg = this.add.rectangle(
      width / 2 + 130, buttonY, 220, 64, 0x06628d,
    );
    homeBg.setStrokeStyle(3, 0x3c0f0f);
    homeBg.setInteractive({ useHandCursor: true });
    this.add.text(width / 2 + 130, buttonY, t('game.goHome'), {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: '#ffffff',
      rtl,
    }).setOrigin(0.5);

    homeBg.on('pointerdown', () => homeBg.setScale(0.95));
    homeBg.on('pointerup', () => {
      homeBg.setScale(1);
      EventBus.emit(GameEvents.GO_HOME);
    });
    homeBg.on('pointerout', () => homeBg.setScale(1));

    EventBus.emit(GameEvents.SESSION_ENDED, {
      totalQuestions: session.totalQuestions,
      correctAnswers: session.correctAnswers,
      totalBricks: session.totalBricks,
    });

    EventBus.emit(GameEvents.SCENE_READY, this);
  }
}
