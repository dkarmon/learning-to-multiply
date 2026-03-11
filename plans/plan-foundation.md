# Implementation Plan: Foundation

Generated: 2026-03-11

## Goal

Set up the complete project scaffold that all other workstreams build on: Vite + React + TypeScript project, Phaser.js integration, Firebase client with Firestore collections and security rules, Google Auth flow, Zustand stores, i18n framework, routing, shared types, and environment config. The implementing agent should be able to follow this plan without asking questions.

## Decisions and Trade-offs

1. **Phaser integration approach:** The research recommended starting without Phaser, but Danny's resolved decisions (research.md section 7, item 5) override this -- Phaser.js 3 is the chosen game engine. We use the `@phaserjs/template-react` pattern: a React component that mounts and destroys the Phaser game instance on lifecycle.

2. **Firestore document types:** We provide a hand-written `firestore.ts` with TypeScript interfaces matching the expected document shapes for each collection. Firestore is schemaless, but we enforce structure via TypeScript on the client side.

3. **Auth persistence:** Firebase Auth handles session persistence automatically (defaults to `browserLocalPersistence`). The active kid selection is stored separately in localStorage via Zustand's `persist` middleware.

4. **i18n:** react-i18next with JSON translation files. Hebrew translations use RTL layout via the `dir` attribute on the root element. Math notation stays LTR in both languages.

5. **Phaser canvas vs DOM for UI:** Phaser owns the game canvas. React owns all non-game UI (numpad, dashboard, routing, auth screens). Communication goes through Zustand stores and a custom event emitter.

6. **Firestore collection structure:** Top-level collections with `parentId` fields, enforced by security rules. Collections: `parents`, `kids`, `sessions`, `attempts`, `mastery`, `progress`. This is simpler than nested subcollections and allows direct querying.

7. **Firestore region:** me-west1 (Tel Aviv). This must be configured in the Firebase console when creating the Firestore database -- it cannot be set from client code.

## Files to Create

```
learning-to-multiply/
  index.html
  package.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  .env.local.template
  .env.local
  .gitignore
  firestore.rules
  public/
    assets/
      sprites/.gitkeep
      tiles/.gitkeep
      audio/
        sfx/.gitkeep
        music/.gitkeep
        tts/
          he/.gitkeep
          en/.gitkeep
  src/
    main.tsx
    App.tsx
    vite-env.d.ts
    i18n/
      index.ts
      locales/
        en.json
        he.json
    stores/
      auth.ts
      game.ts
      settings.ts
    types/
      index.ts
      firestore.ts
    lib/
      firebase.ts
      events.ts
    game/
      config.ts
      PhaserGame.tsx
      EventBus.ts
      scenes/
        Boot.ts
    components/
      ProtectedRoute.tsx
      LanguageToggle.tsx
    pages/
      play/
        SelectKid.tsx
        GamePage.tsx
      dashboard/
        Overview.tsx
        Settings.tsx
      auth/
        Login.tsx
```

## Phase 1: Project Scaffold

### Step 1.1: Initialize the project

```bash
cd /home/danny/projects/active/learning-to-multiply
npm create vite@latest . -- --template react-ts
```

If the directory is non-empty, Vite will prompt. Since there are existing files (research.md, plans/), the agent should use `--force` or answer "yes" to the prompt. Alternatively, create in a temp dir and move files:

```bash
cd /tmp
npm create vite@latest ltm-scaffold -- --template react-ts
cp /tmp/ltm-scaffold/index.html /home/danny/projects/active/learning-to-multiply/
cp /tmp/ltm-scaffold/tsconfig.json /home/danny/projects/active/learning-to-multiply/
cp /tmp/ltm-scaffold/tsconfig.node.json /home/danny/projects/active/learning-to-multiply/
cp /tmp/ltm-scaffold/tsconfig.app.json /home/danny/projects/active/learning-to-multiply/
cp /tmp/ltm-scaffold/vite.config.ts /home/danny/projects/active/learning-to-multiply/
cp /tmp/ltm-scaffold/package.json /home/danny/projects/active/learning-to-multiply/
cp -r /tmp/ltm-scaffold/src /home/danny/projects/active/learning-to-multiply/
rm -rf /tmp/ltm-scaffold
```

Then overwrite the scaffold files with our versions (Steps 1.2+).

### Step 1.2: Install dependencies

```bash
cd /home/danny/projects/active/learning-to-multiply
npm install phaser firebase zustand react-router-dom react-i18next i18next i18next-browser-languagedetector
npm install -D @types/react @types/react-dom
```

Note: `@types/react` and `@types/react-dom` are likely already in the Vite template's devDependencies. If so, the install is a harmless no-op.

### Step 1.3: Create directory structure

```bash
cd /home/danny/projects/active/learning-to-multiply
mkdir -p public/assets/sprites
mkdir -p public/assets/tiles
mkdir -p public/assets/audio/sfx
mkdir -p public/assets/audio/music
mkdir -p public/assets/audio/tts/he
mkdir -p public/assets/audio/tts/en
mkdir -p src/i18n/locales
mkdir -p src/stores
mkdir -p src/types
mkdir -p src/lib
mkdir -p src/game/scenes
mkdir -p src/components
mkdir -p src/pages/play
mkdir -p src/pages/dashboard
mkdir -p src/pages/auth
```

Create `.gitkeep` files in empty asset directories:

```bash
touch public/assets/sprites/.gitkeep
touch public/assets/tiles/.gitkeep
touch public/assets/audio/sfx/.gitkeep
touch public/assets/audio/music/.gitkeep
touch public/assets/audio/tts/he/.gitkeep
touch public/assets/audio/tts/en/.gitkeep
```

### Step 1.4: `.gitignore`

```gitignore
# Dependencies
node_modules/

# Build
dist/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

### Step 1.5: `.env.local.template`

```bash
# Firebase
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 1.5b: `.env.local`

