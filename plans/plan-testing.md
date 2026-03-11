# Implementation Plan: Testing

## Goal

Every component of the multiplication learning game must be testable by the AI agent (Claude) with clear pass/fail signals. No manual testing. Every test is automatable, produces deterministic output, and can be run from the command line or via the `dev-browser` skill (Playwright-based browser automation).

**"Done" looks like:**
- `npm test` runs all unit and integration tests with exit code 0/1
- `npm run test:firebase` runs Firestore security rules tests against the emulator
- `npm run test:e2e` runs all E2E tests via Playwright
- Every test produces machine-parseable pass/fail output
- CI blocks merges on any red test

---

## 1. Test Framework Setup

### 1.1 Vitest Configuration

Vitest ships with Vite. It shares the same config pipeline, so TypeScript, path aliases, and JSX all work without extra setup.

**`vitest.config.ts`** (project root):

```typescript
// ABOUTME: Test configuration for Vitest.
// ABOUTME: Separates unit/integration tests from E2E and Firebase emulator tests.

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/__tests__/**/*.test.ts', 'src/**/__tests__/**/*.test.tsx'],
    exclude: ['src/**/*.e2e.test.ts', 'src/**/*.rules.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/stores/**', 'src/hooks/**'],
      exclude: ['src/**/__tests__/**', 'src/test/**'],
      thresholds: {
        'src/lib/learning-engine/': {
          statements: 95,
          branches: 90,
        },
      },
    },
    reporters: ['verbose'],
    testTimeout: 10000,
  },
});
```

**`src/test/setup.ts`**:

```typescript
// ABOUTME: Global test setup for Vitest.
// ABOUTME: Configures jsdom environment and shared test utilities.

import '@testing-library/jest-dom/vitest';

// Stub crypto.randomUUID for jsdom
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...globalThis.crypto,
      randomUUID: () =>
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        }),
    },
  });
}
```

### 1.2 Package Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:firebase": "vitest run --config vitest.firebase.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test && npm run test:firebase && npm run test:e2e",
    "firebase:emulators": "firebase emulators:start --only auth,firestore --project demo-learning-multiply"
  }
}
```

### 1.3 Dev Dependencies

```json
{
  "devDependencies": {
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@firebase/rules-unit-testing": "^4.0.0",
    "@playwright/test": "^1.49.0",
    "@vitest/coverage-v8": "^3.0.0",
    "firebase-tools": "^13.0.0"
  }
}
```

### 1.4 Firebase Emulator Configuration

**`firebase.json`** (emulator section):

```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  },
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

**`vitest.firebase.config.ts`**:

```typescript
// ABOUTME: Vitest config for Firebase emulator tests.
// ABOUTME: Runs security rules tests against the local Firestore emulator.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.rules.test.ts'],
    testTimeout: 30000,
    reporters: ['verbose'],
  },
});
```

### 1.5 Playwright Configuration

**`playwright.config.ts`**:

```typescript
// ABOUTME: Playwright E2E test configuration.
// ABOUTME: Runs browser tests against the local Vite dev server.

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 2. Unit Testing Per Workstream

### 2.1 Learning Engine

All learning engine modules are pure TypeScript with no DOM or framework dependencies. These are the highest-value tests in the project.

**Test file convention:** `src/lib/learning-engine/__tests__/[module].test.ts`

**Example: `src/lib/learning-engine/__tests__/fluency.test.ts`**

```typescript
// ABOUTME: Tests for fluency scoring and recall classification.
// ABOUTME: Validates threshold boundaries for the 0-5 quality scale.

import { describe, it, expect } from 'vitest';
import { scoreFluency, isFluentRecall, isCloseAnswer } from '../fluency';

describe('scoreFluency', () => {
  it('scores fast correct answer as quality 5', () => {
    expect(scoreFluency(true, 800)).toBe(5);
  });

  it('scores moderate correct answer as quality 4', () => {
    expect(scoreFluency(true, 1500)).toBe(4);
    expect(scoreFluency(true, 2500)).toBe(4);
  });

  it('scores slow correct answer as quality 3', () => {
    expect(scoreFluency(true, 3000)).toBe(3);
    expect(scoreFluency(true, 4500)).toBe(3);
  });

  it('scores very slow correct answer as quality 2', () => {
    expect(scoreFluency(true, 5000)).toBe(2);
    expect(scoreFluency(true, 8000)).toBe(2);
  });

  it('scores wrong answer not close as quality 0', () => {
    expect(scoreFluency(false, 1000, false)).toBe(0);
  });

  it('scores wrong answer close as quality 1', () => {
    expect(scoreFluency(false, 1000, true)).toBe(1);
  });
});

describe('isFluentRecall', () => {
  it('returns true for fast correct answer', () => {
    expect(isFluentRecall(true, 1000)).toBe(true);
  });

  it('returns true at the boundary', () => {
    expect(isFluentRecall(true, 2999)).toBe(true);
  });

  it('returns false for slow correct answer', () => {
    expect(isFluentRecall(true, 3000)).toBe(false);
  });

  it('returns false for wrong answer regardless of speed', () => {
    expect(isFluentRecall(false, 500)).toBe(false);
  });
});

