// ABOUTME: Manages the building-up mode for derived fact scaffolding.
// ABOUTME: Shows previous groups and highlights the staging area for the next group.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';
import { CompositeGroup } from './CompositeGroup';
import type { WorkspaceGrid } from './WorkspaceGrid';
import { GroupOutline } from './GroupOutline';
import { ManipulativeEvents, MANIP_EVENTS } from '../../events/ManipulativeEvents';

export class BuildUpManager {
  private scene: Phaser.Scene;
  private grid: WorkspaceGrid;
  private groupOutline: GroupOutline;

  private existingPieces: Phaser.GameObjects.Image[] = [];
  private labels: Phaser.GameObjects.Text[] = [];
  private promptLabel: Phaser.GameObjects.Text | null = null;
  private ghostGraphics: Phaser.GameObjects.Graphics | null = null;
  private isActive = false;
  private totalChangedHandler: ((payload: { total: number }) => void) | null = null;

  constructor(scene: Phaser.Scene, grid: WorkspaceGrid) {
    this.scene = scene;
    this.grid = grid;
    this.groupOutline = new GroupOutline(scene);
  }

  start(factorA: number, factorB: number, previousGroups: number): void {
    this.reset();
    this.isActive = true;

    const decomp = CompositeGroup.decompose(factorB);
    const groupWidthCells = CompositeGroup.widthInCells(decomp);
    const cellUnit = MANIP.CELL_SIZE + MANIP.CELL_GAP;

    for (let g = 0; g < previousGroups; g++) {
      const pieces = CompositeGroup.placeGroup(this.scene, this.grid, factorB, 0, g, false);
      for (const piece of pieces) {
        piece.setAlpha(0.7);
      }
      this.existingPieces.push(...pieces);
    }

    const groupBounds = [];
    for (let g = 0; g < previousGroups; g++) {
      const topLeft = this.grid.getCellCenter(0, g);
      groupBounds.push({
        x: topLeft.x - MANIP.CELL_SIZE / 2,
        y: topLeft.y - MANIP.CELL_SIZE / 2,
        width: groupWidthCells * cellUnit,
        height: MANIP.CELL_SIZE,
        groupIndex: g,
        value: factorB,
      });
    }
    this.groupOutline.drawGroups(groupBounds);

    const existingTotal = previousGroups * factorB;
    const totalPos = this.grid.getCellCenter(groupWidthCells + 1, Math.floor(previousGroups / 2));
    const totalLabel = this.scene.add.text(totalPos.x + 20, totalPos.y, String(existingTotal), {
      fontSize: '20px',
      color: '#666666',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.labels.push(totalLabel);

    const newGroupRow = previousGroups;
    const promptPos = this.grid.getCellCenter(0, newGroupRow);

    const ghostPos = {
      x: promptPos.x - MANIP.CELL_SIZE / 2 - MANIP.GROUP_PADDING,
      y: promptPos.y - MANIP.CELL_SIZE / 2 - MANIP.GROUP_PADDING,
      width: groupWidthCells * cellUnit + MANIP.GROUP_PADDING * 2,
      height: MANIP.CELL_SIZE + MANIP.GROUP_PADDING * 2,
    };

    this.ghostGraphics = this.scene.add.graphics();
    this.ghostGraphics.lineStyle(2, 0x4CAF50, 0.5);
    this.ghostGraphics.strokeRoundedRect(ghostPos.x, ghostPos.y, ghostPos.width, ghostPos.height, 4);

    this.scene.tweens.add({
      targets: this.ghostGraphics,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    this.promptLabel = this.scene.add.text(
      ghostPos.x + ghostPos.width / 2,
      ghostPos.y - 12,
      `Add one more group of ${factorB}!`,
      {
        fontSize: '14px',
        color: '#4CAF50',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5, 1);

    const targetTotal = factorA * factorB;
    this.totalChangedHandler = (payload: { total: number }) => {
      if (payload.total >= targetTotal && this.isActive) {
        this.promptLabel?.destroy();
        this.promptLabel = null;

        const newTotalLabel = this.scene.add.text(
          totalPos.x + 20,
          totalPos.y + 30,
          `\u2192 ${targetTotal}`,
          {
            fontSize: '20px',
            color: '#4CAF50',
            fontFamily: 'Arial',
            fontStyle: 'bold',
          }
        ).setOrigin(0, 0.5).setAlpha(0);

        this.labels.push(newTotalLabel);

        this.scene.tweens.add({
          targets: newTotalLabel,
          alpha: 1,
          duration: 300,
          ease: 'Quad.easeOut',
        });

        if (this.totalChangedHandler) {
          ManipulativeEvents.off(MANIP_EVENTS.TOTAL_CHANGED, this.totalChangedHandler);
          this.totalChangedHandler = null;
        }
      }
    };

    ManipulativeEvents.on(MANIP_EVENTS.TOTAL_CHANGED, this.totalChangedHandler);
  }

  reset(): void {
    this.isActive = false;

    if (this.totalChangedHandler) {
      ManipulativeEvents.off(MANIP_EVENTS.TOTAL_CHANGED, this.totalChangedHandler);
      this.totalChangedHandler = null;
    }

    for (const piece of this.existingPieces) {
      piece.destroy();
    }
    this.existingPieces = [];

    for (const label of this.labels) {
      label.destroy();
    }
    this.labels = [];

    this.promptLabel?.destroy();
    this.promptLabel = null;

    this.ghostGraphics?.destroy();
    this.ghostGraphics = null;

    this.groupOutline.clear();
  }
}
