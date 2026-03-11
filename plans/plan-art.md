# Implementation Plan: Art & Animation

Generated: 2026-03-11

## Goal

Design and create ALL visual assets for the multiplication learning game. This includes three original pixel-art characters with full animation sets, building tilesets, UI elements, math manipulative sprites, particle effects, and background layers. Every asset must be production-ready for Phaser.js 3, exported as PNG sprite sheets with corresponding atlas JSON, and sized for mobile GPU compatibility (max 2048x2048 per sheet).

The implementing agent must produce actual pixel art, not placeholders. This plan provides pixel-level specifications, exact color values, animation frame counts, and tool-specific generation instructions sufficient to create every asset.

---

## APPROVAL GATE: Danny Must Approve All Visuals

**CRITICAL: The implementing agent MUST get Danny's explicit approval at each visual milestone before proceeding.**

### Approval Process

1. **Per-character approval:** After creating each character's idle sprite (before animating all frames), the agent MUST:
   - Render the character visually and show it to Danny (use an image generation tool / playground to produce a visual preview)
   - Wait for Danny's feedback
   - Iterate based on feedback until Danny approves
   - Only then proceed to create the full animation sprite sheet for that character

2. **Approval order:**
   - Grux (wrecker) idle → Danny approves → Grux full sprite sheet
   - Zippy (sidekick) idle → Danny approves → Zippy full sprite sheet
   - Bella (fixer) idle → Danny approves → Bella full sprite sheet

3. **Additional approval gates:**
   - Building tileset sample (a few brick/window tiles) → Danny approves → full tileset
   - UI elements mockup (numpad, hint button) → Danny approves → full UI set
   - Background layers → Danny approves → finalize

4. **How to show visuals:** Generate preview images using available image generation tools or create HTML canvas renderings that Danny can view in a browser. The agent should NOT proceed past an approval gate without explicit "approved" or "looks good" from Danny.

---

## Implementation Checklist

**Instructions for implementing agent:** Work through this checklist in order. Mark items `[x]` as you complete them. Mark the current item `[→]`. Do NOT skip items. NEVER proceed past an APPROVAL GATE without Danny's explicit approval.

### Phase 1 & 2: Character Design & Sprite Sheet Specs

These phases are complete -- the design documents and sprite sheet specifications are this plan itself. No implementation work needed.

- [x] Phase 1: Character design documents (Grux, Zippy, Bella) -- defined in plan
- [x] Phase 2: Sprite sheet layout specs (wrecker.png 384x320, sidekick.png 384x256, fixer.png 256x256) -- defined in plan

### Phase 1-2 (Implementation): Character Sprite Sheets

**Grux (The Wrecker)**

- [ ] Design Grux idle pose -- 64x64 pixel art, front-facing, orange overalls, yellow hard hat, chibi 2.5-head proportions, using exact color palette from plan
- [ ] **APPROVAL GATE: Show Grux idle pose to Danny. Iterate until Danny says "approved" or "looks good."**
- [ ] Create Grux full sprite sheet `wrecker.png` (384x320, 6 cols x 5 rows):
  - [ ] `idle` -- 4 frames at 4fps (breathing: chest 1px expand/contract cycle)
  - [ ] `happy` -- 6 frames at 8fps (arms swing out, jump 6px, squash landing)
  - [ ] `frustrated` -- 6 frames at 6fps (eyebrows angle, stomps, dust puffs)
  - [ ] `climbing` -- 6 frames at 6fps (side view, alternating hand-over-hand)
  - [ ] `waving` -- 4 frames at 5fps (right arm sweeps 45-135 degrees)
- [ ] Generate `wrecker.json` atlas JSON (frame coordinates matching layout spec)
- [ ] Verify wrecker sprite sheet loads in Phaser test scene, all 5 animations play correctly
- [ ] Commit Grux sprite sheet and atlas

**Zippy (The Sidekick)**

- [ ] Design Zippy idle pose -- 64x64 pixel art (character ~40x48 within frame), thin build, teal spiky hair, green hoodie with white lightning bolt, orange goggles, red sneakers
- [ ] **APPROVAL GATE: Show Zippy idle pose to Danny. Iterate until approved.**
- [ ] Create Zippy full sprite sheet `sidekick.png` (384x256, 6 cols x 4 rows):
  - [ ] `idle` -- 4 frames at 6fps (bouncing on toes, head tilt)
  - [ ] `cheering` -- 4 frames at 8fps (jump 6px, arms V-shape, sparkle)
  - [ ] `peeking` -- 4 frames at 4fps (top half only: goggles, eyes, head, wave)
  - [ ] `running` -- 6 frames at 10fps (side view run cycle, hair streaming)
- [ ] Generate `sidekick.json` atlas JSON
- [ ] Verify sidekick sprite sheet loads in Phaser, all 4 animations play correctly
- [ ] Commit Zippy sprite sheet and atlas

**Bella (The Fixer)**

- [ ] Design Bella idle pose -- 64x64 pixel art, 2.8-head proportions, auburn bun, blue work shirt, blue cap, golden wrench, gray pants, freckles
- [ ] **APPROVAL GATE: Show Bella idle pose to Danny. Iterate until approved.**
- [ ] Create Bella full sprite sheet `fixer.png` (256x256, 4 cols x 4 rows):
  - [ ] `idle` -- 4 frames at 3fps (subtle wrench rotation 1px tilt)
  - [ ] `waving` -- 4 frames at 5fps (left hand waves 60-120 degrees)
  - [ ] `thumbsUp` -- 4 frames at 4fps (arm rises, thumb up, wrench glow)
  - [ ] `hammering` -- 4 frames at 6fps (wrench overhead, swing down, impact starburst, bounce)
- [ ] Generate `fixer.json` atlas JSON
- [ ] Verify fixer sprite sheet loads in Phaser, all 4 animations play correctly
- [ ] Commit Bella sprite sheet and atlas

**Cross-character verification:**

- [ ] Place all 3 characters side by side -- Grux largest, Bella medium, Zippy smallest
- [ ] Verify consistent outline weight and color palette cohesion across characters

### Phase 3: Building Tileset

- [ ] Create sample brick tiles (standard brick, highlighted brick, window-empty) as 32x32 pixel art to establish style
- [ ] **APPROVAL GATE: Show tileset sample (2-3 brick/window tiles) to Danny. Iterate until approved.**
- [ ] Create full `bricks.png` tileset (256x256, 8x8 grid of 32x32 tiles):
  - [ ] Row 0: brick types (standard, variant, highlighted, crumbling, dark, foundation x2, empty)
  - [ ] Row 1: window frames (empty, cat, Grux peek, Zippy peek, Bella peek, bird, lit, curtained)
  - [ ] Row 2: door and ground (door top/bottom, grass edges, dirt, sidewalk)
  - [ ] Row 3: roof and decorations (roof slopes, peak, flag, antenna, weather vane, chimney)
  - [ ] Row 4: building details (ledge, pipe, flower box, AC unit, balcony, fire escape, awning)
- [ ] Verify tileset loads as Phaser spritesheet with `frameWidth: 32, frameHeight: 32`
- [ ] Test: assemble a 7-tile-wide building floor from tiles, verify it looks cohesive
- [ ] Commit building tileset

### Phase 4: Math Manipulative Sprites

- [ ] Create `manipulatives.png` (256x256) with all elements:
  - [ ] Row 0: blue circles (48px diameter) -- normal, highlighted (glow), ghost (30% opacity), small (24px)
  - [ ] Row 1: orange 5-unit rectangles (120x48) -- normal, highlighted (2 cols each)
  - [ ] Row 2: orange rectangles -- ghost, small (60x24)
  - [ ] Row 3: group brackets (left/right), equals sign (16x16), multiply sign (16x16)
- [ ] Generate `manipulatives.json` atlas JSON with named frames
- [ ] Verify all 3 states (normal/highlighted/ghost) are visually distinguishable
- [ ] Verify rectangle shows 5-section division lines
- [ ] Commit manipulative sprites

### Phase 5: UI Elements

- [ ] Create UI element mockup: numpad button (normal/pressed/disabled states) + hint button
- [ ] **APPROVAL GATE: Show numpad button + hint button mockup to Danny. Iterate until approved.**
- [ ] Create full `ui.png` (512x512):
  - [ ] Numpad buttons 0-9, each 64x64, normal state (blue gradient, white pixel-font number, drop shadow)
  - [ ] Button pressed state (shifted down 2px, darker, no shadow)
  - [ ] Button disabled state (gray, muted number)
  - [ ] Backspace button 64x64 (left-arrow icon, normal + pressed)
  - [ ] Submit/check button 128x64 (green gradient, white checkmark, normal + pressed + disabled)
  - [ ] Hint button 80x80 (amber circle, lightbulb icon, normal + with "-2" badge + with "-1" badge)
  - [ ] Progress dots 16x16 (filled green, empty outline, current gold)
  - [ ] Heart 24x24 (red pixel art heart)
  - [ ] Star 24x24 (gold 5-pointed star)
  - [ ] Speech bubble 9-slice 48x48 (white, dark border, 16px borders) + tail pieces (left/right, 16x12)
- [ ] Generate `ui.json` atlas JSON
- [ ] Verify numpad renders at correct 208x280 game layout (3x4 grid + 8px gaps)
- [ ] Verify 9-slice speech bubble scales from 120px to 300px width without distortion
- [ ] Commit UI sprites

### Phase 6: Particle Effect Sprites

- [ ] Create `particles.png` (128x128):
  - [ ] Row 0 (8px tall): 16 confetti pieces -- red/blue/green/yellow/purple squares (6x6) + colored circles (6px)
  - [ ] Row 1 (16px tall): 6 brick debris fragments -- large to tiny (8x6 down to 3x2, terracotta) + mortar dust
  - [ ] Row 2 (32px tall): 6 sparkle/starburst variants -- 4-pointed stars (8/12/16px), 6-pointed sparkle, ring burst, diamond
  - [ ] Row 3 (32px tall): 4 dust cloud frames (12px to 32px, decreasing opacity 80% to 20%)
  - [ ] Row 4 (32px tall): impact effects -- star, ring, speed lines, musical note
- [ ] Generate `particles.json` atlas JSON with named frames (variable sizes)
- [ ] Test confetti emitter, debris emitter, sparkle emitter, dust animation in Phaser
- [ ] Commit particle sprites