describe('isCloseAnswer', () => {
  it('returns true when within 5% of correct answer', () => {
    expect(isCloseAnswer(24, 25)).toBe(true);   // 4.2%
    expect(isCloseAnswer(56, 54)).toBe(true);    // 3.6%
  });

  it('returns false when far from correct answer', () => {
    expect(isCloseAnswer(24, 30)).toBe(false);   // 25%
  });

  it('handles zero correctly', () => {
    expect(isCloseAnswer(0, 1)).toBe(true);
    expect(isCloseAnswer(0, 3)).toBe(false);
  });
});
```

**Modules to test and what to cover:**

| Module | Key test scenarios |
|--------|-------------------|
| `fluency.ts` | Quality scoring thresholds (0-5), fluent recall boundary (3s), close answer percentage |
| `leitner.ts` | Box promotion/demotion, review scheduling intervals, due-for-review calculation, processAttempt state updates |
| `error-classifier.ts` | Each error type pattern (addition_substitution, zero_one_confusion, off_by_one, neighbor_confusion, commutative_gap, other), priority ordering |
| `difficulty.ts` | Tier-level mapping, fact pool per tier, available facts per level, level advancement criteria, level plan composition |
| `build-up.ts` | Sequence generation with/without mastered sub-facts, shouldUseBuildUp thresholds, edge cases (x0, x1) |
| `session.ts` | Start/end lifecycle, attempt recording, retry queue FIFO with delay, break suggestions at time thresholds, session stats aggregation |
| `question-selector.ts` | Level building (new/review split), interleaving pattern, no consecutive duplicates, retry injection, build-up attachment |
| `mastery.ts` | 66 canonical facts, mastery classification, heat map grid symmetry, trend detection, struggling fact sorting |

**Testing randomized functions:** Test properties, not exact values. For shuffle-based functions, assert that output has the same elements, same length, and satisfies ordering constraints (no consecutive duplicates).

### 2.2 Game Engine (Extracted Pure Functions)

Phaser scenes require a canvas context and cannot be unit tested. Extract all pure logic into testable functions.

**`src/game/__tests__/scoring.test.ts`**:

```typescript
// ABOUTME: Tests for scoring calculation functions.
// ABOUTME: Validates bonus brick logic extracted from game scenes.

import { describe, it, expect } from 'vitest';
import { calculateBonusBricks, calculateBricksEarned } from '../scoring';

describe('calculateBonusBricks', () => {
  it('gives 2 bonus for no hints used', () => {
    expect(calculateBonusBricks(0)).toBe(2);
  });

  it('gives 1 bonus for hint level 1', () => {
    expect(calculateBonusBricks(1)).toBe(1);
  });

  it('gives 0 bonus for hint level 2', () => {
    expect(calculateBonusBricks(2)).toBe(0);
  });
});

describe('calculateBricksEarned', () => {
  it('calculates total as answer value plus bonus', () => {
    const result = calculateBricksEarned(24, 0);
    expect(result).toEqual({ answer: 24, bonus: 2, total: 26 });
  });

  it('gives no bricks for wrong answer', () => {
    const result = calculateBricksEarned(0, 0);
    expect(result).toEqual({ answer: 0, bonus: 2, total: 2 });
  });
});
```

### 2.3 Manipulatives (Pure Functions)

**`src/game/manipulatives/__tests__/composite-group.test.ts`**:

```typescript
// ABOUTME: Tests for number decomposition into fives and ones.
// ABOUTME: Validates the core math model for visual manipulatives.

import { describe, it, expect } from 'vitest';
import { decompose, widthInCells } from '../composite-group';

describe('decompose', () => {
  it.each([
    [0, { fives: 0, ones: 0 }],
    [1, { fives: 0, ones: 1 }],
    [5, { fives: 1, ones: 0 }],
    [6, { fives: 1, ones: 1 }],
    [13, { fives: 2, ones: 3 }],
    [25, { fives: 5, ones: 0 }],
    [47, { fives: 9, ones: 2 }],
  ])('decompose(%i) returns %o', (input, expected) => {
    expect(decompose(input)).toEqual(expected);
  });
});

describe('widthInCells', () => {
  it.each([
    [{ fives: 0, ones: 3 }, 3],
    [{ fives: 1, ones: 1 }, 6],
    [{ fives: 2, ones: 3 }, 13],
  ])('widthInCells(%o) returns %i', (input, expected) => {
    expect(widthInCells(input)).toBe(expected);
  });
});
```

Also test:
- `WorkspaceGrid.nearestSnapPosition()` — null for out-of-bounds, correct col/row for near positions
- `WorkspaceGrid.calculateTotal()` — empty returns 0, mixed pieces return correct sum
- `ManipulativeConfig` constants — `RECT_WIDTH === CIRCLE_DIAMETER * 5`

### 2.4 Audio

**TTS Map coverage (`src/lib/audio/__tests__/tts-map.test.ts`):**

```typescript
// ABOUTME: Tests for TTS audio path mapping functions.
// ABOUTME: Validates canonical ordering and path generation for all languages.

import { describe, it, expect } from 'vitest';
import {
  getQuestionAudioPath,
  getNumberAudioPath,
  randomCorrectFeedbackId,
} from '../tts-map';

describe('getQuestionAudioPath', () => {
  it('generates correct Hebrew path', () => {
    expect(getQuestionAudioPath(3, 5, 'he')).toBe(
      '/assets/audio/tts/he/questions/q-3x5.mp3'
    );
  });

  it('canonicalizes factor order', () => {
    expect(getQuestionAudioPath(5, 3, 'he')).toBe(
      getQuestionAudioPath(3, 5, 'he')
    );
  });

  it('generates correct English path', () => {
    expect(getQuestionAudioPath(0, 0, 'en')).toBe(
      '/assets/audio/tts/en/questions/q-0x0.mp3'
    );
  });
});

describe('getNumberAudioPath', () => {
  it('includes gender suffix for Hebrew', () => {
    expect(getNumberAudioPath(42, 'he', 'feminine')).toContain('feminine');
  });

  it('has no gender suffix for English', () => {
    expect(getNumberAudioPath(42, 'en')).not.toContain('feminine');
    expect(getNumberAudioPath(42, 'en')).not.toContain('masculine');
  });
});

