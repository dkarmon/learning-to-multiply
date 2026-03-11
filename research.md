# Multiplication Learning Game -- Research Report

Generated: 2026-03-11

## Table of Contents

1. [Pedagogy & Learning Science](#1-pedagogy--learning-science)
2. [Gamification & Game Design](#2-gamification--game-design)
3. [Visual Design & Animation](#3-visual-design--animation)
4. [Technical Infrastructure](#4-technical-infrastructure)
5. [Critical Analysis & Design Decisions](#5-critical-analysis--design-decisions)
6. [Recommended Architecture](#6-recommended-architecture)
7. [Open Questions](#7-open-questions)
8. [Sources](#8-sources)

---

## 1. Pedagogy & Learning Science

### 1.1 Is Age 6 Ready for Multiplication?

**Short answer: Early, but viable with the right approach.**

Multiplication is normally introduced in Grade 3 (age 8-9) in Common Core and Singapore Math curricula. However, Cognitively Guided Instruction (CGI) research demonstrates that very young children can solve low-number multiplication through **direct modeling** -- physically representing groups and counting totals. The constraint is that problems must use small numbers and concrete/visual representations.

A 6-year-old sits at the boundary between Piaget's pre-operational stage (ages 2-7) and concrete operational stage (ages 7-11). Modern developmental psychology shows children often reach concrete operational milestones earlier than Piaget described, with substantial individual variability.

**Prerequisites that must be in place:**
1. One-to-one correspondence (reliable counting)
2. Skip counting by 2s, 5s, 10s -- the single most critical prerequisite
3. Understanding of equal groups
4. Stable addition facts for small numbers

**Implication:** Consider a skip-counting warm-up/assessment. If the child can't skip count by 2s and 5s, multiplication may be premature.

### 1.2 Danny's Visual Unitizing Model

Danny's model (1 = blue circle, 5 = orange rectangle, composite units like 6 = rectangle + circle) closely resembles **Cuisenaire rods** and aligns with research on **unitizing** -- the ability to see a collection as both individual items AND a single group.

**Research says:**
- Unitizing is "central to developing multiplicative reasoning"
- "Groupitizing" (recognizing structured groups) appears after one year of formal education and correlates with arithmetic abilities
- A meta-analysis of Cuisenaire rod studies found generally positive results, with curriculum integration being the key success variable
- Virtual manipulatives have a "moderate positive effect" on achievement (meta-analysis of 66 studies)

**Critical concern:** The model introduces **two levels of unitizing simultaneously** -- 5 as a unit, AND "6" as a composite of 5+1. For a 6-year-old, this may be too much cognitive load initially.

**Recommendation -- phased introduction:**

| Phase | Visual Model | Example Facts |
|-------|-------------|---------------|
| 1 | Circles only, grouped | 2x2, 2x3, 3x3, up to 5x5 |
| 2 | Introduce the 5-rectangle | Facts involving 5 (5x2, 5x3, etc.) |
| 3 | Composite units (rect + circles) | 6x2, 7x3, etc. |
| 4 | Full model with building-up strategy | Larger facts |

### 1.3 The "Building Up" Strategy

Danny's scaffolding approach: instead of jumping to 6x5, start with 6x2 (show visually), then ask 6x3 (add one more group of 6), then 6x4, then 6x5.

**This is strongly evidence-based.** It maps directly to the **derived facts strategy (DFS)** from math education research:

- "Research confirms that Derived Fact Strategies are highly effective in increasing math fact fluency"
- The foundational multiplication facts are x2, x5, and x10 -- these serve as the scaffolding base
- Danny's "building up by one more group" is even more targeted than standard DFS because each step adds exactly one group, making the relationship between consecutive facts visible

This also aligns with CGI's progression:
1. **Direct modeling** (youngest): physically represent each group, count all
2. **Counting strategies** (intermediate): skip count or count by groups
3. **Number facts** (fluent): recall or derive from known facts

The app should not rush past direct modeling. Let the child drag groups AND count the total.

### 1.4 Hint System Design

Research from intelligent tutoring systems (ASSISTments, Cognitive Tutor):

- **Students learn reliably more with hints-on-demand than proactive hints**
- Automatic feedback delivery "did not lead to higher learning gains"
- **Bottom-out hints (showing the answer) create serious gaming risk** -- "one of the most abused features in intelligent tutoring systems"
- Scaffolding that guides toward the answer produces better retention than answer-revealing hints

**Recommended escalation for a pre-reader:**

| Level | Trigger | Action |
|-------|---------|--------|
| 0 | Initial attempt | No hints visible |
| 1 | After ~10 seconds | Hint button glows gently |
| 2 | Child taps hint | Show groups partially formed (visual hint) |
| 3 | Child taps hint again | Animate the full solution step by step |

Never show just the numeric answer. Always show WHY through visuals.

### 1.5 Spaced Repetition

**Leitner box system** is the practical choice:

| Box | Review Frequency | Trigger |
|-----|-----------------|---------|
| 1 (Learning) | Every session + within session 2-3 items later | Wrong answer |
| 2 (Practicing) | Every other session | 1 correct from Box 1 |
| 3 (Getting it) | Every 4th session | 1 correct from Box 2 |
| 4 (Almost there) | Every 8th session | 1 correct from Box 3 |
| 5 (Mastered) | Random review every 2 weeks | 1 correct from Box 4 |

**For 6-year-olds, use gentle regression:** wrong answer moves back ONE box (not to Box 1). This prevents the discouragement of losing all progress on a fact.

**Within a session:** re-present missed problems 2-3 items later, with added visual scaffolding. Same problem returns, not a different one at the same difficulty.

### 1.6 Hebrew Language Considerations

**Math notation direction:** Israelis write math left-to-right despite Hebrew text being right-to-left. This is established practice. Use `dir="ltr"` for math expressions within RTL Hebrew text.

**The phrasing "כמה זה X פעמים Y"** (how much is X times Y) naturally maps to the "groups of" interpretation, which is pedagogically aligned with Danny's model.

**Hebrew number gender forms are genuinely tricky.** Numbers 1-10 have masculine and feminine forms, and the agreement rules are counter-intuitive. A native speaker MUST review the audio scripts. Use a lookup table, not a programmatic converter.

**TTS recommendation:** Pre-record with a native speaker. For a child-facing product, voice warmth and naturalness matter enormously. TTS APIs (Azure has 2 Hebrew neural voices, ElevenLabs has the best quality) are viable for generating the ~200-300 clips needed, at under $2 total cost. But have a native speaker review every clip.

---

## 2. Gamification & Game Design

### 2.1 Session Structure

| Parameter | Recommended Value | Research Basis |
|-----------|------------------|---------------|
| Questions per level | 5 | Tested with young children; ~2-3 min per level |
| Levels per session | 3-4 | Fits within attention span |
| Session length | 10-15 minutes | 5-7 year olds sustain focus for 15-25 min on engaging activities, less on assigned tasks |
| Time per question | ~30 seconds (including feedback) | Keeps pace engaging |

Natural break points between levels/buildings. Clear "you're done for now!" celebration after a session, with option to continue but no pressure.

### 2.2 Difficulty Sequence

**NOT numerical order.** Research-backed teaching sequence:

| Tier | Facts | Why | Level(s) |
|------|-------|-----|----------|
| 1 (Easiest) | x0, x1, x2 | Zero property, identity, doubles | 1-3 |
| 2 | x5, x10 | Pattern-based (ends in 0 or 5) | 4-5 |
| 3 | x3, x4 | Moderate difficulty | 6-8 |
| 4 | x9 | The "9s trick" (digit sum = 9) | 9-10 |
| 5 (Hardest) | x6, x7, x8 | Hardest facts cluster here | 11-15 |

**Hardest individual facts** (study of 60,000 questions): 6x8 (63% error rate), 8x6, 7x8, 7x6, 6x9, 7x9, 7x7.

**Spiral review within each level:** 60% new questions + 40% review from earlier tiers. Interleave fact families rather than blocking (don't do 10 x3 problems in a row).

### 2.3 Reward System -- The Building IS the Reward

**Critical research finding: The overjustification effect.**

Lepper, Greene & Nisbett (1973) showed that children aged 3-5 who *expected* a reward for drawing showed significantly *decreased* intrinsic interest afterwards. This effect is more pronounced in children than adults.

| Approach | Recommendation |
|----------|---------------|
| Stars/badges as primary reward | **NO** -- risks overjustification |
| Building progress as primary reward | **YES** -- intrinsic, tangible, meaningful |
| Unexpected celebrations (confetti, birds landing on roof) | **YES** -- surprise rewards don't undermine intrinsic motivation |
| "Collect 50 stars to unlock X" economy | **NO** -- creates extrinsic dependency |

The building itself is the reward. No separate currency.

### 2.4 The Brick Mechanic -- A Critical Design Decision

Danny's proposal: correct answer adds bricks (3x5=15 adds 15 bricks), wrong answer = character breaks a row.

**The addition mechanic is excellent.** Making the answer's magnitude tangible (15 bricks is visually more than 6 bricks) gives number sense. Larger answers = more dramatic building = more excitement for harder problems.

**The destruction mechanic needs rethinking.** Research on feedback in young children:

- Verification-only feedback ("Wrong!") **decreases persistence**
- Loss aversion is psychologically stronger than gain motivation
- 6-year-olds are highly sensitive to perceived failure
- Destruction mechanics decrease persistence in this age group

**Recommended alternatives (in order of preference):**

1. **Bricks don't get added** (missed opportunity, not destruction). Building stays the same. "Almost! Let's try again!"
2. **Gentle wobble** animation. Building shakes but nothing falls. Communicates "not quite" without loss.
3. **A few bricks fall** (3-5, not a whole row). Mild enough, but risky with sensitive children.

**My honest recommendation:** Option 1 or 2. Save destruction for much older kids. At 6, the character's disappointed/encouraging expression is enough feedback. The building should feel safe.

### 2.5 Hint Economy Scoring

Hints should give **fewer bonus bricks, never cost bricks.** Every correct answer always earns bricks.

| Scenario | Bricks Earned | Feedback |
|----------|--------------|----------|
| No hint, correct | Answer value + 3 bonus | "Amazing! You figured it out!" |
| Visual hint used, correct | Answer value + 1 bonus | "Great work using the blocks!" |
| Scaffolded hint used, correct | Answer value only | "You learned something new!" |
| Wrong answer | 0 bricks | "Almost! Let's try again!" |

**Encouraging independence:**
- Show a "thinking" animation for 3-5 seconds before making hints available
- Progressive reveal: hints appear only after wrong answer or 10-second wait
- Celebrate independence: "You didn't even need help this time!"

### 2.6 Wrong Answer Handling

| Step | Action |
|------|--------|
| 1st wrong attempt | "Not quite! Try again." (no answer shown) |
| 2nd wrong attempt | "The answer is 15. Let's see why:" + brief visual explanation |
| In-session retry | Same problem returns 2-3 questions later with visual scaffolding |
| Cross-session | Fact moves to Leitner Box 1 for near-term review |

**Error pattern detection** -- track these for adaptive response AND parent reporting:

| Error Type | Example | Detection | Response |
|-----------|---------|-----------|----------|
| Addition substitution | 6x4 = 10 | answer = a+b | Show "groups of" visual |
| Off-by-one | 6x4 = 28 | answer = correct +/- factor | Show skip-counting sequence |
| Neighbor confusion | 7x8 = 54 | answer matches adjacent fact | Drill both facts side by side |
| Zero/one confusion | 5x0 = 5 | swapping x0/x1 results | Re-teach: "zero groups = nothing!" |
| Commutative gap | knows 3x7, not 7x3 | inconsistent accuracy on pairs | Explicitly link: "7x3 = 3x7!" |

### 2.7 Parent Dashboard

**Hero visualization: 11x11 multiplication heat map.**

Color-coded grid: Green (mastered) -> Yellow (learning) -> Red (struggling) -> Gray (not yet introduced). Tapping a cell shows recent attempts and error types.

**Must-have metrics:**
- Facts mastered (count and % of 121 facts)
- Current level/tier in difficulty progression
- Session frequency and duration
- Accuracy trend over time
- Top 5-10 struggling facts

**Actionable insights (not just data):**

| Pattern | Example Message |
|---------|----------------|
| Struggling cluster | "Emma finds the 7s hardest. Try skip-counting by 7 together!" |
| Short sessions | "Sessions under 5 minutes aren't enough for learning. Aim for 10-15." |
| Hint dependency | "Emma uses hints on 80% of problems. Encourage trying without hints first." |
| Plateau | "Accuracy on 6x7 hasn't improved in 2 weeks. The app is adjusting difficulty." |
| Celebration | "Emma mastered all her 5s this week! 22 of 121 facts down!" |

---

## 3. Visual Design & Animation

### 3.1 Copyright -- Original Characters Required

**Disney aggressively protects its IP.** Even parody use of Disney characters has been found infringing (Walt Disney Productions v. Air Pirates). For any potentially public game, using Wreck-It Ralph characters or names is legally risky.

**What IS protected:** specific visual expression, character names (trademarked), distinctive attribute combinations.

**What is NOT protected:** stock character archetypes ("big strong guy who breaks things"), general game mechanics (building/wrecking), art styles (pixel art, retro arcade), color palettes.

**Recommendation: Design original characters from day one.**

| Archetype | Disney Version | Original Version (example) |
|-----------|---------------|---------------------------|
| Big, strong wrecker | Ralph | "Ricky the Builder" -- big, clumsy, kind |
| Small, glitchy speedster | Vanellope | "Zip" -- small, fast, sassy |
| Cheerful fixer | Felix | "Fiona" -- neat, helpful, appears in windows |

Keep the retro-arcade aesthetic (which predates the movie). Different proportions, different costumes, different hair, different names. The building/wrecking mechanic itself is not copyrightable.

### 3.2 Art Style: Pixel Art

**Recommended: Pixel art for characters, flat/vector backgrounds.**

Why pixel art:
- Naturally evokes the retro-arcade theme without copying Disney's specific designs
- Forgiving of less polished art (inherently "low-res")
- Nostalgic appeal for parents
- Smaller file sizes, faster loading on mobile
- Can be generated with AI tools for rapid prototyping

Each character needs ~20-25 sprite frames:
- Idle (3-4 frames, looping)
- Happy/celebrating (4-6 frames)
- Angry/frustrated (4-6 frames)
- Climbing (4-6 frames)
- Waving (3-4 frames)

**Tools:**
- PixelLab (AI-powered sprite animation generator)
- Aseprite (professional pixel art editor, $20)
- Piskel (free browser-based pixel art editor)
- Perchance AI Pixel Art Generator (free, no sign-up)

### 3.3 Building/Construction Mechanic

**Visual progression by height:**

| Floors | Visual State |
|--------|-------------|
| 1-3 | Foundation/ground level, dirt and grass visible |
| 4-7 | Building takes shape, windows appear, characters peek out |
| 8-12 | Building gets impressive, decorations appear |
| 13-15 | Penthouse/roof, celebration scene |

Each floor = one problem solved. Bricks stack in rows x columns, visually reinforcing multiplication (3 rows x 5 bricks = 15 total).

**Window characters appear as building grows:**
- Floor 2: A cat in the window
- Floor 4: The Fixer character waving
- Floor 6: A bird on the windowsill
- Floor 8: The Kid/sidekick character doing a silly pose
- Floor 10+: Multiple characters celebrating

**On completion:** Fireworks/confetti, all characters celebrate, building gets a personalized name, new building unlocked (apartment -> skyscraper -> castle).

### 3.4 Color Palette

**Wreck-It Ralph inspired palette (safe to use -- palettes aren't copyrightable):**

| Color | Hex | Use |
|-------|-----|-----|
| Dark Brick Red | `#3c0f0f` | Building bricks, dark accents |
| Warm Orange | `#e46b43` | Builder character, warm highlights |
| Sky Blue | `#2aa7c9` | Sky background, correct answer feedback |
| Deep Blue | `#06628d` | UI elements, buttons |
| Light Cream | `#FFF8E1` | Background (warm, not distracting) |
| Green | `#4CAF50` | Correct answer feedback |
| Soft Red | `#EF5350` | "Try again" feedback (not harsh) |
| Terracotta range | `#D4845B` to `#8B4513` | Building bricks |

**Math manipulatives:**
- Circles (1-unit): Bright Blue `#2196F3`
- Rectangles (5-unit): Warm Orange `#FF9800`
- Maximum contrast between the two for clarity

### 3.5 Animation Technology

**Decision: Phaser.js 3 vs React + Framer Motion**

The two research agents disagreed here. My assessment:

| Aspect | Phaser.js 3 | React + Framer Motion + @dnd-kit |
|--------|------------|--------------------------------|
| Bundle size | ~1.2MB | ~50KB total |
| Game features | Built-in: sprites, physics, tweens, audio, scenes, touch | Must assemble from parts |
| React integration | Via official template, but two paradigms to manage | Native React |
| Learning curve | New framework to learn | Already know React |
| Best for | "Real" game with complex animations | Quiz-based app with some animation |
| Manipulatives drag-drop | Built-in pointer events | @dnd-kit (excellent touch support) |

**My recommendation: Start with React + Framer Motion + @dnd-kit for v1.** Here's why:

1. The game is fundamentally quiz-based (show question, get answer, animate feedback)
2. The building can be rendered as stacked div/SVG elements with CSS transitions
3. Character animations can be CSS sprite sheet animations
4. @dnd-kit handles drag-and-drop manipulatives with excellent tablet support
5. You avoid managing two rendering paradigms (React DOM + Phaser Canvas)

**If the game evolves** to need physics (falling bricks), particle effects, or complex scene management, migrate the game view to Phaser while keeping the dashboard in React. But don't start there.

### 3.6 UX for Young Children

| Element | Specification |
|---------|--------------|
| Touch targets | Minimum 48x48dp, 64px gap spacing |
| Number input | On-screen numpad (not keyboard), 60x60px buttons, calculator layout |
| Feedback timing | < 200ms after answer submission |
| Drag-and-drop | Large touch zones, snap-to-grid, support both drag-to-place and tap-to-place |
| Session indicators | Building height IS the progress bar |
| Correct answer | Happy character animation, cheerful sound, bricks stacking, sparkle effect |
| Wrong answer | Gentle character reaction, supportive sound, "Try again!" -- never buzzer/red X |

---

## 4. Technical Infrastructure

### 4.1 Framework: Vite + React (not Next.js)

**Next.js adds SSR complexity this project doesn't need.** A children's math game has:
- No SEO requirements (behind auth)
- No server-side rendering needs (fully client-side interactive)
- API routes handled by Supabase directly

**Vite advantages:**
- Sub-second HMR during development
- Smaller bundles (no SSR framework overhead)
- Simpler mental model (no server/client component boundary)
- Deploys to Vercel as a static site with zero configuration

### 4.2 State Management: Zustand

~3KB, minimal boilerplate, selector-based subscriptions prevent unnecessary re-renders during frequent game state updates. No Provider wrapper needed.

### 4.3 App Structure

```
/app
  /play              -- Kid-facing (full screen, large touch targets)
    /select-kid      -- Parent picks which kid is playing
    /level/[id]      -- Active game session
    /results         -- Post-session summary
  /dashboard         -- Parent-facing (data-dense, charts)
    /kids            -- Manage kid profiles
    /progress        -- Per-kid mastery view (heat map)
    /settings        -- Account settings
```

### 4.4 Supabase Schema

```sql
-- Parents (linked to Supabase Auth)
CREATE TABLE parents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kid profiles (multiple per parent, no auth account)
CREATE TABLE kids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Game sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  level INT NOT NULL,
  total_questions INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  duration_seconds INT
);

-- Individual question attempts
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  factor_a SMALLINT NOT NULL,
  factor_b SMALLINT NOT NULL,
  correct_answer SMALLINT NOT NULL,
  given_answer SMALLINT,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INT NOT NULL,
  hint_level SMALLINT DEFAULT 0,  -- 0=none, 1=visual, 2=scaffolded
  error_type TEXT,  -- 'addition_sub', 'off_by_one', 'neighbor', 'zero_one', etc.
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- Mastery tracking per fact per kid (Leitner box state)
CREATE TABLE fact_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  factor_a SMALLINT NOT NULL,  -- stored as min(a,b)
  factor_b SMALLINT NOT NULL,  -- stored as max(a,b)
  leitner_box SMALLINT DEFAULT 1,  -- 1-5
  total_attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  avg_response_time_ms INT,
  last_practiced_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  UNIQUE(kid_id, factor_a, factor_b)
);

-- Level progression
CREATE TABLE level_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  level INT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  building_height INT DEFAULT 0,
  UNIQUE(kid_id, level)
);
```

**Key design decisions:**
- `factor_a` and `factor_b` stored canonically as `min(a,b), max(a,b)` -- treats 3x5 and 5x3 as the same fact (reduces 121 to 66 unique facts)
- `response_time_ms` distinguishes memorized facts from counting
- `error_type` enables pattern detection for adaptive response and parent reporting
- `hint_level` tracks hint dependency over time

### 4.5 Row Level Security

All tables have RLS enabled. Parents can only access their own kids' data via `parent_id = auth.uid()` or `kid_id IN (SELECT id FROM kids WHERE parent_id = auth.uid())`.

### 4.6 Google Auth Flow

1. Parent logs in with Google via Supabase Auth
2. Parent creates kid profiles (name, avatar)
3. At play time, parent selects which kid is playing
4. Active kid stored in Zustand + localStorage for persistence
5. All game writes include `kid_id` -- RLS ensures data isolation

### 4.7 Hebrew TTS

**Pre-generate all audio files.** Do NOT use real-time TTS.

| Aspect | Detail |
|--------|--------|
| Total clips needed | ~200-300 (78 questions + number words + phrases) |
| Total asset size | ~3-5MB |
| Best quality | ElevenLabs (~$2 total cost) |
| Best established | Azure Speech (he-IL-HilaNeural, he-IL-AvriNeural) |
| NOT supported | Amazon Polly (no Hebrew) |
| Web Speech API | Unreliable, especially on Android tablets |

**Workflow:** Script generates all Hebrew phrases -> batch call TTS API -> save as MP3 -> serve from Supabase Storage or bundle with app. Native speaker reviews every clip.

### 4.8 Drag-and-Drop: @dnd-kit

Best touch/tablet support of React drag-and-drop libraries. Built-in pointer events, much better than react-dnd (requires separate TouchBackend) or react-beautiful-dnd (deprecated).

### 4.9 Deployment

Vite builds to static files, deployed on Vercel. Supabase handles auth + database. Environment variables via Vercel's Supabase integration. Lazy-load game assets. Audio files on Supabase Storage or Vercel CDN.

---

## 5. Critical Analysis & Design Decisions

### 5.1 Where Danny's Instincts Are Right

1. **The visual manipulative model** is well-supported by research on unitizing and Cuisenaire rods
2. **The "building up" strategy** (6x2 -> 6x3 -> 6x4) maps directly to evidence-based derived fact strategies
3. **The building metaphor** is excellent -- construction play correlates with math skills, and making answer magnitude tangible (15 bricks > 6 bricks) gives number sense
4. **Hebrew voiceover with "X pa'amim Y" phrasing** aligns with the "groups of" conceptual model
5. **Hint tiering** (no hint > visual > scaffolded) matches research on productive struggle
6. **Parent dashboard** with data-driven insights is the right approach

### 5.2 Where Research Pushes Back

1. **Breaking bricks on wrong answers** -- destruction mechanics decrease persistence in 6-year-olds. Use "bricks don't get added" or a gentle wobble instead. This is the single most important design change the research suggests.

2. **Starting with composite visual units** (rectangle + circle for 6) -- too much cognitive load for initial introduction. Start with circles-only grouping, introduce rectangles as a "level up."

3. **Difficulty order should NOT be numerical** (1s, 2s, 3s...). Research-backed order: 0s/1s/2s -> 5s/10s -> 3s/4s -> 9s -> 6s/7s/8s.

4. **Stars/badges/points economy** -- the overjustification effect is well-documented in this exact age group. The building should be the reward, not a proxy for earning separate rewards. Use unexpected celebrations for delight.

5. **Treating 3x5 and 5x3 as different facts** -- pedagogically debatable. Research suggests introducing commutative pairs together. The canonical storage model (min, max) supports this.

### 5.3 Where the Research Agents Disagreed

**Game engine choice:** The visual design agent recommended Phaser.js 3. The tech infrastructure agent said "you probably don't need a game engine."

**My assessment:** Start without Phaser. The game is fundamentally a quiz with animated feedback and drag-and-drop manipulatives. React + Framer Motion + @dnd-kit + CSS sprite animations can handle this. If you hit the ceiling (needing physics, complex particle effects, game loops), migrate the game view to Phaser while keeping the dashboard in React. Starting with Phaser commits you to managing two rendering paradigms from day one.

### 5.4 Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Copyright (Disney IP) | High if public | Original characters from day one |
| Cognitive overload (too much too fast) | Medium | Phased visual model introduction |
| Loss of motivation (destruction mechanic) | Medium | Use non-destructive feedback |
| Hebrew TTS quality | Low | Pre-generate + native speaker review |
| Tablet performance | Low | React is sufficient; lazy-load assets |
| Hint gaming/abuse | Medium | Progressive reveal, no bottom-out hints |

---

## 6. Recommended Architecture

### Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Framework | Vite + React + TypeScript | No SSR/SEO needed, simpler |
| State | Zustand | Simple, performant, no Provider |
| Animation | Framer Motion + CSS sprites | Sufficient for quiz-based game |
| Drag/Drop | @dnd-kit | Best tablet touch support |
| Auth | Supabase + Google OAuth | Well-documented, simple |
| Database | Supabase (Postgres + RLS) | Data isolation, good DX |
| TTS | Pre-generated via ElevenLabs or Azure | Offline-capable, one-time cost |
| Deploy | Vercel (static) + Supabase (backend) | Auto-integration |

### Build Priority

1. Core question engine with Leitner box tracking
2. Building visualization (the reward IS the game)
3. Visual manipulatives with drag-and-drop
4. Hint system (3-tier progressive reveal)
5. Hebrew voiceover
6. Parent dashboard with heat map
7. Error pattern detection
8. Adaptive difficulty refinement

---

## 7. Open Questions

These need Danny's input before implementation:

1. **Destruction mechanic:** Research says don't break bricks for wrong answers. Are you OK with "bricks don't get added" + gentle wobble instead? Or is the breaking animation core to your vision?

2. **Visual model phasing:** Research recommends starting with circles-only before introducing rectangles. This delays the full visual model. Does that work for your timeline?

3. **3x5 vs 5x3:** Should these be the same fact (reduces 121 to 66 unique facts) or separate? Pedagogically, they represent different real-world situations (3 bags of 5 apples vs 5 bags of 3 apples) but have the same answer.

4. **Skip counting prerequisite:** Should the app include a warm-up/assessment for skip counting readiness, or assume the child is ready?

5. **Game engine:** Start simple with React + Framer Motion, or go straight to Phaser.js? The simple approach is faster to build but may need migration later.

6. **Character names and design:** Need original characters. Any preferences for personality/names? The archetypes (big wrecker, small speedster, cheerful fixer) are free to use.

7. **Hebrew number gender:** Need a native Hebrew speaker to confirm the correct masculine/feminine forms for the TTS scripts. Is that you, Danny?

8. **Session limits:** Should the app enforce a max session time, or let the child play as long as they want?

9. **Sound design:** Arcade-style chiptune music would fit the pixel art aesthetic perfectly. Include background music or just sound effects?

10. **Target platform priority:** iPad first? Desktop? Both equally? This affects touch target sizing and layout decisions.

---

## 8. Sources

### Cognitive Development & Pedagogy
- [Simply Psychology - Piaget's Theory](https://www.simplypsychology.org/piaget.html)
- [ORIGO Education - Piagetian Approach](https://www.origoeducation.com.au/blog/piagetian-approach-to-teaching/)
- [Prodigy - When Should Kids Learn Multiplication](https://www.prodigygame.com/main-en/blog/when-should-kids-start-learning-multiplication-a-grade-by-grade-guide)
- [CGI Wikipedia](https://en.wikipedia.org/wiki/Cognitively_Guided_Instruction)
- [ERIC - Distinguishing Multiplicative from Additive](https://files.eric.ed.gov/fulltext/EJ1183986.pdf)
- [Digital Promise - Multiplicative Reasoning](https://digitalpromise.org/2021/02/17/how-to-build-students-multiplicative-reasoning-skills/)
- [NCETM - Introducing Multiplicative Thinking](https://www.ncetm.org.uk/features/introducing-multiplicative-thinking/)
- [Springer/ZDM - Language-responsive Support for Unitizing](https://link.springer.com/article/10.1007/s11858-020-01206-1)

### Visual Models & Manipulatives
- [Make Math Moments - Progression of Multiplication](https://makemathmoments.com/progression-of-multiplication/)
- [ResearchGate - Understanding the Array](https://www.researchgate.net/publication/317688538)
- [Frontiers in Education - Cuisenaire-Gattegno Systematic Review](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2022.902899/full)
- [Clarity Innovations - Virtual Manipulatives](https://www.clarity-innovations.com/blog/visual-math-how-virtual-manipulatives-take-learning-further)
- [BookNook - Virtual vs Tactile Manipulatives](https://blog.booknook.com/are-virtual-manipulatives-as-effective-as-tactile-manipulatives-math-education)
- [Math Learning Center - Unitizing](https://www.mathlearningcenter.org/blog/beth-hulbert-making-sense-unitizing-theme-runs-through-elementary-mathematics)

### Scaffolding & Derived Facts
- [Reflex - Multiplication Fact Fluency](https://reflex.explorelearning.com/resources/insights/multiplication-fact-fluency)
- [EdWeek - Math Fact Fluency](https://www.edweek.org/teaching-learning/what-is-math-fact-fluency-and-how-does-it-develop/2023/05)
- [WPI - Hints: Better to Give or Wait](https://web.cs.wpi.edu/~nth/pubs_and_grants/ITS%202010/RazzaqHintsIsItBettertoGiveorWaittobeAsked.pdf)
- [ResearchGate - Hint Systems May Negatively Impact](https://www.researchgate.net/publication/262176565)

### Gamification & Motivation
- [ResearchGate - Overjustification Hypothesis (Lepper et al.)](https://www.researchgate.net/publication/281453299)
- [PMC - Block Play and Math](https://pmc.ncbi.nlm.nih.gov/articles/PMC3962809/)
- [PMC - Feedback and Children's Math Performance](https://pmc.ncbi.nlm.nih.gov/articles/PMC10923023/)
- [ScienceDirect - Scaffold and Reward Mechanisms](https://www.sciencedirect.com/science/article/abs/pii/S0360131518300010)
- [Smart Learning Environments - Gamification Study](https://slejournal.springeropen.com/articles/10.1186/s40561-019-0085-2)

### Spaced Repetition
- [Wikipedia - Leitner System](https://en.wikipedia.org/wiki/Leitner_system)
- [Funexpected - Math Learning Strategies](https://funexpectedapps.com/blog-posts/math-learning-strategies-proven-to-work-interleaving-immediate-feedback-spaced-repetition)

### Multiplication Teaching Sequence
- [Peanut Butter Fish Lessons - Teaching Order](https://peanutbutterfishlessons.com/what-order-teach-multiplication-facts/)
- [Shelley Gray - Multiplication Order](https://shelleygrayteaching.com/suggested-order-teaching-basic-multiplication-facts/)
- [Komodo Math - Mistakes and Misconceptions](https://komodomath.com/blog/maths_mistakes_and_misconceptions)

### Visual Design
- [Character Design References - Art of Wreck-It Ralph](https://characterdesignreferences.com/art-of-animation-3/wreck-it-ralph)
- [Aspect Law Group - Copyright in Characters](https://www.aspectlg.com/posts/copyright-in-characters-what-can-i-use)
- [Odin Law - Fan Games Legal Risks](https://odinlaw.com/blog-fan-games-legal-risks/)
- [Phaser vs PixiJS - DEV Community](https://dev.to/ritza/phaser-vs-pixijs-for-making-2d-games-2j8c)
- [Josh Comeau - Sprites on the Web](https://www.joshwcomeau.com/animation/sprites/)
- [COLOURlovers - Wreck-It Ralph Palette](https://www.colourlovers.com/palette/3043194/Wreck-It_Ralph)

### UX for Children
- [Eleken - UX Design for Children](https://www.eleken.co/blog-posts/ux-design-for-children-how-to-create-a-product-children-will-love)
- [Ungrammary - Designing for Kids](https://www.ungrammary.com/post/designing-for-kids-ux-design-tips-for-children-apps)

### Hebrew TTS & RTL
- [Azure Speech Language Support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support)
- [ElevenLabs Hebrew TTS](https://elevenlabs.io/text-to-speech/hebrew)
- [AWS Polly Languages (no Hebrew)](https://docs.aws.amazon.com/polly/latest/dg/supported-languages.html)
- [Gorelik - RTL/LTR Directionality](https://gorelik.net/2019/05/19/x-axis-direction-in-right-to-left-languages-part-two/)
- [TAU - Hebrew Math Education](https://www.tau.ac.il/~corry/publications/articles/pdf/LC-HebrewMath.pdf)

### Technical Stack
- [Vite vs Next.js 2025](https://strapi.io/blog/vite-vs-nextjs-2025-developer-framework-comparison)
- [Supabase Google Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Top Drag-Drop Libraries 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)

### Existing Educational Games (Analyzed)
- [Prodigy Math Game](https://www.prodigygame.com)
- [Khan Academy Kids](https://www.khanacademy.org/kids)
- [DragonBox](https://dragonbox.com/)
- [SplashLearn](https://www.splashlearn.com/math-games)
- [ABCmouse Construction Math](https://www.abcmouse.com/games/view-games/construction-math~22574)
