# Google Auth + Content Expansion — Design Doc

**Date:** 2026-03-01
**Status:** Approved

---

## Feature 1: Google Sign-In (OAuth via Supabase)

### Overview

Add "Continue with Google" to the LoginScreen. Supabase handles the OAuth redirect flow. After Google authenticates the user, the app checks for an existing profile — returning users go straight to HUB, new Google users are shown a hero setup step (username + class + race) before entering the game.

### Auth Flow

```
LoginScreen
  → "Continue with Google" button
  → supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  → [browser redirects to Google → Google redirects to Supabase callback → Supabase redirects to app]
  → App.tsx: onAuthStateChange fires (SIGNED_IN)
  → fetchProfile(user.id)
    ├── Profile exists → setScreen('HUB')  [returning user, no change]
    └── No profile + provider === 'google' → setNeedsHeroSetup(true)  [new Google user]
        → LoginScreen renders hero creation form (username, class, race)
        → handleCreateProfile() → insert profile → setScreen('HUB')
```

### Files Changed

| File | Change |
|------|--------|
| `components/MenuScreens.tsx` | Add Google button to LoginScreen; handle `needsHeroSetup` prop to skip email form and show hero creation directly |
| `App.tsx` | After `fetchProfile` returns null, check `session.user.app_metadata.provider` — if `'google'`, set `needsHeroSetup` instead of staying on LOGIN |

### What Does NOT Change

- Profile schema — same `profiles` table, same fields
- `handleCreateProfile` logic — reused as-is
- `onAuthStateChange` listener — no changes needed
- Email/password auth — untouched

### Dashboard Config (manual steps, not code)

1. **Supabase Dashboard** → Authentication → Providers → Google → enable, paste Client ID + Secret
2. **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client → add authorized redirect URI: `https://qnurovjrxgproedytlyk.supabase.co/auth/v1/callback`
3. Add `http://localhost:3001` and production URL to authorized JavaScript origins

---

## Feature 2: Content Expansion

### Static Questions

Add ~8 scenario-based questions per thin topic in `lib/content/quests.ts`:

| Topic | Current | Target |
|-------|---------|--------|
| Concurrency | 4 | 12 |
| Git & Version Control | 4 | 12 |
| React & Frontend | 4 | 12 |
| Testing & CI/CD | 4 | 12 |
| Cloud & DevOps | 4 | 12 |
| Backend & Servers | 4 | 12 |
| General CS | 6 | 12 |
| OOP & Design Patterns | 7 | 12 |

**Question style:** Each question describes a realistic situation (a bug, a system under load, a code snippet, a team decision) — never a bare definition. Wrong options must be plausible mistakes a real developer would make.

**Total new questions:** ~58

### AI Prompt Improvement

Update the Gemini prompt in `supabase/functions/generate-quiz/index.ts`:

**Current rules:**
```
- Practical, interview-style scenarios, not trivia.
- Exactly one correct option.
- Explanation should mention why the correct option is best.
```

**New rules:**
```
- Each question MUST describe a realistic situation: a bug to diagnose, a system under load, a code snippet with a problem, or an architectural tradeoff — never a bare definition or trivia.
- Wrong options must be plausible mistakes a real developer would make, not obviously wrong.
- Easy = junior mistake (missing null check, wrong git command). Medium = mid-level tradeoff (caching strategy, query optimisation). Hard = senior architecture decision (consistency vs availability, scaling approach).
- Explanation must say WHY the correct answer is best AND why the most tempting wrong answer fails.
```

### What Does NOT Change

- `Question` type schema — same shape
- Content test file `src/test/content.test.ts` — tests pass with more questions
- `lib/content/index.ts` exports — unchanged
