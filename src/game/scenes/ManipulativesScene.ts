// ABOUTME: Phaser scene that renders the manipulatives workspace as an overlay.
// ABOUTME: Launched in parallel with Game scene; communicates via ManipulativeEvents.

import Phaser from 'phaser';
import { ManipulativeEvents, MANIP_EVENTS } from '../events/ManipulativeEvents';
import type { ManipShowPayload, ManipBuildUpPayload } from '../events/ManipulativeEvents';
import { MANIP } from '../objects/manipulatives/ManipulativeConfig';
import { t } from '../i18n';
import { PieceTray } from '../objects/manipulatives/PieceTray';
import { WorkspaceGrid } from '../objects/manipulatives/WorkspaceGrid';
import { RunningTotal } from '../objects/manipulatives/RunningTotal';
import { GhostPiece } from '../objects/manipulatives/GhostPiece';
import { HintRenderer } from '../objects/manipulatives/HintRenderer';
import { AnswerVisualizer } from '../objects/manipulatives/AnswerVisualizer';
import { BuildUpManager } from '../objects/manipulatives/BuildUpManager';
import { CirclePiece } from '../objects/manipulatives/CirclePiece';
import { RectanglePiece } from '../objects/manipulatives/RectanglePiece';

export class ManipulativesScene extends Phaser.Scene {
  private backdrop!: Phaser.GameObjects.Rectangle;
  private tray!: PieceTray;
  private workspace!: WorkspaceGrid;
  private runningTotal!: RunningTotal;
  private ghost!: GhostPiece;
  private hintRenderer!: HintRenderer;
  private answerVisualizer!: AnswerVisualizer;
  private buildUpManager!: BuildUpManager;
  private closeButton!: Phaser.GameObjects.Container;
  private resetButton!: Phaser.GameObjects.Container;

  private currentFactorA = 0;
  private currentFactorB = 0;
  private currentCorrectAnswer = 0;
  private isVisible = true;

  constructor() {
    super({ key: 'Manipulatives' });
  }

  create(): void {
    this.backdrop = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      MANIP.BACKDROP_COLOR,
      MANIP.BACKDROP_ALPHA
    );
    this.backdrop.setInteractive();

    const panelX = 0;
    const panelY = this.scale.height * 0.15;
    const panelWidth = this.scale.width;
    const panelHeight = this.scale.height * 0.75;

    const panelBg = this.add.rectangle(
      panelX + panelWidth / 2,
      panelY + panelHeight / 2,
      panelWidth - 20,
      panelHeight,
      MANIP.WORKSPACE_BG
    );
    panelBg.setStrokeStyle(2, 0xCCCCCC);

    const trayX = panelX + 10;
    const trayY = panelY;
    const workspaceX = panelX + MANIP.TRAY_WIDTH + 20;
    const workspaceY = panelY;
    const workspaceWidth = panelWidth - MANIP.TRAY_WIDTH - 40;
    const workspaceHeight = panelHeight;

    this.tray = new PieceTray(this, trayX, trayY, MANIP.TRAY_WIDTH, panelHeight);
    this.workspace = new WorkspaceGrid(this, workspaceX, workspaceY, workspaceWidth, workspaceHeight);
    this.ghost = new GhostPiece(this);
    this.runningTotal = new RunningTotal(this, panelX + panelWidth / 2, panelY - 5);
    this.hintRenderer = new HintRenderer(this, this.workspace);
    this.answerVisualizer = new AnswerVisualizer(this, this.workspace);
    this.buildUpManager = new BuildUpManager(this, this.workspace);

    this.createCloseButton(panelX + panelWidth - 30, panelY + 15);
    this.createResetButton(panelX + panelWidth - 80, panelY + 15);

    this.setupDragAndDrop();

    this.bindEvents();

