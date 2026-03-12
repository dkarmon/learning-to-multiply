# Implementation Plan: Learning Engine

## Implementation Checklist

**Instructions for implementing agent:** Work through this checklist in order. Mark items `[x]` as you complete them. Mark the current item `[→]`. Do NOT skip items. Write tests FIRST (TDD), then implement.

### Phase 1: Types and Core Utilities
- [ ] Create `src/types/learning.ts` with all shared types (CanonicalFact, ErrorType, FluencyQuality, DifficultyTier, TierDefinition, Question, LevelPlan, QuestionAttempt, FactMasteryRecord, FactMasterySummary, OverallMastery, HeatMapCell, SessionState, SessionStats, BuildUpStep, BuildUpSequence, LevelProgress)
- [ ] Write tests for `canonicalize()`: verify (5,3) returns {factorA:3, factorB:5}, (3,5) returns same, (4,4) returns {factorA:4, factorB:4}
- [ ] Write tests for `factKey()`: verify factKey(5,3) returns "3x5", factKey(3,5) returns "3x5", factKey(0,0) returns "0x0"
- [ ] Implement `canonicalize()` and `factKey()`
- [ ] Verify: all tests pass
- [ ] Commit phase 1

### Phase 2: Fluency Scoring
- [ ] Write tests for `scoreFluency()`: correct at 800ms→5, at 1500ms→4, at 2500ms→4, at 3000ms→3, at 4500ms→3, at 5000ms→2, at 8000ms→2, wrong+not close→0, wrong+close→1
- [ ] Write tests for `isFluentRecall()`: correct at 1000ms→true, correct at 2999ms→true, correct at 3000ms→false, wrong at 500ms→false
- [ ] Write tests for `isCloseAnswer()`: correct=24 given=25→true (4%), correct=24 given=30→false (25%), correct=0 given=1→true, correct=0 given=3→false, correct=56 given=54→true (3.6%)
- [ ] Create `src/lib/learning-engine/fluency.ts` with `scoreFluency()`, `isFluentRecall()`, `isCloseAnswer()`
- [ ] Verify: all tests pass
- [ ] Commit phase 2

### Phase 3: Leitner Box System
- [ ] Write tests for `promoteFact()`: box 1 quality 5→box 2, box 4 quality 4→box 5, box 5 quality 5→box 5 (capped), box 3 quality 2→box 3 (too slow)
- [ ] Write tests for `demoteFact()`: box 3→box 2, box 1→box 1 (floor), box 5→box 4
- [ ] Write tests for `isDueForReview()`: box 1 any gap→true, box 2 gap 1→false, box 2 gap 2→true, box 3 gap 3→false, box 3 gap 4→true, box 4 gap 7→false, box 4 gap 8→true, box 5 13 days→false, box 5 14 days→true, no lastPracticedAt→true
- [ ] Write tests for `getBoxForFact()`: missing record→0, existing record→its box number
- [ ] Write tests for `calculateNextReviewDate()`: box 5→date 14 days out, box 1-4→null
- [ ] Write tests for `processAttempt()`: correct quality 5→box up + counts updated, correct quality 2→box stays, incorrect→box down one, running average response time is correct
- [ ] Create `src/lib/learning-engine/leitner.ts` with all six functions
- [ ] Verify: all tests pass
- [ ] Commit phase 3

### Phase 4: Error Classifier
- [ ] Write tests for `addition_substitution`: 6x4 gave 10, 3x5 gave 8, 7x3 gave 10
- [ ] Write tests for `zero_one_confusion`: 5x0 gave 5, 5x1 gave 0, 0x7 gave 7, 8x0 gave 1, 1x6 gave 1
- [ ] Write tests for `off_by_one`: 6x4=24 gave 28 (off by 4), 6x4=24 gave 18 (off by 6), 7x8=56 gave 48 (off by 8), 7x8=56 gave 49 (off by 7)
- [ ] Write tests for `neighbor_confusion`: 6x8=48 gave 54 (6x9), 7x8=56 gave 63 (7x9), 6x7=42 gave 48 (6x8)
- [ ] Write tests for `commutative_gap`: high mastery canonical fact (box 3+, >3 correct) with wrong answer → commutative_gap
- [ ] Write tests for `other`: 6x4=24 gave 12→other, 5x5=25 gave 30→other
- [ ] Write test for correct answer edge case: givenAnswer === correctAnswer → 'other' with detail 'Answer is correct'
- [ ] Create `src/lib/learning-engine/error-classifier.ts` with `classifyError()` and helpers (isZeroOneConfusion, findNeighborConfusion, detectCommutativeGap)
- [ ] Verify: all tests pass
- [ ] Commit phase 4

### Phase 5: Difficulty Progression
- [ ] Write tests for `getTierForLevel()`: level 1→tier 1, level 5→tier 2, level 8→tier 3, level 10→tier 4, level 15→tier 5, level 20→tier 5 (beyond max)
- [ ] Write tests for `getCurrentTier()`: delegates to getTierForLevel correctly
- [ ] Write tests for `getAvailableFacts()`: level 1 returns only facts involving 0,1,2; level 5 includes 0,1,2,5,10; level 15 includes all facts up to 10x10
- [ ] Write tests for `getNewFactsForTier()`: tier 1 has facts with 0,1,2; tier 2 excludes facts already covered by {0,1,2}; tier 5 has facts with 6,7,8 not covered by earlier tiers
- [ ] Write tests for `canAdvanceLevel()`: 5/5 correct avg 2s→true, 4/5 correct avg 4s→true, 3/5 correct→false (accuracy), 5/5 correct avg 6s→false (too slow), empty→false
- [ ] Write tests for `getLevelPlan()`: fresh kid level 1→all new no review, kid level 4 with mastery→tier 2 new + tier 1 review
- [ ] Create `src/lib/learning-engine/difficulty.ts` with TIER_DEFINITIONS, getTierForLevel, getCurrentTier, getAvailableFacts, getNewFactsForTier, canAdvanceLevel, getLevelPlan
- [ ] Verify: all tests pass
- [ ] Commit phase 5

### Phase 6: Build-Up Sequences
- [ ] Write tests for `generateBuildUpSequence()`: 6x5 nothing mastered→5 question steps; 6x5 with 6x1-6x3 mastered→scaffold at 6x3 then questions 6x4,6x5; all sub-facts mastered→scaffold at 6x4 then question 6x5; edge case 6x1→single question step; edge case 6x0→single question step; 3x2 with 3x1 mastered→scaffold 3x1 then question 3x2
- [ ] Write tests for `shouldUseBuildUp()`: 6x5 not mastered→true, 6x2→false (targetStep<3), 6x5 already mastered box 3+→false, 6x1→false (targetStep=1)
- [ ] Create `src/lib/learning-engine/build-up.ts` with `generateBuildUpSequence()` and `shouldUseBuildUp()`
- [ ] Verify: all tests pass
- [ ] Commit phase 6

### Phase 7: Session Manager
- [ ] Write tests for `startSession()`: returns valid state with empty attempts, empty retryQueue, empty missedThisSession
- [ ] Write tests for `recordAttempt()`: correct answer→attempt added, no retry, no missed; wrong answer→error classified, fact added to retryQueue and missedThisSession; null answer→treated as incorrect
- [ ] Write tests for `getRetryFact()`: empty queue→null; one missed fact 1 question elapsed→null (too soon); one missed fact 2+ questions elapsed→returns fact and removes from queue; multiple missed→FIFO order
- [ ] Write tests for `shouldSuggestBreak()`: 5 min elapsed→'none', 10 min elapsed→'soft', 15 min elapsed→'strong'
- [ ] Write tests for `getSessionStats()`: 5 questions 4 correct→80% accuracy, avg response time correct, factsLearned includes ever-correct facts, factsMissed includes only-wrong facts
- [ ] Write tests for `endSession()`: returns correctly shaped Firestore data (ISO date strings, all attempts included, session fields match)
- [ ] Create `src/lib/learning-engine/session.ts` with startSession, recordAttempt, getRetryFact, shouldSuggestBreak, getSessionStats, endSession
- [ ] Verify: all tests pass
- [ ] Commit phase 7

### Phase 8: Question Selector
- [ ] Write tests for `buildLevelQuestions()`: fresh kid level 1→5 questions from tier 1 multipliers; kid level 4 with mastery→~3 new + ~2 review; no two consecutive same canonical fact; at most 1 truly new fact per level; returns correct tier and reviewRatio
- [ ] Write tests for interleaving: 3 new + 2 review→[N,R,N,R,N]; 5 review + 0 new→all review; 0 review + 5 new→all new
- [ ] Write tests for deduplication: [3x5,3x5,4x6]→swapped so no consecutive duplicates; [3x5,4x6,7x8]→unchanged
- [ ] Write tests for `getNextQuestion()`: no retry due→returns question from level plan; retry fact due→returns retry with isRetry=true; new fact eligible for build-up→returns buildUpSequence; new fact not eligible (small factors)→buildUpSequence is null
- [ ] Create `src/lib/learning-engine/question-selector.ts` with buildLevelQuestions, getNextQuestion, and helpers (interleaveQuestions, deduplicateConsecutive, shuffleArray)
- [ ] Verify: all tests pass
- [ ] Commit phase 8

### Phase 9: Mastery Calculator
- [ ] Write tests for `getAllCanonicalFacts()`: returns exactly 66 facts, first is (0,0), last is (10,10), no duplicates
- [ ] Write tests for `getFactMastery()`: no record→box 0, 0% accuracy, stable trend; record with 10 attempts 8 correct→80% accuracy; trend from [wrong,wrong,right,right,right]→improving
- [ ] Write tests for `getAllMastery()`: empty records→66 not_started; mixed records→correct counts per category (mastered box 4-5, learning box 2-3, struggling box 1, not_started)
- [ ] Write tests for `getMasteryHeatMap()`: returns exactly 121 cells; (3,5) and (5,3) share same status; unstarted facts show 'not_started'
- [ ] Write tests for `calculateTrend()` (via getFactMastery): <4 attempts→stable; first half wrong second half right→improving; first half right second half wrong→declining; mixed→stable
- [ ] Write tests for `getStrugglingFacts()`: sorted by lowest box then lowest accuracy; respects limit; excludes 0-attempt facts
- [ ] Create `src/lib/learning-engine/mastery.ts` with getAllCanonicalFacts, getFactMastery, getAllMastery, getMasteryHeatMap, calculateTrend (private), getStrugglingFacts
- [ ] Verify: all tests pass
- [ ] Commit phase 9

