# Implementation Plan: Dashboard

Generated: 2026-03-11

## Implementation Checklist

**Instructions for implementing agent:** Work through this checklist in order. Mark items `[x]` as you complete them. Mark the current item `[→]`. Do NOT skip items. After each phase, commit your work. Show Danny all visual outputs for approval.

### Phase 1: Tailwind CSS Setup + i18n Extensions
- [ ] Install Tailwind CSS and `@tailwindcss/vite` (`npm install tailwindcss @tailwindcss/vite`)
- [ ] Add Tailwind Vite plugin to `vite.config.ts`
- [ ] Create `src/index.css` with Tailwind import, `@theme` custom colors (sky-brand, deep-brand, cream, brick-red, warm-orange, correct, learning, struggling, not-introduced), and base body styles
- [ ] Import `./index.css` in `src/main.tsx`
- [ ] Install recharts (`npm install recharts`)
- [ ] Extend `src/i18n/locales/en.json` with dashboard, heatMap, factDetail, insights, settings, common, and errors keys
- [ ] Extend `src/i18n/locales/he.json` with corresponding Hebrew translations
- [ ] Verify: `npm run dev` starts without errors
- [ ] Commit Phase 1

### Phase 2: Data Fetching Hooks
- [ ] Create `src/hooks/dashboard/useKids.ts` -- CRUD hook wrapping auth store's fetchKids with addKid, updateKid, deleteKid
- [ ] Create `src/hooks/dashboard/useFactMastery.ts` -- fetches fact_mastery, builds 11x11 MasteryGrid, computes stats (mastered/learning/struggling/notIntroduced), classifies via Leitner box thresholds
- [ ] Create `src/hooks/dashboard/useSessions.ts` -- fetches game_sessions with DateFilter (all/week/month/three_months), provides fetchSessionAttempts for drill-down, computes totalPlayTimeMinutes
- [ ] Create `src/hooks/dashboard/useFactDetail.ts` -- fetches attempts for a single canonical fact (both orderings), computes accuracyOverTime, responseTimeTrend, errorBreakdown, and TrendDirection
- [ ] Create `src/hooks/dashboard/useInsights.ts` -- generates up to 3 prioritized Insight objects from mastery/session data (struggling clusters, short sessions, hint dependency, plateaus, celebrations, error patterns)
- [ ] Verify: `npx tsc --noEmit` passes with no type errors on hooks
- [ ] Commit Phase 2

### Phase 3: Shared Dashboard Components
- [ ] Create `src/components/dashboard/SummaryCard.tsx` -- reusable metric card (label, value, sublabel, color)
- [ ] Create `src/components/dashboard/KidSelector.tsx` -- dropdown using useAuthStore kids/activeKid/setActiveKid
- [ ] Create `src/components/dashboard/InsightCards.tsx` -- renders Insight[] as colored border-left cards with RTL support (`rtl:border-l-0 rtl:border-r-4`)
- [ ] Create `src/components/dashboard/SessionRow.tsx` -- expandable row with lazy-loaded attempts table, accuracy color coding
- [ ] Verify: `npx tsc --noEmit` passes with no type errors on components
- [ ] Commit Phase 3

### Phase 4: Dashboard Layout and Navigation
- [ ] Create `src/components/dashboard/DashboardLayout.tsx` -- sidebar nav (Overview, Kids, Progress Map, Session History, Settings), KidSelector in header, hamburger on mobile, LanguageToggle, sign out button
- [ ] Modify `src/App.tsx` -- nested routes under `/dashboard` with DashboardLayout wrapper; routes: index=Overview, kids=KidProfiles, progress=HeatMap, progress/:factorA/:factorB=FactDetail, sessions=Sessions, settings=Settings
- [ ] Verify: `npm run dev` starts, `/dashboard` renders layout shell
- [ ] Verify: RTL works correctly -- sidebar on right side in Hebrew
- [ ] Commit Phase 4
- [ ] **APPROVAL GATE: Show Danny the dashboard layout/navigation (desktop + mobile). Wait for approval before proceeding.**

### Phase 5: Dashboard Pages -- Login, KidProfiles, Overview
- [ ] Create `src/pages/dashboard/Login.tsx` -- centered layout with app logo, title, description, Google OAuth button; redirects to /dashboard if already authenticated
- [ ] Create `src/pages/dashboard/KidProfiles.tsx` -- kid card grid, create/edit modal with name input + emoji avatar picker (20 animal emojis), delete with confirmation, "View Progress" and "Start Playing" actions
- [ ] Create `src/pages/dashboard/Overview.tsx` -- 4 SummaryCards (facts mastered, current level, accuracy, play time), InsightCards panel, 5 most recent SessionRows, "Start Playing" button, empty/loading/error states
- [ ] Verify: `/login` renders correctly in both LTR and RTL
- [ ] Verify: `/dashboard/kids` shows kid management with all CRUD operations
- [ ] Verify: `/dashboard` overview shows summary cards, insights, recent sessions
- [ ] Verify: RTL works correctly on all three pages
- [ ] Commit Phase 5
- [ ] **APPROVAL GATE: Show Danny login flow, kid profiles page, overview page. Wait for approval before proceeding.**

