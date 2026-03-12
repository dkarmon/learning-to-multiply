# Implementation Plan: Audio Workstream

Generated: 2026-03-11

## Implementation Checklist

**Instructions for implementing agent:** Work through this checklist in order. Mark items `[x]` as you complete them. Mark the current item `[→]`. Do NOT skip items. Danny must review all Hebrew text and approve all audio samples.

### Phase 1: TTS Script Generator (`scripts/generate-tts-scripts.ts`)

- [x] Create `scripts/generate-tts-scripts.ts` with the Hebrew number lookup table (feminine + masculine, 0-100)
- [x] Implement English number word lookup table (0-100)
- [x] Define feedback, instruction, and level/session phrase arrays (Hebrew + English)
- [x] Implement `generateManifest()` producing entries for all 66 canonical multiplication facts (0x0 through 10x10, a <= b) in both locales
- [x] Generate number word entries (0-100, both genders for Hebrew, single form for English)
- [x] Generate manifest entries for all feedback, instruction, and level message phrases in both locales
- [x] Each manifest entry includes: `id`, `text`, `locale`, `category`, `filePath`, `metadata`
- [x] Script writes `scripts/tts-manifest.json` on execution
- [ ] Write unit tests: manifest has ~550-650 entries, all 66 facts present in both locales, no duplicate IDs, no duplicate file paths, Hebrew questions contain "פעמים", English questions contain "times"
- [ ] Run tests green

**APPROVAL GATE: Danny reviews the generated `tts-manifest.json`. Danny checks Hebrew phrase list for naturalness, number gender forms (feminine for "פעמים" context), and feedback phrasing (feminine imperatives like "נסי"). Do NOT proceed until Danny approves.**

### Phase 2: TTS Batch Generation Script (`scripts/generate-tts-audio.ts`)

- [ ] Create `scripts/generate-tts-audio.ts` reading `scripts/tts-manifest.json`
- [ ] Implement ElevenLabs TTS provider (using `eleven_multilingual_v2` model)
- [ ] Implement Azure Speech TTS provider (with SSML, prosody adjustments)
- [ ] Provider selection via `TTS_PROVIDER` env var (default: `elevenlabs`)
- [ ] Idempotent: skip files that already exist at their target path
- [ ] Rate limit handling with exponential backoff (up to 5 retries)
- [ ] CLI flags: `--dry-run`, `--category=`, `--locale=`
- [ ] Progress reporting with generated/skipped/failed counts
- [ ] Files saved to `public/assets/audio/{filePath}` with directory creation

**APPROVAL GATE: Before running full batch generation, generate a small sample set (e.g., `--category=question --locale=he` for 2-3 facts, plus a few English phrases). Danny listens to Hebrew + English TTS voice samples and approves voice selection, pronunciation quality, and prosody. Do NOT batch-generate all clips until Danny approves the samples.**

### Phase 3: TTS Map (`src/lib/audio/tts-map.ts`)

- [x] Create `src/lib/audio/tts-map.ts` with typed path lookup functions
- [x] `getQuestionAudioPath(factorA, factorB, locale)` with canonical ordering (min, max)
- [x] `getFeedbackAudioPath(feedbackId, locale)`
- [x] `getInstructionAudioPath(instructionId, locale)`
- [x] `getLevelAudioPath(messageId, locale)`
- [x] `getNumberAudioPath(num, locale, gender?)` -- Hebrew gets gender suffix, English does not
- [x] `getSfxPath(name)` and `getMusicPath()` utility functions
- [x] `randomCorrectFeedbackId()` and `randomWrongFeedbackId()` helper functions
- [x] Export type unions: `FeedbackId`, `InstructionId`, `LevelMessageId`, `SfxName`, `Locale`, `Gender`
- [ ] Write unit tests: canonical ordering (3x5 == 5x3), all path functions return valid paths matching manifest structure, Hebrew number paths include gender suffix, English number paths do not
- [ ] Run tests green

### Phase 4: Audio Manager (`src/lib/audio/manager.ts`)

- [x] Create `src/lib/audio/manager.ts` as a singleton class using Web Audio API
- [x] Implement AudioContext initialization with gain node graph (master -> voice/sfx/music channels)
- [x] `resumeContext()` for browser autoplay policy compliance (call on user gesture)
- [x] Audio buffer loading and caching (`loadBuffer`) with deduplication of in-flight requests
- [x] `preload(filePaths)` and `preloadForLevel(facts, locale)` for warming the cache
- [x] Voice playback: `playQuestion`, `playFeedback`, `playCorrectFeedback`, `playWrongFeedback`, `playInstruction`, `playLevelMessage` -- all duck music and interrupt current voice
- [x] SFX playback: `playSFX(name)` -- multiple SFX can play simultaneously (fire-and-forget)
- [x] Music playback: `playMusic()` (looped), `stopMusic()`
- [x] Music ducking: `duckMusic()` lowers to 0.03 over 300ms, `unduckMusic()` restores to normal over 500ms, triggered by voice playback
- [x] Volume controls: `setMusicVolume`, `setSfxVolume`, `setVoiceVolume` (clamped 0-1)
- [x] Mute controls: `mute()`, `unmute()`, `toggleMute()`, `isMuted()`
- [x] `stopAll()` and `dispose()` for cleanup
- [ ] Write unit tests (with mocked Web Audio API): init creates context and gain nodes, mute/unmute toggles master gain, volume setters clamp to 0-1, preload caches buffers, stopAll stops voice and music
- [ ] Run tests green

### Phase 5: Phaser Audio Bridge (`src/game/audio-bridge.ts`)

- [x] Create `src/game/audio-bridge.ts` with `AudioEvent` interface matching orchestrator plan
- [x] `initAudioBridge(game)` -- registers `pointerdown` listener for context resume + event listener
- [x] `destroyAudioBridge(game)` -- removes event listener
- [x] `emitAudio(scene, event)` -- convenience for emitting from Phaser scenes
- [x] Event-to-audio mapping: `question_read` -> `playQuestion`, `correct` -> `playSFX('correct')` + `playCorrectFeedback`, `wrong` -> `playSFX('wrong')` + `playWrongFeedback`, `hint` -> `playSFX('hint-reveal')` + optional instruction, `level_complete` -> SFX + level message, `brick_place`/`brick_crumble`/`celebration`/`button_tap`/`drag_pickup`/`drag_drop` -> corresponding SFX, `session_end` -> stop music + SFX + level message
- [ ] Write integration tests: emitting events triggers correct AudioManager calls
- [ ] Run tests green

### Phase 6: Sound Effects Specification & Sourcing

- [ ] Generate/source all 11 SFX files (8-bit/chiptune style): `brick-place.mp3`, `brick-crumble.mp3`, `correct.mp3`, `wrong.mp3`, `level-complete.mp3`, `button-tap.mp3`, `hint-reveal.mp3`, `celebration.mp3`, `session-end.mp3`, `drag-pickup.mp3`, `drag-drop.mp3`
- [ ] All files are MP3 format, trimmed to specified durations, volume-normalized
- [ ] Save all files to `public/assets/audio/sfx/`
- [ ] Verify all 11 files load correctly in the AudioManager

**APPROVAL GATE: Danny listens to all SFX samples and approves the 8-bit style and feel. Pay attention to: `wrong.mp3` must feel like "oops" not "failure", `correct.mp3` must make a kid smile, `celebration.mp3` should pair with confetti. Do NOT integrate until Danny approves.**

### Phase 7: Background Music

- [ ] Source or compose a loopable 8-bit/chiptune background music track (30-60 seconds, major key, ~100-120 BPM)
- [ ] Verify seamless loop (no click or gap at the loop boundary)
- [ ] Save to `public/assets/audio/music/game-loop.mp3`
- [ ] Test music looping via AudioManager in a browser

**APPROVAL GATE: Danny listens to the background music loop and approves. It must be upbeat but not distracting, pleasant at low volume, and not startle a 6-year-old. Do NOT integrate until Danny approves.**

### Phase 8: Audio Settings Integration

- [ ] Add audio state (`musicVolume`, `sfxVolume`, `voiceVolume`, `muted`) to the Zustand settings store (`src/stores/settings.ts`)
- [ ] Wire store actions (`setMusicVolume`, `setSfxVolume`, `setVoiceVolume`, `toggleMute`) to AudioManager
- [ ] Sync saved settings to AudioManager on store initialization (localStorage persistence)
- [ ] Write tests: mute state persists, volume changes persist, store drives AudioManager
- [ ] Run tests green

### Final Verification

- [ ] All unit and integration tests pass
- [ ] Manual browser test: autoplay policy handled on Chrome, Firefox, Safari
- [ ] Manual test: music ducks during voice playback and restores smoothly
- [ ] Manual test: rapid question reads don't cause volume glitches
- [ ] All audio loads and plays correctly in the running game

## Goal

Build the complete audio pipeline for a Hebrew+English multiplication learning game for a 6-year-old. This covers TTS generation (pre-generated clips for all spoken content), 8-bit sound effects, background music, and a runtime audio manager that integrates with the Phaser game engine.

The audio system must feel responsive (instant playback via Web Audio API), support two languages (Hebrew and English), and respect parent preferences (mute/volume controls).

## Existing Codebase Analysis

The project is pre-code -- only `research.md` and `plans/plan-orchestrator.md` exist. No `src/`, `public/`, `scripts/`, or `package.json` yet. The Foundation agent will scaffold the project first; this plan can proceed independently for the script generation pieces and will integrate once the project structure exists.

**Key interfaces from orchestrator plan:**