### Phase 10: Barrel Export and Integration Test
- [ ] Create `src/lib/learning-engine/index.ts` barrel export re-exporting all public functions from all modules
- [ ] Write integration test: full session lifecycle (start session → build level → answer questions → record attempts → check retry queue → advance level → end session → verify mastery updates)
- [ ] Verify: all exports resolve without error
- [ ] Verify: integration test passes
- [ ] Verify: ALL module tests still pass
- [ ] Commit phase 10

---

Generated: 2026-03-11

## Goal

Build the pedagogical brain of the multiplication learning game as pure TypeScript modules with no UI dependencies. This engine handles spaced repetition, question selection, difficulty progression, error classification, fluency scoring, and session management. All functions are pure where possible; Firestore I/O happens only at session boundaries.

## Existing Codebase Analysis

The project is greenfield -- no `src/` directory exists yet. The Foundation agent will create the project scaffold, Firebase client, and shared types. This plan defines the complete contents of `src/lib/learning-engine/` and `src/types/learning.ts`.

**Dependencies from Foundation agent:**
- `src/lib/firebase.ts` -- Firebase client instance
- `src/types/firestore.ts` -- Firestore document types
- Zustand stores will import from our modules but we don't import from them

## Architecture

```
src/types/learning.ts          -- All shared types/interfaces
src/lib/learning-engine/
  index.ts                     -- Public API barrel export
  leitner.ts                   -- Leitner box system
  question-selector.ts         -- Question selection algorithm
  difficulty.ts                -- Difficulty tiers & progression
  error-classifier.ts          -- Error pattern detection
  build-up.ts                  -- Build-up sequence generator
  fluency.ts                   -- Response time scoring
  session.ts                   -- Session manager
  mastery.ts                   -- Fact mastery calculator
```

**Key constraints:**
- All functions are pure where possible (input -> output)
- Firestore reads happen at session start, writes at session end
- In-session state lives in memory, passed as function arguments
- Facts stored canonically as `(min(a,b), max(a,b))`
- No UI imports, no Zustand imports, no React imports

---

## File 1: `src/types/learning.ts`

```typescript
// ABOUTME: Shared TypeScript types for the learning engine and game state.
// ABOUTME: Defines interfaces for questions, attempts, mastery, sessions, and errors.

// --- Canonical Fact ---

export interface CanonicalFact {
  /** Always min(a, b) */
  factorA: number;
  /** Always max(a, b) */
  factorB: number;
}

/** Create a canonical fact from any two factors. 3x5 and 5x3 both become (3,5). */
export function canonicalize(a: number, b: number): CanonicalFact {
  return {
    factorA: Math.min(a, b),
    factorB: Math.max(a, b),
  };
}

/** Unique string key for a canonical fact, used as Map/Set keys. */
export function factKey(a: number, b: number): string {
  const f = canonicalize(a, b);
  return `${f.factorA}x${f.factorB}`;
}

// --- Error Types ---

export type ErrorType =
  | 'addition_substitution'
  | 'off_by_one'
  | 'neighbor_confusion'
  | 'zero_one_confusion'
  | 'commutative_gap'
  | 'other';

// --- Fluency ---

/** Quality score from 0 (wrong) to 5 (instant recall). */
export type FluencyQuality = 0 | 1 | 2 | 3 | 4 | 5;

// --- Difficulty ---

export type DifficultyTier = 1 | 2 | 3 | 4 | 5;

export interface TierDefinition {
  tier: DifficultyTier;
  multipliers: number[];
  levels: [number, number]; // inclusive range [startLevel, endLevel]
  label: string;
}

// --- Questions ---

export interface Question {
  factorA: number;
  factorB: number;
  correctAnswer: number;
  isBuildingUp: boolean;
  buildUpSequenceIndex: number;
  isReview: boolean;
  leitnerBox: number;
}

export interface LevelPlan {
  levelNumber: number;
  questions: Question[];
  tier: DifficultyTier;
  reviewRatio: number;
}

// --- Attempts ---

export interface QuestionAttempt {
  factorA: number;
  factorB: number;
  correctAnswer: number;
  givenAnswer: number | null;
  isCorrect: boolean;
  responseTimeMs: number;
  hintLevel: 0 | 1 | 2;
  errorType: ErrorType | null;
  fluencyQuality: FluencyQuality;
  attemptedAt: Date;
}

// --- Leitner / Mastery ---

export interface FactMasteryRecord {
  kidId: string;
  factorA: number;
  factorB: number;
  leitnerBox: number;
  totalAttempts: number;
  correctAttempts: number;
  avgResponseTimeMs: number | null;
  lastPracticedAt: Date | null;
  nextReviewAt: Date | null;
}

export interface FactMasterySummary {
  fact: CanonicalFact;
  leitnerBox: number;
  accuracyPercent: number;
  avgResponseTimeMs: number | null;
  trend: 'improving' | 'stable' | 'declining';
  lastPracticedAt: Date | null;
}

export interface OverallMastery {
  totalFacts: number;
  mastered: number;       // box 4-5
  learning: number;       // box 2-3
  notStarted: number;     // no record or box 1 with 0 attempts
  struggling: number;     // box 1 with attempts
}

export interface HeatMapCell {
  factorA: number;
  factorB: number;
  status: 'mastered' | 'learning' | 'struggling' | 'not_started';
  leitnerBox: number;
  accuracyPercent: number | null;
}

// --- Session ---

export interface SessionState {
  sessionId: string;
  kidId: string;
  startedAt: Date;
  currentLevel: number;
  attempts: QuestionAttempt[];
  retryQueue: CanonicalFact[];
  missedThisSession: Set<string>; // factKey strings
}

export interface SessionStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracyPercent: number;
  avgResponseTimeMs: number;
  durationSeconds: number;
  factsLearned: CanonicalFact[];
  factsMissed: CanonicalFact[];
}

// --- Build-Up ---

export interface BuildUpStep {
  factorA: number;
  factorB: number;
  correctAnswer: number;
  /** Whether this step should show the visual without asking (already mastered). */
  isScaffold: boolean;
  /** Whether this step should be asked as a question. */
  isQuestion: boolean;
}

export interface BuildUpSequence {
  targetFact: CanonicalFact;
  steps: BuildUpStep[];
}

// --- Level Progress ---

export interface LevelProgress {
  level: number;
  unlockedAt: Date;
  completedAt: Date | null;
  buildingHeight: number;
}
```

---

## File 2: `src/lib/learning-engine/leitner.ts`

```typescript
// ABOUTME: Leitner box spaced repetition system with 5 boxes and gentle regression.
// ABOUTME: Manages fact promotion, demotion, and review scheduling.

import type { FactMasteryRecord, FluencyQuality } from '../../types/learning';

/** Review intervals per box, in number of sessions. Box 5 uses calendar days instead. */
const BOX_SESSION_INTERVALS: Record<number, number> = {
  1: 1,   // every session
  2: 2,   // every 2 sessions
  3: 4,   // every 4 sessions
  4: 8,   // every 8 sessions
  5: -1,  // special: random every ~2 weeks (14 days)
};

const BOX_5_REVIEW_DAYS = 14;
const MAX_BOX = 5;
const MIN_BOX = 1;

/**
 * Promote a fact to the next Leitner box.
 * Only promotes if fluency quality >= 3 (slow but correct or better).
 * Returns the new box number.
 */
export function promoteFact(currentBox: number, fluencyQuality: FluencyQuality): number {
  if (fluencyQuality < 3) {
    // Correct but too slow -- stay in current box
    return currentBox;
  }
  return Math.min(currentBox + 1, MAX_BOX);
}

/**
 * Demote a fact by one box (gentle regression).
 * Wrong answers move back ONE box, not to Box 1.
 */
export function demoteFact(currentBox: number): number {
  return Math.max(currentBox - 1, MIN_BOX);
}

/**
 * Determine whether a fact is due for review given the current session number.
 *
 * For boxes 1-4: due if (currentSession - lastReviewedSession) >= interval.
 * For box 5: due if (now - lastPracticedAt) >= 14 days.
 *
 * A fact with no lastPracticedAt is always due.
 */
export function isDueForReview(
  record: FactMasteryRecord,
  currentSessionNumber: number,
  lastReviewedAtSession: number,
  now: Date = new Date()
): boolean {
  if (record.lastPracticedAt === null) {
    return true;
  }

  const box = record.leitnerBox;

  if (box === 5) {
    const daysSinceLastPractice = Math.floor(
      (now.getTime() - record.lastPracticedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastPractice >= BOX_5_REVIEW_DAYS;
  }

  const interval = BOX_SESSION_INTERVALS[box];
  if (interval === undefined) {
    return true;
  }

  const sessionsSinceReview = currentSessionNumber - lastReviewedAtSession;
  return sessionsSinceReview >= interval;
}

/**
 * Get the box number for a fact. Returns 0 if the fact has never been practiced.
 */
export function getBoxForFact(
  records: Map<string, FactMasteryRecord>,
  factKeyStr: string
): number {
  const record = records.get(factKeyStr);
  if (!record) return 0;
  return record.leitnerBox;
}

/**
 * Calculate the next review date for a fact after it has been practiced.
 * For boxes 1-4 this returns null (session-based scheduling).
 * For box 5, returns a date ~14 days from now.
 */
export function calculateNextReviewDate(box: number, now: Date = new Date()): Date | null {
  if (box !== 5) {
    return null; // session-based, not calendar-based
  }
  const next = new Date(now);
  next.setDate(next.getDate() + BOX_5_REVIEW_DAYS);
  return next;
}

/**
 * Process a single attempt and return the updated mastery record.
 * Pure function: takes old record + attempt result, returns new record.
 */
export function processAttempt(
  record: FactMasteryRecord,
  isCorrect: boolean,
  responseTimeMs: number,
  fluencyQuality: FluencyQuality,
  now: Date = new Date()
): FactMasteryRecord {
  const newTotalAttempts = record.totalAttempts + 1;
  const newCorrectAttempts = record.correctAttempts + (isCorrect ? 1 : 0);
  const newBox = isCorrect
    ? promoteFact(record.leitnerBox, fluencyQuality)
    : demoteFact(record.leitnerBox);

  // Running average of response time
  const prevAvg = record.avgResponseTimeMs ?? responseTimeMs;
  const newAvgResponseTime = Math.round(
    prevAvg + (responseTimeMs - prevAvg) / newTotalAttempts
  );

  return {
    ...record,
    leitnerBox: newBox,
    totalAttempts: newTotalAttempts,
    correctAttempts: newCorrectAttempts,
    avgResponseTimeMs: newAvgResponseTime,
    lastPracticedAt: now,
    nextReviewAt: calculateNextReviewDate(newBox, now),
  };
}
```

