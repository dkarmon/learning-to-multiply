# Implementation Plan: Manipulatives Workstream

Generated: 2026-03-11

## Implementation Checklist

**Instructions for implementing agent:** Work through this checklist in order. Mark items `[x]` as you complete them. Mark the current item `[→]`. Do NOT skip items. After each phase, commit your work.

### Phase 1: Constants, Events, and Scene Shell
- [ ] Create `src/game/objects/manipulatives/ManipulativeConfig.ts` with all MANIP constants (sizes, colors, layout, animation, touch, text)
- [ ] Create `src/game/events/ManipulativeEvents.ts` with shared EventEmitter, MANIP_EVENTS constants, and typed payloads (`ManipShowPayload`, `ManipAnswerPayload`, `ManipBuildUpPayload`, `ManipTotalPayload`)
- [ ] Create `src/game/scenes/ManipulativesScene.ts` shell with constructor (`key: 'Manipulatives'`), `create()`, backdrop, panel layout, close/reset buttons, `bindEvents()`, `setVisible()`, and `shutdown()` cleanup
- [ ] Verify: `ManipulativeConfig.ts` compiles with all constants
- [ ] Verify: `ManipulativeEvents.ts` exports a working EventEmitter and typed payloads
- [ ] Verify: `ManipulativesScene` can be launched and hidden/shown via events
- [ ] Commit phase 1

### Phase 2: Piece Rendering (Circle + Rectangle)
- [ ] Create `src/game/objects/manipulatives/CirclePiece.ts` with static `generateTexture()`, `generateHighlightTexture()`, `create()` (draggable image with hit area padding), and `highlight()` methods
- [ ] Create `src/game/objects/manipulatives/RectanglePiece.ts` with static `generateTexture()` (120x24 with 4 divider lines and 5 dots), `generateHighlightTexture()`, `create()` (draggable image), and `highlight()` methods
- [ ] Verify: `CirclePiece.generateTexture()` produces a 24x24 blue circle texture with center dot
- [ ] Verify: `RectanglePiece.generateTexture()` produces a 120x24 orange rectangle with 5 visible sub-units
- [ ] Verify: Both pieces are draggable via Phaser pointer events with generous hit areas (`GRAB_PADDING`)
- [ ] Verify: Highlight textures swap correctly and revert after delay
- [ ] Commit phase 2

### **APPROVAL GATE: Show Danny the circle and rectangle pieces rendering correctly before continuing.**

### Phase 3: Parts Tray
- [ ] Create `src/game/objects/manipulatives/PieceTray.ts` with tray background, "Pieces" header, circle spawn at `y+55`, rectangle spawn at `y+135`, "= 1" / "= 5" labels, "Drag to workspace" instruction, and `replenish()` method
- [ ] Verify: Tray renders on the left side with labeled circle and rectangle pieces
- [ ] Verify: Dragging a piece out of the tray causes a new one to appear in its place (infinite supply)
- [ ] Verify: Labels "= 1" and "= 5" are visible and correctly positioned
- [ ] Commit phase 3

### Phase 4: Workspace Grid and Snap-to-Grid
- [ ] Create `src/game/objects/manipulatives/WorkspaceGrid.ts` with grid drawing (subtle dots), `nearestSnapPosition()`, `isInsideBounds()`, `trackPiece()`/`untrackPiece()`, `calculateTotal()`, `getCellCenter()`, `getColCount()`/`getRowCount()`, and `clear()`
- [ ] Create `src/game/objects/manipulatives/GhostPiece.ts` with ghost circle/rect textures, `show()`/`hide()` methods
- [ ] Wire up `setupDragAndDrop()` in `ManipulativesScene`: drag handler (move + show ghost), dragstart handler (scale up), dragend handler (snap or return to tray, track/untrack, replenish, haptic feedback)
- [ ] Verify: Grid renders subtle dot markers at each snap position
- [ ] Verify: `nearestSnapPosition()` returns correct grid cell for a given pixel coordinate
- [ ] Verify: Pieces snap to grid with a smooth tween on drop
- [ ] Verify: Ghost piece appears at snap target during drag, disappears on drop
- [ ] Verify: `calculateTotal()` returns correct sum of placed piece values
- [ ] Verify: Pieces dragged out of workspace are removed and untracked
- [ ] Commit phase 4

### **APPROVAL GATE: Show Danny drag-and-drop working (drag from tray, snap to grid, ghost preview, total updates) before continuing.**

### Phase 5: Running Total and Group Visualization
- [ ] Create `src/game/objects/manipulatives/RunningTotal.ts` with "Total:" label, value text, `setValue()` with bump animation, and `celebrate()` with green color + bounce
- [ ] Create `src/game/objects/manipulatives/GroupOutline.ts` with dashed rectangle drawing (`drawDashedRect`/`drawDashedLine`), group labels ("Group 1", "Group 2"), and `clear()`
- [ ] Create `src/game/objects/manipulatives/CompositeGroup.ts` with `decompose()` (number to fives+ones), `widthInCells()`, `placeGroup()` (places rects then circles on grid), and `createDecompositionLabel()` (visual "6 = [rect][circle]")
- [ ] Write unit tests for `CompositeGroup.decompose()`: 0, 1, 5, 6, 13, 25, 47
- [ ] Write unit tests for `CompositeGroup.widthInCells()`: `{fives:0, ones:3}` -> 3, `{fives:1, ones:1}` -> 6, `{fives:2, ones:3}` -> 13
- [ ] Write unit tests for `ManipulativeConfig`: verify `RECT_WIDTH === CIRCLE_DIAMETER * 5`
- [ ] Verify: `RunningTotal` displays and updates the sum as pieces are placed
- [ ] Verify: Celebrate animation triggers when total matches correct answer
- [ ] Verify: `GroupOutline` draws dashed borders around groups with labels
- [ ] Commit phase 5

### Phase 6: Tap-to-Select-then-Tap-to-Place
- [ ] Add to `PieceTray.ts`: `selectedType` state, `onTrayPieceTapped()` toggle, `showSelectionIndicator()` (green outline), `clearSelectionIndicator()`, `getSelectedType()`, `clearSelection()`
- [ ] Add to `ManipulativesScene.setupDragAndDrop()`: workspace `pointerdown` handler that creates piece at nearest snap position when a tray piece is selected (fade-in animation)
- [ ] Add tap-to-remove on placed pieces: `wasDragged` flag to distinguish taps from drags, `pointerup` handler that fades out and destroys tapped pieces
- [ ] Verify: Tapping a tray piece toggles selection (green outline)
- [ ] Verify: Tapping the workspace while a piece is selected places it at the nearest grid cell
- [ ] Verify: Tapping a placed piece removes it with a fade-out animation
- [ ] Verify: Both drag-to-place and tap-to-place coexist without conflict
- [ ] Commit phase 6

### Phase 7: Hint System Integration
- [ ] Create `src/game/objects/manipulatives/HintRenderer.ts` with `showTier1()` (ghosted outlines of expected groups at correct grid positions) and `showTier2()` (step-by-step animation: decomposition label, pieces slide from tray to workspace one group at a time, running total after each group, final equation flash with `onComplete` callback), and `clear()` (cancels pending `TimerEvent`s)
- [ ] Verify: Tier 1 shows ghosted outlines of all expected groups at correct grid positions
- [ ] Verify: Tier 2 animates pieces sliding from tray to workspace, one group at a time
- [ ] Verify: Running total appears after each group in Tier 2
- [ ] Verify: Final equation flashes at the end of Tier 2 animation
- [ ] Verify: `onComplete` callback fires after Tier 2 animation finishes
- [ ] Verify: `clear()` cancels in-progress animations cleanly
- [ ] Commit phase 7

### **APPROVAL GATE: Show Danny the hint system (Tier 1 ghost outlines + Tier 2 animated walkthrough) before continuing.**

### Phase 8: Answer Visualizer
- [ ] Create `src/game/objects/manipulatives/AnswerVisualizer.ts` with `show()` (decomposition label at top, rectangles then circles animate in one by one with pop-up running count, `onComplete` callback) and `clear()` (cancels timers, destroys pieces/labels/containers)
- [ ] Verify: `show(15)` renders 3 rectangles in a row
- [ ] Verify: `show(17)` renders 3 rectangles + 2 circles
- [ ] Verify: Pieces animate in one by one with pop-up running count
- [ ] Verify: Decomposition label appears at top
- [ ] Verify: `onComplete` fires after all pieces have appeared
- [ ] Commit phase 8

