// ABOUTME: The parts tray on the left side of the manipulatives workspace.
// ABOUTME: Contains unlimited circles and rectangles that replenish when dragged out.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';
import { CirclePiece } from './CirclePiece';
import { RectanglePiece } from './RectanglePiece';
import { t } from '../../i18n';

export class PieceTray {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  private circlePiece: Phaser.GameObjects.Image | null = null;
  private rectanglePiece: Phaser.GameObjects.Image | null = null;

  private selectedType: 'circle' | 'rectangle' | null = null;
  private selectionIndicator: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.createBackground();
    this.createLabels();
    this.spawnCircle();
    this.spawnRectangle();
  }

  private createBackground(): void {
    const bg = this.scene.add.rectangle(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width,
      this.height,
      MANIP.TRAY_BG,
    );
    bg.setStrokeStyle(1, 0xCCCCCC);
  }

  private createLabels(): void {
    const centerX = this.x + this.width / 2;

    this.scene.add.text(centerX, this.y + 15, t('game.pieces'), {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.scene.add.text(centerX, this.y + 85, '= 1', {
      fontSize: '13px',
      color: '#1976D2',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.scene.add.text(centerX, this.y + 165, '= 5', {
      fontSize: '13px',
      color: '#F57C00',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.scene.add.text(centerX, this.y + this.height - 30, t('game.dragToWorkspace'), {
      fontSize: '11px',
      color: '#999999',
      fontFamily: 'Arial',
      align: 'center',
    }).setOrigin(0.5);
  }

  private spawnCircle(): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + 55;
    this.circlePiece = CirclePiece.create(this.scene, cx, cy, true);

    this.circlePiece.on('pointerup', () => {
      if (!this.circlePiece?.getData('wasDragged')) {
        this.onTrayPieceTapped('circle');
      }
    });
  }

  private spawnRectangle(): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + 135;
    this.rectanglePiece = RectanglePiece.create(this.scene, cx, cy, true);

    this.rectanglePiece.on('pointerup', () => {
      if (!this.rectanglePiece?.getData('wasDragged')) {
        this.onTrayPieceTapped('rectangle');
      }
    });
  }

  private onTrayPieceTapped(type: 'circle' | 'rectangle'): void {
    if (this.selectedType === type) {
      this.selectedType = null;
      this.clearSelectionIndicator();
    } else {
      this.selectedType = type;
      this.showSelectionIndicator(type);
    }
  }

  private showSelectionIndicator(type: 'circle' | 'rectangle'): void {
    this.clearSelectionIndicator();
    this.selectionIndicator = this.scene.add.graphics();
    this.selectionIndicator.lineStyle(2, 0x4CAF50, 1);

    const cx = this.x + this.width / 2;
    if (type === 'circle') {
      this.selectionIndicator.strokeCircle(cx, this.y + 55, MANIP.CIRCLE_RADIUS + 5);
    } else {
      this.selectionIndicator.strokeRoundedRect(
        cx - MANIP.RECT_WIDTH / 2 - 5,
        this.y + 135 - MANIP.RECT_HEIGHT / 2 - 5,
        MANIP.RECT_WIDTH + 10,
        MANIP.RECT_HEIGHT + 10,
        5,
      );
    }
  }

  private clearSelectionIndicator(): void {
    this.selectionIndicator?.destroy();
    this.selectionIndicator = null;
  }

  getSelectedType(): 'circle' | 'rectangle' | null {
    return this.selectedType;
  }

  clearSelection(): void {
    this.selectedType = null;
    this.clearSelectionIndicator();
  }

  replenish(type: 'circle' | 'rectangle'): void {
    if (type === 'circle') {
      this.spawnCircle();
    } else {
      this.spawnRectangle();
    }
  }

  destroy(): void {
    this.circlePiece?.destroy();
    this.rectanglePiece?.destroy();
    this.clearSelectionIndicator();
  }
}
