# SkillHero MVP — Next Improvements Plan

> Generated 2026-02-09. Use each iteration as a standalone prompt for Claude Code.

---

## Current State

The battle screen, hub screen, and shared UI components (`ParchmentPanel`, `LiquidBar`, `FantasyButton`) have been overhauled with the "Obsidian & Gold" fantasy RPG system: atmospheric arena layers, floating embers, ornamental corners, gold accents, Cinzel font headers, Roman numeral answer buttons, and `Battle Chronicle` combat log.

**What still looks off:** 6 secondary screens (`CSReference`, `AlgoVisualizer`, `InterviewPrep`, `ProgressAnalytics`, `StudyHub`, `SystemDesign`) remain unstyled or use the old cyan/green terminal aesthetic. Premium components in `components/premium/` are defined but largely unused. Large files need splitting.

---

## Iteration 1 — Unify Secondary Screens (Visual Consistency)

**Goal:** Every screen the user can navigate to should feel like the same fantasy game. Pure CSS/Tailwind changes, no logic changes.

### Files to modify

| File | What to do |
|------|-----------|
| `components/StudyHub.tsx` | Wrap section cards in `ParchmentPanel`. Replace plain progress divs with `LiquidBar`. Add `card-glow-*` hover on topic cards. Replace any remaining `font-mono` content headers with `font-fantasy`. Add gold accent borders. |
| `components/CSReference.tsx` | Wrap outer container in `ParchmentPanel`. Style code blocks with `bg-obsidian-800 border border-gold-600/20 rounded-lg` instead of bare `<pre>`. Replace table styling with gold-bordered rows. Add `ornament-corners` to section panels. Replace cyan accents with gold. |
| `components/AlgoVisualizer.tsx` | Replace `text-cyan-400` comparison highlights with `text-gold-400`. Style bar chart elements with gold gradients instead of flat colors. Wrap controls in `ParchmentPanel`. Add gold border to visualization canvas area. |
| `components/InterviewPrep.tsx` | Wrap question cards in styled containers with `border-gold-600/15` and `card-glow-gold` hover. Add difficulty color badges matching battle screen style. Use `FantasyButton` for actions instead of plain buttons. |
| `components/ProgressAnalytics.tsx` | Wrap radar chart and stats in `ParchmentPanel`. Style stat cards with `bg-gradient-to-b from-obsidian-800 to-[#0c0c14]` + ornamental corners. Use `LiquidBar` for progress metrics. Gold text for labels. |
| `components/SystemDesign.tsx` | Wrap concept sections in `ParchmentPanel`. Style quiz options like battle answer buttons (Roman numerals, `animate-rune-pulse`, gold borders). Replace plain text headers with `font-fantasy text-gold-400`. |

### Verification
- Navigate to every hub card destination — all should have gold accents, `ParchmentPanel` containers, and no cyan/green terminal styling in headers or content areas.
- Green only appears for "correct answer" feedback. Cyan only for specific data visualizations where a distinct color is needed (never for UI chrome).

---

## Iteration 2 — Animations & Celebrations

**Goal:** Add life to the app with reward animations, transitions, and micro-interactions. No layout changes.

### Changes

1. **Screen transitions** — Import and use `ScreenTransition` from `components/premium/ScreenTransition.tsx` for sub-screen navigation (CSReference, SystemDesign, InterviewPrep, etc.). Currently only wraps the main `App.tsx` switch.

2. **XP reward floating text** — Create a reusable `FloatingReward` component (extracted from BattleScreen pattern). Use it in:
   - `LibraryScreen.tsx` — when completing a book quiz
   - `StudyHub.tsx` — when earning XP from a topic
   - `InterviewPrep.tsx` — when completing a challenge
   - `SystemDesign.tsx` — when passing a quiz

3. **Level-up particle burst** — When `updateXP` triggers a level-up in `App.tsx`, fire a gold particle burst overlay (leverage `components/premium/ParticleSystem.tsx` which exists but is unused).