**Test scenarios for `leitner.ts`:**

```typescript
// Test: promoteFact
// - Box 1, quality 5 → Box 2
// - Box 4, quality 4 → Box 5
// - Box 5, quality 5 → Box 5 (capped)
// - Box 3, quality 2 → Box 3 (too slow, no promotion)
// - Box 1, quality 0 → should not be called (wrong answer uses demoteFact)

// Test: demoteFact
// - Box 3 → Box 2
// - Box 1 → Box 1 (floor)
// - Box 5 → Box 4

// Test: isDueForReview
// - Box 1, any session gap → true
// - Box 2, 1 session gap → false
// - Box 2, 2 session gap → true
// - Box 3, 3 session gap → false
// - Box 3, 4 session gap → true
// - Box 4, 7 session gap → false
// - Box 4, 8 session gap → true
// - Box 5, 13 days → false
// - Box 5, 14 days → true
// - No lastPracticedAt → true

// Test: processAttempt
// - Correct with quality 5: box goes up, counts updated
// - Correct with quality 2: box stays same
// - Incorrect: box goes down one
// - Avg response time running average is correct
```

---

## File 3: `src/lib/learning-engine/difficulty.ts`

```typescript
// ABOUTME: Difficulty tier definitions and level progression logic.
// ABOUTME: Controls which facts are available at each level and when advancement happens.

import type {
  CanonicalFact,
  DifficultyTier,
  TierDefinition,
  FactMasteryRecord,
  LevelProgress,
} from '../../types/learning';
import { canonicalize, factKey } from '../../types/learning';

export const TIER_DEFINITIONS: TierDefinition[] = [
  { tier: 1, multipliers: [0, 1, 2],    levels: [1, 3],   label: 'Zero, One, Doubles' },
  { tier: 2, multipliers: [5, 10],       levels: [4, 5],   label: 'Fives and Tens' },
  { tier: 3, multipliers: [3, 4],        levels: [6, 8],   label: 'Threes and Fours' },
  { tier: 4, multipliers: [9],           levels: [9, 10],  label: 'Nines' },
  { tier: 5, multipliers: [6, 7, 8],     levels: [11, 15], label: 'Hard Facts' },
];

/** The full range of factors in the game (0-10). */
const ALL_FACTORS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Get the tier definition for a given level number.
 */
export function getTierForLevel(level: number): TierDefinition {
  for (const tier of TIER_DEFINITIONS) {
    if (level >= tier.levels[0] && level <= tier.levels[1]) {
      return tier;
    }
  }
  // Beyond level 15, stay on tier 5 (mixed review)
  return TIER_DEFINITIONS[TIER_DEFINITIONS.length - 1];
}

/**
 * Get the current tier based on the kid's highest completed level.
 */
export function getCurrentTier(currentLevel: number): DifficultyTier {
  return getTierForLevel(currentLevel).tier;
}

/**
 * Get all canonical facts that can be introduced at the given level.
 * "New" facts are those whose multiplier belongs to the current tier
 * AND haven't been introduced in earlier tiers.
 *
 * Each tier introduces facts where at least one factor is in the tier's multipliers
 * AND the other factor comes from all factors seen so far (including current tier).
 */
export function getAvailableFacts(level: number): CanonicalFact[] {
  const currentTier = getTierForLevel(level);

  // Collect all multipliers from current tier and all earlier tiers
  const allAvailableMultipliers = new Set<number>();
  for (const tier of TIER_DEFINITIONS) {
    if (tier.tier <= currentTier.tier) {
      for (const m of tier.multipliers) {
        allAvailableMultipliers.add(m);
      }
    }
  }

  const facts: CanonicalFact[] = [];
  const seen = new Set<string>();

  // Generate all facts where at least one factor is in the current or earlier tiers
  for (const a of ALL_FACTORS) {
    for (const b of ALL_FACTORS) {
      if (a > b) continue; // canonical: a <= b
      if (!allAvailableMultipliers.has(a) && !allAvailableMultipliers.has(b)) continue;
      const key = factKey(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      facts.push(canonicalize(a, b));
    }
  }

  return facts;
}

/**
 * Get only the NEW facts introduced in the current tier (not available in earlier tiers).
 */
export function getNewFactsForTier(tier: DifficultyTier): CanonicalFact[] {
  const tierDef = TIER_DEFINITIONS.find(t => t.tier === tier);
  if (!tierDef) return [];

  // Facts available up to the previous tier
  const previousMultipliers = new Set<number>();
  for (const t of TIER_DEFINITIONS) {
    if (t.tier < tier) {
      for (const m of t.multipliers) {
        previousMultipliers.add(m);
      }
    }
  }

  const currentMultipliers = new Set(tierDef.multipliers);
  const facts: CanonicalFact[] = [];
  const seen = new Set<string>();

  for (const a of ALL_FACTORS) {
    for (const b of ALL_FACTORS) {
      if (a > b) continue;
      // At least one factor must be in the CURRENT tier's multipliers
      if (!currentMultipliers.has(a) && !currentMultipliers.has(b)) continue;
      // Must NOT be fully covered by previous tiers
      if (previousMultipliers.has(a) && previousMultipliers.has(b)) continue;
      const key = factKey(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      facts.push(canonicalize(a, b));
    }
  }

  return facts;
}

/**
 * Level completion criteria: 80%+ accuracy AND avg response time < 5000ms.
 * Evaluates only the attempts from the current level.
 */
export function canAdvanceLevel(
  levelAttempts: { isCorrect: boolean; responseTimeMs: number }[]
): boolean {
  if (levelAttempts.length === 0) return false;

  const correct = levelAttempts.filter(a => a.isCorrect).length;
  const accuracy = correct / levelAttempts.length;

  const avgResponseTime =
    levelAttempts.reduce((sum, a) => sum + a.responseTimeMs, 0) / levelAttempts.length;

  return accuracy >= 0.8 && avgResponseTime < 5000;
}

/**
 * Build a level plan: determine which facts to include and in what ratio.
 *
 * Returns a list of canonical facts split into { newFacts, reviewFacts }
 * for the question selector to assemble into questions.
 */
export function getLevelPlan(
  level: number,
  masteryRecords: Map<string, FactMasteryRecord>
): { newFacts: CanonicalFact[]; reviewFacts: CanonicalFact[]; tier: DifficultyTier } {
  const tierDef = getTierForLevel(level);
  const newFactsForTier = getNewFactsForTier(tierDef.tier);
  const allAvailableFacts = getAvailableFacts(level);

  // New facts: facts in this tier that the kid hasn't mastered (box < 4)
  const newFacts = newFactsForTier.filter(f => {
    const key = factKey(f.factorA, f.factorB);
    const record = masteryRecords.get(key);
    if (!record) return true;
    return record.leitnerBox < 4;
  });

  // Review facts: facts from earlier tiers (not in newFacts)
  const newFactKeys = new Set(newFacts.map(f => factKey(f.factorA, f.factorB)));
  const reviewFacts = allAvailableFacts.filter(f => {
    const key = factKey(f.factorA, f.factorB);
    if (newFactKeys.has(key)) return false;
    const record = masteryRecords.get(key);
    // Only review facts that have been practiced at least once
    return record !== undefined && record.totalAttempts > 0;
  });

  return { newFacts, reviewFacts, tier: tierDef.tier };
}
```

**Test scenarios for `difficulty.ts`:**

```typescript
// Test: getTierForLevel
// - Level 1 → tier 1
// - Level 5 → tier 2
// - Level 8 → tier 3
// - Level 10 → tier 4
// - Level 15 → tier 5
// - Level 20 → tier 5 (beyond max, stays at tier 5)

// Test: getAvailableFacts
// - Level 1: only facts involving 0, 1, 2 (e.g., 0x0, 0x1, ..., 2x2)
// - Level 5: facts involving 0,1,2,5,10
// - Level 15: all facts up to 10x10

// Test: getNewFactsForTier
// - Tier 1: all facts with 0, 1, or 2
// - Tier 2: facts with 5 or 10 that aren't already covered by {0,1,2}
//   e.g., 3x5 is new (3 wasn't in tier 1), but 1x5 was already available
// - Tier 3: facts with 3 or 4 not covered by {0,1,2,5,10}
// - Tier 5: facts with 6, 7, or 8 not covered by earlier tiers

// Test: canAdvanceLevel
// - 5/5 correct, avg 2s → true
// - 4/5 correct (80%), avg 4s → true
// - 3/5 correct (60%), avg 2s → false (accuracy)
// - 5/5 correct, avg 6s → false (too slow)
// - Empty attempts → false

// Test: getLevelPlan
// - Fresh kid at level 1: all tier 1 facts are new, no review facts
// - Kid at level 4 with some mastery: tier 2 new facts + tier 1 review facts
```

---

## File 4: `src/lib/learning-engine/error-classifier.ts`