### Phase 7: Background Layers

- [ ] Create sky background `sky.png` (960x540): gradient #87CEEB to #E8F0F8, sun at (820,70), 3 clouds
- [ ] Create cityscape `cityscape.png` (1440x200): 3-depth silhouette buildings in blue-gray tones, ~15 window dots
- [ ] Create ground `ground.png` (960x100): grass tufts, soil gradient, 2 small flowers
- [ ] **APPROVAL GATE: Show all 3 background layers composited together to Danny. Iterate until approved.**
- [ ] Verify layers composite correctly (sky behind cityscape behind ground)
- [ ] Verify cityscape parallax at 0.3 scroll factor looks good
- [ ] Commit background layers

### Phase 8: Asset Pipeline

- [ ] Create `scripts/generate-atlas.ts` for generating Phaser atlas JSON from grid sprite sheets
- [ ] Verify all atlas JSON files load correctly in Phaser (wrecker, sidekick, fixer, manipulatives, ui, particles)
- [ ] Create asset directory structure under `public/assets/` (sprites/, tiles/, backgrounds/)
- [ ] Commit atlas generation script and directory structure

### Phase 9: Background Generation Script

- [ ] Create `scripts/generate-backgrounds.ts` using node-canvas (sky, cityscape, ground generators)
- [ ] Run script, verify output matches hand-created backgrounds (or replace them)
- [ ] Commit background generation script

### Phase 10: App Branding & Logo

- [ ] Design game logo "Build It Up!" -- pixel art title graphic, ~320x80, warm colors matching palette
- [ ] **APPROVAL GATE: Show logo to Danny. Iterate until approved.**
- [ ] Create favicon `favicon.ico` (32x32) and PWA icons (192x192, 512x512) -- simplified logo/brick icon
- [ ] Create web app splash/loading screen graphic (centered logo + simple loading animation)
- [ ] Commit branding assets

### Phase 11: In-Game HUD Elements

- [ ] Design brick counter display (shows total bricks earned, brick icon + number)
- [ ] Design level indicator ("Level 3" with tier badge)
- [ ] Design question text area (styled frame/panel for "3 x 5 = ?")
- [ ] Design answer display area (where typed digits appear)
- [ ] Design "Take a break" overlay (friendly message, character waving, continue/stop buttons)
- [ ] Design scene transition effects (fade, slide, or brick-wipe)
- [ ] **APPROVAL GATE: Show HUD elements mockup to Danny**
- [ ] Commit HUD assets

### Phase 12: Dashboard Visual Theme

- [ ] Create Tailwind color theme mapping game palette to dashboard:
  - Primary: Deep Blue #06628d
  - Accent: Sky Blue #2aa7c9
  - Warm: Orange #e46b43
  - Background: Light Cream #FFF8E1
  - Success: Green #4CAF50
  - Warning: Soft Red #EF5350
- [ ] Design kid avatar set -- 12 pixel art character heads (32x32) as alternatives to emoji
- [ ] **APPROVAL GATE: Show pixel art avatars to Danny. Keep emoji option too if preferred.**
- [ ] Design empty state illustrations (small pixel art scenes):
  - "No sessions yet" -- character sitting on a single brick
  - "No kids added" -- character holding a sign
  - "Connection lost" -- character looking confused
- [ ] **APPROVAL GATE: Show empty state illustrations to Danny**
- [ ] Commit dashboard visual assets

### Phase 13: Construction Site Props (Optional)

- [ ] Create `construction.png` (256x512): crane arm (256x64), crane mast (32x256), scaffold sections, concrete mixer, sign, cone, barrel, brick pile, plank pile
- [ ] Generate `construction.json` atlas JSON
- [ ] Commit construction props

### Final Verification

- [ ] All sprite sheets under 2048x2048 (largest is ui.png at 512x512)
- [ ] All PNGs have correct transparency (no opaque backgrounds)
- [ ] Total art asset download size under 1 MB
- [ ] Nearest-neighbor scaling at 2x and 3x shows crisp pixels (no blur)
- [ ] Load all assets in Phaser test scene, run through every animation
- [ ] Commit final integration test scene

---

## Art Direction Summary

- **Characters:** Pixel art, 64x64 pixels per frame
- **Tiles:** Pixel art, 32x32 pixels per tile
- **UI elements:** Pixel art with flat color fills, various sizes
- **Backgrounds:** Flat vector/gradient style (not pixel art), rendered as PNG
- **Manipulatives:** Clean flat shapes with slight pixel-art shading
- **Scaling method:** Nearest-neighbor (no anti-aliasing) for all pixel art
- **Color depth:** 32-bit RGBA (PNG with transparency)

---

## Phase 1: Character Design Documents

### Character 1: Grux (The Wrecker)

**Role:** Main character. Climbs the building as it grows. Reacts to correct and wrong answers.

**Visual Description:**
- **Proportions:** 2.5 heads tall (chibi/super-deformed). Head is ~26px, body is ~38px. Stocky, wide shoulders (40px wide at shoulders), short thick legs.
- **Body shape:** Barrel-chested rectangle. Arms are thick cylinders, hands are oversized (8x8px mitts). Legs are stubby, 10px long.
- **Face:** Round head with flat top (like a cinder block). Two large white eyes (6x4px each) with black 2x2px pupils. Thick dark eyebrows (2px tall). Wide friendly grin (8px wide, 1px teeth line). No visible neck.
- **Hair:** Messy dark brown spikes on top of head, 4-5 pixel tufts pointing different directions.
- **Outfit:** Worn orange overalls with one strap hanging loose. Brown work boots (4px tall). Yellow hard hat (tilted slightly).
- **Distinguishing features:** A small crack/lightning-bolt shaped scar on the hard hat. Oversized hands that are almost comically large relative to body.
- **Personality through animation:** Moves with heavy, deliberate weight. Bounces slightly when happy. Stomps when frustrated. Gentle despite size.

**Color Palette:**

| Part | Color | Hex |
|------|-------|-----|
| Skin (base) | Warm peach | `#F0B088` |
| Skin (shadow) | Darker peach | `#C88060` |
| Skin (highlight) | Light peach | `#FFD0B0` |
| Hair | Dark brown | `#4A3020` |
| Hair (highlight) | Medium brown | `#6B4830` |
| Overalls (base) | Warm orange | `#E07030` |
| Overalls (shadow) | Dark orange | `#B85020` |
| Overalls (highlight) | Light orange | `#F09048` |
| Hard hat (base) | Yellow | `#F0D030` |
| Hard hat (shadow) | Dark yellow | `#C0A020` |
| Hard hat (highlight) | Bright yellow | `#FFF060` |
| Boots (base) | Brown | `#705030` |
| Boots (shadow) | Dark brown | `#503820` |
| Eyes (white) | White | `#FFFFFF` |
| Eyes (pupil) | Black | `#202020` |
| Eyebrows | Dark brown | `#3A2010` |
| Mouth | Dark red-brown | `#602020` |
| Outline | Near-black | `#282020` |

**Pixel Dimensions:** 64x64 per frame

**Animations:**

| Animation | Frames | Frame Rate | Loop | Description |
|-----------|--------|-----------|------|-------------|
| `idle` | 4 | 4 fps | yes (-1) | Slight breathing: chest expands/contracts by 1px. Frame 1: neutral. Frame 2: chest up 1px. Frame 3: neutral. Frame 4: chest down 1px. Blink on frame 3 (eyes close for 1 frame every 3 loops, handled by random timer in code). |
| `happy` | 6 | 8 fps | no (0) | Frame 1: arms start at sides. Frame 2: arms swing outward 4px. Frame 3: small jump (whole sprite up 4px), arms fully up, mouth open wide (add 2px). Frame 4: peak of jump (up 6px), sparkle particles at hands. Frame 5: descending (up 2px), arms coming down. Frame 6: landing (back to ground), slight squash (1px shorter, 2px wider for 1 frame). |
| `frustrated` | 6 | 6 fps | no (0) | Frame 1: neutral face. Frame 2: eyebrows angle down (inner corners drop 1px), mouth becomes wavy line. Frame 3: shoulders hunch up 2px. Frame 4: stomps right foot (foot drops 1px below baseline, dust puff at foot, 3x3px). Frame 5: stomps left foot. Frame 6: returns to neutral but with slumped shoulders (shoulders 1px lower than idle). |
| `climbing` | 6 | 6 fps | yes (-1) | Side view. Frame 1: right hand reaches up (arm extended 6px above head). Frame 2: body pulls up 4px. Frame 3: left hand reaches up. Frame 4: body pulls up 4px more. Frame 5: right foot plants on wall. Frame 6: left foot plants, cycle complete. Body should shift up 8px total per cycle (offset managed by game code, sprite stays centered). |
| `waving` | 4 | 5 fps | yes (-1) | Frame 1: right arm extended to side at 45 degrees. Frame 2: right arm rotated up to 90 degrees (straight up). Frame 3: right arm at 135 degrees (other side). Frame 4: right arm back to 90 degrees. Hand open, fingers spread. |

---

### Character 2: Zippy (The Sidekick)

**Role:** Small energetic helper. Appears in building windows, does commentary animations, runs across screen for celebrations.

**Visual Description:**
- **Proportions:** 3 heads tall but only 40px of the 64px frame used (smaller character). Head is ~14px, body ~26px. Lean and angular.
- **Body shape:** Thin, triangular torso (wide shoulders tapering to narrow waist). Long legs relative to body (12px). Small pointed feet.
- **Face:** Round head with pointed chin. Large eyes (7x5px each, taking up 60% of face) with large green irises (3x3px) and tiny white highlight dot. Small triangular nose (2x2px). Wide smile showing 2-3 teeth.
- **Hair:** Bright teal spiky hair, swept back like running in wind. 6-7 spikes radiating from top of head, 4-8px long each.
- **Outfit:** Green hoodie with a white lightning bolt on the chest (4x6px bolt shape). Dark shorts. Red sneakers with white sole stripe.
- **Distinguishing features:** Goggles pushed up on forehead (orange-tinted lenses, 10x4px). A small tool belt with a wrench and hammer visible as 2-3px details.
- **Personality through animation:** Quick, snappy movements. Overshoots positions and snaps back. Vibrates slightly during idle (excited energy).

**Color Palette:**