4. **Button press micro-feedback** — Add `whileTap={{ scale: 0.97 }}` from framer-motion to all `FantasyButton` instances (currently only battle answer buttons have this).

5. **Card hover lift** — Add `transition-transform hover:-translate-y-1` to all `HubCard` and `ParchmentPanel` instances used as clickable cards.

6. **Success state animations** — When a quiz/challenge is completed:
   - Gold border pulse animation on the result card
   - Checkmark icon scales in with spring animation
   - XP number counts up from 0 to final value

### Verification
- Complete a Library book → see floating "+XP" text and gold pulse
- Level up → see particle burst overlay
- Navigate between screens → smooth fade/slide transitions
- Hover hub cards → subtle lift effect

---

## Iteration 3 — Premium Component Integration

**Goal:** Wire up existing premium components that are defined but unused.

### Components to integrate

| Component | Location | Integration Point |
|-----------|----------|-------------------|
| `CinematicIntro.tsx` | `components/premium/` | Show before first battle of a session, or when entering a new quest chain. Trigger from `BattleScreen` narrative phase. |
| `ComboMeter.tsx` | `components/premium/` | Display during battle when streak >= 2. Position near the existing streak badge. Replaces the basic `{streak}x` text with an animated arc meter. |
| `ParticleSystem.tsx` | `components/premium/` | Initialize in `WorldScreen.tsx` with biome-specific particle configs (snow in ice biome, leaves in forest, embers in volcano). |
| `EnhancedUI.tsx` | `components/premium/` | Contains `EnhancedButton` and `QuestCard` — evaluate if they supersede `FantasyButton` and the quest select cards. If better, swap them in. If redundant, delete to reduce bloat. |
| `LoadingStates.tsx` | `components/premium/` | Replace the basic spinner in `App.tsx` loading state with the premium loading animation. Use per-component loading states in `LibraryScreen` and `StudyHub` data fetches. |
| `AnimatedProgressBar.tsx` | `components/premium/` | Already used in `MenuScreens.tsx` (XPBar, HPBar). Extend to `ProgressAnalytics`, `StudyHub` topic progress, and `LibraryScreen` book completion meters. |

### Verification
- Start a battle → cinematic intro plays (skippable)
- Get a 3+ streak → combo meter arc animates
- Enter World Map → biome particles visible
- App loading → premium loading animation instead of basic spinner

---

## Iteration 4 — World Map & Dojo Visual Polish

**Goal:** Bring the two remaining interactive screens up to the fantasy standard.

### WorldScreen.tsx
- Add biome-specific background gradients (ice = blue tints, volcano = red/orange, forest = green/dark)
- Style NPC dialogue boxes with `ParchmentPanel` and gold accents
- Add fog/particle effects at biome boundaries
- Gold-bordered tile highlights for current position
- Ornamental compass rose in corner of map

### DojoMinigames.tsx
- **SyntaxSyncGame**: Style the rhythm bar with gold gradient fill, add spark effect at hit zone
- **AlgoTyperGame**: Style falling keywords with `font-fantasy`, gold glow on successful type
- **BugHunterGame**: Red glow on bug locations, gold flash on correct fix
- **CodeFillGame**: Style code block with obsidian background, gold-highlighted blanks
- All games: Add score display in `ParchmentPanel` mini-card, gold XP reward animation on completion

### Verification
- World map shows distinct visual biomes with atmospheric effects
- Each dojo minigame has consistent gold/obsidian styling
- NPC interactions feel like RPG dialogue, not plain text boxes

---

## Iteration 5 — Code Architecture Cleanup

**Goal:** Split oversized files, remove dead code, consolidate design patterns. No visual changes.

### File splits

