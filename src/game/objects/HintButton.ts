// ABOUTME: Hint button that shows bonus brick cost before the child taps.
// ABOUTME: Supports two hint levels with decreasing bonus brick rewards.

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';

const HINT_X = 780;
const HINT_Y = 260;

export class HintButton {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private costText: Phaser.GameObjects.Text;
  private hintLevel: 0 | 1 | 2 = 0;
  private enabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(HINT_X, HINT_Y);

    this.bg = scene.add.rectangle(0, 0, 180, 56, 0xe46b43);
    this.bg.setStrokeStyle(2, 0x3c0f0f);
    this.bg.setInteractive({ useHandCursor: true });
    this.container.add(this.bg);

    const labelText = scene.add.text(0, -10, 'Hint', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff',
    });
    labelText.setOrigin(0.5);
    this.container.add(labelText);

    this.costText = scene.add.text(0, 14, '\u22122 bonus bricks', {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#FFF8E1',
    });
    this.costText.setOrigin(0.5);
    this.container.add(this.costText);

    this.bg.on('pointerdown', () => {
      if (!this.enabled) return;
      this.bg.setScale(0.95);
    });

    this.bg.on('pointerup', () => {
      if (!this.enabled) return;
      this.bg.setScale(1);
      this.onTap();
    });

    this.bg.on('pointerout', () => {
      this.bg.setScale(1);
    });
  }

  private onTap(): void {
    if (this.hintLevel >= 2) return;

    this.hintLevel++;

    if (this.hintLevel === 1) {
      this.costText.setText('\u22121 bonus brick');
      this.bg.setFillStyle(0xd4845b);
      EventBus.emit(GameEvents.HINT_REQUESTED, { level: 1 });
    } else if (this.hintLevel === 2) {
      this.costText.setText('no bonus');
      this.bg.setFillStyle(0x8b4513);
      this.setEnabled(false);
      EventBus.emit(GameEvents.HINT_REQUESTED, { level: 2 });
    }

    EventBus.emit(GameEvents.BUTTON_TAP);
  }

  reset(): void {
    this.hintLevel = 0;
    this.costText.setText('\u22122 bonus bricks');
    this.bg.setFillStyle(0xe46b43);
    this.setEnabled(true);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.container.setAlpha(enabled ? 1 : 0.6);
  }

  getHintLevel(): 0 | 1 | 2 {
    return this.hintLevel;
  }

  destroy(): void {
    this.container.destroy();
  }
}