    this.setVisible(false);
  }

  private createCloseButton(x: number, y: number): void {
    const bg = this.add.circle(x, y, 16, 0xEF5350);
    const label = this.add.text(x, y, '\u2715', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
    this.closeButton = this.add.container(0, 0, [bg, label]);
    bg.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.hide());
  }

  private createResetButton(x: number, y: number): void {
    const bg = this.add.rectangle(x, y, 50, 28, 0xBDBDBD, 1).setStrokeStyle(1, 0x999999);
    const label = this.add.text(x, y, t('game.reset'), {
      fontSize: '12px',
      color: '#333333',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
    this.resetButton = this.add.container(0, 0, [bg, label]);
    bg.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.resetWorkspace());
  }

  private bindEvents(): void {
    ManipulativeEvents.on(MANIP_EVENTS.SHOW, this.onShow, this);
    ManipulativeEvents.on(MANIP_EVENTS.HIDE, this.hide, this);
    ManipulativeEvents.on(MANIP_EVENTS.SHOW_HINT_TIER1, this.onHintTier1, this);
    ManipulativeEvents.on(MANIP_EVENTS.SHOW_HINT_TIER2, this.onHintTier2, this);
    ManipulativeEvents.on(MANIP_EVENTS.SHOW_ANSWER, this.onShowAnswer, this);
    ManipulativeEvents.on(MANIP_EVENTS.START_BUILD_UP, this.onBuildUp, this);
    ManipulativeEvents.on(MANIP_EVENTS.RESET, this.resetWorkspace, this);
  }

  private onShow(payload: ManipShowPayload): void {
    this.currentFactorA = payload.factorA;
    this.currentFactorB = payload.factorB;
    this.currentCorrectAnswer = payload.correctAnswer;
    this.resetWorkspace();
    this.setVisible(true);
  }

  private hide(): void {
    this.setVisible(false);
    ManipulativeEvents.emit(MANIP_EVENTS.CLOSED);
  }

  private onHintTier1(payload: ManipShowPayload): void {
    this.currentFactorA = payload.factorA;
    this.currentFactorB = payload.factorB;
    this.currentCorrectAnswer = payload.correctAnswer;
    this.resetWorkspace();
    this.setVisible(true);
    this.hintRenderer.showTier1(payload.factorA, payload.factorB);
  }

  private onHintTier2(payload: ManipShowPayload): void {
    this.currentFactorA = payload.factorA;
    this.currentFactorB = payload.factorB;
    this.currentCorrectAnswer = payload.correctAnswer;
    this.resetWorkspace();
    this.setVisible(true);
    this.hintRenderer.showTier2(payload.factorA, payload.factorB, () => {
      ManipulativeEvents.emit(MANIP_EVENTS.HINT_ANIMATION_DONE);
    });
  }

  private onShowAnswer(payload: { answer: number }): void {
    this.resetWorkspace();
    this.setVisible(true);
    this.answerVisualizer.show(payload.answer, () => {
      ManipulativeEvents.emit(MANIP_EVENTS.ANSWER_ANIMATION_DONE);
    });
  }

  private onBuildUp(payload: ManipBuildUpPayload): void {
    this.currentFactorA = payload.factorA;
    this.currentFactorB = payload.factorB;
    this.currentCorrectAnswer = payload.factorA * payload.factorB;
    this.setVisible(true);
    this.buildUpManager.start(payload.factorA, payload.factorB, payload.previousGroups);
  }

  private resetWorkspace(): void {
    this.workspace.clear();
    this.hintRenderer.clear();
    this.answerVisualizer.clear();
    this.buildUpManager.reset();
    this.runningTotal.setValue(0);
  }

  private setVisible(visible: boolean): void {
    if (this.isVisible === visible) return;
    this.isVisible = visible;
    this.scene.setVisible(visible);
    this.scene.setActive(visible);
    this.input.enabled = visible;
  }

  private setupDragAndDrop(): void {
    this.input.on('drag', (
      _pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.Image,
      dragX: number,
      dragY: number
    ) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.setData('wasDragged', true);

      const snapPos = this.workspace.nearestSnapPosition(dragX, dragY);
      if (snapPos) {
        const pieceType = gameObject.getData('pieceType') as 'circle' | 'rectangle';
        this.ghost.show(snapPos.x, snapPos.y, pieceType);
      } else {
        this.ghost.hide();
      }
    });

    this.input.on('dragstart', (
      _pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.Image
    ) => {
      gameObject.setScale(MANIP.DRAG_SCALE);
      gameObject.setDepth(1000);
      gameObject.setData('wasDragged', true);
    });

    this.input.on('dragend', (
      _pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.Image
    ) => {
      this.ghost.hide();
      gameObject.setScale(1);

      const snapPos = this.workspace.nearestSnapPosition(gameObject.x, gameObject.y);
      const isFromTray = gameObject.getData('fromTray') as boolean;

      if (snapPos && this.workspace.isInsideBounds(snapPos.x, snapPos.y)) {
        this.tweens.add({
          targets: gameObject,
          x: snapPos.x,
          y: snapPos.y,
          duration: MANIP.SNAP_DURATION,
          ease: 'Back.easeOut',
        });
        gameObject.setData('placed', true);
        gameObject.setData('gridCol', snapPos.col);
        gameObject.setData('gridRow', snapPos.row);

        if (isFromTray) {
          this.workspace.trackPiece(gameObject);
          const pieceType = gameObject.getData('pieceType') as 'circle' | 'rectangle';
          this.tray.replenish(pieceType);
          gameObject.setData('fromTray', false);
        }

        this.setupTapToRemove(gameObject);
        this.updateTotal();
      } else {
        if (isFromTray) {
          const origin = gameObject.getData('originX') as number;
          const originY = gameObject.getData('originY') as number;
          this.tweens.add({
            targets: gameObject,
            x: origin,
            y: originY,
            duration: MANIP.SNAP_DURATION,
            ease: 'Back.easeOut',
          });
        } else {
          this.workspace.untrackPiece(gameObject);
          gameObject.destroy();
          this.updateTotal();
        }
      }

      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    });

    // Tap-to-place: when workspace is tapped while a tray piece is selected
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const selected = this.tray.getSelectedType();
      if (!selected) return;

      if (!this.workspace.isInsideBounds(pointer.x, pointer.y)) return;

      const snapPos = this.workspace.nearestSnapPosition(pointer.x, pointer.y);
      if (!snapPos) return;

      let piece: Phaser.GameObjects.Image;
      if (selected === 'circle') {
        piece = CirclePiece.create(this, snapPos.x, snapPos.y, false);
      } else {
        piece = RectanglePiece.create(this, snapPos.x, snapPos.y, false);
      }

      piece.setData('placed', true);
      piece.setData('gridCol', snapPos.col);
      piece.setData('gridRow', snapPos.row);
      piece.setAlpha(0);

      this.tweens.add({
        targets: piece,
        alpha: 1,
        duration: 150,
        ease: 'Quad.easeOut',
      });

      this.workspace.trackPiece(piece);
      this.setupTapToRemove(piece);
      this.updateTotal();

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  }

  private setupTapToRemove(gameObject: Phaser.GameObjects.Image): void {
    gameObject.setData('wasDragged', false);

    gameObject.on('dragstart', () => {
      gameObject.setData('wasDragged', true);
    });

    gameObject.on('pointerup', () => {
      if (!gameObject.getData('wasDragged') && gameObject.getData('placed')) {
        this.workspace.untrackPiece(gameObject);
        this.tweens.add({
          targets: gameObject,
          alpha: 0,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: 150,
          onComplete: () => gameObject.destroy(),
        });
        this.updateTotal();
      }
      gameObject.setData('wasDragged', false);
    });
  }

  private updateTotal(): void {
    const total = this.workspace.calculateTotal();
    this.runningTotal.setValue(total);
    ManipulativeEvents.emit(MANIP_EVENTS.TOTAL_CHANGED, { total });

    if (total === this.currentCorrectAnswer && total > 0) {
      this.runningTotal.celebrate();
      ManipulativeEvents.emit(MANIP_EVENTS.CORRECT_TOTAL, { total });
    }
  }

  shutdown(): void {
    ManipulativeEvents.off(MANIP_EVENTS.SHOW, this.onShow, this);
    ManipulativeEvents.off(MANIP_EVENTS.HIDE, this.hide, this);
    ManipulativeEvents.off(MANIP_EVENTS.SHOW_HINT_TIER1, this.onHintTier1, this);
    ManipulativeEvents.off(MANIP_EVENTS.SHOW_HINT_TIER2, this.onHintTier2, this);
    ManipulativeEvents.off(MANIP_EVENTS.SHOW_ANSWER, this.onShowAnswer, this);
    ManipulativeEvents.off(MANIP_EVENTS.START_BUILD_UP, this.onBuildUp, this);
    ManipulativeEvents.off(MANIP_EVENTS.RESET, this.resetWorkspace, this);
  }
}