Create the actual `.env.local` with the real Firebase config from the Firebase console. Copy the values from your Firebase project settings (Project Settings > General > Your apps > SDK config).

```bash
# Firebase — fill in values from Firebase console
VITE_FIREBASE_API_KEY=<your-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-project>.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
```

> **IMPORTANT:** Never commit `.env.local` to git. The `.gitignore` entry in Step 1.4 prevents this.

### Step 1.6: `vite.config.ts`

```typescript
// ABOUTME: Vite build configuration for the multiplication learning game.
// ABOUTME: Configures React plugin and development server settings.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
```

### Step 1.7: `tsconfig.json`

Use the Vite template's default `tsconfig.json` as-is. It typically contains project references to `tsconfig.app.json` and `tsconfig.node.json`. No modifications needed.

### Step 1.8: `index.html`

```html
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <title>Multiplication Builder</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html, body, #root {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Note: `user-scalable=no` prevents accidental zoom on tablets during gameplay. The `dir` attribute will be toggled dynamically by the i18n system.

---

## Phase 2: Shared TypeScript Types

### Step 2.1: `src/types/index.ts`

All shared interfaces from the orchestrator plan, plus additional types needed by foundation components.

```typescript
// ABOUTME: Shared TypeScript interfaces used across all workstreams.
// ABOUTME: Defines contracts for game events, learning engine, audio, and art assets.

// --- Error Classification ---

export type ErrorType =
  | 'addition_substitution'
  | 'off_by_one'
  | 'neighbor_confusion'
  | 'zero_one_confusion'
  | 'commutative_gap'
  | 'other';

// --- Difficulty ---

export type DifficultyTier = 1 | 2 | 3 | 4 | 5;

// --- Question & Attempt ---

export interface Question {
  factorA: number;
  factorB: number;
  correctAnswer: number;
  isBuildingUp: boolean;
  buildUpSequenceIndex: number;
  isReview: boolean;
  leitnerBox: number;
}

export interface QuestionAttempt {
  factorA: number;
  factorB: number;
  correctAnswer: number;
  givenAnswer: number | null;
  isCorrect: boolean;
  responseTimeMs: number;
  hintLevel: 0 | 1 | 2;
  errorType: ErrorType | null;
}

// --- Level ---

export interface LevelPlan {
  levelNumber: number;
  questions: Question[];
  tier: DifficultyTier;
  reviewRatio: number;
}

// --- Sprite Sheets ---

export interface SpriteAnimation {
  frames: number[];
  frameRate: number;
  repeat: number; // -1 for loop
}

export interface SpriteSheet {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
  animations: Record<string, SpriteAnimation>;
}

// --- Audio ---

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
    | 'button_tap';
  locale: 'he' | 'en';
  factorA?: number;
  factorB?: number;
}

// --- Hint ---

export type HintLevel = 0 | 1 | 2;

export interface HintState {
  level: HintLevel;
  bonusBricksForfeited: number;
}

// --- Scoring ---

export interface ScoreResult {
  bricksEarned: number;
  bonusBricks: number;
  totalBricks: number;
}

// --- Session ---

export interface GameSessionState {
  sessionId: string | null;
  kidId: string | null;
  currentLevel: number;
  currentQuestionIndex: number;
  questions: Question[];
  attempts: QuestionAttempt[];
  buildingHeight: number;
  totalBricks: number;
  isActive: boolean;
  startedAt: string | null;
}

// --- Kid Profile ---

export interface KidProfile {
  id: string;
  parentId: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

// --- Fact Mastery ---

export interface FactMastery {
  kidId: string;
  factorA: number;
  factorB: number;
  leitnerBox: number;
  totalAttempts: number;
  correctAttempts: number;
  avgResponseTimeMs: number | null;
  lastPracticedAt: string | null;
  nextReviewAt: string | null;
}

// --- Level Progress ---

export interface LevelProgress {
  kidId: string;
  level: number;
  unlockedAt: string;
  completedAt: string | null;
  buildingHeight: number;
}

// --- Settings ---

export type Locale = 'he' | 'en';

export interface AppSettings {
  locale: Locale;
  soundEnabled: boolean;
  musicEnabled: boolean;
}
```

### Step 2.2: `src/types/firestore.ts`

These types define the expected document shapes for each Firestore collection. Firestore is schemaless, but we enforce structure on the client side with TypeScript.

```typescript
// ABOUTME: TypeScript interfaces for Firestore document shapes.
// ABOUTME: Defines the expected structure of each collection's documents.

import { Timestamp } from 'firebase/firestore';

// Collection: parents/{uid}
export interface ParentDoc {
  display_name: string | null;
  created_at: Timestamp;
}

// Collection: kids/{kidId}
export interface KidDoc {
  parent_id: string;
  name: string;
  avatar_url: string | null;
  created_at: Timestamp;
}

// Collection: sessions/{sessionId}
export interface SessionDoc {
  kid_id: string;
  started_at: Timestamp;
  ended_at: Timestamp | null;
  level: number;
  total_questions: number;
  correct_answers: number;
  duration_seconds: number | null;
}

// Collection: attempts/{attemptId}
export interface AttemptDoc {
  session_id: string;
  kid_id: string;
  factor_a: number;
  factor_b: number;
  correct_answer: number;
  given_answer: number | null;
  is_correct: boolean;
  response_time_ms: number;
  hint_level: number;
  error_type: string | null;
  attempted_at: Timestamp;
}

// Collection: mastery/{masteryId}
// Unique per kid + fact pair. Document ID convention: `${kid_id}_${factor_a}x${factor_b}`
export interface MasteryDoc {
  kid_id: string;
  factor_a: number;
  factor_b: number;
  leitner_box: number;
  total_attempts: number;
  correct_attempts: number;
  avg_response_time_ms: number | null;
  last_practiced_at: Timestamp | null;
  next_review_at: Timestamp | null;
}

// Collection: progress/{progressId}
// Unique per kid + level. Document ID convention: `${kid_id}_level${level}`
export interface ProgressDoc {
  kid_id: string;
  level: number;
  unlocked_at: Timestamp;
  completed_at: Timestamp | null;
  building_height: number;
}
```

### Step 2.3: `src/vite-env.d.ts`

```typescript
// ABOUTME: Vite environment type declarations.
// ABOUTME: Provides TypeScript types for import.meta.env variables.

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Phase 3: Firebase Client and Firestore

### Step 3.1: `src/lib/firebase.ts`

```typescript
// ABOUTME: Firebase app initialization and service exports.
// ABOUTME: Provides auth and firestore instances for use across the app.

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Missing Firebase environment variables. ' +
    'Copy .env.local.template to .env.local and fill in your values.'
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
```

### Step 3.2: `firestore.rules`

Firestore security rules enforcing that parents can only access data belonging to their own kids. This file is deployed via `firebase deploy --only firestore:rules` (requires Firebase CLI).

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: check if the current user owns a given kid
    function isParentOfKid(kidId) {
      return get(/databases/$(database)/documents/kids/$(kidId)).data.parent_id == request.auth.uid;
    }

