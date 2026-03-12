// ABOUTME: Draws a dotted border around a group of pieces in the workspace.
// ABOUTME: Shows group labels ("Group 1", "Group 2") above each outlined region.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';

export interface GroupBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  groupIndex: number;
  value: number;
}

export class GroupOutline {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private labels: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(100);
  }

  drawGroups(groups: GroupBounds[]): void {
    this.clear();

    this.graphics.lineStyle(2, MANIP.GROUP_OUTLINE_COLOR, 0.6);

    for (const group of groups) {
      const pad = MANIP.GROUP_PADDING;
      const x = group.x - pad;
      const y = group.y - pad;
      const w = group.width + pad * 2;
      const h = group.height + pad * 2;

      this.drawDashedRect(x, y, w, h, 4, 4);

      const label = this.scene.add.text(
        x + w / 2,
        y - 10,
        `Group ${group.groupIndex + 1}`,
        {
          fontSize: MANIP.GROUP_LABEL_FONT_SIZE,
          color: '#888888',
          fontFamily: 'Arial',
        }
      ).setOrigin(0.5, 1);
      this.labels.push(label);
    }
  }

  private drawDashedRect(x: number, y: number, w: number, h: number, dash: number, gap: number): void {
    this.drawDashedLine(x, y, x + w, y, dash, gap);
    this.drawDashedLine(x + w, y, x + w, y + h, dash, gap);
    this.drawDashedLine(x + w, y + h, x, y + h, dash, gap);
    this.drawDashedLine(x, y + h, x, y, dash, gap);
  }

  private drawDashedLine(x1: number, y1: number, x2: number, y2: number, dash: number, gap: number): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len;
    const ny = dy / len;

    let drawn = 0;
    let drawing = true;

    while (drawn < len) {
      const segLen = drawing ? dash : gap;
      const endDist = Math.min(drawn + segLen, len);

      if (drawing) {
        this.graphics.moveTo(x1 + nx * drawn, y1 + ny * drawn);
        this.graphics.lineTo(x1 + nx * endDist, y1 + ny * endDist);
        this.graphics.strokePath();
      }

      drawn = endDist;
      drawing = !drawing;
    }
  }

  clear(): void {
    this.graphics.clear();
    this.graphics.lineStyle(2, MANIP.GROUP_OUTLINE_COLOR, 0.6);
    for (const label of this.labels) {
      label.destroy();
    }
    this.labels = [];
  }

  destroy(): void {
    this.clear();
    this.graphics.destroy();
  }
}
