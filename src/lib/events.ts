// ABOUTME: Type-safe event helpers for React components interacting with Phaser.
// ABOUTME: Wraps the Phaser EventBus with convenience functions.

import { EventBus, GameEvents } from '../game/EventBus';
import type { Question, QuestionAttempt } from '../types';

export function emitShowQuestion(question: Question): void {
  EventBus.emit(GameEvents.SHOW_HINT, question);
}

export function emitShowResult(attempt: QuestionAttempt): void {
  EventBus.emit(GameEvents.ANSWER_RESULT, attempt);
}

export function emitAddBricks(count: number): void {
  EventBus.emit(GameEvents.BRICKS_EARNED, count);
}

export function onAnswerSubmitted(
  callback: (answer: number) => void
): () => void {
  EventBus.on(GameEvents.ANSWER_SUBMITTED, callback);
  return () => EventBus.off(GameEvents.ANSWER_SUBMITTED, callback);
}

export function onHintRequested(callback: () => void): () => void {
  EventBus.on(GameEvents.HINT_REQUESTED, callback);
  return () => EventBus.off(GameEvents.HINT_REQUESTED, callback);
}

export function onLevelComplete(callback: () => void): () => void {
  EventBus.on(GameEvents.LEVEL_COMPLETE, callback);
  return () => EventBus.off(GameEvents.LEVEL_COMPLETE, callback);
}