### Phase 9: Building-Up Mode
- [ ] Create `src/game/objects/manipulatives/BuildUpManager.ts` with `start()` (places `previousGroups` of `factorB` dimmed and non-interactive, draws group outlines, shows existing total, pulsing green ghost outline for new group, "Add one more group of N!" prompt, listens for `TOTAL_CHANGED` to detect completion) and `reset()` (destroys all pieces/labels, clears outlines)
- [ ] Verify: Previous groups appear dimmed and non-interactive
- [ ] Verify: A pulsing green outline shows where the new group should go
- [ ] Verify: Prompt text says "Add one more group of N!"
- [ ] Verify: When the child places enough pieces to reach the target total, celebration triggers
- [ ] Verify: Running totals update correctly (existing total -> new total)
- [ ] Commit phase 9

### **APPROVAL GATE: Show Danny the building-up mode (pre-placed dimmed groups, staging area prompt, completion detection) before continuing.**

### Phase 10: Scene Registration and Game Scene Integration
- [ ] Add `ManipulativesScene` import and registration in `src/game/config.ts` scene array
- [ ] Add to `src/game/scenes/Game.ts`: `this.scene.launch('Manipulatives')`, "Blocks" button (`createBlocksButton()` with blue circle + mini block icon + label), wire `pointerdown` to emit `MANIP_EVENTS.SHOW`
- [ ] Wire hint tier 1 and tier 2 events from HintButton through `ManipulativeEvents`
- [ ] Wire answer visualization emit (`MANIP_EVENTS.SHOW_ANSWER`) after correct answer
- [ ] Wire building-up mode emit (`MANIP_EVENTS.START_BUILD_UP`) for questions with `isBuildingUp` flag
- [ ] Wire `MANIP_EVENTS.CORRECT_TOTAL` listener to accept visual answer as correct
- [ ] Verify: ManipulativesScene is registered in Phaser config and launches with Game scene
- [ ] Verify: "Blocks" button appears in Game scene and opens manipulatives on tap
- [ ] Verify: Hint tiers 1 and 2 flow from HintButton through ManipulativeEvents to ManipulativesScene
- [ ] Verify: Answer visualization triggers after correct answer
- [ ] Verify: Building-up mode triggers for questions with `isBuildingUp` flag
- [ ] Verify: Correct total built in workspace is accepted as a correct answer
- [ ] Commit phase 10

## Goal

Build the visual math manipulatives system -- the pedagogical heart of the multiplication learning game. Children drag blue circles (1-unit) and orange rectangles (5-unit) from a parts tray into a workspace to compose multiplication facts visually. The system serves three roles: a self-directed exploration tool, the hint system's visual engine, and the post-answer visualization renderer.

The workspace is a Phaser scene launched in parallel with the Game scene. It communicates via a shared EventEmitter. All sprites are drawn programmatically with `Phaser.GameObjects.Graphics` (no external sprite assets required for the math pieces themselves).

## Architecture Decisions

**Scene strategy:** The manipulatives workspace is a separate Phaser Scene (`ManipulativesScene`) launched in parallel with the Game scene via `this.scene.launch('Manipulatives')`. This keeps the Game scene's display list clean and lets us show/hide the workspace independently. The manipulatives scene renders on top (higher depth) and has a semi-transparent backdrop when shown as an overlay.

**Why not a Container inside Game scene:** Containers in Phaser have performance costs when nested, and input events on deeply nested children are unreliable. A separate scene gives us an isolated input context and clean lifecycle management.

**Cross-scene communication:** A dedicated `EventEmitter` singleton (`ManipulativeEvents`) shared between scenes. No direct scene references.

**Graphics vs Sprites:** Circles and rectangles are drawn with `Phaser.GameObjects.Graphics` baked to textures via `generateTexture()`. This means zero external art dependencies -- the Art agent does not block this workstream for math piece sprites.

**Coordinate system:** The workspace uses a fixed logical layout. The parts tray occupies the left 120px. The workspace grid occupies the remaining width. Grid cells are `CELL_SIZE` (28px) with 2px gaps.

---

## File Structure

```
src/game/
  events/
    ManipulativeEvents.ts        # Shared EventEmitter singleton
  scenes/
    ManipulativesScene.ts        # The overlay scene
  objects/
    manipulatives/
      ManipulativeConfig.ts      # Constants (sizes, colors, snap thresholds)
      PieceTray.ts               # Parts tray with infinite circles/rectangles
      WorkspaceGrid.ts           # Snap-to-grid workspace area
      CirclePiece.ts             # Draggable 1-unit circle
      RectanglePiece.ts          # Draggable 5-unit rectangle
      CompositeGroup.ts          # A group of pieces representing one "copy" of a number
      GroupOutline.ts            # Dotted border around a group
      RunningTotal.ts            # "Total: 12" display
      GhostPiece.ts              # Shadow/ghost showing drop target
      HintRenderer.ts            # Tier 1 ghosted groups + Tier 2 animation
      AnswerVisualizer.ts        # Post-answer decomposition display
      BuildUpManager.ts          # Building-up mode state machine
```

---

## Phase 1: Constants, Events, and Scene Shell

### Files to create

**`src/game/objects/manipulatives/ManipulativeConfig.ts`**

```typescript
// ABOUTME: Constants for the manipulatives visual math system.
// ABOUTME: Sizes, colors, snap thresholds, and layout dimensions.

export const MANIP = {
  // Piece dimensions
  CIRCLE_RADIUS: 12,
  CIRCLE_DIAMETER: 24,
  RECT_WIDTH: 120,   // 5 * 24 = 120
  RECT_HEIGHT: 24,

  // Colors
  CIRCLE_COLOR: 0x2196F3,      // Blue
  CIRCLE_STROKE: 0x1976D2,
  RECT_COLOR: 0xFF9800,         // Orange
  RECT_STROKE: 0xF57C00,
  RECT_DIVIDER: 0xFFCC80,       // Light orange for 5-dot dividers
  GHOST_COLOR: 0xCCCCCC,
  GHOST_ALPHA: 0.35,
  HIGHLIGHT_COLOR: 0xFFEB3B,    // Yellow highlight during count animation
  GROUP_OUTLINE_COLOR: 0x666666,
  WORKSPACE_BG: 0xFAFAFA,
  TRAY_BG: 0xEEEEEE,
  BACKDROP_COLOR: 0x000000,
  BACKDROP_ALPHA: 0.3,

  // Layout
  TRAY_WIDTH: 130,
  CELL_SIZE: 28,
  CELL_GAP: 2,
  SNAP_THRESHOLD: 20,          // Snap within 20px
  GROUP_PADDING: 6,
  GROUP_VERTICAL_GAP: 12,

  // Animation
  DRAG_SCALE: 1.1,
  SNAP_DURATION: 120,          // ms
  COUNT_STEP_DELAY: 400,       // ms between count steps
  HINT_FADE_DURATION: 300,
  CELEBRATION_DURATION: 1500,

  // Touch
  GRAB_PADDING: 8,             // Extra hit area around pieces

  // Text
  TOTAL_FONT_SIZE: '20px',
  TOTAL_FONT_FAMILY: 'Arial, sans-serif',
  GROUP_LABEL_FONT_SIZE: '13px',
  DECOMPOSITION_FONT_SIZE: '16px',
} as const;
```

**`src/game/events/ManipulativeEvents.ts`**

```typescript
// ABOUTME: Shared event bus for communication between ManipulativesScene and Game scene.
// ABOUTME: Decouples the two scenes so neither holds a direct reference to the other.

import Phaser from 'phaser';

export const ManipulativeEvents = new Phaser.Events.EventEmitter();

// Event names
export const MANIP_EVENTS = {
  // Game scene -> Manipulatives scene
  SHOW: 'manip:show',                     // { factorA, factorB, correctAnswer }
  HIDE: 'manip:hide',
  SHOW_HINT_TIER1: 'manip:hint:tier1',    // { factorA, factorB, correctAnswer }
  SHOW_HINT_TIER2: 'manip:hint:tier2',    // { factorA, factorB, correctAnswer }
  SHOW_ANSWER: 'manip:answer:show',       // { answer }
  START_BUILD_UP: 'manip:buildup:start',  // { factorA, factorB, previousGroups }
  RESET: 'manip:reset',

  // Manipulatives scene -> Game scene
  TOTAL_CHANGED: 'manip:total:changed',   // { total }
  CORRECT_TOTAL: 'manip:total:correct',   // { total } -- total matches correct answer
  CLOSED: 'manip:closed',
  HINT_ANIMATION_DONE: 'manip:hint:done',
  ANSWER_ANIMATION_DONE: 'manip:answer:done',
} as const;

export interface ManipShowPayload {
  factorA: number;
  factorB: number;
  correctAnswer: number;
}

export interface ManipAnswerPayload {
  answer: number;
}

export interface ManipBuildUpPayload {
  factorA: number;
  factorB: number;
  previousGroups: number;  // how many groups already placed
}

export interface ManipTotalPayload {
  total: number;
}
```

