// ABOUTME: The workspace area where children place pieces to build multiplication groups.
// ABOUTME: Implements snap-to-grid placement and tracks placed pieces for total calculation.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';

export interface SnapPosition {
  x: number;
  y: number;
  col: number;
  row: number;
}

interface PlacedPiece {
  gameObject: Phaser.GameObjects.GameObject;
  col: number;
  row: number;
  value: number;
  widthInCells: number;
}

export class WorkspaceGrid {
  private scene: Phaser.Scene;
  private originX: number;
  private originY: number;
  private width: number;
  private height: number;
  private cols: number;
  private rows: number;

  private placedPieces: PlacedPiece[] = [];
  private occupiedCells: Set<string> = new Set();

  private gridGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.scene = scene;
    this.originX = x;
    this.originY = y;
    this.width = width;
    this.height = height;

    const cellUnit = MANIP.CELL_SIZE + MANIP.CELL_GAP;
    this.cols = Math.floor(width / cellUnit);
    this.rows = Math.floor(height / cellUnit);

    this.gridGraphics = scene.add.graphics();
    this.drawGrid();
  }

  private drawGrid(): void {
    this.gridGraphics.clear();

    const cellUnit = MANIP.CELL_SIZE + MANIP.CELL_GAP;

    this.gridGraphics.fillStyle(0xDDDDDD, 0.5);
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cx = this.originX + col * cellUnit + MANIP.CELL_SIZE / 2;
        const cy = this.originY + row * cellUnit + MANIP.CELL_SIZE / 2;
        this.gridGraphics.fillCircle(cx, cy, 1.5);
      }
    }
  }

  nearestSnapPosition(px: number, py: number): SnapPosition | null {
    const cellUnit = MANIP.CELL_SIZE + MANIP.CELL_GAP;

    const col = Math.round((px - this.originX - MANIP.CELL_SIZE / 2) / cellUnit);
    const row = Math.round((py - this.originY - MANIP.CELL_SIZE / 2) / cellUnit);

    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return null;
    }

    const snapX = this.originX + col * cellUnit + MANIP.CELL_SIZE / 2;
    const snapY = this.originY + row * cellUnit + MANIP.CELL_SIZE / 2;

    const dist = Phaser.Math.Distance.Between(px, py, snapX, snapY);
    if (dist > MANIP.SNAP_THRESHOLD * 2) {
      return null;
    }

    return { x: snapX, y: snapY, col, row };
  }

  isInsideBounds(px: number, py: number): boolean {
    return (
      px >= this.originX &&
      px <= this.originX + this.width &&
      py >= this.originY &&
      py <= this.originY + this.height
    );
  }

  trackPiece(gameObject: Phaser.GameObjects.GameObject): void {
    const col = gameObject.getData('gridCol') as number;
    const row = gameObject.getData('gridRow') as number;
    const value = gameObject.getData('pieceValue') as number;
    const type = gameObject.getData('pieceType') as 'circle' | 'rectangle';
    const widthInCells = type === 'rectangle' ? 5 : 1;

    const piece: PlacedPiece = { gameObject, col, row, value, widthInCells };
    this.placedPieces.push(piece);

    for (let c = 0; c < widthInCells; c++) {
      this.occupiedCells.add(`${col + c},${row}`);
    }
  }

  untrackPiece(gameObject: Phaser.GameObjects.GameObject): void {
    const idx = this.placedPieces.findIndex(p => p.gameObject === gameObject);
    if (idx === -1) return;

    const piece = this.placedPieces[idx];
    for (let c = 0; c < piece.widthInCells; c++) {
      this.occupiedCells.delete(`${piece.col + c},${piece.row}`);
    }
    this.placedPieces.splice(idx, 1);
  }

  calculateTotal(): number {
    return this.placedPieces.reduce((sum, p) => sum + p.value, 0);
  }

  getPlacedPieces(): readonly PlacedPiece[] {
    return this.placedPieces;
  }

  getCellCenter(col: number, row: number): { x: number; y: number } {
    const cellUnit = MANIP.CELL_SIZE + MANIP.CELL_GAP;
    return {
      x: this.originX + col * cellUnit + MANIP.CELL_SIZE / 2,
      y: this.originY + row * cellUnit + MANIP.CELL_SIZE / 2,
    };
  }

  getColCount(): number {
    return this.cols;
  }

  getRowCount(): number {
    return this.rows;
  }

  clear(): void {
    for (const piece of this.placedPieces) {
      if (piece.gameObject.active) {
        piece.gameObject.destroy();
      }
    }
    this.placedPieces = [];
    this.occupiedCells.clear();
  }

  destroy(): void {
    this.clear();
    this.gridGraphics.destroy();
  }
}
