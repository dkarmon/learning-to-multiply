// ABOUTME: Generates all pixel art assets for the multiplication learning game.
// ABOUTME: Uses node-canvas to programmatically draw characters, tiles, UI, and backgrounds as PNGs.

import { createCanvas, type Canvas, type CanvasRenderingContext2D } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SPRITES_DIR = join(import.meta.dirname, '..', 'public', 'assets', 'sprites');
const TILES_DIR = join(import.meta.dirname, '..', 'public', 'assets', 'tiles');

mkdirSync(SPRITES_DIR, { recursive: true });
mkdirSync(TILES_DIR, { recursive: true });

type AtlasFrames = Record<string, { frame: { x: number; y: number; w: number; h: number }; sourceSize: { w: number; h: number } }>;

function saveCanvas(canvas: Canvas, dir: string, filename: string) {
  writeFileSync(join(dir, filename), canvas.toBuffer('image/png'));
  console.log(`  Created ${filename}`);
}

function saveAtlas(frames: AtlasFrames, dir: string, filename: string) {
  writeFileSync(join(dir, filename), JSON.stringify({ frames }, null, 2));
  console.log(`  Created ${filename}`);
}

// ─── Pixel drawing helpers ─────────────────────────────────────────────

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function circle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy <= r * r) {
        ctx.fillRect(cx + dx, cy + dy, 1, 1);
      }
    }
  }
}

function outline(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const dist = dx * dx + dy * dy;
      if (dist <= r * r && dist >= (r - 1.5) * (r - 1.5)) {
        ctx.fillRect(cx + dx, cy + dy, 1, 1);
      }
    }
  }
}

function drawEyes(ctx: CanvasRenderingContext2D, lx: number, ly: number, rx: number, ry: number, size: number, pupilOffset = 0) {
  // White
  circle(ctx, lx, ly, size, '#FFFFFF');
  circle(ctx, rx, ry, size, '#FFFFFF');
  // Pupil
  const ps = Math.max(1, size - 1);
  circle(ctx, lx + pupilOffset, ly, ps, '#1A1A1A');
  circle(ctx, rx + pupilOffset, ry, ps, '#1A1A1A');
  // Highlight
  if (size >= 2) {
    px(ctx, lx - 1, ly - 1, 1, 1, '#FFFFFF');
    px(ctx, rx - 1, ry - 1, 1, 1, '#FFFFFF');
  }
}

function drawSmile(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
  ctx.fillStyle = '#3E2723';
  for (let i = 0; i < width; i++) {
    const row = (i === 0 || i === width - 1) ? 0 : 1;
    px(ctx, x + i, y + row, 1, 1, '#3E2723');
  }
}

function drawFrown(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
  ctx.fillStyle = '#3E2723';
  for (let i = 0; i < width; i++) {
    const row = (i === 0 || i === width - 1) ? 1 : 0;
    px(ctx, x + i, y + row, 1, 1, '#3E2723');
  }
}

// ─── Grux (Wrecker) ──────────────────────────────────────────────────

function drawGruxBase(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number, anim: string) {
  const OL = '#3E2723';
  const SKIN = '#FFCCBC';
  const SKIN_S = '#FFAB91';
  const BODY = '#FF6F00';
  const BODY_S = '#E65100';
  const HAT = '#FFC107';
  const HAT_H = '#FFD54F';

  let headY = 0;
  let bodyY = 0;
  let armLY = 0;
  let armRY = 0;
  let armLX = 0;
  let armRX = 0;
  let legSpread = 0;
  let squash = 0;
  let mouthType: 'smile' | 'frown' | 'open' = 'smile';
  let eyeOffsetX = 0;
  let dustFrame = -1;
  let waveArmY = 0;

  if (anim === 'idle') {
    headY = frame === 1 || frame === 2 ? -1 : 0;
    bodyY = frame === 2 ? -1 : 0;
  } else if (anim === 'happy') {
    if (frame <= 1) { armLX = -2; armRX = 2; }
    if (frame === 2 || frame === 3) { headY = -3; bodyY = -2; armLY = -2; armRY = -2; armLX = -4; armRX = 4; }
    if (frame === 4) { squash = 1; bodyY = 1; }
    if (frame === 5) { squash = 0; }
    mouthType = 'open';
  } else if (anim === 'frustrated') {
    mouthType = 'frown';
    if (frame === 2 || frame === 3) { bodyY = 1; legSpread = 1; }
    if (frame >= 3) { dustFrame = frame - 3; }
    eyeOffsetX = 0;
  } else if (anim === 'climbing') {
    const climb = frame % 4;
    armLY = climb < 2 ? -4 : 0;
    armRY = climb >= 2 ? -4 : 0;
    bodyY = climb === 1 || climb === 3 ? -1 : 0;
    headY = bodyY;
  } else if (anim === 'waving') {
    waveArmY = frame === 0 ? 0 : frame === 1 ? -4 : frame === 2 ? -6 : -4;
  }

  const bx = ox + 16;
  const by = oy + 8 + headY;

  // Hard hat
  px(ctx, bx + 6, by + 2, 20, 3, HAT);
  px(ctx, bx + 4, by + 5, 24, 3, HAT);
  px(ctx, bx + 8, by + 1, 16, 2, HAT_H);
  px(ctx, bx + 3, by + 7, 26, 2, HAT); // brim

  // Head (round)
  const hy = by + 9;
  px(ctx, bx + 5, hy, 22, 16, SKIN);
  px(ctx, bx + 7, hy - 1, 18, 1, SKIN);
  px(ctx, bx + 7, hy + 16, 18, 1, SKIN);
  // Head shadow
  px(ctx, bx + 5, hy + 12, 22, 4, SKIN_S);

  // Outline head
  px(ctx, bx + 4, hy, 1, 16, OL);
  px(ctx, bx + 27, hy, 1, 16, OL);
  px(ctx, bx + 5, hy - 2, 22, 1, OL);
  px(ctx, bx + 5, hy + 17, 22, 1, OL);

  // Eyes
  drawEyes(ctx, bx + 11, hy + 6 + eyeOffsetX, bx + 21, hy + 6 + eyeOffsetX, 3, eyeOffsetX);

  // Eyebrows for frustrated
  if (anim === 'frustrated') {
    px(ctx, bx + 8, hy + 2, 5, 1, OL);
    px(ctx, bx + 9, hy + 3, 4, 1, OL);
    px(ctx, bx + 19, hy + 2, 5, 1, OL);
    px(ctx, bx + 19, hy + 3, 4, 1, OL);
  }

  // Mouth
  if (mouthType === 'smile') {
    drawSmile(ctx, bx + 12, hy + 11, 8);
  } else if (mouthType === 'frown') {
    drawFrown(ctx, bx + 12, hy + 12, 8);
  } else {
    circle(ctx, bx + 16, hy + 12, 2, OL);
  }

  // Body (overalls)
  const bodyTop = hy + 18 + bodyY;
  px(ctx, bx + 7, bodyTop, 18, 14 + squash, BODY);
  px(ctx, bx + 7, bodyTop + 8, 18, 6 + squash, BODY_S);
  // Suspender straps
  px(ctx, bx + 9, bodyTop, 2, 6, HAT);
  px(ctx, bx + 21, bodyTop, 2, 6, HAT);
  // Pocket
  px(ctx, bx + 12, bodyTop + 7, 8, 4, BODY_S);
  px(ctx, bx + 13, bodyTop + 8, 6, 2, BODY);

  // Arms
  const armTop = bodyTop + 2;
  // Left arm
  px(ctx, bx + 2 + armLX, armTop + armLY, 5, 10, SKIN);
  px(ctx, bx + 1 + armLX, armTop + armLY, 1, 10, OL);
  // Right arm
  if (anim === 'waving') {
    px(ctx, bx + 25, armTop + waveArmY, 5, 10, SKIN);
    px(ctx, bx + 30, armTop + waveArmY, 1, 10, OL);
    // Hand
    px(ctx, bx + 25, armTop + waveArmY, 5, 3, SKIN);
  } else {
    px(ctx, bx + 25 + armRX, armTop + armRY, 5, 10, SKIN);
    px(ctx, bx + 30 + armRX, armTop + armRY, 1, 10, OL);
  }

  // Legs
  const legTop = bodyTop + 14 + squash;
  px(ctx, bx + 8 - legSpread, legTop, 6, 8, BODY);
  px(ctx, bx + 18 + legSpread, legTop, 6, 8, BODY);
  // Shoes
  px(ctx, bx + 7 - legSpread, legTop + 8, 8, 3, '#5D4037');
  px(ctx, bx + 17 + legSpread, legTop + 8, 8, 3, '#5D4037');

  // Dust puffs
  if (dustFrame >= 0 && dustFrame <= 2) {
    const alpha = 1 - dustFrame * 0.3;
    ctx.globalAlpha = alpha;
    circle(ctx, bx + 4, legTop + 10, 3 + dustFrame, '#D7CCC8');
    circle(ctx, bx + 28, legTop + 10, 3 + dustFrame, '#D7CCC8');
    ctx.globalAlpha = 1;
  }
}

