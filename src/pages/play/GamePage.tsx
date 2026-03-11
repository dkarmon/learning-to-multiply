// ABOUTME: Main game page that hosts the Phaser canvas.
// ABOUTME: Redirects to kid selection if no active kid is set.

import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../game/PhaserGame';
import type { PhaserGameRef } from '../../game/PhaserGame';
import { useAuthStore } from '../../stores/auth';

export function GamePage() {
  const navigate = useNavigate();
  const { activeKid } = useAuthStore();
  const phaserRef = useRef<PhaserGameRef>({ game: null, scene: null });

  useEffect(() => {
    if (!activeKid) {
      navigate('/play/select-kid', { replace: true });
    }
  }, [activeKid, navigate]);

  if (!activeKid) return null;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PhaserGame ref={phaserRef} />
    </div>
  );
}
