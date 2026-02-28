# Gamification Engine Rework — Design Doc

**Date:** 2026-02-26
**Status:** Approved

## Overview

Full rework of SkillHero's gamification systems in three layered passes, each independently shippable:

1. **Remove Phaser + Clean Architecture** — eliminate dead code, unify state
2. **Core Loop Redesign** — better world exploration, explicit combat state machine, unified reward bus
3. **Juice & Feel** — animations, feedback, premium components wired up

Testing: **Vitest + @testing-library/react** throughout — unit tests for all game logic, component tests for critical UI flows.

---

## Pass 1: Remove Phaser + Clean Architecture

### What gets deleted
- `lib/engine/loadPhaser.ts`
- `components/PhaserWorldScreen.tsx`
- `docs/phaser_rework_plan.md`
- `phaser` from `package.json` (if installed)
- Engine toggle button + `usePhaserWorld` state + `skillHero_world_engine` localStorage key in `App.tsx`

### Architectural fixes
- `WorldScreen.tsx` becomes the single canonical world engine — no fallback, no toggle
- `App.tsx` WORLD case simplified to always render `<WorldScreen />`
- All XP/gold/shard awards unified through a single `rewardBus(event: RewardEvent) → RewardResult` function replacing the split `awardStudyAction` + `awardGameplay` paths

### Test setup
- Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- Add `vitest.config.ts` with jsdom environment
- Add `src/test/setup.ts` for jest-dom matchers
- First tests: `rewardBus` unit tests covering all multiplier combinations

---

## Pass 2: Core Loop Redesign

### World exploration
- **Viewport culling**: only render tiles within viewport bounds + 2-tile buffer — prevents lag on the 23×40 map as complexity grows
- **Encounter cooldown**: minimum 8-tile travel between random encounters; rate scales with biome danger level (forests 12% → 8% after cooldown, grass 4% → 2%)
- **Knowledge scrolls**: persist to Supabase `user_scrolls` table instead of localStorage only
- **A* pathfinding**: extracted from `gameLogic.ts` into `lib/pathfinding.ts` as a pure function — fully unit tested

### Combat state machine
Replace implicit boolean flags with an explicit FSM:

```
INTRO → PLAYER_TURN → RESOLVING → ENEMY_TURN → VICTORY | DEFEAT
                              ↑___________________________|
```

- Each state is a discriminated union type in `types.ts`
- State transitions are pure functions — no side effects inside the reducer
- Battle results emit a single `BattleResult` to the reward bus on VICTORY
- Wrong answer shows explanation inline immediately (not after battle end)

### Study game loop
- `rewardBus` replaces both `awardStudyAction` and `awardGameplay` — single entry point for all rewards
- Combo window: 12 min → 30 min (more forgiving for casual use)
- Streak count surfaced on HubScreen (currently hidden in studyGameLoop state)
- All reward math covered by unit tests

---

## Pass 3: Juice & Feel

### Combat feedback
- **Floating damage numbers**: color-coded (gold = correct, red = damage taken, cyan = crit, purple = limit break) — CSS `@keyframes` float-up-fade
- **Screen shake**: CSS keyframe on taking damage; honors `prefers-reduced-motion`
- **Enemy HP bar**: smooth CSS transition instead of instant jump
- **Answer flash**: green flash + sound on correct; red flash + thud on wrong

### Progression feedback
- **XP bar**: animates fill on Hub when returning from battle
- **Level-up**: full-screen particle burst using `components/premium/ParticleSystem.tsx` (currently unused)
- **Combo meter**: visible on Hub and during battle using `components/premium/ComboMeter.tsx` (currently unused)
- **Daily/weekly completion**: confetti burst via `react-confetti` (already installed)

### World feel
- **Smooth movement**: CSS transition between tiles (currently snaps)
- **Click ripple**: pulse at destination tile on click (partially implemented — needs polish)
- **Biome transition**: brief overlay flash + biome name when crossing biome boundary

### Tests
- Animation utility functions: verify correct timing/easing values
- `ParticleSystem` + `ComboMeter`: render tests confirm they mount without crashing
- `BattleScreen`: component test covering PLAYER_TURN → RESOLVING → ENEMY_TURN flow

---

## Data / Schema Changes

| Change | Where |
|--------|--------|
| `rewardBus` replaces `awardStudyAction` + `awardGameplay` | `lib/rewardBus.ts` (new) |
| `CombatState` discriminated union | `types.ts` |
| A* extracted to pure module | `lib/pathfinding.ts` (new) |
| `user_scrolls` table | Supabase migration |
| Combo window constant | `lib/rewardBus.ts` |

---

## What Is Not Changing

- Damage formula in `gameLogic.ts` — stays as-is
- Quest/question data in `constants.ts` — not touched
- Supabase auth flow — not touched
- UI design system (`components/ui.tsx`) — not touched
- All other screens (Library, StudyHub, CSReference, etc.) — not touched