**`src/game/scenes/ManipulativesScene.ts`** (shell -- fleshed out in Phase 2)

```typescript
// ABOUTME: Phaser scene that renders the manipulatives workspace as an overlay.
// ABOUTME: Launched in parallel with Game scene; communicates via ManipulativeEvents.

import Phaser from 'phaser';
import { ManipulativeEvents, MANIP_EVENTS } from '../events/ManipulativeEvents';
import type { ManipShowPayload, ManipAnswerPayload, ManipBuildUpPayload } from '../events/ManipulativeEvents';
import { MANIP } from '../objects/manipulatives/ManipulativeConfig';
import { PieceTray } from '../objects/manipulatives/PieceTray';
import { WorkspaceGrid } from '../objects/manipulatives/WorkspaceGrid';
import { RunningTotal } from '../objects/manipulatives/RunningTotal';
import { GhostPiece } from '../objects/manipulatives/GhostPiece';
import { HintRenderer } from '../objects/manipulatives/HintRenderer';
import { AnswerVisualizer } from '../objects/manipulatives/AnswerVisualizer';
import { BuildUpManager } from '../objects/manipulatives/BuildUpManager';

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
  private isVisible = false;

  constructor() {
    super({ key: 'Manipulatives' });
  }

  create(): void {
    // Semi-transparent backdrop
    this.backdrop = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      MANIP.BACKDROP_COLOR,
      MANIP.BACKDROP_ALPHA
    );
    this.backdrop.setInteractive(); // Absorb clicks so they don't pass through

    // Build the workspace panel
    const panelX = 0;
    const panelY = this.scale.height * 0.15;
    const panelWidth = this.scale.width;
    const panelHeight = this.scale.height * 0.75;

    // White panel background
    const panelBg = this.add.rectangle(
      panelX + panelWidth / 2,
      panelY + panelHeight / 2,
      panelWidth - 20,
      panelHeight,
      MANIP.WORKSPACE_BG
    );
    panelBg.setStrokeStyle(2, 0xCCCCCC);

    // Create subsystems
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

    // Wire up drag-and-drop
    this.setupDragAndDrop();

    // Listen for events from Game scene
    this.bindEvents();

    // Start hidden
    this.setVisible(false);
  }

  private createCloseButton(x: number, y: number): void {
    const bg = this.add.circle(x, y, 16, 0xEF5350);
    const label = this.add.text(x, y, '✕', {
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
    const label = this.add.text(x, y, 'Reset', {
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
    this.isVisible = visible;
    this.scene.setVisible(visible);
    // Also set active so input is processed only when visible
    this.scene.setActive(visible);
  }

  private setupDragAndDrop(): void {
    // Drag events are configured per-piece in PieceTray when pieces are created.
    // Scene-level drag handling for workspace snapping:

    this.input.on('drag', (
      _pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.GameObject & { x: number; y: number },
      dragX: number,
      dragY: number
    ) => {
      gameObject.x = dragX;
      gameObject.y = dragY;

      // Show ghost at nearest snap position
      const snapPos = this.workspace.nearestSnapPosition(dragX, dragY);
      if (snapPos) {
        const pieceType = gameObject.getData('pieceType') as 'circle' | 'rectangle';
        this.ghost.show(snapPos.x, snapPos.y, pieceType);
      } else {
        this.ghost.hide();
      }
    });

    this.input.on('dragend', (
      _pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.GameObject & { x: number; y: number; setScale: (s: number) => void }
    ) => {
      this.ghost.hide();
      gameObject.setScale(1);

      const snapPos = this.workspace.nearestSnapPosition(gameObject.x, gameObject.y);
      const isFromTray = gameObject.getData('fromTray') as boolean;

      if (snapPos && this.workspace.isInsideBounds(snapPos.x, snapPos.y)) {
        // Snap into place
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
          // Piece came from the tray -- add it to workspace tracking and spawn a replacement in the tray
          this.workspace.trackPiece(gameObject);
          const pieceType = gameObject.getData('pieceType') as 'circle' | 'rectangle';
          this.tray.replenish(pieceType);
          gameObject.setData('fromTray', false);
        }

        this.updateTotal();
      } else {
        // Dropped outside workspace -- return to tray or remove
        if (isFromTray) {
          // Never left the tray area, snap back
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
          // Was placed in workspace, now dragged out -- remove it
          this.workspace.untrackPiece(gameObject);
          gameObject.destroy();
          this.updateTotal();
        }
      }

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    });

    this.input.on('dragstart', (
      _pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.GameObject & { setScale: (s: number) => void; setDepth: (d: number) => void }
    ) => {
      gameObject.setScale(MANIP.DRAG_SCALE);
      gameObject.setDepth(1000); // Bring to front while dragging
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
```

### Acceptance criteria
- [ ] `ManipulativeConfig.ts` compiles with all constants
- [ ] `ManipulativeEvents.ts` exports a working EventEmitter and typed payloads
- [ ] `ManipulativesScene` can be launched from Game scene and hidden/shown via events

---

## Phase 2: Piece Rendering (Circle + Rectangle)

### Files to create

**`src/game/objects/manipulatives/CirclePiece.ts`**

```typescript
// ABOUTME: A draggable blue circle representing 1 unit in the visual math model.
// ABOUTME: Drawn programmatically with Phaser Graphics, supports drag-and-drop.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';

export class CirclePiece {
  private static textureGenerated = false;

  static readonly TEXTURE_KEY = 'manip-circle';
  static readonly VALUE = 1;

  /** Generate the circle texture once per scene. Call in create(). */
  static generateTexture(scene: Phaser.Scene): void {
    if (CirclePiece.textureGenerated && scene.textures.exists(CirclePiece.TEXTURE_KEY)) {
      return;
    }

    const diameter = MANIP.CIRCLE_DIAMETER;
    const r = MANIP.CIRCLE_RADIUS;
    const gfx = scene.add.graphics();

    // Fill
    gfx.fillStyle(MANIP.CIRCLE_COLOR, 1);
    gfx.fillCircle(r, r, r);

    // Stroke
    gfx.lineStyle(1.5, MANIP.CIRCLE_STROKE, 1);
    gfx.strokeCircle(r, r, r - 1);

    // Center dot (subtle "1" indicator)
    gfx.fillStyle(0xFFFFFF, 0.6);
    gfx.fillCircle(r, r, 3);

    gfx.generateTexture(CirclePiece.TEXTURE_KEY, diameter, diameter);
    gfx.destroy();
    CirclePiece.textureGenerated = true;
  }

  /** Generate a highlighted (counting animation) variant. */
  static readonly HIGHLIGHT_KEY = 'manip-circle-hl';

  static generateHighlightTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(CirclePiece.HIGHLIGHT_KEY)) return;

    const diameter = MANIP.CIRCLE_DIAMETER;
    const r = MANIP.CIRCLE_RADIUS;
    const gfx = scene.add.graphics();

    gfx.fillStyle(MANIP.HIGHLIGHT_COLOR, 1);
    gfx.fillCircle(r, r, r);
    gfx.lineStyle(2, MANIP.CIRCLE_COLOR, 1);
    gfx.strokeCircle(r, r, r - 1);
    gfx.fillStyle(0xFFFFFF, 0.6);
    gfx.fillCircle(r, r, 3);

    gfx.generateTexture(CirclePiece.HIGHLIGHT_KEY, diameter, diameter);
    gfx.destroy();
  }

  /** Create a draggable circle sprite at (x, y). */
  static create(scene: Phaser.Scene, x: number, y: number, fromTray = true): Phaser.GameObjects.Image {
    CirclePiece.generateTexture(scene);

    const img = scene.add.image(x, y, CirclePiece.TEXTURE_KEY);

    // Generous hit area for small fingers
    const hitPad = MANIP.GRAB_PADDING;
    const hitSize = MANIP.CIRCLE_DIAMETER + hitPad * 2;
    img.setInteractive(
      new Phaser.Geom.Rectangle(-hitPad, -hitPad, hitSize, hitSize),
      Phaser.Geom.Rectangle.Contains,
      { draggable: true }
    );

    img.setData('pieceType', 'circle');
    img.setData('pieceValue', CirclePiece.VALUE);
    img.setData('fromTray', fromTray);
    img.setData('placed', false);
    img.setData('originX', x);
    img.setData('originY', y);
    img.setData('gridCol', -1);
    img.setData('gridRow', -1);

    return img;
  }

  /** Flash the piece to its highlight texture and back. */
  static highlight(scene: Phaser.Scene, img: Phaser.GameObjects.Image, duration = 300): void {
    CirclePiece.generateHighlightTexture(scene);
    img.setTexture(CirclePiece.HIGHLIGHT_KEY);
    scene.time.delayedCall(duration, () => {
      if (img.active) {
        img.setTexture(CirclePiece.TEXTURE_KEY);
      }
    });
  }
}
```