| Part | Color | Hex |
|------|-------|-----|
| Skin (base) | Light tan | `#E8C8A0` |
| Skin (shadow) | Medium tan | `#C0A070` |
| Skin (highlight) | Pale | `#FFF0D8` |
| Hair (base) | Teal | `#20B0A0` |
| Hair (shadow) | Dark teal | `#108878` |
| Hair (highlight) | Bright teal | `#40D8C8` |
| Hoodie (base) | Green | `#40A848` |
| Hoodie (shadow) | Dark green | `#308038` |
| Hoodie (highlight) | Light green | `#58C060` |
| Lightning bolt | White | `#FFFFFF` |
| Shorts | Dark gray-green | `#384038` |
| Sneakers (base) | Red | `#D83030` |
| Sneakers (sole) | White | `#F0F0F0` |
| Goggles (lens) | Orange tint | `#F0A030` |
| Goggles (frame) | Dark gray | `#484848` |
| Tool belt | Brown | `#806040` |
| Eyes (white) | White | `#FFFFFF` |
| Eyes (iris) | Green | `#30A030` |
| Eyes (pupil) | Black | `#181818` |
| Outline | Near-black | `#202828` |

**Pixel Dimensions:** 64x64 per frame (character occupies ~40x48 of the frame, centered horizontally, bottom-aligned)

**Animations:**

| Animation | Frames | Frame Rate | Loop | Description |
|-----------|--------|-----------|------|-------------|
| `idle` | 4 | 6 fps | yes (-1) | Bouncing on toes. Frame 1: standing on toes, body up 1px. Frame 2: flat-footed, body at baseline. Frame 3: toes again, body up 1px, head tilts right 1px. Frame 4: flat-footed, head straight. Faster cycle than Grux to convey energy. |
| `cheering` | 4 | 8 fps | no (0) | Frame 1: both fists at chest. Frame 2: jump up 6px, both arms shoot straight up, mouth open. Frame 3: peak, arms making V shape, sparkle above head. Frame 4: land with slight squash, arms pump down. |
| `peeking` | 4 | 4 fps | no (0) | Only top half of sprite visible (bottom half behind window frame, rendered by building tile). Frame 1: just goggles visible above window edge. Frame 2: eyes visible. Frame 3: full head visible, grinning. Frame 4: hand appears and waves (small wave, 3px motion). |
| `running` | 6 | 10 fps | yes (-1) | Side view, moving right. Classic run cycle. Frame 1: contact (right foot forward, left back). Frame 2: passing (left leg swinging forward). Frame 3: high point (airborne, both feet off ground, 2px above baseline). Frame 4: contact (left foot forward). Frame 5: passing (right leg swinging). Frame 6: high point. Arms pump opposite to legs. Hair streams behind. |

---

### Character 3: Bella (The Fixer)

**Role:** Appears in building windows to encourage the player. Waves, gives thumbs up, hammers on things to "fix" the building as it grows.

**Visual Description:**
- **Proportions:** 2.8 heads tall. Head is ~18px, body ~32px. Medium build, neat posture, stands straight.
- **Body shape:** Balanced proportions, neither stocky nor thin. Square shoulders but narrower than Grux. Neat and symmetrical.
- **Face:** Oval head. Medium eyes (5x4px) with blue irises. Small rounded nose. Calm, confident smile (6px wide, slight upturn). Light freckles (3-4 single-pixel dots across cheeks in slightly darker skin tone).
- **Hair:** Auburn/copper hair in a neat bun with a few loose strands framing face. Bun is ~8x8px circle at back of head.
- **Outfit:** Blue work shirt with rolled-up sleeves (showing forearms). Gold/brass belt buckle (3x2px). Gray work pants. Blue boots. A golden tool (magic wrench) held in right hand (6px long, gold color).
- **Distinguishing features:** Gold star badge on shirt pocket (3x3px star shape). The magic wrench glows faintly (1px gold outline around it). A small blue cap (not hard hat -- more like a baseball cap).
- **Personality through animation:** Smooth, deliberate movements. Always smiling. Economical motion (no wasted energy, contrast to Zippy).

**Color Palette:**

| Part | Color | Hex |
|------|-------|-----|
| Skin (base) | Medium peach | `#E8B890` |
| Skin (shadow) | Warm shadow | `#C89068` |
| Skin (highlight) | Light | `#FFF0D0` |
| Freckles | Warm brown | `#B08060` |
| Hair (base) | Auburn | `#A05020` |
| Hair (shadow) | Dark auburn | `#783818` |
| Hair (highlight) | Copper | `#C87038` |
| Shirt (base) | Blue | `#3878C0` |
| Shirt (shadow) | Dark blue | `#285898` |
| Shirt (highlight) | Light blue | `#5098E0` |
| Belt buckle | Gold | `#D0A020` |
| Pants (base) | Gray | `#787880` |
| Pants (shadow) | Dark gray | `#585860` |
| Boots (base) | Blue | `#305080` |
| Boots (shadow) | Dark blue | `#203858` |
| Cap (base) | Blue | `#3070B0` |
| Cap (brim) | Dark blue | `#205090` |
| Wrench (base) | Gold | `#E0B830` |
| Wrench (glow) | Bright gold | `#FFF078` |
| Star badge | Gold | `#D0A020` |
| Eyes (white) | White | `#FFFFFF` |
| Eyes (iris) | Blue | `#3060C0` |
| Eyes (pupil) | Black | `#181818` |
| Outline | Near-black | `#202030` |

**Pixel Dimensions:** 64x64 per frame

**Animations:**