### Phase 6: Heat Map and Fact Detail Pages
- [ ] Create `src/pages/dashboard/HeatMap.tsx` -- 11x11 grid with color-coded cells (STATUS_COLORS: mastered=#4CAF50, learning=#FFC107, struggling=#EF5350, not_introduced=#E0E0E0), hover popup (accuracy, attempts, avg time, Leitner box, next review), click to navigate to `/dashboard/progress/:a/:b`, legend, stats bar, refresh button
- [ ] Create `src/pages/dashboard/FactDetail.tsx` -- back link to progress, summary cards (accuracy, attempts, current box, trend), accuracy-over-time LineChart, response-time-trend LineChart, error breakdown horizontal BarChart, full attempt history table
- [ ] Verify: Heat map renders correct 11x11 grid with products in cells
- [ ] Verify: Commutative facts (e.g., 3x5 and 5x3) show same status
- [ ] Verify: Hover popup displays all stats
- [ ] Verify: Click navigates to `/dashboard/progress/3/5` etc.
- [ ] Verify: Fact detail charts render (accuracy, response time, error breakdown)
- [ ] Verify: RTL works correctly -- heat map scrolls, charts remain LTR
- [ ] Commit Phase 6
- [ ] **APPROVAL GATE: Show Danny the heat map visualization (this is the hero feature). Wait for approval before proceeding.**

### Phase 7: Sessions and Settings Pages
- [ ] Create `src/pages/dashboard/Sessions.tsx` -- session list with DateFilter dropdown (all/week/month/three_months), summary line (count + total play time), expandable SessionRows, empty/loading/error states
- [ ] Create `src/pages/dashboard/Settings.tsx` -- language toggle (LanguageToggle component), sound/music toggle buttons, session length suggestion buttons (no limit/10/15/20 min), account section (linked Google email), about section with version
- [ ] Verify: Sessions page date filter works correctly
- [ ] Verify: Expanding a session row loads and shows individual attempts
- [ ] Verify: Settings toggles update the settings store
- [ ] Verify: RTL works correctly on both pages
- [ ] Commit Phase 7
- [ ] **APPROVAL GATE: Show Danny sessions page and settings page. Wait for approval before proceeding.**

### Phase 8: Verification and Acceptance Criteria
- [ ] Run `npx tsc --noEmit` -- fix all TypeScript errors
- [ ] Run `npm run dev` -- verify clean startup
- [ ] Route verification: `/login`, `/dashboard`, `/dashboard/kids`, `/dashboard/progress`, `/dashboard/progress/3/5`, `/dashboard/sessions`, `/dashboard/settings`
- [ ] RTL verification: toggle to Hebrew, confirm sidebar on right, text right-aligned, insight card borders on right, charts remain LTR
- [ ] Mobile responsiveness: Pixel 7 device in DevTools -- sidebar collapses to hamburger, heat map scrolls horizontally, summary cards stack 2-col, session rows readable, modals fit screen
- [ ] Empty states: all pages show appropriate messages when no data exists
- [ ] Loading states: all pages show loading indicators during data fetch
- [ ] Error states: all pages show error messages when queries fail
- [ ] All text uses i18n keys (no hardcoded English strings in UI)
- [ ] Commit Phase 8 (final)

## Goal

Build the parent-facing dashboard for the multiplication learning game. This is a standard React + TypeScript web UI (not Phaser) that provides analytics, kid profile management, and settings. It reads from Firebase/Firestore via the Firebase client SDK, uses the shared types and stores from the Foundation workstream, and the mastery calculation logic from the Learning Engine workstream.

The dashboard must be bilingual (Hebrew RTL + English LTR), responsive (desktop + Android Pixel), and deliver actionable insights -- not just raw data.

## Decisions and Trade-offs

1. **Charting library: recharts.** Lightweight (~40KB gzipped), React-native (JSX components, not imperative canvas API), responsive out of the box, good RTL support via layout props. Chart.js via react-chartjs-2 is heavier and its imperative canvas API fights React's declarative model. recharts integrates naturally.

2. **Styling: Tailwind CSS.** The foundation plan uses inline styles for its placeholder components, but Tailwind is the right choice for the dashboard because: (a) utility classes compose well for responsive layouts, (b) RTL support via `rtl:` variant, (c) consistent design tokens, (d) no CSS-in-JS runtime cost. The implementing agent should install Tailwind and add it to the Vite config. Foundation's inline-styled components can coexist -- no need to rewrite them.

3. **Data fetching: custom hooks with useState/useEffect.** No react-query or SWR -- the dashboard fetches on mount and supports manual refresh. This keeps dependencies minimal and matches the "no real-time subscriptions" constraint.

4. **Routing: nested routes under /dashboard.** The foundation's App.tsx has placeholder routes for `/dashboard` and `/dashboard/settings`. This plan replaces those with a `DashboardLayout` wrapper that provides sidebar navigation and a kid selector, with child routes for each page.

5. **Avatar system: emoji picker.** No file upload complexity. Kids pick from a grid of ~20 animal/fun emojis. Stored as a string in `avatar_url` (e.g., the emoji character itself). Simple, delightful, zero infrastructure.

6. **Insight generation: client-side.** Insights are computed from the mastery and session data already fetched. No server-side computation needed. The insight algorithm runs in the `useInsights` hook.

## Dependencies on Other Workstreams

**From Foundation (must exist before dashboard implementation):**
- `src/lib/firebase.ts` -- Firebase app, auth, and Firestore client
- `src/stores/auth.ts` -- `useAuthStore` with session, user, kids, activeKid, fetchKids
- `src/stores/settings.ts` -- `useSettingsStore` with locale, sound, music toggles
- `src/types/index.ts` -- KidProfile, FactMastery, ErrorType, Locale, AppSettings
- `src/types/firestore.ts` -- Firestore document type interfaces
- `src/i18n/` -- i18n setup with react-i18next
- `src/components/ProtectedRoute.tsx` -- auth guard
- `src/components/LanguageToggle.tsx` -- language switcher

**From Learning Engine (used for mastery status classification):**
- Leitner box thresholds (box 4-5 = mastered, box 2-3 = learning, box 1 = struggling)
- Error type classification constants
- These are simple enough that the dashboard can inline the constants rather than importing from the learning engine. No hard dependency.

## Files to Create/Modify

```
src/
  hooks/
    dashboard/
      useKids.ts
      useFactMastery.ts
      useSessions.ts
      useInsights.ts
      useFactDetail.ts
  pages/
    dashboard/
      Login.tsx
      KidProfiles.tsx
      Overview.tsx
      HeatMap.tsx
      FactDetail.tsx
      Sessions.tsx
      Settings.tsx
  components/
    dashboard/
      DashboardLayout.tsx
      InsightCards.tsx
      SummaryCard.tsx
      KidSelector.tsx
      SessionRow.tsx
  i18n/
    locales/
      en.json                       -- extend with dashboard strings
      he.json                       -- extend with dashboard strings
  App.tsx                           -- modify routes for dashboard layout

Install:
  npm install recharts tailwindcss @tailwindcss/vite
```

---

## Phase 1: Tailwind CSS Setup + i18n Extensions

### Step 1.1: Install Tailwind CSS

```bash
cd /home/danny/projects/active/learning-to-multiply
npm install tailwindcss @tailwindcss/vite
```

### Step 1.2: Add Tailwind Vite plugin

Modify `vite.config.ts`:

```typescript
// ABOUTME: Vite build configuration for the multiplication learning game.
// ABOUTME: Configures React plugin, Tailwind CSS, and development server settings.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
})
```

### Step 1.3: Create `src/index.css`

```css
/* ABOUTME: Global stylesheet that imports Tailwind CSS utilities. */
/* ABOUTME: Sets base font and RTL-aware layout defaults. */

@import "tailwindcss";

@theme {
  --color-sky-brand: #2aa7c9;
  --color-deep-brand: #06628d;
  --color-cream: #FFF8E1;
  --color-brick-red: #3c0f0f;
  --color-warm-orange: #e46b43;
  --color-correct: #4CAF50;
  --color-learning: #FFC107;
  --color-struggling: #EF5350;
  --color-not-introduced: #E0E0E0;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  background-color: var(--color-cream);
  color: #333;
}
```

### Step 1.4: Import CSS in `src/main.tsx`

Modify `src/main.tsx` to add the CSS import:

```typescript
// ABOUTME: Application entry point that renders the React root.
// ABOUTME: Initializes i18n and global styles before mounting the app.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### Step 1.5: Install recharts

```bash
npm install recharts
```

### Step 1.6: Extend `src/i18n/locales/en.json`

Replace the entire file. The foundation's existing keys are preserved; dashboard-specific keys are added.

```json
{
  "app": {
    "title": "Multiplication Builder",
    "description": "Help your child master multiplication through play"
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
    "delete": "Delete",
    "edit": "Edit",
    "noKids": "Add a player to get started!",
    "confirmDelete": "Are you sure you want to delete {{name}}'s profile? All progress will be lost.",
    "pickAvatar": "Pick an avatar",
    "manageProfiles": "Manage Profiles",
    "viewProgress": "View Progress",
    "startPlaying": "Start Playing"
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
    "progress": "Progress Map",
    "sessions": "Session History",
    "settings": "Settings",
    "kids": "Kids",
    "factsMastered": "Facts Mastered",
    "currentLevel": "Current Level",
    "accuracy": "Accuracy",
    "totalSessions": "Total Sessions",
    "totalPlayTime": "Play Time",
    "recentSessions": "Recent Sessions",
    "startPlaying": "Start Playing",
    "noData": "No data yet. Start playing to see progress!",
    "selectKid": "Select a kid to view their progress",
    "refresh": "Refresh",
    "minutes": "min",
    "questions": "questions",
    "date": "Date",
    "duration": "Duration",
    "questionsAttempted": "Questions",
    "avgResponseTime": "Avg Response",
    "filterByDate": "Filter by date",
    "allTime": "All time",
    "lastWeek": "Last 7 days",
    "lastMonth": "Last 30 days",
    "lastThreeMonths": "Last 90 days",
    "sessionDetails": "Session Details",
    "question": "Question",
    "answer": "Answer",
    "correct": "Correct",
    "time": "Time",
    "hintUsed": "Hint",
    "errorType": "Error"
  },
  "heatMap": {
    "title": "Multiplication Map",
    "mastered": "Mastered",
    "learning": "Learning",
    "struggling": "Struggling",
    "notIntroduced": "Not yet introduced",
    "legend": "Legend",
    "accuracy": "Accuracy",
    "attempts": "Attempts",
    "avgTime": "Avg time",
    "leitnerBox": "Box",
    "nextReview": "Next review",
    "viewDetail": "View details"
  },
  "factDetail": {
    "title": "{{a}} x {{b}}",
    "accuracyOverTime": "Accuracy Over Time",
    "responseTimeTrend": "Response Time Trend",
    "errorBreakdown": "Error Breakdown",
    "allAttempts": "All Attempts",
    "currentBox": "Current Box",
    "nextReview": "Next Review",
    "trend": "Trend",
    "improving": "Improving",
    "plateau": "Plateau",
    "declining": "Declining",
    "noAttempts": "No attempts yet for this fact."
  },
  "insights": {
    "title": "Insights",
    "strugglingCluster": "{{name}} finds the {{factor}}s hardest -- try skip-counting by {{factor}} together!",
    "shortSessions": "Sessions under 5 minutes aren't enough for learning. Aim for 10-15.",
    "hintDependency": "{{name}} uses hints on {{percent}}% of problems. Encourage trying without hints first.",
    "plateau": "Accuracy on {{a}}x{{b}} hasn't improved in {{weeks}} weeks.",
    "celebration": "{{name}} mastered all the {{factor}}s this week! {{count}} of 121 facts down!",
    "errorPattern": "{{name}} often {{errorDescription}}. The visual blocks can help.",
    "noInsights": "Keep playing to unlock insights!",
    "addInsteadOfMultiply": "adds instead of multiplying",
    "offByOne": "gets answers that are off by one factor",
    "neighborConfusion": "confuses neighboring facts",
    "zeroOneConfusion": "mixes up the zero and one rules"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "sound": "Sound Effects",
    "music": "Background Music",
    "sessionLimit": "Session Length Suggestion",
    "on": "On",
    "off": "Off",
    "noLimit": "No limit",
    "tenMin": "10 minutes",
    "fifteenMin": "15 minutes",
    "twentyMin": "20 minutes",
    "account": "Account",
    "linkedGoogle": "Linked to Google account",
    "about": "About",
    "aboutText": "Multiplication Builder helps children master multiplication facts through visual learning and spaced repetition.",
    "version": "Version"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "back": "Back",
    "retry": "Retry",
    "seconds": "s",
    "of": "of"
  },
  "errors": {
    "addition_substitution": "Added instead of multiplied",
    "off_by_one": "Off by one group",
    "neighbor_confusion": "Neighbor fact confusion",
    "zero_one_confusion": "Zero/one rule confusion",
    "commutative_gap": "Knows reverse but not this order",
    "other": "Other error"
  }
}
```

### Step 1.7: Extend `src/i18n/locales/he.json`

```json
{
  "app": {
    "title": "בונים כפל",
    "description": "עזרו לילד שלכם לשלוט בלוח הכפל דרך משחק"
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
    "delete": "מחיקה",
    "edit": "עריכה",
    "noKids": "הוסיפו שחקן כדי להתחיל!",
    "confirmDelete": "בטוחים שרוצים למחוק את הפרופיל של {{name}}? כל ההתקדמות תימחק.",
    "pickAvatar": "בחרו אווטאר",
    "manageProfiles": "ניהול פרופילים",
    "viewProgress": "צפייה בהתקדמות",
    "startPlaying": "התחילו לשחק"
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
    "progress": "מפת התקדמות",
    "sessions": "היסטוריית משחקים",
    "settings": "הגדרות",
    "kids": "ילדים",
    "factsMastered": "עובדות שנלמדו",
    "currentLevel": "שלב נוכחי",
    "accuracy": "דיוק",
    "totalSessions": "סה״כ משחקים",
    "totalPlayTime": "זמן משחק",
    "recentSessions": "משחקים אחרונים",
    "startPlaying": "התחילו לשחק",
    "noData": "אין נתונים עדיין. התחילו לשחק כדי לראות התקדמות!",
    "selectKid": "בחרו ילד כדי לראות את ההתקדמות שלו",
    "refresh": "רענון",
    "minutes": "דק׳",
    "questions": "שאלות",
    "date": "תאריך",
    "duration": "משך",
    "questionsAttempted": "שאלות",
    "avgResponseTime": "זמן תגובה ממוצע",
    "filterByDate": "סינון לפי תאריך",
    "allTime": "כל הזמן",
    "lastWeek": "7 ימים אחרונים",
    "lastMonth": "30 ימים אחרונים",
    "lastThreeMonths": "90 ימים אחרונים",
    "sessionDetails": "פרטי משחק",
    "question": "שאלה",
    "answer": "תשובה",
    "correct": "נכון",
    "time": "זמן",
    "hintUsed": "רמז",
    "errorType": "סוג שגיאה"
  },
  "heatMap": {
    "title": "מפת הכפל",
    "mastered": "נלמד",
    "learning": "בלמידה",
    "struggling": "מתקשה",
    "notIntroduced": "טרם הוצג",
    "legend": "מקרא",
    "accuracy": "דיוק",
    "attempts": "נסיונות",
    "avgTime": "זמן ממוצע",
    "leitnerBox": "קופסה",
    "nextReview": "חזרה הבאה",
    "viewDetail": "לפרטים"
  },
  "factDetail": {
    "title": "{{a}} x {{b}}",
    "accuracyOverTime": "דיוק לאורך זמן",
    "responseTimeTrend": "מגמת זמן תגובה",
    "errorBreakdown": "פילוח שגיאות",
    "allAttempts": "כל הניסיונות",
    "currentBox": "קופסה נוכחית",
    "nextReview": "חזרה הבאה",
    "trend": "מגמה",
    "improving": "משתפר",
    "plateau": "יציב",
    "declining": "יורד",
    "noAttempts": "אין ניסיונות עדיין לעובדה הזו."
  },
  "insights": {
    "title": "תובנות",
    "strugglingCluster": "{{name}} מתקשה בכפולות של {{factor}} -- נסו לספור יחד קפיצות של {{factor}}!",
    "shortSessions": "משחקים של פחות מ-5 דקות לא מספיקים ללמידה. כדאי לכוון ל-10-15 דקות.",
    "hintDependency": "{{name}} משתמש/ת ברמזים ב-{{percent}}% מהשאלות. עודדו ניסיון בלי רמזים.",
    "plateau": "הדיוק ב-{{a}}x{{b}} לא השתפר כבר {{weeks}} שבועות.",
    "celebration": "{{name}} שלט/ה בכל הכפולות של {{factor}} השבוע! {{count}} מתוך 121 עובדות!",
    "errorPattern": "{{name}} נוטה {{errorDescription}}. הקוביות הויזואליות יכולות לעזור.",
    "noInsights": "המשיכו לשחק כדי לפתוח תובנות!",
    "addInsteadOfMultiply": "לחבר במקום לכפול",
    "offByOne": "לטעות בקבוצה אחת",
    "neighborConfusion": "להתבלבל בין עובדות שכנות",
    "zeroOneConfusion": "להתבלבל בין כלל האפס לכלל האחד"
  },
  "settings": {
    "title": "הגדרות",
    "language": "שפה",
    "sound": "אפקטים קוליים",
    "music": "מוזיקת רקע",
    "sessionLimit": "המלצת אורך משחק",
    "on": "פועל",
    "off": "כבוי",
    "noLimit": "ללא הגבלה",
    "tenMin": "10 דקות",
    "fifteenMin": "15 דקות",
    "twentyMin": "20 דקות",
    "account": "חשבון",
    "linkedGoogle": "מקושר לחשבון Google",
    "about": "אודות",
    "aboutText": "בונים כפל עוזר לילדים לשלוט בלוח הכפל דרך למידה חזותית וחזרות מרווחות.",
    "version": "גרסה"
  },
  "common": {
    "loading": "טוען...",
    "error": "משהו השתבש",
    "back": "חזרה",
    "retry": "נסו שוב",
    "seconds": "שנ׳",
    "of": "מתוך"
  },
  "errors": {
    "addition_substitution": "חיבר במקום לכפול",
    "off_by_one": "טעות בקבוצה אחת",
    "neighbor_confusion": "בלבול עם עובדה שכנה",
    "zero_one_confusion": "בלבול כלל אפס/אחד",
    "commutative_gap": "יודע להפך אבל לא בסדר הזה",
    "other": "שגיאה אחרת"
  }
}
```

---

## Phase 2: Data Fetching Hooks

### Step 2.1: `src/hooks/dashboard/useKids.ts`

```typescript
// ABOUTME: Hook for managing kid profiles with full CRUD operations.
// ABOUTME: Extends the auth store's basic kid list with edit, delete, and avatar updates.

import { useState, useCallback } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../stores/auth';
import type { KidProfile } from '../../types';

interface UseKidsReturn {
  kids: KidProfile[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addKid: (name: string, avatarUrl: string | null) => Promise<KidProfile | null>;
  updateKid: (id: string, updates: { name?: string; avatarUrl?: string | null }) => Promise<boolean>;
  deleteKid: (id: string) => Promise<boolean>;
}

export function useKids(): UseKidsReturn {
  const { user, kids, fetchKids } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchKids();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch kids');
    } finally {
      setLoading(false);
    }
  }, [fetchKids]);

  const addKid = useCallback(async (name: string, avatarUrl: string | null): Promise<KidProfile | null> => {
    if (!user) return null;
    setError(null);

    try {
      const kidsRef = collection(db, 'kids');
      const docRef = await addDoc(kidsRef, {
        parent_id: user.uid,
        name,
        avatar_url: avatarUrl,
        created_at: serverTimestamp(),
      });

      await fetchKids();

      return {
        id: docRef.id,
        parentId: user.uid,
        name,
        avatarUrl,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add kid');
      return null;
    }
  }, [user, fetchKids]);

  const updateKid = useCallback(async (
    id: string,
    updates: { name?: string; avatarUrl?: string | null }
  ): Promise<boolean> => {
    setError(null);

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

    try {
      const kidRef = doc(db, 'kids', id);
      await updateDoc(kidRef, dbUpdates);
      await fetchKids();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update kid');
      return false;
    }
  }, [fetchKids]);

  const deleteKid = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const kidRef = doc(db, 'kids', id);
      await deleteDoc(kidRef);
      await fetchKids();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete kid');
      return false;
    }
  }, [fetchKids]);

  return { kids, loading, error, refresh, addKid, updateKid, deleteKid };
}
```

### Step 2.2: `src/hooks/dashboard/useFactMastery.ts`

```typescript
// ABOUTME: Hook that fetches all fact mastery data for a kid.
// ABOUTME: Builds a lookup map for the 11x11 heat map grid.

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { FactMastery } from '../../types';