function generateWrecker(): { canvas: Canvas; atlas: AtlasFrames } {
  const canvas = createCanvas(384, 320);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const atlas: AtlasFrames = {};
  const anims = ['idle', 'happy', 'frustrated', 'climbing', 'waving'];
  const frameCounts = [4, 6, 6, 6, 4];

  for (let row = 0; row < anims.length; row++) {
    for (let col = 0; col < frameCounts[row]; col++) {
      drawGruxBase(ctx, col * 64, row * 64, col, anims[row]);
      atlas[`wrecker-${anims[row]}-${col}`] = {
        frame: { x: col * 64, y: row * 64, w: 64, h: 64 },
        sourceSize: { w: 64, h: 64 },
      };
    }
  }

  return { canvas, atlas };
}

// ─── Zippy (Sidekick) ────────────────────────────────────────────────

function drawZippyBase(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number, anim: string) {
  const OL = '#3E2723';
  const SKIN = '#FFE0B2';
  const SKIN_S = '#FFCC80';
  const HAIR = '#009688';
  const HOODIE = '#4CAF50';
  const HOODIE_S = '#388E3C';
  const GOGGLES = '#FF9800';
  const SHOES = '#F44336';

  let headY = 0;
  let bodyY = 0;
  let jumpY = 0;
  let armLY = 0;
  let armRY = 0;
  let armAngle = 0;
  let legFrame = 0;
  let peekMode = false;

  if (anim === 'idle') {
    jumpY = frame === 1 || frame === 2 ? -1 : 0;
    headY = frame === 2 ? 1 : 0;
  } else if (anim === 'cheering') {
    if (frame === 1 || frame === 2) { jumpY = -4; armAngle = 1; }
    if (frame === 2) { jumpY = -6; }
    if (frame === 3) { jumpY = -1; }
  } else if (anim === 'peeking') {
    peekMode = true;
  } else if (anim === 'running') {
    legFrame = frame % 6;
    bodyY = legFrame % 2 === 0 ? 0 : -1;
    headY = bodyY;
  }

  const bx = ox + 12;
  const by = oy + 6 + jumpY;

  if (peekMode) {
    // Only top half visible
    const py = oy + 32;
    // Hair spikes
    px(ctx, bx + 8, py, 4, 4, HAIR);
    px(ctx, bx + 14, py - 2, 3, 6, HAIR);
    px(ctx, bx + 19, py + 1, 4, 3, HAIR);
    // Head
    px(ctx, bx + 6, py + 4, 20, 14, SKIN);
    px(ctx, bx + 5, py + 6, 1, 10, OL);
    px(ctx, bx + 26, py + 6, 1, 10, OL);
    // Goggles
    px(ctx, bx + 7, py + 7, 8, 5, GOGGLES);
    px(ctx, bx + 17, py + 7, 8, 5, GOGGLES);
    px(ctx, bx + 15, py + 8, 2, 3, GOGGLES);
    // Goggle lenses
    px(ctx, bx + 8, py + 8, 6, 3, '#E3F2FD');
    px(ctx, bx + 18, py + 8, 6, 3, '#E3F2FD');
    // Eyes behind goggles
    px(ctx, bx + 10, py + 9, 2, 2, '#1A1A1A');
    px(ctx, bx + 20, py + 9, 2, 2, '#1A1A1A');
    // Animate: slight bob
    const bobY = frame === 1 || frame === 3 ? -1 : 0;
    if (bobY !== 0) {
      // Redraw shifted (simplified)
    }
    return;
  }

  // Spiky hair
  px(ctx, bx + 8, by + headY, 4, 5, HAIR);
  px(ctx, bx + 13, by - 3 + headY, 3, 8, HAIR);
  px(ctx, bx + 18, by - 1 + headY, 4, 6, HAIR);
  px(ctx, bx + 22, by + 1 + headY, 3, 4, HAIR);

  // Head
  const hy = by + 5 + headY;
  px(ctx, bx + 6, hy, 20, 14, SKIN);
  px(ctx, bx + 8, hy - 1, 16, 1, SKIN);
  px(ctx, bx + 8, hy + 14, 16, 1, SKIN_S);

  // Outline head
  px(ctx, bx + 5, hy, 1, 14, OL);
  px(ctx, bx + 26, hy, 1, 14, OL);

  // Goggles on forehead
  px(ctx, bx + 7, hy + 1, 8, 4, GOGGLES);
  px(ctx, bx + 17, hy + 1, 8, 4, GOGGLES);
  px(ctx, bx + 15, hy + 2, 2, 2, GOGGLES);
  // Lenses
  px(ctx, bx + 8, hy + 2, 6, 2, '#E3F2FD');
  px(ctx, bx + 18, hy + 2, 6, 2, '#E3F2FD');

  // Eyes
  drawEyes(ctx, bx + 11, hy + 7, bx + 21, hy + 7, 2);

  // Big grin
  drawSmile(ctx, bx + 11, hy + 10, 10);

  // Hoodie body
  const bt = hy + 15 + bodyY;
  px(ctx, bx + 8, bt, 16, 12, HOODIE);
  px(ctx, bx + 8, bt + 7, 16, 5, HOODIE_S);
  // Lightning bolt on chest
  px(ctx, bx + 14, bt + 2, 2, 1, '#FFFFFF');
  px(ctx, bx + 13, bt + 3, 2, 1, '#FFFFFF');
  px(ctx, bx + 12, bt + 4, 3, 1, '#FFFFFF');
  px(ctx, bx + 13, bt + 5, 2, 1, '#FFFFFF');
  px(ctx, bx + 14, bt + 6, 2, 1, '#FFFFFF');

  // Arms
  if (armAngle === 1) {
    // V shape arms for cheering
    px(ctx, bx + 2, bt - 4 + armLY, 4, 8, HOODIE);
    px(ctx, bx + 2, bt - 4, 4, 3, SKIN);
    px(ctx, bx + 26, bt - 4 + armRY, 4, 8, HOODIE);
    px(ctx, bx + 26, bt - 4, 4, 3, SKIN);
  } else {
    px(ctx, bx + 3, bt + 1, 4, 8, HOODIE);
    px(ctx, bx + 3, bt + 7, 4, 3, SKIN);
    px(ctx, bx + 25, bt + 1, 4, 8, HOODIE);
    px(ctx, bx + 25, bt + 7, 4, 3, SKIN);
  }

  // Legs (running animation)
  const lt = bt + 12;
  if (anim === 'running') {
    const offsets = [
      [0, 0, 4, 0], [-2, -1, 6, 1], [-4, 0, 4, -1],
      [0, 0, -4, 0], [2, 1, -6, -1], [4, 0, -4, 1],
    ];
    const [llx, lly, rlx, rly] = offsets[legFrame];
    px(ctx, bx + 9 + llx, lt + lly, 5, 7, '#546E7A');
    px(ctx, bx + 18 + rlx, lt + rly, 5, 7, '#546E7A');
    px(ctx, bx + 8 + llx, lt + 7 + lly, 7, 3, SHOES);
    px(ctx, bx + 17 + rlx, lt + 7 + rly, 7, 3, SHOES);
  } else {
    px(ctx, bx + 9, lt, 5, 7, '#546E7A');
    px(ctx, bx + 18, lt, 5, 7, '#546E7A');
    px(ctx, bx + 8, lt + 7, 7, 3, SHOES);
    px(ctx, bx + 17, lt + 7, 7, 3, SHOES);
  }
}

