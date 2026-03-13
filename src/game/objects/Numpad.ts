// ABOUTME: On-screen calculator-style numpad for answer input.
// ABOUTME: Renders a 3x4 grid (1-9, backspace, 0, submit) with sprite-based buttons from the ui atlas.

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';

const BUTTON_SIZE = 48;
const BUTTON_GAP = 8;
const GRID_COLS = 3;

const NUMPAD_X = 780;
const NUMPAD_Y = 380;

type ButtonAction = { type: 'digit'; digit: number } | { type: 'backspace' } | { type: 'submit' };

interface ButtonDef {
  action: ButtonAction;
  normalFrame: string;
  pressedFrame: string;
  disabledFrame: string;
}

const BUTTON_GRID: ButtonDef[] = [
  { action: { type: 'digit', digit: 1 }, normalFrame: 'numpad-1-normal', pressedFrame: 'numpad-1-pressed', disabledFrame: 'numpad-1-disabled' },
  { action: { type: 'digit', digit: 2 }, normalFrame: 'numpad-2-normal', pressedFrame: 'numpad-2-pressed', disabledFrame: 'numpad-2-disabled' },
  { action: { type: 'digit', digit: 3 }, normalFrame: 'numpad-3-normal', pressedFrame: 'numpad-3-pressed', disabledFrame: 'numpad-3-disabled' },
  { action: { type: 'digit', digit: 4 }, normalFrame: 'numpad-4-normal', pressedFrame: 'numpad-4-pressed', disabledFrame: 'numpad-4-disabled' },
  { action: { type: 'digit', digit: 5 }, normalFrame: 'numpad-5-normal', pressedFrame: 'numpad-5-pressed', disabledFrame: 'numpad-5-disabled' },
  { action: { type: 'digit', digit: 6 }, normalFrame: 'numpad-6-normal', pressedFrame: 'numpad-6-pressed', disabledFrame: 'numpad-6-disabled' },
  { action: { type: 'digit', digit: 7 }, normalFrame: 'numpad-7-normal', pressedFrame: 'numpad-7-pressed', disabledFrame: 'numpad-7-disabled' },
  { action: { type: 'digit', digit: 8 }, normalFrame: 'numpad-8-normal', pressedFrame: 'numpad-8-pressed', disabledFrame: 'numpad-8-disabled' },
  { action: { type: 'digit', digit: 9 }, normalFrame: 'numpad-9-normal', pressedFrame: 'numpad-9-pressed', disabledFrame: 'numpad-9-disabled' },
  { action: { type: 'backspace' }, normalFrame: 'backspace', pressedFrame: 'backspace', disabledFrame: 'backspace' },
  { action: { type: 'digit', digit: 0 }, normalFrame: 'numpad-0-normal', pressedFrame: 'numpad-0-pressed', disabledFrame: 'numpad-0-disabled' },
  { action: { type: 'submit' }, normalFrame: 'submit-normal', pressedFrame: 'submit-pressed', disabledFrame: 'submit-disabled' },
];

interface ButtonRef {
  image: Phaser.GameObjects.Image;
  def: ButtonDef;
}

export class Numpad {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private displayText: Phaser.GameObjects.Text;
  private displayBg: Phaser.GameObjects.Rectangle;
  private currentValue: string = '';
  private enabled: boolean = true;
  private buttons: ButtonRef[] = [];

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

    for (let i = 0; i < BUTTON_GRID.length; i++) {
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const def = BUTTON_GRID[i];

      const x = col * (BUTTON_SIZE + BUTTON_GAP) + BUTTON_SIZE / 2;
      const y = row * (BUTTON_SIZE + BUTTON_GAP) + BUTTON_SIZE / 2;

      this.createButton(x, y, def);
    }
  }

  private createButton(x: number, y: number, def: ButtonDef): void {
    const image = this.scene.add.image(x, y, 'ui', def.normalFrame);
    image.setDisplaySize(BUTTON_SIZE, BUTTON_SIZE);
    image.setInteractive({ useHandCursor: true });
    this.container.add(image);

    const ref: ButtonRef = { image, def };
    this.buttons.push(ref);

    image.on('pointerdown', () => {
      if (!this.enabled) return;
      image.setFrame(def.pressedFrame);
      EventBus.emit(GameEvents.BUTTON_TAP);
    });

    image.on('pointerup', () => {
      if (!this.enabled) return;
      image.setFrame(def.normalFrame);
      this.handleAction(def.action);
    });

    image.on('pointerout', () => {
      if (!this.enabled) return;
      image.setFrame(def.normalFrame);
    });
  }

  private handleAction(action: ButtonAction): void {
    if (action.type === 'backspace') {
      this.currentValue = this.currentValue.slice(0, -1);
    } else if (action.type === 'submit') {
      this.submit();
      return;
    } else {
      if (this.currentValue.length < 3) {
        this.currentValue += action.digit.toString();
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
    for (const btn of this.buttons) {
      btn.image.setFrame(enabled ? btn.def.normalFrame : btn.def.disabledFrame);
    }
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