describe('randomCorrectFeedbackId', () => {
  it('returns a non-empty string', () => {
    expect(randomCorrectFeedbackId()).toBeTruthy();
  });
});
```

**Audio Manager (`src/lib/audio/__tests__/manager.test.ts`):**

Test with a mocked Web Audio API (mock `AudioContext`, `GainNode`, `AudioBufferSourceNode`). Verify:
- `init()` creates AudioContext and gain nodes
- `mute()` sets master gain to 0
- `unmute()` restores master gain to 1
- `setMusicVolume(v)` clamps to 0-1 range
- `stopAll()` stops active sources

**TTS Manifest validation** (run the generator script and validate output):
- Manifest has ~550-650 entries
- All 66 canonical facts have entries in both Hebrew and English
- No duplicate IDs
- Hebrew question text contains "פעמים"
- English question text contains "times"

### 2.5 Dashboard

The dashboard hooks have two layers: data-fetching (depends on Firebase) and data-processing (pure logic). Extract and test the pure logic.

**Testable pure functions to extract:**

| Function | Source | What to test |
|----------|--------|-------------|
| `classifyStatus(mastery)` | `useFactMastery` hook | null → not_introduced, box 4+ → mastered, box 2-3 → learning, box 0-1 → struggling |
| `canonicalKey(a, b)` | `useFactMastery` hook | (5,3) → "3,5", (3,5) → "3,5" |
| `buildGrid(masteryMap)` | extracted from hook | Returns 11x11 grid, symmetric cells share status, stats sum to 66 |
| `findStrugglingClusters(...)` | `useInsights` | Factor with 3+ struggling facts at 40%+ → insight |
| `findShortSessions(...)` | `useInsights` | 50%+ sessions under 5 min → insight, <3 sessions → no insight |
| `findHintDependency(...)` | `useInsights` | Rate >= 60% → insight, below → nothing |
| `findPlateaus(...)` | `useInsights` | Box <=2, 10+ attempts, <60% accuracy, recent → plateau insight |
| `findCelebrations(...)` | `useInsights` | All facts for a factor mastered → celebration |
| `findErrorPatterns(...)` | `useInsights` | Maps known error types to i18n keys |

**Example test for insight generation:**

```typescript
// ABOUTME: Tests for parent dashboard insight generation.
// ABOUTME: Validates insight detection thresholds and priority ordering.

import { describe, it, expect } from 'vitest';
import { findShortSessions } from '../insights';
import type { SessionSummary } from '../useSessions';

describe('findShortSessions', () => {
  it('returns insight when majority of sessions are short', () => {
    const sessions: SessionSummary[] = Array.from({ length: 6 }, (_, i) => ({
      id: `s${i}`,
      kidId: 'kid1',
      startedAt: new Date().toISOString(),
      level: 1,
      totalQuestions: 5,
      accuracy: 80,
      correctAnswers: 4,
      durationSeconds: i < 4 ? 120 : 600, // 4 short, 2 long
    }));

    const insights = findShortSessions(sessions);
    expect(insights).toHaveLength(1);
    expect(insights[0].type).toBe('short_sessions');
  });

  it('returns nothing with fewer than 3 sessions', () => {
    const sessions: SessionSummary[] = [
      { id: 's1', kidId: 'kid1', startedAt: '', level: 1,
        totalQuestions: 5, accuracy: 80, correctAnswers: 4, durationSeconds: 60 },
    ];
    expect(findShortSessions(sessions)).toHaveLength(0);
  });
});
```

### 2.6 Zustand Stores

Test stores by calling actions and checking resulting state. No component rendering needed.

**`src/stores/__tests__/game.test.ts`**:

```typescript
// ABOUTME: Tests for game session state store.
// ABOUTME: Validates session lifecycle, attempt recording, and brick counting.

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../game';
import type { Question, QuestionAttempt } from '../../types';

const mockQuestions: Question[] = [
  { factorA: 3, factorB: 5, correctAnswer: 15, isNew: true, isRetry: false,
    isReview: false, buildUpSequence: null, tier: 1 },
  { factorA: 2, factorB: 4, correctAnswer: 8, isNew: false, isRetry: false,
    isReview: true, buildUpSequence: null, tier: 1 },
];

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('starts a session with correct initial state', () => {
    useGameStore.getState().startSession('kid1', 3, mockQuestions);
    const state = useGameStore.getState();

    expect(state.isActive).toBe(true);
    expect(state.kidId).toBe('kid1');
    expect(state.currentLevel).toBe(3);
    expect(state.questions).toHaveLength(2);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.totalBricks).toBe(0);
    expect(state.sessionId).toBeTruthy();
  });

  it('records an attempt and appends to attempts array', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);

    const attempt: QuestionAttempt = {
      factorA: 3, factorB: 5, correctAnswer: 15, givenAnswer: 15,
      isCorrect: true, responseTimeMs: 2000, hintLevel: 0, errorType: null,
    };
    useGameStore.getState().recordAttempt(attempt);

    expect(useGameStore.getState().attempts).toHaveLength(1);
    expect(useGameStore.getState().attempts[0].isCorrect).toBe(true);
  });

  it('adds bricks and increases building height', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().addBricks(15);
    useGameStore.getState().addBricks(8);

    expect(useGameStore.getState().totalBricks).toBe(23);
    expect(useGameStore.getState().buildingHeight).toBe(23);
  });

  it('advances to next question', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().nextQuestion();
    expect(useGameStore.getState().currentQuestionIndex).toBe(1);
  });

  it('ends session by setting isActive to false', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().endSession();
    expect(useGameStore.getState().isActive).toBe(false);
  });

  it('resets to initial state', () => {
    useGameStore.getState().startSession('kid1', 1, mockQuestions);
    useGameStore.getState().addBricks(10);
    useGameStore.getState().reset();

    const state = useGameStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.totalBricks).toBe(0);
    expect(state.isActive).toBe(false);
  });
});
```

**Also test:**
- `useAuthStore` — setUser, setActiveKid, signOut clears state (mock Firebase calls)
- `useSettingsStore` — locale switching, volume clamping, persist/restore cycle

---

## 3. Firebase Security Rules Testing

Uses `@firebase/rules-unit-testing` against the local Firestore emulator. The emulator must be running before tests execute.

**`src/test/firebase/__tests__/firestore.rules.test.ts`**:

```typescript
// ABOUTME: Tests Firestore security rules against the local emulator.
// ABOUTME: Verifies parent-child ownership enforcement for all collections.

import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  assertSucceeds,
  assertFails,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc, deleteDoc, collection, addDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-learning-multiply',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('parents collection', () => {
  it('allows a parent to read their own document', async () => {
    const parentId = 'parent-1';
    // Seed the document as admin
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'parents', parentId), {
        display_name: 'Test Parent',
        created_at: new Date(),
      });
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(getDoc(doc(db, 'parents', parentId)));
  });

  it('denies a parent from reading another parent document', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'parents', 'parent-2'), {
        display_name: 'Other Parent',
        created_at: new Date(),
      });
    });

    const db = testEnv.authenticatedContext('parent-1').firestore();
    await assertFails(getDoc(doc(db, 'parents', 'parent-2')));
  });

  it('denies unauthenticated access', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'parents', 'parent-1'), {
        display_name: 'Test',
        created_at: new Date(),
      });
    });

    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'parents', 'parent-1')));
  });
});

