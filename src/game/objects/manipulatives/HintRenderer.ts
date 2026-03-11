// ABOUTME: Renders hint visualizations in the manipulatives workspace.
// ABOUTME: Tier 1 shows ghosted partial groups; Tier 2 animates the full solution step by step.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';
import { CompositeGroup } from './CompositeGroup';
import { CirclePiece } from './CirclePiece';
import { RectanglePiece } from './RectanglePiece';
import type { WorkspaceGrid } from './WorkspaceGrid';

export class HintRenderer {
  private scene: Phaser.Scene;
  private grid: WorkspaceGrid;
  private ghostPieces: Phaser.GameObjects.Image[] = [];
  private animationPieces: Phaser.GameObjects.Image[] = [];
  private labels: Phaser.GameObjects.Text[] = [];
  private decompositionLabel: Phaser.GameObjects.Container | null = null;
  private activeTimeline: Phaser.Time.TimerEvent[] = [];

  constructor(scene: Phaser.Scene, grid: WorkspaceGrid) {
    this.scene = scene;
    this.grid = grid;
  }

  showTier1(factorA: number, factorB: number): void {
    this.clear();

    this.ensureGhostTextures();

    const decomp = CompositeGroup.decompose(factorB);

    for (let groupIdx = 0; groupIdx < factorA; groupIdx++) {
      const row = groupIdx;
      let col = 0;

      for (let r = 0; r < decomp.fives; r++) {
        const pos = this.grid.getCellCenter(col + 2, row);
        const ghost = this.scene.add.image(pos.x, pos.y, 'ghost-rect');
        ghost.setAlpha(MANIP.GHOST_ALPHA);
        ghost.setDepth(50);
        this.ghostPieces.push(ghost);
        col += 5;
      }

      for (let c = 0; c < decomp.ones; c++) {
        const pos = this.grid.getCellCenter(col, row);
        const ghost = this.scene.add.image(pos.x, pos.y, 'ghost-circle');
        ghost.setAlpha(MANIP.GHOST_ALPHA);
        ghost.setDepth(50);
        this.ghostPieces.push(ghost);
        col += 1;
      }
    }
  }