**`src/game/objects/manipulatives/RectanglePiece.ts`**

```typescript
// ABOUTME: A draggable orange rectangle representing 5 units in the visual math model.
// ABOUTME: Width equals 5 circles; has visible dividers showing 5 sub-units.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';

export class RectanglePiece {
  private static textureGenerated = false;

  static readonly TEXTURE_KEY = 'manip-rect';
  static readonly VALUE = 5;

  /** Generate the rectangle texture once per scene. Call in create(). */
  static generateTexture(scene: Phaser.Scene): void {
    if (RectanglePiece.textureGenerated && scene.textures.exists(RectanglePiece.TEXTURE_KEY)) {
      return;
    }

    const w = MANIP.RECT_WIDTH;
    const h = MANIP.RECT_HEIGHT;
    const gfx = scene.add.graphics();

    // Fill with rounded corners
    gfx.fillStyle(MANIP.RECT_COLOR, 1);
    gfx.fillRoundedRect(0, 0, w, h, 3);

    // Stroke
    gfx.lineStyle(1.5, MANIP.RECT_STROKE, 1);
    gfx.strokeRoundedRect(0, 0, w, h, 3);

    // 4 divider lines to show 5 sub-units
    const cellW = w / 5;
    gfx.lineStyle(1, MANIP.RECT_DIVIDER, 0.7);
    for (let i = 1; i < 5; i++) {
      const lx = cellW * i;
      gfx.moveTo(lx, 3);
      gfx.lineTo(lx, h - 3);
    }
    gfx.strokePath();

    // 5 dots centered in each sub-cell
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

  /** Create a draggable rectangle sprite at (x, y). */
  static create(scene: Phaser.Scene, x: number, y: number, fromTray = true): Phaser.GameObjects.Image {
    RectanglePiece.generateTexture(scene);

    const img = scene.add.image(x, y, RectanglePiece.TEXTURE_KEY);

    // Generous hit area
    const hitPad = MANIP.GRAB_PADDING;
    img.setInteractive(
      new Phaser.Geom.Rectangle(
        -hitPad,
        -hitPad,
        MANIP.RECT_WIDTH + hitPad * 2,
        MANIP.RECT_HEIGHT + hitPad * 2
      ),
      Phaser.Geom.Rectangle.Contains,
      { draggable: true }
    );

    img.setData('pieceType', 'rectangle');
    img.setData('pieceValue', RectanglePiece.VALUE);
    img.setData('fromTray', fromTray);
    img.setData('placed', false);
    img.setData('originX', x);
    img.setData('originY', y);
    img.setData('gridCol', -1);
    img.setData('gridRow', -1);

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
```

### Acceptance criteria
- [ ] `CirclePiece.generateTexture()` produces a 24x24 blue circle texture
- [ ] `RectanglePiece.generateTexture()` produces a 120x24 orange rectangle with 5 visible sub-units
- [ ] Both pieces are draggable via Phaser pointer events with generous hit areas
- [ ] Highlight textures swap correctly and revert after delay

---

## Phase 3: Parts Tray

### Files to create

**`src/game/objects/manipulatives/PieceTray.ts`**

```typescript
// ABOUTME: The parts tray on the left side of the manipulatives workspace.
// ABOUTME: Contains unlimited circles and rectangles that replenish when dragged out.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';
import { CirclePiece } from './CirclePiece';
import { RectanglePiece } from './RectanglePiece';

export class PieceTray {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  private circlePiece: Phaser.GameObjects.Image | null = null;
  private rectanglePiece: Phaser.GameObjects.Image | null = null;

  private circleLabel!: Phaser.GameObjects.Text;
  private rectLabel!: Phaser.GameObjects.Text;

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

    // "Pieces" header
    this.scene.add.text(centerX, this.y + 15, 'Pieces', {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Circle label: "= 1"
    this.circleLabel = this.scene.add.text(centerX, this.y + 85, '= 1', {
      fontSize: '13px',
      color: '#1976D2',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Rectangle label: "= 5"
    this.rectLabel = this.scene.add.text(centerX, this.y + 165, '= 5', {
      fontSize: '13px',
      color: '#F57C00',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Instruction
    this.scene.add.text(centerX, this.y + this.height - 30, 'Drag to\nworkspace', {
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

    // Also support tap-to-select: on pointerdown without drag, toggle selection
    this.circlePiece.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
      // Tap-to-place is handled in Phase 6. For now, drag is the primary interaction.
    });
  }

  private spawnRectangle(): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + 135;
    this.rectanglePiece = RectanglePiece.create(this.scene, cx, cy, true);
  }

  /**
   * After a piece is dragged out of the tray, spawn a replacement.
   * Called by ManipulativesScene after a successful drop in the workspace.
   */
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
  }
}
```

### Acceptance criteria
- [ ] Tray renders on the left side with labeled circle and rectangle pieces
- [ ] Dragging a piece out of the tray causes a new one to appear in its place (infinite supply)
- [ ] Labels "= 1" and "= 5" are visible and correctly positioned

---

## Phase 4: Workspace Grid and Snap-to-Grid

### Files to create

**`src/game/objects/manipulatives/WorkspaceGrid.ts`**

```typescript
// ABOUTME: The workspace area where children place pieces to build multiplication groups.
// ABOUTME: Implements snap-to-grid placement and tracks placed pieces for total calculation.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';

interface SnapPosition {
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
  widthInCells: number; // 1 for circle, 5 for rectangle
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
  private occupiedCells: Set<string> = new Set(); // "col,row" keys

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

    // Subtle grid dots at intersections
    this.gridGraphics.fillStyle(0xDDDDDD, 0.5);
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cx = this.originX + col * cellUnit + MANIP.CELL_SIZE / 2;
        const cy = this.originY + row * cellUnit + MANIP.CELL_SIZE / 2;
        this.gridGraphics.fillCircle(cx, cy, 1.5);
      }
    }
  }

  /** Convert pixel position to the nearest grid cell center. */
  nearestSnapPosition(px: number, py: number): SnapPosition | null {
    const cellUnit = MANIP.CELL_SIZE + MANIP.CELL_GAP;

    const col = Math.round((px - this.originX - MANIP.CELL_SIZE / 2) / cellUnit);
    const row = Math.round((py - this.originY - MANIP.CELL_SIZE / 2) / cellUnit);

    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return null;
    }

    const snapX = this.originX + col * cellUnit + MANIP.CELL_SIZE / 2;
    const snapY = this.originY + row * cellUnit + MANIP.CELL_SIZE / 2;

    // Check distance threshold
    const dist = Phaser.Math.Distance.Between(px, py, snapX, snapY);
    if (dist > MANIP.SNAP_THRESHOLD * 2) {
      return null; // Too far from any grid position
    }

    return { x: snapX, y: snapY, col, row };
  }

  /** Check if a pixel position is within the workspace bounds. */
  isInsideBounds(px: number, py: number): boolean {
    return (
      px >= this.originX &&
      px <= this.originX + this.width &&
      py >= this.originY &&
      py <= this.originY + this.height
    );
  }

  /** Track a piece that was placed in the workspace. */
  trackPiece(gameObject: Phaser.GameObjects.GameObject): void {
    const col = gameObject.getData('gridCol') as number;
    const row = gameObject.getData('gridRow') as number;
    const value = gameObject.getData('pieceValue') as number;
    const type = gameObject.getData('pieceType') as 'circle' | 'rectangle';
    const widthInCells = type === 'rectangle' ? 5 : 1;

    const piece: PlacedPiece = { gameObject, col, row, value, widthInCells };
    this.placedPieces.push(piece);

    // Mark cells as occupied
    for (let c = 0; c < widthInCells; c++) {
      this.occupiedCells.add(`${col + c},${row}`);
    }
  }

  /** Remove tracking for a piece removed from the workspace. */
  untrackPiece(gameObject: Phaser.GameObjects.GameObject): void {
    const idx = this.placedPieces.findIndex(p => p.gameObject === gameObject);
    if (idx === -1) return;

    const piece = this.placedPieces[idx];
    for (let c = 0; c < piece.widthInCells; c++) {
      this.occupiedCells.delete(`${piece.col + c},${piece.row}`);
    }
    this.placedPieces.splice(idx, 1);
  }

  /** Sum the values of all placed pieces. */
  calculateTotal(): number {
    return this.placedPieces.reduce((sum, p) => sum + p.value, 0);
  }

  /** Get all placed pieces (for iteration by HintRenderer, etc.). */
  getPlacedPieces(): readonly PlacedPiece[] {
    return this.placedPieces;
  }

  /** Get grid origin for placing pieces programmatically. */
  getCellCenter(col: number, row: number): { x: number; y: number } {
    const cellUnit = MANIP.CELL_SIZE + MANIP.CELL_GAP;
    return {
      x: this.originX + col * cellUnit + MANIP.CELL_SIZE / 2,
      y: this.originY + row * cellUnit + MANIP.CELL_SIZE / 2,
    };
  }

  /** How many columns this grid has. */
  getColCount(): number {
    return this.cols;
  }

  /** How many rows this grid has. */
  getRowCount(): number {
    return this.rows;
  }

  /** Clear all pieces from the workspace. */
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
```