export type MasteryStatus = 'mastered' | 'learning' | 'struggling' | 'not_introduced';

export interface MasteryCell {
  factorA: number;
  factorB: number;
  status: MasteryStatus;
  mastery: FactMastery | null;
}

export type MasteryGrid = MasteryCell[][];

function classifyStatus(mastery: FactMastery | null): MasteryStatus {
  if (!mastery) return 'not_introduced';
  if (mastery.leitnerBox >= 4) return 'mastered';
  if (mastery.leitnerBox >= 2) return 'learning';
  return 'struggling';
}

function canonicalKey(a: number, b: number): string {
  return `${Math.min(a, b)},${Math.max(a, b)}`;
}

interface UseFactMasteryReturn {
  grid: MasteryGrid;
  masteryMap: Map<string, FactMastery>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  stats: {
    mastered: number;
    learning: number;
    struggling: number;
    notIntroduced: number;
    totalFacts: number;
  };
}

export function useFactMastery(kidId: string | null): UseFactMasteryReturn {
  const [masteryMap, setMasteryMap] = useState<Map<string, FactMastery>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMastery = useCallback(async () => {
    if (!kidId) return;
    setLoading(true);
    setError(null);

    try {
      const masteryRef = collection(db, 'mastery');
      const q = query(masteryRef, where('kid_id', '==', kidId));
      const snapshot = await getDocs(q);

      const map = new Map<string, FactMastery>();
      for (const doc of snapshot.docs) {
        const row = doc.data();
        const key = canonicalKey(row.factor_a, row.factor_b);
        map.set(key, {
          kidId: row.kid_id,
          factorA: row.factor_a,
          factorB: row.factor_b,
          leitnerBox: row.leitner_box,
          totalAttempts: row.total_attempts,
          correctAttempts: row.correct_attempts,
          avgResponseTimeMs: row.avg_response_time_ms,
          lastPracticedAt: row.last_practiced_at?.toDate?.()?.toISOString() ?? null,
          nextReviewAt: row.next_review_at?.toDate?.()?.toISOString() ?? null,
        });
      }

      setMasteryMap(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mastery');
    }
    setLoading(false);
  }, [kidId]);

  useEffect(() => {
    fetchMastery();
  }, [fetchMastery]);

  // Build the 11x11 grid (0-10 x 0-10)
  const grid: MasteryGrid = [];
  let mastered = 0;
  let learning = 0;
  let struggling = 0;
  let notIntroduced = 0;
  const counted = new Set<string>();

  for (let row = 0; row <= 10; row++) {
    const gridRow: MasteryCell[] = [];
    for (let col = 0; col <= 10; col++) {
      const key = canonicalKey(row, col);
      const mastery = masteryMap.get(key) ?? null;
      const status = classifyStatus(mastery);
      gridRow.push({ factorA: row, factorB: col, status, mastery });

      // Count unique canonical facts for stats
      if (!counted.has(key)) {
        counted.add(key);
        switch (status) {
          case 'mastered': mastered++; break;
          case 'learning': learning++; break;
          case 'struggling': struggling++; break;
          case 'not_introduced': notIntroduced++; break;
        }
      }
    }
    grid.push(gridRow);
  }

  return {
    grid,
    masteryMap,
    loading,
    error,
    refresh: fetchMastery,
    stats: {
      mastered,
      learning,
      struggling,
      notIntroduced,
      totalFacts: counted.size,
    },
  };
}
```

### Step 2.3: `src/hooks/dashboard/useSessions.ts`

```typescript
// ABOUTME: Hook that fetches game session history for a kid.
// ABOUTME: Supports date range filtering and loading individual session attempts.

import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, getDocs, Timestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface SessionSummary {
  id: string;
  startedAt: string;
  endedAt: string | null;
  level: number;
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds: number | null;
  accuracy: number;
}

export interface SessionAttempt {
  id: string;
  factorA: number;
  factorB: number;
  correctAnswer: number;
  givenAnswer: number | null;
  isCorrect: boolean;
  responseTimeMs: number;
  hintLevel: number;
  errorType: string | null;
  attemptedAt: string;
}

export type DateFilter = 'all' | 'week' | 'month' | 'three_months';

interface UseSessionsReturn {
  sessions: SessionSummary[];
  loading: boolean;
  error: string | null;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  refresh: () => Promise<void>;
  fetchSessionAttempts: (sessionId: string) => Promise<SessionAttempt[]>;
  totalPlayTimeMinutes: number;
}

function getFilterDate(filter: DateFilter): string | null {
  if (filter === 'all') return null;
  const now = new Date();
  const days = filter === 'week' ? 7 : filter === 'month' ? 30 : 90;
  now.setDate(now.getDate() - days);
  return now.toISOString();
}

export function useSessions(kidId: string | null): UseSessionsReturn {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const fetchSessions = useCallback(async () => {
    if (!kidId) return;
    setLoading(true);
    setError(null);

    try {
      const sessionsRef = collection(db, 'sessions');
      const constraints = [
        where('kid_id', '==', kidId),
        orderBy('started_at', 'desc'),
      ];

      const filterDate = getFilterDate(dateFilter);
      if (filterDate) {
        constraints.push(where('started_at', '>=', Timestamp.fromDate(new Date(filterDate))));
      }

      const q = query(sessionsRef, ...constraints);
      const snapshot = await getDocs(q);

      const mapped: SessionSummary[] = snapshot.docs.map((doc) => {
        const row = doc.data();
        return {
          id: doc.id,
          startedAt: row.started_at?.toDate?.()?.toISOString() ?? '',
          endedAt: row.ended_at?.toDate?.()?.toISOString() ?? null,
          level: row.level,
          totalQuestions: row.total_questions,
          correctAnswers: row.correct_answers,
          durationSeconds: row.duration_seconds,
          accuracy: row.total_questions > 0
            ? Math.round((row.correct_answers / row.total_questions) * 100)
            : 0,
        };
      });

      setSessions(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    }
    setLoading(false);
  }, [kidId, dateFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const fetchSessionAttempts = useCallback(async (sessionId: string): Promise<SessionAttempt[]> => {
    try {
      const attemptsRef = collection(db, 'attempts');
      const q = query(
        attemptsRef,
        where('session_id', '==', sessionId),
        orderBy('attempted_at', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const row = doc.data();
        return {
          id: doc.id,
          factorA: row.factor_a,
          factorB: row.factor_b,
          correctAnswer: row.correct_answer,
          givenAnswer: row.given_answer,
          isCorrect: row.is_correct,
          responseTimeMs: row.response_time_ms,
          hintLevel: row.hint_level,
          errorType: row.error_type,
          attemptedAt: row.attempted_at?.toDate?.()?.toISOString() ?? '',
        };
      });
    } catch (err) {
      console.error('Failed to fetch session attempts:', err);
      return [];
    }
  }, []);

  const totalPlayTimeMinutes = sessions.reduce((sum, s) => {
    return sum + Math.round((s.durationSeconds ?? 0) / 60);
  }, 0);

  return {
    sessions,
    loading,
    error,
    dateFilter,
    setDateFilter,
    refresh: fetchSessions,
    fetchSessionAttempts,
    totalPlayTimeMinutes,
  };
}
```

### Step 2.4: `src/hooks/dashboard/useFactDetail.ts`

```typescript
// ABOUTME: Hook that fetches detailed attempt history for a single multiplication fact.
// ABOUTME: Provides data for accuracy-over-time and response-time charts.

import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, getDocs,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { FactMastery } from '../../types';

export interface FactAttempt {
  id: string;
  isCorrect: boolean;
  responseTimeMs: number;
  hintLevel: number;
  errorType: string | null;
  attemptedAt: string;
  givenAnswer: number | null;
}

export interface AccuracyDataPoint {
  date: string;
  accuracy: number;
  attempts: number;
}

export interface ResponseTimeDataPoint {
  date: string;
  avgTimeMs: number;
}

export interface ErrorBreakdown {
  type: string;
  count: number;
}

export type TrendDirection = 'improving' | 'plateau' | 'declining';

interface UseFactDetailReturn {
  attempts: FactAttempt[];
  mastery: FactMastery | null;
  accuracyOverTime: AccuracyDataPoint[];
  responseTimeTrend: ResponseTimeDataPoint[];
  errorBreakdown: ErrorBreakdown[];
  trend: TrendDirection;
  loading: boolean;
  error: string | null;
}

function computeTrend(accuracyData: AccuracyDataPoint[]): TrendDirection {
  if (accuracyData.length < 3) return 'plateau';

  const third = Math.ceil(accuracyData.length / 3);
  const firstThird = accuracyData.slice(0, third);
  const lastThird = accuracyData.slice(-third);

  const avgFirst = firstThird.reduce((s, d) => s + d.accuracy, 0) / firstThird.length;
  const avgLast = lastThird.reduce((s, d) => s + d.accuracy, 0) / lastThird.length;

  const diff = avgLast - avgFirst;
  if (diff > 10) return 'improving';
  if (diff < -10) return 'declining';
  return 'plateau';
}

function groupByDay(attempts: FactAttempt[]): Map<string, FactAttempt[]> {
  const groups = new Map<string, FactAttempt[]>();
  for (const attempt of attempts) {
    const day = attempt.attemptedAt.split('T')[0];
    const existing = groups.get(day) ?? [];
    existing.push(attempt);
    groups.set(day, existing);
  }
  return groups;
}

export function useFactDetail(
  kidId: string | null,
  factorA: number,
  factorB: number
): UseFactDetailReturn {
  const [attempts, setAttempts] = useState<FactAttempt[]>([]);
  const [mastery, setMastery] = useState<FactMastery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canonA = Math.min(factorA, factorB);
  const canonB = Math.max(factorA, factorB);

  const fetchDetail = useCallback(async () => {
    if (!kidId) return;
    setLoading(true);
    setError(null);

    // Fetch attempts for this fact (both orderings via two queries)
    try {
      const attemptsRef = collection(db, 'attempts');

      // Firestore doesn't support OR on different fields, so we run two queries
      const q1 = query(
        attemptsRef,
        where('kid_id', '==', kidId),
        where('factor_a', '==', canonA),
        where('factor_b', '==', canonB),
        orderBy('attempted_at', 'asc')
      );
      const q2 = query(
        attemptsRef,
        where('kid_id', '==', kidId),
        where('factor_a', '==', canonB),
        where('factor_b', '==', canonA),
        orderBy('attempted_at', 'asc')
      );

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const allDocs = [...snap1.docs, ...snap2.docs];

      const mappedAttempts: FactAttempt[] = allDocs.map((doc) => {
        const row = doc.data();
        return {
          id: doc.id,
          isCorrect: row.is_correct,
          responseTimeMs: row.response_time_ms,
          hintLevel: row.hint_level,
          errorType: row.error_type,
          attemptedAt: row.attempted_at?.toDate?.()?.toISOString() ?? '',
          givenAnswer: row.given_answer,
        };
      });

      // Sort combined results by attemptedAt
      mappedAttempts.sort((a, b) => a.attemptedAt.localeCompare(b.attemptedAt));
      setAttempts(mappedAttempts);

      // Fetch mastery record
      const masteryRef = collection(db, 'mastery');
      const mq = query(
        masteryRef,
        where('kid_id', '==', kidId),
        where('factor_a', '==', canonA),
        where('factor_b', '==', canonB)
      );
      const masterySnap = await getDocs(mq);

      if (!masterySnap.empty) {
        const masteryData = masterySnap.docs[0].data();
        setMastery({
          kidId: masteryData.kid_id,
          factorA: masteryData.factor_a,
          factorB: masteryData.factor_b,
          leitnerBox: masteryData.leitner_box,
          totalAttempts: masteryData.total_attempts,
          correctAttempts: masteryData.correct_attempts,
          avgResponseTimeMs: masteryData.avg_response_time_ms,
          lastPracticedAt: masteryData.last_practiced_at?.toDate?.()?.toISOString() ?? null,
          nextReviewAt: masteryData.next_review_at?.toDate?.()?.toISOString() ?? null,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fact detail');
    }

    setLoading(false);
  }, [kidId, canonA, canonB]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Compute derived data
  const grouped = groupByDay(attempts);

  const accuracyOverTime: AccuracyDataPoint[] = Array.from(grouped.entries()).map(
    ([date, dayAttempts]) => {
      const correct = dayAttempts.filter((a) => a.isCorrect).length;
      return {
        date,
        accuracy: Math.round((correct / dayAttempts.length) * 100),
        attempts: dayAttempts.length,
      };
    }
  );

  const responseTimeTrend: ResponseTimeDataPoint[] = Array.from(grouped.entries()).map(
    ([date, dayAttempts]) => {
      const avgTime = dayAttempts.reduce((s, a) => s + a.responseTimeMs, 0) / dayAttempts.length;
      return {
        date,
        avgTimeMs: Math.round(avgTime),
      };
    }
  );

  const errorCounts = new Map<string, number>();
  for (const attempt of attempts) {
    if (attempt.errorType && !attempt.isCorrect) {
      errorCounts.set(attempt.errorType, (errorCounts.get(attempt.errorType) ?? 0) + 1);
    }
  }
  const errorBreakdown: ErrorBreakdown[] = Array.from(errorCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const trend = computeTrend(accuracyOverTime);

  return {
    attempts,
    mastery,
    accuracyOverTime,
    responseTimeTrend,
    errorBreakdown,
    trend,
    loading,
    error,
  };
}
```

### Step 2.5: `src/hooks/dashboard/useInsights.ts`

```typescript
// ABOUTME: Hook that generates actionable plain-language insights from mastery and session data.
// ABOUTME: Prioritizes insights by recency and severity for parent-facing display.

import { useMemo } from 'react';
import type { FactMastery } from '../../types';
import type { SessionSummary } from './useSessions';

export interface Insight {
  id: string;
  type: 'struggling_cluster' | 'short_sessions' | 'hint_dependency'
       | 'plateau' | 'celebration' | 'error_pattern';
  priority: number;
  i18nKey: string;
  i18nParams: Record<string, string | number>;
}

interface UseInsightsReturn {
  insights: Insight[];
}

function findStrugglingClusters(
  masteryMap: Map<string, FactMastery>,
  kidName: string
): Insight[] {
  const factorStruggles = new Map<number, number>();
  const factorTotals = new Map<number, number>();

  for (const mastery of masteryMap.values()) {
    for (const factor of [mastery.factorA, mastery.factorB]) {
      factorTotals.set(factor, (factorTotals.get(factor) ?? 0) + 1);
      if (mastery.leitnerBox <= 1 && mastery.totalAttempts > 0) {
        factorStruggles.set(factor, (factorStruggles.get(factor) ?? 0) + 1);
      }
    }
  }

  const insights: Insight[] = [];
  for (const [factor, struggles] of factorStruggles.entries()) {
    const total = factorTotals.get(factor) ?? 1;
    if (factor >= 2 && struggles >= 3 && struggles / total >= 0.4) {
      insights.push({
        id: `struggling-${factor}`,
        type: 'struggling_cluster',
        priority: 80 + struggles,
        i18nKey: 'insights.strugglingCluster',
        i18nParams: { name: kidName, factor },
      });
    }
  }
  return insights;
}

function findShortSessions(sessions: SessionSummary[]): Insight[] {
  const recent = sessions.slice(0, 10);
  if (recent.length < 3) return [];

  const shortCount = recent.filter(
    (s) => s.durationSeconds !== null && s.durationSeconds < 300
  ).length;

  if (shortCount / recent.length >= 0.5) {
    return [{
      id: 'short-sessions',
      type: 'short_sessions',
      priority: 70,
      i18nKey: 'insights.shortSessions',
      i18nParams: {},
    }];
  }
  return [];
}

function findHintDependency(
  kidName: string,
  hintRate: number | null
): Insight[] {
  if (hintRate === null || hintRate < 60) return [];
  return [{
    id: 'hint-dependency',
    type: 'hint_dependency',
    priority: 75,
    i18nKey: 'insights.hintDependency',
    i18nParams: { name: kidName, percent: Math.round(hintRate) },
  }];
}

function findPlateaus(masteryMap: Map<string, FactMastery>): Insight[] {
  const insights: Insight[] = [];
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  for (const mastery of masteryMap.values()) {
    if (
      mastery.leitnerBox <= 2 &&
      mastery.totalAttempts >= 10 &&
      mastery.lastPracticedAt &&
      new Date(mastery.lastPracticedAt) > twoWeeksAgo
    ) {
      const accuracy = mastery.totalAttempts > 0
        ? mastery.correctAttempts / mastery.totalAttempts
        : 0;
      if (accuracy < 0.6) {
        const weeks = Math.ceil(
          (Date.now() - new Date(mastery.lastPracticedAt).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
        );
        insights.push({
          id: `plateau-${mastery.factorA}x${mastery.factorB}`,
          type: 'plateau',
          priority: 60 + (mastery.totalAttempts - mastery.correctAttempts),
          i18nKey: 'insights.plateau',
          i18nParams: { a: mastery.factorA, b: mastery.factorB, weeks: Math.max(2, weeks) },
        });
      }
    }
  }
  return insights;
}

function findCelebrations(
  masteryMap: Map<string, FactMastery>,
  kidName: string
): Insight[] {
  const insights: Insight[] = [];
  const factorMastery = new Map<number, { mastered: number; total: number }>();

  for (const mastery of masteryMap.values()) {
    for (const factor of [mastery.factorA, mastery.factorB]) {
      const entry = factorMastery.get(factor) ?? { mastered: 0, total: 0 };
      entry.total++;
      if (mastery.leitnerBox >= 4) entry.mastered++;
      factorMastery.set(factor, entry);
    }
  }

  const totalMastered = Array.from(masteryMap.values()).filter(
    (m) => m.leitnerBox >= 4
  ).length;

  for (const [factor, data] of factorMastery.entries()) {
    if (factor >= 2 && data.mastered === data.total && data.total >= 5) {
      insights.push({
        id: `celebration-${factor}`,
        type: 'celebration',
        priority: 90,
        i18nKey: 'insights.celebration',
        i18nParams: { name: kidName, factor, count: totalMastered },
      });
    }
  }
  return insights;
}

function findErrorPatterns(
  kidName: string,
  dominantErrorType: string | null
): Insight[] {
  if (!dominantErrorType) return [];

  const descriptionKey: Record<string, string> = {
    addition_substitution: 'insights.addInsteadOfMultiply',
    off_by_one: 'insights.offByOne',
    neighbor_confusion: 'insights.neighborConfusion',
    zero_one_confusion: 'insights.zeroOneConfusion',
  };

  const key = descriptionKey[dominantErrorType];
  if (!key) return [];

  return [{
    id: `error-${dominantErrorType}`,
    type: 'error_pattern',
    priority: 65,
    i18nKey: 'insights.errorPattern',
    i18nParams: { name: kidName, errorDescription: key },
  }];
}

export function useInsights(
  kidName: string,
  masteryMap: Map<string, FactMastery>,
  sessions: SessionSummary[],
  hintRate: number | null,
  dominantErrorType: string | null,
): UseInsightsReturn {
  const insights = useMemo(() => {
    const all: Insight[] = [
      ...findStrugglingClusters(masteryMap, kidName),
      ...findShortSessions(sessions),
      ...findHintDependency(kidName, hintRate),
      ...findPlateaus(masteryMap),
      ...findCelebrations(masteryMap, kidName),
      ...findErrorPatterns(kidName, dominantErrorType),
    ];

    all.sort((a, b) => b.priority - a.priority);
    return all.slice(0, 3);
  }, [kidName, masteryMap, sessions, hintRate, dominantErrorType]);

  return { insights };
}
```

---

## Phase 3: Shared Dashboard Components

### Step 3.1: `src/components/dashboard/SummaryCard.tsx`

```tsx
// ABOUTME: Reusable metric card displaying a label and value.
// ABOUTME: Used on the dashboard overview for facts mastered, accuracy, etc.

interface SummaryCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}

export function SummaryCard({ label, value, sublabel, color = '#06628d' }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1 min-w-[140px]">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-3xl font-bold" style={{ color }}>
        {value}
      </span>
      {sublabel && (
        <span className="text-xs text-gray-400">{sublabel}</span>
      )}
    </div>
  );
}
```

### Step 3.2: `src/components/dashboard/KidSelector.tsx`

```tsx
// ABOUTME: Dropdown component for selecting which kid's data to view.
// ABOUTME: Used in the dashboard header to switch between kid profiles.

import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import type { KidProfile } from '../../types';

interface KidSelectorProps {
  onSelect?: (kid: KidProfile) => void;
}

export function KidSelector({ onSelect }: KidSelectorProps) {
  const { t } = useTranslation();
  const { kids, activeKid, setActiveKid } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const kid = kids.find((k) => k.id === e.target.value) ?? null;
    if (kid) {
      setActiveKid(kid);
      onSelect?.(kid);
    }
  };

  if (kids.length === 0) {
    return (
      <span className="text-sm text-gray-400">
        {t('dashboard.selectKid')}
      </span>
    );
  }

  return (
    <select
      value={activeKid?.id ?? ''}
      onChange={handleChange}
      className="px-3 py-2 rounded-lg border-2 border-deep-brand bg-white text-deep-brand font-medium text-sm cursor-pointer"
    >
      {!activeKid && (
        <option value="" disabled>
          {t('dashboard.selectKid')}
        </option>
      )}
      {kids.map((kid) => (
        <option key={kid.id} value={kid.id}>
          {kid.avatarUrl ? `${kid.avatarUrl} ` : ''}{kid.name}
        </option>
      ))}
    </select>
  );
}
```

### Step 3.3: `src/components/dashboard/InsightCards.tsx`

```tsx
// ABOUTME: Renders a list of actionable insight cards for parents.
// ABOUTME: Each card shows a plain-language message with a colored priority indicator.

import { useTranslation } from 'react-i18next';
import type { Insight } from '../../hooks/dashboard/useInsights';

interface InsightCardsProps {
  insights: Insight[];
}

const typeColors: Record<Insight['type'], { bg: string; border: string }> = {
  struggling_cluster: { bg: 'bg-red-50', border: 'border-struggling' },
  short_sessions: { bg: 'bg-yellow-50', border: 'border-learning' },
  hint_dependency: { bg: 'bg-yellow-50', border: 'border-learning' },
  plateau: { bg: 'bg-orange-50', border: 'border-warm-orange' },
  celebration: { bg: 'bg-green-50', border: 'border-correct' },
  error_pattern: { bg: 'bg-red-50', border: 'border-struggling' },
};

export function InsightCards({ insights }: InsightCardsProps) {
  const { t } = useTranslation();

  if (insights.length === 0) {
    return (
      <p className="text-gray-400 text-sm italic">
        {t('insights.noInsights')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {insights.map((insight) => {
        const colors = typeColors[insight.type];
        const params = { ...insight.i18nParams };
        if (insight.type === 'error_pattern' && typeof params.errorDescription === 'string') {
          params.errorDescription = t(params.errorDescription as string);
        }

        return (
          <div
            key={insight.id}
            className={`${colors.bg} ${colors.border} border-l-4 rtl:border-l-0 rtl:border-r-4 rounded-lg p-4`}
          >
            <p className="text-sm text-gray-700">
              {t(insight.i18nKey, params)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
```

### Step 3.4: `src/components/dashboard/SessionRow.tsx`

```tsx
// ABOUTME: Expandable row component showing a single game session summary.
// ABOUTME: Expands to reveal individual question attempts when clicked.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SessionSummary, SessionAttempt } from '../../hooks/dashboard/useSessions';

interface SessionRowProps {
  session: SessionSummary;
  onLoadAttempts: (sessionId: string) => Promise<SessionAttempt[]>;
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function SessionRow({ session, onLoadAttempts }: SessionRowProps) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [attempts, setAttempts] = useState<SessionAttempt[] | null>(null);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  const toggleExpand = async () => {
    if (!expanded && !attempts) {
      setLoadingAttempts(true);
      const data = await onLoadAttempts(session.id);
      setAttempts(data);
      setLoadingAttempts(false);
    }
    setExpanded(!expanded);
  };

  const accuracyColor =
    session.accuracy >= 80 ? 'text-correct' :
    session.accuracy >= 50 ? 'text-learning' :
    'text-struggling';

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <button
        onClick={toggleExpand}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm text-gray-600">
            {formatDate(session.startedAt, i18n.language)}
          </span>
          <span className="text-sm text-gray-500">
            {formatDuration(session.durationSeconds)}
          </span>
          <span className="text-sm text-gray-500">
            {session.totalQuestions} {t('dashboard.questions')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-lg font-bold ${accuracyColor}`}>
            {session.accuracy}%
          </span>
          <span className="text-gray-400 text-xs">
            {expanded ? '\u25B2' : '\u25BC'}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-50">
          {loadingAttempts ? (
            <p className="text-sm text-gray-400 py-2">{t('common.loading')}</p>
          ) : attempts && attempts.length > 0 ? (
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th className="text-start pb-1">{t('dashboard.question')}</th>
                  <th className="text-start pb-1">{t('dashboard.answer')}</th>
                  <th className="text-start pb-1">{t('dashboard.correct')}</th>
                  <th className="text-start pb-1">{t('dashboard.time')}</th>
                  <th className="text-start pb-1">{t('dashboard.hintUsed')}</th>
                  <th className="text-start pb-1">{t('dashboard.errorType')}</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-t border-gray-50">
                    <td className="py-1 font-mono">{a.factorA} x {a.factorB}</td>
                    <td className="py-1">{a.givenAnswer ?? '--'}</td>
                    <td className="py-1">
                      {a.isCorrect
                        ? <span className="text-correct font-bold">{'\u2713'}</span>
                        : <span className="text-struggling font-bold">{'\u2717'}</span>}
                    </td>
                    <td className="py-1 text-gray-500">
                      {(a.responseTimeMs / 1000).toFixed(1)}{t('common.seconds')}
                    </td>
                    <td className="py-1 text-gray-500">
                      {a.hintLevel > 0 ? `L${a.hintLevel}` : '--'}
                    </td>
                    <td className="py-1 text-gray-400 text-xs">
                      {a.errorType ? t(`errors.${a.errorType}`) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-400 py-2">No attempts recorded.</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Phase 4: Dashboard Layout and Navigation

### Step 4.1: `src/components/dashboard/DashboardLayout.tsx`

```tsx
// ABOUTME: Layout wrapper for all dashboard pages with sidebar navigation.
// ABOUTME: Provides a responsive sidebar (hamburger on mobile) and kid selector header.

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { KidSelector } from './KidSelector';
import { LanguageToggle } from '../LanguageToggle';

const NAV_ITEMS = [
  { path: '/dashboard', labelKey: 'dashboard.overview', end: true },
  { path: '/dashboard/kids', labelKey: 'dashboard.kids', end: false },
  { path: '/dashboard/progress', labelKey: 'dashboard.progress', end: false },
  { path: '/dashboard/sessions', labelKey: 'dashboard.sessions', end: false },
  { path: '/dashboard/settings', labelKey: 'dashboard.settings', end: false },
];

export function DashboardLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut, fetchKids } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchKids();
  }, [fetchKids]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream">
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-deep-brand"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
        <KidSelector />
        <LanguageToggle />
      </header>

      {/* Sidebar */}
      <nav
        className={`
          ${sidebarOpen ? 'block' : 'hidden'} md:block
          w-full md:w-60 bg-white shadow-sm md:shadow-md
          md:min-h-screen p-4 flex-shrink-0
        `}
      >
        <div className="hidden md:block mb-6">
          <h2 className="text-xl font-bold text-deep-brand mb-1">
            {t('app.title')}
          </h2>
          <p className="text-xs text-gray-400">
            {user?.displayName ?? 'Parent'}
          </p>
        </div>

        <div className="hidden md:block mb-6">
          <KidSelector />
        </div>

        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-brand/10 text-sky-brand'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-2">
          <div className="hidden md:block">
            <LanguageToggle />
          </div>
          <button
            onClick={handleSignOut}
            className="px-3 py-2 text-sm text-struggling hover:bg-red-50 rounded-lg transition-colors text-start"
          >
            {t('auth.signOut')}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}
```

### Step 4.2: Modify `src/App.tsx` for dashboard layout routes

Replace the entire file:

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
import { Login } from './pages/dashboard/Login';
import { SelectKid } from './pages/play/SelectKid';
import { GamePage } from './pages/play/GamePage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { Overview } from './pages/dashboard/Overview';
import { KidProfiles } from './pages/dashboard/KidProfiles';
import { HeatMap } from './pages/dashboard/HeatMap';
import { FactDetail } from './pages/dashboard/FactDetail';
import { Sessions } from './pages/dashboard/Sessions';
import { Settings } from './pages/dashboard/Settings';

export default function App() {
  const { setUser } = useAuthStore();
  const { locale } = useSettingsStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser]);

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
          element={<ProtectedRoute><SelectKid /></ProtectedRoute>}
        />
        <Route
          path="/play/game"
          element={<ProtectedRoute><GamePage /></ProtectedRoute>}
        />

        {/* Dashboard routes (parent-facing, nested under layout) */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
        >
          <Route index element={<Overview />} />
          <Route path="kids" element={<KidProfiles />} />
          <Route path="progress" element={<HeatMap />} />
          <Route path="progress/:factorA/:factorB" element={<FactDetail />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Phase 5: Dashboard Pages -- Login, KidProfiles, Overview

### Step 5.1: `src/pages/dashboard/Login.tsx`

```tsx
// ABOUTME: Parent login page for the dashboard with Google OAuth.
// ABOUTME: Redirects to the dashboard overview after authentication.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { LanguageToggle } from '../../components/LanguageToggle';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 end-4">
        <LanguageToggle />
      </div>

      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="w-24 h-24 bg-deep-brand rounded-2xl flex items-center justify-center">
          <span className="text-4xl text-white font-bold">x</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-deep-brand">
          {t('app.title')}
        </h1>

        <p className="text-gray-500 text-lg">
          {t('app.description')}
        </p>

        <button
          onClick={signInWithGoogle}
          className="mt-4 flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-lg font-medium text-gray-700">
            {t('auth.signIn')}
          </span>
        </button>
      </div>
    </div>
  );
}
```

### Step 5.2: `src/pages/dashboard/KidProfiles.tsx`

```tsx
// ABOUTME: Kid profile management page with create, edit, delete, and avatar selection.
// ABOUTME: Shows kid cards with avatars and actions to manage profiles or start playing.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { useKids } from '../../hooks/dashboard/useKids';
import type { KidProfile } from '../../types';

const AVATAR_OPTIONS = [
  '\uD83E\uDDA6', '\uD83D\uDC36', '\uD83D\uDC31', '\uD83D\uDC3B', '\uD83D\uDC3C',
  '\uD83D\uDC28', '\uD83E\uDD81', '\uD83D\uDC2F', '\uD83D\uDC35', '\uD83D\uDC37',
  '\uD83D\uDC38', '\uD83E\uDD8B', '\uD83D\uDC1D', '\uD83D\uDC22', '\uD83D\uDC19',
  '\uD83E\uDD84', '\uD83D\uDC3F\uFE0F', '\uD83E\uDD89', '\uD83D\uDC27', '\uD83E\uDD9A',
];

interface KidFormState {
  name: string;
  avatar: string | null;
}

export function KidProfiles() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setActiveKid } = useAuthStore();
  const { kids, loading, error, refresh, addKid, updateKid, deleteKid } = useKids();

  const [showForm, setShowForm] = useState(false);
  const [editingKid, setEditingKid] = useState<KidProfile | null>(null);
  const [form, setForm] = useState<KidFormState>({ name: '', avatar: null });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openCreateForm = () => {
    setEditingKid(null);
    setForm({ name: '', avatar: null });
    setShowForm(true);
  };

  const openEditForm = (kid: KidProfile) => {
    setEditingKid(kid);
    setForm({ name: kid.name, avatar: kid.avatarUrl });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || saving) return;
    setSaving(true);

    if (editingKid) {
      await updateKid(editingKid.id, {
        name: form.name.trim(),
        avatarUrl: form.avatar,
      });
    } else {
      await addKid(form.name.trim(), form.avatar);
    }

    setSaving(false);
    setShowForm(false);
    setEditingKid(null);
  };

  const handleDelete = async (id: string) => {
    await deleteKid(id);
    setConfirmDeleteId(null);
  };

  const handleViewProgress = (kid: KidProfile) => {
    setActiveKid(kid);
    navigate('/dashboard/progress');
  };

  const handleStartPlaying = (kid: KidProfile) => {
    setActiveKid(kid);
    navigate('/play/game');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-deep-brand">
          {t('kids.manageProfiles')}
        </h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-deep-brand text-white rounded-lg text-sm font-medium hover:bg-sky-brand transition-colors cursor-pointer"
        >
          + {t('kids.addKid')}
        </button>
      </div>

      {error && <p className="text-struggling text-sm mb-4">{error}</p>}

      {loading && kids.length === 0 ? (
        <p className="text-gray-400">{t('common.loading')}</p>
      ) : kids.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">{t('kids.noKids')}</p>
          <button
            onClick={openCreateForm}
            className="px-6 py-3 border-2 border-dashed border-deep-brand text-deep-brand rounded-xl hover:bg-deep-brand/5 transition-colors cursor-pointer"
          >
            + {t('kids.addKid')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kids.map((kid) => (
            <div key={kid.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{kid.avatarUrl || '\uD83D\uDC64'}</span>
                <h3 className="font-bold text-lg text-deep-brand">{kid.name}</h3>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleViewProgress(kid)}
                  className="flex-1 px-3 py-2 bg-sky-brand/10 text-sky-brand rounded-lg text-sm font-medium hover:bg-sky-brand/20 transition-colors cursor-pointer"
                >
                  {t('kids.viewProgress')}
                </button>
                <button
                  onClick={() => handleStartPlaying(kid)}
                  className="flex-1 px-3 py-2 bg-correct/10 text-correct rounded-lg text-sm font-medium hover:bg-correct/20 transition-colors cursor-pointer"
                >
                  {t('kids.startPlaying')}
                </button>
              </div>

              <div className="flex gap-2 border-t border-gray-50 pt-2">
                <button onClick={() => openEditForm(kid)} className="text-xs text-gray-400 hover:text-deep-brand transition-colors cursor-pointer">
                  {t('kids.edit')}
                </button>
                {confirmDeleteId === kid.id ? (
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-struggling">{t('kids.confirmDelete', { name: kid.name })}</span>
                    <button onClick={() => handleDelete(kid.id)} className="text-xs text-white bg-struggling px-2 py-1 rounded cursor-pointer">{t('kids.delete')}</button>
                    <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-400 cursor-pointer">{t('kids.cancel')}</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDeleteId(kid.id)} className="text-xs text-gray-400 hover:text-struggling transition-colors cursor-pointer">
                    {t('kids.delete')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-deep-brand mb-4">
              {editingKid ? t('kids.edit') : t('kids.addKid')}
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('kids.enterName')}
                autoFocus
                className="px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-deep-brand focus:outline-none"
              />

              <div>
                <p className="text-sm text-gray-500 mb-2">{t('kids.pickAvatar')}</p>
                <div className="grid grid-cols-5 gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setForm({ ...form, avatar: emoji })}
                      className={`text-3xl p-2 rounded-lg transition-colors cursor-pointer ${
                        form.avatar === emoji ? 'bg-sky-brand/20 ring-2 ring-sky-brand' : 'hover:bg-gray-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleSave}
                  disabled={!form.name.trim() || saving}
                  className="flex-1 px-4 py-3 bg-deep-brand text-white rounded-xl font-medium hover:bg-sky-brand transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {t('kids.save')}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditingKid(null); }}
                  className="px-4 py-3 border-2 border-gray-200 text-gray-500 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {t('kids.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 5.3: `src/pages/dashboard/Overview.tsx`

Replace the foundation's placeholder entirely:

```tsx
// ABOUTME: Dashboard home page showing summary metrics, recent sessions, and insights.
// ABOUTME: Displays key stats as cards with a quick insight panel and start-playing button.

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { useFactMastery } from '../../hooks/dashboard/useFactMastery';
import { useSessions } from '../../hooks/dashboard/useSessions';
import { useInsights } from '../../hooks/dashboard/useInsights';
import { SummaryCard } from '../../components/dashboard/SummaryCard';
import { InsightCards } from '../../components/dashboard/InsightCards';
import { SessionRow } from '../../components/dashboard/SessionRow';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function Overview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeKid } = useAuthStore();

  const { stats, masteryMap, loading: masteryLoading } = useFactMastery(activeKid?.id ?? null);
  const { sessions, loading: sessionsLoading, totalPlayTimeMinutes, fetchSessionAttempts } =
    useSessions(activeKid?.id ?? null);

  const [hintRate, setHintRate] = useState<number | null>(null);
  const [dominantError, setDominantError] = useState<string | null>(null);

  const fetchGlobalStats = useCallback(async () => {
    if (!activeKid) return;

    try {
      const attemptsRef = collection(db, 'attempts');
      const q = query(attemptsRef, where('kid_id', '==', activeKid.id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docs = snapshot.docs.map((d) => d.data());
        const withHints = docs.filter((a) => a.hint_level > 0).length;
        setHintRate((withHints / docs.length) * 100);

        const errorCounts = new Map<string, number>();
        for (const a of docs) {
          if (a.error_type) {
            errorCounts.set(a.error_type, (errorCounts.get(a.error_type) ?? 0) + 1);
          }
        }
        let maxCount = 0;
        let maxType: string | null = null;
        for (const [type, count] of errorCounts) {
          if (count > maxCount) { maxCount = count; maxType = type; }
        }
        setDominantError(maxType);
      }
    } catch (err) {
      console.error('Failed to fetch global stats:', err);
    }
  }, [activeKid]);

  useEffect(() => { fetchGlobalStats(); }, [fetchGlobalStats]);

  const { insights } = useInsights(
    activeKid?.name ?? '', masteryMap, sessions, hintRate, dominantError
  );

  const currentLevel = sessions.length > 0 ? sessions[0].level : 1;
  const overallAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
    : 0;

  const loading = masteryLoading || sessionsLoading;

  if (!activeKid) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 text-lg">{t('dashboard.selectKid')}</p>
      </div>
    );
  }

  if (loading) return <p className="text-gray-400">{t('common.loading')}</p>;

  const hasData = sessions.length > 0 || stats.mastered + stats.learning + stats.struggling > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-deep-brand">
          {activeKid.avatarUrl && <span className="me-2">{activeKid.avatarUrl}</span>}
          {activeKid.name}
        </h1>
        <button
          onClick={() => navigate('/play/game')}
          className="px-5 py-2 bg-correct text-white rounded-xl font-medium hover:bg-correct/90 transition-colors cursor-pointer"
        >
          {t('dashboard.startPlaying')}
        </button>
      </div>

      {!hasData ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-4">{t('dashboard.noData')}</p>
          <button onClick={() => navigate('/play/game')} className="px-6 py-3 bg-deep-brand text-white rounded-xl font-medium cursor-pointer">
            {t('dashboard.startPlaying')}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label={t('dashboard.factsMastered')} value={stats.mastered} sublabel={`${t('common.of')} ${stats.totalFacts}`} color="#4CAF50" />
            <SummaryCard label={t('dashboard.currentLevel')} value={currentLevel} />
            <SummaryCard label={t('dashboard.accuracy')} value={`${overallAccuracy}%`} color={overallAccuracy >= 70 ? '#4CAF50' : overallAccuracy >= 40 ? '#FFC107' : '#EF5350'} />
            <SummaryCard label={t('dashboard.totalPlayTime')} value={`${totalPlayTimeMinutes}`} sublabel={t('dashboard.minutes')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-bold text-deep-brand mb-3">{t('insights.title')}</h2>
              <InsightCards insights={insights} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-deep-brand mb-3">{t('dashboard.recentSessions')}</h2>
              <div className="flex flex-col gap-2">
                {sessions.slice(0, 5).map((session) => (
                  <SessionRow key={session.id} session={session} onLoadAttempts={fetchSessionAttempts} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Phase 6: Heat Map and Fact Detail Pages

### Step 6.1: `src/pages/dashboard/HeatMap.tsx`

This is the hero visualization -- an 11x11 grid showing mastery status for every multiplication fact.

```tsx
// ABOUTME: 11x11 multiplication heat map showing mastery status for every fact.
// ABOUTME: Color-coded cells with hover popups and click-through to fact detail.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { useFactMastery, type MasteryCell, type MasteryStatus } from '../../hooks/dashboard/useFactMastery';

const STATUS_COLORS: Record<MasteryStatus, string> = {
  mastered: '#4CAF50',
  learning: '#FFC107',
  struggling: '#EF5350',
  not_introduced: '#E0E0E0',
};

const STATUS_BG_CLASSES: Record<MasteryStatus, string> = {
  mastered: 'bg-correct hover:bg-correct/80',
  learning: 'bg-learning hover:bg-learning/80',
  struggling: 'bg-struggling hover:bg-struggling/80',
  not_introduced: 'bg-not-introduced hover:bg-gray-300',
};

const STATUS_TEXT_CLASSES: Record<MasteryStatus, string> = {
  mastered: 'text-white',
  learning: 'text-gray-800',
  struggling: 'text-white',
  not_introduced: 'text-gray-500',
};

interface PopupData {
  cell: MasteryCell;
  x: number;
  y: number;
}

export function HeatMap() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { activeKid } = useAuthStore();
  const { grid, stats, loading, error, refresh } = useFactMastery(activeKid?.id ?? null);
  const [popup, setPopup] = useState<PopupData | null>(null);

  if (!activeKid) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 text-lg">{t('dashboard.selectKid')}</p>
      </div>
    );
  }

  if (loading) return <p className="text-gray-400">{t('common.loading')}</p>;
  if (error) return <p className="text-struggling">{error}</p>;

  const handleCellHover = (cell: MasteryCell, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopup({ cell, x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleCellClick = (cell: MasteryCell) => {
    setPopup(null);
    if (cell.mastery) {
      navigate(`/dashboard/progress/${cell.factorA}/${cell.factorB}`);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '--';
    return new Date(iso).toLocaleDateString(i18n.language === 'he' ? 'he-IL' : 'en-US', {
      month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-deep-brand">{t('heatMap.title')}</h1>
        <button onClick={refresh} className="px-3 py-1 text-sm text-sky-brand border border-sky-brand rounded-lg hover:bg-sky-brand/10 transition-colors cursor-pointer">
          {t('dashboard.refresh')}
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 flex-wrap text-sm">
        <span className="text-correct font-medium">{stats.mastered} {t('heatMap.mastered')}</span>
        <span className="text-learning font-medium">{stats.learning} {t('heatMap.learning')}</span>
        <span className="text-struggling font-medium">{stats.struggling} {t('heatMap.struggling')}</span>
        <span className="text-gray-400">{stats.notIntroduced} {t('heatMap.notIntroduced')}</span>
      </div>

      {/* The Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Column headers */}
          <div className="flex">
            <div className="w-10 h-10 flex items-center justify-center text-xs font-bold text-gray-400">x</div>
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className="w-10 h-10 flex items-center justify-center text-xs font-bold text-deep-brand">
                {i}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {/* Row header */}
              <div className="w-10 h-10 flex items-center justify-center text-xs font-bold text-deep-brand">
                {rowIdx}
              </div>

              {/* Cells */}
              {row.map((cell, colIdx) => (
                <button
                  key={colIdx}
                  className={`w-10 h-10 flex items-center justify-center text-[10px] font-mono rounded-sm m-[1px] transition-colors cursor-pointer
                    ${STATUS_BG_CLASSES[cell.status]} ${STATUS_TEXT_CLASSES[cell.status]}`}
                  onMouseEnter={(e) => handleCellHover(cell, e)}
                  onMouseLeave={() => setPopup(null)}
                  onClick={() => handleCellClick(cell)}
                  title={`${cell.factorA}x${cell.factorB}`}
                >
                  {cell.factorA * cell.factorB}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-xs">
        <span className="text-gray-500 font-medium">{t('heatMap.legend')}:</span>
        {([
          ['mastered', t('heatMap.mastered')],
          ['learning', t('heatMap.learning')],
          ['struggling', t('heatMap.struggling')],
          ['not_introduced', t('heatMap.notIntroduced')],
        ] as [MasteryStatus, string][]).map(([status, label]) => (
          <span key={status} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: STATUS_COLORS[status] }} />
            {label}
          </span>
        ))}
      </div>

      {/* Hover popup */}
      {popup && popup.cell.mastery && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-3 text-sm pointer-events-none"
          style={{
            left: Math.min(popup.x, window.innerWidth - 200),
            top: Math.max(popup.y - 140, 10),
          }}
        >
          <p className="font-bold text-deep-brand mb-1">
            {popup.cell.factorA} x {popup.cell.factorB} = {popup.cell.factorA * popup.cell.factorB}
          </p>
          <p className="text-gray-600">
            {t('heatMap.accuracy')}: {popup.cell.mastery.totalAttempts > 0
              ? Math.round((popup.cell.mastery.correctAttempts / popup.cell.mastery.totalAttempts) * 100)
              : 0}%
          </p>
          <p className="text-gray-600">
            {t('heatMap.attempts')}: {popup.cell.mastery.totalAttempts}
          </p>
          <p className="text-gray-600">
            {t('heatMap.avgTime')}: {popup.cell.mastery.avgResponseTimeMs
              ? `${(popup.cell.mastery.avgResponseTimeMs / 1000).toFixed(1)}s`
              : '--'}
          </p>
          <p className="text-gray-600">
            {t('heatMap.leitnerBox')}: {popup.cell.mastery.leitnerBox}
          </p>
          <p className="text-gray-600">
            {t('heatMap.nextReview')}: {formatDate(popup.cell.mastery.nextReviewAt)}
          </p>
          <p className="text-xs text-sky-brand mt-1">{t('heatMap.viewDetail')}</p>
        </div>
      )}
    </div>
  );
}
```

### Step 6.2: `src/pages/dashboard/FactDetail.tsx`

```tsx
// ABOUTME: Drill-down page showing detailed analytics for a single multiplication fact.
// ABOUTME: Shows accuracy chart, response time trend, error breakdown, and attempt history.

import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { useFactDetail } from '../../hooks/dashboard/useFactDetail';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

const ERROR_COLORS = ['#EF5350', '#FF7043', '#FFA726', '#FFCA28', '#9E9E9E'];

const TREND_LABELS: Record<string, { key: string; color: string }> = {
  improving: { key: 'factDetail.improving', color: '#4CAF50' },
  plateau: { key: 'factDetail.plateau', color: '#FFC107' },
  declining: { key: 'factDetail.declining', color: '#EF5350' },
};

export function FactDetail() {
  const { factorA: paramA, factorB: paramB } = useParams<{ factorA: string; factorB: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeKid } = useAuthStore();

  const factorA = Number(paramA ?? 0);
  const factorB = Number(paramB ?? 0);

  const {
    attempts, mastery, accuracyOverTime, responseTimeTrend,
    errorBreakdown, trend, loading, error,
  } = useFactDetail(activeKid?.id ?? null, factorA, factorB);

  if (!activeKid) {
    return <p className="text-gray-400">{t('dashboard.selectKid')}</p>;
  }

  if (loading) return <p className="text-gray-400">{t('common.loading')}</p>;
  if (error) return <p className="text-struggling">{error}</p>;

  const trendInfo = TREND_LABELS[trend];
  const accuracy = mastery && mastery.totalAttempts > 0
    ? Math.round((mastery.correctAttempts / mastery.totalAttempts) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/progress')}
          className="text-sm text-sky-brand hover:underline cursor-pointer"
        >
          {t('common.back')}
        </button>
        <h1 className="text-2xl font-bold text-deep-brand">
          {t('factDetail.title', { a: factorA, b: factorB })} = {factorA * factorB}
        </h1>
      </div>

      {attempts.length === 0 ? (
        <p className="text-gray-400 py-8">{t('factDetail.noAttempts')}</p>
      ) : (
        <>
          {/* Summary cards row */}
          <div className="flex gap-4 flex-wrap">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[120px]">
              <span className="text-xs text-gray-500">{t('heatMap.accuracy')}</span>
              <p className="text-2xl font-bold" style={{ color: accuracy >= 70 ? '#4CAF50' : accuracy >= 40 ? '#FFC107' : '#EF5350' }}>
                {accuracy}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[120px]">
              <span className="text-xs text-gray-500">{t('heatMap.attempts')}</span>
              <p className="text-2xl font-bold text-deep-brand">{mastery?.totalAttempts ?? 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[120px]">
              <span className="text-xs text-gray-500">{t('factDetail.currentBox')}</span>
              <p className="text-2xl font-bold text-deep-brand">{mastery?.leitnerBox ?? '--'}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[120px]">
              <span className="text-xs text-gray-500">{t('factDetail.trend')}</span>
              <p className="text-lg font-bold" style={{ color: trendInfo.color }}>
                {t(trendInfo.key)}
              </p>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Accuracy over time */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-deep-brand mb-3">{t('factDetail.accuracyOverTime')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={accuracyOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="#4CAF50" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Response time trend */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-deep-brand mb-3">{t('factDetail.responseTimeTrend')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={responseTimeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}s`} />
                  <Tooltip formatter={(value: number) => `${(value / 1000).toFixed(1)}s`} />
                  <Line type="monotone" dataKey="avgTimeMs" stroke="#2aa7c9" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Error breakdown */}
          {errorBreakdown.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-deep-brand mb-3">{t('factDetail.errorBreakdown')}</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={errorBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis
                    type="category"
                    dataKey="type"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(type) => t(`errors.${type}`)}
                    width={150}
                  />
                  <Tooltip labelFormatter={(type) => t(`errors.${type}`)} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {errorBreakdown.map((_, idx) => (
                      <Cell key={idx} fill={ERROR_COLORS[idx % ERROR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Attempt history table */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-deep-brand mb-3">{t('factDetail.allAttempts')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs border-b border-gray-100">
                    <th className="text-start pb-2">{t('dashboard.date')}</th>
                    <th className="text-start pb-2">{t('dashboard.answer')}</th>
                    <th className="text-start pb-2">{t('dashboard.correct')}</th>
                    <th className="text-start pb-2">{t('dashboard.time')}</th>
                    <th className="text-start pb-2">{t('dashboard.hintUsed')}</th>
                    <th className="text-start pb-2">{t('dashboard.errorType')}</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a.id} className="border-t border-gray-50">
                      <td className="py-1.5 text-gray-600 text-xs">
                        {new Date(a.attemptedAt).toLocaleDateString()}
                      </td>
                      <td className="py-1.5">{a.givenAnswer ?? '--'}</td>
                      <td className="py-1.5">
                        {a.isCorrect
                          ? <span className="text-correct font-bold">{'\u2713'}</span>
                          : <span className="text-struggling font-bold">{'\u2717'}</span>}
                      </td>
                      <td className="py-1.5 text-gray-500">
                        {(a.responseTimeMs / 1000).toFixed(1)}s
                      </td>
                      <td className="py-1.5 text-gray-500">
                        {a.hintLevel > 0 ? `L${a.hintLevel}` : '--'}
                      </td>
                      <td className="py-1.5 text-gray-400 text-xs">
                        {a.errorType ? t(`errors.${a.errorType}`) : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Phase 7: Sessions and Settings Pages

### Step 7.1: `src/pages/dashboard/Sessions.tsx`

```tsx
// ABOUTME: Session history page with date filtering and expandable session details.
// ABOUTME: Shows a list of all game sessions with accuracy, duration, and drill-down.

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { useSessions, type DateFilter } from '../../hooks/dashboard/useSessions';
import { SessionRow } from '../../components/dashboard/SessionRow';

const DATE_FILTER_OPTIONS: { value: DateFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'dashboard.allTime' },
  { value: 'week', labelKey: 'dashboard.lastWeek' },
  { value: 'month', labelKey: 'dashboard.lastMonth' },
  { value: 'three_months', labelKey: 'dashboard.lastThreeMonths' },
];

export function Sessions() {
  const { t } = useTranslation();
  const { activeKid } = useAuthStore();
  const {
    sessions, loading, error, dateFilter, setDateFilter,
    refresh, fetchSessionAttempts, totalPlayTimeMinutes,
  } = useSessions(activeKid?.id ?? null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!activeKid) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 text-lg">{t('dashboard.selectKid')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-deep-brand">
          {t('dashboard.sessions')}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{t('dashboard.filterByDate')}:</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm cursor-pointer bg-white"
          >
            {DATE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4 text-sm text-gray-500">
        <span>{sessions.length} {t('dashboard.sessions').toLowerCase()}</span>
        <span>{totalPlayTimeMinutes} {t('dashboard.minutes')} {t('dashboard.totalPlayTime').toLowerCase()}</span>
      </div>

      {error && <p className="text-struggling text-sm">{error}</p>}

      {loading ? (
        <p className="text-gray-400">{t('common.loading')}</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-400 text-center py-12">{t('dashboard.noData')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onLoadAttempts={fetchSessionAttempts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 7.2: `src/pages/dashboard/Settings.tsx`

Replace the foundation's placeholder entirely:

```tsx
// ABOUTME: Settings page for language, sound, music, session limit, and account info.
// ABOUTME: All settings persist to localStorage via Zustand.

import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/settings';
import { useAuthStore } from '../../stores/auth';
import { LanguageToggle } from '../../components/LanguageToggle';

type SessionLimitOption = 0 | 10 | 15 | 20;

const SESSION_LIMIT_OPTIONS: { value: SessionLimitOption; labelKey: string }[] = [
  { value: 0, labelKey: 'settings.noLimit' },
  { value: 10, labelKey: 'settings.tenMin' },
  { value: 15, labelKey: 'settings.fifteenMin' },
  { value: 20, labelKey: 'settings.twentyMin' },
];

export function Settings() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    soundEnabled, musicEnabled,
    setSoundEnabled, setMusicEnabled,
  } = useSettingsStore();

  const toggleButton = (active: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-correct text-white'
          : 'bg-gray-200 text-gray-500'
      }`}
    >
      {active ? t('settings.on') : t('settings.off')}
    </button>
  );

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <h1 className="text-2xl font-bold text-deep-brand">{t('settings.title')}</h1>

      {/* Language */}
      <div className="flex items-center justify-between">
        <span className="text-lg">{t('settings.language')}</span>
        <LanguageToggle />
      </div>

      {/* Sound Effects */}
      <div className="flex items-center justify-between">
        <span className="text-lg">{t('settings.sound')}</span>
        {toggleButton(soundEnabled, () => setSoundEnabled(!soundEnabled))}
      </div>

      {/* Background Music */}
      <div className="flex items-center justify-between">
        <span className="text-lg">{t('settings.music')}</span>
        {toggleButton(musicEnabled, () => setMusicEnabled(!musicEnabled))}
      </div>

      {/* Session Length */}
      <div className="flex flex-col gap-2">
        <span className="text-lg">{t('settings.sessionLimit')}</span>
        <div className="flex gap-2 flex-wrap">
          {SESSION_LIMIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:border-deep-brand hover:text-deep-brand transition-colors cursor-pointer bg-white"
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          Session limit selection will be connected to the settings store when the game engine integrates it.
        </p>
      </div>

      {/* Account */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-bold text-deep-brand mb-3">{t('settings.account')}</h2>
        <p className="text-sm text-gray-600">
          {t('settings.linkedGoogle')}: {user?.email ?? '--'}
        </p>
      </div>

      {/* About */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-bold text-deep-brand mb-3">{t('settings.about')}</h2>
        <p className="text-sm text-gray-600">{t('settings.aboutText')}</p>
        <p className="text-xs text-gray-400 mt-2">{t('settings.version')} 0.1.0</p>
      </div>
    </div>
  );
}
```

---

## Phase 8: Verification and Acceptance Criteria

### Step 8.1: Verify compilation

```bash
cd /home/danny/projects/active/learning-to-multiply
npx tsc --noEmit
```

Fix any TypeScript errors. Common issues:
- Missing recharts types: `npm install -D @types/recharts` (though recharts ships its own types)
- Import paths: ensure all hooks and components use the correct relative paths
- Tailwind custom colors: verify `@theme` block syntax matches Tailwind v4

### Step 8.2: Verify dev server

```bash
npm run dev
```

### Step 8.3: Route verification

With dev server running, verify these routes exist:
- `/login` -- login page with Google button and app description
- `/dashboard` -- overview page (redirects to login if no session)
- `/dashboard/kids` -- kid profile management
- `/dashboard/progress` -- heat map
- `/dashboard/progress/3/5` -- fact detail for 3x5
- `/dashboard/sessions` -- session history
- `/dashboard/settings` -- settings page

### Step 8.4: RTL verification

Toggle language to Hebrew and verify:
- Sidebar appears on the right
- Text is right-aligned
- Insight card border stripe appears on the right side (rtl variant)
- Charts remain LTR (numbers always read left-to-right)

### Step 8.5: Mobile responsiveness verification

Open Chrome DevTools, select Pixel 7 device:
- Sidebar collapses to hamburger menu
- Heat map scrolls horizontally
- Summary cards stack in 2 columns
- Session rows are readable
- Modal dialogs fit on screen

---

## Acceptance Criteria

- [ ] `npm run dev` starts without errors
- [ ] `npx tsc --noEmit` passes with no type errors
- [ ] Tailwind CSS is working (custom colors render correctly)
- [ ] Login page renders with Google OAuth button and app description
- [ ] Dashboard layout has working sidebar navigation with 5 items
- [ ] Kid selector dropdown appears in sidebar and mobile header
- [ ] Kid Profiles page: create kid with name + emoji avatar
- [ ] Kid Profiles page: edit kid name and avatar
- [ ] Kid Profiles page: delete kid with confirmation dialog
- [ ] Kid Profiles page: "View Progress" navigates to heat map
- [ ] Kid Profiles page: "Start Playing" navigates to /play/game
- [ ] Overview page: shows 4 summary cards (mastered, level, accuracy, play time)
- [ ] Overview page: shows top 3 insights (or "no insights" message)
- [ ] Overview page: shows 5 most recent sessions with expandable details
- [ ] Overview page: "Start Playing" button navigates to game
- [ ] Heat map: renders 11x11 grid with correct color coding
- [ ] Heat map: commutative facts (3x5 and 5x3) show same status
- [ ] Heat map: hover shows popup with accuracy, attempts, avg time, box, next review
- [ ] Heat map: click navigates to fact detail page
- [ ] Heat map: legend shows all 4 status colors with labels
- [ ] Fact detail: shows accuracy over time line chart
- [ ] Fact detail: shows response time trend line chart
- [ ] Fact detail: shows error breakdown bar chart
- [ ] Fact detail: shows trend indicator (improving/plateau/declining)
- [ ] Fact detail: shows current Leitner box and attempt history table
- [ ] Sessions page: lists all sessions with date, duration, questions, accuracy
- [ ] Sessions page: date filter works (all time, 7 days, 30 days, 90 days)
- [ ] Sessions page: clicking a session expands to show individual attempts
- [ ] Settings page: language toggle switches Hebrew/English and updates RTL/LTR
- [ ] Settings page: sound and music toggles work
- [ ] Settings page: shows account email and about section
- [ ] All text uses i18n keys (no hardcoded strings in UI)
- [ ] Hebrew layout is RTL with correct text alignment
- [ ] Responsive: sidebar collapses to hamburger on mobile
- [ ] Responsive: grid and cards adapt to small screens
- [ ] Empty states: all pages show appropriate messages when no data exists
- [ ] Loading states: all pages show loading indicator during data fetch
- [ ] Error states: all pages show error messages when queries fail

## Estimated Complexity

**Medium-High.** The dashboard has 7 pages, 5 data hooks, 5 shared components, and complete i18n in two languages. The heat map with hover popups and the insight generation algorithm are the most complex pieces. The charting integration (recharts) is straightforward but requires understanding of the data shapes.

Total files to create: ~20
Total files to modify: ~3 (App.tsx, vite.config.ts, main.tsx, en.json, he.json)
Estimated implementation time: 2-3 hours for an agent familiar with React + Firebase/Firestore + Tailwind.