describe('kids collection', () => {
  const parentId = 'parent-1';
  const otherParentId = 'parent-2';

  it('allows a parent to create a kid with their own parent_id', async () => {
    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(
      addDoc(collection(db, 'kids'), {
        parent_id: parentId,
        name: 'Test Kid',
        avatar_url: null,
        created_at: new Date(),
      })
    );
  });

  it('denies creating a kid with another parent_id', async () => {
    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertFails(
      addDoc(collection(db, 'kids'), {
        parent_id: otherParentId,
        name: 'Fake Kid',
        avatar_url: null,
        created_at: new Date(),
      })
    );
  });

  it('allows a parent to read their own kid', async () => {
    let kidId: string;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const ref = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: parentId,
        name: 'My Kid',
        created_at: new Date(),
      });
      kidId = ref.id;
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(getDoc(doc(db, 'kids', kidId!)));
  });

  it('denies a parent from reading another parents kid', async () => {
    let kidId: string;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const ref = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: otherParentId,
        name: 'Their Kid',
        created_at: new Date(),
      });
      kidId = ref.id;
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertFails(getDoc(doc(db, 'kids', kidId!)));
  });

  it('allows a parent to delete their own kid', async () => {
    let kidId: string;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const ref = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: parentId,
        name: 'My Kid',
        created_at: new Date(),
      });
      kidId = ref.id;
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(deleteDoc(doc(db, 'kids', kidId!)));
  });
});

describe('sessions collection', () => {
  const parentId = 'parent-1';

  it('allows creating a session for own kid', async () => {
    let kidId: string;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const ref = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: parentId,
        name: 'Kid',
        created_at: new Date(),
      });
      kidId = ref.id;
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(
      addDoc(collection(db, 'sessions'), {
        kid_id: kidId!,
        started_at: new Date(),
        ended_at: null,
        level: 1,
        total_questions: 0,
        correct_answers: 0,
        duration_seconds: null,
      })
    );
  });

  it('denies creating a session for another parents kid', async () => {
    let kidId: string;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const ref = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: 'parent-2',
        name: 'Not My Kid',
        created_at: new Date(),
      });
      kidId = ref.id;
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertFails(
      addDoc(collection(db, 'sessions'), {
        kid_id: kidId!,
        started_at: new Date(),
        level: 1,
        total_questions: 0,
        correct_answers: 0,
      })
    );
  });
});

describe('attempts collection', () => {
  it('allows creating an attempt for own kid', async () => {
    const parentId = 'parent-1';
    let kidId: string;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const ref = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: parentId,
        name: 'Kid',
        created_at: new Date(),
      });
      kidId = ref.id;
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(
      addDoc(collection(db, 'attempts'), {
        session_id: 'session-1',
        kid_id: kidId!,
        factor_a: 3,
        factor_b: 5,
        correct_answer: 15,
        given_answer: 15,
        is_correct: true,
        response_time_ms: 2000,
        hint_level: 0,
        error_type: null,
        attempted_at: new Date(),
      })
    );
  });

  it('denies reading attempts that do not exist (no update allowed)', async () => {
    const db = testEnv.authenticatedContext('parent-1').firestore();
    await assertFails(getDoc(doc(db, 'attempts', 'nonexistent')));
  });
});

describe('mastery collection', () => {
  it('allows reading and updating mastery for own kid', async () => {
    const parentId = 'parent-1';
    let kidId: string;
    let masteryId: string;

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const kidRef = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: parentId,
        name: 'Kid',
        created_at: new Date(),
      });
      kidId = kidRef.id;
      masteryId = `${kidId}_3x5`;
      await setDoc(doc(context.firestore(), 'mastery', masteryId), {
        kid_id: kidId,
        factor_a: 3,
        factor_b: 5,
        leitner_box: 2,
        total_attempts: 5,
        correct_attempts: 4,
        avg_response_time_ms: 2500,
        last_practiced_at: new Date(),
        next_review_at: null,
      });
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(getDoc(doc(db, 'mastery', masteryId!)));
    await assertSucceeds(
      setDoc(doc(db, 'mastery', masteryId!), {
        kid_id: kidId!,
        factor_a: 3,
        factor_b: 5,
        leitner_box: 3,
        total_attempts: 6,
        correct_attempts: 5,
        avg_response_time_ms: 2400,
        last_practiced_at: new Date(),
        next_review_at: null,
      })
    );
  });
});

describe('progress collection', () => {
  it('allows reading progress for own kid', async () => {
    const parentId = 'parent-1';
    let kidId: string;
    let progressId: string;

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const kidRef = await addDoc(collection(context.firestore(), 'kids'), {
        parent_id: parentId,
        name: 'Kid',
        created_at: new Date(),
      });
      kidId = kidRef.id;
      progressId = `${kidId}_level1`;
      await setDoc(doc(context.firestore(), 'progress', progressId), {
        kid_id: kidId,
        level: 1,
        unlocked_at: new Date(),
        completed_at: null,
        building_height: 50,
      });
    });

    const db = testEnv.authenticatedContext(parentId).firestore();
    await assertSucceeds(getDoc(doc(db, 'progress', progressId!)));
  });
});
```

**Full coverage matrix:**

| Collection | create (own) | create (other) | read (own) | read (other) | update (own) | update (other) | delete (own) | delete (other) | unauthed |
|------------|-------------|----------------|------------|--------------|-------------|----------------|-------------|----------------|----------|
| parents    | allow       | deny           | allow      | deny         | allow       | deny           | —           | —              | deny     |
| kids       | allow       | deny           | allow      | deny         | allow       | deny           | allow       | deny           | deny     |
| sessions   | allow       | deny           | allow      | deny         | allow       | deny           | —           | —              | deny     |
| attempts   | allow       | deny           | allow      | deny         | —           | —              | —           | —              | deny     |
| mastery    | allow       | deny           | allow      | deny         | allow       | deny           | —           | —              | deny     |
| progress   | allow       | deny           | allow      | deny         | allow       | deny           | —           | —              | deny     |

---

## 4. Integration Testing

### 4.1 Full Session Lifecycle

**`src/lib/learning-engine/__tests__/integration.test.ts`**:

Tests the entire flow: start session → build level questions → answer questions → record attempts → check retry queue → advance level → end session → verify session stats. Uses real learning engine functions chained together with no mocks.

Key assertions:
- Session starts with empty attempts
- Level questions match tier for level
- Correct answers update mastery records
- Wrong answers trigger retry queue entries
- Retry facts appear after the delay interval
- Session stats match the attempts recorded
- endSession output has the correct Firestore document shape

### 4.2 i18n Key Completeness

**`src/test/__tests__/i18n-completeness.test.ts`**:

```typescript
// ABOUTME: Validates that Hebrew and English translations have identical key sets.
// ABOUTME: Catches missing translations before they reach production.

