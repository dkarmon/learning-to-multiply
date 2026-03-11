# Implementation Plan: Game Engine

## Implementation Checklist

**Instructions for implementing agent:** Work through this checklist in order. Mark items `[x]` as you complete them. Mark the current item `[→]`. Do NOT skip items. After each phase, commit your work.

### Phase 1: Phaser Config + React Bridge
- [ ] Create `src/game/EventBus.ts` -- Phaser.Events.EventEmitter singleton for React-Phaser communication
- [ ] Create `src/game/config.ts` -- Phaser.AUTO renderer, 1024x768, FIT scaling, Arcade physics (gravity y:800), pixelArt:true, all 5 scenes registered
- [ ] Create `src/components/GameWrapper.tsx` -- React component with useEffect lifecycle, creates/destroys Phaser.Game, bridges EventBus events (`answer-result`, `level-complete`, `brick-placed`) to Zustand store, `touch-action: none` on container div
- [ ] Verify: Phaser renders a blank scene inside the React component, scales with FIT mode, touch input works without scroll interference
- [ ] Commit phase 1

### Phase 2: Boot + Title Scenes
- [ ] Create `src/game/scenes/Boot.ts` -- loading bar (60% width, 32px height), preloads all assets (3 sprite sheets: wrecker/sidekick/fixer, building tiles, particles, UI buttons, backgrounds, manipulatives), registers all sprite animations globally in `createAnimations()`
- [ ] Create `src/game/scenes/Title.ts` -- sky+ground background, "Build It Up!" title with float tween, "A Multiplication Adventure" subtitle, wrecker-idle sprite at 3x scale, 240x80 green Play button with press feedback, transitions to Game scene on tap
- [ ] Verify: Boot shows loading bar that fills, transitions to Title; Play button is tappable and transitions to Game; title text floats gently
- [ ] Commit phase 2

### Phase 3: Building + BrickRow Objects
- [ ] Create `src/game/objects/BrickRow.ts` -- 16x12px bricks, alternating brick/brick-alt textures, `animateStacking()` with staggered drop-in (80ms duration, 30ms delay per brick, Bounce.easeOut), `animateCrumble()` removes 2-3 bricks with physics velocity + angular rotation + fade, `emitDebris()` particle burst
- [ ] Create `src/game/objects/Building.ts` -- container at x:280 y:620, foundation rectangle (200x40, brown), door sprite, `addRow(brickCount)` stacks BrickRows with 2px gap, `addBonusRow(bonusBricks)` for accent rows, `wobble(crumble)` shakes container 6px for 5 repeats, window character configs at floors 2/4/6/8 (fixer-waving, sidekick-silly, fixer-idle, sidekick-idle), `addRoofDecoration()` places waving flag, `adjustCamera()` scrolls container when building exceeds 500px visible area
- [ ] Verify: Building stacks bricks with drop animation, wobbles on wrong answer, crumbles bricks on 2nd wrong, window characters pop in at floor thresholds, camera adjusts for tall buildings
- [ ] **APPROVAL GATE: Show Danny the building mechanic in action**
- [ ] Commit phase 3

### Phase 4: Character Object
- [ ] Create `src/game/objects/Character.ts` -- sprite at x:140 y:580, 2x scale, state machine with states: idle/happy/sad/climbing/waving, maps to `wrecker-{state}` animations, happy+sad auto-return to idle on animationcomplete, `climbTo(buildingTopY)` tweens y with 600ms Sine.easeInOut, `celebrate()` chains happy->waving->idle (3s wave), `reactToWrong()` plays sad once
- [ ] Verify: Character renders beside building with idle breathing, reacts happy on correct, reacts sad on wrong, climbs up as building grows, celebrate sequence plays correctly
- [ ] **APPROVAL GATE: Show Danny the character animations**
- [ ] Commit phase 4

### Phase 5: Numpad + HintButton Objects
- [ ] Create `src/game/objects/Numpad.ts` -- positioned at x:780 y:380, 3x4 grid of 64px buttons with 8px gap, layout: 1-9/backspace/0/submit, answer display area (white bg, blue border, 32px text), color-coded buttons (blue digits, red backspace, green submit), max 3 digits, emits `answer-submitted` with numeric value, `showCorrectFlash()`/`showWrongFlash()` change display bg color, `setEnabled(false)` dims to 0.5 alpha
- [ ] Create `src/game/objects/HintButton.ts` -- positioned at x:780 y:260, 180x56 orange button, shows cost text ("−2 bonus bricks"), level 1 tap: emits `hint-requested {level:1}`, updates cost to "−1 bonus brick", level 2 tap: emits `hint-requested {level:2}`, shows "no bonus", disables button, `reset()` restores to level 0
- [ ] Verify: Numpad accepts multi-digit input, backspace works, submit emits event, display flashes green/red, hint button shows cost, tapping hint updates cost and emits events, both are touch-friendly (64px+ targets)
- [ ] **APPROVAL GATE: Show Danny the numpad and hint button layout**
- [ ] Commit phase 5

### Phase 6: Game Scene (Main Gameplay Loop)
- [ ] Create `src/game/scenes/Game.ts` -- reads `currentQuestions` and `currentLevel` from Zustand on create, renders sky+ground+scrolling clouds, instantiates Building, Character, Numpad, HintButton, question text at top center (48px), feedback text below (24px), question counter at top-left
- [ ] Wire up answer flow: `answer-submitted` event -> `handleAnswer()` validates against `currentQuestion.correctAnswer`, emits `answer-result` with full attempt data (factorA, factorB, correctAnswer, givenAnswer, isCorrect, responseTimeMs, hintLevel, attemptNumber)
- [ ] Implement correct answer flow: flash green, show answer in question text, random encouragement feedback, character happy, `building.addRow(answerValue)`, `building.addBonusRow(bonusBricks)` based on hint level (3/1/0), character climbs, emit `bricks-earned`, 1200ms delay then next question
- [ ] Implement wrong answer flow: 1st attempt -- "Not quite! Try again.", character sad, building wobble (no crumble), re-enable numpad after 600ms; 2nd attempt -- show correct answer, character sad, building wobble+crumble, 2500ms delay then move on
- [ ] Implement hint relay: `hint-requested` -> emit `show-hint` with level, factorA, factorB for Manipulatives agent
- [ ] Implement `endLevel()`: add roof decoration, character celebrate, compute accuracy, 2s delay then transition to LevelComplete with stats, emit `level-complete`
- [ ] Implement `shutdown()`: remove EventBus listeners, destroy all game objects
- [ ] Verify: Full game loop works end-to-end -- question display, numpad input, correct/wrong flows, hint usage, building grows, transitions to LevelComplete after all questions
- [ ] **APPROVAL GATE: Show Danny the full game loop**
- [ ] Commit phase 6

### Phase 7: Particle Effects
- [ ] Create `src/game/effects/Confetti.ts` -- `emitConfetti(scene)` function, 4 colors (red/blue/yellow/green), spawns across full width, drifts down (speedY 100-300, speedX -80 to 80), emits for 3s then stops, particles self-destruct after 4s fade
- [ ] Create `src/game/effects/BrickDebris.ts` -- `emitBrickDebris(scene, x, y)` function, 12 particles, burst from point (angle 200-340), gravityY 500, scale 0.6->0, lifespan 400-800ms, self-destructs after 1.2s
- [ ] Verify: Confetti plays on level complete, debris bursts on wrong answer crumble, all particle managers clean themselves up
- [ ] Commit phase 7

### Phase 8: LevelComplete + SessionEnd Scenes
- [ ] Create `src/game/scenes/LevelComplete.ts` -- warm background, confetti via `emitConfetti()`, "Level Complete!" title with Back.easeOut pop-in, wrecker happy->waving at 3x, score summary (level number, correct/total, bricks earned, accuracy %), "Next Level" green button and "Take a Break" blue button appear after 1.5s delay with fade-in, Next calls `store.advanceLevel()` + starts Game scene, Break starts SessionEnd scene
- [ ] Create `src/game/scenes/SessionEnd.ts` -- "Great Practice!" title, wrecker waving at 3x, session stats table (Questions Answered, Correct Answers, Accuracy, Bricks Earned, Levels Completed) read from `useGameStore`, divider lines, "Play Again" green button calls `store.startNewSession()` + starts Game, "Go Home" blue button emits `go-home` for React Router, emits `session-ended` with session totals
- [ ] Verify: LevelComplete shows correct stats and confetti, Next Level advances properly, Take a Break shows SessionEnd, Play Again resets session, Go Home emits event
- [ ] Commit phase 8

