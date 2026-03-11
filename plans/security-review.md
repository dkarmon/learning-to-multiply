# Security Review

Generated: 2026-03-11

Cross-cutting security analysis of all implementation plans.

---

## Findings Summary

| ID | Severity | Plan | Title |
|----|----------|------|-------|
| C1 | CRITICAL | Foundation | Real Firebase credentials committed to plan file |
| C2 | CRITICAL | Orchestrator | Supabase/Firebase inconsistency across plans |
| H1 | HIGH | Foundation | Client-side trust for scoring and mastery |
| H2 | HIGH | Foundation | Kid profile validation insufficient |
| H3 | HIGH | Foundation | Kid name length not validated |
| H4 | HIGH | Foundation | No delete rules for collections |
| M1 | MEDIUM | Foundation | No Content Security Policy headers |
| M2 | MEDIUM | Dashboard | COPPA compliance considerations |
| M3 | MEDIUM | Foundation | Preview deployments may expose data |
| M4 | MEDIUM | Foundation | signInWithPopup may be blocked by popup blockers |
| M5 | MEDIUM | Learning Engine | error_type field allows arbitrary strings |
| L1 | LOW | Audio | TTS audio files served from public directory |
| L2 | LOW | Game Engine | Phaser debug mode must be disabled in production |
| L3 | LOW | Foundation | No rate limiting on Firestore writes |
| I1 | INFO | All | Dependency audit recommended before first deploy |
| I2 | INFO | Art | Sprite sheets should be optimized for size |

---

## CRITICAL

### C1: Real Firebase credentials in plan-foundation.md

**Status: REMEDIATED**