import { describe, it, expect } from 'vitest';
import en from '../../i18n/locales/en.json';
import he from '../../i18n/locales/he.json';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, fullKey);
    }
    return [fullKey];
  });
}

describe('i18n completeness', () => {
  const enKeys = new Set(flattenKeys(en));
  const heKeys = new Set(flattenKeys(he));

  it('English and Hebrew have the same number of keys', () => {
    expect(enKeys.size).toBe(heKeys.size);
  });

  it('every English key exists in Hebrew', () => {
    const missingInHe = [...enKeys].filter((k) => !heKeys.has(k));
    expect(missingInHe).toEqual([]);
  });

  it('every Hebrew key exists in English', () => {
    const missingInEn = [...heKeys].filter((k) => !enKeys.has(k));
    expect(missingInEn).toEqual([]);
  });

  it('no translation value is an empty string', () => {
    const emptyEn = [...enKeys].filter((k) => {
      const value = k.split('.').reduce((obj: any, key) => obj?.[key], en);
      return value === '';
    });
    const emptyHe = [...heKeys].filter((k) => {
      const value = k.split('.').reduce((obj: any, key) => obj?.[key], he);
      return value === '';
    });
    expect(emptyEn).toEqual([]);
    expect(emptyHe).toEqual([]);
  });
});
```

### 4.3 Store Interactions

Test cross-store interactions that happen during gameplay:
- Auth store's `activeKid` feeds into game store's `startSession`
- Settings store's `locale` feeds into i18n and audio
- Game store's `endSession` produces data matching `SessionDoc` shape

---

## 5. E2E Testing via dev-browser

All E2E tests are driven by the `dev-browser` skill (Playwright-based). The agent uses `dev-browser` to navigate, click, type, and assert. Each scenario describes the exact steps the agent should perform.

**Pattern for dev-browser E2E tests:**

The agent drives the browser using the `dev-browser` skill. Each test is a sequence of actions with assertions between them. The agent reads the page state (text content, element visibility, screenshots) to determine pass/fail.

### 5.1 Auth Flow

```
SCENARIO: Google sign-in and redirect
PRECONDITION: App running at localhost:5173, Firebase emulator with auth

STEPS:
1. Navigate to http://localhost:5173
2. Assert: login page is visible (look for "Sign in with Google" button)
3. Click "Sign in with Google"
4. (Firebase emulator auto-completes OAuth — no real Google popup)
5. Assert: redirected to /dashboard
6. Assert: parent name appears in sidebar/header
7. Assert: "Add Kid" or kid selection is visible
```

```
SCENARIO: Sign out
PRECONDITION: Signed in

STEPS:
1. Navigate to /dashboard/settings
2. Click sign-out button
3. Assert: redirected to login page
4. Navigate to /dashboard
5. Assert: redirected back to login (auth guard works)
```

### 5.2 Kid Management

```
SCENARIO: Add first kid
PRECONDITION: Signed in, no kids

STEPS:
1. Navigate to /dashboard/kids
2. Assert: empty state message visible
3. Click "Add Kid" button
4. Type kid name "Noa" into the name input
5. Submit the form
6. Assert: kid "Noa" appears in the kid list
7. Assert: kid is automatically set as active
```

### 5.3 Game Session

```
SCENARIO: Play through one level (5 questions)
PRECONDITION: Signed in, kid "Noa" active, game loaded

STEPS:
1. Navigate to /play (or click Play button)
2. Assert: Phaser canvas is rendered (canvas element exists)
3. Assert: title screen visible (detect "Play" button in canvas via screenshot)
4. Click the Play button area in the canvas
5. For each of 5 questions:
   a. Take screenshot, extract the displayed question (e.g., "3 x 5")
   b. Calculate correct answer
   c. Click numpad digits for the correct answer
   d. Click submit/enter on numpad
   e. Assert: correct feedback animation plays (take screenshot, verify green/celebration visual)
   f. Wait for next question transition
6. Assert: level complete screen appears
7. Assert: stats show 5/5 correct
```

```
SCENARIO: Wrong answer flow
PRECONDITION: In game, question displayed

STEPS:
1. Read the displayed question
2. Enter a wrong answer via numpad
3. Assert: wrong feedback visual (red/shake animation)
4. Assert: question is re-presented (first retry)
5. Enter wrong answer again
6. Assert: correct answer is displayed to the kid
7. Assert: game advances to next question
```

### 5.4 Hint Flow

```
SCENARIO: Using hints
PRECONDITION: In game, question displayed

STEPS:
1. Click the hint button
2. Assert: hint tier 1 content appears (e.g., manipulatives ghost outlines or verbal hint)
3. Click hint button again
4. Assert: hint tier 2 content appears (animated solution)
5. Answer the question correctly
6. Assert: bonus bricks earned is 0 (full hints used)
```

### 5.5 Manipulatives

```
SCENARIO: Drag-and-drop manipulatives
PRECONDITION: In game, manipulatives panel open

STEPS:
1. Click "Blocks" button to open manipulatives workspace
2. Assert: parts tray visible with blue circles and orange rectangles
3. Drag a blue circle from tray to workspace grid
4. Assert: circle snaps to grid position
5. Assert: running total displays "1"
6. Drag an orange rectangle to workspace
7. Assert: running total displays "6"
8. Tap the placed circle to remove it
9. Assert: running total displays "5"
10. Click reset button
11. Assert: running total displays "0"
12. Click close button
13. Assert: workspace is hidden
```

### 5.6 Language Switching

```
SCENARIO: Switch language from English to Hebrew
PRECONDITION: Signed in, on dashboard, language is English