```typescript
// ABOUTME: Classifies wrong answers into specific error patterns for adaptive response.
// ABOUTME: Detects addition substitution, off-by-one, neighbor confusion, and more.

import type { ErrorType, FactMasteryRecord } from '../../types/learning';
import { factKey } from '../../types/learning';

interface ClassificationInput {
  factorA: number;
  factorB: number;
  correctAnswer: number;
  givenAnswer: number;
}

interface ClassificationResult {
  errorType: ErrorType;
  detail: string;
}

/**
 * Classify a wrong answer into a specific error type.
 * Checks patterns in priority order (most specific first).
 */
export function classifyError(
  input: ClassificationInput,
  masteryRecords?: Map<string, FactMasteryRecord>
): ClassificationResult {
  const { factorA, factorB, correctAnswer, givenAnswer } = input;

  // Sanity: if the answer is correct, there's no error
  if (givenAnswer === correctAnswer) {
    return { errorType: 'other', detail: 'Answer is correct' };
  }

  // 1. Addition substitution: child added instead of multiplied
  if (givenAnswer === factorA + factorB) {
    return {
      errorType: 'addition_substitution',
      detail: `Gave ${factorA}+${factorB}=${givenAnswer} instead of ${factorA}×${factorB}=${correctAnswer}`,
    };
  }

  // 2. Zero/one confusion: swapped x0 and x1 results
  if (isZeroOneConfusion(factorA, factorB, correctAnswer, givenAnswer)) {
    return {
      errorType: 'zero_one_confusion',
      detail: `Confused x0 and x1 rules`,
    };
  }

  // 3. Off-by-one: answer is off by exactly one group (one factorA or one factorB)
  const diff = Math.abs(givenAnswer - correctAnswer);
  if (diff === factorA || diff === factorB) {
    return {
      errorType: 'off_by_one',
      detail: `Off by one group of ${diff === factorA ? factorA : factorB}`,
    };
  }

  // 4. Neighbor confusion: answer matches an adjacent fact
  const neighborMatch = findNeighborConfusion(factorA, factorB, givenAnswer);
  if (neighborMatch !== null) {
    return {
      errorType: 'neighbor_confusion',
      detail: `Gave answer for ${neighborMatch.a}×${neighborMatch.b}=${givenAnswer}`,
    };
  }

  // 5. Commutative gap: check if the reversed form has higher mastery
  if (masteryRecords && factorA !== factorB) {
    const commGap = detectCommutativeGap(factorA, factorB, masteryRecords);
    if (commGap) {
      return {
        errorType: 'commutative_gap',
        detail: `Reverse fact ${factorB}×${factorA} has higher mastery`,
      };
    }
  }

  return { errorType: 'other', detail: 'No specific pattern detected' };
}

/**
 * Detect zero/one confusion: child gives factorN for Nx0 (should be 0)
 * or gives 0 for Nx1 (should be N).
 */
function isZeroOneConfusion(
  factorA: number,
  factorB: number,
  correctAnswer: number,
  givenAnswer: number
): boolean {
  // Case: N x 0 = 0, but child answered N (x1 result)
  if (factorA === 0 && givenAnswer === factorB) return true;
  if (factorB === 0 && givenAnswer === factorA) return true;

  // Case: N x 1 = N, but child answered 0 (x0 result)
  if (factorA === 1 && givenAnswer === 0) return true;
  if (factorB === 1 && givenAnswer === 0) return true;

  // Case: N x 1 = N, but child answered 1
  if (factorA === 1 && givenAnswer === 1 && correctAnswer !== 1) return true;
  if (factorB === 1 && givenAnswer === 1 && correctAnswer !== 1) return true;

  // Case: N x 0 = 0, but child answered 1 (confused 0 and 1 as identities)
  if (factorA === 0 && givenAnswer === 1) return true;
  if (factorB === 0 && givenAnswer === 1) return true;

  return false;
}

/**
 * Check if the given answer matches a neighboring fact.
 * Neighbors: same factorA with factorB +/- 1, or same factorB with factorA +/- 1.
 */
function findNeighborConfusion(
  factorA: number,
  factorB: number,
  givenAnswer: number
): { a: number; b: number } | null {
  const neighbors = [
    { a: factorA, b: factorB - 1 },
    { a: factorA, b: factorB + 1 },
    { a: factorA - 1, b: factorB },
    { a: factorA + 1, b: factorB },
  ];

  for (const n of neighbors) {
    if (n.a < 0 || n.b < 0 || n.a > 10 || n.b > 10) continue;
    if (n.a * n.b === givenAnswer) {
      return n;
    }
  }

  return null;
}

/**
 * Detect a commutative gap: the kid knows one form (e.g., 3x7) better than
 * the reverse (7x3). Both canonical forms are the same fact, but presentation
 * order matters for recall.
 *
 * We check if there's a significant mastery difference between presentations.
 * Note: since we store canonically, this requires looking at per-presentation
 * attempt data, which the session tracks. For the cross-session check,
 * we approximate by comparing if the canonical fact has high mastery but
 * the kid just got it wrong -- suggests presentation-order sensitivity.
 */
function detectCommutativeGap(
  factorA: number,
  factorB: number,
  masteryRecords: Map<string, FactMasteryRecord>
): boolean {
  // Both forms are the same canonical key, so we can't distinguish from
  // mastery records alone. Return false -- commutative gap detection
  // primarily happens in-session by tracking which presentation order
  // was correct vs wrong. The session manager handles this.
  //
  // However, if the canonical fact has high mastery (box 3+) and the kid
  // just got it wrong, that's suspicious and may indicate a commutative gap.
  const key = factKey(factorA, factorB);
  const record = masteryRecords.get(key);
  if (!record) return false;

  // High mastery but wrong answer suggests presentation-order issue
  return record.leitnerBox >= 3 && record.correctAttempts > 3;
}
```

**Test scenarios for `error-classifier.ts`:**

```typescript
// Test: addition_substitution
// - 6×4, gave 10 → addition_substitution (6+4=10)
// - 3×5, gave 8 → addition_substitution (3+5=8)
// - 7×3, gave 10 → addition_substitution (7+3=10)

// Test: zero_one_confusion
// - 5×0, gave 5 → zero_one_confusion (gave x1 result)
// - 5×1, gave 0 → zero_one_confusion (gave x0 result)
// - 0×7, gave 7 → zero_one_confusion
// - 8×0, gave 1 → zero_one_confusion (confused identities)
// - 1×6, gave 1 → zero_one_confusion (gave 1 instead of 6)

// Test: off_by_one
// - 6×4=24, gave 28 → off_by_one (off by one group of 4: 28-24=4)
// - 6×4=24, gave 18 → off_by_one (off by one group of 6: 24-18=6)
// - 7×8=56, gave 48 → off_by_one (off by one group of 8: 56-48=8)
// - 7×8=56, gave 49 → off_by_one (off by one group of 7: 56-49=7)

// Test: neighbor_confusion
// - 6×8=48, gave 54 → neighbor_confusion (6×9=54)
// - 7×8=56, gave 63 → neighbor_confusion (7×9=63)
// - 6×7=42, gave 48 → neighbor_confusion (6×8=48)

// Test: other
// - 6×4=24, gave 12 → other (no pattern match)
// - 5×5=25, gave 30 → other
```

---

## File 5: `src/lib/learning-engine/build-up.ts`

```typescript
// ABOUTME: Generates building-up sequences for learning new multiplication facts.
// ABOUTME: Uses derived fact strategy: 6x2 → 6x3 → 6x4 → 6x5 starting from highest mastered.

import type {
  BuildUpSequence,
  BuildUpStep,
  CanonicalFact,
  FactMasteryRecord,
} from '../../types/learning';
import { factKey } from '../../types/learning';

const MASTERED_BOX_THRESHOLD = 3;

/**
 * Generate a build-up sequence for a target fact.
 *
 * For target 6×5, the full sequence is: [6×1, 6×2, 6×3, 6×4, 6×5].
 * We start from the highest mastered step in the sequence.
 *
 * The "base" factor is the one that stays constant (the larger one for canonical storage).
 * The "step" factor increases from 1 up to the target.
 *
 * @param targetA - One factor of the target fact (as presented, not canonical)
 * @param targetB - The other factor of the target fact (as presented)
 * @param masteryRecords - Current mastery state
 * @returns A BuildUpSequence with scaffold steps and question steps
 */
export function generateBuildUpSequence(
  targetA: number,
  targetB: number,
  masteryRecords: Map<string, FactMasteryRecord>
): BuildUpSequence {
  // The "base" is the factor that stays constant across the sequence.
  // The "step" factor increases from 1 to the target value.
  // Convention: we build up the smaller factor. So for 6×5:
  // base=6, step goes 1,2,3,4,5 → 6×1, 6×2, 6×3, 6×4, 6×5
  const base = Math.max(targetA, targetB);
  const targetStep = Math.min(targetA, targetB);

  // Edge case: if target step is 0 or 1, no build-up needed
  if (targetStep <= 1) {
    return {
      targetFact: { factorA: Math.min(targetA, targetB), factorB: Math.max(targetA, targetB) },
      steps: [{
        factorA: base,
        factorB: targetStep,
        correctAnswer: base * targetStep,
        isScaffold: false,
        isQuestion: true,
      }],
    };
  }

  // Build full sequence from 1 to targetStep
  const allSteps: { step: number; isMastered: boolean }[] = [];
  for (let s = 1; s <= targetStep; s++) {
    const key = factKey(base, s);
    const record = masteryRecords.get(key);
    const isMastered = record !== undefined && record.leitnerBox >= MASTERED_BOX_THRESHOLD;
    allSteps.push({ step: s, isMastered });
  }

  // Find the highest consecutive mastered step from the start
  let highestMastered = 0;
  for (const entry of allSteps) {
    if (entry.isMastered) {
      highestMastered = entry.step;
    } else {
      break;
    }
  }

  // Build the output sequence
  const steps: BuildUpStep[] = [];

  for (const entry of allSteps) {
    const s = entry.step;
    if (s <= highestMastered) {
      // Show the last mastered step as scaffold (visual reminder), skip earlier ones
      if (s === highestMastered) {
        steps.push({
          factorA: base,
          factorB: s,
          correctAnswer: base * s,
          isScaffold: true,
          isQuestion: false,
        });
      }
      // Skip steps before the highest mastered
    } else {
      // This step needs to be asked as a question
      steps.push({
        factorA: base,
        factorB: s,
        correctAnswer: base * s,
        isScaffold: false,
        isQuestion: true,
      });
    }
  }

  return {
    targetFact: { factorA: Math.min(targetA, targetB), factorB: Math.max(targetA, targetB) },
    steps,
  };
}

/**
 * Check if a fact should use build-up mode when first introduced.
 * Build-up is useful when the target step factor is >= 3 (sequences shorter
 * than 3 steps aren't worth the scaffolding).
 */
export function shouldUseBuildUp(
  targetA: number,
  targetB: number,
  masteryRecords: Map<string, FactMasteryRecord>
): boolean {
  const targetStep = Math.min(targetA, targetB);
  if (targetStep < 3) return false;

  const key = factKey(targetA, targetB);
  const record = masteryRecords.get(key);

  // Only use build-up for facts not yet mastered
  if (record && record.leitnerBox >= MASTERED_BOX_THRESHOLD) return false;

  return true;
}
```