### Phase 9: Scoring System + Zustand Integration
- [ ] Implement bonus brick calculation: no hint = 3 bonus, hint level 1 = 1 bonus, hint level 2 = 0 bonus, wrong answer = 0 bricks total
- [ ] Implement/verify `src/stores/game.ts` Zustand store: `recordResult()` updates totalQuestions/correctAnswers/totalBricks, `completeLevel()` increments levelsCompleted, `advanceLevel()` increments currentLevel, `startNewSession()` resets session counters
- [ ] Extract and unit test pure scoring functions: `calculateBonusBricks(hintLevel)`, `calculateBricksEarned(answer, hintLevel)`
- [ ] Verify: Scores persist across questions within a level, Zustand state reflects game state correctly, session stats accumulate across levels
- [ ] Commit phase 9

### Final
- [ ] All TypeScript compiles without errors
- [ ] Run unit tests for scoring logic and Zustand store actions
- [ ] Run through full game loop manually: 5 questions all correct, mix of wrong answers, hint usage at both levels
- [ ] Verify event catalog: all 13 emitted events fire correctly, all 2 consumed events are handled
- [ ] **APPROVAL GATE: Full demo for Danny**

Generated: 2026-03-11

## Goal

Build the Phaser.js 3 game engine layer for the multiplication learning game. This covers all
Phaser scenes, the building/brick mechanic, character animations, on-screen numpad, hint button,
scoring system, and the React-Phaser bridge. The game engine receives questions from the Learning
Engine (via Zustand), renders the game world, and emits events back to Zustand for persistence
and audio hooks.

## Phaser Version

Use `phaser@^3.90.0` (the latest stable v3 release, "Tsugumi"). Phaser v4 is still in RC and
not production-ready.

## Architecture Overview

```
React (Zustand stores)
  │
  ├─ GameWrapper.tsx ──── creates/destroys Phaser.Game instance
  │                        passes store references via scene data
  │
  └─ EventBus ─────────── Phaser.Events.EventEmitter singleton
       │                    React emits: 'start-level', 'submit-answer', 'request-hint'
       │                    Phaser emits: 'answer-result', 'level-complete', 'brick-placed'
       │
       ├─ Boot scene ───── preloads assets, shows loading bar
       ├─ Title scene ──── start screen with Play button
       ├─ Game scene ───── main gameplay loop
       │    ├─ Building ── brick rows, window characters
       │    ├─ BrickRow ── individual brick sprites + animations
       │    ├─ Character ─ animated sprite with states
       │    ├─ Numpad ──── on-screen calculator input
       │    └─ HintButton ─ hint with cost display
       ├─ LevelComplete ── celebration + score summary
       └─ SessionEnd ───── session summary + navigation
```

**Source of truth:** Zustand. Phaser reads state from Zustand on scene creation and emits events
that Zustand reducers process. Phaser never writes to Firestore directly.

---

## Phase 1: Phaser Config + React Bridge

### File: `src/game/EventBus.ts`

```typescript
// ABOUTME: Singleton event bus bridging React and Phaser communication.
// ABOUTME: Both layers emit/listen on this shared EventEmitter instance.

import Phaser from 'phaser';

export const EventBus = new Phaser.Events.EventEmitter();
```

### File: `src/game/config.ts`

```typescript
// ABOUTME: Phaser game configuration with Arcade physics and responsive scaling.
// ABOUTME: Registers all game scenes and configures touch/pointer input.

import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Title } from './scenes/Title';
import { Game } from './scenes/Game';
import { LevelComplete } from './scenes/LevelComplete';
import { SessionEnd } from './scenes/SessionEnd';

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'phaser-container',
  backgroundColor: '#FFF8E1',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      // Enable debug drawing during development:
      // debug: true,
    },
  },
  scene: [Boot, Title, Game, LevelComplete, SessionEnd],
  input: {
    activePointers: 3,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
};
```

### File: `src/components/GameWrapper.tsx`

```tsx
// ABOUTME: React component that hosts the Phaser game instance.
// ABOUTME: Handles lifecycle (create on mount, destroy on unmount) and store bridging.

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config';
import { EventBus } from '../game/EventBus';
import { useGameStore } from '../stores/game';

export function GameWrapper() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      ...gameConfig,
      parent: containerRef.current,
    };

    gameRef.current = new Phaser.Game(config);

    // Bridge: React listens to Phaser events and updates Zustand
    const handleAnswerResult = (data: {
      isCorrect: boolean;
      bricksEarned: number;
      bonusBricks: number;
    }) => {
      const store = useGameStore.getState();
      store.recordResult(data);
    };

    const handleLevelComplete = (data: {
      levelNumber: number;
      totalBricks: number;
      accuracy: number;
    }) => {
      const store = useGameStore.getState();
      store.completeLevel(data);
    };

    const handleBrickPlaced = () => {
      // Audio agent hooks into this event for brick-place sound
    };

    EventBus.on('answer-result', handleAnswerResult);
    EventBus.on('level-complete', handleLevelComplete);
    EventBus.on('brick-placed', handleBrickPlaced);

    return () => {
      EventBus.off('answer-result', handleAnswerResult);
      EventBus.off('level-complete', handleLevelComplete);
      EventBus.off('brick-placed', handleBrickPlaced);

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="phaser-container"
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    />
  );
}
```

### Acceptance Criteria
- [ ] Phaser game renders inside React component
- [ ] Game scales responsively with FIT mode
- [ ] EventBus can send messages both directions
- [ ] Game destroys cleanly on unmount (no memory leaks)
- [ ] Touch input works on mobile (no scroll interference)

---

## Phase 2: Boot + Title Scenes

### File: `src/game/scenes/Boot.ts`

```typescript
// ABOUTME: Preloads all game assets and displays a loading progress bar.
// ABOUTME: Transitions to the Title scene when loading completes.

import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class Boot extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    // Loading bar
    const { width, height } = this.cameras.main;
    const barWidth = width * 0.6;
    const barHeight = 32;
    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    const bgBar = this.add.rectangle(
      width / 2, barY, barWidth, barHeight, 0x06628d
    );
    bgBar.setStrokeStyle(2, 0x3c0f0f);

    const fillBar = this.add.rectangle(
      barX + 2, barY, 0, barHeight - 4, 0x2aa7c9
    );
    fillBar.setOrigin(0, 0.5);

    const loadingText = this.add.text(width / 2, barY - 40, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#3c0f0f',
    });
    loadingText.setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      fillBar.width = (barWidth - 4) * value;
    });

    this.load.on('complete', () => {
      loadingText.destroy();
      bgBar.destroy();
      fillBar.destroy();
    });

    // --- Character sprite sheets ---
    this.load.spritesheet('wrecker', 'assets/sprites/wrecker.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('sidekick', 'assets/sprites/sidekick.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('fixer', 'assets/sprites/fixer.png', {
      frameWidth: 48,
      frameHeight: 48,
    });

    // --- Building tiles ---
    this.load.image('brick', 'assets/tiles/brick.png');
    this.load.image('brick-alt', 'assets/tiles/brick-alt.png');
    this.load.image('window-empty', 'assets/tiles/window-empty.png');
    this.load.image('window-cat', 'assets/tiles/window-cat.png');
    this.load.image('window-fixer', 'assets/tiles/window-fixer.png');
    this.load.image('window-bird', 'assets/tiles/window-bird.png');
    this.load.image('window-sidekick', 'assets/tiles/window-sidekick.png');
    this.load.image('roof', 'assets/tiles/roof.png');
    this.load.image('flag', 'assets/tiles/flag.png');
    this.load.image('door', 'assets/tiles/door.png');

    // --- Particles ---
    this.load.image('confetti-red', 'assets/particles/confetti-red.png');
    this.load.image('confetti-blue', 'assets/particles/confetti-blue.png');
    this.load.image('confetti-yellow', 'assets/particles/confetti-yellow.png');
    this.load.image('confetti-green', 'assets/particles/confetti-green.png');
    this.load.image('brick-debris', 'assets/particles/brick-debris.png');
    this.load.image('sparkle', 'assets/particles/sparkle.png');

    // --- UI ---
    this.load.image('btn-normal', 'assets/ui/btn-normal.png');
    this.load.image('btn-pressed', 'assets/ui/btn-pressed.png');
    this.load.image('btn-hint', 'assets/ui/btn-hint.png');
    this.load.image('btn-submit', 'assets/ui/btn-submit.png');
    this.load.image('btn-backspace', 'assets/ui/btn-backspace.png');

    // --- Background ---
    this.load.image('sky', 'assets/bg/sky.png');
    this.load.image('ground', 'assets/bg/ground.png');
    this.load.image('clouds', 'assets/bg/clouds.png');

    // --- Manipulatives ---
    this.load.image('circle-unit', 'assets/sprites/circle-unit.png');
    this.load.image('rect-unit', 'assets/sprites/rect-unit.png');
  }

  create(): void {
    // Register sprite animations (global -- available to all scenes)
    this.createAnimations();

    EventBus.emit('assets-loaded');
    this.scene.start('Title');
  }

  private createAnimations(): void {
    // Wrecker animations
    this.anims.create({
      key: 'wrecker-idle',
      frames: this.anims.generateFrameNumbers('wrecker', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: 'wrecker-happy',
      frames: this.anims.generateFrameNumbers('wrecker', { start: 4, end: 9 }),
      frameRate: 8,
      repeat: 0,
    });
    this.anims.create({
      key: 'wrecker-sad',
      frames: this.anims.generateFrameNumbers('wrecker', { start: 10, end: 15 }),
      frameRate: 6,
      repeat: 0,
    });
    this.anims.create({
      key: 'wrecker-climbing',
      frames: this.anims.generateFrameNumbers('wrecker', { start: 16, end: 21 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'wrecker-waving',
      frames: this.anims.generateFrameNumbers('wrecker', { start: 22, end: 25 }),
      frameRate: 6,
      repeat: -1,
    });

    // Fixer animations (appears in windows)
    this.anims.create({
      key: 'fixer-waving',
      frames: this.anims.generateFrameNumbers('fixer', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: 'fixer-idle',
      frames: this.anims.generateFrameNumbers('fixer', { start: 4, end: 7 }),
      frameRate: 3,
      repeat: -1,
    });

    // Sidekick animations (appears in windows)
    this.anims.create({
      key: 'sidekick-silly',
      frames: this.anims.generateFrameNumbers('sidekick', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'sidekick-idle',
      frames: this.anims.generateFrameNumbers('sidekick', { start: 6, end: 9 }),
      frameRate: 3,
      repeat: -1,
    });
  }
}
```

