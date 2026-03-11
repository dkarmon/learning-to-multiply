// ABOUTME: Shows the correct answer decomposed into visual pieces after a correct response.
// ABOUTME: Reinforces the visual model by showing e.g. 17 = 3 rectangles + 2 circles.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';
import { CompositeGroup } from './CompositeGroup';
import { CirclePiece } from './CirclePiece';
import { RectanglePiece } from './RectanglePiece';
import type { WorkspaceGrid } from './WorkspaceGrid';

export class AnswerVisualizer {
  private scene: Phaser.Scene;
  private grid: WorkspaceGrid;
  private pieces: Phaser.GameObjects.Image[] = [];
  private labels: Phaser.GameObjects.Text[] = [];
  private containers: Phaser.GameObjects.Container[] = [];
  private activeTimers: Phaser.Time.TimerEvent[] = [];

  constructor(scene: Phaser.Scene, grid: WorkspaceGrid) {
    this.scene = scene;
    this.grid = grid;
  }

  show(answer: number, onComplete: () => void): void {
    this.clear();

    const decomp = CompositeGroup.decompose(answer);

    const topCenter = this.grid.getCellCenter(Math.floor(this.grid.getColCount() / 2), 0);
    const decompLabel = CompositeGroup.createDecompositionLabel(
      this.scene,
      answer,
      topCenter.x,
      topCenter.y - 30,
    );
    decompLabel.setAlpha(0);
    this.containers.push(decompLabel);

    this.scene.tweens.add({
      targets: decompLabel,
      alpha: 1,
      duration: 300,
    });

    const row = 1;
    let col = 0;
    let pieceIndex = 0;
    let runningValue = 0;
    const stepDelay = 300;
    const startDelay = 500;

    for (let i = 0; i < decomp.fives; i++) {
      const currentCol = col;
      const currentIdx = pieceIndex;
      const delay = startDelay + currentIdx * stepDelay;

      const timer = this.scene.time.delayedCall(delay, () => {
        const pos = this.grid.getCellCenter(currentCol + 2, row);
        const piece = RectanglePiece.create(this.scene, pos.x, pos.y + 20, false);
        piece.setAlpha(0);
        piece.disableInteractive();
        this.pieces.push(piece);

        this.scene.tweens.add({
          targets: piece,
          alpha: 1,
          y: pos.y,
          duration: 250,
          ease: 'Back.easeOut',
        });

        runningValue += 5;
        this.showValuePop(pos.x, pos.y - 20, runningValue);
      });
      this.activeTimers.push(timer);

      col += 5;
      pieceIndex++;
    }

    for (let i = 0; i < decomp.ones; i++) {
      const currentCol = col;
      const currentIdx = pieceIndex;
      const delay = startDelay + currentIdx * stepDelay;

      const timer = this.scene.time.delayedCall(delay, () => {
        const pos = this.grid.getCellCenter(currentCol, row);
        const piece = CirclePiece.create(this.scene, pos.x, pos.y + 20, false);
        piece.setAlpha(0);
        piece.disableInteractive();
        this.pieces.push(piece);

        this.scene.tweens.add({
          targets: piece,
          alpha: 1,
          y: pos.y,
          duration: 250,
          ease: 'Back.easeOut',
        });

        runningValue += 1;
        this.showValuePop(pos.x, pos.y - 20, runningValue);
      });
      this.activeTimers.push(timer);

      col += 1;
      pieceIndex++;
    }

    const totalTime = startDelay + pieceIndex * stepDelay + 600;
    const finalTimer = this.scene.time.delayedCall(totalTime, () => {
      onComplete();
    });
    this.activeTimers.push(finalTimer);
  }

  private showValuePop(x: number, y: number, value: number): void {
    for (const label of this.labels) {
      label.destroy();
    }
    this.labels = [];

    const pop = this.scene.add.text(x, y, String(value), {
      fontSize: '18px',
      color: '#333333',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    this.labels.push(pop);

    this.scene.tweens.add({
      targets: pop,
      alpha: 1,
      y: y - 8,
      duration: 200,
      ease: 'Quad.easeOut',
    });
  }

  clear(): void {
    for (const timer of this.activeTimers) {
      timer.remove(false);
    }
    this.activeTimers = [];

    for (const piece of this.pieces) {
      piece.destroy();
    }
    this.pieces = [];

    for (const label of this.labels) {
      label.destroy();
    }
    this.labels = [];

    for (const container of this.containers) {
      container.destroy();
    }
    this.containers = [];
  }
}