**Test scenarios for `build-up.ts`:**

```typescript
// Test: generateBuildUpSequence
// - Target 6×5, nothing mastered:
//   → steps: [6×1(Q), 6×2(Q), 6×3(Q), 6×4(Q), 6×5(Q)]
// - Target 6×5, 6×1 and 6×2 and 6×3 mastered:
//   → steps: [6×3(scaffold), 6×4(Q), 6×5(Q)]
// - Target 6×5, all sub-facts mastered:
//   → steps: [6×4(scaffold), 6×5(Q)]
// - Target 6×1 (edge case):
//   → steps: [6×1(Q)] (no build-up)
// - Target 6×0 (edge case):
//   → steps: [6×0(Q)] (no build-up)
// - Target 3×2 (small sequence):
//   → steps: [3×1(Q), 3×2(Q)] or if 3×1 mastered: [3×1(scaffold), 3×2(Q)]

// Test: shouldUseBuildUp
// - 6×5, not mastered → true
// - 6×2 → false (targetStep=2, too short)
// - 6×5, already mastered (box 3+) → false
// - 6×1 → false (targetStep=1)
```

---

## File 6: `src/lib/learning-engine/fluency.ts`

```typescript
// ABOUTME: Scores response time into fluency quality levels (0-5).
// ABOUTME: Quality score determines Leitner box promotion eligibility.

import type { FluencyQuality } from '../../types/learning';

/** Response time thresholds in milliseconds. */
const THRESHOLDS = {
  INSTANT: 1500,    // < 1.5s = instant recall
  HESITANT: 3000,   // < 3s = slight hesitation
  SLOW: 5000,       // < 5s = slow but correct
  // > 5s = barely recalled
} as const;

/**
 * Score a response based on correctness and response time.
 *
 * Quality scale:
 *   5 = instant recall (correct, < 1.5s)
 *   4 = hesitant recall (correct, < 3s)
 *   3 = slow recall (correct, < 5s)
 *   2 = barely recalled (correct, >= 5s)
 *   1 = incorrect but close (wrong, small error)
 *   0 = incorrect
 */
export function scoreFluency(
  isCorrect: boolean,
  responseTimeMs: number,
  isCloseAnswer: boolean = false
): FluencyQuality {
  if (!isCorrect) {
    return isCloseAnswer ? 1 : 0;
  }

  if (responseTimeMs < THRESHOLDS.INSTANT) return 5;
  if (responseTimeMs < THRESHOLDS.HESITANT) return 4;
  if (responseTimeMs < THRESHOLDS.SLOW) return 3;
  return 2;
}

/**
 * Determine if a response demonstrates fluent recall.
 * Fluent = correct AND quality >= 4 (under 3 seconds).
 */
export function isFluentRecall(isCorrect: boolean, responseTimeMs: number): boolean {
  if (!isCorrect) return false;
  return responseTimeMs < THRESHOLDS.HESITANT;
}

/**
 * Determine if an incorrect answer is "close" (for quality 1 vs 0 scoring).
 * Close means the absolute error is small relative to the correct answer.
 */
export function isCloseAnswer(
  correctAnswer: number,
  givenAnswer: number
): boolean {
  if (correctAnswer === 0) {
    return givenAnswer <= 2;
  }
  const relativeError = Math.abs(givenAnswer - correctAnswer) / correctAnswer;
  return relativeError <= 0.15; // within 15% of correct
}
```

**Test scenarios for `fluency.ts`:**

```typescript
// Test: scoreFluency
// - Correct, 800ms → 5 (instant)
// - Correct, 1500ms → 4 (exactly at threshold → 4)
// - Correct, 2500ms → 4 (hesitant)
// - Correct, 3000ms → 3 (exactly at threshold → 3)
// - Correct, 4500ms → 3 (slow)
// - Correct, 5000ms → 2 (exactly at threshold → 2)
// - Correct, 8000ms → 2 (barely)
// - Wrong, not close → 0
// - Wrong, close → 1

// Test: isFluentRecall
// - Correct, 1000ms → true
// - Correct, 2999ms → true
// - Correct, 3000ms → false
// - Correct, 5000ms → false
// - Wrong, 500ms → false

// Test: isCloseAnswer
// - Correct 24, given 25 → true (4% off)
// - Correct 24, given 30 → false (25% off)
// - Correct 0, given 1 → true
// - Correct 0, given 3 → false
// - Correct 56, given 54 → true (3.6% off)
```

---

## File 7: `src/lib/learning-engine/session.ts`

```typescript
// ABOUTME: Manages in-session state including timing, retry queue, and break suggestions.
// ABOUTME: Tracks attempts in memory and provides batch write data for Firestore at session end.

import type {
  SessionState,
  SessionStats,
  QuestionAttempt,
  CanonicalFact,
  FactMasteryRecord,
  FluencyQuality,
} from '../../types/learning';
import { factKey, canonicalize } from '../../types/learning';
import { classifyError } from './error-classifier';
import { scoreFluency, isCloseAnswer } from './fluency';

const SOFT_TIME_LIMIT_MS = 10 * 60 * 1000;  // 10 minutes
const HARD_SUGGESTION_MS = 15 * 60 * 1000;   // 15 minutes
const RETRY_DELAY_MIN = 2;                     // re-present missed fact at least 2 questions later
const RETRY_DELAY_MAX = 3;                     // at most 3 questions later

/**
 * Create a new session state.
 */
export function startSession(kidId: string, currentLevel: number): SessionState {
  return {
    sessionId: crypto.randomUUID(),
    kidId,
    startedAt: new Date(),
    currentLevel,
    attempts: [],
    retryQueue: [],
    missedThisSession: new Set(),
  };
}

/**
 * Record an attempt and return the updated session state + fluency quality.
 * This is the main "process answer" function called after each question.
 */
export function recordAttempt(
  session: SessionState,
  factorA: number,
  factorB: number,
  givenAnswer: number | null,
  responseTimeMs: number,
  hintLevel: 0 | 1 | 2,
  masteryRecords: Map<string, FactMasteryRecord>
): { session: SessionState; attempt: QuestionAttempt; fluencyQuality: FluencyQuality } {
  const correctAnswer = factorA * factorB;
  const isCorrect = givenAnswer === correctAnswer;

  const close = givenAnswer !== null && !isCorrect
    ? isCloseAnswer(correctAnswer, givenAnswer)
    : false;
  const fluencyQuality = scoreFluency(isCorrect, responseTimeMs, close);

  let errorType = null;
  if (!isCorrect && givenAnswer !== null) {
    const classification = classifyError(
      { factorA, factorB, correctAnswer, givenAnswer },
      masteryRecords
    );
    errorType = classification.errorType;
  }

  const attempt: QuestionAttempt = {
    factorA,
    factorB,
    correctAnswer,
    givenAnswer,
    isCorrect,
    responseTimeMs,
    hintLevel,
    errorType,
    fluencyQuality,
    attemptedAt: new Date(),
  };

  const newAttempts = [...session.attempts, attempt];
  const newMissed = new Set(session.missedThisSession);
  let newRetryQueue = [...session.retryQueue];

  if (!isCorrect) {
    const key = factKey(factorA, factorB);
    newMissed.add(key);
    // Add to retry queue -- will re-present this fact after a delay
    newRetryQueue.push(canonicalize(factorA, factorB));
  }

  return {
    session: {
      ...session,
      attempts: newAttempts,
      retryQueue: newRetryQueue,
      missedThisSession: newMissed,
    },
    attempt,
    fluencyQuality,
  };
}

/**
 * Check if a retry fact should be presented now.
 * Returns the fact to retry (if any) and the updated queue.
 *
 * A retry is due when enough questions have passed since it was added.
 */
export function getRetryFact(
  session: SessionState
): { fact: CanonicalFact | null; updatedQueue: CanonicalFact[] } {
  if (session.retryQueue.length === 0) {
    return { fact: null, updatedQueue: [] };
  }

  // Find the first retry fact that was added at least RETRY_DELAY_MIN questions ago
  const totalAttempts = session.attempts.length;

  // Simple approach: the retry queue is FIFO. The first item was added earliest.
  // Check if enough questions have passed since the miss.
  // We find when the first retry fact was missed by scanning attempts backwards.
  const firstRetry = session.retryQueue[0];
  const firstRetryKey = factKey(firstRetry.factorA, firstRetry.factorB);

  // Find the most recent attempt for this fact
  let questionsElapsed = 0;
  for (let i = session.attempts.length - 1; i >= 0; i--) {
    const a = session.attempts[i];
    if (factKey(a.factorA, a.factorB) === firstRetryKey && !a.isCorrect) {
      questionsElapsed = totalAttempts - 1 - i;
      break;
    }
  }

  if (questionsElapsed >= RETRY_DELAY_MIN) {
    return {
      fact: firstRetry,
      updatedQueue: session.retryQueue.slice(1),
    };
  }

  return { fact: null, updatedQueue: session.retryQueue };
}

/**
 * Check if a break should be suggested.
 */
export function shouldSuggestBreak(
  session: SessionState,
  now: Date = new Date()
): 'none' | 'soft' | 'strong' {
  const elapsed = now.getTime() - session.startedAt.getTime();

  if (elapsed >= HARD_SUGGESTION_MS) return 'strong';
  if (elapsed >= SOFT_TIME_LIMIT_MS) return 'soft';
  return 'none';
}

/**
 * Calculate session statistics at end of session.
 */
export function getSessionStats(session: SessionState, now: Date = new Date()): SessionStats {
  const totalQuestions = session.attempts.length;
  const correctAnswers = session.attempts.filter(a => a.isCorrect).length;
  const accuracyPercent = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  const avgResponseTimeMs = totalQuestions > 0
    ? Math.round(
        session.attempts.reduce((sum, a) => sum + a.responseTimeMs, 0) / totalQuestions
      )
    : 0;

  const durationSeconds = Math.round(
    (now.getTime() - session.startedAt.getTime()) / 1000
  );

  // Facts learned: facts that were correct at least once this session
  const correctFacts = new Set<string>();
  const missedFacts = new Set<string>();
  for (const a of session.attempts) {
    const key = factKey(a.factorA, a.factorB);
    if (a.isCorrect) {
      correctFacts.add(key);
    } else {
      missedFacts.add(key);
    }
  }

  const factsLearned: CanonicalFact[] = [];
  for (const key of correctFacts) {
    const [aStr, bStr] = key.split('x');
    factsLearned.push({ factorA: parseInt(aStr), factorB: parseInt(bStr) });
  }

  const factsMissed: CanonicalFact[] = [];
  for (const key of missedFacts) {
    if (!correctFacts.has(key)) {
      const [aStr, bStr] = key.split('x');
      factsMissed.push({ factorA: parseInt(aStr), factorB: parseInt(bStr) });
    }
  }

  return {
    totalQuestions,
    correctAnswers,
    accuracyPercent,
    avgResponseTimeMs,
    durationSeconds,
    factsLearned,
    factsMissed,
  };
}

/**
 * Prepare session data for Firestore batch write.
 * Returns the data structures needed for writing to sessions and attempts collections.
 */
export function endSession(session: SessionState, now: Date = new Date()): {
  gameSession: {
    id: string;
    kid_id: string;
    started_at: string;
    ended_at: string;
    level: number;
    total_questions: number;
    correct_answers: number;
    duration_seconds: number;
  };
  attempts: Array<{
    session_id: string;
    kid_id: string;
    factor_a: number;
    factor_b: number;
    correct_answer: number;
    given_answer: number | null;
    is_correct: boolean;
    response_time_ms: number;
    hint_level: number;
    error_type: string | null;
    attempted_at: string;
  }>;
} {
  const stats = getSessionStats(session, now);

  const gameSession = {
    id: session.sessionId,
    kid_id: session.kidId,
    started_at: session.startedAt.toISOString(),
    ended_at: now.toISOString(),
    level: session.currentLevel,
    total_questions: stats.totalQuestions,
    correct_answers: stats.correctAnswers,
    duration_seconds: stats.durationSeconds,
  };

  const attempts = session.attempts.map(a => ({
    session_id: session.sessionId,
    kid_id: session.kidId,
    factor_a: a.factorA,
    factor_b: a.factorB,
    correct_answer: a.correctAnswer,
    given_answer: a.givenAnswer,
    is_correct: a.isCorrect,
    response_time_ms: a.responseTimeMs,
    hint_level: a.hintLevel,
    error_type: a.errorType,
    attempted_at: a.attemptedAt.toISOString(),
  }));

  return { gameSession, attempts };
}
```