**`src/game/objects/manipulatives/GhostPiece.ts`**

```typescript
// ABOUTME: A translucent ghost showing where a dragged piece will snap when released.
// ABOUTME: Follows the nearest grid position during drag.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';

export class GhostPiece {
  private scene: Phaser.Scene;
  private circleGhost: Phaser.GameObjects.Image | null = null;
  private rectGhost: Phaser.GameObjects.Image | null = null;

  private static circleGhostKey = 'ghost-circle';
  private static rectGhostKey = 'ghost-rect';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.generateTextures();
  }

  private generateTextures(): void {
    if (!this.scene.textures.exists(GhostPiece.circleGhostKey)) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(MANIP.GHOST_COLOR, 1);
      gfx.fillCircle(MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS);
      gfx.lineStyle(1, 0xAAAAAA, 1);
      gfx.strokeCircle(MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS - 1);
      gfx.generateTexture(GhostPiece.circleGhostKey, MANIP.CIRCLE_DIAMETER, MANIP.CIRCLE_DIAMETER);
      gfx.destroy();
    }

    if (!this.scene.textures.exists(GhostPiece.rectGhostKey)) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(MANIP.GHOST_COLOR, 1);
      gfx.fillRoundedRect(0, 0, MANIP.RECT_WIDTH, MANIP.RECT_HEIGHT, 3);
      gfx.lineStyle(1, 0xAAAAAA, 1);
      gfx.strokeRoundedRect(0, 0, MANIP.RECT_WIDTH, MANIP.RECT_HEIGHT, 3);
      gfx.generateTexture(GhostPiece.rectGhostKey, MANIP.RECT_WIDTH, MANIP.RECT_HEIGHT);
      gfx.destroy();
    }
  }

  show(x: number, y: number, type: 'circle' | 'rectangle'): void {
    this.hide();

    if (type === 'circle') {
      this.circleGhost = this.scene.add.image(x, y, GhostPiece.circleGhostKey);
      this.circleGhost.setAlpha(MANIP.GHOST_ALPHA);
      this.circleGhost.setDepth(500);
    } else {
      this.rectGhost = this.scene.add.image(x, y, GhostPiece.rectGhostKey);
      this.rectGhost.setAlpha(MANIP.GHOST_ALPHA);
      this.rectGhost.setDepth(500);
    }
  }

  hide(): void {
    this.circleGhost?.destroy();
    this.circleGhost = null;
    this.rectGhost?.destroy();
    this.rectGhost = null;
  }
}
```

### Acceptance criteria
- [ ] Grid renders subtle dot markers at each snap position
- [ ] `nearestSnapPosition()` returns correct grid cell for a given pixel coordinate
- [ ] Pieces snap to grid with a smooth tween on drop
- [ ] Ghost piece appears at snap target during drag, disappears on drop
- [ ] `calculateTotal()` returns correct sum of placed piece values
- [ ] Pieces dragged out of workspace are removed and untracked

---

## Phase 5: Running Total and Group Visualization

### Files to create

**`src/game/objects/manipulatives/RunningTotal.ts`**

```typescript
// ABOUTME: Displays the running total of all pieces in the workspace.
// ABOUTME: Updates as pieces are added/removed; triggers celebration on correct answer.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';

export class RunningTotal {
  private scene: Phaser.Scene;
  private label: Phaser.GameObjects.Text;
  private valueText: Phaser.GameObjects.Text;
  private currentValue = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    this.label = scene.add.text(x - 40, y, 'Total:', {
      fontSize: MANIP.TOTAL_FONT_SIZE,
      color: '#666666',
      fontFamily: MANIP.TOTAL_FONT_FAMILY,
    }).setOrigin(0.5);

    this.valueText = scene.add.text(x + 20, y, '0', {
      fontSize: '24px',
      color: '#333333',
      fontFamily: MANIP.TOTAL_FONT_FAMILY,
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  setValue(value: number): void {
    const oldValue = this.currentValue;
    this.currentValue = value;
    this.valueText.setText(String(value));

    if (value > oldValue && value > 0) {
      // Bump animation on increase
      this.scene.tweens.add({
        targets: this.valueText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }
  }

  celebrate(): void {
    this.valueText.setColor('#4CAF50');
    this.scene.tweens.add({
      targets: this.valueText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      yoyo: true,
      repeat: 2,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.valueText.setColor('#333333');
      },
    });
  }

  destroy(): void {
    this.label.destroy();
    this.valueText.destroy();
  }
}
```

**`src/game/objects/manipulatives/GroupOutline.ts`**

```typescript
// ABOUTME: Draws a dotted border around a group of pieces in the workspace.
// ABOUTME: Shows group labels ("Group 1", "Group 2") above each outlined region.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';

interface GroupBounds {
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

  /** Draw outlines around groups. Each group is one "copy" of the multiplicand. */
  drawGroups(groups: GroupBounds[]): void {
    this.clear();

    this.graphics.lineStyle(2, MANIP.GROUP_OUTLINE_COLOR, 0.6);

    for (const group of groups) {
      const pad = MANIP.GROUP_PADDING;
      const x = group.x - pad;
      const y = group.y - pad;
      const w = group.width + pad * 2;
      const h = group.height + pad * 2;

      // Dashed rectangle
      this.drawDashedRect(x, y, w, h, 4, 4);

      // Group label above
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
    this.drawDashedLine(x, y, x + w, y, dash, gap);           // top
    this.drawDashedLine(x + w, y, x + w, y + h, dash, gap);   // right
    this.drawDashedLine(x + w, y + h, x, y + h, dash, gap);   // bottom
    this.drawDashedLine(x, y + h, x, y, dash, gap);           // left
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
```

**`src/game/objects/manipulatives/CompositeGroup.ts`**

```typescript
// ABOUTME: Represents a composite number as a group of rectangles and circles.
// ABOUTME: Decomposes any number into optimal 5s + 1s (e.g., 7 = one rect + two circles).

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';
import { CirclePiece } from './CirclePiece';
import { RectanglePiece } from './RectanglePiece';
import { WorkspaceGrid } from './WorkspaceGrid';

export interface Decomposition {
  fives: number;
  ones: number;
}

export class CompositeGroup {
  /** Decompose a number into 5s and 1s. Always prefer 5s. */
  static decompose(n: number): Decomposition {
    return {
      fives: Math.floor(n / 5),
      ones: n % 5,
    };
  }

  /**
   * Calculate the width in grid cells needed for a decomposed number.
   * A rectangle occupies 5 cells; a circle occupies 1 cell.
   */
  static widthInCells(decomp: Decomposition): number {
    return decomp.fives * 5 + decomp.ones;
  }

  /**
   * Place a full group of pieces representing `value` starting at grid position (startCol, row).
   * Returns all created game objects.
   */
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

    // Place rectangles (5-unit pieces)
    for (let i = 0; i < decomp.fives; i++) {
      // Rectangle is centered over 5 cells, so its center is at col+2
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

    // Place circles (1-unit pieces)
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

  /**
   * Create a visual decomposition label, e.g., "6 = [■■■■■][●]"
   * Returns a Container with the visual representation.
   */
  static createDecompositionLabel(
    scene: Phaser.Scene,
    value: number,
    x: number,
    y: number,
  ): Phaser.GameObjects.Container {
    const decomp = CompositeGroup.decompose(value);
    const container = scene.add.container(x, y);

    // "6 = " text
    const text = scene.add.text(0, 0, `${value} = `, {
      fontSize: MANIP.DECOMPOSITION_FONT_SIZE,
      color: '#333333',
      fontFamily: 'Arial',
    }).setOrigin(0, 0.5);
    container.add(text);

    let offsetX = text.width + 4;

    // Mini rectangles
    for (let i = 0; i < decomp.fives; i++) {
      const miniRect = scene.add.rectangle(
        offsetX + 20, 0, 40, 14,
        MANIP.RECT_COLOR
      ).setStrokeStyle(1, MANIP.RECT_STROKE);
      container.add(miniRect);
      offsetX += 44;
    }

    // Mini circles
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
```

