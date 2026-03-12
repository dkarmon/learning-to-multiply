// ABOUTME: Defines all sound effect keys, their file paths, and descriptive metadata.
// ABOUTME: Single source of truth for SFX assets used by the audio manager.

import type { SfxName } from './tts-map';
import { getSfxPath } from './tts-map';

interface SfxDefinition {
  name: SfxName;
  path: string;
  durationMs: number;
}

export const SFX: Record<SfxName, SfxDefinition> = {
  'brick-place':    { name: 'brick-place',    path: getSfxPath('brick-place'),    durationMs: 300 },
  'brick-crumble':  { name: 'brick-crumble',  path: getSfxPath('brick-crumble'),  durationMs: 500 },
  'correct':        { name: 'correct',        path: getSfxPath('correct'),        durationMs: 500 },
  'wrong':          { name: 'wrong',          path: getSfxPath('wrong'),          durationMs: 300 },
  'level-complete': { name: 'level-complete', path: getSfxPath('level-complete'), durationMs: 2000 },
  'button-tap':     { name: 'button-tap',     path: getSfxPath('button-tap'),     durationMs: 100 },
  'hint-reveal':    { name: 'hint-reveal',    path: getSfxPath('hint-reveal'),    durationMs: 300 },
  'celebration':    { name: 'celebration',    path: getSfxPath('celebration'),    durationMs: 3000 },
  'session-end':    { name: 'session-end',    path: getSfxPath('session-end'),    durationMs: 2000 },
  'drag-pickup':    { name: 'drag-pickup',    path: getSfxPath('drag-pickup'),    durationMs: 100 },
  'drag-drop':      { name: 'drag-drop',      path: getSfxPath('drag-drop'),      durationMs: 100 },
};

export const ALL_SFX_NAMES: SfxName[] = Object.keys(SFX) as SfxName[];

export const ALL_SFX_PATHS: string[] = ALL_SFX_NAMES.map((name) => SFX[name].path);