**Test scenarios for `session.ts`:**

```typescript
// Test: startSession
// - Returns valid state with empty attempts, empty retryQueue

// Test: recordAttempt
// - Correct answer: attempt added, no retry, no missed
// - Wrong answer: attempt added with error classification, fact added to retryQueue and missedThisSession
// - Null answer: treated as incorrect

// Test: getRetryFact
// - Empty queue → null
// - One missed fact, only 1 question elapsed → null (too soon)
// - One missed fact, 2+ questions elapsed → returns the fact, removes from queue
// - Multiple missed facts: FIFO order

// Test: shouldSuggestBreak
// - 5 min elapsed → 'none'
// - 10 min elapsed → 'soft'
// - 15 min elapsed → 'strong'

// Test: getSessionStats
// - 5 questions, 4 correct → 80% accuracy
// - Avg response time calculated correctly
// - factsLearned includes facts that were ever correct
// - factsMissed includes facts that were ONLY wrong (never correct in session)

// Test: endSession
// - Returns correctly shaped Firestore document data
// - Dates are ISO strings
// - All attempts included
```

---

## File 8: `src/lib/learning-engine/question-selector.ts`

```typescript
// ABOUTME: Selects and orders questions for each level based on mastery, review priority, and variety.
// ABOUTME: Builds levels with 60% new facts + 40% review, interleaved, never repeating consecutively.

import type {
  Question,
  LevelPlan,
  CanonicalFact,
  FactMasteryRecord,
  SessionState,
  DifficultyTier,
} from '../../types/learning';
import { factKey, canonicalize } from '../../types/learning';
import { getLevelPlan, getTierForLevel } from './difficulty';
import { isDueForReview, getBoxForFact } from './leitner';
import { getRetryFact } from './session';
import { shouldUseBuildUp, generateBuildUpSequence } from './build-up';

const QUESTIONS_PER_LEVEL = 5;
const NEW_RATIO = 0.6;
const REVIEW_RATIO = 0.4;

/**
 * Build a level plan: select 5 questions with 60% new + 40% review, interleaved.
 *
 * Priority order for filling question slots:
 * 1. Due review facts (from Leitner scheduling)
 * 2. Recently failed facts (from in-session retry queue)
 * 3. Low mastery facts (box 1-2 with attempts)
 * 4. New facts (one at a time, possibly with build-up)
 * 5. Mixed review from all available facts
 *
 * Constraints:
 * - Never present the same fact twice in a row
 * - Interleave new and review (not all new then all review)
 * - Introduce at most 1 truly new fact per level
 */
export function buildLevelQuestions(
  level: number,
  masteryRecords: Map<string, FactMasteryRecord>,
  session: SessionState,
  currentSessionNumber: number,
  lastReviewedSessions: Map<string, number>
): LevelPlan {
  const { newFacts, reviewFacts, tier } = getLevelPlan(level, masteryRecords);

  const newCount = Math.round(QUESTIONS_PER_LEVEL * NEW_RATIO); // 3
  const reviewCount = QUESTIONS_PER_LEVEL - newCount;            // 2

  // --- Collect candidate pools ---

  // Due review facts (from Leitner scheduling)
  const dueReviewFacts = reviewFacts.filter(f => {
    const key = factKey(f.factorA, f.factorB);
    const record = masteryRecords.get(key);
    if (!record) return false;
    const lastSession = lastReviewedSessions.get(key) ?? 0;
    return isDueForReview(record, currentSessionNumber, lastSession);
  });

  // Recently failed in-session
  const recentlyFailed: CanonicalFact[] = [];
  for (const key of session.missedThisSession) {
    const [aStr, bStr] = key.split('x');
    recentlyFailed.push({ factorA: parseInt(aStr), factorB: parseInt(bStr) });
  }

  // Low mastery facts (box 1-2, have been attempted)
  const lowMastery = [...newFacts, ...reviewFacts].filter(f => {
    const key = factKey(f.factorA, f.factorB);
    const record = masteryRecords.get(key);
    if (!record) return false;
    return record.leitnerBox <= 2 && record.totalAttempts > 0;
  });

  // Truly new facts (never attempted)
  const trulyNew = newFacts.filter(f => {
    const key = factKey(f.factorA, f.factorB);
    const record = masteryRecords.get(key);
    return !record || record.totalAttempts === 0;
  });

  // --- Fill question slots ---

  const selected: CanonicalFact[] = [];
  const selectedKeys = new Set<string>();

  function addFact(fact: CanonicalFact): boolean {
    const key = factKey(fact.factorA, fact.factorB);
    if (selectedKeys.has(key)) return false;
    selected.push(fact);
    selectedKeys.add(key);
    return true;
  }

  // 1. Due review facts (fill review slots first)
  let reviewFilled = 0;
  for (const f of shuffleArray(dueReviewFacts)) {
    if (reviewFilled >= reviewCount) break;
    if (addFact(f)) reviewFilled++;
  }

  // 2. Recently failed (fill remaining review slots)
  for (const f of recentlyFailed) {
    if (reviewFilled >= reviewCount) break;
    if (addFact(f)) reviewFilled++;
  }

  // 3. Low mastery (fill remaining review or new slots)
  for (const f of shuffleArray(lowMastery)) {
    if (selected.length >= QUESTIONS_PER_LEVEL) break;
    addFact(f);
  }

  // 4. One truly new fact (with potential build-up)
  let newFactIntroduced: CanonicalFact | null = null;
  if (trulyNew.length > 0 && selected.length < QUESTIONS_PER_LEVEL) {
    const newFact = trulyNew[Math.floor(Math.random() * trulyNew.length)];
    if (addFact(newFact)) {
      newFactIntroduced = newFact;
    }
  }

  // 5. Fill remaining with mixed review
  const allAvailable = [...reviewFacts, ...newFacts];
  const shuffled = shuffleArray(allAvailable);
  for (const f of shuffled) {
    if (selected.length >= QUESTIONS_PER_LEVEL) break;
    addFact(f);
  }

  // --- Convert to Question objects ---
  const questions: Question[] = selected.map(f => {
    const key = factKey(f.factorA, f.factorB);
    const box = getBoxForFact(masteryRecords, key);
    const isNew = trulyNew.some(
      nf => factKey(nf.factorA, nf.factorB) === key
    );

    // Randomly choose presentation order (a×b or b×a) for non-build-up questions
    const [presentA, presentB] = Math.random() < 0.5
      ? [f.factorA, f.factorB]
      : [f.factorB, f.factorA];

    return {
      factorA: presentA,
      factorB: presentB,
      correctAnswer: presentA * presentB,
      isBuildingUp: false,
      buildUpSequenceIndex: 0,
      isReview: !isNew,
      leitnerBox: box,
    };
  });

  // --- Interleave new and review ---
  const interleaved = interleaveQuestions(questions);

  return {
    levelNumber: level,
    questions: interleaved,
    tier,
    reviewRatio: reviewFilled / Math.max(selected.length, 1),
  };
}

/**
 * Interleave questions so new and review alternate, and no same fact appears twice in a row.
 */
function interleaveQuestions(questions: Question[]): Question[] {
  if (questions.length <= 1) return questions;

  const newQs = questions.filter(q => !q.isReview);
  const reviewQs = questions.filter(q => q.isReview);

  const result: Question[] = [];
  let ni = 0;
  let ri = 0;

  // Alternate: new, review, new, review, new (for 3 new + 2 review)
  while (ni < newQs.length || ri < reviewQs.length) {
    if (ni < newQs.length) {
      result.push(newQs[ni++]);
    }
    if (ri < reviewQs.length) {
      result.push(reviewQs[ri++]);
    }
  }

  // Final pass: ensure no same fact twice in a row
  return deduplicateConsecutive(result);
}

/**
 * Ensure no two consecutive questions test the same canonical fact.
 * Uses simple swap with the next non-matching question.
 */
function deduplicateConsecutive(questions: Question[]): Question[] {
  const result = [...questions];

  for (let i = 1; i < result.length; i++) {
    const prevKey = factKey(result[i - 1].factorA, result[i - 1].factorB);
    const currKey = factKey(result[i].factorA, result[i].factorB);

    if (prevKey === currKey) {
      // Find the next question that's different and swap
      for (let j = i + 1; j < result.length; j++) {
        const jKey = factKey(result[j].factorA, result[j].factorB);
        if (jKey !== prevKey) {
          [result[i], result[j]] = [result[j], result[i]];
          break;
        }
      }
    }
  }

  return result;
}

/**
 * Get the next question to present, considering retry queue and build-up mode.
 *
 * Call this instead of manually iterating through levelPlan.questions when
 * you need to handle retries and build-up sequences mid-level.
 */
export function getNextQuestion(
  levelPlan: LevelPlan,
  questionIndex: number,
  session: SessionState,
  masteryRecords: Map<string, FactMasteryRecord>
): { question: Question; isRetry: boolean; buildUpSequence: Question[] | null } {
  // Check retry queue first
  const { fact: retryFact, updatedQueue } = getRetryFact(session);
  if (retryFact) {
    const box = getBoxForFact(
      masteryRecords,
      factKey(retryFact.factorA, retryFact.factorB)
    );
    // Update the session's retry queue (caller must persist this)
    session.retryQueue = updatedQueue;

    return {
      question: {
        factorA: retryFact.factorA,
        factorB: retryFact.factorB,
        correctAnswer: retryFact.factorA * retryFact.factorB,
        isBuildingUp: false,
        buildUpSequenceIndex: 0,
        isReview: true,
        leitnerBox: box,
      },
      isRetry: true,
      buildUpSequence: null,
    };
  }

  // Normal question from the level plan
  if (questionIndex >= levelPlan.questions.length) {
    // Shouldn't happen, but safeguard: return the last question
    const lastQ = levelPlan.questions[levelPlan.questions.length - 1];
    return { question: lastQ, isRetry: false, buildUpSequence: null };
  }

  const question = levelPlan.questions[questionIndex];

  // Check if this new fact should use build-up mode
  if (!question.isReview && shouldUseBuildUp(question.factorA, question.factorB, masteryRecords)) {
    const sequence = generateBuildUpSequence(
      question.factorA,
      question.factorB,
      masteryRecords
    );

    const buildUpQuestions: Question[] = sequence.steps
      .filter(step => step.isQuestion)
      .map((step, idx) => ({
        factorA: step.factorA,
        factorB: step.factorB,
        correctAnswer: step.correctAnswer,
        isBuildingUp: true,
        buildUpSequenceIndex: idx,
        isReview: false,
        leitnerBox: getBoxForFact(masteryRecords, factKey(step.factorA, step.factorB)),
      }));

    return {
      question,
      isRetry: false,
      buildUpSequence: buildUpQuestions.length > 1 ? buildUpQuestions : null,
    };
  }

  return { question, isRetry: false, buildUpSequence: null };
}

/** Fisher-Yates shuffle (returns a new array). */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

**Test scenarios for `question-selector.ts`:**

```typescript
// Test: buildLevelQuestions
// - Fresh kid, level 1: 5 questions, all from tier 1 multipliers (0,1,2)
// - Kid at level 4 with some mastery: ~3 new (tier 2) + ~2 review (tier 1)
// - No two consecutive questions test the same canonical fact
// - At most 1 truly new (never-seen) fact per level
// - Returns correct tier and reviewRatio