    // --- parents ---
    match /parents/{parentId} {
      allow read: if request.auth != null && request.auth.uid == parentId;
      allow create: if request.auth != null && request.auth.uid == parentId;
      allow update: if request.auth != null && request.auth.uid == parentId;
    }

    // --- kids ---
    match /kids/{kidId} {
      allow read: if request.auth != null
        && resource.data.parent_id == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.parent_id == request.auth.uid;
      allow update: if request.auth != null
        && resource.data.parent_id == request.auth.uid
        && request.resource.data.parent_id == request.auth.uid;
      allow delete: if request.auth != null
        && resource.data.parent_id == request.auth.uid;
    }

    // --- sessions ---
    match /sessions/{sessionId} {
      allow read: if request.auth != null
        && isParentOfKid(resource.data.kid_id);
      allow create: if request.auth != null
        && isParentOfKid(request.resource.data.kid_id);
      allow update: if request.auth != null
        && isParentOfKid(resource.data.kid_id);
    }

    // --- attempts ---
    match /attempts/{attemptId} {
      allow read: if request.auth != null
        && isParentOfKid(resource.data.kid_id);
      allow create: if request.auth != null
        && isParentOfKid(request.resource.data.kid_id);
    }

    // --- mastery ---
    match /mastery/{masteryId} {
      allow read: if request.auth != null
        && isParentOfKid(resource.data.kid_id);
      allow create: if request.auth != null
        && isParentOfKid(request.resource.data.kid_id);
      allow update: if request.auth != null
        && isParentOfKid(resource.data.kid_id);
    }

    // --- progress ---
    match /progress/{progressId} {
      allow read: if request.auth != null
        && isParentOfKid(resource.data.kid_id);
      allow create: if request.auth != null
        && isParentOfKid(request.resource.data.kid_id);
      allow update: if request.auth != null
        && isParentOfKid(resource.data.kid_id);
    }
  }
}
```

**Note on the `isParentOfKid` helper:** This function performs a Firestore read each time it's called, which counts against your read quota. For the scale of this app (a single family), this is negligible. If the app ever scales to many users, consider denormalizing `parent_id` onto session/attempt/mastery/progress documents (which we already do) and checking it directly instead of using the helper.

**Note on Firestore setup:** The Firestore database must be created in the Firebase console with region `me-west1` (Tel Aviv). This is a one-time setup step that cannot be done from client code. Go to Firebase Console > Firestore Database > Create Database > select `me-west1` as the location.

---

## Phase 4: Zustand Stores

### Step 4.1: `src/stores/auth.ts`

```typescript
// ABOUTME: Authentication store managing parent session and active kid profile.
// ABOUTME: Persists active kid selection to localStorage for session continuity.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from 'firebase/auth';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { KidProfile } from '../types';
import { auth, db, googleProvider } from '../lib/firebase';

interface AuthState {
  user: User | null;
  kids: KidProfile[];
  activeKid: KidProfile | null;
  loading: boolean;

  setUser: (user: User | null) => void;
  setActiveKid: (kid: KidProfile | null) => void;
  fetchKids: () => Promise<void>;
  addKid: (name: string) => Promise<KidProfile | null>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      kids: [],
      activeKid: null,
      loading: true,

      setUser: (user) => {
        set({
          user,
          loading: false,
        });
      },

      setActiveKid: (kid) => {
        set({ activeKid: kid });
      },

      fetchKids: async () => {
        const user = get().user;
        if (!user) return;

        const kidsRef = collection(db, 'kids');
        const q = query(
          kidsRef,
          where('parent_id', '==', user.uid),
          orderBy('created_at', 'asc')
        );

        try {
          const snapshot = await getDocs(q);
          const kids: KidProfile[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              parentId: data.parent_id,
              name: data.name,
              avatarUrl: data.avatar_url ?? null,
              createdAt: data.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
            };
          });

          set({ kids });