The `.env.local` section in plan-foundation.md contained real Firebase API keys. While Firebase API keys are not secret (they're embedded in client-side code), having them in a committed plan file is poor practice — it sets a bad precedent and may confuse developers into thinking other secrets are safe to commit.

**Remediation:** Replaced real values with `<placeholder>` instructions pointing to Firebase console. The `.env.local` file itself (which will contain real values) is in `.gitignore`.

### C2: Supabase/Firebase inconsistency across plans

**Status: REMEDIATED**

The project migrated from Supabase to Firebase mid-planning. Several plans still reference Supabase:
- `plan-orchestrator.md`: Danny's setup tasks, workstream definitions, file structure, milestone tracker
- `plan-learning-engine.md`: Updated to Firebase (complete)
- `plan-dashboard.md`: Updated to Firebase (complete)
- `plan-foundation.md`: Rewritten for Firebase (complete)

**Remediation:** Update plan-orchestrator.md to replace all Supabase references with Firebase equivalents.

---

## HIGH

### H1: Client-side trust for scoring and mastery

**Plan:** Foundation (Firestore security rules)

All scoring, Leitner box progression, and mastery calculations happen client-side. A technically savvy user could manipulate Firestore writes to set arbitrary mastery levels.

**Risk assessment:** LOW for this app. The target user is a 6-year-old; the parent is the developer. There's no competitive element or leaderboard.

**Remediation (if needed later):**
```typescript
// Add server-side validation via Firestore security rules
match /mastery/{docId} {
  allow write: if request.resource.data.leitnerBox >= 1
             && request.resource.data.leitnerBox <= 5
             && request.resource.data.factorA >= 0
             && request.resource.data.factorA <= 10
             && request.resource.data.factorB >= 0
             && request.resource.data.factorB <= 10;
}
```

**Recommendation:** Accept for MVP. Add field-level validation in security rules if the app is shared beyond the family.

### H2: Kid profile validation insufficient

**Plan:** Foundation (security rules)

The `isParentOfKid()` helper validates that the parent owns the kid profile, but doesn't validate the `parentId` field on creation — a malicious client could create a kid document with another user's `parentId`.

**Remediation:**
```
match /kids/{kidId} {
  allow create: if request.auth != null
              && request.resource.data.parentId == request.auth.uid;
  allow read, update, delete: if isParentOfKid(kidId);
}
```

### H3: Kid name length not validated

**Plan:** Foundation

No maximum length on kid names. A malicious write could store a very long string.

**Remediation:** Add to security rules:
```
&& request.resource.data.name.size() > 0
&& request.resource.data.name.size() <= 50
```

### H4: No delete rules for collections

**Plan:** Foundation

Security rules don't explicitly address `delete` operations. Default behavior depends on the rule structure — if `write` is allowed, `delete` is allowed.

**Remediation:** Add explicit delete rules. For most collections, only the parent who owns the data should be able to delete. Consider whether cascade deletes are needed (deleting a kid should delete their sessions, attempts, mastery, progress).

---

## MEDIUM

### M1: No Content Security Policy headers

**Plan:** Foundation

No CSP meta tag or headers configured. This leaves the app open to XSS via injected scripts.

**Remediation:** Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
    script-src 'self' https://apis.google.com;
    connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    frame-src https://accounts.google.com;">
```

### M2: COPPA compliance considerations

**Plan:** Dashboard

The app collects data about children (names, learning performance). If distributed beyond the family, COPPA (US) or equivalent regulations may apply.

**Recommendation:** For family use, this is fine. If sharing publicly:
- Add privacy policy
- Ensure no PII is collected beyond what's needed
- Add data deletion capability
- Consider whether Firebase Analytics is enabled (disable if collecting child data)

### M3: Preview deployments may expose data

**Plan:** Foundation (Vercel)

Vercel creates preview deployments for every PR. These could expose the app with real Firebase data.

**Remediation:** Use separate Firebase projects for development and production, or restrict preview deployments to the main branch only.

### M4: signInWithPopup may be blocked

**Plan:** Foundation

`signInWithPopup` can be blocked by browser popup blockers, especially on mobile.

**Remediation:** Add a fallback to `signInWithRedirect`:
```typescript
try {
  await signInWithPopup(auth, provider);
} catch (error: any) {
  if (error.code === 'auth/popup-blocked') {
    await signInWithRedirect(auth, provider);
  }
}
```

### M5: error_type allows arbitrary strings

**Plan:** Learning Engine

The `errorType` field in attempt documents accepts any string. While the client-side TypeScript union type constrains this, Firestore security rules don't validate the value.

**Remediation:** Add an enum check in security rules:
```
&& (request.resource.data.errorType == null
    || request.resource.data.errorType in
       ['addition_substitution', 'off_by_one', 'neighbor_confusion',
        'zero_one_confusion', 'commutative_gap', 'other'])
```

---

## LOW

### L1: TTS audio files served from public directory

**Plan:** Audio

Audio files in `public/assets/audio/tts/` are served statically. Anyone with the URL can access them. This is fine for generated TTS but worth noting — don't store any private audio here.

### L2: Phaser debug mode in production

**Plan:** Game Engine

`arcade.debug: false` is set in the config, which is correct. Just ensure this isn't accidentally changed to `true` in a development session and committed.

### L3: No rate limiting on Firestore writes

**Plan:** Foundation

A runaway client loop could write thousands of documents. Firestore has built-in rate limits (1 write/second per document) but no per-user rate limiting.

**Recommendation:** Monitor usage in Firebase console. For family use, this is not a concern.

---

## INFO

### I1: Dependency audit before first deploy

Run `npm audit` before the first production deploy. Check for known vulnerabilities in Phaser, Firebase SDK, Zustand, react-router, and react-i18next.

### I2: Sprite sheet size optimization

Pixel art sprite sheets should be served as PNG (not JPEG — lossy compression destroys pixel art). Consider using texture atlases (Phaser supports them natively) to reduce HTTP requests.

---

## Implementation Checklist

- [x] C1: Remove real Firebase credentials from plan-foundation.md
- [x] C2: Update all Supabase references in plan-orchestrator.md to Firebase
- [ ] H1: Accept for MVP (document decision)
- [ ] H2: Fix parentId validation in security rules (plan-foundation.md Phase 3)
- [ ] H3: Add name length validation to security rules
- [ ] H4: Add explicit delete rules to security rules
- [ ] M1: Add CSP meta tag to index.html (plan-foundation.md Phase 1)
- [ ] M2: Accept for family use (revisit if sharing publicly)
- [ ] M3: Configure Vercel preview deployment restrictions
- [ ] M4: Add signInWithRedirect fallback to auth store
- [ ] M5: Add errorType enum validation to security rules
- [ ] L1: No action needed
- [ ] L2: No action needed (already correct)
- [ ] L3: No action needed for MVP
- [ ] I1: Run npm audit before first deploy
- [ ] I2: Use PNG format for sprite sheets (already in art plan)
