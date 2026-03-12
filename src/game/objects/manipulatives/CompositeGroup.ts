// ABOUTME: Represents a composite number as a group of rectangles and circles.
// ABOUTME: Decomposes any number into optimal 5s + 1s (e.g., 7 = one rect + two circles).

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';
import { CirclePiece } from './CirclePiece';
import { RectanglePiece } from './RectanglePiece';
import type { WorkspaceGrid } from './WorkspaceGrid';
import { decompose, widthInCells } from './decompose';
import type { Decomposition } from './decompose';

export type { Decomposition };

export class CompositeGroup {
  static decompose(n: number): Decomposition {
    return decompose(n);
  }

  static widthInCells(decomp: Decomposition): number {
    return widthInCells(decomp);
  }

  static placeGroup(
    scene: Phaser.Scene,
    grid: WorkspaceGrid,
    value: number,
    startCol: number,
    row: number,
    interactive = true,
  ): Phaser.GameObjects.Image[] {
    const decomp = CompositeGroup.decompose(value);
    const pieces: Phaser.GameObjects.Image[] = [];
    let col = startCol;

    for (let i = 0; i < decomp.fives; i++) {
      const cellCenter = grid.getCellCenter(col + 2, row);
      const piece = RectanglePiece.create(scene, cellCenter.x, cellCenter.y, false);
      piece.setData('placed', true);
      piece.setData('gridCol', col);
      piece.setData('gridRow', row);

      if (!interactive) {
        piece.disableInteractive();
      }

      grid.trackPiece(piece);
      pieces.push(piece);
      col += 5;
    }

    for (let i = 0; i < decomp.ones; i++) {
      const cellCenter = grid.getCellCenter(col, row);
      const piece = CirclePiece.create(scene, cellCenter.x, cellCenter.y, false);
      piece.setData('placed', true);
      piece.setData('gridCol', col);
      piece.setData('gridRow', row);

      if (!interactive) {
        piece.disableInteractive();
      }

      grid.trackPiece(piece);
      pieces.push(piece);
      col += 1;
    }

    return pieces;
  }

  static createDecompositionLabel(
    scene: Phaser.Scene,
    value: number,
    x: number,
    y: number,
  ): Phaser.GameObjects.Container {
    const decomp = CompositeGroup.decompose(value);
    const container = scene.add.container(x, y);

    const text = scene.add.text(0, 0, `${value} = `, {
      fontSize: MANIP.DECOMPOSITION_FONT_SIZE,
      color: '#333333',
      fontFamily: 'Arial',
    }).setOrigin(0, 0.5);
    container.add(text);

    let offsetX = text.width + 4;

    for (let i = 0; i < decomp.fives; i++) {
      const miniRect = scene.add.rectangle(
        offsetX + 20, 0, 40, 14,
        MANIP.RECT_COLOR
      ).setStrokeStyle(1, MANIP.RECT_STROKE);
      container.add(miniRect);
      offsetX += 44;
    }

    for (let i = 0; i < decomp.ones; i++) {
      const miniCircle = scene.add.circle(
        offsetX + 7, 0, 7,
        MANIP.CIRCLE_COLOR
      ).setStrokeStyle(1, MANIP.CIRCLE_STROKE);
      container.add(miniCircle);
      offsetX += 18;
    }

    return container;
  }
}