### Acceptance criteria
- [ ] `RunningTotal` displays and updates the sum as pieces are placed
- [ ] Value bump animation triggers on increase
- [ ] Celebrate animation triggers when total matches correct answer
- [ ] `CompositeGroup.decompose()` correctly breaks numbers into 5s and 1s (e.g., 13 = {fives:2, ones:3})
- [ ] `CompositeGroup.placeGroup()` places rectangles and circles on the grid at correct positions
- [ ] `CompositeGroup.createDecompositionLabel()` renders "6 = [rect][circle]" visually
- [ ] `GroupOutline` draws dashed borders around groups

---

## Phase 6: Tap-to-Select-then-Tap-to-Place

The drag-and-drop system from Phases 2-4 handles the primary interaction. This phase adds the alternative "tap-to-select, tap-to-place" mode for children who struggle with drag precision.

### Changes to `PieceTray.ts`

Add a `selectedType` state and visual indicator:

```typescript
// Add to PieceTray class:

private selectedType: 'circle' | 'rectangle' | null = null;
private selectionIndicator: Phaser.GameObjects.Graphics | null = null;

/**
 * Called when a piece in the tray is tapped (not dragged).
 * Toggles selection state.
 */
private onTrayPieceTapped(type: 'circle' | 'rectangle'): void {
  if (this.selectedType === type) {
    // Deselect
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
```

### Changes to `ManipulativesScene.ts`

Add workspace tap handler:

```typescript
// Add to setupDragAndDrop() in ManipulativesScene:

// Tap-to-place: when workspace background is tapped while a tray piece is selected
this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
  const selected = this.tray.getSelectedType();
  if (!selected) return;

  // Only handle taps on the workspace area (not on existing pieces)
  if (!this.workspace.isInsideBounds(pointer.x, pointer.y)) return;

  const snapPos = this.workspace.nearestSnapPosition(pointer.x, pointer.y);
  if (!snapPos) return;

  // Create piece at snap position
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

  // Fade in
  this.tweens.add({
    targets: piece,
    alpha: 1,
    duration: 150,
    ease: 'Quad.easeOut',
  });

  this.workspace.trackPiece(piece);
  this.updateTotal();

  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
});

// Tap on placed piece to remove it (undo)
// This is wired up per-piece. Add to the dragend handler after placement:
gameObject.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
  // If this is a quick tap (not a drag start), remove the piece
  // We distinguish by checking if drag started -- handled via a 'wasDragged' flag
});
```

### Piece removal via tap

Add to each placed piece after it's snapped:

```typescript
// In ManipulativesScene, after a piece is placed and snapped:

// Set up tap-to-remove. Uses a flag to distinguish taps from drag starts.
gameObject.setData('wasDragged', false);

gameObject.on('dragstart', () => {
  gameObject.setData('wasDragged', true);
});

gameObject.on('pointerup', (_pointer: Phaser.Input.Pointer) => {
  if (!gameObject.getData('wasDragged') && gameObject.getData('placed')) {
    // This was a tap, not a drag. Remove the piece.
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
```

### Acceptance criteria
- [ ] Tapping a tray piece toggles selection (green outline)
- [ ] Tapping the workspace while a piece is selected places it at the nearest grid cell
- [ ] Tapping a placed piece removes it with a fade-out animation
- [ ] Both drag-to-place and tap-to-place coexist without conflict

---

## Phase 7: Hint System Integration

### Files to create

**`src/game/objects/manipulatives/HintRenderer.ts`**

```typescript
// ABOUTME: Renders hint visualizations in the manipulatives workspace.
// ABOUTME: Tier 1 shows ghosted partial groups; Tier 2 animates the full solution step by step.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';
import { CompositeGroup } from './CompositeGroup';
import { CirclePiece } from './CirclePiece';
import { RectanglePiece } from './RectanglePiece';
import { WorkspaceGrid } from './WorkspaceGrid';

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

  /**
   * Tier 1: Show ghosted outlines of the expected groups.
   * For 3x5: show 3 ghost rectangles arranged in the workspace.
   * Child can drag real pieces on top.
   */
  showTier1(factorA: number, factorB: number): void {
    this.clear();

    const decomp = CompositeGroup.decompose(factorB);
    const groupWidthCells = CompositeGroup.widthInCells(decomp);
    const cellUnit = MANIP.CELL_SIZE + MANIP.CELL_GAP;

    for (let groupIdx = 0; groupIdx < factorA; groupIdx++) {
      const row = groupIdx;
      let col = 0;

      // Ghost rectangles
      for (let r = 0; r < decomp.fives; r++) {
        const pos = this.grid.getCellCenter(col + 2, row);
        const ghost = this.scene.add.image(pos.x, pos.y, 'ghost-rect');
        ghost.setAlpha(MANIP.GHOST_ALPHA);
        ghost.setDepth(50);
        this.ghostPieces.push(ghost);

        // Ensure ghost texture exists
        if (!this.scene.textures.exists('ghost-rect')) {
          const gfx = this.scene.add.graphics();
          gfx.fillStyle(MANIP.GHOST_COLOR, 1);
          gfx.fillRoundedRect(0, 0, MANIP.RECT_WIDTH, MANIP.RECT_HEIGHT, 3);
          gfx.lineStyle(1.5, 0xAAAAAA, 0.8);
          gfx.strokeRoundedRect(0, 0, MANIP.RECT_WIDTH, MANIP.RECT_HEIGHT, 3);
          gfx.generateTexture('ghost-rect', MANIP.RECT_WIDTH, MANIP.RECT_HEIGHT);
          gfx.destroy();
        }

        col += 5;
      }

      // Ghost circles
      for (let c = 0; c < decomp.ones; c++) {
        const pos = this.grid.getCellCenter(col, row);

        if (!this.scene.textures.exists('ghost-circle')) {
          const gfx = this.scene.add.graphics();
          gfx.fillStyle(MANIP.GHOST_COLOR, 1);
          gfx.fillCircle(MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS);
          gfx.lineStyle(1.5, 0xAAAAAA, 0.8);
          gfx.strokeCircle(MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS, MANIP.CIRCLE_RADIUS - 1);
          gfx.generateTexture('ghost-circle', MANIP.CIRCLE_DIAMETER, MANIP.CIRCLE_DIAMETER);
          gfx.destroy();
        }

        const ghost = this.scene.add.image(pos.x, pos.y, 'ghost-circle');
        ghost.setAlpha(MANIP.GHOST_ALPHA);
        ghost.setDepth(50);
        this.ghostPieces.push(ghost);
        col += 1;
      }
    }
  }

  /**
   * Tier 2: Full step-by-step animation.
   * 1. Show number decomposition (e.g., "5 = [rect]")
   * 2. Animate pieces sliding from tray position to workspace one group at a time
   * 3. Show running total after each group
   * 4. Flash final equation
   */
  showTier2(factorA: number, factorB: number, onComplete: () => void): void {
    this.clear();

    const decomp = CompositeGroup.decompose(factorB);
    const product = factorA * factorB;

    // Step 1: Show decomposition label
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

    // Step 2: Animate groups one by one
    const trayX = 65; // Approximate center of tray
    const stepDelay = MANIP.COUNT_STEP_DELAY;
    let runningTotal = 0;

    // Delay before starting group animations
    const startDelay = 800;

    for (let groupIdx = 0; groupIdx < factorA; groupIdx++) {
      const groupDelay = startDelay + groupIdx * (stepDelay * (decomp.fives + decomp.ones + 1));
      let col = 0;
      let pieceIndex = 0;

      // Animate rectangles
      for (let r = 0; r < decomp.fives; r++) {
        const delay = groupDelay + pieceIndex * stepDelay;
        const targetPos = this.grid.getCellCenter(col + 2, groupIdx);

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
              piece.setData('gridCol', col);
              piece.setData('gridRow', groupIdx);
              this.grid.trackPiece(piece);
            },
          });
        });
        this.activeTimeline.push(timer);

        col += 5;
        pieceIndex++;
      }

      // Animate circles
      for (let c = 0; c < decomp.ones; c++) {
        const delay = groupDelay + pieceIndex * stepDelay;
        const currentCol = col; // Capture for closure
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

      // Show running total after this group completes
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

    // Step 3: Flash final equation
    const totalPieces = decomp.fives + decomp.ones;
    const totalAnimTime = startDelay + factorA * (stepDelay * (totalPieces + 1)) + 500;

    const finalTimer = this.scene.time.delayedCall(totalAnimTime, () => {
      const centerX = this.grid.getCellCenter(Math.floor(this.grid.getColCount() / 2), 0).x;
      const bottomY = this.grid.getCellCenter(0, factorA).y + 30;

      const equation = this.scene.add.text(
        centerX,
        bottomY,
        `${factorA} × ${factorB} = ${product}!`,
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
          // Flash effect
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

  clear(): void {
    // Cancel pending animations
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
```