### File: `src/game/scenes/Title.ts`

```typescript
// ABOUTME: Title screen with character idle animation and a large Play button.
// ABOUTME: Transitions to the Game scene when Play is tapped.

import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class Title extends Phaser.Scene {
  constructor() {
    super({ key: 'Title' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Sky background
    this.add.image(width / 2, height / 2, 'sky')
      .setDisplaySize(width, height);

    // Ground
    this.add.image(width / 2, height - 40, 'ground')
      .setDisplaySize(width, 80);

    // Game title
    const titleText = this.add.text(width / 2, height * 0.2, 'Build It Up!', {
      fontFamily: 'Arial Black',
      fontSize: '64px',
      color: '#3c0f0f',
      stroke: '#e46b43',
      strokeThickness: 6,
    });
    titleText.setOrigin(0.5);

    // Subtitle
    const subtitleText = this.add.text(width / 2, height * 0.3, 'A Multiplication Adventure', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#06628d',
    });
    subtitleText.setOrigin(0.5);

    // Character idle animation
    const character = this.add.sprite(width / 2, height * 0.55, 'wrecker');
    character.setScale(3);
    character.play('wrecker-idle');

    // Play button -- large, touch-friendly
    const playBtn = this.add.container(width / 2, height * 0.8);

    const btnBg = this.add.rectangle(0, 0, 240, 80, 0x4caf50, 1);
    btnBg.setStrokeStyle(4, 0x388e3c);
    btnBg.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(0, 0, 'PLAY!', {
      fontFamily: 'Arial Black',
      fontSize: '40px',
      color: '#ffffff',
    });
    btnText.setOrigin(0.5);

    playBtn.add([btnBg, btnText]);

    // Button press feedback
    btnBg.on('pointerdown', () => {
      btnBg.setFillStyle(0x388e3c);
      btnBg.setScale(0.95);
      btnText.setScale(0.95);
    });

    btnBg.on('pointerup', () => {
      btnBg.setFillStyle(0x4caf50);
      btnBg.setScale(1);
      btnText.setScale(1);
      EventBus.emit('play-pressed');
      this.scene.start('Game');
    });

    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x4caf50);
      btnBg.setScale(1);
      btnText.setScale(1);
    });

    // Gentle title float animation
    this.tweens.add({
      targets: titleText,
      y: titleText.y - 8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    EventBus.emit('current-scene-ready', this);
  }
}
```

### Acceptance Criteria
- [ ] Boot scene shows loading bar that fills as assets load
- [ ] All sprite animations are registered globally
- [ ] Title scene renders with character idle animation
- [ ] Play button is at least 240x80px (touch-friendly)
- [ ] Tapping Play transitions to Game scene
- [ ] Title text has a gentle floating animation

---

## Phase 3: Building + BrickRow Objects

### File: `src/game/objects/BrickRow.ts`

```typescript
// ABOUTME: Renders a single row of bricks representing one answered question.
// ABOUTME: Handles stacking animation (bricks appear one by one) and crumble effects.

import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export const BRICK_WIDTH = 16;
export const BRICK_HEIGHT = 12;

export class BrickRow {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bricks: Phaser.GameObjects.Image[] = [];
  private baseX: number;
  private baseY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public readonly brickCount: number,
  ) {
    this.scene = scene;
    this.baseX = x;
    this.baseY = y;
    this.container = scene.add.container(x, y);
  }

  /**
   * Animate bricks appearing one by one from left to right.
   * Returns a promise that resolves when the full row is placed.
   */
  async animateStacking(): Promise<void> {
    const totalWidth = this.brickCount * BRICK_WIDTH;
    const startX = -totalWidth / 2;

    for (let i = 0; i < this.brickCount; i++) {
      const brickKey = i % 3 === 0 ? 'brick-alt' : 'brick';
      const brick = this.scene.add.image(
        startX + i * BRICK_WIDTH + BRICK_WIDTH / 2,
        -20,  // Start above final position
        brickKey,
      );
      brick.setDisplaySize(BRICK_WIDTH, BRICK_HEIGHT);
      brick.setAlpha(0);

      this.container.add(brick);
      this.bricks.push(brick);

      // Stagger each brick's drop-in animation
      await new Promise<void>((resolve) => {
        this.scene.tweens.add({
          targets: brick,
          y: 0,
          alpha: 1,
          duration: 80,
          delay: i * 30,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            EventBus.emit('brick-placed');
            resolve();
          },
        });
      });
    }
  }

  /**
   * Animate a few bricks crumbling off (wrong answer feedback).
   * Removes 2-4 visual bricks with physics-enabled falling.
   */
  animateCrumble(): void {
    const crumbleCount = Math.min(3, this.bricks.length);
    const bricksToRemove = this.bricks.splice(-crumbleCount, crumbleCount);

    for (const brick of bricksToRemove) {
      // Get world position before removing from container
      const worldPos = this.container.getWorldTransformMatrix();
      const wx = worldPos.tx + brick.x;
      const wy = worldPos.ty + brick.y;

      // Remove from container, add as physics object
      this.container.remove(brick);
      brick.setPosition(wx, wy);
      this.scene.children.add(brick);

      // Enable physics for falling
      this.scene.physics.add.existing(brick);
      const body = brick.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-200, -50),
      );
      body.setAngularVelocity(Phaser.Math.Between(-300, 300));

      // Fade out and destroy
      this.scene.tweens.add({
        targets: brick,
        alpha: 0,
        duration: 800,
        delay: 200,
        onComplete: () => brick.destroy(),
      });
    }

    // Spawn debris particles at row position
    this.emitDebris();
  }

  private emitDebris(): void {
    const worldPos = this.container.getWorldTransformMatrix();

    const particles = this.scene.add.particles(
      worldPos.tx, worldPos.ty, 'brick-debris',
      {
        speed: { min: 50, max: 150 },
        angle: { min: 220, max: 320 },
        lifespan: 600,
        quantity: 8,
        scale: { start: 0.5, end: 0 },
        gravityY: 400,
        emitting: false,
      },
    );
    particles.explode();

    // Clean up particle manager after animation
    this.scene.time.delayedCall(1000, () => particles.destroy());
  }

  getHeight(): number {
    return BRICK_HEIGHT;
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  destroy(): void {
    this.container.destroy();
  }
}
```

### File: `src/game/objects/Building.ts`