```typescript
// Audio -> Game Engine contract
interface AudioEvent {
  type: 'question_read' | 'correct' | 'wrong' | 'hint' | 'level_complete'
       | 'brick_place' | 'brick_crumble' | 'celebration' | 'button_tap'
       | 'drag_pickup' | 'drag_drop' | 'session_end';
  locale: 'he' | 'en';
  factorA?: number;
  factorB?: number;
}
```

**File structure from orchestrator plan:**
```
public/assets/audio/
  sfx/         -- sound effect files
  music/       -- background music loop
  tts/
    he/        -- Hebrew voice clips
    en/        -- English voice clips
src/lib/audio/
  manager.ts   -- audio playback manager
  tts-map.ts   -- fact -> audio file path mapping
scripts/
  generate-tts.ts  -- batch TTS generation
```

## Implementation Phases

---

### Phase 1: TTS Script Generator

**File to create:** `scripts/generate-tts-scripts.ts`

**Purpose:** Generates a complete manifest of every phrase that needs to be spoken in both languages. This is a data-generation script, not a TTS-calling script. It outputs `scripts/tts-manifest.json`.

**Steps:**
1. Define the Hebrew number word lookup table (masculine + feminine forms, 0-100)
2. Generate question phrases for all 66 canonical multiplication facts
3. Generate number word entries (0-100, both genders in Hebrew)
4. Generate feedback, instruction, and level message phrases
5. Write the manifest JSON to `scripts/tts-manifest.json`

**Acceptance criteria:**
- [ ] Running the script produces `scripts/tts-manifest.json`
- [ ] Manifest contains entries for all 66 canonical facts in both languages
- [ ] Manifest contains Hebrew number words 0-100 with gender forms
- [ ] Manifest contains English number words 0-100
- [ ] Manifest contains all feedback, instruction, and level message phrases
- [ ] Each entry has: `id`, `text`, `locale`, `category`, `filePath`, `metadata`

**Full code:**