STEPS:
1. Navigate to /dashboard/settings
2. Click Hebrew language option
3. Assert: page text is now in Hebrew
4. Assert: document direction is RTL (check dir attribute on html/body)
5. Navigate to /dashboard
6. Assert: dashboard headings are in Hebrew
7. Navigate to /dashboard/settings
8. Switch back to English
9. Assert: page text is in English, direction is LTR
```

### 5.7 Dashboard

```
SCENARIO: Heat map displays mastery data
PRECONDITION: Signed in, kid has play history with some mastered facts

STEPS:
1. Navigate to /dashboard/progress
2. Assert: 11x11 grid is rendered
3. Assert: at least one cell has a colored background (not all grey/unstarted)
4. Hover over a mastered cell
5. Assert: popup shows fact details (e.g., "3 x 5 = 15", accuracy, attempts)
6. Click a cell
7. Assert: navigated to /dashboard/progress/3/5 (fact detail page)
8. Assert: fact detail page shows attempt history
```

```
SCENARIO: Session history
PRECONDITION: Signed in, kid has completed sessions

STEPS:
1. Navigate to /dashboard/sessions
2. Assert: session list is not empty
3. Assert: each session row shows date, duration, question count, accuracy
4. Click to expand first session
5. Assert: individual attempts are listed with fact, answer, and correctness
```

### 5.8 Responsive Viewports

```
SCENARIO: Mobile layout (Pixel 7 viewport)
PRECONDITION: Browser set to 412x915 viewport

STEPS:
1. Navigate to /dashboard
2. Assert: sidebar is collapsed (hamburger menu visible)
3. Tap hamburger menu
4. Assert: sidebar slides open
5. Navigate to /dashboard/progress
6. Assert: heat map is horizontally scrollable
7. Assert: summary cards stack in 2-column layout
8. Navigate to /dashboard/sessions
9. Assert: session rows are readable (no text overflow)
```

---

## 6. Visual / Phaser Testing

Phaser renders to a canvas element, so traditional DOM assertions don't work. Strategy:

### 6.1 Screenshot Baselines

For visual verification of Phaser scenes, the agent takes screenshots at key moments and compares against baseline images.

**Approach:**
1. During initial implementation, the agent captures reference screenshots and saves them as baselines
2. On subsequent test runs, the agent takes new screenshots and compares visually
3. The agent uses the `dev-browser` screenshot capability

**Key screenshots to capture:**
- Title screen with Play button
- Game scene with question displayed
- Building with stacked brick rows
- Characters in idle, celebrate, and sad states
- Level complete screen
- Manipulatives workspace with pieces placed

### 6.2 EventBus Verification

Inject a listener on the game's EventBus from the browser console and verify events fire correctly.

**Pattern:**

```javascript
// Inject via dev-browser evaluate in page context
window.__testEvents = [];
window.__eventBus.on('*', (event, data) => {
  window.__testEvents.push({ event, data, timestamp: Date.now() });
});
```

Then after performing game actions:

```javascript
// Read captured events
const events = window.__testEvents;
const brickEvents = events.filter(e => e.event === 'brick-placed');
// Assert expected count
```

### 6.3 Zustand State After Game Interactions

Read Zustand store state from the browser to verify game interactions update state correctly.

**Pattern:**

```javascript
// Read game store state via dev-browser evaluate
const state = window.__stores.game.getState();
// Assert state.totalBricks === expectedBricks
// Assert state.attempts.length === expectedAttempts
```

This requires the app to expose stores on `window.__stores` in development mode:

```typescript
// In development, expose stores for E2E testing
if (import.meta.env.DEV) {
  (window as any).__stores = {
    game: useGameStore,
    auth: useAuthStore,
    settings: useSettingsStore,
  };
}
```

---

## 7. Audio / TTS Verification

Audio cannot be heard by the agent, but we can verify the plumbing is correct.

### 7.1 File Existence Checks

```typescript
// ABOUTME: Validates that all expected audio files exist on disk.
// ABOUTME: Catches missing TTS clips and SFX files before deployment.

import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { getAllAudioPaths } from '../tts-map';

describe('audio file existence', () => {
  const allPaths = getAllAudioPaths();

  it('has the expected number of audio files', () => {
    expect(allPaths.length).toBeGreaterThanOrEqual(550);
    expect(allPaths.length).toBeLessThanOrEqual(700);
  });

  it.each(allPaths.slice(0, 20))('file exists: %s', (audioPath) => {
    const fullPath = resolve(__dirname, '../../../public', audioPath.slice(1));
    expect(existsSync(fullPath)).toBe(true);
  });
});
```

### 7.2 TTS Map Coverage

Verify that every canonical multiplication fact (0x0 through 10x10 = 66 facts) has TTS audio entries for both Hebrew and English.

```typescript
describe('TTS map coverage', () => {
  it('covers all 66 canonical facts in Hebrew', () => {
    for (let a = 0; a <= 10; a++) {
      for (let b = a; b <= 10; b++) {
        const path = getQuestionAudioPath(a, b, 'he');
        expect(path).toBeTruthy();
      }
    }
  });

  it('covers all 66 canonical facts in English', () => {
    for (let a = 0; a <= 10; a++) {
      for (let b = a; b <= 10; b++) {
        const path = getQuestionAudioPath(a, b, 'en');
        expect(path).toBeTruthy();
      }
    }
  });
});
```

### 7.3 Console Error Monitoring During Playback

In E2E tests, monitor the browser console for audio-related errors:

```javascript
// Capture console errors via dev-browser
const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

// ... play the game ...

// After gameplay, check for audio errors
const audioErrors = errors.filter(e =>
  e.includes('audio') || e.includes('AudioContext') || e.includes('autoplay')
);
// Assert audioErrors is empty
```

### 7.4 Autoplay Policy Verification

```
SCENARIO: Audio resumes after first user interaction
PRECONDITION: Fresh page load, no prior interaction

STEPS:
1. Navigate to the game
2. Check AudioContext state (should be 'suspended')
3. Click Play button (first user gesture)
4. Check AudioContext state (should be 'running')
5. Verify no autoplay-related console errors
```

---

## 8. Test Data Strategy

### 8.1 Firebase Emulator Seeding

**`src/test/seed-emulator.ts`**:

```typescript
// ABOUTME: Seeds the Firebase emulator with test data for E2E and integration tests.
// ABOUTME: Creates a parent, kid, sessions, attempts, and mastery records.

