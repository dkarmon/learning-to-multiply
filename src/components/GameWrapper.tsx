// ABOUTME: React component that hosts the Phaser game instance.
// ABOUTME: Handles lifecycle (create on mount, destroy on unmount) and store bridging.

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config';
import { EventBus, GameEvents } from '../game/EventBus';
import { useGameStore } from '../stores/game';
import { persistMasteryResult } from '../lib/mastery-store';

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

    const handleAnswerResult = (data: {
      factorA: number;
      factorB: number;
      isCorrect: boolean;
      responseTimeMs: number;
      bricksEarned: number;
      bonusBricks: number;
    }) => {
      const store = useGameStore.getState();
      store.recordResult(data);

      const kidId = store.kidId;
      if (kidId) {
        persistMasteryResult(kidId, data.factorA, data.factorB, data.isCorrect, data.responseTimeMs);
      }
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