function generateSidekick(): { canvas: Canvas; atlas: AtlasFrames } {
  const canvas = createCanvas(384, 256);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const atlas: AtlasFrames = {};
  const anims = ['idle', 'cheering', 'peeking', 'running'];
  const frameCounts = [4, 4, 4, 6];

  for (let row = 0; row < anims.length; row++) {
    for (let col = 0; col < frameCounts[row]; col++) {
      drawZippyBase(ctx, col * 64, row * 64, col, anims[row]);
      atlas[`sidekick-${anims[row]}-${col}`] = {
        frame: { x: col * 64, y: row * 64, w: 64, h: 64 },
        sourceSize: { w: 64, h: 64 },
      };
    }
  }

  return { canvas, atlas };
}

// ─── Bella (Fixer) ───────────────────────────────────────────────────

function drawBellaBase(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number, anim: string) {
  const OL = '#3E2723';
  const SKIN = '#FFCCBC';
  const SKIN_S = '#FFAB91';
  const HAIR = '#8D6E63';
  const SHIRT = '#1565C0';
  const SHIRT_S = '#0D47A1';
  const CAP = '#1976D2';
  const WRENCH = '#FFC107';
  const PANTS = '#78909C';

  let headY = 0;
  let wrenchAngle = 0;
  let armLX = 0;
  let armLY = 0;
  let armRX = 0;
  let armRY = 0;
  let thumbUp = false;
  let starburst = false;

  if (anim === 'idle') {
    wrenchAngle = frame % 2 === 0 ? 0 : 1;
  } else if (anim === 'waving') {
    armLY = frame === 0 ? 0 : frame === 1 ? -3 : frame === 2 ? -5 : -3;
    armLX = frame >= 1 ? -2 : 0;
  } else if (anim === 'thumbsUp') {
    thumbUp = frame >= 1;
    armRY = frame === 1 ? -2 : frame === 2 ? -4 : frame === 3 ? -4 : 0;
    armRX = frame >= 1 ? 2 : 0;
  } else if (anim === 'hammering') {
    if (frame === 0) { wrenchAngle = 0; }
    if (frame === 1) { wrenchAngle = -2; armRY = -6; }
    if (frame === 2) { wrenchAngle = 2; armRY = 2; starburst = true; }
    if (frame === 3) { wrenchAngle = 0; }
  }

  const bx = ox + 14;
  const by = oy + 4 + headY;

  // Hair bun
  circle(ctx, bx + 20, by + 4, 4, HAIR);

  // Cap
  px(ctx, bx + 4, by + 4, 18, 4, CAP);
  px(ctx, bx + 2, by + 7, 22, 2, CAP);
  // Cap brim
  px(ctx, bx + 0, by + 8, 8, 2, CAP);

  // Head
  const hy = by + 9;
  px(ctx, bx + 4, hy, 18, 14, SKIN);
  px(ctx, bx + 6, hy - 1, 14, 1, SKIN);
  px(ctx, bx + 6, hy + 14, 14, 1, SKIN_S);
  // Hair sides
  px(ctx, bx + 3, hy, 2, 8, HAIR);
  px(ctx, bx + 21, hy, 2, 6, HAIR);

  // Outline
  px(ctx, bx + 2, hy, 1, 14, OL);
  px(ctx, bx + 23, hy, 1, 14, OL);

  // Eyes
  drawEyes(ctx, bx + 9, hy + 5, bx + 17, hy + 5, 2);

  // Freckles
  px(ctx, bx + 6, hy + 8, 1, 1, HAIR);
  px(ctx, bx + 8, hy + 9, 1, 1, HAIR);
  px(ctx, bx + 18, hy + 8, 1, 1, HAIR);
  px(ctx, bx + 20, hy + 9, 1, 1, HAIR);

  // Smile
  drawSmile(ctx, bx + 9, hy + 10, 8);

  // Body (work shirt)
  const bt = hy + 15;
  px(ctx, bx + 5, bt, 16, 14, SHIRT);
  px(ctx, bx + 5, bt + 8, 16, 6, SHIRT_S);
  // Collar
  px(ctx, bx + 9, bt, 8, 2, '#FFFFFF');
  // Button
  px(ctx, bx + 13, bt + 4, 1, 1, '#FFFFFF');
  px(ctx, bx + 13, bt + 7, 1, 1, '#FFFFFF');

  // Arms
  const at = bt + 2;
  // Left arm
  px(ctx, bx + 0 + armLX, at + armLY, 4, 9, SHIRT);
  px(ctx, bx + 0 + armLX, at + 7 + armLY, 4, 3, SKIN);
  // Right arm with wrench
  px(ctx, bx + 22 + armRX, at + armRY, 4, 9, SHIRT);
  px(ctx, bx + 22 + armRX, at + 7 + armRY, 4, 3, SKIN);

  // Wrench in right hand
  const wy = at + 6 + armRY + wrenchAngle;
  px(ctx, bx + 24 + armRX, wy, 3, 8, WRENCH);
  px(ctx, bx + 23 + armRX, wy, 5, 2, WRENCH);

  if (thumbUp && armRY < 0) {
    // Thumb sticking up
    px(ctx, bx + 24 + armRX, at + armRY + 5, 2, 4, SKIN);
  }

  // Starburst effect
  if (starburst) {
    const sx = bx + 25;
    const sy = wy + 8;
    ctx.fillStyle = '#FFEB3B';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const ex = sx + Math.round(Math.cos(angle) * 4);
      const ey = sy + Math.round(Math.sin(angle) * 4);
      px(ctx, ex, ey, 2, 2, '#FFEB3B');
    }
  }

  // Pants
  const pt = bt + 14;
  px(ctx, bx + 6, pt, 6, 8, PANTS);
  px(ctx, bx + 14, pt, 6, 8, PANTS);

  // Shoes
  px(ctx, bx + 5, pt + 8, 8, 3, '#5D4037');
  px(ctx, bx + 13, pt + 8, 8, 3, '#5D4037');
}

function generateFixer(): { canvas: Canvas; atlas: AtlasFrames } {
  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const atlas: AtlasFrames = {};
  const anims = ['idle', 'waving', 'thumbsUp', 'hammering'];

  for (let row = 0; row < anims.length; row++) {
    for (let col = 0; col < 4; col++) {
      drawBellaBase(ctx, col * 64, row * 64, col, anims[row]);
      atlas[`fixer-${anims[row]}-${col}`] = {
        frame: { x: col * 64, y: row * 64, w: 64, h: 64 },
        sourceSize: { w: 64, h: 64 },
      };
    }
  }

  return { canvas, atlas };
}

// ─── Building Tileset ────────────────────────────────────────────────

function drawBrickTile(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, variant = false) {
  const mortar = '#D7CCC8';
  px(ctx, x, y, 32, 32, mortar);

  const brickH = 6;
  const brickW = 14;
  for (let row = 0; row < 4; row++) {
    const offset = row % 2 === 0 ? 0 : 7;
    const ry = y + 2 + row * (brickH + 2);
    for (let col = -1; col < 3; col++) {
      const rx = x + offset + col * (brickW + 2);
      if (rx < x + 32 && rx + brickW > x) {
        const clampX = Math.max(rx, x);
        const clampW = Math.min(rx + brickW, x + 32) - clampX;
        const c = variant && (row + col) % 3 === 0 ? '#D32F2F' : color;
        px(ctx, clampX, ry, clampW, brickH, c);
        // Highlight on top edge
        px(ctx, clampX, ry, clampW, 1, '#FFFFFF22');
      }
    }
  }
}

