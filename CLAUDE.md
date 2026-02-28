# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (uses Bun lockfile, but npm works too)
npm install

# Start dev server (Vite on port 3001)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# TypeScript type-check (no emit)
tsc --noEmit
```

No test framework is configured — type-check with `tsc --noEmit` is the primary correctness check.

## Architecture

**SkillHero** is a single-page React app — a gamified RPG-style learning platform for software engineering topics. Built with React 19, TypeScript, Vite, and Supabase.

### Screen Routing

`App.tsx` is the main orchestrator. It holds global state (current user, active screen, game data) and renders the correct screen component based on a `screen` state string. There is no React Router — navigation happens by calling state setters passed as props.

Screen flow: `LoginScreen` → `HubScreen` → `QuestSelectScreen` → `BattleScreen` → back to hub.

### Key Files

| File | Role |
|------|------|
| `App.tsx` | Root state, auth session, screen routing |
| `types.ts` | All TypeScript interfaces (User, Quest, Question, etc.) |
| `constants.ts` | Static game data — hero classes, races, cosmetic items, quest content |
| `components/MenuScreens.tsx` | Hub, Login, Quest Select, Profile, Customize, Training, PvP screens |
| `components/BattleScreen.tsx` | Full turn-based battle engine |
| `components/WorldScreen.tsx` | 2D isometric tile map with NPCs, fog of war, random encounters |
| `lib/supabase.ts` | Supabase client + all DB read/write functions |
| `lib/gameLogic.ts` | Damage calculation, stat formulas, streak/crit logic |
| `lib/studyGameLoop.ts` | Daily/weekly quest state, XP tracking for study sessions |

### Data Layer

Uses Supabase JS client directly (no ORM). The client is initialized in `lib/supabase.ts`. All DB operations are plain `.from('table').select/insert/update` calls. Auth is Supabase auth with session persistence.

Key tables: `profiles`, `quests`, `questions`, `hero_races`, `hero_classes`, `cosmetic_items`, `world_npcs`, `spells`, `skill_nodes`.

Environment variables are in `.env.local`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

### Styling

Tailwind CSS is loaded via CDN in `index.html` (not a PostCSS plugin). Custom theme — colors, animations, fonts — is defined inline in `index.html` using the Tailwind config object. The design system follows a "Dark Fantasy RPG" aesthetic: Obsidian & Gold palette, Cinzel fantasy font, ornamental corner decorations.

Shared UI primitives (`ParchmentPanel`, `FantasyButton`, `LiquidBar`) live in `components/ui.tsx`.

Premium animated components (particle effects, cinematic intros, combo meters) are in `components/premium/` — some are defined but not yet integrated into main screens.

### Path Alias

`@/` resolves to the project root (configured in `vite.config.ts`).

### Large Files

Several components are very large (BattleScreen ~50KB, MenuScreens ~57KB, StudyHub ~99KB, SystemDesign ~118KB). When editing these, read the specific section needed rather than the whole file.