| Animation | Frames | Frame Rate | Loop | Description |
|-----------|--------|-----------|------|-------------|
| `idle` | 4 | 3 fps | yes (-1) | Very subtle. Frame 1: neutral. Frame 2: wrench rotates slightly (1px clockwise tilt). Frame 3: neutral. Frame 4: wrench rotates back (1px counter-clockwise). Cap brim catches light differently each frame (highlight pixel shifts). |
| `waving` | 4 | 5 fps | yes (-1) | Left hand waves while right holds wrench at side. Frame 1: left arm at 60 degrees. Frame 2: left arm at 90 degrees. Frame 3: left arm at 120 degrees. Frame 4: left arm at 90 degrees. Fingers open, palm facing viewer. |
| `thumbsUp` | 4 | 4 fps | no (0) | Frame 1: right arm (with wrench) at side. Frame 2: right arm rises to chest height, wrench tucked. Frame 3: right arm fully extended forward, thumb up (2x3px thumb shape), wrench glows brightly (2px glow outline). Frame 4: holds pose, wrench sparkle (single pixel alternates white/gold). |
| `hammering` | 4 | 6 fps | yes (-1) | Frame 1: wrench raised above head (arm fully extended up). Frame 2: wrench at 45 degrees, coming down. Frame 3: wrench hits surface (at character's waist level), impact star burst (3x3px white flash). Frame 4: wrench bouncing back up to 45 degrees, golden sparkle trail (2-3 pixels). |

---

## Phase 2: Sprite Sheet Specifications

### Layout Convention

All sprite sheets use **horizontal strip** layout: frames arranged left-to-right, one animation per row, multiple rows per sheet.

```
Row 0: idle (4 frames)      → pixels [0,0] to [255, 63]
Row 1: animation2 (N frames) → pixels [0,64] to [N*64-1, 127]
Row 2: animation3 (N frames) → pixels [0,128] to [N*64-1, 191]
...
```

### Sprite Sheet: Grux (wrecker.png)

**Dimensions:** 384 x 320 pixels (6 columns x 5 rows, each cell 64x64)

```
Row 0 (y=0):   idle        → 4 frames (cols 0-3), cols 4-5 empty
Row 1 (y=64):  happy       → 6 frames (cols 0-5)
Row 2 (y=128): frustrated  → 6 frames (cols 0-5)
Row 3 (y=192): climbing    → 6 frames (cols 0-5)
Row 4 (y=256): waving      → 4 frames (cols 0-3), cols 4-5 empty
```

**Phaser Atlas JSON (wrecker.json):**

```json
{
  "textures": [{
    "image": "wrecker.png",
    "format": "RGBA8888",
    "size": { "w": 384, "h": 320 },
    "frames": [
      { "filename": "idle_0", "frame": { "x": 0, "y": 0, "w": 64, "h": 64 } },
      { "filename": "idle_1", "frame": { "x": 64, "y": 0, "w": 64, "h": 64 } },
      { "filename": "idle_2", "frame": { "x": 128, "y": 0, "w": 64, "h": 64 } },
      { "filename": "idle_3", "frame": { "x": 192, "y": 0, "w": 64, "h": 64 } },
      { "filename": "happy_0", "frame": { "x": 0, "y": 64, "w": 64, "h": 64 } },
      { "filename": "happy_1", "frame": { "x": 64, "y": 64, "w": 64, "h": 64 } },
      { "filename": "happy_2", "frame": { "x": 128, "y": 64, "w": 64, "h": 64 } },
      { "filename": "happy_3", "frame": { "x": 192, "y": 64, "w": 64, "h": 64 } },
      { "filename": "happy_4", "frame": { "x": 256, "y": 64, "w": 64, "h": 64 } },
      { "filename": "happy_5", "frame": { "x": 320, "y": 64, "w": 64, "h": 64 } },
      { "filename": "frustrated_0", "frame": { "x": 0, "y": 128, "w": 64, "h": 64 } },
      { "filename": "frustrated_1", "frame": { "x": 64, "y": 128, "w": 64, "h": 64 } },
      { "filename": "frustrated_2", "frame": { "x": 128, "y": 128, "w": 64, "h": 64 } },
      { "filename": "frustrated_3", "frame": { "x": 192, "y": 128, "w": 64, "h": 64 } },
      { "filename": "frustrated_4", "frame": { "x": 256, "y": 128, "w": 64, "h": 64 } },
      { "filename": "frustrated_5", "frame": { "x": 320, "y": 128, "w": 64, "h": 64 } },
      { "filename": "climbing_0", "frame": { "x": 0, "y": 192, "w": 64, "h": 64 } },
      { "filename": "climbing_1", "frame": { "x": 64, "y": 192, "w": 64, "h": 64 } },
      { "filename": "climbing_2", "frame": { "x": 128, "y": 192, "w": 64, "h": 64 } },
      { "filename": "climbing_3", "frame": { "x": 192, "y": 192, "w": 64, "h": 64 } },
      { "filename": "climbing_4", "frame": { "x": 256, "y": 192, "w": 64, "h": 64 } },
      { "filename": "climbing_5", "frame": { "x": 320, "y": 192, "w": 64, "h": 64 } },
      { "filename": "waving_0", "frame": { "x": 0, "y": 256, "w": 64, "h": 64 } },
      { "filename": "waving_1", "frame": { "x": 64, "y": 256, "w": 64, "h": 64 } },
      { "filename": "waving_2", "frame": { "x": 128, "y": 256, "w": 64, "h": 64 } },
      { "filename": "waving_3", "frame": { "x": 192, "y": 256, "w": 64, "h": 64 } }
    ]
  }]
}
```

**Phaser Loading Code:**

```typescript
// In Boot.ts (preload)
this.load.atlas('wrecker', 'assets/sprites/wrecker.png', 'assets/sprites/wrecker.json');

// In Game.ts (create)
this.anims.create({
  key: 'wrecker-idle',
  frames: this.anims.generateFrameNames('wrecker', {
    prefix: 'idle_', start: 0, end: 3
  }),
  frameRate: 4,
  repeat: -1
});

this.anims.create({
  key: 'wrecker-happy',
  frames: this.anims.generateFrameNames('wrecker', {
    prefix: 'happy_', start: 0, end: 5
  }),
  frameRate: 8,
  repeat: 0
});

this.anims.create({
  key: 'wrecker-frustrated',
  frames: this.anims.generateFrameNames('wrecker', {
    prefix: 'frustrated_', start: 0, end: 5
  }),
  frameRate: 6,
  repeat: 0
});

this.anims.create({
  key: 'wrecker-climbing',
  frames: this.anims.generateFrameNames('wrecker', {
    prefix: 'climbing_', start: 0, end: 5
  }),
  frameRate: 6,
  repeat: -1
});

this.anims.create({
  key: 'wrecker-waving',
  frames: this.anims.generateFrameNames('wrecker', {
    prefix: 'waving_', start: 0, end: 3
  }),
  frameRate: 5,
  repeat: -1
});

const grux = this.add.sprite(400, 300, 'wrecker');
grux.play('wrecker-idle');
```

### Sprite Sheet: Zippy (sidekick.png)

**Dimensions:** 384 x 256 pixels (6 columns x 4 rows, each cell 64x64)

```
Row 0 (y=0):   idle     → 4 frames (cols 0-3)
Row 1 (y=64):  cheering → 4 frames (cols 0-3)
Row 2 (y=128): peeking  → 4 frames (cols 0-3)
Row 3 (y=192): running  → 6 frames (cols 0-5)
```

**Phaser Loading Code:**

```typescript
this.load.atlas('sidekick', 'assets/sprites/sidekick.png', 'assets/sprites/sidekick.json');

this.anims.create({
  key: 'sidekick-idle',
  frames: this.anims.generateFrameNames('sidekick', {
    prefix: 'idle_', start: 0, end: 3
  }),
  frameRate: 6,
  repeat: -1
});

this.anims.create({
  key: 'sidekick-cheering',
  frames: this.anims.generateFrameNames('sidekick', {
    prefix: 'cheering_', start: 0, end: 3
  }),
  frameRate: 8,
  repeat: 0
});

this.anims.create({
  key: 'sidekick-peeking',
  frames: this.anims.generateFrameNames('sidekick', {
    prefix: 'peeking_', start: 0, end: 3
  }),
  frameRate: 4,
  repeat: 0
});

this.anims.create({
  key: 'sidekick-running',
  frames: this.anims.generateFrameNames('sidekick', {
    prefix: 'running_', start: 0, end: 5
  }),
  frameRate: 10,
  repeat: -1
});
```

### Sprite Sheet: Bella (fixer.png)

**Dimensions:** 256 x 256 pixels (4 columns x 4 rows, each cell 64x64)

```
Row 0 (y=0):   idle     → 4 frames (cols 0-3)
Row 1 (y=64):  waving   → 4 frames (cols 0-3)
Row 2 (y=128): thumbsUp → 4 frames (cols 0-3)
Row 3 (y=192): hammering → 4 frames (cols 0-3)
```

**Phaser Loading Code:**

```typescript
this.load.atlas('fixer', 'assets/sprites/fixer.png', 'assets/sprites/fixer.json');

this.anims.create({
  key: 'fixer-idle',
  frames: this.anims.generateFrameNames('fixer', {
    prefix: 'idle_', start: 0, end: 3
  }),
  frameRate: 3,
  repeat: -1
});

this.anims.create({
  key: 'fixer-waving',
  frames: this.anims.generateFrameNames('fixer', {
    prefix: 'waving_', start: 0, end: 3
  }),
  frameRate: 5,
  repeat: -1
});

this.anims.create({
  key: 'fixer-thumbsUp',
  frames: this.anims.generateFrameNames('fixer', {
    prefix: 'thumbsUp_', start: 0, end: 3
  }),
  frameRate: 4,
  repeat: 0
});

this.anims.create({
  key: 'fixer-hammering',
  frames: this.anims.generateFrameNames('fixer', {
    prefix: 'hammering_', start: 0, end: 3
  }),
  frameRate: 6,
  repeat: -1
});
```

### Shared SpriteSheet Interface (matches orchestrator contract)

```typescript
const SPRITE_SHEETS: Record<string, SpriteSheet> = {
  wrecker: {
    key: 'wrecker',
    path: '/assets/sprites/wrecker.png',
    frameWidth: 64,
    frameHeight: 64,
    animations: {
      'wrecker-idle':       { frames: [0,1,2,3],         frameRate: 4,  repeat: -1 },
      'wrecker-happy':      { frames: [4,5,6,7,8,9],     frameRate: 8,  repeat: 0  },
      'wrecker-frustrated': { frames: [10,11,12,13,14,15], frameRate: 6, repeat: 0  },
      'wrecker-climbing':   { frames: [16,17,18,19,20,21], frameRate: 6, repeat: -1 },
      'wrecker-waving':     { frames: [22,23,24,25],      frameRate: 5,  repeat: -1 },
    },
  },
  sidekick: {
    key: 'sidekick',
    path: '/assets/sprites/sidekick.png',
    frameWidth: 64,
    frameHeight: 64,
    animations: {
      'sidekick-idle':      { frames: [0,1,2,3],           frameRate: 6,  repeat: -1 },
      'sidekick-cheering':  { frames: [4,5,6,7],           frameRate: 8,  repeat: 0  },
      'sidekick-peeking':   { frames: [8,9,10,11],         frameRate: 4,  repeat: 0  },
      'sidekick-running':   { frames: [12,13,14,15,16,17], frameRate: 10, repeat: -1 },
    },
  },
  fixer: {
    key: 'fixer',
    path: '/assets/sprites/fixer.png',
    frameWidth: 64,
    frameHeight: 64,
    animations: {
      'fixer-idle':      { frames: [0,1,2,3],     frameRate: 3, repeat: -1 },
      'fixer-waving':    { frames: [4,5,6,7],     frameRate: 5, repeat: -1 },
      'fixer-thumbsUp':  { frames: [8,9,10,11],   frameRate: 4, repeat: 0  },
      'fixer-hammering': { frames: [12,13,14,15],  frameRate: 6, repeat: -1 },
    },
  },
};
```

---

## Phase 3: Building Tileset

### Tile Size: 32x32 pixels

### Tileset Sheet: bricks.png

**Dimensions:** 256 x 256 pixels (8 columns x 8 rows of 32x32 tiles)

**Tile Map:**

```
Row 0: Brick types
  [0,0] Standard brick (terracotta, 2x1 brick pattern with mortar lines)
  [1,0] Standard brick variant (slightly different shade for visual variety)
  [2,0] Highlighted brick (just placed -- brighter, slight yellow-white glow)
  [3,0] Crumbling brick (cracks across surface, fragments separating)
  [4,0] Dark brick (shadow/depth, for sides of building)
  [5,0] Foundation stone (gray, heavier-looking, flat top)
  [6,0] Foundation stone variant
  [7,0] Empty/transparent

Row 1: Window frames
  [0,1] Window - empty (dark interior, light frame, 4px border)
  [1,1] Window - with cat (orange tabby silhouette, 2 green pixel eyes)
  [2,1] Window - with Grux peeking (simplified 12x12 face)
  [3,1] Window - with Zippy peeking (simplified 12x12 face, goggles)
  [4,1] Window - with Bella peeking (simplified 12x12 face, cap)
  [5,1] Window - with bird (small blue bird on sill, 6x4px)
  [6,1] Window - lit (warm yellow glow interior)
  [7,1] Window - curtained (red curtains, partially drawn)

Row 2: Door and ground level
  [0,2] Door - top half (arched top, brown wood)
  [1,2] Door - bottom half (brown wood, brass handle 2px circle)
  [2,2] Ground/grass left edge
  [3,2] Ground/grass center (repeatable)
  [4,2] Ground/grass right edge
  [5,2] Dirt/soil (below grass, brown)
  [6,2] Sidewalk (gray concrete, horizontal lines)
  [7,2] Sidewalk edge

Row 3: Roof and top decorations
  [0,3] Roof tile left slope
  [1,3] Roof tile center (repeatable)
  [2,3] Roof tile right slope
  [3,3] Roof peak/ridge
  [4,3] Flag on pole (small triangular flag, red, 8x6px flag on 1px pole)
  [5,3] Antenna (thin vertical line with small circle at top)
  [6,3] Weather vane (rooster silhouette, 8x8px, pointing right)
  [7,3] Chimney (small, brown, 6x8px, subtle smoke wisp)

Row 4: Building details
  [0,4] Ledge/cornice (horizontal line with slight overhang)
  [1,4] Pipe/drainpipe (vertical, gray, 2px wide)
  [2,4] Flower box (below window, green with 3 colored dots for flowers)
  [3,4] Air conditioner unit (gray box, 8x6px, in window)
  [4,4] Balcony railing (iron railing pattern, 32x8px bottom-aligned)
  [5,4] Fire escape segment (metal stairs, side view)
  [6,4] Awning (striped red/white, triangular)
  [7,4] Empty/reserved
```

**Color Palette for Tiles:**

| Element | Color | Hex |
|---------|-------|-----|
| Standard brick | Terracotta | `#C07048` |
| Standard brick (shadow) | Dark terracotta | `#984830` |
| Standard brick (highlight) | Light terracotta | `#D89068` |
| Mortar lines | Light gray | `#D8C8B8` |
| Highlighted brick | Bright orange | `#F0A050` |
| Highlighted brick (glow) | Yellow-white | `#FFF8D0` |
| Crumbling brick | Faded terracotta | `#B08868` |
| Dark brick | Deep brown | `#684028` |
| Foundation | Gray | `#808890` |
| Foundation (dark) | Dark gray | `#606870` |
| Window frame | Cream | `#E8D8C0` |
| Window interior | Dark blue | `#182030` |
| Door | Brown | `#705030` |
| Grass | Green | `#50A840` |
| Grass (dark) | Dark green | `#388030` |
| Dirt | Brown | `#907050` |
| Roof | Dark red | `#903030` |
| Roof (shadow) | Deeper red | `#702020` |

**Phaser Loading Code:**

```typescript
// Load as tileset image
this.load.image('bricks-tileset', 'assets/tiles/bricks.png');

// If using Tiled maps:
this.load.tilemapTiledJSON('building-map', 'assets/tiles/building-map.json');

// For programmatic building (more likely for this game):
this.load.spritesheet('bricks', 'assets/tiles/bricks.png', {
  frameWidth: 32,
  frameHeight: 32,
});

// Place a brick:
const brick = this.add.sprite(x, y, 'bricks', tileIndex);
// tileIndex = row * 8 + col (e.g., standard brick = 0, window empty = 8)
```

### Building Construction Logic (for Game Engine agent)

The building is constructed programmatically, not from a pre-made tilemap. Each floor is:

```
[pipe] [brick] [brick] [window] [brick] [brick] [pipe]
```

A 7-tile-wide floor at 32px per tile = 224px wide.

The building grows from bottom up:
- Floor 0: foundation stones + door
- Floors 1-N: bricks + windows (window placement varies per floor)
- Top floor: roof tiles + decoration

---

## Phase 4: Math Manipulative Sprites

### Sprite Sheet: manipulatives.png

**Dimensions:** 256 x 128 pixels

**Layout:**

```
Row 0 (y=0, height=64): Large manipulatives (for dragging, 64px tall)
  [0,0] Blue circle (1-unit), 48x48 centered in 64x64 cell
  [1,0] Blue circle (1-unit) highlighted/dragging -- glow outline
  [2,0] Blue circle (1-unit) ghost/shadow -- 30% opacity version
  [3,0] Empty

Row 1 (y=64, height=64): Large rectangles and small manipulatives
  [0,1] Orange rectangle (5-unit), 240x48 -- BUT this won't fit in 64x64!
```

**Revised layout for the 5-unit rectangle problem:**

The 5-unit rectangle is wider than a single cell. Use a separate approach:

```
manipulatives.png (256 x 256)

Row 0 (y=0, 64px tall): Individual circles
  Col 0: Blue circle, normal (48px diameter, centered in 64x64)
  Col 1: Blue circle, highlighted (48px + 4px glow outline = 56px)
  Col 2: Blue circle, ghost/drop-target (48px, 30% opacity)
  Col 3: Blue circle, small (24px diameter, for grid display, centered in 64x64)

Row 1 (y=64, 64px tall): 5-unit rectangles (each takes 2 columns = 128px wide)
  Cols 0-1: Orange rectangle, normal (120x48px, centered in 128x64)
  Cols 2-3: Orange rectangle, highlighted (120x48 + 4px glow = 128x56)

Row 2 (y=128, 64px tall): 5-unit rectangles continued
  Cols 0-1: Orange rectangle, ghost (120x48, 30% opacity)
  Cols 2-3: Orange rectangle, small (60x24px, for grid display)

Row 3 (y=192, 64px tall): Group outlines and decorations
  Col 0: Group bracket left (vertical line with top/bottom hooks, 8x48px, white)
  Col 1: Group bracket right (mirror of left)
  Col 2: Equals sign (16x16, white, centered in 64x64)
  Col 3: Times/multiply sign (16x16, white, centered in 64x64)
```

**Color Specifications:**

| Element | State | Fill | Outline | Glow |
|---------|-------|------|---------|------|
| Circle (1-unit) | Normal | `#2196F3` | `#1565C0` (2px dark blue) | none |
| Circle (1-unit) | Highlighted | `#2196F3` | `#FFFFFF` (2px white) | `#64B5F6` (4px, 50% opacity) |
| Circle (1-unit) | Ghost | `#2196F3` at 30% | `#1565C0` at 30% | none |
| Rectangle (5-unit) | Normal | `#FF9800` | `#E65100` (2px dark orange) | none |
| Rectangle (5-unit) | Highlighted | `#FF9800` | `#FFFFFF` (2px white) | `#FFB74D` (4px, 50% opacity) |
| Rectangle (5-unit) | Ghost | `#FF9800` at 30% | `#E65100` at 30% | none |

**Circle rendering details (48px diameter, normal state):**

```
Pixel art circle at 48px: not a perfect mathematical circle.
Use a hand-pixeled circle with these properties:
- 2px outline in dark blue (#1565C0)
- Fill with base blue (#2196F3)
- 4x4px highlight spot in upper-left quadrant (#64B5F6)
- 2x2px specular highlight in upper-left (#BBDEFB)
- Subtle 1px shadow on bottom-right inner edge (#1565C0)
```

**Rectangle rendering details (120x48px, normal state):**

```
Rounded rectangle (4px corner radius in pixel art = 2px diagonal cut at corners)
- 2px outline in dark orange (#E65100)
- Fill with base orange (#FF9800)
- Internal division lines showing 5 equal sections:
  Each section is 24px wide (120/5), separated by 1px darker orange (#E65100) lines
  This visually reinforces "5 units"
- 4x4px highlight in upper-left of first section (#FFB74D)
- 2x2px specular highlight (#FFE0B2)
```

**Phaser Loading Code:**

```typescript
// Load as atlas with JSON
this.load.atlas('manipulatives', 'assets/sprites/manipulatives.png', 'assets/sprites/manipulatives.json');

// Or as spritesheet for simpler access:
this.load.spritesheet('manip-circles', 'assets/sprites/manipulatives.png', {
  frameWidth: 64,
  frameHeight: 64,
});

// Create a draggable circle:
const circle = this.add.sprite(x, y, 'manipulatives', 'circle_normal');
circle.setInteractive({ draggable: true });

circle.on('dragstart', () => {
  circle.setFrame('circle_highlighted');
});

circle.on('dragend', () => {
  circle.setFrame('circle_normal');
});
```

---

## Phase 5: UI Elements

### Sprite Sheet: ui.png

**Dimensions:** 512 x 512 pixels

**Layout (variable-sized elements, packed):**

```
Section A (y=0, 256px): Numpad buttons
  Row 0 (y=0):   Buttons 1-5, each 64x64, 5 cells
  Row 1 (y=64):  Buttons 6-9 + 0, each 64x64, 5 cells
  Row 2 (y=128): Button states for 1 (normal, pressed, disabled) = 3 x 64x64
                  + Backspace button (normal, pressed) = 2 x 64x64
  Row 3 (y=192): Submit/check button (128x64, takes 2 cells) normal
                  Submit/check button (128x64) pressed
                  Submit/check button (128x64) disabled

Section B (y=256, 256px): Other UI
  Row 4 (y=256): Hint button normal (80x80), hint button with "-2" badge, hint button with "-1" badge
  Row 5 (y=336): Progress dot (filled, 16x16), progress dot (empty), heart (24x24), star (24x24)
  Row 6 (y=360): Speech bubble tail-left (64x48), speech bubble tail-right (64x48)
  Row 7 (y=408): Speech bubble body (variable, 9-slice -- see below)
```

### Numpad Button Specifications (64x64 each)

**Normal state:**
- Background: rounded rectangle, 60x60 centered in 64x64
- Fill: gradient from `#3878C0` (top) to `#285898` (bottom)
- Border: 2px `#1A3A6E`
- Corner radius: 6px (pixel art approximation: 3px diagonal cuts)
- Number: white `#FFFFFF`, rendered as pixel font, ~24px tall, centered
- Subtle 2px inner highlight at top edge: `#5098E0`
- 2px drop shadow below button: `#1A2A40`

**Pressed state:**
- Same shape but shifted down 2px (shadow disappears)
- Fill: `#285898` (darker, no gradient)
- Border: 2px `#1A3A6E`
- Number: `#D0D8E0` (slightly dimmed)

**Disabled state:**
- Fill: `#808890` (gray)
- Border: 2px `#606870`
- Number: `#A0A8B0` (muted)
- 50% overall opacity effect

**Number pixel font:** Each digit is approximately 16x24 pixels, monospaced, sans-serif, thick strokes (3px).

### Numpad Layout in Game

```
[1] [2] [3]
[4] [5] [6]
[7] [8] [9]
[⌫] [0] [✓]
```

Total numpad size: 3 x 64 + 2 x 8 (gaps) = 208px wide, 4 x 64 + 3 x 8 = 280px tall.

### Backspace Button (64x64)

**Normal:** Same style as numpad but with left-arrow icon (16x12px arrow shape) instead of number. Arrow color: white.
**Pressed:** Same pressed treatment as numpad.

### Submit/Check Button (128x64)

**Normal:** Green background gradient `#4CAF50` top to `#388E3C` bottom. White checkmark icon (20x16px). 2px border `#2E7D32`. Inner highlight `#66BB6A`.
**Pressed:** Darker green `#388E3C`, no gradient, shifted down 2px.
**Disabled:** Gray `#808890`, dim checkmark.

### Hint Button (80x80)

**Normal:** Circular button (76px diameter centered in 80x80).
- Fill: `#FFC107` (amber/gold)
- Border: 2px `#FF8F00`
- Icon: lightbulb shape (12x18px, white), centered
- Inner highlight: 2px `#FFD54F` at top

**With cost badge:** Same button, plus a small red circle (20x20px) in upper-right corner.
- Badge fill: `#EF5350`
- Badge border: 2px `#C62828`
- Badge text: "-2" or "-1" in white, 8px tall pixel font

### Progress Dots (16x16 each)

- **Filled:** Circle 12px diameter, `#4CAF50` fill, `#388E3C` outline
- **Empty:** Circle 12px diameter, transparent fill, `#B0B8C0` outline (2px)
- **Current:** Circle 12px diameter, `#FFC107` fill, `#FF8F00` outline, slight pulse (handled by code, not sprite)

### Heart Decoration (24x24)

- Classic pixel art heart shape
- Fill: `#EF5350`
- Outline: `#C62828`
- 2x2px highlight in upper-left lobe: `#FF8A80`

### Star Decoration (24x24)

- 5-pointed star
- Fill: `#FFC107`
- Outline: `#FF8F00`
- 2x2px highlight in upper point: `#FFF176`

### Speech Bubble (9-slice, scalable)

A 9-slice sprite allows the speech bubble to be any size. The source image is 48x48 with 16px borders.

```
[TL 16x16] [T  16x16] [TR 16x16]
[L  16x16] [C  16x16] [R  16x16]
[BL 16x16] [B  16x16] [BR 16x16]
```

Plus a separate tail piece (16x12px triangle) that can be positioned left, center, or right below the bubble.

- Background: white `#FFFFFF`
- Border: 2px `#404040`
- Corner radius: 8px (pixel art: 4px cuts)
- Tail: same white fill with dark border, triangular pointing down

**Phaser 9-slice usage:**

```typescript
this.load.spritesheet('speech-bubble', 'assets/sprites/ui.png', {
  frameWidth: 48,
  frameHeight: 48,
});

// Phaser 3.60+ has built-in NineSlice:
const bubble = this.add.nineslice(
  x, y,
  'speech-bubble', 0,  // frame index
  200, 80,              // desired width, height
  16, 16, 16, 16        // left, right, top, bottom borders
);
```

**Full UI Phaser Loading:**

```typescript
this.load.atlas('ui', 'assets/sprites/ui.png', 'assets/sprites/ui.json');

// Numpad buttons
const btn1 = this.add.sprite(x, y, 'ui', 'numpad_1_normal');
btn1.setInteractive();
btn1.on('pointerdown', () => btn1.setFrame('numpad_1_pressed'));
btn1.on('pointerup', () => {
  btn1.setFrame('numpad_1_normal');
  this.events.emit('numpad-press', 1);
});
```

---

## Phase 6: Particle Effect Sprites

### Sprite Sheet: particles.png

**Dimensions:** 128 x 128 pixels

**Layout:**

```
Row 0 (y=0, 16px tall): Confetti pieces (8x8 each, 16 variants across)
  Cols 0-1:  Red square (#EF5350), 6x6 filled, 1px gap
  Cols 2-3:  Blue square (#2196F3), 6x6 filled
  Cols 4-5:  Green square (#4CAF50), 6x6 filled
  Cols 6-7:  Yellow square (#FFC107), 6x6 filled
  Cols 8-9:  Purple square (#AB47BC), 6x6 filled
  Cols 10-11: Red circle (#EF5350), 6px diameter
  Cols 12-13: Blue circle (#2196F3), 6px diameter
  Cols 14-15: Gold circle (#FFC107), 6px diameter

Row 1 (y=16, 16px tall): Brick debris (8x8 each)
  Col 0: Large brick fragment (8x6, terracotta #C07048, irregular shape)
  Col 1: Medium brick fragment (6x4, terracotta)
  Col 2: Small brick fragment (4x3, terracotta)
  Col 3: Tiny brick chip (3x2, terracotta)
  Col 4: Mortar dust (4x4, gray #D8C8B8, soft-edged)
  Col 5: Mortar dust small (2x2, gray)

Row 2 (y=32, 32px tall): Sparkle/star burst (16x16 each)
  Col 0: 4-pointed star, small (8x8), white (#FFFFFF) center, gold (#FFC107) points
  Col 1: 4-pointed star, medium (12x12), same colors
  Col 2: 4-pointed star, large (16x16), same colors
  Col 3: 6-pointed star/sparkle (16x16), white center, gold tips
  Col 4: Ring/circle burst (16x16), gold outline only, expanding ring shape
  Col 5: Diamond sparkle (8x8), white with gold outline

Row 3 (y=64, 32px tall): Dust cloud frames (32x32 each, 4 frames)
  Col 0: Dust - initial puff (small circle, 12px, gray #B0A898 at 80% opacity)
  Col 1: Dust - expanding (18px circle, 60% opacity)
  Col 2: Dust - large (26px circle, 40% opacity, wispy edges)
  Col 3: Dust - dissipating (32px, 20% opacity, very wispy)

Row 4 (y=96, 32px tall): Impact effects
  Col 0: Impact star (16x16, white, 4-pointed, sharp)
  Col 1: Impact ring (24x24, white outline, expanding)
  Col 2: Speed lines (32x8, 3 horizontal dashes, white, for running Zippy)
  Col 3: Musical note (8x12, white, for celebration)
```

**Phaser Particle Emitter Code:**

```typescript
// Load particle sheet
this.load.spritesheet('particles', 'assets/sprites/particles.png', {
  frameWidth: 8,
  frameHeight: 8,
});

// Confetti emitter (celebration)
const confetti = this.add.particles(centerX, centerY, 'particles', {
  frame: [0, 2, 4, 6, 8, 10, 12, 14],  // all confetti variants
  lifespan: 2000,
  speed: { min: 100, max: 300 },
  angle: { min: 220, max: 320 },        // spray upward
  gravityY: 200,
  rotate: { min: 0, max: 360 },
  scale: { start: 2, end: 1 },          // 2x scale for visibility
  quantity: 3,
  frequency: 50,
  duration: 1500,
});

// Brick debris emitter (wrong answer)
const debris = this.add.particles(brickX, brickY, 'particles', {
  frame: [16, 17, 18, 19, 20, 21],  // brick fragment frames (row 1)
  lifespan: 1000,
  speed: { min: 50, max: 150 },
  angle: { min: 200, max: 340 },
  gravityY: 400,
  rotate: { min: 0, max: 360 },
  scale: { start: 2, end: 1 },
  quantity: 8,
  frequency: -1,  // explode (one-shot)
});
debris.explode(8);

// Sparkle (correct answer, at character position)
const sparkle = this.add.particles(charX, charY, 'particles', {
  frame: [32, 33, 34, 35],  // sparkle frames (row 2, adjusted for 16x16 sizing)
  lifespan: 600,
  speed: { min: 20, max: 80 },
  angle: { min: 0, max: 360 },
  scale: { start: 1.5, end: 0 },
  alpha: { start: 1, end: 0 },
  quantity: 1,
  frequency: 100,
  duration: 800,
});
```

**Note on particle frame indices:** The indices above assume a consistent frame size for the spritesheet loading. Since particles use mixed sizes (8x8, 16x16, 32x32), the implementing agent should either:
1. Create separate sprite sheets per particle size, OR
2. Use the atlas JSON format with named frames of varying sizes (recommended)

Recommended approach: single `particles.json` atlas with named frames:

```json
{
  "frames": [
    { "filename": "confetti_red_sq", "frame": { "x": 0, "y": 0, "w": 8, "h": 8 } },
    { "filename": "confetti_blue_sq", "frame": { "x": 8, "y": 0, "w": 8, "h": 8 } },
    { "filename": "sparkle_small", "frame": { "x": 0, "y": 32, "w": 16, "h": 16 } },
    { "filename": "dust_0", "frame": { "x": 0, "y": 64, "w": 32, "h": 32 } },
    { "filename": "dust_1", "frame": { "x": 32, "y": 64, "w": 32, "h": 32 } },
    { "filename": "dust_2", "frame": { "x": 64, "y": 64, "w": 32, "h": 32 } },
    { "filename": "dust_3", "frame": { "x": 96, "y": 64, "w": 32, "h": 32 } }
  ]
}
```

---

## Phase 7: Background Layers

Backgrounds are flat-style PNGs (not pixel art) rendered at the game's canvas resolution. The game targets a 16:9 aspect ratio at 960x540 logical pixels (scales up via Phaser's scale manager).

