// ABOUTME: React wrapper component that mounts and manages a Phaser game instance.
// ABOUTME: Handles game lifecycle (create on mount, destroy on unmount) and scene references.

import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import Phaser from 'phaser';
import { EventBus, GameEvents } from './EventBus';
import { gameConfig } from './config';

export interface PhaserGameRef {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface PhaserGameProps {
  onSceneReady?: (scene: Phaser.Scene) => void;
}

export const PhaserGame = forwardRef<PhaserGameRef, PhaserGameProps>(
  function PhaserGame({ onSceneReady }, ref) {
    const gameRef = useRef<Phaser.Game | null>(null);

    useLayoutEffect(() => {
      if (gameRef.current) return;

      gameRef.current = new Phaser.Game(gameConfig);

      if (typeof ref === 'function') {
        ref({ game: gameRef.current, scene: null });
      } else if (ref) {
        ref.current = { game: gameRef.current, scene: null };
      }

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }, [ref]);

    useEffect(() => {
      const handleSceneReady = (scene: Phaser.Scene) => {
        if (typeof ref === 'function') {
          ref({ game: gameRef.current, scene });
        } else if (ref) {
          ref.current = { game: gameRef.current, scene };
        }
        onSceneReady?.(scene);
      };

      EventBus.on(GameEvents.SCENE_READY, handleSceneReady);

      return () => {
        EventBus.off(GameEvents.SCENE_READY, handleSceneReady);
      };
    }, [ref, onSceneReady]);

    return <div id="game-container" style={{ width: '100%', height: '100%' }} />;
  }
);