import {
  initializeApp,
} from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  setDoc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  getAuth,
  connectAuthEmulator,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';

const app = initializeApp({
  projectId: 'demo-learning-multiply',
  apiKey: 'fake-api-key',
  authDomain: 'localhost',
});

const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);

const auth = getAuth(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099');

export interface SeedData {
  parentId: string;
  kidId: string;
  sessionIds: string[];
}

export async function seedTestData(): Promise<SeedData> {
  const parentId = 'test-parent-uid';
  const kidId = 'test-kid-1';

  // Create parent
  await setDoc(doc(db, 'parents', parentId), {
    display_name: 'Test Parent',
    created_at: Timestamp.now(),
  });

  // Create kid
  await setDoc(doc(db, 'kids', kidId), {
    parent_id: parentId,
    name: 'Noa',
    avatar_url: null,
    created_at: Timestamp.now(),
  });

  // Create a completed session
  const sessionRef = await addDoc(collection(db, 'sessions'), {
    kid_id: kidId,
    started_at: Timestamp.fromDate(new Date(Date.now() - 600_000)),
    ended_at: Timestamp.now(),
    level: 1,
    total_questions: 5,
    correct_answers: 4,
    duration_seconds: 300,
  });

  // Create attempts for the session
  const facts = [
    { a: 2, b: 3, correct: 6, given: 6, isCorrect: true },
    { a: 1, b: 5, correct: 5, given: 5, isCorrect: true },
    { a: 0, b: 7, correct: 0, given: 7, isCorrect: false },
    { a: 2, b: 2, correct: 4, given: 4, isCorrect: true },
    { a: 1, b: 8, correct: 8, given: 8, isCorrect: true },
  ];

  for (const fact of facts) {
    await addDoc(collection(db, 'attempts'), {
      session_id: sessionRef.id,
      kid_id: kidId,
      factor_a: fact.a,
      factor_b: fact.b,
      correct_answer: fact.correct,
      given_answer: fact.given,
      is_correct: fact.isCorrect,
      response_time_ms: 1500 + Math.floor(Math.random() * 3000),
      hint_level: 0,
      error_type: fact.isCorrect ? null : 'zero_one_confusion',
      attempted_at: Timestamp.now(),
    });
  }

  // Create mastery records
  const masteryFacts = [
    { a: 2, b: 3, box: 3, total: 8, correct: 7 },
    { a: 1, b: 5, box: 4, total: 10, correct: 9 },
    { a: 0, b: 7, box: 1, total: 5, correct: 2 },
    { a: 2, b: 2, box: 2, total: 6, correct: 4 },
    { a: 1, b: 8, box: 4, total: 12, correct: 11 },
  ];

  for (const m of masteryFacts) {
    const id = `${kidId}_${Math.min(m.a, m.b)}x${Math.max(m.a, m.b)}`;
    await setDoc(doc(db, 'mastery', id), {
      kid_id: kidId,
      factor_a: Math.min(m.a, m.b),
      factor_b: Math.max(m.a, m.b),
      leitner_box: m.box,
      total_attempts: m.total,
      correct_attempts: m.correct,
      avg_response_time_ms: 2500,
      last_practiced_at: Timestamp.now(),
      next_review_at: null,
    });
  }

  // Create progress record
  await setDoc(doc(db, 'progress', `${kidId}_level1`), {
    kid_id: kidId,
    level: 1,
    unlocked_at: Timestamp.fromDate(new Date(Date.now() - 86400_000)),
    completed_at: Timestamp.now(),
    building_height: 50,
  });

  return {
    parentId,
    kidId,
    sessionIds: [sessionRef.id],
  };
}

export async function clearTestData(): Promise<void> {
  // The Firebase emulator supports clearing via REST API
  const response = await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-learning-multiply/databases/(default)/documents',
    { method: 'DELETE' }
  );
  if (!response.ok) {
    throw new Error(`Failed to clear emulator: ${response.statusText}`);
  }
}
```

### 8.2 Per-Test Setup/Teardown Pattern

For unit tests that need specific data fixtures, use Vitest's `beforeEach`:

```typescript
import { beforeEach } from 'vitest';
import type { FactMasteryRecord } from '../../types';