```typescript
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
const BUILDING_BASE_Y = 620;
const FOUNDATION_HEIGHT = 40;
const ROW_GAP = 2;

export class Building {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private rows: BrickRow[] = [];
  private windowSprites: Phaser.GameObjects.Sprite[] = [];
  private foundation: Phaser.GameObjects.Rectangle;
  private door: Phaser.GameObjects.Image;
  private totalHeight: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(BUILDING_X, BUILDING_BASE_Y);

    // Foundation block
    this.foundation = scene.add.rectangle(
      0, 0,
      200, FOUNDATION_HEIGHT,
      0x8b4513,
    );
    this.foundation.setOrigin(0.5, 1);
    this.foundation.setStrokeStyle(2, 0x3c0f0f);
    this.container.add(this.foundation);

    // Door on foundation
    this.door = scene.add.image(0, -4, 'door');
    this.door.setDisplaySize(24, 32);
    this.door.setOrigin(0.5, 1);
    this.container.add(this.door);

    this.totalHeight = FOUNDATION_HEIGHT;
  }

  /**
   * Add a new row of bricks for a correct answer.
   * Returns a promise that resolves when the stacking animation finishes.
   */
  async addRow(brickCount: number): Promise<void> {
    const rowY = -(this.totalHeight + ROW_GAP);

    const row = new BrickRow(
      this.scene,
      0,
      rowY,
      brickCount,
    );

    this.container.add(row.getContainer());
    this.rows.push(row);

    await row.animateStacking();

    this.totalHeight += BRICK_HEIGHT + ROW_GAP;

    // Check if we should add a window character at this floor
    this.checkWindowCharacters();

    // Scroll building down if it's getting tall (camera follows)
    this.adjustCamera();
  }

  /**
   * Add bonus bricks as a smaller accent row on top.
   */
  async addBonusRow(bonusBricks: number): Promise<void> {
    if (bonusBricks <= 0) return;

    const rowY = -(this.totalHeight + ROW_GAP);

    const row = new BrickRow(this.scene, 0, rowY, bonusBricks);
    this.container.add(row.getContainer());
    this.rows.push(row);

    await row.animateStacking();

    this.totalHeight += BRICK_HEIGHT + ROW_GAP;
  }

  /**
   * Wobble the building on wrong answer. Nothing falls by default.
   * If intensity > 0, crumble a few bricks from the top row.
   */
  wobble(crumble: boolean = false): void {
    // Shake the whole building container
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

    // Place window character to the right of the brick row
    const windowX = 70;
    const windowY = rowContainer.y;

    // Window background
    const windowBg = this.scene.add.image(windowX, windowY, 'window-empty');
    windowBg.setDisplaySize(32, 32);
    this.container.add(windowBg);

    // Character sprite in the window
    const sprite = this.scene.add.sprite(windowX, windowY - 4, config.spriteKey);
    sprite.setScale(0.5);
    sprite.play(config.animKey);
    this.container.add(sprite);
    this.windowSprites.push(sprite);

    // Pop-in animation
    sprite.setScale(0);
    this.scene.tweens.add({
      targets: sprite,
      scale: 0.5,
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  private adjustCamera(): void {
    // If building exceeds visible area, scroll the container down
    const visibleHeight = 500; // area above ground
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

  /**
   * Add a flag/decoration to the top of the building (level complete).
   */
  addRoofDecoration(): void {
    const flagY = -(this.totalHeight + 20);
    const flag = this.scene.add.image(0, flagY, 'flag');
    flag.setDisplaySize(32, 32);
    flag.setOrigin(0.5, 1);
    this.container.add(flag);

    // Wave animation
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
```

### Acceptance Criteria
- [ ] Building renders on the left side of the screen with a foundation
- [ ] Correct answer adds a BrickRow with stacking animation
- [ ] Brick count in row matches the answer value
- [ ] Wrong answer causes building wobble + optional crumble of a few bricks
- [ ] Window characters appear at floors 2, 4, 6, 8 with pop-in animation
- [ ] Building scrolls to stay visible as it grows tall
- [ ] Flag decoration can be added on level complete

---

## Phase 4: Character Object

### File: `src/game/objects/Character.ts`

```typescript
// ABOUTME: Animated character sprite positioned beside the building.
// ABOUTME: Supports idle, happy, sad, climbing, and waving animation states.

import Phaser from 'phaser';

export type CharacterState = 'idle' | 'happy' | 'sad' | 'climbing' | 'waving';

const CHARACTER_X = 140;
const CHARACTER_BASE_Y = 580;

export class Character {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private currentState: CharacterState = 'idle';
  private targetY: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.targetY = CHARACTER_BASE_Y;

    this.sprite = scene.add.sprite(CHARACTER_X, CHARACTER_BASE_Y, 'wrecker');
    this.sprite.setScale(2);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.play('wrecker-idle');
  }

  setState(state: CharacterState): void {
    if (state === this.currentState) return;
    this.currentState = state;

    const animKey = `wrecker-${state}`;

    this.sprite.play(animKey);

    // Return to idle after one-shot animations
    if (state === 'happy' || state === 'sad') {
      this.sprite.once('animationcomplete', () => {
        this.currentState = 'idle';
        this.sprite.play('wrecker-idle');
      });
    }
  }

  /**
   * Animate the character climbing up to match the building height.
   */
  climbTo(buildingTopY: number): void {
    const newY = Math.min(CHARACTER_BASE_Y, buildingTopY + 40);

    if (Math.abs(newY - this.targetY) < 5) return;

    this.targetY = newY;
    this.setState('climbing');

    this.scene.tweens.add({
      targets: this.sprite,
      y: this.targetY,
      duration: 600,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.setState('idle');
      },
    });
  }

  /**
   * Play a celebration sequence: happy dance then waving.
   */
  celebrate(): void {
    this.setState('happy');
    this.sprite.once('animationcomplete', () => {
      this.setState('waving');
      // Wave for 3 seconds, then idle
      this.scene.time.delayedCall(3000, () => {
        this.setState('idle');
      });
    });
  }

  /**
   * Gentle reaction for wrong answer -- not punishing.
   */
  reactToWrong(): void {
    this.setState('sad');
    // Sad plays once, then auto-returns to idle (handled in setState)
  }

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
```

### Acceptance Criteria
- [ ] Character renders beside the building with idle animation
- [ ] Happy animation plays on correct answer, returns to idle
- [ ] Sad animation plays on wrong answer, returns to idle
- [ ] Character climbs up as building grows
- [ ] Celebrate sequence plays happy then waving

---

## Phase 5: Numpad + HintButton Objects

### File: `src/game/objects/Numpad.ts`

```typescript
// ABOUTME: On-screen calculator-style numpad for answer input.
// ABOUTME: Renders a 3x4 grid (1-9, backspace, 0, submit) with touch-friendly buttons.

import Phaser from 'phaser';
import { EventBus } from '../EventBus';

const BUTTON_SIZE = 64;
const BUTTON_GAP = 8;
const GRID_COLS = 3;

const BUTTON_LABELS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '⌫', '0', '✓',
];

const NUMPAD_X = 780;
const NUMPAD_Y = 380;

export class Numpad {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private displayText: Phaser.GameObjects.Text;
  private displayBg: Phaser.GameObjects.Rectangle;
  private currentValue: string = '';
  private enabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(NUMPAD_X, NUMPAD_Y);

    // Answer display area above numpad
    const displayWidth = GRID_COLS * (BUTTON_SIZE + BUTTON_GAP) - BUTTON_GAP;

    this.displayBg = scene.add.rectangle(
      displayWidth / 2, -50,
      displayWidth, 48,
      0xffffff,
    );
    this.displayBg.setStrokeStyle(3, 0x06628d);
    this.container.add(this.displayBg);

    this.displayText = scene.add.text(displayWidth / 2, -50, '', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#3c0f0f',
    });
    this.displayText.setOrigin(0.5);
    this.container.add(this.displayText);

    // Build button grid
    for (let i = 0; i < BUTTON_LABELS.length; i++) {
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const label = BUTTON_LABELS[i];

      const x = col * (BUTTON_SIZE + BUTTON_GAP);
      const y = row * (BUTTON_SIZE + BUTTON_GAP);

      this.createButton(x, y, label);
    }
  }

  private createButton(x: number, y: number, label: string): void {
    let bgColor: number;
    if (label === '✓') {
      bgColor = 0x4caf50;
    } else if (label === '⌫') {
      bgColor = 0xef5350;
    } else {
      bgColor = 0x06628d;
    }

    const bg = this.scene.add.rectangle(
      x + BUTTON_SIZE / 2,
      y + BUTTON_SIZE / 2,
      BUTTON_SIZE,
      BUTTON_SIZE,
      bgColor,
    );
    bg.setStrokeStyle(2, 0x3c0f0f);
    bg.setInteractive({ useHandCursor: true });
    this.container.add(bg);

    const text = this.scene.add.text(
      x + BUTTON_SIZE / 2,
      y + BUTTON_SIZE / 2,
      label,
      {
        fontFamily: 'Arial Black',
        fontSize: '28px',
        color: '#ffffff',
      },
    );
    text.setOrigin(0.5);
    this.container.add(text);

    // Press feedback
    bg.on('pointerdown', () => {
      if (!this.enabled) return;
      bg.setScale(0.9);
      text.setScale(0.9);
      EventBus.emit('button-tap');
    });

    bg.on('pointerup', () => {
      if (!this.enabled) return;
      bg.setScale(1);
      text.setScale(1);
      this.handleInput(label);
    });

    bg.on('pointerout', () => {
      bg.setScale(1);
      text.setScale(1);
    });
  }

  private handleInput(label: string): void {
    if (label === '⌫') {
      this.currentValue = this.currentValue.slice(0, -1);
    } else if (label === '✓') {
      this.submit();
      return;
    } else {
      // Digit -- max 3 digits (answers go up to 100)
      if (this.currentValue.length < 3) {
        this.currentValue += label;
      }
    }

    this.displayText.setText(this.currentValue);
    this.pulseDisplay();
  }

  private submit(): void {
    if (this.currentValue === '') return;

    const answer = parseInt(this.currentValue, 10);
    EventBus.emit('answer-submitted', answer);
    this.setEnabled(false);
  }

  private pulseDisplay(): void {
    this.scene.tweens.add({
      targets: this.displayBg,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 80,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  clear(): void {
    this.currentValue = '';
    this.displayText.setText('');
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.container.setAlpha(enabled ? 1 : 0.5);
  }

  showCorrectFlash(): void {
    this.displayBg.setFillStyle(0x4caf50);
    this.scene.time.delayedCall(400, () => {
      this.displayBg.setFillStyle(0xffffff);
    });
  }

  showWrongFlash(): void {
    this.displayBg.setFillStyle(0xef5350);
    this.scene.time.delayedCall(400, () => {
      this.displayBg.setFillStyle(0xffffff);
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}
```

