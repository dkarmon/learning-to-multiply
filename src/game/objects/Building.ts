// ABOUTME: Renders the building as a stack of BrickRows, one per answered question.
// ABOUTME: Manages floor progression, window characters, and wobble animation.

import Phaser from 'phaser';
import { BrickRow, BRICK_HEIGHT } from './BrickRow';

interface WindowCharacterConfig {
  floor: number;
  spriteKey: string;
  animKey: string;
}

const WINDOW_CHARACTERS: WindowCharacterConfig[] = [
  { floor: 2, spriteKey: 'fixer', animKey: 'fixer-waving' },
  { floor: 4, spriteKey: 'sidekick', animKey: 'sidekick-silly' },
  { floor: 6, spriteKey: 'fixer', animKey: 'fixer-idle' },
  { floor: 8, spriteKey: 'sidekick', animKey: 'sidekick-idle' },
];

const BUILDING_X = 280;
const BUILDING_BASE_Y = 690;
const FOUNDATION_HEIGHT = 80;
const ROW_GAP = 2;

export class Building {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private rows: BrickRow[] = [];
  private windowSprites: Phaser.GameObjects.Sprite[] = [];
  private totalHeight: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(BUILDING_X, BUILDING_BASE_Y);

    const foundation = scene.add.rectangle(
      0, 0,
      384, FOUNDATION_HEIGHT,
      0x8b4513,
    );
    foundation.setOrigin(0.5, 1);
    foundation.setStrokeStyle(2, 0x3c0f0f);
    this.container.add(foundation);

    const door = scene.add.image(0, -4, 'building', 'door-ornate');
    door.setDisplaySize(60, 72);
    door.setOrigin(0.5, 1);
    this.container.add(door);

    this.totalHeight = FOUNDATION_HEIGHT;
  }

  async addRow(brickCount: number): Promise<void> {
    const rowY = -(this.totalHeight + ROW_GAP);

    const row = new BrickRow(this.scene, 0, rowY, brickCount);
    this.container.add(row.getContainer());
    this.rows.push(row);

    await row.animateStacking();

    this.totalHeight += BRICK_HEIGHT + ROW_GAP;

    this.checkWindowCharacters();
    this.adjustCamera();
  }

  async addBonusRow(bonusBricks: number): Promise<void> {
    if (bonusBricks <= 0) return;

    const rowY = -(this.totalHeight + ROW_GAP);

    const row = new BrickRow(this.scene, 0, rowY, bonusBricks);
    this.container.add(row.getContainer());
    this.rows.push(row);

    await row.animateStacking();

    this.totalHeight += BRICK_HEIGHT + ROW_GAP;
  }

  wobble(crumble: boolean = false): void {
    this.scene.tweens.add({
      targets: this.container,
      x: this.container.x - 6,
      duration: 50,
      yoyo: true,
      repeat: 5,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.container.x = BUILDING_X;
      },
    });

    if (crumble && this.rows.length > 0) {
      const topRow = this.rows[this.rows.length - 1];
      topRow.animateCrumble();
    }
  }

  private checkWindowCharacters(): void {
    const floorNumber = this.rows.length;

    for (const config of WINDOW_CHARACTERS) {
      if (config.floor === floorNumber) {
        this.addWindowCharacter(config);
      }
    }
  }

  private addWindowCharacter(config: WindowCharacterConfig): void {
    const rowIndex = config.floor - 1;
    if (rowIndex >= this.rows.length) return;

    const row = this.rows[rowIndex];
    const rowContainer = row.getContainer();

    const windowX = 140;
    const windowY = rowContainer.y;

    const windowBg = this.scene.add.image(windowX, windowY, 'building', 'window-lit');
    windowBg.setDisplaySize(32, 32);
    this.container.add(windowBg);

    const sprite = this.scene.add.sprite(windowX, windowY - 4, config.spriteKey);
    sprite.setScale(0.5);
    sprite.play(config.animKey);
    this.container.add(sprite);
    this.windowSprites.push(sprite);

    sprite.setScale(0);
    this.scene.tweens.add({
      targets: sprite,
      scale: 0.5,
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  private adjustCamera(): void {
    const visibleHeight = 500;
    if (this.totalHeight > visibleHeight) {
      const offset = this.totalHeight - visibleHeight;
      this.scene.tweens.add({
        targets: this.container,
        y: BUILDING_BASE_Y + offset,
        duration: 500,
        ease: 'Sine.easeOut',
      });
    }
  }

  getTotalHeight(): number {
    return this.totalHeight;
  }

  getFloorCount(): number {
    return this.rows.length;
  }

  getTopY(): number {
    return BUILDING_BASE_Y - this.totalHeight;
  }

  addRoofDecoration(): void {
    const roofY = -(this.totalHeight + 8);
    const roof = this.scene.add.image(0, roofY, 'building', 'roof');
    roof.setDisplaySize(384, 16);
    roof.setOrigin(0.5, 1);
    this.container.add(roof);

    const flagY = -(this.totalHeight + 20);
    const flag = this.scene.add.image(0, flagY, 'flag');
    flag.setDisplaySize(32, 32);
    flag.setOrigin(0.5, 1);
    this.container.add(flag);

    this.scene.tweens.add({
      targets: flag,
      angle: { from: -5, to: 5 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  destroy(): void {
    for (const row of this.rows) {
      row.destroy();
    }
    for (const sprite of this.windowSprites) {
      sprite.destroy();
    }
    this.container.destroy();
  }
}