function drawWindowTile(ctx: CanvasRenderingContext2D, x: number, y: number, type: string) {
  // Window frame
  px(ctx, x + 4, y + 4, 24, 24, '#5D4037');
  px(ctx, x + 6, y + 6, 20, 20, '#90CAF9');

  if (type === 'cat') {
    // Cat silhouette
    px(ctx, x + 12, y + 14, 8, 8, '#212121');
    px(ctx, x + 11, y + 12, 3, 3, '#212121'); // ear
    px(ctx, x + 18, y + 12, 3, 3, '#212121'); // ear
    px(ctx, x + 13, y + 17, 1, 1, '#FFEB3B'); // eye
    px(ctx, x + 18, y + 17, 1, 1, '#FFEB3B'); // eye
  } else if (type === 'grux') {
    // Grux peeking
    px(ctx, x + 10, y + 14, 12, 10, '#FFCCBC');
    px(ctx, x + 10, y + 12, 12, 3, '#FFC107'); // hat
    drawEyes(ctx, x + 13, y + 18, x + 19, y + 18, 1);
  } else if (type === 'zippy') {
    px(ctx, x + 10, y + 14, 12, 10, '#FFE0B2');
    px(ctx, x + 12, y + 11, 3, 4, '#009688'); // hair spike
    px(ctx, x + 16, y + 10, 3, 5, '#009688');
    drawEyes(ctx, x + 13, y + 18, x + 19, y + 18, 1);
  } else if (type === 'bella') {
    px(ctx, x + 10, y + 14, 12, 10, '#FFCCBC');
    px(ctx, x + 10, y + 12, 12, 3, '#1976D2'); // cap
    drawEyes(ctx, x + 13, y + 18, x + 19, y + 18, 1);
  } else if (type === 'bird') {
    px(ctx, x + 13, y + 16, 6, 5, '#FFEB3B');
    px(ctx, x + 19, y + 17, 3, 2, '#FF9800'); // beak
    px(ctx, x + 14, y + 17, 1, 1, '#1A1A1A'); // eye
  } else if (type === 'lit') {
    px(ctx, x + 6, y + 6, 20, 20, '#FFF9C4');
    px(ctx, x + 14, y + 10, 4, 8, '#FFD54F');
  } else if (type === 'curtain') {
    px(ctx, x + 6, y + 6, 4, 20, '#EF5350');
    px(ctx, x + 22, y + 6, 4, 20, '#EF5350');
    px(ctx, x + 6, y + 6, 20, 3, '#EF5350');
  }
}

function generateBricks(): Canvas {
  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Row 0: Brick types
  drawBrickTile(ctx, 0, 0, '#C62828');
  drawBrickTile(ctx, 32, 0, '#D32F2F', true);
  // Highlighted brick
  drawBrickTile(ctx, 64, 0, '#EF5350');
  px(ctx, 64, 0, 32, 32, 'rgba(255,255,100,0.15)');
  // Crumbling
  drawBrickTile(ctx, 96, 0, '#C62828');
  px(ctx, 100, 4, 6, 6, 'rgba(0,0,0,0)');
  ctx.clearRect(100, 4, 6, 6);
  ctx.clearRect(112, 18, 8, 5);
  // Dark
  drawBrickTile(ctx, 128, 0, '#B71C1C');
  // Foundation
  drawBrickTile(ctx, 160, 0, '#8D6E63');
  // Stone
  px(ctx, 192, 0, 32, 32, '#9E9E9E');
  px(ctx, 192, 0, 14, 14, '#BDBDBD');
  px(ctx, 208, 2, 14, 12, '#BDBDBD');
  px(ctx, 194, 16, 12, 14, '#BDBDBD');
  px(ctx, 210, 18, 12, 12, '#BDBDBD');
  // Empty/transparent - already transparent

  // Row 1: Windows
  drawWindowTile(ctx, 0, 32, 'empty');
  drawWindowTile(ctx, 32, 32, 'cat');
  drawWindowTile(ctx, 64, 32, 'grux');
  drawWindowTile(ctx, 96, 32, 'zippy');
  drawWindowTile(ctx, 128, 32, 'bella');
  drawWindowTile(ctx, 160, 32, 'bird');
  drawWindowTile(ctx, 192, 32, 'lit');
  drawWindowTile(ctx, 224, 32, 'curtain');

  // Row 2: Doors and ground
  // Door top
  px(ctx, 0, 64, 32, 32, '#8D6E63');
  px(ctx, 4, 68, 24, 28, '#5D4037');
  px(ctx, 6, 70, 20, 4, '#795548');
  // Door bottom
  px(ctx, 32, 64, 32, 32, '#5D4037');
  px(ctx, 52, 78, 3, 3, '#FFC107'); // knob
  px(ctx, 34, 66, 28, 2, '#795548');
  // Grass edge
  px(ctx, 64, 64, 32, 32, '#8BC34A');
  for (let i = 0; i < 32; i += 3) {
    const h = 4 + (i * 7 % 5);
    px(ctx, 64 + i, 64, 2, h, '#689F38');
  }
  // Plain grass
  px(ctx, 96, 64, 32, 32, '#8BC34A');
  px(ctx, 96, 64, 32, 4, '#9CCC65');
  // Dirt
  px(ctx, 128, 64, 32, 32, '#795548');
  px(ctx, 128, 64, 32, 3, '#8D6E63');
  for (let i = 0; i < 6; i++) {
    px(ctx, 130 + i * 5, 70 + (i % 3) * 4, 2, 2, '#6D4C41');
  }
  // Sidewalk light
  px(ctx, 160, 64, 32, 32, '#BDBDBD');
  px(ctx, 160, 64, 32, 1, '#E0E0E0');
  px(ctx, 160, 80, 32, 1, '#9E9E9E');
  // Sidewalk dark
  px(ctx, 192, 64, 32, 32, '#9E9E9E');
  px(ctx, 192, 64, 32, 1, '#BDBDBD');
  // Sewer grate
  px(ctx, 224, 64, 32, 32, '#616161');
  for (let i = 0; i < 5; i++) {
    px(ctx, 228, 68 + i * 5, 24, 2, '#212121');
  }

  // Row 3: Roof and decorations
  // Roof left slope
  for (let i = 0; i < 16; i++) {
    px(ctx, i * 2, 96 + (15 - i) * 2, 2, 32 - (15 - i) * 2, '#D32F2F');
  }
  // Roof right slope
  for (let i = 0; i < 16; i++) {
    px(ctx, 32 + 30 - i * 2, 96 + (15 - i) * 2, 2, 32 - (15 - i) * 2, '#D32F2F');
  }
  // Roof peak
  px(ctx, 64, 96, 32, 32, '#D32F2F');
  px(ctx, 64, 96, 32, 4, '#EF5350');
  // Flag
  px(ctx, 96 + 14, 96, 3, 32, '#795548'); // pole
  px(ctx, 96 + 17, 98, 12, 8, '#F44336'); // flag
  px(ctx, 96 + 17, 98, 12, 2, '#EF5350');
  // Antenna
  px(ctx, 128 + 15, 96, 2, 24, '#757575');
  px(ctx, 128 + 12, 96, 8, 2, '#757575');
  px(ctx, 128 + 15, 96, 2, 2, '#F44336');
  // Weather vane
  px(ctx, 160 + 15, 96, 2, 20, '#757575');
  px(ctx, 160 + 8, 100, 16, 2, '#FFC107');
  px(ctx, 160 + 22, 98, 4, 6, '#FFC107'); // arrow
  // Chimney
  px(ctx, 192 + 8, 96, 16, 24, '#C62828');
  px(ctx, 192 + 6, 96, 20, 4, '#B71C1C');
  // Smoke
  ctx.globalAlpha = 0.5;
  circle(ctx, 224 + 16, 110, 6, '#E0E0E0');
  circle(ctx, 224 + 12, 104, 5, '#EEEEEE');
  circle(ctx, 224 + 18, 100, 4, '#F5F5F5');
  ctx.globalAlpha = 1;

  // Row 4: Building details
  // Ledge
  px(ctx, 0, 128, 32, 4, '#8D6E63');
  px(ctx, 0, 128, 32, 2, '#A1887F');
  px(ctx, 0, 132, 32, 28, '#C62828');
  // Pipe vertical
  px(ctx, 32 + 12, 128, 8, 32, '#78909C');
  px(ctx, 32 + 12, 128, 2, 32, '#90A4AE');
  // Flower box
  px(ctx, 64 + 2, 144, 28, 8, '#795548');
  px(ctx, 64 + 4, 136, 6, 8, '#4CAF50');
  px(ctx, 64 + 12, 134, 6, 10, '#4CAF50');
  px(ctx, 64 + 20, 138, 6, 6, '#4CAF50');
  circle(ctx, 64 + 7, 134, 2, '#F44336');
  circle(ctx, 64 + 15, 132, 2, '#FFEB3B');
  circle(ctx, 64 + 23, 136, 2, '#E91E63');
  // AC unit
  px(ctx, 96 + 4, 132, 24, 20, '#90A4AE');
  px(ctx, 96 + 4, 132, 24, 2, '#78909C');
  for (let i = 0; i < 4; i++) {
    px(ctx, 96 + 6, 136 + i * 4, 20, 1, '#78909C');
  }
  // Balcony rail
  px(ctx, 128, 128, 32, 2, '#757575');
  px(ctx, 128, 154, 32, 2, '#757575');
  for (let i = 0; i < 5; i++) {
    px(ctx, 128 + 3 + i * 7, 128, 2, 28, '#9E9E9E');
  }
  // Fire escape
  px(ctx, 160, 128, 32, 3, '#616161');
  px(ctx, 160, 148, 32, 3, '#616161');
  px(ctx, 160, 128, 3, 32, '#757575');
  px(ctx, 189, 128, 3, 32, '#757575');
  // Diagonal stairs
  for (let i = 0; i < 5; i++) {
    px(ctx, 162 + i * 5, 132 + i * 3, 6, 2, '#757575');
  }
  // Awning left
  px(ctx, 192, 128, 32, 4, '#E91E63');
  for (let i = 0; i < 8; i++) {
    px(ctx, 192, 132 + i * 2, 32 - i * 3, 2, i % 2 === 0 ? '#E91E63' : '#FFFFFF');
  }
  // Awning right
  px(ctx, 224, 128, 32, 4, '#E91E63');
  for (let i = 0; i < 8; i++) {
    px(ctx, 224 + i * 3, 132 + i * 2, 32 - i * 3, 2, i % 2 === 0 ? '#E91E63' : '#FFFFFF');
  }

  return canvas;
}