### File: `src/game/objects/HintButton.ts`

```typescript
// ABOUTME: Hint button that shows bonus brick cost before the child taps.
// ABOUTME: Supports two hint levels with decreasing bonus brick rewards.

import Phaser from 'phaser';
import { EventBus } from '../EventBus';

const HINT_X = 780;
const HINT_Y = 260;

export class HintButton {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private labelText: Phaser.GameObjects.Text;
  private costText: Phaser.GameObjects.Text;
  private hintLevel: 0 | 1 | 2 = 0;
  private enabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(HINT_X, HINT_Y);

    // Button background
    this.bg = scene.add.rectangle(0, 0, 180, 56, 0xe46b43);
    this.bg.setStrokeStyle(2, 0x3c0f0f);
    this.bg.setInteractive({ useHandCursor: true });
    this.container.add(this.bg);

    // "Hint" label
    this.labelText = scene.add.text(0, -10, 'Hint 💡', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff',
    });
    this.labelText.setOrigin(0.5);
    this.container.add(this.labelText);

    // Cost display
    this.costText = scene.add.text(0, 14, '−2 bonus bricks', {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#FFF8E1',
    });
    this.costText.setOrigin(0.5);
    this.container.add(this.costText);

    // Tap handler
    this.bg.on('pointerdown', () => {
      if (!this.enabled) return;
      this.bg.setScale(0.95);
    });

    this.bg.on('pointerup', () => {
      if (!this.enabled) return;
      this.bg.setScale(1);
      this.onTap();
    });

    this.bg.on('pointerout', () => {
      this.bg.setScale(1);
    });
  }

  private onTap(): void {
    if (this.hintLevel >= 2) return;

    this.hintLevel++;

    if (this.hintLevel === 1) {
      // First hint used: show visual groups
      this.costText.setText('−1 bonus brick');
      this.bg.setFillStyle(0xd4845b);
      EventBus.emit('hint-requested', { level: 1 });
    } else if (this.hintLevel === 2) {
      // Second hint used: animate full solution
      this.costText.setText('no bonus');
      this.bg.setFillStyle(0x8b4513);
      this.setEnabled(false);
      EventBus.emit('hint-requested', { level: 2 });
    }

    EventBus.emit('button-tap');
  }

  /**
   * Reset for a new question.
   */
  reset(): void {
    this.hintLevel = 0;
    this.costText.setText('−2 bonus bricks');
    this.bg.setFillStyle(0xe46b43);
    this.setEnabled(true);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.container.setAlpha(enabled ? 1 : 0.6);
  }

  getHintLevel(): 0 | 1 | 2 {
    return this.hintLevel;
  }

  destroy(): void {
    this.container.destroy();
  }
}
```

### Acceptance Criteria
- [ ] Numpad renders as 3x4 grid with 64x64px touch targets
- [ ] Digit buttons build multi-digit answer in display area
- [ ] Backspace removes last digit
- [ ] Submit emits 'answer-submitted' event with numeric value
- [ ] Numpad disables after submit (prevents double-submit)
- [ ] Display flashes green on correct, red on wrong
- [ ] HintButton shows cost before first tap ("−2 bonus bricks")
- [ ] First tap emits hint level 1, updates cost to "−1 bonus brick"
- [ ] Second tap emits hint level 2, disables button
- [ ] HintButton resets between questions

---

## Phase 6: Game Scene (Main Gameplay Loop)

### File: `src/game/scenes/Game.ts`

