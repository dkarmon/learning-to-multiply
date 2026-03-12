// ABOUTME: TypeScript interfaces for Firestore document shapes.
// ABOUTME: Defines the expected structure of each collection's documents.

import type { Timestamp } from 'firebase/firestore';

// Collection: parents/{uid}
export interface ParentDoc {
  display_name: string | null;
  created_at: Timestamp;
}

// Collection: kids/{kidId}
export interface KidDoc {
  parent_id: string;
  name: string;
  avatar_url: string | null;
  created_at: Timestamp;
}

// Collection: sessions/{sessionId}
export interface SessionDoc {
  kid_id: string;
  started_at: Timestamp;
  ended_at: Timestamp | null;
  level: number;
  total_questions: number;
  correct_answers: number;
  duration_seconds: number | null;
}

// Collection: attempts/{attemptId}
export interface AttemptDoc {
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
  attempted_at: Timestamp;
}

// Collection: mastery/{masteryId}
// Unique per kid + fact pair. Document ID convention: `${kid_id}_${factor_a}x${factor_b}`
export interface MasteryDoc {
  kid_id: string;
  factor_a: number;
  factor_b: number;
  leitner_box: number;
  total_attempts: number;
  correct_attempts: number;
  avg_response_time_ms: number | null;
  last_practiced_at: Timestamp | null;
  next_review_at: Timestamp | null;
}

// Collection: progress/{progressId}
// Unique per kid + level. Document ID convention: `${kid_id}_level${level}`
export interface ProgressDoc {
  kid_id: string;
  level: number;
  unlocked_at: Timestamp;
  completed_at: Timestamp | null;
  building_height: number;
}