```typescript
// ABOUTME: Generates a JSON manifest of all phrases needing TTS audio generation.
// ABOUTME: Covers questions, number words, feedback, instructions, and level messages in Hebrew and English.

// ============================================================
// Hebrew Number Words -- Complete Lookup Table (0-100)
// ============================================================
// In multiplication context ("X times Y"), the convention is:
//   "כמה זה [X feminine] פעמים [Y feminine]"
// Danny (native Hebrew speaker) will review these forms.
// Feminine forms are used for "פעמים" (times) context.
// ============================================================

interface NumberWord {
  feminine: string;
  masculine: string;
}

const HEBREW_NUMBERS: Record<number, NumberWord> = {
  0:  { feminine: 'אפס',           masculine: 'אפס' },
  1:  { feminine: 'אחת',           masculine: 'אחד' },
  2:  { feminine: 'שתיים',         masculine: 'שניים' },
  3:  { feminine: 'שלוש',          masculine: 'שלושה' },
  4:  { feminine: 'ארבע',          masculine: 'ארבעה' },
  5:  { feminine: 'חמש',           masculine: 'חמישה' },
  6:  { feminine: 'שש',            masculine: 'שישה' },
  7:  { feminine: 'שבע',           masculine: 'שבעה' },
  8:  { feminine: 'שמונה',         masculine: 'שמונה' },
  9:  { feminine: 'תשע',           masculine: 'תשעה' },
  10: { feminine: 'עשר',           masculine: 'עשרה' },
  11: { feminine: 'אחת עשרה',      masculine: 'אחד עשר' },
  12: { feminine: 'שתים עשרה',     masculine: 'שנים עשר' },
  13: { feminine: 'שלוש עשרה',     masculine: 'שלושה עשר' },
  14: { feminine: 'ארבע עשרה',     masculine: 'ארבעה עשר' },
  15: { feminine: 'חמש עשרה',      masculine: 'חמישה עשר' },
  16: { feminine: 'שש עשרה',       masculine: 'שישה עשר' },
  17: { feminine: 'שבע עשרה',      masculine: 'שבעה עשר' },
  18: { feminine: 'שמונה עשרה',    masculine: 'שמונה עשר' },
  19: { feminine: 'תשע עשרה',      masculine: 'תשעה עשר' },
  20: { feminine: 'עשרים',         masculine: 'עשרים' },
  21: { feminine: 'עשרים ואחת',    masculine: 'עשרים ואחד' },
  22: { feminine: 'עשרים ושתיים',  masculine: 'עשרים ושניים' },
  23: { feminine: 'עשרים ושלוש',   masculine: 'עשרים ושלושה' },
  24: { feminine: 'עשרים וארבע',   masculine: 'עשרים וארבעה' },
  25: { feminine: 'עשרים וחמש',    masculine: 'עשרים וחמישה' },
  26: { feminine: 'עשרים ושש',     masculine: 'עשרים ושישה' },
  27: { feminine: 'עשרים ושבע',    masculine: 'עשרים ושבעה' },
  28: { feminine: 'עשרים ושמונה',  masculine: 'עשרים ושמונה' },
  29: { feminine: 'עשרים ותשע',    masculine: 'עשרים ותשעה' },
  30: { feminine: 'שלושים',        masculine: 'שלושים' },
  31: { feminine: 'שלושים ואחת',   masculine: 'שלושים ואחד' },
  32: { feminine: 'שלושים ושתיים', masculine: 'שלושים ושניים' },
  33: { feminine: 'שלושים ושלוש',  masculine: 'שלושים ושלושה' },
  34: { feminine: 'שלושים וארבע',  masculine: 'שלושים וארבעה' },
  35: { feminine: 'שלושים וחמש',   masculine: 'שלושים וחמישה' },
  36: { feminine: 'שלושים ושש',    masculine: 'שלושים ושישה' },
  37: { feminine: 'שלושים ושבע',   masculine: 'שלושים ושבעה' },
  38: { feminine: 'שלושים ושמונה', masculine: 'שלושים ושמונה' },
  39: { feminine: 'שלושים ותשע',   masculine: 'שלושים ותשעה' },
  40: { feminine: 'ארבעים',        masculine: 'ארבעים' },
  41: { feminine: 'ארבעים ואחת',   masculine: 'ארבעים ואחד' },
  42: { feminine: 'ארבעים ושתיים', masculine: 'ארבעים ושניים' },
  43: { feminine: 'ארבעים ושלוש',  masculine: 'ארבעים ושלושה' },
  44: { feminine: 'ארבעים וארבע',  masculine: 'ארבעים וארבעה' },
  45: { feminine: 'ארבעים וחמש',   masculine: 'ארבעים וחמישה' },
  46: { feminine: 'ארבעים ושש',    masculine: 'ארבעים ושישה' },
  47: { feminine: 'ארבעים ושבע',   masculine: 'ארבעים ושבעה' },
  48: { feminine: 'ארבעים ושמונה', masculine: 'ארבעים ושמונה' },
  49: { feminine: 'ארבעים ותשע',   masculine: 'ארבעים ותשעה' },
  50: { feminine: 'חמישים',        masculine: 'חמישים' },
  51: { feminine: 'חמישים ואחת',   masculine: 'חמישים ואחד' },
  52: { feminine: 'חמישים ושתיים', masculine: 'חמישים ושניים' },
  53: { feminine: 'חמישים ושלוש',  masculine: 'חמישים ושלושה' },
  54: { feminine: 'חמישים וארבע',  masculine: 'חמישים וארבעה' },
  55: { feminine: 'חמישים וחמש',   masculine: 'חמישים וחמישה' },
  56: { feminine: 'חמישים ושש',    masculine: 'חמישים ושישה' },
  57: { feminine: 'חמישים ושבע',   masculine: 'חמישים ושבעה' },
  58: { feminine: 'חמישים ושמונה', masculine: 'חמישים ושמונה' },
  59: { feminine: 'חמישים ותשע',   masculine: 'חמישים ותשעה' },
  60: { feminine: 'שישים',         masculine: 'שישים' },
  61: { feminine: 'שישים ואחת',    masculine: 'שישים ואחד' },
  62: { feminine: 'שישים ושתיים',  masculine: 'שישים ושניים' },
  63: { feminine: 'שישים ושלוש',   masculine: 'שישים ושלושה' },
  64: { feminine: 'שישים וארבע',   masculine: 'שישים וארבעה' },
  65: { feminine: 'שישים וחמש',    masculine: 'שישים וחמישה' },
  66: { feminine: 'שישים ושש',     masculine: 'שישים ושישה' },
  67: { feminine: 'שישים ושבע',    masculine: 'שישים ושבעה' },
  68: { feminine: 'שישים ושמונה',  masculine: 'שישים ושמונה' },
  69: { feminine: 'שישים ותשע',    masculine: 'שישים ותשעה' },
  70: { feminine: 'שבעים',         masculine: 'שבעים' },
  71: { feminine: 'שבעים ואחת',    masculine: 'שבעים ואחד' },
  72: { feminine: 'שבעים ושתיים',  masculine: 'שבעים ושניים' },
  73: { feminine: 'שבעים ושלוש',   masculine: 'שבעים ושלושה' },
  74: { feminine: 'שבעים וארבע',   masculine: 'שבעים וארבעה' },
  75: { feminine: 'שבעים וחמש',    masculine: 'שבעים וחמישה' },
  76: { feminine: 'שבעים ושש',     masculine: 'שבעים ושישה' },
  77: { feminine: 'שבעים ושבע',    masculine: 'שבעים ושבעה' },
  78: { feminine: 'שבעים ושמונה',  masculine: 'שבעים ושמונה' },
  79: { feminine: 'שבעים ותשע',    masculine: 'שבעים ותשעה' },
  80: { feminine: 'שמונים',        masculine: 'שמונים' },
  81: { feminine: 'שמונים ואחת',   masculine: 'שמונים ואחד' },
  82: { feminine: 'שמונים ושתיים', masculine: 'שמונים ושניים' },
  83: { feminine: 'שמונים ושלוש',  masculine: 'שמונים ושלושה' },
  84: { feminine: 'שמונים וארבע',  masculine: 'שמונים וארבעה' },
  85: { feminine: 'שמונים וחמש',   masculine: 'שמונים וחמישה' },
  86: { feminine: 'שמונים ושש',    masculine: 'שמונים ושישה' },
  87: { feminine: 'שמונים ושבע',   masculine: 'שמונים ושבעה' },
  88: { feminine: 'שמונים ושמונה', masculine: 'שמונים ושמונה' },
  89: { feminine: 'שמונים ותשע',   masculine: 'שמונים ותשעה' },
  90: { feminine: 'תשעים',         masculine: 'תשעים' },
  91: { feminine: 'תשעים ואחת',    masculine: 'תשעים ואחד' },
  92: { feminine: 'תשעים ושתיים',  masculine: 'תשעים ושניים' },
  93: { feminine: 'תשעים ושלוש',   masculine: 'תשעים ושלושה' },
  94: { feminine: 'תשעים וארבע',   masculine: 'תשעים וארבעה' },
  95: { feminine: 'תשעים וחמש',    masculine: 'תשעים וחמישה' },
  96: { feminine: 'תשעים ושש',     masculine: 'תשעים ושישה' },
  97: { feminine: 'תשעים ושבע',    masculine: 'תשעים ושבעה' },
  98: { feminine: 'תשעים ושמונה',  masculine: 'תשעים ושמונה' },
  99: { feminine: 'תשעים ותשע',    masculine: 'תשעים ותשעה' },
  100: { feminine: 'מאה',          masculine: 'מאה' },
};

const ENGLISH_NUMBERS: Record<number, string> = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four',
  5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
  10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen',
  15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen',
  20: 'twenty', 21: 'twenty-one', 22: 'twenty-two', 23: 'twenty-three',
  24: 'twenty-four', 25: 'twenty-five', 26: 'twenty-six', 27: 'twenty-seven',
  28: 'twenty-eight', 29: 'twenty-nine', 30: 'thirty', 31: 'thirty-one',
  32: 'thirty-two', 33: 'thirty-three', 34: 'thirty-four', 35: 'thirty-five',
  36: 'thirty-six', 37: 'thirty-seven', 38: 'thirty-eight', 39: 'thirty-nine',
  40: 'forty', 41: 'forty-one', 42: 'forty-two', 43: 'forty-three',
  44: 'forty-four', 45: 'forty-five', 46: 'forty-six', 47: 'forty-seven',
  48: 'forty-eight', 49: 'forty-nine', 50: 'fifty', 51: 'fifty-one',
  52: 'fifty-two', 53: 'fifty-three', 54: 'fifty-four', 55: 'fifty-five',
  56: 'fifty-six', 57: 'fifty-seven', 58: 'fifty-eight', 59: 'fifty-nine',
  60: 'sixty', 61: 'sixty-one', 62: 'sixty-two', 63: 'sixty-three',
  64: 'sixty-four', 65: 'sixty-five', 66: 'sixty-six', 67: 'sixty-seven',
  68: 'sixty-eight', 69: 'sixty-nine', 70: 'seventy', 71: 'seventy-one',
  72: 'seventy-two', 73: 'seventy-three', 74: 'seventy-four', 75: 'seventy-five',
  76: 'seventy-six', 77: 'seventy-seven', 78: 'seventy-eight', 79: 'seventy-nine',
  80: 'eighty', 81: 'eighty-one', 82: 'eighty-two', 83: 'eighty-three',
  84: 'eighty-four', 85: 'eighty-five', 86: 'eighty-six', 87: 'eighty-seven',
  88: 'eighty-eight', 89: 'eighty-nine', 90: 'ninety', 91: 'ninety-one',
  92: 'ninety-two', 93: 'ninety-three', 94: 'ninety-four', 95: 'ninety-five',
  96: 'ninety-six', 97: 'ninety-seven', 98: 'ninety-eight', 99: 'ninety-nine',
  100: 'one hundred',
};

// ============================================================
// Manifest types
// ============================================================

interface ManifestEntry {
  id: string;
  text: string;
  locale: 'he' | 'en';
  category: 'question' | 'number' | 'feedback' | 'instruction' | 'level';
  filePath: string;
  metadata: Record<string, unknown>;
}

interface Manifest {
  generatedAt: string;
  totalEntries: number;
  entries: ManifestEntry[];
}

// ============================================================
// Phrase definitions
// ============================================================

// Feedback phrases -- said after answer attempts and during gameplay
const FEEDBACK_PHRASES: Array<{ id: string; he: string; en: string }> = [
  { id: 'correct-1',       he: 'כל הכבוד!',                   en: 'Amazing!' },
  { id: 'correct-2',       he: 'מצוין!',                      en: 'Excellent!' },
  { id: 'correct-3',       he: 'יופי!',                       en: 'Great job!' },
  { id: 'correct-4',       he: 'נכון מאוד!',                  en: 'That\'s right!' },
  { id: 'correct-5',       he: 'וואו!',                       en: 'Wow!' },
  { id: 'correct-6',       he: 'בדיוק!',                      en: 'Exactly!' },
  { id: 'correct-no-hint', he: 'לבד! בלי עזרה!',             en: 'All by yourself!' },
  { id: 'correct-fast',    he: 'מהר מאוד!',                   en: 'Super fast!' },
  { id: 'wrong-1',         he: 'לא בדיוק, נסי שוב!',         en: 'Not quite, try again!' },
  { id: 'wrong-2',         he: 'כמעט! נסי עוד פעם.',          en: 'Almost! Try once more.' },
  { id: 'wrong-3',         he: 'אופס, עוד פעם!',              en: 'Oops, one more time!' },
  { id: 'wrong-show',      he: 'התשובה היא',                   en: 'The answer is' },
  { id: 'wrong-lets-see',  he: 'בוא נראה למה.',                en: 'Let\'s see why.' },
  { id: 'hint-available',  he: 'רוצה עזרה?',                  en: 'Need help?' },
  { id: 'hint-used',       he: 'יופי שהשתמשת בעזרה!',        en: 'Great job using the blocks!' },
  { id: 'streak-3',        he: 'שלוש ברצף!',                  en: 'Three in a row!' },
  { id: 'streak-5',        he: 'חמש ברצף! אלופה!',            en: 'Five in a row! Champion!' },
  { id: 'try-again-later', he: 'ננסה את זה שוב אחר כך.',      en: 'We\'ll try this one again later.' },
];

// Instructions -- said during gameplay interaction
const INSTRUCTION_PHRASES: Array<{ id: string; he: string; en: string }> = [
  { id: 'drag-blocks',     he: 'גררי את הקוביות.',             en: 'Drag the blocks.' },
  { id: 'tap-answer',      he: 'הקישי את התשובה.',             en: 'Tap the answer.' },
  { id: 'tap-hint',        he: 'אפשר ללחוץ על עזרה.',          en: 'You can tap the help button.' },
  { id: 'count-groups',    he: 'בואי נספור את הקבוצות.',        en: 'Let\'s count the groups.' },
  { id: 'count-all',       he: 'עכשיו נספור את הכל.',          en: 'Now let\'s count them all.' },
  { id: 'look-blocks',     he: 'תסתכלי על הקוביות.',           en: 'Look at the blocks.' },
  { id: 'how-many-groups', he: 'כמה קבוצות יש?',               en: 'How many groups are there?' },
  { id: 'how-many-each',   he: 'כמה בכל קבוצה?',               en: 'How many in each group?' },
  { id: 'press-number',    he: 'לחצי על המספר.',                en: 'Press the number.' },
  { id: 'good-thinking',   he: 'חשיבה טובה!',                  en: 'Good thinking!' },
];

// Level and session messages
const LEVEL_PHRASES: Array<{ id: string; he: string; en: string }> = [
  { id: 'level-1',          he: 'שלב אחת!',                    en: 'Level one!' },
  { id: 'level-2',          he: 'שלב שתיים!',                  en: 'Level two!' },
  { id: 'level-3',          he: 'שלב שלוש!',                   en: 'Level three!' },
  { id: 'level-4',          he: 'שלב ארבע!',                   en: 'Level four!' },
  { id: 'level-5',          he: 'שלב חמש!',                    en: 'Level five!' },
  { id: 'level-6',          he: 'שלב שש!',                     en: 'Level six!' },
  { id: 'level-7',          he: 'שלב שבע!',                    en: 'Level seven!' },
  { id: 'level-8',          he: 'שלב שמונה!',                  en: 'Level eight!' },
  { id: 'level-9',          he: 'שלב תשע!',                    en: 'Level nine!' },
  { id: 'level-10',         he: 'שלב עשר!',                    en: 'Level ten!' },
  { id: 'level-11',         he: 'שלב אחת עשרה!',              en: 'Level eleven!' },
  { id: 'level-12',         he: 'שלב שתים עשרה!',             en: 'Level twelve!' },
  { id: 'level-13',         he: 'שלב שלוש עשרה!',             en: 'Level thirteen!' },
  { id: 'level-14',         he: 'שלב ארבע עשרה!',             en: 'Level fourteen!' },
  { id: 'level-15',         he: 'שלב חמש עשרה!',              en: 'Level fifteen!' },
  { id: 'level-complete',   he: 'הצלחת!',                     en: 'You did it!' },
  { id: 'level-perfect',    he: 'מושלם! בלי טעויות!',         en: 'Perfect! No mistakes!' },
  { id: 'session-start',    he: 'בואי נשחק!',                 en: 'Let\'s play!' },
  { id: 'session-end',      he: 'כל הכבוד! סיימנו להיום!',    en: 'Great job! We\'re done for today!' },
  { id: 'session-continue', he: 'רוצה להמשיך?',               en: 'Want to keep going?' },
  { id: 'welcome-back',     he: 'שוב פה! בואי נתחיל!',        en: 'You\'re back! Let\'s start!' },
  { id: 'new-building',     he: 'בניין חדש!',                  en: 'New building!' },
  { id: 'building-growing', he: 'הבניין גדל!',                en: 'The building is growing!' },
];

// ============================================================
// Generation logic
// ============================================================

function generateManifest(): Manifest {
  const entries: ManifestEntry[] = [];

  // --- Question phrases: all 66 canonical facts (0x0 through 10x10, a <= b) ---
  // Hebrew: "כמה זה [A feminine] פעמים [B feminine]?"
  // English: "How much is [A] times [B]?"
  for (let a = 0; a <= 10; a++) {
    for (let b = a; b <= 10; b++) {
      const heA = HEBREW_NUMBERS[a].feminine;
      const heB = HEBREW_NUMBERS[b].feminine;
      const heText = `כמה זה ${heA} פעמים ${heB}?`;
      entries.push({
        id: `q-${a}x${b}-he`,
        text: heText,
        locale: 'he',
        category: 'question',
        filePath: `tts/he/questions/q-${a}x${b}.mp3`,
        metadata: { factorA: a, factorB: b, answer: a * b },
      });

      const enA = ENGLISH_NUMBERS[a];
      const enB = ENGLISH_NUMBERS[b];
      const enText = `How much is ${enA} times ${enB}?`;
      entries.push({
        id: `q-${a}x${b}-en`,
        text: enText,
        locale: 'en',
        category: 'question',
        filePath: `tts/en/questions/q-${a}x${b}.mp3`,
        metadata: { factorA: a, factorB: b, answer: a * b },
      });
    }
  }

  // --- Number words 0-100 ---
  for (let n = 0; n <= 100; n++) {
    // Hebrew feminine
    entries.push({
      id: `num-${n}-he-f`,
      text: HEBREW_NUMBERS[n].feminine,
      locale: 'he',
      category: 'number',
      filePath: `tts/he/numbers/num-${n}-f.mp3`,
      metadata: { number: n, gender: 'feminine' },
    });
    // Hebrew masculine
    if (HEBREW_NUMBERS[n].masculine !== HEBREW_NUMBERS[n].feminine) {
      entries.push({
        id: `num-${n}-he-m`,
        text: HEBREW_NUMBERS[n].masculine,
        locale: 'he',
        category: 'number',
        filePath: `tts/he/numbers/num-${n}-m.mp3`,
        metadata: { number: n, gender: 'masculine' },
      });
    }
    // English
    entries.push({
      id: `num-${n}-en`,
      text: ENGLISH_NUMBERS[n],
      locale: 'en',
      category: 'number',
      filePath: `tts/en/numbers/num-${n}.mp3`,
      metadata: { number: n },
    });
  }

  // --- Feedback phrases ---
  for (const phrase of FEEDBACK_PHRASES) {
    entries.push({
      id: `feedback-${phrase.id}-he`,
      text: phrase.he,
      locale: 'he',
      category: 'feedback',
      filePath: `tts/he/feedback/${phrase.id}.mp3`,
      metadata: {},
    });
    entries.push({
      id: `feedback-${phrase.id}-en`,
      text: phrase.en,
      locale: 'en',
      category: 'feedback',
      filePath: `tts/en/feedback/${phrase.id}.mp3`,
      metadata: {},
    });
  }

  // --- Instruction phrases ---
  for (const phrase of INSTRUCTION_PHRASES) {
    entries.push({
      id: `instruction-${phrase.id}-he`,
      text: phrase.he,
      locale: 'he',
      category: 'instruction',
      filePath: `tts/he/instructions/${phrase.id}.mp3`,
      metadata: {},
    });
    entries.push({
      id: `instruction-${phrase.id}-en`,
      text: phrase.en,
      locale: 'en',
      category: 'instruction',
      filePath: `tts/en/instructions/${phrase.id}.mp3`,
      metadata: {},
    });
  }

  // --- Level/session phrases ---
  for (const phrase of LEVEL_PHRASES) {
    entries.push({
      id: `level-${phrase.id}-he`,
      text: phrase.he,
      locale: 'he',
      category: 'level',
      filePath: `tts/he/level/${phrase.id}.mp3`,
      metadata: {},
    });
    entries.push({
      id: `level-${phrase.id}-en`,
      text: phrase.en,
      locale: 'en',
      category: 'level',
      filePath: `tts/en/level/${phrase.id}.mp3`,
      metadata: {},
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    totalEntries: entries.length,
    entries,
  };
}

// ============================================================
// Main
// ============================================================

import * as fs from 'fs';
import * as path from 'path';

const manifest = generateManifest();
const outputPath = path.resolve(__dirname, 'tts-manifest.json');
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');

console.log(`Generated TTS manifest: ${manifest.totalEntries} entries`);
console.log(`  Questions: ${manifest.entries.filter(e => e.category === 'question').length}`);
console.log(`  Numbers:   ${manifest.entries.filter(e => e.category === 'number').length}`);
console.log(`  Feedback:  ${manifest.entries.filter(e => e.category === 'feedback').length}`);
console.log(`  Instructions: ${manifest.entries.filter(e => e.category === 'instruction').length}`);
console.log(`  Level/Session: ${manifest.entries.filter(e => e.category === 'level').length}`);
console.log(`Written to: ${outputPath}`);
```