```typescript
// ABOUTME: Main gameplay scene: question display, building, numpad, and answer flow.
// ABOUTME: Orchestrates the loop: show question -> wait for answer -> animate result -> next.

import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { Building } from '../objects/Building';
import { Character } from '../objects/Character';
import { Numpad } from '../objects/Numpad';
import { HintButton } from '../objects/HintButton';
import type { Question, LevelPlan } from '../../types';
import { useGameStore } from '../../stores/game';

const QUESTIONS_PER_LEVEL = 5;

export class Game extends Phaser.Scene {
  private building!: Building;
  private character!: Character;
  private numpad!: Numpad;
  private hintButton!: HintButton;
  private questionText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private questionCountText!: Phaser.GameObjects.Text;

  private questions: Question[] = [];
  private currentQuestionIndex: number = 0;
  private currentQuestion: Question | null = null;
  private attemptCount: number = 0;
  private levelNumber: number = 1;
  private totalBricksThisLevel: number = 0;
  private correctCount: number = 0;
  private questionStartTime: number = 0;

  constructor() {
    super({ key: 'Game' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Read current level plan from Zustand
    const gameState = useGameStore.getState();
    this.levelNumber = gameState.currentLevel;
    this.questions = gameState.currentQuestions;
    this.currentQuestionIndex = 0;
    this.totalBricksThisLevel = 0;
    this.correctCount = 0;

    // Background
    this.add.image(width / 2, height / 2, 'sky').setDisplaySize(width, height);
    this.add.image(width / 2, height - 40, 'ground').setDisplaySize(width, 80);

    // Scrolling clouds
    const clouds = this.add.tileSprite(width / 2, 80, width, 120, 'clouds');
    clouds.setAlpha(0.6);
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => { clouds.tilePositionX += 0.3; },
    });

    // Building (left side)
    this.building = new Building(this);

    // Character (beside building)
    this.character = new Character(this);

    // Question display (top center)
    this.questionText = this.add.text(width / 2, 60, '', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#3c0f0f',
      stroke: '#FFF8E1',
      strokeThickness: 4,
    });
    this.questionText.setOrigin(0.5);

    // Feedback text (below question)
    this.feedbackText = this.add.text(width / 2, 120, '', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#06628d',
    });
    this.feedbackText.setOrigin(0.5);
    this.feedbackText.setAlpha(0);

    // Question counter (top left)
    this.questionCountText = this.add.text(20, 20, '', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#06628d',
    });

    // Numpad (right side)
    this.numpad = new Numpad(this);

    // Hint button (above numpad, right side)
    this.hintButton = new HintButton(this);

    // Listen for answer submissions
    EventBus.on('answer-submitted', this.handleAnswer, this);
    EventBus.on('hint-requested', this.handleHint, this);

    // Start first question
    this.showQuestion();

    EventBus.emit('current-scene-ready', this);
  }

  private showQuestion(): void {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.endLevel();
      return;
    }

    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.attemptCount = 0;
    this.questionStartTime = Date.now();

    // Update display
    const q = this.currentQuestion;
    this.questionText.setText(`${q.factorA} × ${q.factorB} = ?`);
    this.updateQuestionCounter();

    // Reset input state
    this.numpad.clear();
    this.numpad.setEnabled(true);
    this.hintButton.reset();

    // Fade out any previous feedback
    this.feedbackText.setAlpha(0);
  }

  private handleAnswer = (givenAnswer: number): void => {
    if (!this.currentQuestion) return;

    const q = this.currentQuestion;
    const isCorrect = givenAnswer === q.correctAnswer;
    const responseTimeMs = Date.now() - this.questionStartTime;
    this.attemptCount++;

    // Emit attempt data for Zustand to record
    EventBus.emit('answer-result', {
      factorA: q.factorA,
      factorB: q.factorB,
      correctAnswer: q.correctAnswer,
      givenAnswer,
      isCorrect,
      responseTimeMs,
      hintLevel: this.hintButton.getHintLevel(),
      attemptNumber: this.attemptCount,
    });

    if (isCorrect) {
      this.handleCorrect(q);
    } else {
      this.handleWrong(q);
    }
  };

  private async handleCorrect(question: Question): Promise<void> {
    const hintLevel = this.hintButton.getHintLevel();

    // Calculate bricks
    const answerBricks = question.correctAnswer;
    let bonusBricks: number;
    if (hintLevel === 0) {
      bonusBricks = 3;
    } else if (hintLevel === 1) {
      bonusBricks = 1;
    } else {
      bonusBricks = 0;
    }

    this.numpad.showCorrectFlash();
    this.numpad.setEnabled(false);
    this.hintButton.setEnabled(false);

    // Show the answer in the question
    this.questionText.setText(
      `${question.factorA} × ${question.factorB} = ${question.correctAnswer}`
    );

    // Feedback
    this.showFeedback('correct');

    // Character reacts
    this.character.setState('happy');

    // Add bricks with animation
    await this.building.addRow(answerBricks);

    if (bonusBricks > 0) {
      await this.building.addBonusRow(bonusBricks);
    }

    this.totalBricksThisLevel += answerBricks + bonusBricks;
    this.correctCount++;

    // Character climbs up
    this.character.climbTo(this.building.getTopY());

    // Emit for scoring sync
    EventBus.emit('bricks-earned', {
      answerBricks,
      bonusBricks,
      totalBricks: this.totalBricksThisLevel,
    });

    // Move to next question after a short pause
    this.time.delayedCall(1200, () => {
      this.currentQuestionIndex++;
      this.showQuestion();
    });
  }

  private handleWrong(question: Question): void {
    this.numpad.showWrongFlash();

    if (this.attemptCount === 1) {
      // First wrong attempt: "Not quite! Try again."
      this.showFeedback('tryAgain');
      this.character.reactToWrong();
      this.building.wobble(false);

      // Re-enable input for retry
      this.time.delayedCall(600, () => {
        this.numpad.clear();
        this.numpad.setEnabled(true);
      });
    } else {
      // Second wrong attempt: show the answer with visual explanation
      this.showFeedback('showAnswer', question.correctAnswer);
      this.character.reactToWrong();
      this.building.wobble(true); // crumble a few bricks

      this.questionText.setText(
        `${question.factorA} × ${question.factorB} = ${question.correctAnswer}`
      );

      // Move on after showing the answer
      this.time.delayedCall(2500, () => {
        this.currentQuestionIndex++;
        this.showQuestion();
      });
    }
  }

  private handleHint = (data: { level: number }): void => {
    // The Manipulatives agent handles the actual visual hint display.
    // This scene just relays the event.
    EventBus.emit('show-hint', {
      level: data.level,
      factorA: this.currentQuestion?.factorA,
      factorB: this.currentQuestion?.factorB,
    });
  };

  private showFeedback(
    type: 'correct' | 'tryAgain' | 'showAnswer',
    answer?: number,
  ): void {
    let message: string;
    let color: string;

    switch (type) {
      case 'correct':
        // Pick a random encouragement
        const phrases = [
          'Amazing!', 'Great job!', 'You got it!',
          'Fantastic!', 'Well done!', 'Awesome!',
        ];
        message = phrases[Math.floor(Math.random() * phrases.length)];
        color = '#4CAF50';
        break;
      case 'tryAgain':
        message = 'Not quite! Try again.';
        color = '#e46b43';
        break;
      case 'showAnswer':
        message = `The answer is ${answer}. Let's see why:`;
        color = '#06628d';
        break;
    }

    this.feedbackText.setText(message);
    this.feedbackText.setColor(color);
    this.feedbackText.setAlpha(0);

    this.tweens.add({
      targets: this.feedbackText,
      alpha: 1,
      y: this.feedbackText.y - 5,
      duration: 200,
      yoyo: false,
      ease: 'Sine.easeOut',
    });
  }

  private updateQuestionCounter(): void {
    this.questionCountText.setText(
      `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`
    );
  }

  private endLevel(): void {
    // Add roof decoration to building
    this.building.addRoofDecoration();
    this.character.celebrate();

    const accuracy = this.questions.length > 0
      ? this.correctCount / this.questions.length
      : 0;

    // Transition to LevelComplete after celebration
    this.time.delayedCall(2000, () => {
      this.scene.start('LevelComplete', {
        levelNumber: this.levelNumber,
        totalBricks: this.totalBricksThisLevel,
        correctCount: this.correctCount,
        totalQuestions: this.questions.length,
        accuracy,
      });
    });

    EventBus.emit('level-complete', {
      levelNumber: this.levelNumber,
      totalBricks: this.totalBricksThisLevel,
      accuracy,
    });
  }

  shutdown(): void {
    // Clean up event listeners when scene shuts down
    EventBus.off('answer-submitted', this.handleAnswer, this);
    EventBus.off('hint-requested', this.handleHint, this);

    this.building.destroy();
    this.character.destroy();
    this.numpad.destroy();
    this.hintButton.destroy();
  }
}
```

### Acceptance Criteria
- [ ] Game scene reads questions from Zustand store on creation
- [ ] Question displays as "3 x 5 = ?" at top center
- [ ] Numpad answer triggers correct/wrong flow
- [ ] Correct: feedback text, happy character, bricks stack, bonus bricks add
- [ ] Wrong (1st): "Not quite!", wobble, retry allowed
- [ ] Wrong (2nd): show answer, crumble a few bricks, move on
- [ ] After 5 questions, transitions to LevelComplete
- [ ] Hint button events relay to Manipulatives agent
- [ ] Question counter updates ("Question 3 of 5")
- [ ] All events emitted for Zustand and Audio to hook into
- [ ] Scene cleans up event listeners on shutdown

---

## Phase 7: Particle Effects

### File: `src/game/effects/Confetti.ts`

```typescript
// ABOUTME: Confetti particle effect for level completion celebrations.
// ABOUTME: Emits colorful confetti particles that drift down across the screen.

import Phaser from 'phaser';

const CONFETTI_COLORS = [
  'confetti-red',
  'confetti-blue',
  'confetti-yellow',
  'confetti-green',
];

export function emitConfetti(scene: Phaser.Scene): void {
  const { width } = scene.cameras.main;

  for (const color of CONFETTI_COLORS) {
    const particles = scene.add.particles(0, 0, color, {
      x: { min: 0, max: width },
      y: -20,
      speedX: { min: -80, max: 80 },
      speedY: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      rotate: { min: 0, max: 360 },
      lifespan: 4000,
      quantity: 2,
      frequency: 100,
      scale: { start: 0.6, end: 0.2 },
      gravityY: 50,
      emitting: true,
    });

    // Stop emitting after 3 seconds, destroy after particles fade
    scene.time.delayedCall(3000, () => {
      particles.stop();
      scene.time.delayedCall(4000, () => particles.destroy());
    });
  }
}
```

### File: `src/game/effects/BrickDebris.ts`

```typescript
// ABOUTME: Brick debris particle effect for wrong-answer feedback.
// ABOUTME: Spawns small brick fragments that fall with gravity.

import Phaser from 'phaser';

export function emitBrickDebris(
  scene: Phaser.Scene,
  x: number,
  y: number,
): void {
  const particles = scene.add.particles(x, y, 'brick-debris', {
    speed: { min: 50, max: 200 },
    angle: { min: 200, max: 340 },
    lifespan: { min: 400, max: 800 },
    quantity: 12,
    scale: { start: 0.6, end: 0 },
    gravityY: 500,
    rotate: { min: 0, max: 360 },
    emitting: false,
  });

  particles.explode();

  scene.time.delayedCall(1200, () => particles.destroy());
}
```

### Acceptance Criteria
- [ ] Confetti emits 4 colors drifting downward
- [ ] Confetti runs for 3 seconds then fades
- [ ] Brick debris bursts from a point and falls with gravity
- [ ] All particle managers self-destruct after animation

---

## Phase 8: LevelComplete + SessionEnd Scenes

### File: `src/game/scenes/LevelComplete.ts`

```typescript
// ABOUTME: Celebration scene shown after completing 5 questions in a level.
// ABOUTME: Displays confetti, score summary, and navigation buttons.

import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { emitConfetti } from '../effects/Confetti';
import { useGameStore } from '../../stores/game';

interface LevelCompleteData {
  levelNumber: number;
  totalBricks: number;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
}