// ─── Manipulatives ───────────────────────────────────────────────────

function generateManipulatives(): { canvas: Canvas; atlas: AtlasFrames } {
  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const atlas: AtlasFrames = {};

  // Blue circles - normal (48px diameter)
  const circleX = 24;
  const circleY = 24;
  circle(ctx, circleX, circleY, 22, '#2196F3');
  circle(ctx, circleX, circleY, 20, '#42A5F5');
  circle(ctx, circleX - 4, circleY - 4, 6, '#90CAF9'); // highlight
  outline(ctx, circleX, circleY, 22, '#1565C0');
  atlas['circle-normal'] = { frame: { x: 0, y: 0, w: 48, h: 48 }, sourceSize: { w: 48, h: 48 } };

  // Blue circle highlighted (glow ring)
  const hcX = 72;
  const hcY = 24;
  // Glow
  ctx.globalAlpha = 0.3;
  circle(ctx, hcX, hcY, 23, '#FFEB3B');
  ctx.globalAlpha = 1;
  circle(ctx, hcX, hcY, 22, '#2196F3');
  circle(ctx, hcX, hcY, 20, '#42A5F5');
  circle(ctx, hcX - 4, hcY - 4, 6, '#90CAF9');
  outline(ctx, hcX, hcY, 22, '#FFEB3B');
  atlas['circle-highlighted'] = { frame: { x: 48, y: 0, w: 48, h: 48 }, sourceSize: { w: 48, h: 48 } };

  // Blue circle ghost (30% opacity)
  ctx.globalAlpha = 0.3;
  circle(ctx, 120, 24, 22, '#2196F3');
  circle(ctx, 120, 24, 20, '#42A5F5');
  outline(ctx, 120, 24, 22, '#1565C0');
  ctx.globalAlpha = 1;
  atlas['circle-ghost'] = { frame: { x: 96, y: 0, w: 48, h: 48 }, sourceSize: { w: 48, h: 48 } };

  // Small circle (24px)
  circle(ctx, 156, 12, 11, '#2196F3');
  circle(ctx, 156, 12, 9, '#42A5F5');
  circle(ctx, 154, 10, 3, '#90CAF9');
  outline(ctx, 156, 12, 11, '#1565C0');
  atlas['circle-small'] = { frame: { x: 144, y: 0, w: 24, h: 24 }, sourceSize: { w: 24, h: 24 } };

  // Orange 5-unit rectangle (120x48)
  const rectY = 56;
  px(ctx, 0, rectY, 120, 48, '#FF9800');
  px(ctx, 1, rectY + 1, 118, 46, '#FFB74D');
  // Segment lines
  for (let i = 1; i < 5; i++) {
    px(ctx, i * 24, rectY + 2, 1, 44, '#E65100');
  }
  // Border
  px(ctx, 0, rectY, 120, 2, '#E65100');
  px(ctx, 0, rectY + 46, 120, 2, '#E65100');
  px(ctx, 0, rectY, 2, 48, '#E65100');
  px(ctx, 118, rectY, 2, 48, '#E65100');
  // Dots in each segment
  for (let i = 0; i < 5; i++) {
    circle(ctx, 12 + i * 24, rectY + 24, 4, '#FFFFFF');
  }
  atlas['rect5-normal'] = { frame: { x: 0, y: 56, w: 120, h: 48 }, sourceSize: { w: 120, h: 48 } };

  // Orange rect highlighted
  const rhY = 112;
  ctx.globalAlpha = 0.3;
  px(ctx, 0, rhY - 2, 124, 52, '#FFEB3B');
  ctx.globalAlpha = 1;
  px(ctx, 2, rhY, 120, 48, '#FF9800');
  px(ctx, 3, rhY + 1, 118, 46, '#FFB74D');
  for (let i = 1; i < 5; i++) {
    px(ctx, 2 + i * 24, rhY + 2, 1, 44, '#E65100');
  }
  px(ctx, 2, rhY, 120, 2, '#FFEB3B');
  px(ctx, 2, rhY + 46, 120, 2, '#FFEB3B');
  px(ctx, 2, rhY, 2, 48, '#FFEB3B');
  px(ctx, 120, rhY, 2, 48, '#FFEB3B');
  for (let i = 0; i < 5; i++) {
    circle(ctx, 14 + i * 24, rhY + 24, 4, '#FFFFFF');
  }
  atlas['rect5-highlighted'] = { frame: { x: 0, y: 110, w: 124, h: 52 }, sourceSize: { w: 124, h: 52 } };

  // Orange rect ghost
  const rgY = 168;
  ctx.globalAlpha = 0.3;
  px(ctx, 0, rgY, 120, 48, '#FF9800');
  px(ctx, 1, rgY + 1, 118, 46, '#FFB74D');
  for (let i = 1; i < 5; i++) {
    px(ctx, i * 24, rgY + 2, 1, 44, '#E65100');
  }
  px(ctx, 0, rgY, 120, 2, '#E65100');
  px(ctx, 0, rgY + 46, 120, 2, '#E65100');
  px(ctx, 0, rgY, 2, 48, '#E65100');
  px(ctx, 118, rgY, 2, 48, '#E65100');
  ctx.globalAlpha = 1;
  atlas['rect5-ghost'] = { frame: { x: 0, y: 168, w: 120, h: 48 }, sourceSize: { w: 120, h: 48 } };

  // Small rect (60x24)
  const srY = 220;
  px(ctx, 0, srY, 60, 24, '#FF9800');
  px(ctx, 1, srY + 1, 58, 22, '#FFB74D');
  for (let i = 1; i < 5; i++) {
    px(ctx, i * 12, srY + 1, 1, 22, '#E65100');
  }
  px(ctx, 0, srY, 60, 1, '#E65100');
  px(ctx, 0, srY + 23, 60, 1, '#E65100');
  px(ctx, 0, srY, 1, 24, '#E65100');
  px(ctx, 59, srY, 1, 24, '#E65100');
  atlas['rect5-small'] = { frame: { x: 0, y: 220, w: 60, h: 24 }, sourceSize: { w: 60, h: 24 } };

  // Group bracket (curly bracket shape)
  const bkX = 192;
  const bkY = 56;
  ctx.fillStyle = '#616161';
  px(ctx, bkX + 6, bkY, 4, 2, '#616161');
  px(ctx, bkX + 4, bkY + 2, 2, 6, '#616161');
  px(ctx, bkX + 2, bkY + 8, 2, 4, '#616161');
  px(ctx, bkX + 4, bkY + 12, 2, 6, '#616161');
  px(ctx, bkX + 6, bkY + 18, 4, 2, '#616161');
  atlas['bracket'] = { frame: { x: 192, y: 56, w: 16, h: 20 }, sourceSize: { w: 16, h: 20 } };

  // Equals sign
  const eqX = 192;
  const eqY = 80;
  px(ctx, eqX + 2, eqY + 4, 12, 3, '#616161');
  px(ctx, eqX + 2, eqY + 9, 12, 3, '#616161');
  atlas['equals'] = { frame: { x: 192, y: 80, w: 16, h: 16 }, sourceSize: { w: 16, h: 16 } };

  // Multiply sign
  const mulX = 208;
  const mulY = 80;
  for (let i = 0; i < 10; i++) {
    px(ctx, mulX + 3 + i, mulY + 3 + i, 2, 2, '#616161');
    px(ctx, mulX + 13 - i, mulY + 3 + i, 2, 2, '#616161');
  }
  atlas['multiply'] = { frame: { x: 208, y: 80, w: 16, h: 16 }, sourceSize: { w: 16, h: 16 } };

  return { canvas, atlas };
}

