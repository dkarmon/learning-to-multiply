// ABOUTME: React component that hosts the Phaser game instance.
// ABOUTME: Handles lifecycle (create on mount, destroy on unmount) and store bridging.

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config';
import { EventBus, GameEvents } from '../game/EventBus';
import { useGameStore } from '../stores/game';
import { persistMasteryResult } from '../lib/mastery-store';
import { persistSession, persistAttempt } from '../lib/session-store';

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

    // Expose for E2E testing
    if (typeof window !== 'undefined') {
      (window as any).__PHASER_GAME__ = gameRef.current;
    }

    const handleAnswerResult = (data: {
      factorA: number;
      factorB: number;
      correctAnswer: number;
      givenAnswer: number;
      isCorrect: boolean;
      responseTimeMs: number;
      hintLevel: number;
      bricksEarned: number;
      bonusBricks: number;
    }) => {
      const store = useGameStore.getState();
      store.recordResult(data);

      const kidId = store.kidId;
      const sessionId = store.sessionId;
      if (kidId) {
        persistMasteryResult(kidId, data.factorA, data.factorB, data.isCorrect, data.responseTimeMs);
        persistAttempt({
          sessionId: sessionId ?? '',
          kidId,
          factorA: data.factorA,
          factorB: data.factorB,
          correctAnswer: data.correctAnswer,
          givenAnswer: data.givenAnswer,
          isCorrect: data.isCorrect,
          responseTimeMs: data.responseTimeMs,
          hintLevel: data.hintLevel,
        });
      }
    };

    const handleLevelComplete = (data: {
      levelNumber: number;
      totalBricks: number;
      accuracy: number;
    }) => {
      const store = useGameStore.getState();
      store.completeLevel(data);

      const { kidId, sessionId, startedAt, currentSession } = store;
      if (kidId && sessionId && startedAt) {
        persistSession({
          sessionId,
          kidId,
          startedAt,
          level: data.levelNumber,
          totalQuestions: currentSession.totalQuestions,
          correctAnswers: currentSession.correctAnswers,
        });
      }
    };

    const handleBrickPlaced = () => {
      // Audio agent hooks into this for brick-place sound
    };

    EventBus.on(GameEvents.ANSWER_RESULT, handleAnswerResult);
    EventBus.on(GameEvents.LEVEL_COMPLETE, handleLevelComplete);
    EventBus.on(GameEvents.BRICK_PLACED, handleBrickPlaced);

    return () => {
      EventBus.off(GameEvents.ANSWER_RESULT, handleAnswerResult);
      EventBus.off(GameEvents.LEVEL_COMPLETE, handleLevelComplete);
      EventBus.off(GameEvents.BRICK_PLACED, handleBrickPlaced);

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
