// ABOUTME: A draggable blue circle representing 1 unit in the visual math model.
// ABOUTME: Drawn programmatically with Phaser Graphics, supports drag-and-drop.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';

export class CirclePiece {
  private static textureGenerated = false;

  static readonly TEXTURE_KEY = 'manip-circle';
  static readonly VALUE = 1;

  static generateTexture(scene: Phaser.Scene): void {
    if (CirclePiece.textureGenerated && scene.textures.exists(CirclePiece.TEXTURE_KEY)) {
      return;
    }

    const diameter = MANIP.CIRCLE_DIAMETER;
    const r = MANIP.CIRCLE_RADIUS;
    const gfx = scene.add.graphics();

    gfx.fillStyle(MANIP.CIRCLE_COLOR, 1);
    gfx.fillCircle(r, r, r);

    gfx.lineStyle(1.5, MANIP.CIRCLE_STROKE, 1);
    gfx.strokeCircle(r, r, r - 1);

    gfx.fillStyle(0xFFFFFF, 0.6);
    gfx.fillCircle(r, r, 3);

    gfx.generateTexture(CirclePiece.TEXTURE_KEY, diameter, diameter);
    gfx.destroy();
    CirclePiece.textureGenerated = true;
  }

  static readonly HIGHLIGHT_KEY = 'manip-circle-hl';

  static generateHighlightTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(CirclePiece.HIGHLIGHT_KEY)) return;

    const diameter = MANIP.CIRCLE_DIAMETER;
    const r = MANIP.CIRCLE_RADIUS;
    const gfx = scene.add.graphics();

    gfx.fillStyle(MANIP.HIGHLIGHT_COLOR, 1);
    gfx.fillCircle(r, r, r);
    gfx.lineStyle(2, MANIP.CIRCLE_COLOR, 1);
    gfx.strokeCircle(r, r, r - 1);
    gfx.fillStyle(0xFFFFFF, 0.6);
    gfx.fillCircle(r, r, 3);

    gfx.generateTexture(CirclePiece.HIGHLIGHT_KEY, diameter, diameter);
    gfx.destroy();
  }

  static create(scene: Phaser.Scene, x: number, y: number, fromTray = true): Phaser.GameObjects.Image {
    CirclePiece.generateTexture(scene);

    const img = scene.add.image(x, y, CirclePiece.TEXTURE_KEY);

    const hitPad = MANIP.GRAB_PADDING;
    const hitSize = MANIP.CIRCLE_DIAMETER + hitPad * 2;
    img.setInteractive(
      new Phaser.Geom.Rectangle(-hitPad, -hitPad, hitSize, hitSize),
      Phaser.Geom.Rectangle.Contains,
    );
    scene.input.setDraggable(img);

    img.setData('pieceType', 'circle');
    img.setData('pieceValue', CirclePiece.VALUE);
    img.setData('fromTray', fromTray);
    img.setData('placed', false);
    img.setData('originX', x);
    img.setData('originY', y);
    img.setData('gridCol', -1);
    img.setData('gridRow', -1);
    img.setData('wasDragged', false);

    return img;
  }

  static highlight(scene: Phaser.Scene, img: Phaser.GameObjects.Image, duration = 300): void {
    CirclePiece.generateHighlightTexture(scene);
    img.setTexture(CirclePiece.HIGHLIGHT_KEY);
    scene.time.delayedCall(duration, () => {
      if (img.active) {
        img.setTexture(CirclePiece.TEXTURE_KEY);
      }
    });
  }
}