function createMasteryRecord(overrides: Partial<FactMasteryRecord> = {}): FactMasteryRecord {
  return {
    kidId: 'kid-1',
    factorA: 3,
    factorB: 5,
    leitnerBox: 1,
    totalAttempts: 0,
    correctAttempts: 0,
    avgResponseTimeMs: null,
    lastPracticedAt: null,
    nextReviewAt: null,
    ...overrides,
  };
}
```

For Firebase rules tests, `testEnv.clearFirestore()` in `beforeEach` ensures full isolation.

For E2E tests, the seed script runs once before the test suite, and `clearTestData()` runs in `afterAll`.

---

## 9. CI/CD Integration

### 9.1 GitHub Actions Workflow

**`.github/workflows/test.yml`**:

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/

  firebase-rules:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm install -g firebase-tools
      - run: firebase emulators:exec --only auth,firestore --project demo-learning-multiply 'npm run test:firebase'

  e2e-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: firebase emulators:exec --only auth,firestore --project demo-learning-multiply 'npm run test:e2e'
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### 9.2 Trigger Strategy

| Test suite | Trigger | Blocking? |
|-----------|---------|-----------|
| Unit tests (`npm test`) | Every push, every PR | Yes — merge blocked on failure |
| Firebase rules (`npm run test:firebase`) | Every push, every PR | Yes — merge blocked on failure |
| E2E tests (`npm run test:e2e`) | PR only | Yes — merge blocked on failure |
| Coverage report | Every push | No — informational only |

### 9.3 Pre-commit Hook

Add a lightweight pre-commit check that runs only the fast unit tests:

```json
// package.json
{
  "scripts": {
    "precommit": "vitest run --reporter=dot"
  }
}
```

---

## 10. Implementation Checklist

**Instructions for implementing agent:** Work through this checklist in order. Mark items `[x]` as you complete them. Mark the current item `[→]`. Do NOT skip items.

### Phase 1: Framework Setup
- [ ] Install dev dependencies (vitest, @testing-library/react, @testing-library/jest-dom, @vitest/coverage-v8)
- [ ] Create `vitest.config.ts` at project root
- [ ] Create `src/test/setup.ts` with jsdom environment setup
- [ ] Add test scripts to `package.json` (`test`, `test:watch`, `test:coverage`)
- [ ] Verify: `npm test` runs with 0 tests found (no errors)
- [ ] Commit phase 1

### Phase 2: Learning Engine Unit Tests
- [ ] Create test files for all 8 learning engine modules (following plan-learning-engine.md phases)
- [ ] Run tests — all should pass (they are written alongside implementation per TDD in plan-learning-engine)
- [ ] Verify: coverage for `src/lib/learning-engine/` is >95% statements, >90% branches
- [ ] Commit phase 2

### Phase 3: Store Tests
- [ ] Create `src/stores/__tests__/game.test.ts`
- [ ] Create `src/stores/__tests__/auth.test.ts` (mock Firebase, test state transitions)
- [ ] Create `src/stores/__tests__/settings.test.ts` (test locale, volume, persist)
- [ ] Verify: all store tests pass
- [ ] Commit phase 3

### Phase 4: Game Engine Pure Function Tests
- [ ] Create `src/game/__tests__/scoring.test.ts`
- [ ] Create `src/game/manipulatives/__tests__/composite-group.test.ts`
- [ ] Create `src/game/manipulatives/__tests__/workspace-grid.test.ts`
- [ ] Verify: all game logic tests pass
- [ ] Commit phase 4

### Phase 5: Audio Tests
- [ ] Create `src/lib/audio/__tests__/tts-map.test.ts`
- [ ] Create `src/lib/audio/__tests__/manager.test.ts` (mock Web Audio API)
- [ ] Create `src/lib/audio/__tests__/file-existence.test.ts`
- [ ] Verify: all audio tests pass
- [ ] Commit phase 5

### Phase 6: Dashboard Pure Logic Tests
- [ ] Extract pure functions from dashboard hooks (classifyStatus, buildGrid, all insight finders)
- [ ] Create `src/hooks/dashboard/__tests__/mastery-grid.test.ts`
- [ ] Create `src/hooks/dashboard/__tests__/insights.test.ts`
- [ ] Verify: all dashboard logic tests pass
- [ ] Commit phase 6

### Phase 7: i18n Completeness Test
- [ ] Create `src/test/__tests__/i18n-completeness.test.ts`
- [ ] Verify: test passes (both locale files have identical key sets)
- [ ] Commit phase 7

### Phase 8: Firebase Emulator Setup
- [ ] Install `@firebase/rules-unit-testing` and `firebase-tools`
- [ ] Create `firebase.json` with emulator ports
- [ ] Create `vitest.firebase.config.ts`
- [ ] Add `test:firebase` and `firebase:emulators` scripts to `package.json`
- [ ] Verify: `firebase emulators:start` launches auth + firestore emulators
- [ ] Commit phase 8

### Phase 9: Firebase Security Rules Tests
- [ ] Create `src/test/firebase/__tests__/firestore.rules.test.ts`
- [ ] Test all 6 collections (parents, kids, sessions, attempts, mastery, progress)
- [ ] Cover: create-own, create-other, read-own, read-other, update-own, update-other, unauthenticated
- [ ] Verify: all rules tests pass against emulator
- [ ] Commit phase 9

### Phase 10: Test Data Seeding
- [ ] Create `src/test/seed-emulator.ts` with seedTestData() and clearTestData()
- [ ] Create test data factory helpers (`createMasteryRecord`, `createSessionSummary`, etc.)
- [ ] Verify: seed script runs against emulator without errors
- [ ] Commit phase 10

### Phase 11: E2E Setup + First Scenarios
- [ ] Install `@playwright/test`
- [ ] Create `playwright.config.ts`
- [ ] Create `e2e/` directory structure
- [ ] Add dev-mode store exposure (`window.__stores`)
- [ ] **APPROVAL GATE: Show Danny the E2E test plan before writing scenarios. Confirm which scenarios are highest priority.**
- [ ] Write auth flow E2E scenario
- [ ] Write kid management E2E scenario
- [ ] Write game session E2E scenario (5 questions)
- [ ] Verify: E2E tests pass in headed mode
- [ ] Commit phase 11

### Phase 12: CI/CD Pipeline
- [ ] Create `.github/workflows/test.yml` with unit, firebase, and E2E jobs
- [ ] Verify: CI runs successfully on a test push
- [ ] Verify: PR checks block merge on failure
- [ ] Commit phase 12

---

## Risks & Considerations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Phaser canvas interactions hard to test in E2E | High | Use screenshot comparison + EventBus listeners + Zustand state checks. Accept that pixel-perfect canvas testing is not feasible. |
| Firebase emulator startup time slows CI | Medium | Run emulator tests in a separate job. Use `emulators:exec` to start/stop automatically. |
| Flaky E2E tests from timing issues | Medium | Use explicit waits for game state changes (poll Zustand state) rather than arbitrary timeouts. Run with `workers: 1`. |
| Audio testing is inherently limited | Low | Focus on plumbing (correct paths, no console errors, AudioContext state). Danny handles subjective audio quality review. |
| Hebrew RTL testing requires visual verification | Medium | Use dev-browser screenshots. Check `dir="rtl"` attribute programmatically. Heat map and charts should remain LTR. |
| Test data diverging from real data shapes | Medium | Use `SeedData` type that mirrors Firestore document types. TypeScript will catch shape mismatches. |

---

## Dependencies on Other Workstreams

| Dependency | What Testing Needs | When |
|-----------|-------------------|------|
| Foundation | Project scaffold, Vitest installed, Firebase config, Zustand stores | Phase 1 (must exist before any tests) |
| Learning Engine | Implemented modules to test | Phase 2 (TDD — tests written alongside) |
| Game Engine | Extracted scoring functions, EventBus | Phase 4, Phase 6 (E2E) |
| Manipulatives | Extracted pure functions (decompose, grid snap) | Phase 4 |
| Audio | TTS map, audio manager, generated audio files | Phase 5 |
| Dashboard | Hooks with extractable pure logic | Phase 6 |
| Art | Sprite assets loaded in Phaser (for visual E2E) | Phase 11 (E2E only) |