// ─── UI Elements ─────────────────────────────────────────────────────

function drawPixelDigit(ctx: CanvasRenderingContext2D, x: number, y: number, digit: number, color: string, scale = 2) {
  // 5x7 pixel font for digits
  const patterns: Record<number, number[]> = {
    0: [0x7C, 0xC6, 0xCE, 0xD6, 0xE6, 0xC6, 0x7C],
    1: [0x18, 0x38, 0x18, 0x18, 0x18, 0x18, 0x7E],
    2: [0x7C, 0xC6, 0x06, 0x3C, 0x60, 0xC0, 0xFE],
    3: [0x7C, 0xC6, 0x06, 0x3C, 0x06, 0xC6, 0x7C],
    4: [0x1C, 0x3C, 0x6C, 0xCC, 0xFE, 0x0C, 0x0C],
    5: [0xFE, 0xC0, 0xFC, 0x06, 0x06, 0xC6, 0x7C],
    6: [0x7C, 0xC0, 0xFC, 0xC6, 0xC6, 0xC6, 0x7C],
    7: [0xFE, 0x06, 0x0C, 0x18, 0x30, 0x30, 0x30],
    8: [0x7C, 0xC6, 0xC6, 0x7C, 0xC6, 0xC6, 0x7C],
    9: [0x7C, 0xC6, 0xC6, 0x7E, 0x06, 0x06, 0x7C],
  };

  ctx.fillStyle = color;
  const p = patterns[digit] ?? patterns[0];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 8; col++) {
      if (p[row] & (0x80 >> col)) {
        ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
      }
    }
  }
}

function drawButton(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, topColor: string, botColor: string, borderColor: string) {
  // Border
  px(ctx, x, y, w, h, borderColor);
  // Body gradient (top half lighter)
  px(ctx, x + 2, y + 2, w - 4, h / 2 - 1, topColor);
  px(ctx, x + 2, y + h / 2 + 1, w - 4, h / 2 - 3, botColor);
  // Rounded corners
  px(ctx, x + 1, y + 1, 1, 1, borderColor);
  px(ctx, x + w - 2, y + 1, 1, 1, borderColor);
  px(ctx, x + 1, y + h - 2, 1, 1, borderColor);
  px(ctx, x + w - 2, y + h - 2, 1, 1, borderColor);
  // Highlight top edge
  px(ctx, x + 3, y + 3, w - 6, 1, 'rgba(255,255,255,0.3)');
  // Shadow bottom edge
  px(ctx, x + 3, y + h - 3, w - 6, 1, 'rgba(0,0,0,0.2)');
}