---

### Phase 2: TTS Batch Generation Script

**File to create:** `scripts/generate-tts-audio.ts`

**Purpose:** Reads `tts-manifest.json`, calls a TTS API (ElevenLabs or Azure, selected via `TTS_PROVIDER` env var) for each entry, saves MP3 files. Idempotent -- skips files that already exist.

**Steps:**
1. Read the manifest JSON
2. Determine TTS provider from env var
3. For each entry, check if file exists (skip if so)
4. Call the appropriate TTS API
5. Save the MP3 to `public/assets/audio/{filePath}`
6. Handle rate limiting with exponential backoff
7. Report progress

**Acceptance criteria:**
- [ ] Script reads `tts-manifest.json` and generates MP3 files
- [ ] Supports both ElevenLabs and Azure via `TTS_PROVIDER` env var
- [ ] Skips already-generated files (idempotent)
- [ ] Handles rate limiting with retry logic
- [ ] Reports progress with counts
- [ ] Files are saved to correct directory structure

**Full code:**

```typescript
// ABOUTME: Batch TTS audio generator that reads the manifest and calls ElevenLabs or Azure API.
// ABOUTME: Saves MP3 files to public/assets/audio/tts/, skipping files that already exist.

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// Types
// ============================================================

interface ManifestEntry {
  id: string;
  text: string;
  locale: 'he' | 'en';
  category: string;
  filePath: string;
  metadata: Record<string, unknown>;
}

interface Manifest {
  generatedAt: string;
  totalEntries: number;
  entries: ManifestEntry[];
}

interface TtsProvider {
  name: string;
  generate(text: string, locale: 'he' | 'en'): Promise<Buffer>;
}

// ============================================================
// ElevenLabs provider
// ============================================================

function createElevenLabsProvider(): TtsProvider {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is required');
  }

  // ElevenLabs voice IDs -- pick voices that sound warm and clear for a child.
  // These should be configured per-language. Danny should pick final voices
  // from https://elevenlabs.io/voice-library
  const hebrewVoiceId = process.env.ELEVENLABS_VOICE_HE || 'pNInz6obpgDQGcFmaJgB'; // placeholder
  const englishVoiceId = process.env.ELEVENLABS_VOICE_EN || 'EXAVITQu4vr4xnSDxMaL'; // placeholder

  return {
    name: 'ElevenLabs',
    async generate(text: string, locale: 'he' | 'en'): Promise<Buffer> {
      const voiceId = locale === 'he' ? hebrewVoiceId : englishVoiceId;
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      });

      if (response.status === 429) {
        throw new RateLimitError('ElevenLabs rate limit hit');
      }
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`ElevenLabs API error ${response.status}: ${body}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    },
  };
}

// ============================================================
// Azure Speech provider
// ============================================================

function createAzureProvider(): TtsProvider {
  const subscriptionKey = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION || 'eastus';
  if (!subscriptionKey) {
    throw new Error('AZURE_SPEECH_KEY environment variable is required');
  }

  // Azure Hebrew voices: he-IL-HilaNeural (female), he-IL-AvriNeural (male)
  // Azure English voices: en-US-JennyNeural (female), en-US-GuyNeural (male)
  const hebrewVoice = process.env.AZURE_VOICE_HE || 'he-IL-HilaNeural';
  const englishVoice = process.env.AZURE_VOICE_EN || 'en-US-JennyNeural';

  return {
    name: 'Azure Speech',
    async generate(text: string, locale: 'he' | 'en'): Promise<Buffer> {
      const voice = locale === 'he' ? hebrewVoice : englishVoice;
      const langCode = locale === 'he' ? 'he-IL' : 'en-US';
      const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

      const ssml = `
        <speak version='1.0' xml:lang='${langCode}'>
          <voice xml:lang='${langCode}' name='${voice}'>
            <prosody rate='-10%' pitch='+5%'>
              ${escapeXml(text)}
            </prosody>
          </voice>
        </speak>
      `.trim();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: ssml,
      });

      if (response.status === 429) {
        throw new RateLimitError('Azure rate limit hit');
      }
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Azure Speech API error ${response.status}: ${body}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    },
  };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================
// Rate limit handling
// ============================================================

