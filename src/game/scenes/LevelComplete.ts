// ABOUTME: Celebration scene shown after completing 5 questions in a level.
// ABOUTME: Displays confetti, score summary, and navigation buttons.

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';
import { emitConfetti } from '../effects/Confetti';
import { useGameStore } from '../../stores/game';
import { generateLevelQuestions } from '../../lib/question-generator';
import type { FactMasteryRecord } from '../../types/learning';

interface LevelCompleteData {
  levelNumber: number;
  totalBricks: number;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
}

export class LevelComplete extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelComplete' });
  }

  create(data: LevelCompleteData): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0xfff8e1);

    emitConfetti(this);

    const title = this.add.text(width / 2, height * 0.15, 'Level Complete!', {
      fontFamily: 'Arial Black',
      fontSize: '52px',
      color: '#4CAF50',
      stroke: '#388e3c',
      strokeThickness: 4,
    });
    title.setOrigin(0.5);

    title.setScale(0);
    this.tweens.add({
      targets: title,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    const character = this.add.sprite(width / 2, height * 0.4, 'wrecker');
    character.setScale(3);
    character.play('wrecker-happy');
    character.once('animationcomplete', () => {
      character.play('wrecker-waving');
    });

    const summaryY = height * 0.58;
    const lineHeight = 36;

    this.add.text(width / 2, summaryY, `Level ${data.levelNumber}`, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#3c0f0f',
    }).setOrigin(0.5);

    this.add.text(width / 2, summaryY + lineHeight, `${data.correctCount} of ${data.totalQuestions} correct`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#06628d',
    }).setOrigin(0.5);

    this.add.text(width / 2, summaryY + lineHeight * 2, `${data.totalBricks} bricks earned!`, {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#e46b43',
    }).setOrigin(0.5);

    const accuracyPercent = Math.round(data.accuracy * 100);
    this.add.text(width / 2, summaryY + lineHeight * 3, `${accuracyPercent}% accuracy`, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#06628d',
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      this.createButtons(width, height);
    });

    EventBus.emit(GameEvents.SCENE_READY, this);
  }

  private createButtons(width: number, height: number): void {
    const buttonY = height * 0.88;

    const nextBtn = this.createButton(
      width / 2 - 130, buttonY,
      'Next Level', 0x4caf50,
    );

    const breakBtn = this.createButton(
      width / 2 + 130, buttonY,
      'Take a Break', 0x06628d,
    );

    nextBtn.setAlpha(0);
    breakBtn.setAlpha(0);
    this.tweens.add({
      targets: [nextBtn, breakBtn],
      alpha: 1,
      duration: 300,
    });

    const nextBg = nextBtn.getAt(0) as Phaser.GameObjects.Rectangle;
    nextBg.on('pointerup', () => {
      const store = useGameStore.getState();
      store.advanceLevel();
      const nextLevel = store.currentLevel + 1;
      const masteryRecords = new Map<string, FactMasteryRecord>();
      const questions = generateLevelQuestions(nextLevel, masteryRecords);
      useGameStore.setState({ currentQuestions: questions, currentQuestionIndex: 0 });
      this.scene.start('Game');
    });

    const breakBg = breakBtn.getAt(0) as Phaser.GameObjects.Rectangle;
    breakBg.on('pointerup', () => {
      this.scene.start('SessionEnd');
    });
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    color: number,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 220, 64, color);
    bg.setStrokeStyle(3, 0x3c0f0f);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: '#ffffff',
    });
    text.setOrigin(0.5);
    container.add(text);

    bg.on('pointerdown', () => container.setScale(0.95));
    bg.on('pointerup', () => container.setScale(1));
    bg.on('pointerout', () => container.setScale(1));

    return container;
  }
}