// Test: interleaveQuestions
// - 3 new + 2 review → [N, R, N, R, N]
// - 5 review + 0 new → [R, R, R, R, R]
// - 0 review + 5 new → [N, N, N, N, N]

// Test: deduplicateConsecutive
// - [3x5, 3x5, 4x6] → [3x5, 4x6, 3x5] (swapped)
// - [3x5, 4x6, 7x8] → unchanged

// Test: getNextQuestion
// - No retry due → returns question from level plan
// - Retry fact due → returns retry fact, marks isRetry=true
// - New fact eligible for build-up → returns buildUpSequence
// - New fact not eligible (small factors) → buildUpSequence is null
```

---

## File 9: `src/lib/learning-engine/mastery.ts`

```typescript
// ABOUTME: Aggregates mastery data from mastery collection records for display and analysis.
// ABOUTME: Provides per-fact summaries, overall progress, and heat map data for the dashboard.

import type {
  FactMasteryRecord,
  FactMasterySummary,
  OverallMastery,
  HeatMapCell,
  CanonicalFact,
  QuestionAttempt,
} from '../../types/learning';
import { factKey, canonicalize } from '../../types/learning';

/** All 66 canonical facts (0x0 through 10x10 where a <= b). */
export function getAllCanonicalFacts(): CanonicalFact[] {
  const facts: CanonicalFact[] = [];
  for (let a = 0; a <= 10; a++) {
    for (let b = a; b <= 10; b++) {
      facts.push({ factorA: a, factorB: b });
    }
  }
  return facts;
}

/**
 * Get mastery summary for a single fact.
 */
export function getFactMastery(
  record: FactMasteryRecord | undefined,
  recentAttempts: QuestionAttempt[]
): FactMasterySummary {
  const fact = record
    ? { factorA: record.factorA, factorB: record.factorB }
    : { factorA: 0, factorB: 0 };

  if (!record) {
    return {
      fact,
      leitnerBox: 0,
      accuracyPercent: 0,
      avgResponseTimeMs: null,
      trend: 'stable',
      lastPracticedAt: null,
    };
  }

  const accuracyPercent = record.totalAttempts > 0
    ? Math.round((record.correctAttempts / record.totalAttempts) * 100)
    : 0;

  const trend = calculateTrend(recentAttempts);

  return {
    fact: { factorA: record.factorA, factorB: record.factorB },
    leitnerBox: record.leitnerBox,
    accuracyPercent,
    avgResponseTimeMs: record.avgResponseTimeMs,
    trend,
    lastPracticedAt: record.lastPracticedAt,
  };
}

/**
 * Calculate overall mastery stats across all 66 canonical facts.
 */
export function getAllMastery(
  records: Map<string, FactMasteryRecord>
): OverallMastery {
  const allFacts = getAllCanonicalFacts();
  let mastered = 0;
  let learning = 0;
  let struggling = 0;
  let notStarted = 0;

  for (const fact of allFacts) {
    const key = factKey(fact.factorA, fact.factorB);
    const record = records.get(key);

    if (!record || record.totalAttempts === 0) {
      notStarted++;
    } else if (record.leitnerBox >= 4) {
      mastered++;
    } else if (record.leitnerBox >= 2) {
      learning++;
    } else {
      struggling++;
    }
  }

  return {
    totalFacts: allFacts.length,
    mastered,
    learning,
    notStarted,
    struggling,
  };
}

/**
 * Build the 11x11 heat map for the parent dashboard.
 * Returns a flat array of 121 cells (0x0 through 10x10).
 * Both (a,b) and (b,a) cells share the same underlying canonical data.
 */
export function getMasteryHeatMap(
  records: Map<string, FactMasteryRecord>
): HeatMapCell[] {
  const cells: HeatMapCell[] = [];

  for (let a = 0; a <= 10; a++) {
    for (let b = 0; b <= 10; b++) {
      const key = factKey(a, b); // canonicalizes internally
      const record = records.get(key);

      let status: HeatMapCell['status'];
      let leitnerBox = 0;
      let accuracyPercent: number | null = null;

      if (!record || record.totalAttempts === 0) {
        status = 'not_started';
      } else {
        leitnerBox = record.leitnerBox;
        accuracyPercent = Math.round(
          (record.correctAttempts / record.totalAttempts) * 100
        );

        if (record.leitnerBox >= 4) {
          status = 'mastered';
        } else if (record.leitnerBox >= 2) {
          status = 'learning';
        } else {
          status = 'struggling';
        }
      }

      cells.push({ factorA: a, factorB: b, status, leitnerBox, accuracyPercent });
    }
  }

  return cells;
}

/**
 * Determine the trend from recent attempts for a single fact.
 * Looks at the last 5-10 attempts and compares first half vs second half accuracy.
 */
function calculateTrend(
  recentAttempts: QuestionAttempt[]
): 'improving' | 'stable' | 'declining' {
  if (recentAttempts.length < 4) return 'stable';

  const midpoint = Math.floor(recentAttempts.length / 2);
  const firstHalf = recentAttempts.slice(0, midpoint);
  const secondHalf = recentAttempts.slice(midpoint);

  const firstAccuracy = firstHalf.filter(a => a.isCorrect).length / firstHalf.length;
  const secondAccuracy = secondHalf.filter(a => a.isCorrect).length / secondHalf.length;

  const diff = secondAccuracy - firstAccuracy;

  if (diff > 0.2) return 'improving';
  if (diff < -0.2) return 'declining';
  return 'stable';
}

/**
 * Get the top N struggling facts (lowest mastery, most attempts).
 * Useful for parent dashboard insights.
 */
export function getStrugglingFacts(
  records: Map<string, FactMasteryRecord>,
  limit: number = 10
): FactMasteryRecord[] {
  const allRecords = Array.from(records.values())
    .filter(r => r.totalAttempts > 0);

  // Sort by: lowest box first, then lowest accuracy, then most attempts
  allRecords.sort((a, b) => {
    if (a.leitnerBox !== b.leitnerBox) return a.leitnerBox - b.leitnerBox;
    const accA = a.totalAttempts > 0 ? a.correctAttempts / a.totalAttempts : 0;
    const accB = b.totalAttempts > 0 ? b.correctAttempts / b.totalAttempts : 0;
    if (accA !== accB) return accA - accB;
    return b.totalAttempts - a.totalAttempts;
  });

  return allRecords.slice(0, limit);
}
```

**Test scenarios for `mastery.ts`:**

```typescript
// Test: getAllCanonicalFacts
// - Returns exactly 66 facts
// - First is (0,0), last is (10,10)
// - No duplicates (3x5 but not 5x3)

// Test: getFactMastery
// - No record → box 0, 0% accuracy, stable trend
// - Record with 10 attempts, 8 correct → 80% accuracy
// - Trend: 5 recent attempts [wrong, wrong, right, right, right] → improving

