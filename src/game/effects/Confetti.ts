// ABOUTME: Confetti particle effect for level completion celebrations.
// ABOUTME: Emits colorful confetti particles that drift down across the screen.

import Phaser from 'phaser';

const CONFETTI_COLORS = [
  'confetti-red',
  'confetti-blue',
  'confetti-yellow',
  'confetti-green',
];

export function emitConfetti(scene: Phaser.Scene): void {
  const { width } = scene.cameras.main;

  for (const color of CONFETTI_COLORS) {
    const particles = scene.add.particles(0, 0, color, {
      x: { min: 0, max: width },
      y: -20,
      speedX: { min: -80, max: 80 },
      speedY: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      rotate: { min: 0, max: 360 },
      lifespan: 4000,
      quantity: 2,
      frequency: 100,
      scale: { start: 0.6, end: 0.2 },
      gravityY: 50,
      emitting: true,
    });

    scene.time.delayedCall(3000, () => {
      particles.stop();
      scene.time.delayedCall(4000, () => particles.destroy());
    });
  }
}
