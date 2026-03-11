// ABOUTME: Barrel export for the audio subsystem.
// ABOUTME: Re-exports the audio manager, TTS path helpers, and SFX definitions.

export { audioManager } from './manager';

export {
  getQuestionAudioPath,
  getFeedbackAudioPath,
  getInstructionAudioPath,
  getLevelAudioPath,
  getNumberAudioPath,
  getSfxPath,
  getMusicPath,
  randomCorrectFeedbackId,
  randomWrongFeedbackId,
} from './tts-map';

export type {
  Locale,
  Gender,
  FeedbackId,
  InstructionId,
  LevelMessageId,
  SfxName,
} from './tts-map';

export { SFX, ALL_SFX_NAMES, ALL_SFX_PATHS } from './sfx';
