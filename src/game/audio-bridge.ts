// ABOUTME: Bridges Phaser game events to the AudioManager for sound playback.
// ABOUTME: Maps game actions (correct answer, brick placement, etc.) to audio calls.

import Phaser from 'phaser';
import { audioManager } from '../lib/audio/manager';
import type { Locale, FeedbackId, InstructionId, LevelMessageId, SfxName } from '../lib/audio/tts-map';

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
    | 'button_tap'
    | 'drag_pickup'
    | 'drag_drop'
    | 'session_end';
  locale: Locale;
  factorA?: number;
  factorB?: number;
  feedbackId?: FeedbackId;
  instructionId?: InstructionId;
  levelMessageId?: LevelMessageId;
}

export const AUDIO_EVENT = 'audio-event';

const SFX_ONLY_EVENTS: Record<string, SfxName> = {
  brick_place: 'brick-place',
  brick_crumble: 'brick-crumble',
  celebration: 'celebration',
  button_tap: 'button-tap',
  drag_pickup: 'drag-pickup',
  drag_drop: 'drag-drop',
};

export function initAudioBridge(game: Phaser.Game): void {
  game.canvas.addEventListener('pointerdown', () => {
    audioManager.resumeContext();
  }, { once: true });

  game.events.on(AUDIO_EVENT, handleAudioEvent);
}

export function destroyAudioBridge(game: Phaser.Game): void {
  game.events.off(AUDIO_EVENT, handleAudioEvent);
}

export function emitAudio(scene: Phaser.Scene, event: AudioEvent): void {
  scene.game.events.emit(AUDIO_EVENT, event);
}

async function handleAudioEvent(event: AudioEvent): Promise<void> {
  const sfxName = SFX_ONLY_EVENTS[event.type];
  if (sfxName) {
    await audioManager.playSFX(sfxName);
    return;
  }

  switch (event.type) {
    case 'question_read':
      if (event.factorA != null && event.factorB != null) {
        await audioManager.playQuestion(event.factorA, event.factorB, event.locale);
      }
      break;

    case 'correct':
      await audioManager.playSFX('correct');
      if (event.feedbackId) {
        await audioManager.playFeedback(event.feedbackId, event.locale);
      } else {
        await audioManager.playCorrectFeedback(event.locale);
      }
      break;

    case 'wrong':
      await audioManager.playSFX('wrong');
      if (event.feedbackId) {
        await audioManager.playFeedback(event.feedbackId, event.locale);
      } else {
        await audioManager.playWrongFeedback(event.locale);
      }
      break;

    case 'hint':
      await audioManager.playSFX('hint-reveal');
      if (event.instructionId) {
        await audioManager.playInstruction(event.instructionId, event.locale);
      }
      break;

    case 'level_complete':
      await audioManager.playSFX('level-complete');
      if (event.levelMessageId) {
        await audioManager.playLevelMessage(event.levelMessageId, event.locale);
      } else {
        await audioManager.playLevelMessage('level-complete', event.locale);
      }
      break;

    case 'session_end':
      audioManager.stopMusic();
      await audioManager.playSFX('session-end');
      await audioManager.playLevelMessage('session-end', event.locale);
      break;
  }
}