          // If the active kid is no longer in the list, clear it
          const activeKid = get().activeKid;
          if (activeKid && !kids.find((k) => k.id === activeKid.id)) {
            set({ activeKid: null });
          }
        } catch (error) {
          console.error('Failed to fetch kids:', error);
        }
      },

      addKid: async (name: string) => {
        const user = get().user;
        if (!user) return null;

        try {
          const kidsRef = collection(db, 'kids');
          const docRef = await addDoc(kidsRef, {
            parent_id: user.uid,
            name,
            avatar_url: null,
            created_at: serverTimestamp(),
          });

          const kid: KidProfile = {
            id: docRef.id,
            parentId: user.uid,
            name,
            avatarUrl: null,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({ kids: [...state.kids, kid] }));
          return kid;
        } catch (error) {
          console.error('Failed to add kid:', error);
          return null;
        }
      },

      signInWithGoogle: async () => {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;

          // Ensure parent doc exists (upsert on first login)
          const parentRef = doc(db, 'parents', user.uid);
          await setDoc(parentRef, {
            display_name: user.displayName,
            created_at: serverTimestamp(),
          }, { merge: true });
        } catch (error) {
          console.error('Google sign-in failed:', error);
        }
      },

      signOut: async () => {
        await firebaseSignOut(auth);
        set({
          user: null,
          kids: [],
          activeKid: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      // Only persist the active kid selection, not the full user object
      // (Firebase handles auth persistence internally)
      partialize: (state) => ({ activeKid: state.activeKid }),
    }
  )
);
```

### Step 4.2: `src/stores/game.ts`

```typescript
// ABOUTME: Game state store tracking the current play session.
// ABOUTME: Manages questions, attempts, brick counts, and session lifecycle.

import { create } from 'zustand';
import type { Question, QuestionAttempt, GameSessionState } from '../types';

interface GameStore extends GameSessionState {
  startSession: (kidId: string, level: number, questions: Question[]) => void;
  recordAttempt: (attempt: QuestionAttempt) => void;
  addBricks: (count: number) => void;
  nextQuestion: () => void;
  endSession: () => void;
  reset: () => void;
}

const initialState: GameSessionState = {
  sessionId: null,
  kidId: null,
  currentLevel: 1,
  currentQuestionIndex: 0,
  questions: [],
  attempts: [],
  buildingHeight: 0,
  totalBricks: 0,
  isActive: false,
  startedAt: null,
};

export const useGameStore = create<GameStore>()((set) => ({
  ...initialState,

  startSession: (kidId, level, questions) => {
    set({
      sessionId: crypto.randomUUID(),
      kidId,
      currentLevel: level,
      currentQuestionIndex: 0,
      questions,
      attempts: [],
      buildingHeight: 0,
      totalBricks: 0,
      isActive: true,
      startedAt: new Date().toISOString(),
    });
  },

  recordAttempt: (attempt) => {
    set((state) => ({
      attempts: [...state.attempts, attempt],
    }));
  },

  addBricks: (count) => {
    set((state) => ({
      totalBricks: state.totalBricks + count,
      buildingHeight: state.buildingHeight + count,
    }));
  },

  nextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    }));
  },

  endSession: () => {
    set({ isActive: false });
  },

  reset: () => {
    set(initialState);
  },
}));
```

### Step 4.3: `src/stores/settings.ts`

```typescript
// ABOUTME: App settings store for language, sound, and music preferences.
// ABOUTME: Persists all settings to localStorage.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale, AppSettings } from '../types';

interface SettingsStore extends AppSettings {
  setLocale: (locale: Locale) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      locale: 'he',
      soundEnabled: true,
      musicEnabled: true,

      setLocale: (locale) => {
        set({ locale });
        // Update the document direction for RTL/LTR
        document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
        document.documentElement.lang = locale;
      },

      setSoundEnabled: (enabled) => {
        set({ soundEnabled: enabled });
      },

      setMusicEnabled: (enabled) => {
        set({ musicEnabled: enabled });
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);
```

---

## Phase 5: i18n Framework

### Step 5.1: `src/i18n/index.ts`

```typescript
// ABOUTME: Internationalization setup using react-i18next.
// ABOUTME: Supports Hebrew (RTL) and English (LTR) with browser language detection.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import he from './locales/he.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    fallbackLng: 'he',
    interpolation: {
      escapeValue: false, // React handles escaping
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'settings-storage',
    },
  });

export default i18n;
```

### Step 5.2: `src/i18n/locales/en.json`

```json
{
  "app": {
    "title": "Multiplication Builder"
  },
  "auth": {
    "signIn": "Sign in with Google",
    "signOut": "Sign Out",
    "signingIn": "Signing in..."
  },
  "kids": {
    "selectTitle": "Who's playing?",
    "addKid": "Add Player",
    "enterName": "Enter name",
    "cancel": "Cancel",
    "save": "Save",
    "noKids": "Add a player to get started!"
  },
  "game": {
    "howMuch": "How much is {{a}} times {{b}}?",
    "correct": "Amazing!",
    "wrong": "Not quite! Try again.",
    "showAnswer": "The answer is {{answer}}. Let's see why!",
    "hint": "Hint",
    "hintCost": "-{{cost}} bonus bricks",
    "bricks": "{{count}} bricks",
    "levelComplete": "Level Complete!",
    "sessionDone": "Great job today!",
    "continue": "Keep Going!",
    "stop": "Done for now"
  },
  "dashboard": {
    "title": "Dashboard",
    "overview": "Overview",
    "progress": "Progress",
    "sessions": "Sessions",
    "settings": "Settings",
    "factsMastered": "Facts Mastered",
    "currentLevel": "Current Level",
    "accuracy": "Accuracy",
    "totalSessions": "Total Sessions"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "sound": "Sound Effects",
    "music": "Background Music",
    "on": "On",
    "off": "Off"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "back": "Back"
  }
}
```

### Step 5.3: `src/i18n/locales/he.json`

```json
{
  "app": {
    "title": "בונים כפל"
  },
  "auth": {
    "signIn": "התחברות עם Google",
    "signOut": "התנתקות",
    "signingIn": "מתחבר..."
  },
  "kids": {
    "selectTitle": "מי משחק?",
    "addKid": "הוספת שחקן",
    "enterName": "הכניסו שם",
    "cancel": "ביטול",
    "save": "שמירה",
    "noKids": "הוסיפו שחקן כדי להתחיל!"
  },
  "game": {
    "howMuch": "כמה זה {{a}} כפול {{b}}?",
    "correct": "מדהים!",
    "wrong": "לא בדיוק! נסו שוב.",
    "showAnswer": "התשובה היא {{answer}}. בואו נראה למה!",
    "hint": "רמז",
    "hintCost": "מינוס {{cost}} לבנים בונוס",
    "bricks": "{{count}} לבנים",
    "levelComplete": "סיימתם שלב!",
    "sessionDone": "כל הכבוד להיום!",
    "continue": "ממשיכים!",
    "stop": "מספיק להיום"
  },
  "dashboard": {
    "title": "לוח בקרה",
    "overview": "סקירה",
    "progress": "התקדמות",
    "sessions": "משחקים",
    "settings": "הגדרות",
    "factsMastered": "עובדות שנלמדו",
    "currentLevel": "שלב נוכחי",
    "accuracy": "דיוק",
    "totalSessions": "סה״כ משחקים"
  },
  "settings": {
    "title": "הגדרות",
    "language": "שפה",
    "sound": "אפקטים קוליים",
    "music": "מוזיקת רקע",
    "on": "פועל",
    "off": "כבוי"
  },
  "common": {
    "loading": "טוען...",
    "error": "משהו השתבש",
    "back": "חזרה"
  }
}
```

---

## Phase 6: Phaser.js Integration

The pattern here follows the official `@phaserjs/template-react` approach: a React component creates and destroys the Phaser.Game instance, and an EventBus mediates communication between React and Phaser scenes.

### Step 6.1: `src/game/EventBus.ts`

```typescript
// ABOUTME: Event bus for communication between React components and Phaser scenes.
// ABOUTME: Phaser scenes emit events that React listens to, and vice versa.

