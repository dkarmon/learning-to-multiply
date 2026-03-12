// ABOUTME: A translucent ghost showing where a dragged piece will snap when released.
// ABOUTME: Follows the nearest grid position during drag.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';

export class GhostPiece {
  private scene: Phaser.Scene;
  private circleGhost: Phaser.GameObjects.Image | null = null;
  private rectGhost: Phaser.GameObjects.Image | null = null;

  private static circleGhostKey = 'ghost-circle';
  private static rectGhostKey = 'ghost-rect';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.generateTextures();
  }

  private generateTextures(): void {
    if (!this.scene.textures.exists(GhostPiece.circleGhostKey)) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(MANIP.GHOST_COLOR, 1);
      gfx.fillCircle(MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS);
      gfx.lineStyle(1, 0xAAAAAA, 1);
      gfx.strokeCircle(MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS - 1);
      gfx.generateTexture(GhostPiece.circleGhostKey, MANIP.CIRCLE_DIAMETER, MANIP.CIRCLE_DIAMETER);
      gfx.destroy();
    }

    if (!this.scene.textures.exists(GhostPiece.rectGhostKey)) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(MANIP.GHOST_COLOR, 1);
      gfx.fillRoundedRect(0, 0, MANIP.RECT_WIDTH, MANIP.RECT_HEIGHT, 3);
      gfx.lineStyle(1, 0xAAAAAA, 1);
      gfx.strokeRoundedRect(0, 0, MANIP.RECT_WIDTH, MANIP.RECT_HEIGHT, 3);
      gfx.generateTexture(GhostPiece.rectGhostKey, MANIP.RECT_WIDTH, MANIP.RECT_HEIGHT);
      gfx.destroy();
    }
  }

  show(x: number, y: number, type: 'circle' | 'rectangle'): void {
    this.hide();

    if (type === 'circle') {
      this.circleGhost = this.scene.add.image(x, y, GhostPiece.circleGhostKey);
      this.circleGhost.setAlpha(MANIP.GHOST_ALPHA);
      this.circleGhost.setDepth(500);
    } else {
      this.rectGhost = this.scene.add.image(x, y, GhostPiece.rectGhostKey);
      this.rectGhost.setAlpha(MANIP.GHOST_ALPHA);
      this.rectGhost.setDepth(500);
    }
  }

  hide(): void {
    this.circleGhost?.destroy();
    this.circleGhost = null;
    this.rectGhost?.destroy();
    this.rectGhost = null;
  }
}