function generateUI(): { canvas: Canvas; atlas: AtlasFrames } {
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const atlas: AtlasFrames = {};

  // Numpad buttons 0-9: 3 states each (normal, pressed, disabled)
  // Layout: 10 digits x 3 states = 30 buttons, arranged as rows
  for (let digit = 0; digit <= 9; digit++) {
    const col = digit;
    const bx = col * 48;

    // Normal state
    drawButton(ctx, bx, 0, 46, 46, '#1976D2', '#1565C0', '#0D47A1');
    drawPixelDigit(ctx, bx + 15, 12, digit, '#FFFFFF');
    atlas[`numpad-${digit}-normal`] = { frame: { x: bx, y: 0, w: 46, h: 46 }, sourceSize: { w: 46, h: 46 } };

    // Pressed state
    drawButton(ctx, bx, 48, 46, 46, '#1565C0', '#0D47A1', '#0D47A1');
    drawPixelDigit(ctx, bx + 15, 62, digit, '#E3F2FD');
    atlas[`numpad-${digit}-pressed`] = { frame: { x: bx, y: 48, w: 46, h: 46 }, sourceSize: { w: 46, h: 46 } };

    // Disabled state
    drawButton(ctx, bx, 96, 46, 46, '#9E9E9E', '#757575', '#616161');
    drawPixelDigit(ctx, bx + 15, 108, digit, '#BDBDBD');
    atlas[`numpad-${digit}-disabled`] = { frame: { x: bx, y: 96, w: 46, h: 46 }, sourceSize: { w: 46, h: 46 } };
  }

  // Backspace button (64x64)
  const bsX = 0;
  const bsY = 144;
  drawButton(ctx, bsX, bsY, 62, 62, '#F44336', '#D32F2F', '#B71C1C');
  // Left arrow
  const arrowCX = bsX + 31;
  const arrowCY = bsY + 31;
  px(ctx, arrowCX - 12, arrowCY - 1, 24, 3, '#FFFFFF');
  for (let i = 0; i < 6; i++) {
    px(ctx, arrowCX - 12 + i, arrowCY - 1 - (6 - i), 2, 2, '#FFFFFF');
    px(ctx, arrowCX - 12 + i, arrowCY + 1 + (6 - i), 2, 2, '#FFFFFF');
  }
  atlas['backspace'] = { frame: { x: bsX, y: bsY, w: 62, h: 62 }, sourceSize: { w: 62, h: 62 } };

  // Submit/check button (128x64) - 3 states
  const smX = 64;
  const smY = 144;
  // Normal
  drawButton(ctx, smX, smY, 126, 62, '#388E3C', '#2E7D32', '#1B5E20');
  // Checkmark
  px(ctx, smX + 42, smY + 34, 4, 4, '#FFFFFF');
  px(ctx, smX + 46, smY + 38, 4, 4, '#FFFFFF');
  px(ctx, smX + 50, smY + 34, 4, 4, '#FFFFFF');
  px(ctx, smX + 54, smY + 30, 4, 4, '#FFFFFF');
  px(ctx, smX + 58, smY + 26, 4, 4, '#FFFFFF');
  px(ctx, smX + 62, smY + 22, 4, 4, '#FFFFFF');
  atlas['submit-normal'] = { frame: { x: smX, y: smY, w: 126, h: 62 }, sourceSize: { w: 126, h: 62 } };

  // Pressed
  drawButton(ctx, smX, smY + 64, 126, 62, '#2E7D32', '#1B5E20', '#1B5E20');
  px(ctx, smX + 42, smY + 64 + 36, 4, 4, '#E8F5E9');
  px(ctx, smX + 46, smY + 64 + 40, 4, 4, '#E8F5E9');
  px(ctx, smX + 50, smY + 64 + 36, 4, 4, '#E8F5E9');
  px(ctx, smX + 54, smY + 64 + 32, 4, 4, '#E8F5E9');
  px(ctx, smX + 58, smY + 64 + 28, 4, 4, '#E8F5E9');
  px(ctx, smX + 62, smY + 64 + 24, 4, 4, '#E8F5E9');
  atlas['submit-pressed'] = { frame: { x: smX, y: smY + 64, w: 126, h: 62 }, sourceSize: { w: 126, h: 62 } };

  // Disabled
  drawButton(ctx, smX, smY + 128, 126, 62, '#9E9E9E', '#757575', '#616161');
  px(ctx, smX + 42, smY + 128 + 34, 4, 4, '#BDBDBD');
  px(ctx, smX + 46, smY + 128 + 38, 4, 4, '#BDBDBD');
  px(ctx, smX + 50, smY + 128 + 34, 4, 4, '#BDBDBD');
  px(ctx, smX + 54, smY + 128 + 30, 4, 4, '#BDBDBD');
  px(ctx, smX + 58, smY + 128 + 26, 4, 4, '#BDBDBD');
  px(ctx, smX + 62, smY + 128 + 22, 4, 4, '#BDBDBD');
  atlas['submit-disabled'] = { frame: { x: smX, y: smY + 128, w: 126, h: 62 }, sourceSize: { w: 126, h: 62 } };

  // Hint button (80x80 amber circle with lightbulb)
  const hintX = 192;
  const hintY = 144;
  circle(ctx, hintX + 40, hintY + 40, 38, '#FFA000');
  circle(ctx, hintX + 40, hintY + 40, 36, '#FFB300');
  circle(ctx, hintX + 40, hintY + 40, 34, '#FFC107');
  // Lightbulb
  circle(ctx, hintX + 40, hintY + 32, 10, '#FFEB3B');
  circle(ctx, hintX + 40, hintY + 32, 8, '#FFF9C4');
  px(ctx, hintX + 36, hintY + 42, 8, 4, '#FFEB3B');
  px(ctx, hintX + 37, hintY + 46, 6, 2, '#FFD54F');
  px(ctx, hintX + 38, hintY + 48, 4, 2, '#FFC107');
  // Filament
  px(ctx, hintX + 39, hintY + 30, 2, 6, '#FF8F00');
  // Rays
  const rays = [[0, -14], [10, -10], [14, 0], [10, 10], [-10, -10], [-14, 0], [-10, 10], [0, 14]];
  for (const [rdx, rdy] of rays) {
    px(ctx, hintX + 40 + rdx - 1, hintY + 32 + rdy - 1, 2, 2, '#FFEB3B');
  }
  atlas['hint'] = { frame: { x: hintX, y: hintY, w: 80, h: 80 }, sourceSize: { w: 80, h: 80 } };

  // Progress dots (16x16 each)
  const dotY = 400;
  // Filled green
  circle(ctx, 8, dotY + 8, 6, '#4CAF50');
  circle(ctx, 8, dotY + 8, 4, '#66BB6A');
  atlas['dot-filled'] = { frame: { x: 0, y: dotY, w: 16, h: 16 }, sourceSize: { w: 16, h: 16 } };
  // Empty outline
  outline(ctx, 24, dotY + 8, 6, '#9E9E9E');
  atlas['dot-empty'] = { frame: { x: 16, y: dotY, w: 16, h: 16 }, sourceSize: { w: 16, h: 16 } };
  // Current gold
  circle(ctx, 40, dotY + 8, 6, '#FFC107');
  circle(ctx, 40, dotY + 8, 4, '#FFD54F');
  atlas['dot-current'] = { frame: { x: 32, y: dotY, w: 16, h: 16 }, sourceSize: { w: 16, h: 16 } };

  // Heart (24x24)
  const heartX = 64;
  const heartY = dotY;
  // Pixel art heart shape
  const heartRows = [
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  ];
  for (let r = 0; r < heartRows.length; r++) {
    for (let c = 0; c < heartRows[r].length; c++) {
      if (heartRows[r][c]) {
        px(ctx, heartX + 1 + c * 2, heartY + 3 + r * 2, 2, 2, '#F44336');
      }
    }
  }
  // Highlight
  px(ctx, heartX + 5, heartY + 5, 2, 2, '#EF9A9A');
  atlas['heart'] = { frame: { x: heartX, y: heartY, w: 24, h: 24 }, sourceSize: { w: 24, h: 24 } };

  // Star (24x24)
  const starX = 96;
  const starY = dotY;
  const starRows = [
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
  ];
  for (let r = 0; r < starRows.length; r++) {
    for (let c = 0; c < starRows[r].length; c++) {
      if (starRows[r][c]) {
        px(ctx, starX + 1 + c * 2, starY + 3 + r * 2, 2, 2, '#FFC107');
      }
    }
  }
  px(ctx, starX + 9, starY + 7, 2, 2, '#FFF9C4');
  atlas['star'] = { frame: { x: starX, y: starY, w: 24, h: 24 }, sourceSize: { w: 24, h: 24 } };

  // Speech bubble 9-slice (48x48)
  const sbX = 128;
  const sbY = dotY;
  // White body with dark border
  px(ctx, sbX + 4, sbY, 40, 2, '#424242');
  px(ctx, sbX + 4, sbY + 38, 40, 2, '#424242');
  px(ctx, sbX, sbY + 4, 2, 34, '#424242');
  px(ctx, sbX + 46, sbY + 4, 2, 34, '#424242');
  // Corners
  px(ctx, sbX + 2, sbY + 2, 2, 2, '#424242');
  px(ctx, sbX + 44, sbY + 2, 2, 2, '#424242');
  px(ctx, sbX + 2, sbY + 36, 2, 2, '#424242');
  px(ctx, sbX + 44, sbY + 36, 2, 2, '#424242');
  // Fill
  px(ctx, sbX + 2, sbY + 2, 44, 36, '#FFFFFF');
  px(ctx, sbX + 4, sbY + 2, 40, 36, '#FFFFFF');
  px(ctx, sbX + 2, sbY + 4, 44, 32, '#FFFFFF');
  // Tail
  px(ctx, sbX + 10, sbY + 40, 6, 2, '#424242');
  px(ctx, sbX + 8, sbY + 42, 6, 2, '#424242');
  px(ctx, sbX + 6, sbY + 44, 6, 2, '#424242');
  px(ctx, sbX + 12, sbY + 40, 4, 2, '#FFFFFF');
  px(ctx, sbX + 10, sbY + 42, 4, 2, '#FFFFFF');
  px(ctx, sbX + 8, sbY + 44, 4, 2, '#FFFFFF');
  atlas['speech-bubble'] = { frame: { x: sbX, y: sbY, w: 48, h: 48 }, sourceSize: { w: 48, h: 48 } };

  return { canvas, atlas };
}

// ─── Sky Background ──────────────────────────────────────────────────

function generateSky(): Canvas {
  const canvas = createCanvas(1024, 768);
  const ctx = canvas.getContext('2d');

  // Gradient sky
  for (let y = 0; y < 768; y++) {
    const t = y / 768;
    const r = Math.round(135 + t * (224 - 135));
    const g = Math.round(206 + t * (247 - 206));
    const b = Math.round(235 + t * (250 - 235));
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y, 1024, 1);
  }

  // Fluffy clouds
  function drawCloud(cx: number, cy: number, scale: number) {
    const s = scale;
    circle(ctx, cx, cy, 12 * s, '#FFFFFF');
    circle(ctx, cx - 14 * s, cy + 2 * s, 8 * s, '#FFFFFF');
    circle(ctx, cx + 14 * s, cy + 2 * s, 8 * s, '#FFFFFF');
    circle(ctx, cx - 8 * s, cy - 4 * s, 10 * s, '#FFFFFF');
    circle(ctx, cx + 8 * s, cy - 4 * s, 10 * s, '#FFFFFF');
    // Highlight
    ctx.globalAlpha = 0.4;
    circle(ctx, cx - 4 * s, cy - 6 * s, 6 * s, '#FFFFFF');
    ctx.globalAlpha = 1;
    // Shadow
    ctx.globalAlpha = 0.1;
    circle(ctx, cx, cy + 6 * s, 14 * s, '#90CAF9');
    ctx.globalAlpha = 1;
  }

  drawCloud(150, 120, 2);
  drawCloud(450, 80, 2.5);
  drawCloud(750, 150, 1.8);
  drawCloud(950, 60, 1.5);
  drawCloud(300, 200, 1.2);

  return canvas;
}

