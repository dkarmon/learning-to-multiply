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

type AudioChannel = 'voice' | 'sfx' | 'music';

class AudioManager {
  private ctx: AudioContext | null = null;
  private bufferCache = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<string, Promise<AudioBuffer | null>>();

  private masterGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private currentVoiceSource: AudioBufferSourceNode | null = null;
  private currentMusicSource: AudioBufferSourceNode | null = null;

  private musicNormalVolume = 0.15;
  private musicDuckedVolume = 0.03;
  private isDucked = false;

  private musicVolume = 0.15;
  private sfxVolume = 0.7;
  private voiceVolume = 1.0;
  private muted = false;

  private contextResumed = false;

  init(): void {
    if (this.ctx) return;

    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.voiceGain = this.ctx.createGain();
    this.voiceGain.connect(this.masterGain);
    this.voiceGain.gain.value = this.voiceVolume;

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);
    this.sfxGain.gain.value = this.sfxVolume;

    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);
    this.musicGain.gain.value = this.musicVolume;
  }

  async resumeContext(): Promise<void> {
    if (!this.ctx) this.init();
    if (this.ctx!.state === 'suspended') {
      await this.ctx!.resume();
    }
    this.contextResumed = true;
  }

  isContextResumed(): boolean {
    return this.contextResumed;
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) this.init();
    return this.ctx!;
  }

  private async loadBuffer(filePath: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(filePath)) {
      return this.bufferCache.get(filePath)!;
    }

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

  async preload(filePaths: string[]): Promise<void> {
    await Promise.all(filePaths.map(p => this.loadBuffer(p)));
  }

  async preloadForLevel(
    facts: Array<{ factorA: number; factorB: number }>,
    locale: Locale,
  ): Promise<void> {
    const paths: string[] = [];

    for (const fact of facts) {
      paths.push(getQuestionAudioPath(fact.factorA, fact.factorB, locale));
    }

    const sfxNames: SfxName[] = [
      'brick-place', 'correct', 'wrong', 'button-tap',
      'level-complete', 'hint-reveal', 'drag-pickup', 'drag-drop',
    ];
    for (const name of sfxNames) {
      paths.push(getSfxPath(name));
    }

    const feedbackIds: FeedbackId[] = [
      'correct-1', 'correct-2', 'correct-3',
      'wrong-1', 'wrong-2', 'wrong-3',
    ];
    for (const id of feedbackIds) {
      paths.push(getFeedbackAudioPath(id, locale));
    }

    await this.preload(paths);
  }

  private async playBuffer(
    filePath: string,
    channel: AudioChannel,
    loop = false,
  ): Promise<AudioBufferSourceNode | null> {
    if (this.muted) return null;

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

  async playQuestion(factorA: number, factorB: number, locale: Locale): Promise<void> {
    const path = getQuestionAudioPath(factorA, factorB, locale);
    await this.playVoice(path);
  }

  async playFeedback(feedbackId: FeedbackId, locale: Locale): Promise<void> {
    const path = getFeedbackAudioPath(feedbackId, locale);
    await this.playVoice(path);
  }

  async playCorrectFeedback(locale: Locale): Promise<void> {
    await this.playFeedback(randomCorrectFeedbackId(), locale);
  }

  async playWrongFeedback(locale: Locale): Promise<void> {
    await this.playFeedback(randomWrongFeedbackId(), locale);
  }

  async playInstruction(instructionId: InstructionId, locale: Locale): Promise<void> {
    const path = getInstructionAudioPath(instructionId, locale);
    await this.playVoice(path);
  }

  async playLevelMessage(messageId: LevelMessageId, locale: Locale): Promise<void> {
    const path = getLevelAudioPath(messageId, locale);
    await this.playVoice(path);
  }

  private async playVoice(filePath: string): Promise<void> {
    this.stopVoice();
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

  async playSFX(name: SfxName): Promise<void> {
    const path = getSfxPath(name);
    await this.playBuffer(path, 'sfx');
  }

  async playMusic(): Promise<void> {
    this.stopMusic();
    const path = getMusicPath();
    const source = await this.playBuffer(path, 'music', true);
    if (source) {
      this.currentMusicSource = source;
    }
  }

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

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.musicNormalVolume = this.musicVolume;
    if (this.musicGain && !this.isDucked) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  setVoiceVolume(volume: number): void {
    this.voiceVolume = Math.max(0, Math.min(1, volume));
    if (this.voiceGain) {
      this.voiceGain.gain.value = this.voiceVolume;
    }
  }

  mute(): void {
    this.muted = true;
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
  }

  unmute(): void {
    this.muted = false;
    if (this.masterGain) {
      this.masterGain.gain.value = 1;
    }
  }

  toggleMute(): void {
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  stopAll(): void {
    this.stopVoice();
    this.stopMusic();
  }

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

export const audioManager = new AudioManager();
