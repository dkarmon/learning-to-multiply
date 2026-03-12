// ABOUTME: A draggable orange rectangle representing 5 units in the visual math model.
// ABOUTME: Width equals 5 circles; has visible dividers showing 5 sub-units.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';

export class RectanglePiece {
  private static textureGenerated = false;

  static readonly TEXTURE_KEY = 'manip-rect';
  static readonly VALUE = 5;

  static generateTexture(scene: Phaser.Scene): void {
    if (RectanglePiece.textureGenerated && scene.textures.exists(RectanglePiece.TEXTURE_KEY)) {
      return;
    }

    const w = MANIP.RECT_WIDTH;
    const h = MANIP.RECT_HEIGHT;
    const gfx = scene.add.graphics();

    gfx.fillStyle(MANIP.RECT_COLOR, 1);
    gfx.fillRoundedRect(0, 0, w, h, 3);

    gfx.lineStyle(1.5, MANIP.RECT_STROKE, 1);
    gfx.strokeRoundedRect(0, 0, w, h, 3);

    const cellW = w / 5;
    gfx.lineStyle(1, MANIP.RECT_DIVIDER, 0.7);
    for (let i = 1; i < 5; i++) {
      const lx = cellW * i;
      gfx.moveTo(lx, 3);
      gfx.lineTo(lx, h - 3);
    }
    gfx.strokePath();

    gfx.fillStyle(0xFFFFFF, 0.5);
    for (let i = 0; i < 5; i++) {
      const cx = cellW * i + cellW / 2;
      gfx.fillCircle(cx, h / 2, 2.5);
    }

    gfx.generateTexture(RectanglePiece.TEXTURE_KEY, w, h);
    gfx.destroy();
    RectanglePiece.textureGenerated = true;
  }

  static readonly HIGHLIGHT_KEY = 'manip-rect-hl';

  static generateHighlightTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(RectanglePiece.HIGHLIGHT_KEY)) return;

    const w = MANIP.RECT_WIDTH;
    const h = MANIP.RECT_HEIGHT;
    const gfx = scene.add.graphics();

    gfx.fillStyle(MANIP.HIGHLIGHT_COLOR, 1);
    gfx.fillRoundedRect(0, 0, w, h, 3);
    gfx.lineStyle(2, MANIP.RECT_COLOR, 1);
    gfx.strokeRoundedRect(0, 0, w, h, 3);

    const cellW = w / 5;
    gfx.lineStyle(1, MANIP.RECT_STROKE, 0.5);
    for (let i = 1; i < 5; i++) {
      gfx.moveTo(cellW * i, 3);
      gfx.lineTo(cellW * i, h - 3);
    }
    gfx.strokePath();

    gfx.fillStyle(0xFFFFFF, 0.5);
    for (let i = 0; i < 5; i++) {
      gfx.fillCircle(cellW * i + cellW / 2, h / 2, 2.5);
    }

    gfx.generateTexture(RectanglePiece.HIGHLIGHT_KEY, w, h);
    gfx.destroy();
  }

  static create(scene: Phaser.Scene, x: number, y: number, fromTray = true): Phaser.GameObjects.Image {
    RectanglePiece.generateTexture(scene);

    const img = scene.add.image(x, y, RectanglePiece.TEXTURE_KEY);

    const hitPad = MANIP.GRAB_PADDING;
    img.setInteractive(
      new Phaser.Geom.Rectangle(
        -hitPad,
        -hitPad,
        MANIP.RECT_WIDTH + hitPad * 2,
        MANIP.RECT_HEIGHT + hitPad * 2
      ),
      Phaser.Geom.Rectangle.Contains,
    );
    scene.input.setDraggable(img);

    img.setData('pieceType', 'rectangle');
    img.setData('pieceValue', RectanglePiece.VALUE);
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
    RectanglePiece.generateHighlightTexture(scene);
    img.setTexture(RectanglePiece.HIGHLIGHT_KEY);
    scene.time.delayedCall(duration, () => {
      if (img.active) {
        img.setTexture(RectanglePiece.TEXTURE_KEY);
      }
    });
  }
}
