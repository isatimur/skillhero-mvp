# Content Expansion + Reward Integration — Design Doc

**Date:** 2026-02-27
**Status:** Approved

## Overview

Two parallel improvements that together make SkillHero substantially more useful:

1. **Content Expansion** — grow from 123 flashcard questions / 35 quests to ~350 questions / ~42 quests
2. **Reward Integration** — migrate StudyHub from isolated `studyGameLoop` to the unified `rewardBus`, creating a single gold/shard/combo economy across all game modes

---

## Part 1: Content Expansion

### What changes

**Expand existing 15 topics** from ~8 questions each to 15–20 questions each. Focus on depth: harder questions, edge cases, "why" not just "what".

**Add 5 new topic areas:**

| Topic | Flashcard Questions | New Quests |
|-------|-------------------|------------|
| Software Architecture | 15 | 2 (DDD Golem, Clean Architecture Lich) |
| AI & Machine Learning | 15 | 2 (Gradient Descent Wraith, Transformer Dragon) |
| Mobile Development | 12 | 1 (React Native Chimera) |
| Operating Systems | 12 | 1 (Deadlock Daemon) |
| TypeScript Advanced | 12 | 1 (Generic Type Hydra) |

**Result:** ~123 → ~350 flashcard questions, 35 → ~42 quests.

### Architecture

Split content out of `constants.ts` into a dedicated module:

```
lib/content/
  flashcards.ts   — all Question[] arrays, grouped by topic
  quests.ts       — all Quest[] definitions
  index.ts        — re-exports QUESTIONS, QUESTS
```

`constants.ts` imports `QUESTIONS` and `QUESTS` from `lib/content/index.ts`. No other files change — all downstream consumers still import from `constants.ts`.

### What is NOT changing

- Question/Quest TypeScript interfaces — same structure
- All existing content — no edits, only additions
- Battle mechanics, XP rewards, difficulty scaling

---

## Part 2: Reward Integration

### What changes

**One-time migration (App.tsx init):**
On startup, App.tsx checks for `studyGameLoop_${username}` in localStorage. If present, merges into rewardBus state: `gold += old.gold`, `shards += old.shards`, `combo = max(old.combo, current.combo)`. Deletes old key. Silent — user never sees it.

**StudyHub prop change:**
Replace `onGainXp: (xp: number) => void` with `onStudyReward: (baseXp: number) => RewardResult`.

App.tsx handler:
```typescript
onStudyReward={(baseXp) => {
  const result = awardGameplay(baseXp);  // routes through rewardBus
  return result.reward;
}}
```

StudyHub uses the returned `RewardResult` to display its existing toast (XP, gold, crit, daily completion). No visual change to the user.

**Delete:**
- `lib/studyGameLoop.ts`
- `studyGameLoop` import and `StudyGameState` usage from `StudyHub.tsx`

### What unifies after migration

- One combo counter (30-min window) across flashcards + battles
- One gold/shard wallet
- One daily (3 actions) / weekly (14 actions) tracker
- Daily confetti fires whether the 3rd action came from StudyHub or a battle

### What is NOT changing

- StudyHub UI — same tabs, same toast display
- Perk/consumable system in StudyHub — perks are stored in rewardBus state already
- StudyHub's internal flashcard state (SRS, card ratings) — untouched

---

## Data / Schema Changes

| Change | Where |
|--------|--------|
| Content split into module | `lib/content/flashcards.ts`, `lib/content/quests.ts`, `lib/content/index.ts` |
| `onGainXp` → `onStudyReward` prop | `components/StudyHub.tsx`, `App.tsx` |
| One-time migration function | `lib/rewardBus.ts` (new `migrateStudyGameLoop` export) |
| studyGameLoop deleted | `lib/studyGameLoop.ts` removed |

---

## Testing

- Content: spot-check that all new questions have `correctIndex` in bounds, valid `topic`, `xpReward` ≥ 50
- Migration: unit test `migrateStudyGameLoop` — merges gold/shards correctly, deletes old key, idempotent
- Integration: existing 28 rewardBus tests continue passing; StudyHub smoke test