### Layer 0: Sky Gradient (sky.png)

**Dimensions:** 960 x 540 pixels
**Description:** Vertical gradient from light blue at top to pale warm blue at horizon.
- Top: `#87CEEB` (sky blue)
- Middle: `#B0E0F0` (pale blue)
- Horizon (y=400): `#E8F0F8` (near-white blue)
- Optional: 2-3 simple white clouds (flat shapes, no detail). Cloud 1: 120x40px at (150, 80). Cloud 2: 80x30px at (600, 120). Cloud 3: 100x35px at (350, 60).
- Clouds are flat white `#FFFFFF` with slight transparency (90% opacity).
- A subtle sun in upper right: circle 60px diameter, `#FFF9C4` fill, no outline, positioned at (820, 70).

**Phaser code:**
```typescript
this.load.image('sky', 'assets/backgrounds/sky.png');
// In create:
this.add.image(480, 270, 'sky').setScrollFactor(0);
```

### Layer 1: Distant Cityscape (cityscape.png) -- Parallax

**Dimensions:** 1440 x 200 pixels (wider than screen for parallax scrolling)
**Position:** Bottom-aligned, y offset so bottoms are at ~y=440 (above ground)

**Description:** Silhouette-style buildings in muted blue-gray tones. 5-7 building shapes of varying height (80-180px tall), some with lit window dots (2x2px yellow `#FFF9C4`). No detail -- just flat rectangular shapes with occasional triangle roofs.