export class LevelComplete extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelComplete' });
  }

  create(data: LevelCompleteData): void {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0xfff8e1);

    // Confetti
    emitConfetti(this);

    // Title
    const title = this.add.text(width / 2, height * 0.15, 'Level Complete!', {
      fontFamily: 'Arial Black',
      fontSize: '52px',
      color: '#4CAF50',
      stroke: '#388e3c',
      strokeThickness: 4,
    });
    title.setOrigin(0.5);

    // Pop-in animation for title
    title.setScale(0);
    this.tweens.add({
      targets: title,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Character celebrating
    const character = this.add.sprite(width / 2, height * 0.4, 'wrecker');
    character.setScale(3);
    character.play('wrecker-happy');
    character.once('animationcomplete', () => {
      character.play('wrecker-waving');
    });

    // Score summary
    const summaryY = height * 0.58;
    const lineHeight = 36;

    this.add.text(width / 2, summaryY, `Level ${data.levelNumber}`, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#3c0f0f',
    }).setOrigin(0.5);

    this.add.text(width / 2, summaryY + lineHeight, `${data.correctCount} of ${data.totalQuestions} correct`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#06628d',
    }).setOrigin(0.5);

    this.add.text(width / 2, summaryY + lineHeight * 2, `${data.totalBricks} bricks earned!`, {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#e46b43',
    }).setOrigin(0.5);

    const accuracyPercent = Math.round(data.accuracy * 100);
    this.add.text(width / 2, summaryY + lineHeight * 3, `${accuracyPercent}% accuracy`, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#06628d',
    }).setOrigin(0.5);

    // Buttons (appear after 1.5s delay)
    this.time.delayedCall(1500, () => {
      this.createButtons(width, height, data);
    });

    EventBus.emit('current-scene-ready', this);
  }

  private createButtons(
    width: number,
    height: number,
    data: LevelCompleteData,
  ): void {
    const buttonY = height * 0.88;

    // "Next Level" button
    const nextBtn = this.createButton(
      width / 2 - 130, buttonY,
      'Next Level', 0x4caf50,
    );
    nextBtn.on('pointerup', () => {
      const store = useGameStore.getState();
      store.advanceLevel();
      this.scene.start('Game');
    });

    // "Take a Break" button
    const breakBtn = this.createButton(
      width / 2 + 130, buttonY,
      'Take a Break', 0x06628d,
    );
    breakBtn.on('pointerup', () => {
      this.scene.start('SessionEnd');
    });

    // Fade in buttons
    nextBtn.setAlpha(0);
    breakBtn.setAlpha(0);
    this.tweens.add({
      targets: [nextBtn, breakBtn],
      alpha: 1,
      duration: 300,
    });
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    color: number,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 220, 64, color);
    bg.setStrokeStyle(3, 0x3c0f0f);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: '#ffffff',
    });
    text.setOrigin(0.5);
    container.add(text);

    bg.on('pointerdown', () => container.setScale(0.95));
    bg.on('pointerup', () => container.setScale(1));
    bg.on('pointerout', () => container.setScale(1));

    // Return the bg for external event binding
    return container;
  }
}
```

### File: `src/game/scenes/SessionEnd.ts`

```typescript
// ABOUTME: Session summary screen shown when the child takes a break or finishes.
// ABOUTME: Displays session stats and provides navigation back to play or home.

import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { useGameStore } from '../../stores/game';

export class SessionEnd extends Phaser.Scene {
  constructor() {
    super({ key: 'SessionEnd' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const store = useGameStore.getState();
    const session = store.currentSession;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0xfff8e1);

    // Title
    this.add.text(width / 2, height * 0.1, 'Great Practice!', {
      fontFamily: 'Arial Black',
      fontSize: '44px',
      color: '#06628d',
      stroke: '#FFF8E1',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Character waving
    const character = this.add.sprite(width / 2, height * 0.3, 'wrecker');
    character.setScale(3);
    character.play('wrecker-waving');

    // Session summary
    const statsY = height * 0.48;
    const lineHeight = 40;

    const stats = [
      { label: 'Questions Answered', value: `${session.totalQuestions}` },
      { label: 'Correct Answers', value: `${session.correctAnswers}` },
      {
        label: 'Accuracy',
        value: session.totalQuestions > 0
          ? `${Math.round((session.correctAnswers / session.totalQuestions) * 100)}%`
          : '—',
      },
      { label: 'Bricks Earned', value: `${session.totalBricks}` },
      { label: 'Levels Completed', value: `${session.levelsCompleted}` },
    ];

    for (let i = 0; i < stats.length; i++) {
      const stat = stats[i];
      const y = statsY + i * lineHeight;

      this.add.text(width / 2 - 140, y, stat.label, {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#3c0f0f',
      }).setOrigin(0, 0.5);

      this.add.text(width / 2 + 140, y, stat.value, {
        fontFamily: 'Arial Black',
        fontSize: '24px',
        color: '#e46b43',
      }).setOrigin(1, 0.5);
    }

    // Divider line
    const divY = statsY - 16;
    this.add.rectangle(width / 2, divY, 320, 2, 0x06628d);
    const divY2 = statsY + stats.length * lineHeight + 8;
    this.add.rectangle(width / 2, divY2, 320, 2, 0x06628d);

    // Buttons
    const buttonY = height * 0.88;

    // "Play Again" button
    const playAgainBg = this.add.rectangle(
      width / 2 - 130, buttonY, 220, 64, 0x4caf50,
    );
    playAgainBg.setStrokeStyle(3, 0x3c0f0f);
    playAgainBg.setInteractive({ useHandCursor: true });
    this.add.text(width / 2 - 130, buttonY, 'Play Again', {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    playAgainBg.on('pointerdown', () => playAgainBg.setScale(0.95));
    playAgainBg.on('pointerup', () => {
      playAgainBg.setScale(1);
      const gameStore = useGameStore.getState();
      gameStore.startNewSession();
      this.scene.start('Game');
    });
    playAgainBg.on('pointerout', () => playAgainBg.setScale(1));

    // "Go Home" button
    const homeBg = this.add.rectangle(
      width / 2 + 130, buttonY, 220, 64, 0x06628d,
    );
    homeBg.setStrokeStyle(3, 0x3c0f0f);
    homeBg.setInteractive({ useHandCursor: true });
    this.add.text(width / 2 + 130, buttonY, 'Go Home', {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    homeBg.on('pointerdown', () => homeBg.setScale(0.95));
    homeBg.on('pointerup', () => {
      homeBg.setScale(1);
      EventBus.emit('go-home');
    });
    homeBg.on('pointerout', () => homeBg.setScale(1));

    // Notify Zustand to end the session
    EventBus.emit('session-ended', {
      totalQuestions: session.totalQuestions,
      correctAnswers: session.correctAnswers,
      totalBricks: session.totalBricks,
    });

    EventBus.emit('current-scene-ready', this);
  }
}
```

### Acceptance Criteria
- [ ] LevelComplete shows confetti, character celebration, and score summary
- [ ] "Next Level" advances to Game scene with next level's questions
- [ ] "Take a Break" transitions to SessionEnd
- [ ] Buttons appear after 1.5s delay (let celebration play)
- [ ] SessionEnd displays all session stats (questions, accuracy, bricks, levels)
- [ ] "Play Again" starts a new session
- [ ] "Go Home" emits event for React router to navigate away

---

## Phase 9: Scoring System + Zustand Integration

### File: `src/stores/game.ts` (Game Engine relevant portions)

The game store is owned by the Foundation agent, but the Game Engine needs these specific
fields and actions. This section specifies what the Game Engine depends on from the store.

```typescript
// ABOUTME: Zustand store for game state, bridging the Learning Engine and Phaser.
// ABOUTME: Tracks session progress, current questions, bricks earned, and level state.

import { create } from 'zustand';
import type { Question, QuestionAttempt } from '../types';

interface SessionState {
  totalQuestions: number;
  correctAnswers: number;
  totalBricks: number;
  levelsCompleted: number;
}

interface GameState {
  // Current gameplay state
  currentLevel: number;
  currentQuestions: Question[];
  currentSession: SessionState;

  // Scoring
  totalBricksAllTime: number;
  buildingHeight: number;

  // Actions that Game Engine calls via EventBus handlers
  recordResult: (data: {
    isCorrect: boolean;
    bricksEarned: number;
    bonusBricks: number;
  }) => void;

  completeLevel: (data: {
    levelNumber: number;
    totalBricks: number;
    accuracy: number;
  }) => void;

  advanceLevel: () => void;
  startNewSession: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentLevel: 1,
  currentQuestions: [],
  currentSession: {
    totalQuestions: 0,
    correctAnswers: 0,
    totalBricks: 0,
    levelsCompleted: 0,
  },
  totalBricksAllTime: 0,
  buildingHeight: 0,

  recordResult: (data) => {
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        totalQuestions: state.currentSession.totalQuestions + 1,
        correctAnswers: state.currentSession.correctAnswers + (data.isCorrect ? 1 : 0),
        totalBricks: state.currentSession.totalBricks + data.bricksEarned + data.bonusBricks,
      },
      totalBricksAllTime: state.totalBricksAllTime + data.bricksEarned + data.bonusBricks,
    }));
  },

  completeLevel: (data) => {
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        levelsCompleted: state.currentSession.levelsCompleted + 1,
      },
    }));
  },

  advanceLevel: () => {
    set((state) => ({
      currentLevel: state.currentLevel + 1,
      // Learning Engine will populate currentQuestions when the level starts
    }));
  },

  startNewSession: () => {
    set({
      currentSession: {
        totalQuestions: 0,
        correctAnswers: 0,
        totalBricks: 0,
        levelsCompleted: 0,
      },
    });
  },
}));
```

### Scoring Rules Reference

| Scenario | Answer Bricks | Bonus Bricks | Total |
|----------|--------------|-------------|-------|
| No hint, correct | answer value | 3 | answer + 3 |
| Visual hint (level 1), correct | answer value | 1 | answer + 1 |
| Both hints (level 2), correct | answer value | 0 | answer |
| Wrong answer (any) | 0 | 0 | 0 |

### Data Flow

```
Learning Engine
  │ populates currentQuestions via Zustand
  ▼
