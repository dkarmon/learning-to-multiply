// ABOUTME: Maps game concepts (facts, feedback types, etc.) to TTS audio file paths.
// ABOUTME: Provides typed lookup functions used by the Audio Manager for playback.

export type Locale = 'he' | 'en';
export type Gender = 'feminine' | 'masculine';

const AUDIO_BASE = '/assets/audio';

export function getQuestionAudioPath(
  factorA: number,
  factorB: number,
  locale: Locale,
): string {
  const a = Math.min(factorA, factorB);
  const b = Math.max(factorA, factorB);
  return `${AUDIO_BASE}/tts/${locale}/questions/q-${a}x${b}.mp3`;
}

export function getFeedbackAudioPath(
  feedbackId: string,
  locale: Locale,
): string {
  return `${AUDIO_BASE}/tts/${locale}/feedback/${feedbackId}.mp3`;
}

export function getInstructionAudioPath(
  instructionId: string,
  locale: Locale,
): string {
  return `${AUDIO_BASE}/tts/${locale}/instructions/${instructionId}.mp3`;
}

export function getLevelAudioPath(
  messageId: string,
  locale: Locale,
): string {
  return `${AUDIO_BASE}/tts/${locale}/level/${messageId}.mp3`;
}

export function getNumberAudioPath(
  num: number,
  locale: Locale,
  gender: Gender = 'feminine',
): string {
  if (locale === 'en') {
    return `${AUDIO_BASE}/tts/en/numbers/num-${num}.mp3`;
  }
  const suffix = gender === 'masculine' ? 'm' : 'f';
  return `${AUDIO_BASE}/tts/he/numbers/num-${num}-${suffix}.mp3`;
}

export type FeedbackId =
  | 'correct-1' | 'correct-2' | 'correct-3' | 'correct-4'
  | 'correct-5' | 'correct-6' | 'correct-no-hint' | 'correct-fast'
  | 'wrong-1' | 'wrong-2' | 'wrong-3'
  | 'wrong-show' | 'wrong-lets-see'
  | 'hint-available' | 'hint-used'
  | 'streak-3' | 'streak-5'
  | 'try-again-later';

export type InstructionId =
  | 'drag-blocks' | 'tap-answer' | 'tap-hint'
  | 'count-groups' | 'count-all' | 'look-blocks'
  | 'how-many-groups' | 'how-many-each'
  | 'press-number' | 'good-thinking';

export type LevelMessageId =
  | 'level-1' | 'level-2' | 'level-3' | 'level-4' | 'level-5'
  | 'level-6' | 'level-7' | 'level-8' | 'level-9' | 'level-10'
  | 'level-11' | 'level-12' | 'level-13' | 'level-14' | 'level-15'
  | 'level-complete' | 'level-perfect'
  | 'session-start' | 'session-end' | 'session-continue'
  | 'welcome-back' | 'new-building' | 'building-growing';

export type SfxName =
  | 'brick-place' | 'brick-crumble'
  | 'correct' | 'wrong'
  | 'level-complete' | 'button-tap'
  | 'hint-reveal' | 'celebration'
  | 'session-end'
  | 'drag-pickup' | 'drag-drop';

export function getSfxPath(name: SfxName): string {
  return `${AUDIO_BASE}/sfx/${name}.mp3`;
}

export function getMusicPath(): string {
  return `${AUDIO_BASE}/music/game-loop.mp3`;
}

export function randomCorrectFeedbackId(): FeedbackId {
  const options: FeedbackId[] = [
    'correct-1', 'correct-2', 'correct-3',
    'correct-4', 'correct-5', 'correct-6',
  ];
  return options[Math.floor(Math.random() * options.length)];
}

export function randomWrongFeedbackId(): FeedbackId {
  const options: FeedbackId[] = ['wrong-1', 'wrong-2', 'wrong-3'];
  return options[Math.floor(Math.random() * options.length)];
}