// ─── Ground ──────────────────────────────────────────────────────────

function generateGround(): Canvas {
  const canvas = createCanvas(1024, 80);
  const ctx = canvas.getContext('2d');

  // Dirt layer
  px(ctx, 0, 40, 1024, 40, '#6D4C41');
  px(ctx, 0, 40, 1024, 4, '#795548');

  // Grass
  px(ctx, 0, 0, 1024, 40, '#8BC34A');
  px(ctx, 0, 0, 1024, 6, '#9CCC65');

  // Grass blades
  for (let x = 0; x < 1024; x += 3) {
    const h = 4 + ((x * 17 + 7) % 8);
    const shade = (x * 31) % 3 === 0 ? '#7CB342' : '#689F38';
    px(ctx, x, 36 - h, 2, h, shade);
  }

  // Dirt texture
  for (let i = 0; i < 60; i++) {
    const dx = (i * 37 + 11) % 1020;
    const dy = 46 + (i * 13 + 3) % 30;
    px(ctx, dx, dy, 3, 2, '#5D4037');
  }

  return canvas;
}

// ─── Particles ───────────────────────────────────────────────────────

function generateParticles(): { canvas: Canvas; atlas: AtlasFrames } {
  const canvas = createCanvas(128, 128);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const atlas: AtlasFrames = {};

  // Confetti pieces (6x6 each) - 4 colors
  const confettiColors = ['#F44336', '#2196F3', '#4CAF50', '#FFEB3B'];
  for (let i = 0; i < confettiColors.length; i++) {
    const cx = i * 8;
    px(ctx, cx, 0, 6, 6, confettiColors[i]);
    px(ctx, cx, 0, 6, 1, 'rgba(255,255,255,0.3)');
    atlas[`confetti-${i}`] = { frame: { x: cx, y: 0, w: 6, h: 6 }, sourceSize: { w: 6, h: 6 } };
  }

  // Rotated confetti (diamond shapes)
  for (let i = 0; i < confettiColors.length; i++) {
    const cx = i * 8 + 3;
    const cy = 11;
    px(ctx, cx, cy - 3, 2, 2, confettiColors[i]);
    px(ctx, cx - 1, cy - 1, 4, 2, confettiColors[i]);
    px(ctx, cx, cy + 1, 2, 2, confettiColors[i]);
    atlas[`confetti-rot-${i}`] = { frame: { x: i * 8, y: 8, w: 8, h: 8 }, sourceSize: { w: 8, h: 8 } };
  }

  // Brick debris (terracotta fragments)
  const debrisColors = ['#C62828', '#D32F2F', '#8D6E63', '#795548', '#A1887F'];
  for (let i = 0; i < debrisColors.length; i++) {
    const dx = i * 10;
    const dy = 18;
    const w = 3 + (i % 3) * 2;
    const h = 3 + ((i + 1) % 3) * 2;
    px(ctx, dx + 1, dy, w, h, debrisColors[i]);
    atlas[`debris-${i}`] = { frame: { x: dx, y: dy, w: w + 2, h: h + 2 }, sourceSize: { w: w + 2, h: h + 2 } };
  }

  // Sparkle effects (4-pointed stars) - 3 sizes
  const sparkleY = 32;
  // Small sparkle
  px(ctx, 3, sparkleY + 0, 2, 2, '#FFEB3B');
  px(ctx, 1, sparkleY + 2, 6, 4, '#FFEB3B');
  px(ctx, 3, sparkleY + 6, 2, 2, '#FFEB3B');
  px(ctx, 3, sparkleY + 2, 2, 4, '#FFF9C4');
  atlas['sparkle-small'] = { frame: { x: 0, y: sparkleY, w: 8, h: 8 }, sourceSize: { w: 8, h: 8 } };

  // Medium sparkle
  const msX = 10;
  px(ctx, msX + 5, sparkleY, 2, 2, '#FFEB3B');
  px(ctx, msX + 4, sparkleY + 2, 4, 2, '#FFEB3B');
  px(ctx, msX, sparkleY + 4, 12, 4, '#FFEB3B');
  px(ctx, msX + 4, sparkleY + 8, 4, 2, '#FFEB3B');
  px(ctx, msX + 5, sparkleY + 10, 2, 2, '#FFEB3B');
  px(ctx, msX + 4, sparkleY + 4, 4, 4, '#FFF9C4');
  atlas['sparkle-medium'] = { frame: { x: msX, y: sparkleY, w: 12, h: 12 }, sourceSize: { w: 12, h: 12 } };

  // Large sparkle
  const lsX = 24;
  px(ctx, lsX + 7, sparkleY, 2, 4, '#FFEB3B');
  px(ctx, lsX + 6, sparkleY + 4, 4, 2, '#FFEB3B');
  px(ctx, lsX, sparkleY + 6, 16, 4, '#FFEB3B');
  px(ctx, lsX + 6, sparkleY + 10, 4, 2, '#FFEB3B');
  px(ctx, lsX + 7, sparkleY + 12, 2, 4, '#FFEB3B');
  px(ctx, lsX + 6, sparkleY + 6, 4, 4, '#FFF9C4');
  atlas['sparkle-large'] = { frame: { x: lsX, y: sparkleY, w: 16, h: 16 }, sourceSize: { w: 16, h: 16 } };

  // Dust clouds (circular puffs)
  const dustY = 52;
  ctx.globalAlpha = 0.6;
  circle(ctx, 8, dustY + 8, 7, '#D7CCC8');
  circle(ctx, 6, dustY + 6, 4, '#EFEBE9');
  ctx.globalAlpha = 1;
  atlas['dust-small'] = { frame: { x: 0, y: dustY, w: 16, h: 16 }, sourceSize: { w: 16, h: 16 } };

  ctx.globalAlpha = 0.5;
  circle(ctx, 28, dustY + 12, 10, '#D7CCC8');
  circle(ctx, 24, dustY + 8, 6, '#EFEBE9');
  circle(ctx, 32, dustY + 6, 5, '#F5F5F5');
  ctx.globalAlpha = 1;
  atlas['dust-large'] = { frame: { x: 16, y: dustY, w: 24, h: 24 }, sourceSize: { w: 24, h: 24 } };

  return { canvas, atlas };
}

// ─── Main ────────────────────────────────────────────────────────────

console.log('Generating art assets...\n');

console.log('Characters:');
const wrecker = generateWrecker();
saveCanvas(wrecker.canvas, SPRITES_DIR, 'wrecker.png');
saveAtlas(wrecker.atlas, SPRITES_DIR, 'wrecker.json');

const sidekick = generateSidekick();
saveCanvas(sidekick.canvas, SPRITES_DIR, 'sidekick.png');
saveAtlas(sidekick.atlas, SPRITES_DIR, 'sidekick.json');

const fixer = generateFixer();
saveCanvas(fixer.canvas, SPRITES_DIR, 'fixer.png');
saveAtlas(fixer.atlas, SPRITES_DIR, 'fixer.json');

console.log('\nTiles:');
const bricks = generateBricks();
saveCanvas(bricks, TILES_DIR, 'bricks.png');

console.log('\nManipulatives:');
const manipulatives = generateManipulatives();
saveCanvas(manipulatives.canvas, SPRITES_DIR, 'manipulatives.png');
saveAtlas(manipulatives.atlas, SPRITES_DIR, 'manipulatives.json');

console.log('\nUI:');
const ui = generateUI();
saveCanvas(ui.canvas, SPRITES_DIR, 'ui.png');
saveAtlas(ui.atlas, SPRITES_DIR, 'ui.json');

console.log('\nBackgrounds:');
const sky = generateSky();
saveCanvas(sky, SPRITES_DIR, 'sky.png');

const ground = generateGround();
saveCanvas(ground, SPRITES_DIR, 'ground.png');

console.log('\nParticles:');
const particles = generateParticles();
saveCanvas(particles.canvas, SPRITES_DIR, 'particles.png');
saveAtlas(particles.atlas, SPRITES_DIR, 'particles.json');

console.log('\nAll assets generated successfully!');