### Acceptance criteria
- [ ] Tier 1 shows ghosted outlines of all expected groups at correct grid positions
- [ ] Tier 2 animates pieces sliding from tray to workspace, one group at a time
- [ ] Running total appears after each group in Tier 2
- [ ] Final equation flashes at the end of Tier 2 animation
- [ ] `onComplete` callback fires after Tier 2 animation finishes
- [ ] `clear()` cancels in-progress animations cleanly

---

## Phase 8: Answer Visualizer

### Files to create

**`src/game/objects/manipulatives/AnswerVisualizer.ts`**

```typescript
// ABOUTME: Shows the correct answer decomposed into visual pieces after a correct response.
// ABOUTME: Reinforces the visual model by showing e.g. 17 = 3 rectangles + 2 circles.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';
import { CompositeGroup } from './CompositeGroup';
import { CirclePiece } from './CirclePiece';
import { RectanglePiece } from './RectanglePiece';
import { WorkspaceGrid } from './WorkspaceGrid';

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

  /**
   * Show the answer as an optimal decomposition.
   * 15 = 3 rectangles
   * 17 = 3 rectangles + 2 circles
   * Pieces animate in one by one with a running count.
   */
  show(answer: number, onComplete: () => void): void {
    this.clear();

    const decomp = CompositeGroup.decompose(answer);

    // Show decomposition label at top
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

    // Animate pieces appearing in a single row
    const row = 1;
    let col = 0;
    let pieceIndex = 0;
    let runningValue = 0;
    const stepDelay = 300;
    const startDelay = 500;

    // Rectangles first
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

    // Circles
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

    // Final callback
    const totalTime = startDelay + pieceIndex * stepDelay + 600;
    const finalTimer = this.scene.time.delayedCall(totalTime, () => {
      onComplete();
    });
    this.activeTimers.push(finalTimer);
  }

  private showValuePop(x: number, y: number, value: number): void {
    // Remove previous pop labels
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
```

### Acceptance criteria
- [ ] `show(15)` renders 3 rectangles in a row
- [ ] `show(17)` renders 3 rectangles + 2 circles
- [ ] Pieces animate in one by one with pop-up running count
- [ ] Decomposition label appears at top ("17 = [rect][rect][rect][circle][circle]")
- [ ] `onComplete` fires after all pieces have appeared

---

## Phase 9: Building-Up Mode

### Files to create

**`src/game/objects/manipulatives/BuildUpManager.ts`**

```typescript
// ABOUTME: Manages the building-up mode for derived fact scaffolding.
// ABOUTME: Shows previous groups and highlights the staging area for the next group.

import Phaser from 'phaser';
import { MANIP } from './ManipulativeConfig';
import { CompositeGroup } from './CompositeGroup';
import { WorkspaceGrid } from './WorkspaceGrid';
import { GroupOutline } from './GroupOutline';
import { ManipulativeEvents, MANIP_EVENTS } from '../../events/ManipulativeEvents';

export class BuildUpManager {
  private scene: Phaser.Scene;
  private grid: WorkspaceGrid;
  private groupOutline: GroupOutline;

  private existingPieces: Phaser.GameObjects.Image[] = [];
  private stagingPieces: Phaser.GameObjects.Image[] = [];
  private labels: Phaser.GameObjects.Text[] = [];
  private promptLabel: Phaser.GameObjects.Text | null = null;
  private isActive = false;

  constructor(scene: Phaser.Scene, grid: WorkspaceGrid) {
    this.scene = scene;
    this.grid = grid;
    this.groupOutline = new GroupOutline(scene);
  }

  /**
   * Start building-up mode.
   * Shows `previousGroups` already-placed groups of `factorB`,
   * then prompts the child to add one more group.
   *
   * Example: for 6x3 after answering 6x2, previousGroups=2, factorB=6
   */
  start(factorA: number, factorB: number, previousGroups: number): void {
    this.reset();
    this.isActive = true;

    const decomp = CompositeGroup.decompose(factorB);
    const groupWidthCells = CompositeGroup.widthInCells(decomp);
    const cellUnit = MANIP.CELL_SIZE + MANIP.CELL_GAP;

    // Place existing groups (non-interactive, slightly dimmed)
    for (let g = 0; g < previousGroups; g++) {
      const pieces = CompositeGroup.placeGroup(this.scene, this.grid, factorB, 0, g, false);
      for (const piece of pieces) {
        piece.setAlpha(0.7);
      }
      this.existingPieces.push(...pieces);
    }

    // Draw group outlines for existing groups
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

    // Show running total of existing groups
    const existingTotal = previousGroups * factorB;
    const totalPos = this.grid.getCellCenter(groupWidthCells + 1, Math.floor(previousGroups / 2));
    const totalLabel = this.scene.add.text(totalPos.x + 20, totalPos.y, String(existingTotal), {
      fontSize: '20px',
      color: '#666666',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.labels.push(totalLabel);

    // Show prompt for the next group
    const newGroupRow = previousGroups;
    const promptPos = this.grid.getCellCenter(0, newGroupRow);

    // Ghost outline for the new group
    const ghostPos = {
      x: promptPos.x - MANIP.CELL_SIZE / 2 - MANIP.GROUP_PADDING,
      y: promptPos.y - MANIP.CELL_SIZE / 2 - MANIP.GROUP_PADDING,
      width: groupWidthCells * cellUnit + MANIP.GROUP_PADDING * 2,
      height: MANIP.CELL_SIZE + MANIP.GROUP_PADDING * 2,
    };

    const ghostGfx = this.scene.add.graphics();
    ghostGfx.lineStyle(2, 0x4CAF50, 0.5);
    ghostGfx.strokeRoundedRect(ghostPos.x, ghostPos.y, ghostPos.width, ghostPos.height, 4);
    // Store for cleanup (using labels array for simplicity)

    // Pulsing animation on the ghost outline
    this.scene.tweens.add({
      targets: ghostGfx,
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

    // Listen for total changes to detect completion
    const targetTotal = factorA * factorB;
    const onTotalChanged = (payload: { total: number }) => {
      if (payload.total >= targetTotal && this.isActive) {
        // Child completed the build-up
        this.promptLabel?.destroy();
        this.promptLabel = null;

        // Show the new total with celebration
        const newTotalLabel = this.scene.add.text(
          totalPos.x + 20,
          totalPos.y + 30,
          `→ ${targetTotal}`,
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

        ManipulativeEvents.off(MANIP_EVENTS.TOTAL_CHANGED, onTotalChanged);
      }
    };

    ManipulativeEvents.on(MANIP_EVENTS.TOTAL_CHANGED, onTotalChanged);
  }

  reset(): void {
    this.isActive = false;

    for (const piece of this.existingPieces) {
      piece.destroy();
    }
    this.existingPieces = [];

    for (const piece of this.stagingPieces) {
      piece.destroy();
    }
    this.stagingPieces = [];

    for (const label of this.labels) {
      label.destroy();
    }
    this.labels = [];

    this.promptLabel?.destroy();
    this.promptLabel = null;

    this.groupOutline.clear();
  }
}
```

### Acceptance criteria
- [ ] Previous groups appear dimmed and non-interactive
- [ ] A pulsing green outline shows where the new group should go
- [ ] Prompt text says "Add one more group of N!"
- [ ] When the child places enough pieces to reach the target total, celebration triggers
- [ ] Running totals update correctly (existing total -> new total)

---

## Phase 10: Scene Registration and Game Scene Integration

### Changes to Game scene (integration point)

The Game scene needs to register the ManipulativesScene and wire up the "blocks" button.

**`src/game/config.ts`** -- add ManipulativesScene to the scene list:

```typescript
// In the Phaser game config:
import { ManipulativesScene } from './scenes/ManipulativesScene';

// Add to scene array:
scene: [BootScene, TitleScene, GameScene, ManipulativesScene, LevelCompleteScene, SessionEndScene]
```

**`src/game/scenes/Game.ts`** -- add blocks button and wire events:

