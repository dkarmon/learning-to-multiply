// ABOUTME: Brick debris particle effect for wrong-answer feedback.
// ABOUTME: Spawns small brick fragments that fall with gravity.

import Phaser from 'phaser';

export function emitBrickDebris(
  scene: Phaser.Scene,
  x: number,
  y: number,
): void {
  const particles = scene.add.particles(x, y, 'particles', {
    frame: ['debris-0', 'debris-1', 'debris-2', 'debris-3', 'debris-4'],
    speed: { min: 50, max: 200 },
    angle: { min: 200, max: 340 },
    lifespan: { min: 400, max: 800 },
    quantity: 12,
    scale: { start: 0.6, end: 0 },
    gravityY: 500,
    rotate: { min: 0, max: 360 },
    emitting: false,
  });

  particles.explode();

  scene.time.delayedCall(1200, () => particles.destroy());
}
