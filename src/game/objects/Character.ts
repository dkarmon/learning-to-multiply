// ABOUTME: Animated character sprite positioned beside the building.
// ABOUTME: Supports idle, happy, sad, climbing, and waving animation states.

import Phaser from 'phaser';

export type CharacterState = 'idle' | 'happy' | 'sad' | 'climbing' | 'waving';

const CHARACTER_X = 100;
const CHARACTER_BASE_Y = 690;

export class Character {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private currentState: CharacterState = 'idle';
  private targetY: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.targetY = CHARACTER_BASE_Y;

    this.sprite = scene.add.sprite(CHARACTER_X, CHARACTER_BASE_Y, 'wrecker');
    this.sprite.setScale(2);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.play('wrecker-idle');
  }

  setState(state: CharacterState): void {
    if (state === this.currentState) return;
    this.currentState = state;

    const animKey = `wrecker-${state}`;
    this.sprite.play(animKey);

    if (state === 'happy' || state === 'sad') {
      this.sprite.once('animationcomplete', () => {
        this.currentState = 'idle';
        this.sprite.play('wrecker-idle');
      });
    }
  }

  climbTo(buildingTopY: number): void {
    const newY = Math.min(CHARACTER_BASE_Y, buildingTopY);

    if (Math.abs(newY - this.targetY) < 5) return;

    this.targetY = newY;
    this.setState('climbing');

    this.scene.tweens.add({
      targets: this.sprite,
      y: this.targetY,
      duration: 600,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.setState('idle');
      },
    });
  }

  celebrate(): void {
    this.setState('happy');
    this.sprite.once('animationcomplete', () => {
      this.setState('waving');
      this.scene.time.delayedCall(3000, () => {
        this.setState('idle');
      });
    });
  }

  reactToWrong(): void {
    this.setState('sad');
  }

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
