// ABOUTME: Main game page that hosts the Phaser canvas via GameWrapper.
// ABOUTME: Generates questions from the learning engine and starts the game session.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { useGameStore } from '../../stores/game';
import { GameWrapper } from '../../components/GameWrapper';
import { generateLevelQuestions } from '../../lib/question-generator';
import { loadMasteryRecords } from '../../lib/mastery-store';

export function GamePage() {
  const navigate = useNavigate();
  const { activeKid } = useAuthStore();
  const { currentLevel, startSession, isActive } = useGameStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!activeKid) {
      navigate('/play/select-kid', { replace: true });
      return;
    }

    if (!isActive) {
      loadMasteryRecords(activeKid.id).then((masteryRecords) => {
        const questions = generateLevelQuestions(currentLevel, masteryRecords);
        startSession(activeKid.id, currentLevel, questions);
        setReady(true);
      });
      return;
    }

    setReady(true);
  }, [activeKid, navigate, currentLevel, startSession, isActive]);

  if (!activeKid || !ready) return null;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <GameWrapper />
    </div>
  );
}
