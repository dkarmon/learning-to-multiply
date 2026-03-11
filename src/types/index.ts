// ABOUTME: Shared TypeScript interfaces used across all workstreams.
// ABOUTME: Defines contracts for game events, learning engine, audio, and art assets.

// --- Error Classification ---

export type ErrorType =
  | 'addition_substitution'
  | 'off_by_one'
  | 'neighbor_confusion'
  | 'zero_one_confusion'
  | 'commutative_gap'
  | 'other';

// --- Difficulty ---

export type DifficultyTier = 1 | 2 | 3 | 4 | 5;

// --- Question & Attempt ---

export interface Question {
  factorA: number;
  factorB: number;
  correctAnswer: number;
  isBuildingUp: boolean;
  buildUpSequenceIndex: number;
  isReview: boolean;
  leitnerBox: number;
}

export interface QuestionAttempt {
  factorA: number;
  factorB: number;
  correctAnswer: number;
  givenAnswer: number | null;
  isCorrect: boolean;
  responseTimeMs: number;
  hintLevel: 0 | 1 | 2;
  errorType: ErrorType | null;
}

// --- Level ---

export interface LevelPlan {
  levelNumber: number;
  questions: Question[];
  tier: DifficultyTier;
  reviewRatio: number;
}

// --- Sprite Sheets ---

export interface SpriteAnimation {
  frames: number[];
  frameRate: number;
  repeat: number; // -1 for loop
}

export interface SpriteSheet {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
  animations: Record<string, SpriteAnimation>;
}

// --- Audio ---

export interface AudioEvent {
  type:
    | 'question_read'
    | 'correct'
    | 'wrong'
    | 'hint'
    | 'level_complete'
    | 'brick_place'
    | 'brick_crumble'
    | 'celebration'
    | 'button_tap';
  locale: 'he' | 'en';
  factorA?: number;
  factorB?: number;
}

// --- Hint ---

export type HintLevel = 0 | 1 | 2;

export interface HintState {
  level: HintLevel;
  bonusBricksForfeited: number;
}

// --- Scoring ---

export interface ScoreResult {
  bricksEarned: number;
  bonusBricks: number;
  totalBricks: number;
}

// --- Session ---

export interface GameSessionState {
  sessionId: string | null;
  kidId: string | null;
  currentLevel: number;
  currentQuestionIndex: number;
  questions: Question[];
  attempts: QuestionAttempt[];
  buildingHeight: number;
  totalBricks: number;
  isActive: boolean;
  startedAt: string | null;
}

// --- Kid Profile ---

export interface KidProfile {
  id: string;
  parentId: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

// --- Fact Mastery ---

export interface FactMastery {
  kidId: string;
  factorA: number;
  factorB: number;
  leitnerBox: number;
  totalAttempts: number;
  correctAttempts: number;
  avgResponseTimeMs: number | null;
  lastPracticedAt: string | null;
  nextReviewAt: string | null;
}

// --- Level Progress ---

export interface LevelProgress {
  kidId: string;
  level: number;
  unlockedAt: string;
  completedAt: string | null;
  buildingHeight: number;
}

// --- Settings ---

export type Locale = 'he' | 'en';

export interface AppSettings {
  locale: Locale;
  soundEnabled: boolean;
  musicEnabled: boolean;
}