Game Scene reads currentQuestions on create()
  │
  ├─ answer-submitted (Numpad → Game Scene)
  │   └─ Game Scene validates, calls handleCorrect/handleWrong
  │
  ├─ answer-result (Game Scene → EventBus → GameWrapper → Zustand)
  │   └─ recordResult() updates session counters
  │
  ├─ bricks-earned (Game Scene → EventBus)
  │   └─ Audio agent hooks for brick-place sound
  │
  ├─ level-complete (Game Scene → EventBus → GameWrapper → Zustand)
  │   └─ completeLevel() increments levelsCompleted
  │
  └─ session-ended (SessionEnd → EventBus → GameWrapper → Zustand)
      └─ Triggers Firestore persistence (owned by Foundation/Learning Engine)
```

### Acceptance Criteria
- [ ] Zustand store tracks session state (questions, accuracy, bricks)
- [ ] recordResult correctly tallies bricks from answer + bonus
- [ ] Bonus bricks: 3 for no hint, 1 for level-1 hint, 0 for level-2
- [ ] Wrong answers earn 0 bricks
- [ ] advanceLevel increments currentLevel
- [ ] startNewSession resets session counters
- [ ] All game events flow through EventBus to Zustand

---

## Event Catalog

Every event the Game Engine emits or listens to. Other agents hook into these.

### Events Emitted by Game Engine

| Event | Payload | Consumer |
|-------|---------|----------|
| `assets-loaded` | none | React (loading state) |
| `current-scene-ready` | `Phaser.Scene` | React (scene ref) |
| `play-pressed` | none | Audio (button sound) |
| `button-tap` | none | Audio (tap sound) |
| `answer-result` | `{ factorA, factorB, correctAnswer, givenAnswer, isCorrect, responseTimeMs, hintLevel, attemptNumber }` | Zustand, Learning Engine, Audio |
| `brick-placed` | none | Audio (brick sound) |
| `bricks-earned` | `{ answerBricks, bonusBricks, totalBricks }` | Zustand, Audio |
| `hint-requested` | `{ level: 1 \| 2 }` | Manipulatives |
| `show-hint` | `{ level, factorA, factorB }` | Manipulatives |
| `level-complete` | `{ levelNumber, totalBricks, accuracy }` | Zustand, Audio |
| `session-ended` | `{ totalQuestions, correctAnswers, totalBricks }` | Zustand |
| `go-home` | none | React Router |

### Events Consumed by Game Engine

| Event | Source | Handler |
|-------|--------|---------|
| `answer-submitted` | Numpad (self) | Game.handleAnswer |
| `hint-requested` | HintButton (self) | Game.handleHint |

---

## Layout Diagram

```
┌──────────────────────────────────────────────────────────────┐
│  Question 3 of 5                      ┌──────────────────┐  │
│                                       │  6 × 4 = ?       │  │
│                                       └──────────────────┘  │
│                                          Great job!          │
│                                                              │
│                               ┌────────────────────────────┐ │
│        ┌───────────┐          │      ┌────────────┐        │ │
│        │  ██ ██ ██ │          │      │   Hint 💡  │        │ │
│   ╔╗   │  ██ ██ ██ │          │      │−2 bonus    │        │ │
│   ║║   │  ██ ██ ██ │          │      └────────────┘        │ │
│   ║║   │  ██ ██    │          │                            │ │
│  ╔╝╚╗  │  ██ ██ ██ │          │      ┌──────────────┐     │ │
│  ║  ║  │  ██ ██ ██ │          │      │   _______    │     │ │
│  ║  ║  │  ██ ██ ██ │          │      │  |       |   │     │ │
│  ╚══╝  │  ██ ██ ██ │          │      │  | 1 | 2 | 3 |   │ │
│ Char   │  ████████ │          │      │  | 4 | 5 | 6 |   │ │
│        │  [DOOR  ] │          │      │  | 7 | 8 | 9 |   │ │
│        └───────────┘          │      │  | ⌫ | 0 | ✓ |   │ │
│        Building               │      └──────────────┘     │ │
│                               └────────────────────────────┘ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                          Ground                              │
└──────────────────────────────────────────────────────────────┘
```

---

## File Summary

| File | Purpose |
|------|---------|
| `src/game/EventBus.ts` | Shared event emitter for React-Phaser communication |
| `src/game/config.ts` | Phaser game configuration (scaling, physics, scenes) |
| `src/components/GameWrapper.tsx` | React component hosting Phaser, bridges events to Zustand |
| `src/game/scenes/Boot.ts` | Asset preloading with progress bar |
| `src/game/scenes/Title.ts` | Start screen with Play button |
| `src/game/scenes/Game.ts` | Main gameplay loop (question, answer, animate) |
| `src/game/scenes/LevelComplete.ts` | Celebration scene after 5 questions |
| `src/game/scenes/SessionEnd.ts` | Session summary with navigation |
| `src/game/objects/Building.ts` | Building renderer (rows, windows, camera) |
| `src/game/objects/BrickRow.ts` | Brick row with stacking and crumble animations |
| `src/game/objects/Character.ts` | Animated character with state machine |
| `src/game/objects/Numpad.ts` | On-screen calculator numpad |
| `src/game/objects/HintButton.ts` | Hint button with bonus brick cost display |
| `src/game/effects/Confetti.ts` | Confetti particle emitter |
| `src/game/effects/BrickDebris.ts` | Brick debris particle emitter |
| `src/stores/game.ts` | Zustand store (game-engine-relevant portions) |

---

## Testing Strategy

Unit tests are difficult for Phaser scenes (they require a canvas/WebGL context). Strategy:

1. **Scoring logic**: Extract pure scoring functions and test them independently.
   - `calculateBonusBricks(hintLevel) => number`
   - `calculateBricksEarned(answer, hintLevel) => { answer, bonus, total }`

2. **Zustand store**: Test all store actions with standard unit tests.
   - `recordResult` updates counters correctly
   - `advanceLevel` increments level
   - `startNewSession` resets state

3. **Integration tests**: Manual checklist exercised in browser.
   - Play through 5 questions with all correct
   - Play through with first wrong then correct
   - Play through with both wrong (shown answer)
   - Use hint level 1 and verify bonus = 1
   - Use hint level 2 and verify bonus = 0
   - Verify building grows, character climbs
   - Verify LevelComplete shows correct stats
   - Verify SessionEnd shows cumulative stats

4. **Visual regression**: Screenshot comparison if CI supports it (future).

---

## Risks & Considerations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Phaser + React state sync race conditions | Wrong brick count, duplicate events | EventBus is synchronous; Zustand updates are atomic. Test carefully. |
| Mobile performance with many brick sprites | Lag on Pixel phone | Use sprite pooling if brick count > 50 per scene. Each row is a container -- destroy old rows if building gets very tall. |
| Pixel art scaling artifacts | Blurry sprites | `pixelArt: true` + `antialias: false` in config. Use nearest-neighbor scaling. |
| Touch event conflicts (scroll vs game input) | Accidental scrolling instead of tapping | `touch-action: none` on container div. Phaser handles pointer events. |
| BrickRow.animateStacking is async with tweens | Timing bugs if scene transitions mid-animation | Check `this.scene.isActive()` before continuing tween chains. |
| Large answer values (10x10=100 bricks in a row) | Row too wide for screen | Cap visual brick count at ~20 per row. For larger answers, stack into sub-rows (e.g., 100 = 5 rows of 20). Show the full count as a number label. |

---

## Dependencies on Other Agents

| Agent | What Game Engine Needs | When |
|-------|----------------------|------|
| Foundation | Zustand store skeleton, routing, Phaser npm package installed | Before any implementation |
| Art & Animation | All sprite sheets, tile images, particle sprites, UI button images | Before Boot scene can preload |
| Learning Engine | `currentQuestions` populated in Zustand when a level starts | Before Game scene can show questions |
| Audio | Hooks into `brick-placed`, `button-tap`, `answer-result`, `level-complete` events | Can integrate after Game Engine is working |
| Manipulatives | Hooks into `show-hint` event to render visual hints | Can integrate after Game Engine is working |

---

## Estimated Complexity

| Phase | Effort | Notes |
|-------|--------|-------|
| Phase 1: Config + Bridge | Small | Boilerplate, well-documented pattern |
| Phase 2: Boot + Title | Small | Asset loading + simple UI |
| Phase 3: Building + BrickRow | Medium | Tween chains, container math, camera scrolling |
| Phase 4: Character | Small | Sprite animation state machine |
| Phase 5: Numpad + HintButton | Medium | Touch input handling, multi-digit building |
| Phase 6: Game Scene | Large | Orchestrates everything, most complex flow |
| Phase 7: Particle Effects | Small | Standard Phaser particles API |
| Phase 8: LevelComplete + SessionEnd | Medium | UI layout, store integration |
| Phase 9: Scoring + Zustand | Small | Pure logic, easy to test |

Total estimate: ~2-3 focused implementation sessions.