class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateWithRetry(
  provider: TtsProvider,
  text: string,
  locale: 'he' | 'en',
  maxRetries = 5,
): Promise<Buffer> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await provider.generate(text, locale);
    } catch (err) {
      lastError = err as Error;
      if (err instanceof RateLimitError) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 60000);
        console.log(`  Rate limited. Waiting ${backoffMs / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
        await sleep(backoffMs);
      } else {
        throw err;
      }
    }
  }
  throw lastError!;
}

// ============================================================
// Main
// ============================================================

async function main() {
  // Parse args
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const filterCategory = args.find(a => a.startsWith('--category='))?.split('=')[1];
  const filterLocale = args.find(a => a.startsWith('--locale='))?.split('=')[1] as 'he' | 'en' | undefined;

  // Read manifest
  const manifestPath = path.resolve(__dirname, 'tts-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Manifest not found. Run generate-tts-scripts.ts first.');
    process.exit(1);
  }
  const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // Filter entries if requested
  let entries = manifest.entries;
  if (filterCategory) {
    entries = entries.filter(e => e.category === filterCategory);
  }
  if (filterLocale) {
    entries = entries.filter(e => e.locale === filterLocale);
  }

  // Create provider
  const providerName = (process.env.TTS_PROVIDER || 'elevenlabs').toLowerCase();
  let provider: TtsProvider;
  if (providerName === 'elevenlabs') {
    provider = createElevenLabsProvider();
  } else if (providerName === 'azure') {
    provider = createAzureProvider();
  } else {
    console.error(`Unknown TTS_PROVIDER: ${providerName}. Use 'elevenlabs' or 'azure'.`);
    process.exit(1);
  }

  console.log(`TTS Provider: ${provider.name}`);
  console.log(`Total entries: ${entries.length}`);
  if (dryRun) {
    console.log('DRY RUN -- no files will be generated');
  }

  const audioBase = path.resolve(__dirname, '..', 'public', 'assets', 'audio');
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const filePath = path.join(audioBase, entry.filePath);
    const progress = `[${i + 1}/${entries.length}]`;

    // Skip if file already exists (idempotent)
    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`${progress} Would generate: ${entry.filePath} -- "${entry.text}"`);
      generated++;
      continue;
    }

    try {
      console.log(`${progress} Generating: ${entry.filePath}`);
      const audioBuffer = await generateWithRetry(provider, entry.text, entry.locale);

      // Create directory tree
      const dir = path.dirname(filePath);
      fs.mkdirSync(dir, { recursive: true });

      // Write file
      fs.writeFileSync(filePath, audioBuffer);
      generated++;

      // Small delay between calls to be respectful of API limits
      await sleep(200);
    } catch (err) {
      console.error(`${progress} FAILED: ${entry.id} -- ${(err as Error).message}`);
      failed++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Generated: ${generated}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${entries.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
```

**Usage:**
```bash
# Generate all audio with ElevenLabs
TTS_PROVIDER=elevenlabs ELEVENLABS_API_KEY=sk-xxx npx tsx scripts/generate-tts-audio.ts

# Generate only Hebrew questions with Azure
TTS_PROVIDER=azure AZURE_SPEECH_KEY=xxx npx tsx scripts/generate-tts-audio.ts --locale=he --category=question

# Dry run to see what would be generated
npx tsx scripts/generate-tts-audio.ts --dry-run
```

---

### Phase 3: TTS Map

**File to create:** `src/lib/audio/tts-map.ts`

**Purpose:** Provides typed functions to look up audio file paths by fact, feedback type, instruction, etc. Used by the Audio Manager to know which file to play.

**Steps:**
1. Define path-building functions for each category
2. Export typed lookup functions matching the game's needs

**Acceptance criteria:**
- [ ] `getQuestionAudioPath(factorA, factorB, locale)` returns correct path
- [ ] `getFeedbackAudioPath(feedbackId, locale)` returns correct path
- [ ] `getInstructionAudioPath(instructionId, locale)` returns correct path
- [ ] `getLevelAudioPath(levelMessageId, locale)` returns correct path
- [ ] `getNumberAudioPath(number, locale, gender?)` returns correct path
- [ ] All paths match the structure in the TTS manifest

**Full code:**

```typescript
// ABOUTME: Maps game concepts (facts, feedback types, etc.) to TTS audio file paths.
// ABOUTME: Provides typed lookup functions used by the Audio Manager for playback.

export type Locale = 'he' | 'en';
export type Gender = 'feminine' | 'masculine';

const AUDIO_BASE = '/assets/audio';

/**
 * Get the audio path for a multiplication question.
 * Facts are stored canonically as min(a,b) x max(a,b).
 */
export function getQuestionAudioPath(
  factorA: number,
  factorB: number,
  locale: Locale,
): string {
  const a = Math.min(factorA, factorB);
  const b = Math.max(factorA, factorB);
  return `${AUDIO_BASE}/tts/${locale}/questions/q-${a}x${b}.mp3`;
}

/**
 * Get the audio path for a feedback phrase.
 */
export function getFeedbackAudioPath(
  feedbackId: string,
  locale: Locale,
): string {
  return `${AUDIO_BASE}/tts/${locale}/feedback/${feedbackId}.mp3`;
}

/**
 * Get the audio path for an instruction phrase.
 */
export function getInstructionAudioPath(
  instructionId: string,
  locale: Locale,
): string {
  return `${AUDIO_BASE}/tts/${locale}/instructions/${instructionId}.mp3`;
}

/**
 * Get the audio path for a level/session message.
 */
export function getLevelAudioPath(
  messageId: string,
  locale: Locale,
): string {
  return `${AUDIO_BASE}/tts/${locale}/level/${messageId}.mp3`;
}

/**
 * Get the audio path for a spoken number.
 * Hebrew numbers have gendered forms. English does not.
 */
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

/**
 * Valid feedback IDs for type safety.
 */
export type FeedbackId =
  | 'correct-1' | 'correct-2' | 'correct-3' | 'correct-4'
  | 'correct-5' | 'correct-6' | 'correct-no-hint' | 'correct-fast'
  | 'wrong-1' | 'wrong-2' | 'wrong-3'
  | 'wrong-show' | 'wrong-lets-see'
  | 'hint-available' | 'hint-used'
  | 'streak-3' | 'streak-5'
  | 'try-again-later';

/**
 * Valid instruction IDs for type safety.
 */
export type InstructionId =
  | 'drag-blocks' | 'tap-answer' | 'tap-hint'
  | 'count-groups' | 'count-all' | 'look-blocks'
  | 'how-many-groups' | 'how-many-each'
  | 'press-number' | 'good-thinking';

/**
 * Valid level/session message IDs for type safety.
 */
export type LevelMessageId =
  | 'level-1' | 'level-2' | 'level-3' | 'level-4' | 'level-5'
  | 'level-6' | 'level-7' | 'level-8' | 'level-9' | 'level-10'
  | 'level-11' | 'level-12' | 'level-13' | 'level-14' | 'level-15'
  | 'level-complete' | 'level-perfect'
  | 'session-start' | 'session-end' | 'session-continue'
  | 'welcome-back' | 'new-building' | 'building-growing';

/** All SFX file names */
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

/**
 * Pick a random "correct" feedback phrase.
 */
export function randomCorrectFeedbackId(): FeedbackId {
  const options: FeedbackId[] = [
    'correct-1', 'correct-2', 'correct-3',
    'correct-4', 'correct-5', 'correct-6',
  ];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Pick a random "wrong" feedback phrase.
 */
export function randomWrongFeedbackId(): FeedbackId {
  const options: FeedbackId[] = ['wrong-1', 'wrong-2', 'wrong-3'];
  return options[Math.floor(Math.random() * options.length)];
}
```

---

### Phase 4: Audio Manager

**File to create:** `src/lib/audio/manager.ts`

**Purpose:** Handles all audio playback using the Web Audio API. Preloads audio for the current level, provides instant playback, manages volume/mute, and handles browser autoplay restrictions.

**Steps:**
1. Create an AudioContext wrapper that handles browser autoplay policy
2. Implement audio buffer cache with preloading
3. Implement playback functions for voice, SFX, and music
4. Handle priority (voice > SFX > music) with ducking
5. Expose volume/mute controls
6. Handle concurrent sounds correctly

**Acceptance criteria:**
- [ ] Uses Web Audio API (not HTML5 Audio elements)
- [ ] Preloads audio files for current level
- [ ] Plays question audio for any (factorA, factorB, locale) combination
- [ ] Plays feedback, SFX, and music
- [ ] Music ducks (lowers volume) during voice playback and restores after
- [ ] Handles browser autoplay restrictions (resumes context on user gesture)
- [ ] Mute/unmute and volume controls work
- [ ] Multiple SFX can play simultaneously
- [ ] Voice playback interrupts any currently playing voice

**Full code:**

```typescript
// ABOUTME: Audio playback manager using Web Audio API for instant, low-latency sound.
// ABOUTME: Handles preloading, music ducking during speech, and browser autoplay restrictions.

import {
  getQuestionAudioPath,
  getFeedbackAudioPath,
  getInstructionAudioPath,
  getLevelAudioPath,
  getSfxPath,
  getMusicPath,
  randomCorrectFeedbackId,
  randomWrongFeedbackId,
  type Locale,
  type FeedbackId,
  type InstructionId,
  type LevelMessageId,
  type SfxName,
} from './tts-map';

// ============================================================
// Types
// ============================================================

interface AudioManagerState {
  musicVolume: number;    // 0.0 - 1.0
  sfxVolume: number;      // 0.0 - 1.0
  voiceVolume: number;    // 0.0 - 1.0
  muted: boolean;
}

type AudioChannel = 'voice' | 'sfx' | 'music';

// ============================================================
// AudioManager singleton
// ============================================================

class AudioManager {
  private ctx: AudioContext | null = null;
  private bufferCache = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<string, Promise<AudioBuffer | null>>();

  // Gain nodes for each channel
  private masterGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // Currently playing sources (for stop/interrupt)
  private currentVoiceSource: AudioBufferSourceNode | null = null;
  private currentMusicSource: AudioBufferSourceNode | null = null;

  // Music ducking state
  private musicNormalVolume = 0.15;
  private musicDuckedVolume = 0.03;
  private isDucked = false;

  // State
  private state: AudioManagerState = {
    musicVolume: 0.15,
    sfxVolume: 0.7,
    voiceVolume: 1.0,
    muted: false,
  };

  private contextResumed = false;

  // ============================================================
  // Initialization
  // ============================================================

  /**
   * Initialize the AudioContext. Call this early, but audio won't actually
   * play until resumeContext() is called after a user gesture.
   */
  init(): void {
    if (this.ctx) return;

    this.ctx = new AudioContext();

    // Build gain node graph: source -> channel gain -> master gain -> destination
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.voiceGain = this.ctx.createGain();
    this.voiceGain.connect(this.masterGain);
    this.voiceGain.gain.value = this.state.voiceVolume;

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);
    this.sfxGain.gain.value = this.state.sfxVolume;

    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);
    this.musicGain.gain.value = this.state.musicVolume;
  }

  /**
   * Resume AudioContext after a user gesture (required by browser autoplay policy).
   * Call this from an onClick or onTouchStart handler.
   */
  async resumeContext(): Promise<void> {
    if (!this.ctx) this.init();
    if (this.ctx!.state === 'suspended') {
      await this.ctx!.resume();
    }
    this.contextResumed = true;
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) this.init();
    return this.ctx!;
  }

  // ============================================================
  // Loading
  // ============================================================

  /**
   * Load and decode an audio file into the buffer cache.
   * Returns null if the file can't be loaded (missing, network error, etc).
   */
  private async loadBuffer(filePath: string): Promise<AudioBuffer | null> {
    // Already cached
    if (this.bufferCache.has(filePath)) {
      return this.bufferCache.get(filePath)!;
    }

    // Already loading
    if (this.loadingPromises.has(filePath)) {
      return this.loadingPromises.get(filePath)!;
    }

    const promise = (async () => {
      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          console.warn(`Audio file not found: ${filePath}`);
          return null;
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ensureContext().decodeAudioData(arrayBuffer);
        this.bufferCache.set(filePath, audioBuffer);
        return audioBuffer;
      } catch (err) {
        console.warn(`Failed to load audio: ${filePath}`, err);
        return null;
      } finally {
        this.loadingPromises.delete(filePath);
      }
    })();

    this.loadingPromises.set(filePath, promise);
    return promise;
  }

  /**
   * Preload a batch of audio files. Use this to warm the cache for an
   * upcoming level so playback is instant.
   */
  async preload(filePaths: string[]): Promise<void> {
    await Promise.all(filePaths.map(p => this.loadBuffer(p)));
  }

  /**
   * Preload all audio needed for a given set of facts at a given locale.
   * Includes question audio + common SFX + feedback phrases.
   */
  async preloadForLevel(
    facts: Array<{ factorA: number; factorB: number }>,
    locale: Locale,
  ): Promise<void> {
    const paths: string[] = [];

    // Question audio for each fact
    for (const fact of facts) {
      paths.push(getQuestionAudioPath(fact.factorA, fact.factorB, locale));
    }

    // Common SFX
    const sfxNames: SfxName[] = [
      'brick-place', 'correct', 'wrong', 'button-tap',
      'level-complete', 'hint-reveal', 'drag-pickup', 'drag-drop',
    ];
    for (const name of sfxNames) {
      paths.push(getSfxPath(name));
    }

    // A few feedback phrases
    const feedbackIds: FeedbackId[] = [
      'correct-1', 'correct-2', 'correct-3',
      'wrong-1', 'wrong-2', 'wrong-3',
    ];
    for (const id of feedbackIds) {
      paths.push(getFeedbackAudioPath(id, locale));
    }

    await this.preload(paths);
  }

  // ============================================================
  // Playback
  // ============================================================

  /**
   * Play a buffer through a specific gain node channel.
   * Returns the source node (for tracking/stopping).
   */
  private async playBuffer(
    filePath: string,
    channel: AudioChannel,
    loop = false,
  ): Promise<AudioBufferSourceNode | null> {
    if (this.state.muted) return null;

    const buffer = await this.loadBuffer(filePath);
    if (!buffer) return null;

    const ctx = this.ensureContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;

    const gainNode =
      channel === 'voice' ? this.voiceGain! :
      channel === 'sfx' ? this.sfxGain! :
      this.musicGain!;

    source.connect(gainNode);
    source.start(0);
    return source;
  }

  // --- Voice (TTS) playback ---

  /**
   * Play a question TTS clip. Ducks music, interrupts any current voice.
   */
  async playQuestion(factorA: number, factorB: number, locale: Locale): Promise<void> {
    const path = getQuestionAudioPath(factorA, factorB, locale);
    await this.playVoice(path);
  }

  /**
   * Play a feedback phrase with music ducking.
   */
  async playFeedback(feedbackId: FeedbackId, locale: Locale): Promise<void> {
    const path = getFeedbackAudioPath(feedbackId, locale);
    await this.playVoice(path);
  }

  /**
   * Play a random correct-answer feedback phrase.
   */
  async playCorrectFeedback(locale: Locale): Promise<void> {
    await this.playFeedback(randomCorrectFeedbackId(), locale);
  }

  /**
   * Play a random wrong-answer feedback phrase.
   */
  async playWrongFeedback(locale: Locale): Promise<void> {
    await this.playFeedback(randomWrongFeedbackId(), locale);
  }

  /**
   * Play an instruction phrase.
   */
  async playInstruction(instructionId: InstructionId, locale: Locale): Promise<void> {
    const path = getInstructionAudioPath(instructionId, locale);
    await this.playVoice(path);
  }

  /**
   * Play a level/session message.
   */
  async playLevelMessage(messageId: LevelMessageId, locale: Locale): Promise<void> {
    const path = getLevelAudioPath(messageId, locale);
    await this.playVoice(path);
  }

  /**
   * Core voice playback with music ducking.
   * Interrupts any currently playing voice clip.
   */
  private async playVoice(filePath: string): Promise<void> {
    // Stop current voice if playing
    this.stopVoice();

    // Duck music
    this.duckMusic();

    const source = await this.playBuffer(filePath, 'voice');
    if (source) {
      this.currentVoiceSource = source;
      source.onended = () => {
        this.currentVoiceSource = null;
        this.unduckMusic();
      };
    } else {
      this.unduckMusic();
    }
  }

  private stopVoice(): void {
    if (this.currentVoiceSource) {
      try {
        this.currentVoiceSource.stop();
      } catch {
        // Already stopped
      }
      this.currentVoiceSource = null;
    }
  }

  // --- SFX playback ---

  /**
   * Play a sound effect. Multiple SFX can play simultaneously.
   */
  async playSFX(name: SfxName): Promise<void> {
    const path = getSfxPath(name);
    await this.playBuffer(path, 'sfx');
  }

  // --- Music playback ---

  /**
   * Start playing background music in a loop.
   */
  async playMusic(): Promise<void> {
    this.stopMusic();
    const path = getMusicPath();
    const source = await this.playBuffer(path, 'music', true);
    if (source) {
      this.currentMusicSource = source;
    }
  }

  /**
   * Stop background music.
   */
  stopMusic(): void {
    if (this.currentMusicSource) {
      try {
        this.currentMusicSource.stop();
      } catch {
        // Already stopped
      }
      this.currentMusicSource = null;
    }
  }

  // --- Music ducking ---

  private duckMusic(): void {
    if (this.isDucked || !this.musicGain || !this.ctx) return;
    this.isDucked = true;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(this.musicDuckedVolume, now + 0.3);
  }

  private unduckMusic(): void {
    if (!this.isDucked || !this.musicGain || !this.ctx) return;
    this.isDucked = false;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(this.musicNormalVolume, now + 0.5);
  }

  // ============================================================
  // Volume / mute controls
  // ============================================================

  setMusicVolume(volume: number): void {
    this.state.musicVolume = Math.max(0, Math.min(1, volume));
    this.musicNormalVolume = this.state.musicVolume;
    if (this.musicGain && !this.isDucked) {
      this.musicGain.gain.value = this.state.musicVolume;
    }
  }

  setSfxVolume(volume: number): void {
    this.state.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.state.sfxVolume;
    }
  }

  setVoiceVolume(volume: number): void {
    this.state.voiceVolume = Math.max(0, Math.min(1, volume));
    if (this.voiceGain) {
      this.voiceGain.gain.value = this.state.voiceVolume;
    }
  }

  mute(): void {
    this.state.muted = true;
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
  }

  unmute(): void {
    this.state.muted = false;
    if (this.masterGain) {
      this.masterGain.gain.value = 1;
    }
  }

  toggleMute(): void {
    if (this.state.muted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  isMuted(): boolean {
    return this.state.muted;
  }

  /**
   * Stop all audio playback.
   */
  stopAll(): void {
    this.stopVoice();
    this.stopMusic();
    // SFX are fire-and-forget; they'll stop on their own.
  }

  /**
   * Clean up the AudioContext. Call when the game unmounts.
   */
  async dispose(): Promise<void> {
    this.stopAll();
    this.bufferCache.clear();
    this.loadingPromises.clear();
    if (this.ctx) {
      await this.ctx.close();
      this.ctx = null;
    }
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
```

---

### Phase 5: Phaser Audio Bridge

**File to create:** `src/game/audio-bridge.ts`

**Purpose:** Connects Phaser game events to the Audio Manager. The game scene emits typed events; the bridge listens and triggers appropriate audio.

**Steps:**
1. Define the AudioEvent interface (shared with orchestrator plan)
2. Create an event emitter bridge between Phaser and AudioManager
3. Handle event-to-audio mapping with priority rules
4. Wire up in the Boot scene

**Acceptance criteria:**
- [ ] Game scenes emit AudioEvents via the bridge
- [ ] Bridge maps events to correct AudioManager calls
- [ ] Concurrent sound handling works (SFX over music, voice over everything)
- [ ] Bridge can be initialized/destroyed with game lifecycle

**Full code:**

```typescript
// ABOUTME: Bridges Phaser game events to the AudioManager for sound playback.
// ABOUTME: Maps game actions (correct answer, brick placement, etc.) to audio calls.

import Phaser from 'phaser';
import { audioManager } from '../lib/audio/manager';
import type { Locale, FeedbackId, InstructionId, LevelMessageId, SfxName } from '../lib/audio/tts-map';

// ============================================================
// Audio event types (shared interface from orchestrator plan)
// ============================================================

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

// ============================================================
// Audio Bridge
// ============================================================

export const AUDIO_EVENT = 'audio-event';

/**
 * Set up the audio bridge on a Phaser game instance.
 * Call this once during game initialization (e.g., in the Boot scene).
 */
export function initAudioBridge(game: Phaser.Game): void {
  // Resume AudioContext on first user interaction
  game.canvas.addEventListener('pointerdown', () => {
    audioManager.resumeContext();
  }, { once: true });

  // Listen for audio events from any scene
  game.events.on(AUDIO_EVENT, handleAudioEvent);
}

/**
 * Clean up the audio bridge. Call when the game is destroyed.
 */
export function destroyAudioBridge(game: Phaser.Game): void {
  game.events.off(AUDIO_EVENT, handleAudioEvent);
}

/**
 * Emit an audio event from a Phaser scene.
 * Convenience function so scenes don't need to know the event name.
 */
export function emitAudio(scene: Phaser.Scene, event: AudioEvent): void {
  scene.game.events.emit(AUDIO_EVENT, event);
}

// ============================================================
// Event handler
// ============================================================

async function handleAudioEvent(event: AudioEvent): Promise<void> {
  switch (event.type) {
    case 'question_read':
      if (event.factorA != null && event.factorB != null) {
        await audioManager.playQuestion(event.factorA, event.factorB, event.locale);
      }
      break;

    case 'correct':
      // Play SFX immediately, then voice feedback
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

    case 'brick_place':
      await audioManager.playSFX('brick-place');
      break;

    case 'brick_crumble':
      await audioManager.playSFX('brick-crumble');
      break;

    case 'celebration':
      await audioManager.playSFX('celebration');
      break;

    case 'button_tap':
      await audioManager.playSFX('button-tap');
      break;

    case 'drag_pickup':
      await audioManager.playSFX('drag-pickup');
      break;

    case 'drag_drop':
      await audioManager.playSFX('drag-drop');
      break;

    case 'session_end':
      audioManager.stopMusic();
      await audioManager.playSFX('session-end');
      await audioManager.playLevelMessage('session-end', event.locale);
      break;
  }
}
```

**Usage from a Phaser scene:**

```typescript
// In a Phaser scene:
import { emitAudio } from '../audio-bridge';

// When presenting a question:
emitAudio(this, {
  type: 'question_read',
  locale: 'he',
  factorA: 3,
  factorB: 5,
});

// When child answers correctly:
emitAudio(this, {
  type: 'correct',
  locale: 'he',
});

// When a brick is placed during the building animation:
emitAudio(this, {
  type: 'brick_place',
  locale: 'he',
});
```

---

### Phase 6: Sound Effects Specification & Sourcing

**No code files -- this is a specification for sourcing/generating SFX assets.**

All sound effects should be 8-bit/chiptune style to match the pixel art aesthetic.

**Steps:**
1. Generate each SFX using jsfxr (https://sfxr.me/) or download from freesound.org
2. Export as MP3, normalize volume, trim silence
3. Save to `public/assets/audio/sfx/`

**Acceptance criteria:**
- [ ] All 11 SFX files exist in `public/assets/audio/sfx/`
- [ ] All files are MP3 format
- [ ] All files sound 8-bit/chiptune
- [ ] All files are trimmed to specified durations
- [ ] Volume levels are normalized across all SFX

#### SFX Specifications

| File | Duration | Character | How to Create |
|------|----------|-----------|---------------|
| `brick-place.mp3` | ~0.3s | Satisfying percussive "click/clack" like a block snapping into place. Short attack, no sustain. Think Tetris piece landing but softer. | jsfxr: "Pick Up/Coin" preset, lower frequency, shorter duration. Or freesound.org search "8-bit click" or "retro snap". |
| `brick-crumble.mp3` | ~0.5s | Small crumble/break. A few pixels falling, not a huge explosion. Descending pitched noise burst. | jsfxr: "Explosion" preset, reduce duration to 0.5s, lower volume, add fast decay. |
| `correct.mp3` | ~0.5s | Happy ascending 3-note chime (e.g., C5-E5-G5 in 8-bit square wave). Bright and cheerful. The "ding!" that makes a kid smile. | jsfxr: "Power Up" preset, adjust to taste. Or compose in BeepBox: 3 ascending notes, square wave, fast tempo. |
| `wrong.mp3` | ~0.3s | Gentle descending two-note tone (e.g., E4-C4). NOT a harsh buzzer -- must feel like "oops" not "failure." Soft, round sound. | jsfxr: Use "Jump" preset reversed (descending), soften the waveform. Keep volume low. |
| `level-complete.mp3` | ~2s | Triumphant ascending fanfare. 4-6 notes building to a climax with a final sustained note. Think "stage clear" from classic platformers. | BeepBox or FamiTracker: Compose a short ascending melody with harmony. C4-E4-G4-C5 arpeggio with final chord. |
| `button-tap.mp3` | ~0.1s | Subtle UI click. Very short, barely noticeable. High-frequency blip. Should feel tactile, not musical. | jsfxr: "Blip/Select" preset, minimum duration, low volume. |
| `hint-reveal.mp3` | ~0.3s | Soft ascending "whoosh" or sparkle. Something appearing/revealing. Magical but subtle. | jsfxr: "Power Up" preset, add noise component, make it breathy. Or: fast ascending sine sweep with reverb. |
| `celebration.mp3` | ~3s | Extended celebration with rapid ascending arpeggios, maybe a little drum roll. The "you're awesome!" sound. Pairs with confetti animation. | BeepBox: Compose a celebratory phrase with fast arpeggios, snare roll, and a final major chord. Export and loop the roll section. |
| `session-end.mp3` | ~2s | Warm, satisfying completion. Like a music box winding down. Descending gentle arpeggio that resolves to a major chord. Feels like a soft "goodnight." | BeepBox: Descending major scale melody with triangle wave, ending on a held root note. Gentle, not abrupt. |
| `drag-pickup.mp3` | ~0.1s | Light "pop" or "pluck" when picking up a manipulative block. Quick, satisfying, not distracting during repeated drag operations. | jsfxr: "Pick Up/Coin" preset, very short, medium pitch. |
| `drag-drop.mp3` | ~0.1s | Snap/click when dropping a manipulative into place. Slightly different character from pickup -- more of a "lock in" feeling. Slightly lower pitch than pickup. | jsfxr: "Pick Up/Coin" preset, very short, lower pitch than drag-pickup. |

**Recommended workflow:**

1. Go to https://sfxr.me/ (browser-based, free, instant)
2. Use the preset buttons (Pick Up, Power Up, Explosion, etc.) as starting points
3. Tweak parameters (frequency, duration, waveform type)
4. Export each as WAV, then batch-convert to MP3 using ffmpeg:
   ```bash
   for f in *.wav; do ffmpeg -i "$f" -codec:a libmp3lame -b:a 128k "${f%.wav}.mp3"; done
   ```
5. Normalize volume levels:
   ```bash
   for f in *.mp3; do ffmpeg -i "$f" -filter:a loudnorm -y "norm-$f" && mv "norm-$f" "$f"; done
   ```

**Alternative sources:**
- **freesound.org** -- search "8-bit [sound type]", filter by Creative Commons 0 license
- **opengameart.org** -- search "retro SFX pack"
- **AI generation** -- ElevenLabs Sound Effects or Stability Audio can generate 8-bit SFX from text descriptions

---

### Phase 7: Background Music

**No code files -- specification for sourcing music.**

**Requirements:**
- 8-bit/chiptune style to match pixel art aesthetic
- Loopable (seamless loop point)
- 30-60 second loop duration
- Upbeat but not distracting -- should feel like background, not foreground
- Should not compete with voice for attention
- Major key, moderate tempo (~100-120 BPM)
- Avoid harsh or sudden sounds that could startle a 6-year-old

**Save to:** `public/assets/audio/music/game-loop.mp3`

**Acceptance criteria:**
- [ ] MP3 file exists at the correct path
- [ ] Loops seamlessly (no click or gap at loop point)
- [ ] 30-60 seconds in duration
- [ ] Sounds 8-bit/chiptune
- [ ] Pleasant and non-distracting at low volume

**Sourcing options (in order of recommendation):**

1. **BeepBox** (https://www.beepbox.co/) -- Free browser-based chiptune composer
   - Select "Retro" preset instrument set
   - Use 2-3 channels: lead melody (square wave), bass (triangle wave), percussion (noise)
   - Keep the melody simple and repetitive
   - Export as WAV, convert to MP3
   - This is the best option for a custom, unique sound

2. **FamiTracker** (http://famitracker.com/) -- NES-style music tracker
   - More advanced but produces authentic NES audio
   - Good if Danny wants that specific retro console sound

3. **Suno AI** or **Udio** -- AI music generators
   - Prompt: "8-bit chiptune, happy, upbeat, children's game background music, loopable, major key, moderate tempo"
   - Generate several candidates, pick the best
   - Verify the license allows commercial use

4. **opengameart.org** -- search "chiptune loop" or "8-bit background music"
   - Filter by CC0 or CC-BY license
   - Good candidates: search for "puzzle game" or "platformer" music

**Music composition guidelines (if composing in BeepBox):**

```
Tempo: 110 BPM
Key: C Major
Instruments:
  Channel 1 (Lead): Square wave, staccato, simple melody
  Channel 2 (Bass): Triangle wave, quarter notes following root
  Channel 3 (Harmony): Square wave (quieter), simple counter-melody or held chords
  Channel 4 (Drums): Noise channel, kick on 1&3, hi-hat on every beat

Structure:
  4 bars: Main melody (A section)
  4 bars: Variation (B section)
  Loop back to A

Keep it SIMPLE. The music should be forgettable in the best way --
pleasant background that doesn't demand attention.
```

---

### Phase 8: Audio Settings Integration

**File to modify:** `src/stores/settings.ts` (created by Foundation agent)

**Purpose:** Persist audio preferences (mute state, volume levels) in the Zustand settings store, synced with AudioManager.

**Steps:**
1. Add audio state to the settings store
2. Sync settings store changes to AudioManager
3. Persist to localStorage

**Acceptance criteria:**
- [ ] Mute state persists across sessions
- [ ] Volume levels persist across sessions
- [ ] Settings store drives AudioManager state

**Code to add to the settings store (Foundation agent creates the file; this is the audio-specific addition):**

```typescript
// Audio-specific state to add to the settings store.
// The Foundation agent creates src/stores/settings.ts with language/theme settings.
// This audio slice should be merged in.

import { audioManager } from '../lib/audio/manager';

interface AudioSettings {
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  muted: boolean;
}

// Default audio settings
const DEFAULT_AUDIO: AudioSettings = {
  musicVolume: 0.15,
  sfxVolume: 0.7,
  voiceVolume: 1.0,
  muted: false,
};

// Add these actions to the settings store:

// setMusicVolume: (volume: number) => {
//   set({ musicVolume: volume });
//   audioManager.setMusicVolume(volume);
// },
//
// setSfxVolume: (volume: number) => {
//   set({ sfxVolume: volume });
//   audioManager.setSfxVolume(volume);
// },
//
// setVoiceVolume: (volume: number) => {
//   set({ voiceVolume: volume });
//   audioManager.setVoiceVolume(volume);
// },
//
// toggleMute: () => {
//   const muted = !get().muted;
//   set({ muted });
//   if (muted) audioManager.mute();
//   else audioManager.unmute();
// },

// On store initialization, sync saved settings to AudioManager:
// audioManager.setMusicVolume(savedState.musicVolume);
// audioManager.setSfxVolume(savedState.sfxVolume);
// audioManager.setVoiceVolume(savedState.voiceVolume);
// if (savedState.muted) audioManager.mute();
```

---

## Testing Strategy

### Unit Tests

1. **TTS Map tests** (`src/lib/audio/__tests__/tts-map.test.ts`)
   - `getQuestionAudioPath(3, 5, 'he')` returns `/assets/audio/tts/he/questions/q-3x5.mp3`
   - `getQuestionAudioPath(5, 3, 'he')` returns same path (canonical ordering)
   - `getQuestionAudioPath(0, 0, 'en')` returns `/assets/audio/tts/en/questions/q-0x0.mp3`
   - All feedback/instruction/level IDs produce valid paths
   - `randomCorrectFeedbackId()` returns a valid FeedbackId
   - `getNumberAudioPath(42, 'he', 'feminine')` returns correct path
   - `getNumberAudioPath(42, 'en')` has no gender suffix

2. **TTS Manifest tests** (run the generator script and validate output)
   - Manifest has expected number of entries (~550-650)
   - All 66 canonical facts have Hebrew entries
   - All 66 canonical facts have English entries
   - No duplicate IDs
   - All file paths are unique
   - Hebrew question text contains "פעמים" (times)
   - English question text contains "times"

3. **Audio Manager tests** (with mocked Web Audio API)
   - `init()` creates AudioContext and gain nodes
   - `mute()` sets masterGain to 0
   - `unmute()` sets masterGain to 1
   - `setMusicVolume()` clamps to 0-1 range
   - `preload()` caches buffers
   - `stopAll()` stops voice and music sources

### Integration Tests

4. **Audio Bridge tests**
   - Emitting `{ type: 'correct', locale: 'he' }` calls `audioManager.playSFX('correct')` and `audioManager.playCorrectFeedback('he')`
   - Emitting `{ type: 'question_read', factorA: 3, factorB: 5, locale: 'en' }` calls `audioManager.playQuestion(3, 5, 'en')`

### Manual Testing

5. **TTS quality review**
   - Danny listens to every Hebrew clip and flags unnatural pronunciation
   - Verify all questions are read with correct intonation
   - Verify number words match expected pronunciation
   - Check that feedback phrases sound warm and encouraging (not robotic)

6. **Browser autoplay testing**
   - Verify audio resumes after first tap on Chrome, Firefox, Safari
   - Verify no console errors about autoplay policy
   - Test on Android Chrome (primary mobile target)

7. **Music ducking test**
   - Start music, then trigger a question read
   - Verify music fades down smoothly during voice
   - Verify music fades back up after voice ends
   - Verify rapid question reads don't cause volume glitches

## Risks & Considerations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Hebrew TTS pronunciation quality | Medium | Danny reviews every clip. Regenerate bad ones with different voice settings or provider. |
| Hebrew number gender forms wrong | Medium | The lookup table uses feminine forms for the "times" context. Danny must review since Hebrew gender agreement is nuanced. |
| Browser autoplay policy blocks audio | Low | AudioContext resume on first user gesture. Well-tested pattern. |
| Web Audio API not available | Very Low | Supported in all modern browsers. No fallback needed. |
| TTS API cost overrun | Low | ~600 clips at ~10 chars each = ~6,000 chars. ElevenLabs free tier: 10,000 chars/month. May need paid tier (~$5). Azure: first 500K chars/month free. |
| SFX quality inconsistency | Low | Use jsfxr for all SFX (same tool = consistent aesthetic). Normalize volume with ffmpeg. |
| Large audio payload | Low | ~5MB total for all audio. Preload only current level (~500KB). Lazy load rest. |
| Music loop gap | Low | Carefully trim the loop point. Test in Web Audio API (it handles looping natively). |

## Estimated Complexity

| Phase | Effort | Notes |
|-------|--------|-------|
| Phase 1: TTS Script Generator | Small | Pure data, no API calls. The Hebrew number table is the main work. |
| Phase 2: TTS Batch Generator | Medium | API integration, rate limiting, error handling. |
| Phase 3: TTS Map | Small | Simple path-building functions. |
| Phase 4: Audio Manager | Medium | Web Audio API, music ducking, autoplay handling. Core audio logic. |
| Phase 5: Audio Bridge | Small | Event mapping, straightforward. |
| Phase 6: Sound Effects | Medium | Creative work: generating/sourcing 11 SFX files. |
| Phase 7: Background Music | Medium | Creative work: composing or sourcing a music loop. |
| Phase 8: Settings Integration | Small | Wire Zustand to AudioManager. |

**Total estimated effort:** ~2-3 focused implementation sessions.

**Dependencies:**
- Foundation agent must create the project scaffold first (Phase 1-2 scripts can be written independently)
- Danny must provide a TTS API key before Phase 2 can run
- Danny must review Hebrew TTS output before shipping
- Game Engine agent must emit AudioEvents for the bridge to work (Phase 5)

## File Summary

| File | Phase | Description |
|------|-------|-------------|
| `scripts/generate-tts-scripts.ts` | 1 | Generates the TTS manifest JSON with all phrases |
| `scripts/tts-manifest.json` | 1 | Output: complete list of every phrase to generate |
| `scripts/generate-tts-audio.ts` | 2 | Batch calls TTS API to generate MP3 files |
| `src/lib/audio/tts-map.ts` | 3 | Maps game concepts to audio file paths |
| `src/lib/audio/manager.ts` | 4 | Web Audio API playback manager |
| `src/game/audio-bridge.ts` | 5 | Connects Phaser events to AudioManager |
| `public/assets/audio/sfx/*.mp3` | 6 | 11 sound effect files |
| `public/assets/audio/music/game-loop.mp3` | 7 | Background music loop |
| `src/stores/settings.ts` (audio additions) | 8 | Audio settings in Zustand |

## Open Items for Danny

1. **Hebrew gender review**: The question format uses feminine forms for both numbers in "כמה זה X פעמים Y". Danny should confirm this is natural for a child-directed context.
2. **TTS voice selection**: Danny should listen to ElevenLabs voice library and Azure he-IL-HilaNeural / he-IL-AvriNeural to pick the voice that sounds best for talking to a 6-year-old girl.
3. **Feedback phrasing**: The Hebrew feedback phrases (e.g., "נסי שוב" uses feminine imperative) assume a girl player. If the game should support boys too, we need masculine forms ("נסה שוב") and the manifest generator should produce both, keyed to the kid profile's gender.
4. **SFX approval**: Danny should hear the generated SFX and approve the aesthetic before integration.
