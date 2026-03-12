// ABOUTME: Renders a single row of bricks representing one answered question.
// ABOUTME: Handles stacking animation (bricks appear one by one) and crumble effects.

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';

export const BRICK_WIDTH = 16;
export const BRICK_HEIGHT = 12;
const MAX_VISUAL_BRICKS = 20;

export class BrickRow {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bricks: Phaser.GameObjects.Image[] = [];
  readonly brickCount: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    brickCount: number,
  ) {
    this.scene = scene;
    this.brickCount = brickCount;
    this.container = scene.add.container(x, y);
  }

  async animateStacking(): Promise<void> {
    const visualCount = Math.min(this.brickCount, MAX_VISUAL_BRICKS);
    const totalWidth = visualCount * BRICK_WIDTH;
    const startX = -totalWidth / 2;

    for (let i = 0; i < visualCount; i++) {
      const frameIndex = i % 3 === 0 ? 1 : 0;
      const brick = this.scene.add.image(
        startX + i * BRICK_WIDTH + BRICK_WIDTH / 2,
        -20,
        'bricks',
        frameIndex,
      );
      brick.setDisplaySize(BRICK_WIDTH, BRICK_HEIGHT);
      brick.setAlpha(0);

      this.container.add(brick);
      this.bricks.push(brick);

      await new Promise<void>((resolve) => {
        this.scene.tweens.add({
          targets: brick,
          y: 0,
          alpha: 1,
          duration: 80,
          delay: i * 30,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            EventBus.emit(GameEvents.BRICK_PLACED);
            resolve();
          },
        });
      });
    }

    if (this.brickCount > MAX_VISUAL_BRICKS) {
      const label = this.scene.add.text(0, 0, `${this.brickCount}`, {
        fontFamily: 'Arial Black',
        fontSize: '10px',
        color: '#ffffff',
      });
      label.setOrigin(0.5);
      this.container.add(label);
    }
  }

  animateCrumble(): void {
    const crumbleCount = Math.min(3, this.bricks.length);
    const bricksToRemove = this.bricks.splice(-crumbleCount, crumbleCount);

    for (const brick of bricksToRemove) {
      const worldPos = this.container.getWorldTransformMatrix();
      const wx = worldPos.tx + brick.x;
      const wy = worldPos.ty + brick.y;

      this.container.remove(brick);
      brick.setPosition(wx, wy);
      this.scene.children.add(brick);

      this.scene.physics.add.existing(brick);
      const body = brick.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-200, -50),
      );
      body.setAngularVelocity(Phaser.Math.Between(-300, 300));

      this.scene.tweens.add({
        targets: brick,
        alpha: 0,
        duration: 800,
        delay: 200,
        onComplete: () => brick.destroy(),
      });
    }

    this.emitDebris();
  }

  private emitDebris(): void {
    const worldPos = this.container.getWorldTransformMatrix();

    const particles = this.scene.add.particles(
      worldPos.tx, worldPos.ty, 'particles',
      {
        frame: ['debris-0', 'debris-1', 'debris-2', 'debris-3', 'debris-4'],
        speed: { min: 50, max: 150 },
        angle: { min: 220, max: 320 },
        lifespan: 600,
        quantity: 8,
        scale: { start: 0.5, end: 0 },
        gravityY: 400,
        emitting: false,
      },
    );
    particles.explode();

    this.scene.time.delayedCall(1000, () => particles.destroy());
  }

  getHeight(): number {
    return BRICK_HEIGHT;
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  destroy(): void {
    this.container.destroy();
  }
}
