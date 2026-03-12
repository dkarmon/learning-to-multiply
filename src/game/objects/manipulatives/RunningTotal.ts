// ABOUTME: Displays the running total of all pieces in the workspace.
// ABOUTME: Updates as pieces are added/removed; triggers celebration on correct answer.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';
import { t } from '../../i18n';

export class RunningTotal {
  private scene: Phaser.Scene;
  private label: Phaser.GameObjects.Text;
  private valueText: Phaser.GameObjects.Text;
  private currentValue = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    this.label = scene.add.text(x - 40, y, t('game.total'), {
      fontSize: MANIP.TOTAL_FONT_SIZE,
      color: '#666666',
      fontFamily: MANIP.TOTAL_FONT_FAMILY,
    }).setOrigin(0.5);

    this.valueText = scene.add.text(x + 20, y, '0', {
      fontSize: '24px',
      color: '#333333',
      fontFamily: MANIP.TOTAL_FONT_FAMILY,
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  setValue(value: number): void {
    const oldValue = this.currentValue;
    this.currentValue = value;
    this.valueText.setText(String(value));

    if (value > oldValue && value > 0) {
      this.scene.tweens.add({
        targets: this.valueText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }
  }

  celebrate(): void {
    this.valueText.setColor('#4CAF50');
    this.scene.tweens.add({
      targets: this.valueText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      yoyo: true,
      repeat: 2,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.valueText.setColor('#333333');
      },
    });
  }

  destroy(): void {
    this.label.destroy();
    this.valueText.destroy();
  }
}