import Phaser from 'phaser';

// Singleton event emitter shared between React and Phaser
export const EventBus = new Phaser.Events.EventEmitter();

// Event name constants to prevent typos
export const GameEvents = {
  // Phaser -> React
  SCENE_READY: 'scene-ready',
  ANSWER_SUBMITTED: 'answer-submitted',
  LEVEL_COMPLETE: 'level-complete',
  HINT_REQUESTED: 'hint-requested',

  // React -> Phaser
  SHOW_QUESTION: 'show-question',
  SHOW_RESULT: 'show-result',
  ADD_BRICKS: 'add-bricks',
  START_LEVEL: 'start-level',
  CRUMBLE_BRICKS: 'crumble-bricks',
} as const;
```

### Step 6.2: `src/game/config.ts`

```typescript
// ABOUTME: Phaser game configuration shared across all scenes.
// ABOUTME: Sets up canvas rendering, scaling, and physics for the game.

import Phaser from 'phaser';
import { Boot } from './scenes/Boot';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#FFF8E1',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: false,
    },
  },
  scene: [Boot],
};
```

### Step 6.3: `src/game/scenes/Boot.ts`

```typescript
// ABOUTME: Boot scene that loads initial assets and transitions to the game.
// ABOUTME: Displays a loading indicator while assets are being fetched.

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    // Placeholder: asset loading will be added by the Art & Game Engine agents.
    // For now, just show a loading bar.
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x06628d, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x2aa7c9, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });
  }

  create(): void {
    // Display a placeholder message until game scenes are implemented
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.text(width / 2, height / 2, 'Multiplication Builder', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#06628d',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, 'Game scenes coming soon...', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#666666',
    }).setOrigin(0.5);

    EventBus.emit(GameEvents.SCENE_READY, this);
  }
}
```

### Step 6.4: `src/game/PhaserGame.tsx`

```tsx
// ABOUTME: React wrapper component that mounts and manages a Phaser game instance.
// ABOUTME: Handles game lifecycle (create on mount, destroy on unmount) and scene references.

import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import Phaser from 'phaser';
import { EventBus, GameEvents } from './EventBus';
import { gameConfig } from './config';