// Test: getAllMastery
// - Empty records → 66 not_started
// - Some records with various boxes → correct counts

// Test: getMasteryHeatMap
// - Returns exactly 121 cells (11x11)
// - (3,5) and (5,3) have the same status (share canonical data)
// - Unstarted facts show 'not_started'

// Test: calculateTrend
// - Less than 4 attempts → 'stable'
// - First half wrong, second half right → 'improving'
// - First half right, second half wrong → 'declining'
// - Mixed → 'stable'

// Test: getStrugglingFacts
// - Returns facts sorted by difficulty (lowest box, lowest accuracy)
// - Respects limit parameter
// - Excludes facts with 0 attempts
```

---

## File 10: `src/lib/learning-engine/index.ts`

```typescript
// ABOUTME: Public API barrel export for the learning engine.
// ABOUTME: Re-exports all modules for clean imports from consuming code.

export {
  promoteFact,
  demoteFact,
  isDueForReview,
  getBoxForFact,
  calculateNextReviewDate,
  processAttempt,
} from './leitner';

export {
  TIER_DEFINITIONS,
  getTierForLevel,
  getCurrentTier,
  getAvailableFacts,
  getNewFactsForTier,
  canAdvanceLevel,
  getLevelPlan,
} from './difficulty';

export {
  classifyError,
} from './error-classifier';

export {
  generateBuildUpSequence,
  shouldUseBuildUp,
} from './build-up';

export {
  scoreFluency,
  isFluentRecall,
  isCloseAnswer,
} from './fluency';

export {
  startSession,
  recordAttempt,
  getRetryFact,
  shouldSuggestBreak,
  getSessionStats,
  endSession,
} from './session';

export {
  getAllCanonicalFacts,
  getFactMastery,
  getAllMastery,
  getMasteryHeatMap,
  getStrugglingFacts,
} from './mastery';

export {
  buildLevelQuestions,
  getNextQuestion,
} from './question-selector';
```

---

## Implementation Phases

### Phase 1: Types and Core Utilities

**Files to create:**
- `src/types/learning.ts`

**Steps:**
1. Create the types file exactly as specified above
2. Write tests for `canonicalize()` and `factKey()`
3. Run tests to confirm they pass

**Acceptance criteria:**
- [ ] All interfaces compile without error
- [ ] `canonicalize(5, 3)` returns `{factorA: 3, factorB: 5}`
- [ ] `factKey(5, 3)` returns `"3x5"`

### Phase 2: Fluency Scoring

**Files to create:**
- `src/lib/learning-engine/fluency.ts`
- Tests for fluency module

**Steps:**
1. Write failing tests for `scoreFluency`, `isFluentRecall`, `isCloseAnswer`
2. Implement the three functions
3. Run tests

**Acceptance criteria:**
- [ ] All test scenarios from the test list pass
- [ ] Edge cases at exact thresholds work correctly

### Phase 3: Leitner Box System

**Files to create:**
- `src/lib/learning-engine/leitner.ts`
- Tests for leitner module

**Steps:**
1. Write failing tests for all functions
2. Implement `promoteFact`, `demoteFact`, `isDueForReview`, `getBoxForFact`, `calculateNextReviewDate`, `processAttempt`
3. Run tests

**Acceptance criteria:**
- [ ] Promotion caps at box 5
- [ ] Demotion floors at box 1 (gentle regression)
- [ ] Quality < 3 prevents promotion even on correct answer
- [ ] Box 5 uses 14-day calendar scheduling
- [ ] processAttempt returns correct updated record

### Phase 4: Error Classifier

**Files to create:**
- `src/lib/learning-engine/error-classifier.ts`
- Tests for error classifier

**Steps:**
1. Write failing tests for each error type
2. Implement `classifyError` and helper functions
3. Run tests

**Acceptance criteria:**
- [ ] 6x4=10 detected as addition_substitution
- [ ] 5x0=5 detected as zero_one_confusion
- [ ] 6x4=28 detected as off_by_one
- [ ] 6x8=54 detected as neighbor_confusion (6x9=54)
- [ ] Unknown patterns return 'other'

### Phase 5: Difficulty Progression

**Files to create:**
- `src/lib/learning-engine/difficulty.ts`
- Tests for difficulty module

**Steps:**
1. Write failing tests for tier lookup and fact generation
2. Implement all functions
3. Verify fact counts per tier are correct
4. Run tests

**Acceptance criteria:**
- [ ] 5 tiers map to levels 1-15 correctly
- [ ] `getAvailableFacts(1)` returns only facts with 0, 1, or 2
- [ ] `getNewFactsForTier(2)` excludes facts already covered by tier 1
- [ ] `canAdvanceLevel` requires 80% accuracy AND <5s avg time
- [ ] `getLevelPlan` separates new and review facts correctly

### Phase 6: Build-Up Sequences

**Files to create:**
- `src/lib/learning-engine/build-up.ts`
- Tests for build-up module

**Steps:**
1. Write failing tests for sequence generation
2. Implement `generateBuildUpSequence` and `shouldUseBuildUp`
3. Run tests

**Acceptance criteria:**
- [ ] 6x5 with no mastery generates 5 question steps
- [ ] 6x5 with 6x1-6x3 mastered generates scaffold at 6x3 then questions 6x4, 6x5
- [ ] Edge cases (x0, x1) produce single-step sequences
- [ ] `shouldUseBuildUp` returns false for small target factors

### Phase 7: Session Manager

**Files to create:**
- `src/lib/learning-engine/session.ts`
- Tests for session module

**Steps:**
1. Write failing tests for session lifecycle
2. Implement all functions
3. Test retry queue timing
4. Test break suggestions
5. Test Firestore data formatting in `endSession`
6. Run tests

**Acceptance criteria:**
- [ ] `startSession` creates valid state
- [ ] `recordAttempt` classifies errors and updates retry queue
- [ ] `getRetryFact` respects 2-3 question delay
- [ ] `shouldSuggestBreak` triggers at 10 and 15 minutes
- [ ] `endSession` returns correctly shaped Firestore document data

### Phase 8: Question Selector

**Files to create:**
- `src/lib/learning-engine/question-selector.ts`
- Tests for question selector

**Steps:**
1. Write failing tests for level building
2. Implement `buildLevelQuestions` and `getNextQuestion`
3. Verify interleaving and deduplication
4. Run tests

**Acceptance criteria:**
- [ ] Levels contain 5 questions
- [ ] ~60/40 new/review split
- [ ] No consecutive duplicate facts
- [ ] Retry facts take priority when due
- [ ] Build-up sequences trigger for eligible new facts
- [ ] At most 1 truly new fact per level

### Phase 9: Mastery Calculator

**Files to create:**
- `src/lib/learning-engine/mastery.ts`
- Tests for mastery module

**Steps:**
1. Write failing tests for mastery calculations
2. Implement all functions
3. Verify heat map produces 121 cells
4. Run tests

**Acceptance criteria:**
- [ ] 66 canonical facts enumerated
- [ ] Heat map returns 121 cells with correct status
- [ ] Symmetry: (3,5) and (5,3) share the same data
- [ ] Trend detection works with >= 4 attempts
- [ ] Struggling facts sorted correctly

### Phase 10: Barrel Export and Integration Test

**Files to create:**
- `src/lib/learning-engine/index.ts`
- Integration test

**Steps:**
1. Create barrel export
2. Write integration test: start session -> build level -> answer questions -> record attempts -> end session -> check mastery
3. Run all tests

**Acceptance criteria:**
- [ ] All exports resolve without error
- [ ] Full session lifecycle works end-to-end
- [ ] All module tests pass

---

## Testing Strategy

**Test framework:** Vitest (ships with Vite)

**Test file convention:** `src/lib/learning-engine/__tests__/[module].test.ts`

**What to test:**
- Every pure function with its documented test scenarios
- Edge cases: empty inputs, boundary values, max/min boxes
- Integration: a full session lifecycle from start to end

**What NOT to test:**
- Firestore reads/writes (those happen at the boundary, not in these modules)
- Randomness (seed the RNG or test statistical properties, not exact values)

**For randomized functions** (shuffleArray, random fact selection):
- Test properties: "output has same length", "output contains same elements", "no consecutive duplicates"
- Do NOT test exact ordering

---

## Risks & Considerations

1. **Randomness in question selection**: The `shuffleArray` helper makes tests non-deterministic. Consider accepting a random seed parameter for testability, or test statistical properties only.

2. **Session state mutation**: `getNextQuestion` directly mutates `session.retryQueue`. The implementing agent should consider whether to make this immutable (return new session state) for better predictability. The current design trades purity for simplicity.

3. **Commutative gap detection**: The current approach is a rough heuristic since canonical storage merges both presentation orders. Full commutative gap detection requires per-presentation tracking in the attempts collection, which isn't in the current schema. The agent should flag this as a known limitation.

4. **Fact count validation**: Tier 1 with multipliers [0,1,2] generates facts like 0x0, 0x1, 0x2, 1x1, 1x2, 2x2 (6 facts) plus cross-tier facts. The implementing agent should verify the exact count per tier to ensure the 60/40 split produces enough questions.

5. **Build-up sequence length**: A build-up for 8x10 would generate 10 steps, which is too many for a 5-question level. The implementing agent may want to cap build-up sequences at 3-4 steps, starting from the highest mastered step rather than from 1.

---

## Estimated Complexity

| Module | Lines of code | Complexity | Notes |
|--------|--------------|------------|-------|
| types/learning.ts | ~120 | Low | Pure type definitions |
| fluency.ts | ~50 | Low | Simple threshold logic |
| leitner.ts | ~100 | Medium | Multiple scheduling modes |
| error-classifier.ts | ~130 | Medium | Many pattern checks |
| difficulty.ts | ~140 | Medium | Set operations on fact pools |
| build-up.ts | ~90 | Medium | Sequence generation with mastery lookups |
| session.ts | ~200 | High | Most stateful module |
| question-selector.ts | ~200 | High | Orchestrates all other modules |
| mastery.ts | ~130 | Medium | Aggregation and trend analysis |
| index.ts | ~40 | Low | Barrel export |
| **Total** | **~1200** | | |
| **Tests** | **~800** | | |