```typescript
// In Game scene create():

// Launch the manipulatives scene (starts hidden)
this.scene.launch('Manipulatives');

// "Blocks" button to open the manipulatives workspace
const blocksButton = this.createBlocksButton();

// When a question is presented and child taps "blocks":
blocksButton.on('pointerdown', () => {
  ManipulativeEvents.emit(MANIP_EVENTS.SHOW, {
    factorA: this.currentQuestion.factorA,
    factorB: this.currentQuestion.factorB,
    correctAnswer: this.currentQuestion.correctAnswer,
  });
});

// When hint button is tapped (tier 1):
// Called from HintButton when hint level reaches 1
this.hintButton.on('hint:tier1', () => {
  ManipulativeEvents.emit(MANIP_EVENTS.SHOW_HINT_TIER1, {
    factorA: this.currentQuestion.factorA,
    factorB: this.currentQuestion.factorB,
    correctAnswer: this.currentQuestion.correctAnswer,
  });
});

// When hint button is tapped again (tier 2):
this.hintButton.on('hint:tier2', () => {
  ManipulativeEvents.emit(MANIP_EVENTS.SHOW_HINT_TIER2, {
    factorA: this.currentQuestion.factorA,
    factorB: this.currentQuestion.factorB,
    correctAnswer: this.currentQuestion.correctAnswer,
  });
});

// After correct answer, show visual decomposition:
ManipulativeEvents.emit(MANIP_EVENTS.SHOW_ANSWER, {
  answer: this.currentQuestion.correctAnswer,
});

// For building-up sequences:
if (this.currentQuestion.isBuildingUp && this.currentQuestion.buildUpSequenceIndex > 0) {
  ManipulativeEvents.emit(MANIP_EVENTS.START_BUILD_UP, {
    factorA: this.currentQuestion.factorA,
    factorB: this.currentQuestion.factorB,
    previousGroups: this.currentQuestion.buildUpSequenceIndex,
  });
}

// Listen for correct total from manipulatives
ManipulativeEvents.on(MANIP_EVENTS.CORRECT_TOTAL, () => {
  // Child built the answer visually -- treat as correct
  this.submitAnswer(this.currentQuestion.correctAnswer);
});
```

**Blocks button design** (in Game scene):

```typescript
private createBlocksButton(): Phaser.GameObjects.Container {
  const x = 50;
  const y = this.scale.height - 50;

  const bg = this.add.circle(x, y, 28, 0x2196F3)
    .setStrokeStyle(2, 0x1976D2);

  // Mini block icon (3 tiny squares arranged in an L)
  const icon = this.add.graphics();
  icon.fillStyle(0xFFFFFF, 0.9);
  icon.fillRect(x - 10, y - 8, 8, 8);
  icon.fillRect(x - 10, y + 2, 8, 8);
  icon.fillRect(x + 2, y + 2, 8, 8);

  const label = this.add.text(x, y + 32, 'Blocks', {
    fontSize: '10px',
    color: '#666666',
    fontFamily: 'Arial',
  }).setOrigin(0.5);

  const container = this.add.container(0, 0, [bg, icon, label]);
  bg.setInteractive({ useHandCursor: true });

  return container;
}
```

### Acceptance criteria
- [ ] ManipulativesScene is registered in Phaser config and launches with Game scene
- [ ] "Blocks" button appears in Game scene and opens manipulatives on tap
- [ ] Hint tiers 1 and 2 flow from HintButton through ManipulativeEvents to ManipulativesScene
- [ ] Answer visualization triggers after correct answer
- [ ] Building-up mode triggers for questions with `isBuildingUp` flag
- [ ] Correct total built in workspace is accepted as a correct answer

---

## Testing Strategy

### Unit tests (Jest/Vitest)

1. **`CompositeGroup.decompose()`**
   - `decompose(0)` -> `{fives: 0, ones: 0}`
   - `decompose(1)` -> `{fives: 0, ones: 1}`
   - `decompose(5)` -> `{fives: 1, ones: 0}`
   - `decompose(6)` -> `{fives: 1, ones: 1}`
   - `decompose(13)` -> `{fives: 2, ones: 3}`
   - `decompose(25)` -> `{fives: 5, ones: 0}`
   - `decompose(47)` -> `{fives: 9, ones: 2}`

2. **`CompositeGroup.widthInCells()`**
   - `widthInCells({fives: 0, ones: 3})` -> 3
   - `widthInCells({fives: 1, ones: 1})` -> 6
   - `widthInCells({fives: 2, ones: 3})` -> 13

3. **`WorkspaceGrid.nearestSnapPosition()`**
   - Returns null for positions outside grid bounds
   - Returns correct col/row for positions near grid cells
   - Returns null for positions far from any grid cell

4. **`WorkspaceGrid.calculateTotal()`**
   - Returns 0 when empty
   - Returns correct sum after tracking mixed pieces

5. **`ManipulativeConfig`** constants validation
   - `RECT_WIDTH === CIRCLE_DIAMETER * 5` (the rectangle = 5 circles rule)

### Manual/integration tests

6. **Drag-and-drop flow**: Drag circle from tray to workspace, verify it snaps and total updates
7. **Tap-to-place flow**: Tap circle in tray, tap workspace, verify piece appears
8. **Remove piece**: Tap placed piece, verify it disappears and total decreases
9. **Tray replenishment**: Drag piece out, verify new one appears in tray
10. **Hint tier 1**: Trigger hint, verify ghost outlines appear at correct positions
11. **Hint tier 2**: Trigger animated hint, verify pieces animate in sequence with running totals
12. **Answer visualization**: Show answer for 17, verify 3 rects + 2 circles appear
13. **Building-up mode**: Start with 2 groups of 6, verify prompt appears for third group
14. **Touch on tablet**: All interactions work with touch (not just mouse)
15. **Reset button**: Clears all pieces and resets total to 0
16. **Close button**: Hides workspace and emits CLOSED event

---

## Risks and Considerations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Phaser Graphics `generateTexture()` quality on high-DPI screens | Medium | Test on Pixel device early. May need to generate at 2x and scale down. |
| Drag performance with many pieces | Low | Object pooling if >20 pieces on screen. Unlikely for multiplication under 100. |
| Scene layering -- input events passing through to Game scene | Medium | Backdrop rectangle with `setInteractive()` absorbs clicks. Test thoroughly. |
| `setInteractive` with custom hit areas on generated textures | Medium | Test that hit areas are correctly positioned relative to image origin. |
| Touch event conflicts between drag and tap | Medium | Use `wasDragged` flag pattern (Phase 6) to distinguish. |
| Grid alignment with rectangle pieces spanning 5 cells | Low | Rectangle center at `col+2` (middle of 5 cells). Validate visually. |
| Building-up mode state cleanup | Medium | `reset()` must be called before every new question. Wire in ManipulativesScene. |
| Memory leaks from undestroyed game objects | Medium | Every `clear()` method destroys all created objects. Test with repeated show/hide cycles. |

---

## Estimated Complexity

| Phase | Effort | Notes |
|-------|--------|-------|
| Phase 1: Constants, Events, Scene Shell | Small | Boilerplate, but establishes all patterns |
| Phase 2: Piece Rendering | Small | Graphics API is straightforward |
| Phase 3: Parts Tray | Small | Simple layout + replenishment |
| Phase 4: Workspace Grid + Snap | Medium | Coordinate math needs care |
| Phase 5: Running Total + Groups | Medium | Composite group logic is the core abstraction |
| Phase 6: Tap-to-Place | Small | Alternative input mode, builds on existing |
| Phase 7: Hint System | Large | Tier 2 animation sequencing is the most complex part |
| Phase 8: Answer Visualizer | Medium | Reuses CompositeGroup heavily |
| Phase 9: Building-Up Mode | Medium | State management across questions |
| Phase 10: Integration | Medium | Wiring events between scenes |

**Total: ~3-4 focused implementation sessions.**

---

## Dependencies on Other Workstreams

| Dependency | From | What's Needed | Can Start Without It? |
|------------|------|---------------|----------------------|
| Phaser game config + React wrapper | Foundation (Agent 1) | `config.ts`, `GameWrapper.tsx` | Yes -- can develop ManipulativesScene in isolation |
| Game scene exists | Game Engine (Agent 2) | `Game.ts` with scene launch | Yes -- scene can be tested standalone |
| HintButton events | Game Engine (Agent 2) | `hint:tier1`, `hint:tier2` events | Yes -- can trigger via ManipulativeEvents directly |
| Question interface | Learning Engine (Agent 4) | `Question.isBuildingUp`, `buildUpSequenceIndex` | Yes -- mock question data |
| Math piece sprites (optional) | Art (Agent 3) | `manipulatives.png` | No dependency -- using generated textures |

The manipulatives workstream can proceed fully in parallel with other workstreams. Integration (Phase 10) is the only part that requires coordination.