export interface PhaserGameRef {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface PhaserGameProps {
  onSceneReady?: (scene: Phaser.Scene) => void;
}

export const PhaserGame = forwardRef<PhaserGameRef, PhaserGameProps>(
  function PhaserGame({ onSceneReady }, ref) {
    const gameRef = useRef<Phaser.Game | null>(null);

    useLayoutEffect(() => {
      if (gameRef.current) return;

      gameRef.current = new Phaser.Game(gameConfig);

      if (typeof ref === 'function') {
        ref({ game: gameRef.current, scene: null });
      } else if (ref) {
        ref.current = { game: gameRef.current, scene: null };
      }

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }, [ref]);

    useEffect(() => {
      const handleSceneReady = (scene: Phaser.Scene) => {
        if (typeof ref === 'function') {
          ref({ game: gameRef.current, scene });
        } else if (ref) {
          ref.current = { game: gameRef.current, scene };
        }
        onSceneReady?.(scene);
      };

      EventBus.on(GameEvents.SCENE_READY, handleSceneReady);

      return () => {
        EventBus.off(GameEvents.SCENE_READY, handleSceneReady);
      };
    }, [ref, onSceneReady]);

    return <div id="game-container" style={{ width: '100%', height: '100%' }} />;
  }
);
```

---

## Phase 7: Event Bus (React-side utility)

### Step 7.1: `src/lib/events.ts`

```typescript
// ABOUTME: Type-safe event helpers for React components interacting with Phaser.
// ABOUTME: Wraps the Phaser EventBus with convenience functions.

import { EventBus, GameEvents } from '../game/EventBus';
import type { Question, QuestionAttempt } from '../types';

export function emitShowQuestion(question: Question): void {
  EventBus.emit(GameEvents.SHOW_QUESTION, question);
}

export function emitShowResult(attempt: QuestionAttempt): void {
  EventBus.emit(GameEvents.SHOW_RESULT, attempt);
}

export function emitAddBricks(count: number): void {
  EventBus.emit(GameEvents.ADD_BRICKS, count);
}

export function emitCrumbleBricks(): void {
  EventBus.emit(GameEvents.CRUMBLE_BRICKS);
}

export function emitStartLevel(levelNumber: number): void {
  EventBus.emit(GameEvents.START_LEVEL, levelNumber);
}

export function onAnswerSubmitted(
  callback: (answer: number) => void
): () => void {
  EventBus.on(GameEvents.ANSWER_SUBMITTED, callback);
  return () => EventBus.off(GameEvents.ANSWER_SUBMITTED, callback);
}

export function onHintRequested(callback: () => void): () => void {
  EventBus.on(GameEvents.HINT_REQUESTED, callback);
  return () => EventBus.off(GameEvents.HINT_REQUESTED, callback);
}

export function onLevelComplete(callback: () => void): () => void {
  EventBus.on(GameEvents.LEVEL_COMPLETE, callback);
  return () => EventBus.off(GameEvents.LEVEL_COMPLETE, callback);
}
```

---

## Phase 8: Routing and Auth Flow

### Step 8.1: `src/components/ProtectedRoute.tsx`

```tsx
// ABOUTME: Route guard that redirects unauthenticated users to the login page.
// ABOUTME: Shows a loading spinner while the auth state is being determined.

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#06628d',
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### Step 8.2: `src/components/LanguageToggle.tsx`

```tsx
// ABOUTME: Toggle button that switches between Hebrew and English.
// ABOUTME: Updates i18n language, document direction, and settings store.

import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../stores/settings';
import type { Locale } from '../types';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const { locale, setLocale } = useSettingsStore();

  const toggle = () => {
    const newLocale: Locale = locale === 'he' ? 'en' : 'he';
    setLocale(newLocale);
    i18n.changeLanguage(newLocale);
  };

  return (
    <button
      onClick={toggle}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: '2px solid #06628d',
        backgroundColor: 'white',
        color: '#06628d',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        cursor: 'pointer',
      }}
    >
      {locale === 'he' ? 'English' : 'עברית'}
    </button>
  );
}
```

### Step 8.3: `src/pages/auth/Login.tsx`

```tsx
// ABOUTME: Login page with Google sign-in button.
// ABOUTME: Redirects to kid selection after successful authentication.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate('/play/select-kid', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#FFF8E1',
      fontFamily: 'Arial, sans-serif',
      gap: '24px',
    }}>
      <h1 style={{
        fontSize: '48px',
        color: '#06628d',
        margin: 0,
      }}>
        {t('app.title')}
      </h1>
      <button
        onClick={signInWithGoogle}
        style={{
          padding: '16px 32px',
          fontSize: '20px',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: '#06628d',
          color: 'white',
          cursor: 'pointer',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {t('auth.signIn')}
      </button>
    </div>
  );
}
```

### Step 8.4: `src/pages/play/SelectKid.tsx`

Note: There is no `Callback.tsx` page with Firebase. The `signInWithPopup` flow handles authentication entirely in the popup window -- no redirect/callback is needed. The auth state change is picked up by `onAuthStateChanged` in `App.tsx`.

```tsx
// ABOUTME: Kid profile selection screen shown after parent login.
// ABOUTME: Allows selecting an existing kid or adding a new one before gameplay.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';

export function SelectKid() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { kids, activeKid, fetchKids, setActiveKid, addKid } = useAuthStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKidName, setNewKidName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchKids();
  }, [fetchKids]);

  const handleSelectKid = (kid: typeof kids[0]) => {
    setActiveKid(kid);
    navigate('/play/game');
  };

  const handleAddKid = async () => {
    if (!newKidName.trim() || adding) return;
    setAdding(true);
    const kid = await addKid(newKidName.trim());
    setAdding(false);
    if (kid) {
      setNewKidName('');
      setShowAddForm(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#FFF8E1',
      fontFamily: 'Arial, sans-serif',
      gap: '24px',
      padding: '24px',
    }}>
      <h1 style={{ fontSize: '36px', color: '#06628d', margin: 0 }}>
        {t('kids.selectTitle')}
      </h1>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center',
      }}>
        {kids.map((kid) => (
          <button
            key={kid.id}
            onClick={() => handleSelectKid(kid)}
            style={{
              padding: '24px 32px',
              fontSize: '24px',
              borderRadius: '16px',
              border: activeKid?.id === kid.id
                ? '4px solid #4CAF50'
                : '4px solid #06628d',
              backgroundColor: 'white',
              color: '#06628d',
              cursor: 'pointer',
              minWidth: '150px',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {kid.name}
          </button>
        ))}
      </div>

      {kids.length === 0 && (
        <p style={{ fontSize: '18px', color: '#666' }}>
          {t('kids.noKids')}
        </p>
      )}

      {showAddForm ? (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={newKidName}
            onChange={(e) => setNewKidName(e.target.value)}
            placeholder={t('kids.enterName')}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAddKid()}
            style={{
              padding: '12px 16px',
              fontSize: '18px',
              borderRadius: '8px',
              border: '2px solid #06628d',
              fontFamily: 'Arial, sans-serif',
            }}
          />
          <button
            onClick={handleAddKid}
            disabled={adding}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {t('kids.save')}
          </button>
          <button
            onClick={() => { setShowAddForm(false); setNewKidName(''); }}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              borderRadius: '8px',
              border: '2px solid #666',
              backgroundColor: 'white',
              color: '#666',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {t('kids.cancel')}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            padding: '16px 32px',
            fontSize: '20px',
            borderRadius: '12px',
            border: '3px dashed #06628d',
            backgroundColor: 'transparent',
            color: '#06628d',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          + {t('kids.addKid')}
        </button>
      )}
    </div>
  );
}
```

### Step 8.5: `src/pages/play/GamePage.tsx`

```tsx
// ABOUTME: Main game page that hosts the Phaser canvas.
// ABOUTME: Redirects to kid selection if no active kid is set.

import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame, type PhaserGameRef } from '../../game/PhaserGame';
import { useAuthStore } from '../../stores/auth';

export function GamePage() {
  const navigate = useNavigate();
  const { activeKid } = useAuthStore();
  const phaserRef = useRef<PhaserGameRef>({ game: null, scene: null });

  useEffect(() => {
    if (!activeKid) {
      navigate('/play/select-kid', { replace: true });
    }
  }, [activeKid, navigate]);

  if (!activeKid) return null;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PhaserGame ref={phaserRef} />
    </div>
  );
}
```

### Step 8.6: `src/pages/dashboard/Overview.tsx`

```tsx
// ABOUTME: Parent dashboard landing page showing key metrics.
// ABOUTME: Placeholder layout to be populated by the Dashboard agent.

import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { LanguageToggle } from '../../components/LanguageToggle';

export function Overview() {
  const { t } = useTranslation();
  const { user, signOut } = useAuthStore();

  return (
    <div style={{
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <h1 style={{ color: '#06628d', margin: 0 }}>
          {t('dashboard.title')}
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <LanguageToggle />
          <button
            onClick={signOut}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '2px solid #EF5350',
              backgroundColor: 'white',
              color: '#EF5350',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
            }}
          >
            {t('auth.signOut')}
          </button>
        </div>
      </header>

      <p style={{ color: '#666', fontSize: '16px' }}>
        Welcome, {user?.displayName ?? 'Parent'}. Dashboard content coming soon.
      </p>
    </div>
  );
}
```

### Step 8.7: `src/pages/dashboard/Settings.tsx`

```tsx
// ABOUTME: Settings page for language, sound, and music preferences.
// ABOUTME: All settings persist to localStorage via Zustand.

import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/settings';
import { LanguageToggle } from '../../components/LanguageToggle';

export function Settings() {
  const { t } = useTranslation();
  const {
    soundEnabled,
    musicEnabled,
    setSoundEnabled,
    setMusicEnabled,
  } = useSettingsStore();

  const toggleStyle = (active: boolean) => ({
    padding: '8px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: active ? '#4CAF50' : '#ccc',
    color: 'white',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
  });

  return (
    <div style={{
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      <h1 style={{ color: '#06628d', marginBottom: '32px' }}>
        {t('settings.title')}
      </h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        {/* Language */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '18px' }}>{t('settings.language')}</span>
          <LanguageToggle />
        </div>

        {/* Sound */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '18px' }}>{t('settings.sound')}</span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={toggleStyle(soundEnabled)}
          >
            {soundEnabled ? t('settings.on') : t('settings.off')}
          </button>
        </div>

        {/* Music */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '18px' }}>{t('settings.music')}</span>
          <button
            onClick={() => setMusicEnabled(!musicEnabled)}
            style={toggleStyle(musicEnabled)}
          >
            {musicEnabled ? t('settings.on') : t('settings.off')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 9: App Shell (Router + Auth Listener)

### Step 9.1: `src/App.tsx`

```tsx
// ABOUTME: Root application component with routing and Firebase auth state listener.
// ABOUTME: Sets up react-router routes and listens for auth changes via onAuthStateChanged.

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuthStore } from './stores/auth';
import { useSettingsStore } from './stores/settings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { SelectKid } from './pages/play/SelectKid';
import { GamePage } from './pages/play/GamePage';
import { Overview } from './pages/dashboard/Overview';
import { Settings } from './pages/dashboard/Settings';