**Colors:**
- Nearest buildings: `#5C7080` (medium blue-gray)
- Middle buildings: `#7890A0` (lighter blue-gray)
- Farthest buildings: `#90A8B8` (palest, most atmospheric)
- Window dots: `#FFF9C4` (warm yellow), randomly placed, ~10-15 total across cityscape

**Parallax factor:** 0.3 (moves at 30% of camera speed)

```typescript
this.load.image('cityscape', 'assets/backgrounds/cityscape.png');
// In create:
const city = this.add.tileSprite(480, 440, 960, 200, 'cityscape');
city.setScrollFactor(0.3, 0);
```

### Layer 2: Ground/Grass (ground.png)

**Dimensions:** 960 x 100 pixels
**Position:** Bottom of screen, y=440 to y=540

**Description:**
- Top 8px: grass line -- irregular green blobs/tufts, `#50A840` with `#388030` shadow, against transparent background
- Next 20px: soil/dirt gradient from `#907050` to `#786040`
- Bottom 72px: deeper soil `#685838`, with subtle horizontal lines suggesting layers

Some grass details:
- Small flower (4px, red `#EF5350` dot on green stem) at x=200
- Small flower (4px, yellow `#FFC107`) at x=650
- 3-4 tufts of taller grass (8px tall, 2px wide, `#388030`) scattered

