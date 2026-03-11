// ABOUTME: On-screen calculator-style numpad for answer input.
// ABOUTME: Renders a 3x4 grid (1-9, backspace, 0, submit) with touch-friendly buttons.

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';

const BUTTON_SIZE = 64;
const BUTTON_GAP = 8;
const GRID_COLS = 3;

const BUTTON_LABELS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '\u232B', '0', '\u2713',
];

const NUMPAD_X = 780;
const NUMPAD_Y = 380;

export class Numpad {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private displayText: Phaser.GameObjects.Text;
  private displayBg: Phaser.GameObjects.Rectangle;
  private currentValue: string = '';
  private enabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(NUMPAD_X, NUMPAD_Y);

    const displayWidth = GRID_COLS * (BUTTON_SIZE + BUTTON_GAP) - BUTTON_GAP;

    this.displayBg = scene.add.rectangle(
      displayWidth / 2, -50,
      displayWidth, 48,
      0xffffff,
    );
    this.displayBg.setStrokeStyle(3, 0x06628d);
    this.container.add(this.displayBg);

    this.displayText = scene.add.text(displayWidth / 2, -50, '', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#3c0f0f',
    });
    this.displayText.setOrigin(0.5);
    this.container.add(this.displayText);

    for (let i = 0; i < BUTTON_LABELS.length; i++) {
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const label = BUTTON_LABELS[i];

      const x = col * (BUTTON_SIZE + BUTTON_GAP);
      const y = row * (BUTTON_SIZE + BUTTON_GAP);

      this.createButton(x, y, label);
    }
  }

  private createButton(x: number, y: number, label: string): void {
    let bgColor: number;
    if (label === '\u2713') {
      bgColor = 0x4caf50;
    } else if (label === '\u232B') {
      bgColor = 0xef5350;
    } else {
      bgColor = 0x06628d;
    }

    const bg = this.scene.add.rectangle(
      x + BUTTON_SIZE / 2,
      y + BUTTON_SIZE / 2,
      BUTTON_SIZE,
      BUTTON_SIZE,
      bgColor,
    );
    bg.setStrokeStyle(2, 0x3c0f0f);
    bg.setInteractive({ useHandCursor: true });
    this.container.add(bg);

    const text = this.scene.add.text(
      x + BUTTON_SIZE / 2,
      y + BUTTON_SIZE / 2,
      label,
      {
        fontFamily: 'Arial Black',
        fontSize: '28px',
        color: '#ffffff',
      },
    );
    text.setOrigin(0.5);
    this.container.add(text);

    bg.on('pointerdown', () => {
      if (!this.enabled) return;
      bg.setScale(0.9);
      text.setScale(0.9);
      EventBus.emit(GameEvents.BUTTON_TAP);
    });

    bg.on('pointerup', () => {
      if (!this.enabled) return;
      bg.setScale(1);
      text.setScale(1);
      this.handleInput(label);
    });

    bg.on('pointerout', () => {
      bg.setScale(1);
      text.setScale(1);
    });
  }

  private handleInput(label: string): void {
    if (label === '\u232B') {
      this.currentValue = this.currentValue.slice(0, -1);
    } else if (label === '\u2713') {
      this.submit();
      return;
    } else {
      if (this.currentValue.length < 3) {
        this.currentValue += label;
      }
    }

    this.displayText.setText(this.currentValue);
    this.pulseDisplay();
  }

  private submit(): void {
    if (this.currentValue === '') return;

    const answer = parseInt(this.currentValue, 10);
    EventBus.emit(GameEvents.ANSWER_SUBMITTED, answer);
    this.setEnabled(false);
  }

  private pulseDisplay(): void {
    this.scene.tweens.add({
      targets: this.displayBg,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 80,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  clear(): void {
    this.currentValue = '';
    this.displayText.setText('');
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.container.setAlpha(enabled ? 1 : 0.5);
  }

  showCorrectFlash(): void {
    this.displayBg.setFillStyle(0x4caf50);
    this.scene.time.delayedCall(400, () => {
      this.displayBg.setFillStyle(0xffffff);
    });
  }

  showWrongFlash(): void {
    this.displayBg.setFillStyle(0xef5350);
    this.scene.time.delayedCall(400, () => {
      this.displayBg.setFillStyle(0xffffff);
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}