| Current File | Size | Split Into |
|-------------|------|-----------|
| `components/BattleScreen.tsx` | ~750 lines | Keep orchestration logic. Extract: `BattleNarrative.tsx` (narrative phase), `BattleVictoryDefeat.tsx` (end screens), `BattleQuestionPanel.tsx` (question + options UI). Reuse existing `battle/BattleArena.tsx`, `battle/BattleControls.tsx`, `battle/BattleLog.tsx`. |
| `components/MenuScreens.tsx` | ~535 lines | Already exports 7 components. Extract each to own file: `LoginScreen.tsx`, `HubScreen.tsx`, `ProfileScreen.tsx`, `CustomizeScreen.tsx`, `TrainingScreen.tsx`, `PvPLobbyScreen.tsx`, `SettingsModal.tsx`. Keep `MenuScreens.tsx` as barrel export. |
| `components/StudyHub.tsx` | Large | Split into `StudyHubDashboard.tsx`, `StudyHubTopic.tsx`, `StudyHubQuiz.tsx`. |

### Dead code removal
- Audit `components/premium/EnhancedUI.tsx` — if not integrated by Iteration 3, delete
- Remove unused imports across all files
- Remove `text-shadow-tech` CSS class if no component uses it after Iterations 1-4
- Clean up `tech-cyan` and `tech-green` color definitions if fully replaced

### Design system consolidation
- Create `lib/designTokens.ts` exporting shared constants: glow colors per card type, animation durations, common Tailwind class strings for card/panel patterns
- Create `components/ui/FantasyCard.tsx` — generic clickable card with ornamental corners, glow class, hover lift (replaces ad-hoc card patterns in Hub, Training, StudyHub, etc.)

### Verification
- `npm run build` succeeds with no errors
- All imports resolve correctly after splits
- No visual regressions — app looks identical before and after refactor
- Bundle size should decrease slightly from tree-shaking dead code

---

## Iteration 6 — Mobile & Accessibility

**Goal:** Make the app usable on phones and accessible.

### Mobile
- Battle screen: Stack question panel below arena (currently side-by-side, clips on mobile). Hide Battle Chronicle on small screens, show as expandable drawer.
- Hub grid: 2 columns on tablet, 1 column on phone (currently `lg:grid-cols-3`)
- World map: Add touch drag/swipe for map panning, larger tile tap targets
- Dojo minigames: Scale rhythm bar and typing targets for touch input
- Font sizes: Ensure minimum 14px for body text on mobile

### Accessibility
- Add `aria-label` to all icon-only buttons (settings gear, close X, navigation)
- Add `role="progressbar"` with `aria-valuenow` to `LiquidBar`
- Ensure color is never the sole indicator (add icons/text alongside difficulty colors)
- Add `prefers-reduced-motion` media query: disable `animate-ember-rise`, `animate-fog-drift`, `animate-rune-pulse`, particle systems
- Keyboard navigation: Tab through answer options, Enter to select, Escape to go back

### Verification
- Test on 375px viewport (iPhone SE) — all screens usable without horizontal scroll
- Screen reader audit — all interactive elements announced correctly
- `prefers-reduced-motion: reduce` — no animations playing, content still visible
- Tab through a full battle — all options reachable via keyboard

---

## Priority Summary

| Iteration | Effort | Impact | Dependencies |
|-----------|--------|--------|-------------|
| 1. Unify Secondary Screens | Medium (4-6h) | HIGH — eliminates jarring style shifts | None |
| 2. Animations & Celebrations | Medium (3-5h) | HIGH — makes the app feel alive | None |
| 3. Premium Component Integration | Medium (4-6h) | MEDIUM — leverages existing code | Iteration 1 |
| 4. World Map & Dojo Polish | Medium (4-6h) | MEDIUM — completes the RPG feel | Iteration 1 |
| 5. Code Architecture Cleanup | Large (6-8h) | LOW (visual) / HIGH (maintainability) | Iterations 1-4 |
| 6. Mobile & Accessibility | Large (6-8h) | HIGH — expands audience | Iteration 5 |