**Phaser code:**
```typescript
this.load.image('ground', 'assets/backgrounds/ground.png');
// In create:
this.add.image(480, 490, 'ground').setScrollFactor(0);
```

### Layer 3: Construction Site Elements (construction.png)

**Dimensions:** 256 x 512 pixels (sprite sheet of individual elements)

**Elements (placed programmatically by game engine):**

```
[0,0] Crane arm (256x64): horizontal beam, yellow #F0D030,
      with diagonal support struts, cable hanging from tip (1px dark line)

[0,64] Crane mast (32x256): vertical yellow beam with cross-braces

[0,320] Scaffold section (64x64): metal frame (gray #808080, 2px lines),
        wooden platform (brown #A07840)

[64,320] Scaffold section with ladder (64x64): same + ladder on right side

[128,320] Concrete mixer (48x48): barrel shape, gray #909090,
          with rotating drum (3 frames for idle animation at 2fps)

[0,384] Construction sign (32x48): orange triangle on pole,
        "!" symbol in black, #FF8F00 background

[32,384] Safety cone (16x32): orange #FF6D00 and white striped cone

[48,384] Barrel (24x32): blue #1565C0 barrel with yellow band

[0,416] Pile of bricks (48x32): stack of loose terracotta bricks,
        messy pile shape, 4-5 bricks visible

[48,416] Wooden plank pile (48x24): 3 brown planks stacked
```

These are optional decoration elements placed around the building site to add atmosphere.

```typescript
this.load.atlas('construction', 'assets/sprites/construction.png', 'assets/sprites/construction.json');

// Place crane:
const craneArm = this.add.sprite(buildingX + 100, buildingTopY - 40, 'construction', 'crane_arm');
const craneMast = this.add.sprite(buildingX - 16, buildingTopY, 'construction', 'crane_mast');
craneMast.setOrigin(0.5, 1); // bottom-aligned
```

---

## Phase 8: Asset Pipeline

### Tool Selection

**Primary tool: Piskel (browser-based, free)**
- URL: https://www.piskelapp.com/
- Use for: all pixel art assets (characters, tiles, UI, particles)
- Export format: PNG sprite sheet (horizontal strip or grid)
- Workflow: create in Piskel, export PNG, write atlas JSON manually or with script

**Secondary tool: PixelLab (AI-assisted)**
- URL: https://www.pixellab.ai/
- Use for: generating initial character poses that are then refined in Piskel
- PixelLab generates individual frames that can be assembled into sheets

**Background tool: Any vector editor or code-generated**
- Backgrounds are simple gradients and flat shapes
- Can be generated programmatically with Canvas API or a simple script
- Alternatively: Figma (free tier), Inkscape, or even CSS gradients exported as PNG

### PixelLab Prompts for Character Generation

**Grux (Wrecker) - Idle Pose:**
```
pixel art, 64x64, game character sprite, front-facing, idle pose,
large stocky construction worker, barrel chest, oversized hands,
orange overalls, yellow hard hat tilted, brown work boots,
warm peach skin, dark brown messy hair, friendly expression,
big white eyes, wide grin, chibi proportions (2.5 heads tall),
retro arcade style, transparent background, no outline doubling
```

**Grux - Happy/Celebrating:**
```
pixel art, 64x64, game character sprite sheet, 6 frames horizontal strip,
large stocky construction worker jumping for joy, arms raised,
orange overalls, yellow hard hat, chibi proportions,
celebration animation sequence, retro arcade style, transparent background
```

**Zippy (Sidekick) - Idle Pose:**
```
pixel art, 64x64, game character sprite, front-facing, idle pose,
small energetic kid character, thin build, spiky teal hair,
green hoodie with lightning bolt, red sneakers, orange goggles on forehead,
bouncing on toes, big green eyes, wide smile,
retro arcade style, transparent background
```

**Zippy - Running:**
```
pixel art, 64x64, sprite sheet, 6 frames horizontal strip,
small kid character run cycle, side view, teal spiky hair streaming back,
green hoodie, red sneakers, fast energetic run,
retro arcade style, transparent background
```

**Bella (Fixer) - Idle Pose:**
```
pixel art, 64x64, game character sprite, front-facing, idle pose,
medium build female character, auburn hair in bun, blue work shirt,
blue cap, golden wrench tool in hand, gray work pants,
neat appearance, confident smile, freckles,
retro arcade style, transparent background
```

**Building Tiles:**
```
pixel art tileset, 32x32 per tile, 8 tiles in a row,
terracotta brick wall tiles for a building construction game,
includes: standard brick, highlighted brick, crumbling brick, dark brick,
mortar lines visible, retro arcade style, transparent background
```

### Piskel Workflow

1. **Create new project** at piskelapp.com
2. **Set canvas size** to the full sprite sheet dimensions (e.g., 384x320 for Grux)
3. **Draw frame by frame**, using the onion skin feature to maintain consistency between frames
4. **Use layers:** Layer 1 = outline, Layer 2 = base colors, Layer 3 = shadows/highlights
5. **Color palette:** Import the hex codes from this plan into Piskel's palette editor
6. **Preview animation** using Piskel's built-in animation preview
7. **Export:** File > Export > PNG (single image, all frames in grid layout)
8. **Verify:** Open exported PNG, confirm transparency, confirm correct dimensions

### Export Settings

For all exports:
- Format: PNG-32 (RGBA, 8 bits per channel)
- Transparency: ON (important -- no background color)
- Scaling: 1x (do NOT upscale in the export -- Phaser handles display scaling via nearest-neighbor)
- Compression: Maximum (PNGs are lossless regardless of compression level)

### Atlas JSON Generation Script

Create a simple Node.js script to generate Phaser atlas JSON from a grid-based sprite sheet:

```typescript
// scripts/generate-atlas.ts
//
// Usage: npx tsx scripts/generate-atlas.ts --input wrecker --cols 6 --rows 5 --fw 64 --fh 64 --anims "idle:0-3,happy:4-9,frustrated:10-15,climbing:16-21,waving:22-25"

interface AtlasFrame {
  filename: string;
  frame: { x: number; y: number; w: number; h: number };
}

function generateAtlas(
  name: string,
  cols: number,
  rows: number,
  frameWidth: number,
  frameHeight: number,
  animations: Record<string, [number, number]>  // name -> [startFrame, endFrame]
): object {
  const frames: AtlasFrame[] = [];

  for (const [animName, [start, end]] of Object.entries(animations)) {
    for (let i = start; i <= end; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      frames.push({
        filename: `${animName}_${i - start}`,
        frame: {
          x: col * frameWidth,
          y: row * frameHeight,
          w: frameWidth,
          h: frameHeight,
        },
      });
    }
  }

  return {
    textures: [{
      image: `${name}.png`,
      format: 'RGBA8888',
      size: { w: cols * frameWidth, h: rows * frameHeight },
      frames,
    }],
  };
}
```

### Asset Directory Structure

Matches the orchestrator plan's file structure:

```
public/
  assets/
    sprites/
      wrecker.png          # 384x320, Grux sprite sheet
      wrecker.json         # Phaser atlas JSON
      sidekick.png         # 384x256, Zippy sprite sheet
      sidekick.json
      fixer.png            # 256x256, Bella sprite sheet
      fixer.json
      manipulatives.png    # 256x256, math manipulatives
      manipulatives.json
      construction.png     # 256x512, construction site props
      construction.json
      ui.png               # 512x512, all UI elements
      ui.json
      particles.png        # 128x128, all particle effects
      particles.json
    tiles/
      bricks.png           # 256x256, building tileset (8x8 grid of 32x32)
    backgrounds/
      sky.png              # 960x540, sky gradient with clouds
      cityscape.png        # 1440x200, distant building silhouettes
      ground.png           # 960x100, grass and soil
```

---

## Phase 9: Background Generation Script

Since backgrounds are simple flat-style graphics, they can be generated programmatically. This avoids dependency on art tools for non-pixel-art assets.

```typescript
// scripts/generate-backgrounds.ts
//
// Generates sky.png, cityscape.png, and ground.png using node-canvas

import { createCanvas } from 'canvas';
import * as fs from 'fs';

function generateSky() {
  const canvas = createCanvas(960, 540);
  const ctx = canvas.getContext('2d');

  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 540);
  grad.addColorStop(0, '#87CEEB');
  grad.addColorStop(0.5, '#B0E0F0');
  grad.addColorStop(0.85, '#E8F0F8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 960, 540);

  // Sun
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#FFF9C4';
  ctx.beginPath();
  ctx.arc(820, 70, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Clouds (simple ellipses)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  drawCloud(ctx, 150, 80, 120, 40);
  drawCloud(ctx, 600, 120, 80, 30);
  drawCloud(ctx, 350, 60, 100, 35);

  fs.writeFileSync('public/assets/backgrounds/sky.png', canvas.toBuffer('image/png'));
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.ellipse(x - w * 0.3, y + h * 0.1, w * 0.3, h * 0.4, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.3, y + h * 0.1, w * 0.25, h * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
}

function generateCityscape() {
  const canvas = createCanvas(1440, 200);
  const ctx = canvas.getContext('2d');

  // Building silhouettes at 3 depth levels
  const depths = [
    { color: '#90A8B8', buildings: [{x:50,w:80,h:100},{x:200,w:60,h:80},{x:400,w:100,h:120},{x:700,w:70,h:90},{x:900,w:90,h:110},{x:1100,w:80,h:95},{x:1300,w:70,h:85}] },
    { color: '#7890A0', buildings: [{x:100,w:70,h:130},{x:300,w:90,h:150},{x:550,w:60,h:110},{x:800,w:80,h:140},{x:1000,w:100,h:120},{x:1200,w:75,h:130}] },
    { color: '#5C7080', buildings: [{x:30,w:100,h:160},{x:250,w:80,h:180},{x:500,w:110,h:150},{x:750,w:90,h:170},{x:1050,w:85,h:155},{x:1350,w:95,h:145}] },
  ];

  for (const depth of depths) {
    ctx.fillStyle = depth.color;
    for (const b of depth.buildings) {
      ctx.fillRect(b.x, 200 - b.h, b.w, b.h);
    }
  }

  // Window dots on nearest buildings
  ctx.fillStyle = '#FFF9C4';
  // Scatter ~15 small 2x2 dots across the nearest layer buildings
  const nearBuildings = depths[2].buildings;
  for (const b of nearBuildings) {
    for (let i = 0; i < 3; i++) {
      const wx = b.x + 10 + Math.random() * (b.w - 20);
      const wy = 200 - b.h + 15 + Math.random() * (b.h - 30);
      ctx.fillRect(Math.floor(wx), Math.floor(wy), 2, 2);
    }
  }

  fs.writeFileSync('public/assets/backgrounds/cityscape.png', canvas.toBuffer('image/png'));
}

function generateGround() {
  const canvas = createCanvas(960, 100);
  const ctx = canvas.getContext('2d');

  // Soil gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 100);
  grad.addColorStop(0, '#907050');
  grad.addColorStop(0.2, '#786040');
  grad.addColorStop(1, '#685838');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 8, 960, 92);

  // Grass tufts along top edge
  ctx.fillStyle = '#50A840';
  for (let x = 0; x < 960; x += 3 + Math.floor(Math.random() * 5)) {
    const h = 4 + Math.floor(Math.random() * 6);
    ctx.fillRect(x, 8 - h, 2, h);
  }

  // Darker grass shadows
  ctx.fillStyle = '#388030';
  for (let x = 0; x < 960; x += 7 + Math.floor(Math.random() * 10)) {
    ctx.fillRect(x + 1, 6, 1, 3);
  }

  // Small flowers
  ctx.fillStyle = '#EF5350';
  ctx.fillRect(200, 2, 3, 3);
  ctx.fillStyle = '#388030';
  ctx.fillRect(201, 5, 1, 4);

  ctx.fillStyle = '#FFC107';
  ctx.fillRect(650, 1, 3, 3);
  ctx.fillStyle = '#388030';
  ctx.fillRect(651, 4, 1, 5);

  fs.writeFileSync('public/assets/backgrounds/ground.png', canvas.toBuffer('image/png'));
}
```