  showTier2(factorA: number, factorB: number, onComplete: () => void): void {
    this.clear();

    const decomp = CompositeGroup.decompose(factorB);
    const product = factorA * factorB;

    this.decompositionLabel = CompositeGroup.createDecompositionLabel(
      this.scene,
      factorB,
      this.grid.getCellCenter(0, 0).x,
      this.grid.getCellCenter(0, 0).y - 40,
    );
    this.decompositionLabel.setAlpha(0);

    this.scene.tweens.add({
      targets: this.decompositionLabel,
      alpha: 1,
      duration: MANIP.HINT_FADE_DURATION,
    });

    const trayX = 65;
    const stepDelay = MANIP.COUNT_STEP_DELAY;
    let runningTotal = 0;
    const startDelay = 800;

    for (let groupIdx = 0; groupIdx < factorA; groupIdx++) {
      const groupDelay = startDelay + groupIdx * (stepDelay * (decomp.fives + decomp.ones + 1));
      let col = 0;
      let pieceIndex = 0;

      for (let r = 0; r < decomp.fives; r++) {
        const delay = groupDelay + pieceIndex * stepDelay;
        const targetPos = this.grid.getCellCenter(col + 2, groupIdx);
        const currentCol = col;

        const timer = this.scene.time.delayedCall(delay, () => {
          const piece = RectanglePiece.create(this.scene, trayX, this.grid.getCellCenter(0, groupIdx).y, false);
          piece.setAlpha(0.7);
          piece.disableInteractive();
          this.animationPieces.push(piece);

          this.scene.tweens.add({
            targets: piece,
            x: targetPos.x,
            y: targetPos.y,
            alpha: 1,
            duration: 400,
            ease: 'Quad.easeOut',
            onComplete: () => {
              piece.setData('placed', true);
              piece.setData('gridCol', currentCol);
              piece.setData('gridRow', groupIdx);
              this.grid.trackPiece(piece);
            },
          });
        });
        this.activeTimeline.push(timer);

        col += 5;
        pieceIndex++;
      }

      for (let c = 0; c < decomp.ones; c++) {
        const delay = groupDelay + pieceIndex * stepDelay;
        const currentCol = col;
        const targetPos = this.grid.getCellCenter(currentCol, groupIdx);

        const timer = this.scene.time.delayedCall(delay, () => {
          const piece = CirclePiece.create(this.scene, trayX, this.grid.getCellCenter(0, groupIdx).y, false);
          piece.setAlpha(0.7);
          piece.disableInteractive();
          this.animationPieces.push(piece);

          this.scene.tweens.add({
            targets: piece,
            x: targetPos.x,
            y: targetPos.y,
            alpha: 1,
            duration: 400,
            ease: 'Quad.easeOut',
            onComplete: () => {
              piece.setData('placed', true);
              piece.setData('gridCol', currentCol);
              piece.setData('gridRow', groupIdx);
              this.grid.trackPiece(piece);
            },
          });
        });
        this.activeTimeline.push(timer);

        col += 1;
        pieceIndex++;
      }

      runningTotal += factorB;
      const totalDelay = groupDelay + pieceIndex * stepDelay + 200;
      const currentTotal = runningTotal;

      const totalTimer = this.scene.time.delayedCall(totalDelay, () => {
        const pos = this.grid.getCellCenter(col + 1, groupIdx);
        const totalLabel = this.scene.add.text(pos.x + 10, pos.y, String(currentTotal), {
          fontSize: '16px',
          color: '#4CAF50',
          fontFamily: 'Arial',
          fontStyle: 'bold',
        }).setOrigin(0, 0.5).setAlpha(0);

        this.labels.push(totalLabel);

        this.scene.tweens.add({
          targets: totalLabel,
          alpha: 1,
          duration: 200,
        });
      });
      this.activeTimeline.push(totalTimer);
    }

    const totalPieces = decomp.fives + decomp.ones;
    const totalAnimTime = startDelay + factorA * (stepDelay * (totalPieces + 1)) + 500;

    const finalTimer = this.scene.time.delayedCall(totalAnimTime, () => {
      const centerX = this.grid.getCellCenter(Math.floor(this.grid.getColCount() / 2), 0).x;
      const bottomY = this.grid.getCellCenter(0, factorA).y + 30;

      const equation = this.scene.add.text(
        centerX,
        bottomY,
        `${factorA} \u00D7 ${factorB} = ${product}!`,
        {
          fontSize: '22px',
          color: '#4CAF50',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          stroke: '#FFFFFF',
          strokeThickness: 3,
        }
      ).setOrigin(0.5).setAlpha(0).setScale(0.5);

      this.labels.push(equation);

      this.scene.tweens.add({
        targets: equation,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.scene.tweens.add({
            targets: equation,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 300,
            yoyo: true,
            repeat: 1,
            onComplete: () => onComplete(),
          });
        },
      });
    });
    this.activeTimeline.push(finalTimer);
  }

  private ensureGhostTextures(): void {
    if (!this.scene.textures.exists('ghost-rect')) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(MANIP.GHOST_COLOR, 1);
      gfx.fillRoundedRect(0, 0, MANIP.RECT_WIDTH, MANIP.RECT_HEIGHT, 3);
      gfx.lineStyle(1.5, 0xAAAAAA, 0.8);
      gfx.strokeRoundedRect(0, 0, MANIP.RECT_WIDTH, MANIP.RECT_HEIGHT, 3);
      gfx.generateTexture('ghost-rect', MANIP.RECT_WIDTH, MANIP.RECT_HEIGHT);
      gfx.destroy();
    }

    if (!this.scene.textures.exists('ghost-circle')) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(MANIP.GHOST_COLOR, 1);
      gfx.fillCircle(MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS);
      gfx.lineStyle(1.5, 0xAAAAAA, 0.8);
      gfx.strokeCircle(MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS - 1);
      gfx.generateTexture('ghost-circle', MANIP.CIRCLE_DIAMETER, MANIP.CIRCLE_DIAMETER);
      gfx.destroy();
    }
  }

  clear(): void {
    for (const timer of this.activeTimeline) {
      timer.remove(false);
    }
    this.activeTimeline = [];

    for (const ghost of this.ghostPieces) {
      ghost.destroy();
    }
    this.ghostPieces = [];

    for (const piece of this.animationPieces) {
      piece.destroy();
    }
    this.animationPieces = [];

    for (const label of this.labels) {
      label.destroy();
    }
    this.labels = [];

    this.decompositionLabel?.destroy();
    this.decompositionLabel = null;
  }
}
