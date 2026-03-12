# Master Orchestration Plan

## Danny Approval Rule (ALL AGENTS)

**Every agent MUST surface visual outputs and important decisions to Danny for approval before proceeding.** This is not optional.

### What requires Danny's approval:
- **All visual assets** -- characters, tiles, UI elements, backgrounds (show rendered previews)
- **Game screen layouts** -- how the building, numpad, manipulatives, and character are arranged
- **UX flows** -- login, kid selection, game loop, hint interaction (create quick mockups or screenshots)
- **Sound/music samples** -- play audio for Danny before integrating
- **Hebrew text/TTS** -- Danny reviews all Hebrew content (he's a native speaker)
- **Dashboard visualizations** -- heat map design, chart layouts, insight cards
- **Any architecture decision not covered in the plans**

### How to surface for approval:
- Generate visual previews (HTML pages, canvas renders, or image generation tools)
- For UI: create a minimal working page Danny can view in the browser at localhost
- For audio: save samples Danny can listen to
- For game screens: take screenshots of the running Phaser scene
- **Never proceed past an approval gate without explicit "approved" or "looks good" from Danny**

### Approval cadence:
- Don't batch everything at the end. Show work incrementally as each piece is ready.
- Quick iterations are better than one big reveal.

---

## Team Structure

Eight parallel workstreams, each driven by a dedicated agent:

```
                    [Danny: External Setup]
                           |
                    [1. FOUNDATION]
                     /    |    \     \
                    /     |     \     \
    [2. GAME    [3. ART &   [4. LEARNING  [6. AUDIO]
     ENGINE]    ANIMATION]   ENGINE]
        \          |           /
         \         |          /
          [5. MANIPULATIVES]
                   |
            [7. DASHBOARD]
                   |
         [8. TESTING (throughout)]
                   |
              [INTEGRATION]
```

## Danny's Setup Tasks (Before Agents Start)

These are external services only Danny can configure:

### 1. Firebase Project
- [ ] Create project at https://console.firebase.google.com
- [ ] Create a web app and note the Firebase config values (apiKey, authDomain, projectId, etc.)
- [ ] Enable Firestore Database (Cloud Firestore > Create database)
- [ ] Set up Firestore security rules

### 2. Google Sign-In (via Firebase Auth)
- [ ] Enable Google sign-in provider in Firebase Console (Authentication > Sign-in method > Google)
- [ ] No manual OAuth credentials needed — Firebase Auth handles this

### 3. TTS API Key (for Audio Agent)
- [ ] Choose: ElevenLabs (best quality) or Azure Speech (cheaper, 2 Hebrew voices)
- [ ] Create API key and share with Audio Agent

### 4. Vercel
- [ ] Create project on Vercel, link to GitHub repo
- [ ] Configure Firebase env vars manually (VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.)

### 5. (Optional) PixelLab Account
- [ ] For AI-assisted sprite generation: https://www.pixellab.ai/
- [ ] Free tier may suffice for prototyping

## Workstream Definitions

### Agent 1: Foundation (`plan-foundation.md`)
**Scope:** Project scaffold, shared infrastructure, everything other agents build on top of.
**Deliverables:**
- Vite + React + TypeScript project
- Phaser.js integration via official template
- Firebase client + Firestore document types + security rules
- Google Auth flow (parent login, kid profile selection)
- Zustand stores (auth, game state, settings)
- i18n framework (Hebrew + English)
- Routing structure (`/play/*`, `/dashboard/*`)
- Shared TypeScript types
**Blocks:** All other agents
**Blocked by:** Danny's Firebase setup

### Agent 2: Game Engine (`plan-game-engine.md`)
**Scope:** Phaser scenes, building mechanic, brick physics, game loop, scoring.
**Deliverables:**
- Phaser game config + React wrapper component
- Scene management (Title, Game, LevelComplete, SessionEnd)
- Building renderer (brick stacking, floor progression, window characters)
- Brick physics (crumbling animation on wrong answer)
- Scoring system (answer bricks + bonus bricks)
- Game state sync with Zustand
- Level progression triggers
**Blocks:** Manipulatives (needs game scene to embed in)
**Blocked by:** Foundation

### Agent 3: Art & Animation (`plan-art.md`)
**Scope:** All visual assets -- character design, sprite sheets, building tiles, UI elements.
**Deliverables:**
- 3 original pixel art characters (wrecker, sidekick, fixer) with sprite sheets
  - Each: idle, happy, angry, climbing, waving animations (~25 frames)
- Building tileset (brick types, windows, doors, roof, decorations)
- Background art (sky, ground, parallax layers)
- UI elements (numpad buttons, hint button, progress indicators)
- Math manipulative sprites (blue circles, orange rectangles)
- Particle effect sprites (confetti, sparkles, brick debris)
- Export specs: PNG sprite sheets, max 2048x2048, nearest-neighbor scaling
**Blocks:** Game Engine (needs sprites), Manipulatives (needs math sprites)
**Blocked by:** Foundation (needs asset directory structure)

### Agent 4: Learning Engine (`plan-learning-engine.md`)
**Scope:** All pedagogy logic -- pure TypeScript, no UI dependency.
**Deliverables:**
- Leitner box system (5 boxes, gentle regression)
- Question selection algorithm (priority: due review > recently failed > low mastery > new > mixed review)
- Difficulty progression (tiers: 0/1/2 > 5/10 > 3/4 > 9 > 6/7/8)
- Level content generator (60% new + 40% review, interleaved)
- Error pattern classifier (addition substitution, off-by-one, neighbor, zero/one, commutative gap)
- Response time fluency scoring (<1.5s=instant, <3s=hesitation, <5s=slow, >5s=barely)
- Fact mastery calculator
- Building-up sequence generator (6x2 -> 6x3 -> 6x4 -> 6x5)
- Session manager (soft 10-15 min limit with suggestion)
- Canonical fact storage (min(a,b), max(a,b))
**Blocks:** Dashboard (needs mastery data)
**Blocked by:** Foundation (needs types + Firebase client)

### Agent 5: Manipulatives (`plan-manipulatives.md`)
**Scope:** Visual math model -- circles, rectangles, drag-and-drop workspace.
**Deliverables:**
- Phaser scene/overlay for manipulative workspace
- Circle sprites (1-unit, blue #2196F3)
- Rectangle sprites (5-unit, orange #FF9800)
- Composite unit builder (e.g., 6 = rectangle + circle)
- Drag-and-drop interaction (Phaser pointer events)
- Snap-to-grid placement
- Group counting animation
- Integration with hint system (Tier 1: show partial groups, Tier 2: animate full solution)
- Visual result display (show answer as optimal rect+circle decomposition)
**Blocks:** None
**Blocked by:** Game Engine + Art (needs scene + sprites)

### Agent 6: Audio (`plan-audio.md`)
**Scope:** TTS generation, sound effects, music, audio playback system.
**Deliverables:**
- Hebrew TTS script (all phrases, Danny reviews)
- English TTS script (all phrases)
- TTS batch generation script (calls ElevenLabs or Azure API)
- Audio manager (Web Audio API for instant playback)
- Sound effects: brick placement, brick crumble, correct answer chime, wrong answer gentle sound, level complete fanfare, button taps
- Background chiptune music (8-bit style, loopable)
- Parent mute toggle
- Audio sprite packing (single file with timing offsets for SFX)
**Blocks:** None
**Blocked by:** Foundation (needs asset structure) + Danny's TTS API key

### Agent 7: Dashboard (`plan-dashboard.md`)
**Scope:** Parent-facing analytics, kid profile management.
**Deliverables:**
- Parent login flow (Google Auth)
- Kid profile CRUD (create, select, edit avatar)
- 11x11 multiplication heat map (green/yellow/red/gray)
- Per-fact drill-down (recent attempts, error types, trend)
- Session history (date, duration, accuracy, questions)
- Actionable insight cards (struggling clusters, plateau detection, celebrations)
- Hint dependency tracking
- Response time trend chart
- Settings page (language toggle, sound toggle, session limit)
- Responsive layout (works on desktop + mobile)
**Blocks:** None
**Blocked by:** Foundation + Learning Engine (needs data model + mastery calculations)

### Agent 8: Testing (`plan-testing.md`)
**Scope:** All automated testing — unit, integration, Firebase security rules, E2E via dev-browser.
**Deliverables:**
- Vitest setup with coverage thresholds
- Unit tests for learning engine (8 modules, >95% coverage)
- Unit tests for all Zustand stores, scoring logic, manipulative math
- Firebase emulator setup + security rules tests for all 6 collections
- i18n completeness test (Hebrew/English key parity)
- E2E test suite via Playwright/dev-browser (auth, game session, hints, dashboard)
- Test data seeding for Firebase emulator
- CI/CD pipeline (GitHub Actions)
**Blocks:** None (but gates integration readiness)
**Blocked by:** Foundation (needs scaffold). Runs continuously alongside all other agents — tests are written as each workstream delivers.

## Milestone Tracker

### M0: Danny's Setup (Day 0)
- [ ] Firebase project created + Google Auth configured
- [ ] TTS API key obtained
- [ ] Vercel project linked to repo
- [ ] Agents can begin

### M1: Foundation Complete
- [ ] Project runs locally (`npm run dev`)
- [ ] Firestore connected, security rules deployed
- [ ] Google login works, kid profile can be created
- [ ] i18n loads Hebrew + English strings
- [ ] Phaser renders a test scene inside React
- [ ] All shared types defined

### M2: Core Game Loop
- [ ] Phaser game scene renders building + character
- [ ] Question appears, numpad accepts answer
- [ ] Correct answer: bricks stack with animation
- [ ] Wrong answer: bricks crumble with character reaction
- [ ] 5 questions complete a level
- [ ] Level complete celebration plays

### M3: Learning Engine Active
- [ ] Questions selected by Leitner algorithm
- [ ] Mastery tracked per fact in Firestore
- [ ] Error patterns classified and stored
- [ ] Building-up sequences work (6x2 -> 6x3 -> 6x4)
- [ ] Difficulty tiers progress correctly

### M4: Visual Assets Integrated
- [ ] 3 characters with full animation sets
- [ ] Building tiles render correctly
- [ ] Window characters appear at correct floors
- [ ] Manipulative sprites (circles, rectangles) ready
- [ ] Particle effects (confetti, debris) working

### M5: Manipulatives Working
- [ ] Drag-and-drop workspace renders in Phaser
- [ ] Circles and rectangles can be dragged to form groups
- [ ] Hint tier 1: partial groups shown
- [ ] Hint tier 2: animated solution
- [ ] Hint button shows bonus brick cost
- [ ] Result visualized as rect+circle decomposition

### M6: Audio Complete
- [ ] Hebrew TTS clips generated and reviewed by Danny
- [ ] English TTS clips generated
- [ ] SFX integrated into game events
- [ ] Background music plays with mute toggle
- [ ] Audio manager handles preloading + instant playback

### M7: Dashboard Complete
- [ ] Heat map renders with real mastery data
- [ ] Session history displays correctly
- [ ] Actionable insights surface based on data
- [ ] Kid profile management works
- [ ] Settings page functional (language, sound)

### M8: Integration & Polish
- [ ] All workstreams integrated into single app
- [ ] End-to-end flow: login -> select kid -> play -> see dashboard
- [ ] Both languages work throughout
- [ ] Responsive on desktop + Android Pixel
- [ ] Performance tested on target devices
- [ ] Edge cases handled (no internet during play, session recovery)

### M9: Deploy
- [ ] Deployed to Vercel
- [ ] Production Firebase with real data
- [ ] Danny's daughter plays first session
- [ ] Iterate based on real usage

## Parallel Execution Matrix

```
Time ->  T0    T1       T2         T3        T4
         |     |        |          |         |
Danny:   Setup |        |          |         |
         |     |        |          |         |
Agent 1: ======|        |          |         |
Foundation     |        |          |         |
               |        |          |         |
Agent 2:       |========|          |         |
Game Engine    |        |          |         |
               |        |          |         |
Agent 3:       |========|==========|         |
Art & Anim     |        |          |         |
               |        |          |         |
Agent 4:       |========|          |         |
Learning Eng   |        |          |         |
               |        |          |         |
Agent 5:       |        |==========|         |
Manipulatives  |        |          |         |
               |        |          |         |
Agent 6:       |========|          |         |
Audio          |        |          |         |
               |        |          |         |
Agent 7:       |        |==========|=========|
Dashboard      |        |          |         |
               |        |          |         |
Integration:   |        |          |=========|
```

## Shared Interfaces

All agents must agree on these shared contracts:

### Game Events (Zustand → Phaser → Firestore)
```typescript
interface QuestionAttempt {
  factorA: number;
  factorB: number;
  correctAnswer: number;
  givenAnswer: number | null;
  isCorrect: boolean;
  responseTimeMs: number;
  hintLevel: 0 | 1 | 2;
  errorType: ErrorType | null;
}

type ErrorType =
  | 'addition_substitution'
  | 'off_by_one'
  | 'neighbor_confusion'
  | 'zero_one_confusion'
  | 'commutative_gap'
  | 'other';
```

### Learning Engine → Game Engine
```typescript
interface Question {
  factorA: number;
  factorB: number;
  correctAnswer: number;
  isBuildingUp: boolean;        // part of a build-up sequence
  buildUpSequenceIndex: number; // position in sequence (0-based)
  isReview: boolean;            // from earlier tier
  leitnerBox: number;           // current box for this fact
}

interface LevelPlan {
  levelNumber: number;
  questions: Question[];
  tier: DifficultyTier;
  reviewRatio: number; // 0.4 = 40% review
}
```

### Art → Game Engine
```typescript
// Sprite sheet specs
interface SpriteSheet {
  key: string;          // e.g., 'wrecker'
  path: string;         // e.g., '/assets/sprites/wrecker.png'
  frameWidth: number;
  frameHeight: number;
  animations: {
    [key: string]: {
      frames: number[];
      frameRate: number;
      repeat: number; // -1 for loop
    };
  };
}
```

### Audio → Game Engine
```typescript
interface AudioEvent {
  type: 'question_read' | 'correct' | 'wrong' | 'hint' | 'level_complete'
       | 'brick_place' | 'brick_crumble' | 'celebration' | 'button_tap';
  locale: 'he' | 'en';
  factorA?: number;
  factorB?: number;
}
```

## File Structure

```
learning-to-multiply/
  plans/                      # This directory
  research.md                 # Research document
  src/
    main.tsx                  # React entry point
    App.tsx                   # Router + layout shell
    i18n/
      index.ts                # i18n setup
      locales/
        en.json               # English strings
        he.json               # Hebrew strings
    stores/
      auth.ts                 # Zustand: auth + active kid
      game.ts                 # Zustand: game state
      settings.ts             # Zustand: language, sound, etc.
    types/
      index.ts                # Shared TypeScript interfaces
      firestore.ts            # Firestore document types
    lib/
      firebase.ts             # Firebase client
      learning-engine/
        leitner.ts            # Leitner box system
        question-selector.ts  # Question selection algorithm
        difficulty.ts         # Difficulty tiers + progression
        error-classifier.ts   # Error pattern detection
        build-up.ts           # Building-up sequence generator
        session.ts            # Session manager
      audio/
        manager.ts            # Audio playback manager
        tts-map.ts            # Map of fact -> audio file path
    game/
      config.ts               # Phaser game configuration
      scenes/
        Boot.ts               # Asset preloading
        Title.ts              # Title screen
        Game.ts               # Main game scene
        LevelComplete.ts      # Level celebration
        SessionEnd.ts         # Session summary
      objects/
        Building.ts           # Building renderer
        Character.ts          # Character sprite controller
        BrickRow.ts           # Brick row with physics
        Numpad.ts             # On-screen number pad
        HintButton.ts         # Hint button with cost display
        Manipulatives.ts      # Drag-and-drop workspace
        WindowCharacter.ts    # Characters in building windows
      effects/
        Confetti.ts           # Confetti particle emitter
        BrickDebris.ts        # Brick crumble particles
    components/
      GameWrapper.tsx         # React component wrapping Phaser
      ProtectedRoute.tsx      # Auth guard
      LanguageToggle.tsx      # Language switcher
    pages/
      play/
        SelectKid.tsx         # Kid profile selector
        GamePage.tsx          # Hosts the Phaser game
        Results.tsx           # Post-session summary
      dashboard/
        Overview.tsx          # Parent dashboard home
        HeatMap.tsx           # 11x11 mastery grid
        FactDetail.tsx        # Per-fact drill-down
        Sessions.tsx          # Session history
        KidProfiles.tsx       # Manage kids
        Settings.tsx          # App settings
  public/
    assets/
      sprites/
        wrecker.png           # Main character sprite sheet
        sidekick.png          # Sidekick sprite sheet
        fixer.png             # Fixer sprite sheet
        manipulatives.png     # Circles + rectangles
      tiles/
        bricks.png            # Building brick tileset
        windows.png           # Window types
        decorations.png       # Building decorations
      audio/
        sfx/
          brick-place.mp3
          brick-crumble.mp3
          correct.mp3
          wrong.mp3
          level-complete.mp3
          button-tap.mp3
        music/
          game-loop.mp3
        tts/
          he/                 # Hebrew voice clips
            q-3x5.mp3         # "כמה זה שלוש פעמים חמש"
            ...
          en/                 # English voice clips
            q-3x5.mp3         # "How much is 3 times 5?"
            ...
  scripts/
    generate-tts.ts           # Batch TTS generation script
  index.html
  vite.config.ts
  tsconfig.json
  package.json
  .env.local                  # VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.
```

## Critical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pixel art quality | Characters look amateurish | Use PixelLab AI + iterate. Danny approves before integration. |
| Phaser + React interop complexity | State sync bugs | Clear interface: Zustand is source of truth, Phaser subscribes via events |
| Hebrew TTS quality | Clips sound unnatural | Pre-generate, Danny reviews every clip before shipping |
| Mobile Phaser performance | Laggy on Pixel | Profile early, reduce particle count, use object pooling |
| Scope creep | Never ships | MVP = M0-M5. Dashboard (M7) and polish (M8) are v1.1. |