---

## Asset Summary Table

| Asset | File | Dimensions | Frames | Format |
|-------|------|-----------|--------|--------|
| Grux (Wrecker) | `sprites/wrecker.png + .json` | 384x320 | 26 | Atlas |
| Zippy (Sidekick) | `sprites/sidekick.png + .json` | 384x256 | 18 | Atlas |
| Bella (Fixer) | `sprites/fixer.png + .json` | 256x256 | 16 | Atlas |
| Manipulatives | `sprites/manipulatives.png + .json` | 256x256 | 12 | Atlas |
| UI Elements | `sprites/ui.png + .json` | 512x512 | ~40 | Atlas |
| Particles | `sprites/particles.png + .json` | 128x128 | ~30 | Atlas |
| Construction Props | `sprites/construction.png + .json` | 256x512 | ~10 | Atlas |
| Building Tiles | `tiles/bricks.png` | 256x256 | 40 tiles | Spritesheet |
| Sky | `backgrounds/sky.png` | 960x540 | 1 | Image |
| Cityscape | `backgrounds/cityscape.png` | 1440x200 | 1 | Image |
| Ground | `backgrounds/ground.png` | 960x100 | 1 | Image |

**Total sprite sheet area:** well under the 2048x2048 mobile GPU limit per sheet. The largest sheet is 512x512 (UI).

**Total estimated file size:** ~200-400 KB for all sprites (pixel art compresses extremely well as PNG). Backgrounds add ~100-200 KB. Total art assets: ~400-600 KB.

---

## Testing Strategy

### Visual Verification

For each sprite sheet:
1. Load in Phaser test scene
2. Play each animation, verify frame count and timing
3. Check that transparency is correct (no white/colored background)
4. Verify nearest-neighbor scaling at 2x and 3x (no blurriness)
5. Confirm all frames align properly (no jitter/offset between frames)

### Cross-Asset Consistency

1. Place all 3 characters side by side -- verify relative sizing makes sense (Grux largest, Zippy smallest, Bella medium)
2. Place a character next to building tiles -- verify scale relationship (character should be ~2 tiles tall)
3. Place manipulatives next to characters -- verify they look proportional
4. Test particle effects overlaid on building -- verify colors complement

### Mobile Performance

1. Load all assets simultaneously and measure total GPU memory
2. Verify no texture sheet exceeds 2048x2048
3. Test on low-end Android device (Pixel 3a or similar) -- confirm no texture loading failures
4. Measure total asset download size with compression

### Phaser Integration Test

```typescript
// test-scene.ts -- a minimal Phaser scene that loads and displays all assets
class AssetTestScene extends Phaser.Scene {
  preload() {
    // Load all sprite sheets
    this.load.atlas('wrecker', 'assets/sprites/wrecker.png', 'assets/sprites/wrecker.json');
    this.load.atlas('sidekick', 'assets/sprites/sidekick.png', 'assets/sprites/sidekick.json');
    this.load.atlas('fixer', 'assets/sprites/fixer.png', 'assets/sprites/fixer.json');
    this.load.atlas('ui', 'assets/sprites/ui.png', 'assets/sprites/ui.json');
    this.load.atlas('manipulatives', 'assets/sprites/manipulatives.png', 'assets/sprites/manipulatives.json');
    this.load.atlas('particles', 'assets/sprites/particles.png', 'assets/sprites/particles.json');
    this.load.spritesheet('bricks', 'assets/tiles/bricks.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('sky', 'assets/backgrounds/sky.png');
    this.load.image('cityscape', 'assets/backgrounds/cityscape.png');
    this.load.image('ground', 'assets/backgrounds/ground.png');
  }

  create() {
    // Display backgrounds
    this.add.image(480, 270, 'sky');
    this.add.image(480, 440, 'ground');

    // Display characters with idle animations
    const grux = this.add.sprite(200, 400, 'wrecker').setScale(2);
    const zippy = this.add.sprite(400, 400, 'sidekick').setScale(2);
    const bella = this.add.sprite(600, 400, 'fixer').setScale(2);

    // Create and play all animations (animation creation code from Phase 2)
    // ...

    grux.play('wrecker-idle');
    zippy.play('sidekick-idle');
    bella.play('fixer-idle');

    // Display sample tiles
    for (let i = 0; i < 8; i++) {
      this.add.sprite(100 + i * 34, 460, 'bricks', i).setScale(2);
    }

    // Click to cycle through animations
    this.input.on('pointerdown', () => {
      // Cycle through animation states
    });
  }
}
```

---

## Risks & Considerations

| Risk | Severity | Mitigation |
|------|----------|------------|
| AI-generated sprites lack consistency between frames | High | Use PixelLab for initial poses only. Refine in Piskel frame-by-frame. Maintain strict color palette. |
| Characters look too similar to Disney IP | Medium | Follow this plan's original designs strictly. No brown overalls on Grux (orange instead). No candy motifs on Zippy. No golden hammer on Bella (golden wrench instead). Danny reviews before integration. |
| Sprite alignment jitter between animation frames | Medium | Use Piskel's onion skin feature. Keep all sprites bottom-center aligned within their 64x64 frame. Anchor point at (0.5, 1.0) in Phaser. |
| Mobile GPU texture limits | Low | All sheets are well under 2048x2048. Total VRAM usage is minimal for pixel art. |
| Pixel art looks too simple at large display sizes | Low | Game renders at 960x540 logical pixels, scaled up with nearest-neighbor. At 2x-3x scale, 64px characters appear as 128-192px -- charming, not crude. |
| 9-slice speech bubble doesn't scale cleanly | Low | Test at multiple sizes (120px to 300px width). Ensure border pixels don't distort. |

---

## Estimated Complexity

| Phase | Work | Effort |
|-------|------|--------|
| Phase 1: Character design docs | Already done in this plan | 0 |
| Phase 2: Sprite sheet specs | Already done in this plan | 0 |
| Phase 3: Building tileset | Create 40 tiles at 32x32 | Medium (2-3 hours) |
| Phase 4: Manipulatives | Create ~12 simple shapes | Low (1 hour) |
| Phase 5: UI elements | Create ~40 button/icon variants | Medium (2-3 hours) |
| Phase 6: Particles | Create ~30 small effect sprites | Low (1 hour) |
| Phase 7: Backgrounds | Generate with script or draw | Low (1 hour) |
| Phase 8: Atlas JSON files | Script-generated from sheet specs | Low (30 min) |
| **Character sprite sheets** | 26 + 18 + 16 = 60 frames of pixel art at 64x64 | **High (4-6 hours)** |

**Total estimated effort: 12-16 hours** for a single artist/agent creating all assets. The character sprite sheets are the bulk of the work.

The implementing agent should tackle assets in this order:
1. Building tiles (needed first by game engine)
2. Manipulatives (needed by manipulatives agent)
3. One character (Grux) with all animations (test the pipeline end-to-end)
4. UI elements (needed for game interaction)
5. Remaining characters (Zippy, Bella)
6. Backgrounds (can be generated last, game can use solid color placeholder)
7. Particles (polish, not blocking)
8. Construction props (optional decoration)

---

## Acceptance Criteria

- [ ] All 3 character sprite sheets exported as PNG + atlas JSON, loading correctly in Phaser
- [ ] All character animations play at specified frame rates with no visual artifacts
- [ ] Building tileset renders a 7-tile-wide building that looks cohesive
- [ ] Window tiles show characters/cat/bird at correct visual scale
- [ ] Manipulative circles and rectangles are visually distinct and clear at game scale
- [ ] All 3 manipulative states (normal, highlighted, ghost) are distinguishable
- [ ] UI numpad buttons have 3 states (normal, pressed, disabled) and are at least 64x64px
- [ ] Hint button shows cost badge clearly
- [ ] Speech bubble scales correctly via 9-slice
- [ ] Particle effects for confetti, debris, sparkle, and dust look good in Phaser emitters
- [ ] All backgrounds layer correctly (sky behind cityscape behind ground)
- [ ] No sprite sheet exceeds 2048x2048 pixels
- [ ] All PNGs have correct transparency (no opaque background on sprites)
- [ ] Total art asset download size is under 1 MB
- [ ] Assets display correctly with nearest-neighbor scaling (crisp pixels, no blur)
- [ ] Danny approves character designs before they are finalized
