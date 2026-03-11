// ABOUTME: Shared TypeScript types for the learning engine and game state.
// ABOUTME: Defines interfaces for questions, attempts, mastery, sessions, and errors.

// --- Canonical Fact ---

export interface CanonicalFact {
  factorA: number;
  factorB: number;
}

export function canonicalize(a: number, b: number): CanonicalFact {
  return {
    factorA: Math.min(a, b),
    factorB: Math.max(a, b),
  };
}

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

export type FluencyQuality = 0 | 1 | 2 | 3 | 4 | 5;

// --- Difficulty ---

export type DifficultyTier = 1 | 2 | 3 | 4 | 5;

export interface TierDefinition {
  tier: DifficultyTier;
  multipliers: number[];
  levels: [number, number];
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
  mastered: number;
  learning: number;
  notStarted: number;
  struggling: number;
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
  missedThisSession: Set<string>;
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
  isScaffold: boolean;
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