export default function App() {
  const { setUser } = useAuthStore();
  const { locale } = useSettingsStore();

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser]);

  // Apply RTL/LTR direction on mount based on persisted locale
  useEffect(() => {
    document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />

        {/* Play routes (kid-facing) */}
        <Route
          path="/play/select-kid"
          element={
            <ProtectedRoute>
              <SelectKid />
            </ProtectedRoute>
          }
        />
        <Route
          path="/play/game"
          element={
            <ProtectedRoute>
              <GamePage />
            </ProtectedRoute>
          }
        />

        {/* Dashboard routes (parent-facing) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Overview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 9.2: `src/main.tsx`

```tsx
// ABOUTME: Application entry point that renders the React root.
// ABOUTME: Initializes i18n before mounting the app.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## Phase 10: Cleanup and Verification

### Step 10.1: Remove Vite scaffold files

After creating all the files above, remove any default Vite scaffold files that conflict:

```bash
rm -f src/App.css src/index.css src/assets/react.svg public/vite.svg
```

### Step 10.2: Verify the project compiles

```bash
cd /home/danny/projects/active/learning-to-multiply
npx tsc --noEmit
```

Fix any TypeScript errors. Common issues to watch for:
- Missing `@types/node` if `crypto.randomUUID()` complains -- it's available in modern browsers and doesn't need node types. If TypeScript complains, add `"lib": ["ES2022", "DOM", "DOM.Iterable"]` to `tsconfig.app.json` compilerOptions.
- Phaser type issues -- make sure `phaser` is installed and importable.
- Firebase type issues -- the `firebase` package includes its own TypeScript types, no separate `@types` package needed.

### Step 10.3: Verify the dev server starts

```bash
npm run dev
```

Confirm the app loads at `http://localhost:5173` with the login page visible.

### Step 10.4: Verify routes work

With the dev server running:
- `/login` should show the sign-in button
- `/play/select-kid` should redirect to `/login` (no auth state)
- `/dashboard` should redirect to `/login` (no auth state)

---

## Acceptance Criteria

- [ ] `npm run dev` starts without errors
- [ ] `npx tsc --noEmit` passes with no type errors
- [ ] Login page renders at `/login` with Google sign-in button
- [ ] Protected routes redirect to `/login` when unauthenticated
- [ ] Firebase client initializes without errors
- [ ] `firestore.rules` file exists with security rules for all 6 collections
- [ ] All Zustand stores (auth, game, settings) are implemented
- [ ] i18n loads both Hebrew and English translations
- [ ] Language toggle switches between Hebrew and English and updates document direction
- [ ] Phaser game instance mounts inside React on the game page
- [ ] Phaser Boot scene renders the placeholder text
- [ ] All shared TypeScript types are defined in `src/types/`
- [ ] `.env.local.template` exists with Firebase variable names
- [ ] `.env.local` exists with real Firebase config values
- [ ] Asset directory structure exists with `.gitkeep` files
- [ ] No default Vite scaffold CSS or SVG files remain
- [ ] No `Callback.tsx` page (not needed with `signInWithPopup`)
- [ ] No `supabase/` directory or SQL migrations (Firestore is schemaless)

## Implementation Checklist

### Phase 1: Project Scaffold
- [ ] 1.1 Run `npm create vite@latest` with React + TypeScript template
- [ ] 1.2 Install dependencies: `phaser`, `firebase`, `zustand`, `react-router-dom`, `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- [ ] 1.3 Create `index.html` with `#root` container and game-container div
- [ ] 1.4 Create `.gitignore` (include `.env.local`, `node_modules`, `dist`)
- [ ] 1.5a Create `.env.local.template` with Firebase variable names
- [ ] 1.5b Create `.env.local` with real Firebase config values
- [ ] 1.6 Create `vite.config.ts` with resolve aliases
- [ ] 1.7 Create `tsconfig.json` and `tsconfig.app.json`
- [ ] 1.8 Create asset directory structure with `.gitkeep` files

### Phase 2: Shared Types
- [ ] 2.1 Create `src/types/index.ts` with all shared interfaces (Locale, KidProfile, SessionRecord, QuestionAttempt, MasteryRecord, LeitnerBox, DifficultyTier, ErrorType, ProgressRecord, AppSettings)
- [ ] 2.2 Create `src/types/firestore.ts` with Firestore document types

### Phase 3: Firestore Security Rules
- [ ] 3.1 Create `firestore.rules` with `isParentOfKid()` helper
- [ ] 3.2 Rules for `parents` collection (read/write own document)
- [ ] 3.3 Rules for `kids` collection (CRUD by parent, validate parentId on create)
- [ ] 3.4 Rules for `sessions` collection (read/write by kid's parent)
- [ ] 3.5 Rules for `attempts` collection (read/write by kid's parent)
- [ ] 3.6 Rules for `mastery` collection (read/write by kid's parent)
- [ ] 3.7 Rules for `progress` collection (read/write by kid's parent)
- [ ] 3.8 Add name length validation (1-50 chars) per security review H3
- [ ] 3.9 Add parentId == auth.uid validation on kid creation per security review H2

### Phase 4: Zustand Stores
- [ ] 4.1 Create `src/stores/auth.ts` with Firebase auth, Google sign-in, kid management
- [ ] 4.2 Create `src/stores/game.ts` with session state, question tracking, brick counts
- [ ] 4.3 Create `src/stores/settings.ts` with locale, sound, music preferences

### Phase 5: i18n Framework
- [ ] 5.1 Create `src/i18n/index.ts` with react-i18next setup
- [ ] 5.2 Create `src/i18n/locales/en.json` with all English strings
- [ ] 5.3 Create `src/i18n/locales/he.json` with all Hebrew strings
- [ ] Verify RTL direction switching works

### Phase 6: Phaser.js Integration
- [ ] 6.1 Create `src/game/EventBus.ts` with event name constants
- [ ] 6.2 Create `src/game/config.ts` with Phaser game configuration
- [ ] 6.3 Create `src/game/scenes/Boot.ts` with loading bar and placeholder
- [ ] 6.4 Create `src/game/PhaserGame.tsx` React wrapper component

### Phase 7: Event Bus Helpers
- [ ] 7.1 Create `src/lib/events.ts` with type-safe event emitters/listeners

### Phase 8: Routing and Auth Flow
- [ ] 8.1 Create `src/components/ProtectedRoute.tsx`
- [ ] 8.2 Create `src/components/LanguageToggle.tsx`
- [ ] 8.3 Create `src/pages/auth/Login.tsx` with Google sign-in
- [ ] 8.4 Create `src/pages/play/SelectKid.tsx` with kid profile selection
- [ ] 8.5 Create `src/pages/play/GamePage.tsx` with Phaser canvas
- [ ] 8.6 Create `src/pages/dashboard/Overview.tsx` placeholder
- [ ] 8.7 Create `src/pages/dashboard/Settings.tsx` with toggles
- [ ] Add signInWithRedirect fallback per security review M4

### Phase 9: App Shell
- [ ] 9.1 Create `src/App.tsx` with router + auth state listener
- [ ] 9.2 Create `src/main.tsx` entry point
- [ ] Add CSP meta tag to index.html per security review M1

### Phase 10: Cleanup and Verification
- [ ] 10.1 Remove default Vite scaffold files (App.css, index.css, react.svg, vite.svg)
- [ ] 10.2 `npx tsc --noEmit` passes with no errors
- [ ] 10.3 `npm run dev` starts without errors
- [ ] 10.4 Verify routes: /login renders, protected routes redirect
- [ ] 10.5 Run `npm audit` and address any critical vulnerabilities

### Acceptance Criteria
- [ ] Login page renders with Google sign-in button
- [ ] Protected routes redirect unauthenticated users
- [ ] Firebase client initializes without errors
- [ ] i18n switches between Hebrew (RTL) and English (LTR)
- [ ] Phaser Boot scene renders inside React
- [ ] All shared types defined and importable
- [ ] `.env.local.template` exists (real values NOT committed)

## Estimated Complexity

**Medium.** This is mostly scaffolding and glue code. The individual pieces (Firebase client, Zustand stores, routing, i18n) are all well-documented patterns. The main risk is Phaser-in-React integration, which is handled by following the official template approach. The Firestore security rules are the most detailed piece but are a one-time write.

Total files to create: ~28
Estimated implementation time: 1-2 hours for an agent familiar with the stack.
