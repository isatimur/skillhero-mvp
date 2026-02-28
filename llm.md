
# SkillHero MVP - Project Documentation

## 1. Project Overview
**SkillHero** is a gamified, web-based 3D-style RPG designed to teach software engineering concepts. Players create a hero, explore a world, and defeat "bugs" (monsters) by answering technical questions. The application combines educational content with engaging game loops, visual feedback, and RPG progression systems.

## 2. Tech Stack & Architecture
*   **Frontend Framework:** React 18
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Custom config for fantasy themes, custom animations).
*   **Icons:** Lucide React
*   **Backend / Auth / Storage:** Supabase
*   **Build Tool:** Vite (implied by usage environment)
*   **Audio:** Custom `AudioManager` handling BGM fading and SFX triggers.

### File Structure
*   `index.tsx`: Entry point.
*   `App.tsx`: Main router and global state manager (User, Session, Screen navigation).
*   `types.ts`: TypeScript interfaces for all data models.
*   `constants.ts`: Static game data (Quests, Items, Books, Map Layout, Audio URLs).
*   `components/`:
    *   `MenuScreens.tsx`: Login, Hub, Quest Board, Profile, Customize, Dojo.
    *   `BattleScreen.tsx`: Turn-based combat engine.
    *   `WorldScreen.tsx`: Isometric map engine.
    *   `LibraryScreen.tsx`: Book reading and quiz engine.
    *   `HeroAvatar.tsx`: Dynamic character visualizer.
    *   `AudioManager.tsx`: Headless audio controller.
    *   `ui.tsx`: Reusable UI components (FantasyButton, ParchmentPanel).

---

## 3. Product Requirements Document (PRD)

### 3.1. Core Gameplay Loop
1.  **Preparation:** User logs in, equips gear, and selects a Quest or explores the World.
2.  **Action:** User engages in Battle (via Quest or Random Encounter) or Training.
3.  **Challenge:** User answers programming questions (Multiple Choice) to deal damage or gain score.
4.  **Reward:** User gains XP, levels up, and unlocks new content/cosmetics.

### 3.2. User Stories
*   **Character:** As a user, I want to customize my Race and Class to affect my stats and appearance.
*   **Progression:** As a user, I want to see my Level and XP grow as I learn.
*   **Combat:** As a user, I want visual and audio feedback when I attack (Hit) or fail (Miss).
*   **Exploration:** As a user, I want to navigate a world map to find NPCs and secrets.
*   **Learning:** As a user, I want to read books to learn specific topics (e.g., React, Git) without the pressure of combat.

---

## 4. System Design & Data Models

### 4.1. User Profile (`User`)
*   **Identity:** `id` (UUID), `username`, `title`.
*   **RPG Stats:** 
    *   `level`, `xp`, `maxXp`.
    *   `stats`: { `str` (Strength), `int` (Intelligence), `agi` (Agility) }.
    *   `heroRace`, `heroClass`, `gender`.
*   **Inventory/Progress:** `completedQuests` (Array of IDs), `completedBooks`, `unlockedItems`.
*   **Appearance:** `headId`, `bodyId`, `weaponId` (referencing `CosmeticItem` IDs).

### 4.2. Quests (`Quest`)
*   **Metadata:** `title`, `description`, `levelRequired`.
*   **Enemy:** `enemyName`, `enemyImage` (Emoji/URL), `enemyMaxHp`, `enemyAttackDamage`.
*   **Content:** `questions` (Array of `Question` objects).
*   **Rewards:** `rewardXp`.

### 4.3. Library (`LibraryBook`)
*   **Content:** `title`, `author`, `content` (Array of strings/paragraphs).
*   **Assessment:** `questions` (Quiz).
*   **Reward:** `rewardXp`, `rewardItemId` (Optional cosmetic unlock).

### 4.4. Database Schema (Supabase: `profiles`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key, matches Auth User ID |
| `username` | text | Display name |
| `hero_class` | text | WARRIOR, MAGE, ROGUE |
| `hero_race` | text | HUMAN, ELF, etc. |
| `stats` | jsonb | {str, int, agi} |
| `appearance` | jsonb | {headId, bodyId, weaponId} |
| `level` | int4 | Current level |
| `xp` | int4 | Current XP |
| `max_xp` | int4 | XP needed for next level |
| `completed_quests` | text[] | Array of Quest IDs |
| `completed_books` | text[] | Array of Book IDs |
| `unlocked_items` | text[] | Array of Item IDs |

---

## 5. Game Mechanics & Engines

### 5.1. Battle Engine (`BattleScreen.tsx`)
*   **Turn Structure:**
    *   **Player Turn:** Player selects an answer.
    *   **Resolution:**
        *   *Correct:* Player deals damage.
        *   *Incorrect:* Enemy deals damage.
*   **Damage Formula:**
    *   `BaseDamage` = `EnemyMaxHP` / `QuestionCount`.
    *   `StatBonus` = (`PrimaryStat` * 2).
    *   `StreakMultiplier` = 1 + (`Streak` * 0.1).
    *   `CritMultiplier` = 1.5 (Chance based on Agility + Race).
    *   **Total Player Dmg** = (`BaseDamage` + `StatBonus`) * `StreakMultiplier` * `CritMultiplier`.
*   **Limit Break:**
    *   Fills by 34% per correct answer. Lose 25% on miss.
    *   At 100%: Next attack is critical + 3x multiplier.
*   **Visuals:**
    *   **Hit:** Large "CRITICAL HIT" overlay, green screen shake, button pop animation.
    *   **Miss:** Large "MISS" overlay, red screen shake, button shake animation.

### 5.2. Isometric World Engine (`WorldScreen.tsx`)
*   **Grid:** 2D Array (`MAP_LAYOUT`) where integers represent tile types (0=Grass, 1=Forest, 2=Mountain, etc.).
*   **Projection:** CSS Transforms used to simulate 3D Isometric view:
    *   `transform: rotateX(60deg) rotateZ(45deg)`.
*   **Entities:**
    *   **Billboards:** Characters/NPCs use `rotateX(-60deg) rotateZ(-45deg)` to stand upright against the skewed floor.
*   **Movement:**
    *   WASD / Arrow Keys update `x, y` coordinates.
    *   **Collision:** Block movement if target tile is Mountain (2) or Water (3).
    *   **Encounters:** Moving onto Forest (1) tiles has a 15% chance to trigger a random battle.

### 5.3. Code Dojo Engine ("Syntax Sync")
*   **Type:** Rhythm / Reflex Game.
*   **Mechanic:** A cursor oscillates left/right on a bar (0-100%).
*   **Goal:** Press "EXECUTE" when cursor is within the `TargetZone` (Green).
*   **Progression:**
    *   Success = Speed increases, `TargetZone` shrinks.
    *   Combo count rewards bonus points.
    *   Perfect center hit = Higher score.

### 5.4. Library Engine
*   **Modes:**
    1.  **Overview:** 3D CSS Book covers on a shelf.
    2.  **Reading:** Pagination of text content.
    3.  **Quiz:** Must score >= 70% to "Master" the book and earn rewards.

---

## 6. UI/UX Design System

### 6.1. Theme: "Code Fantasy"
*   **Colors:**
    *   Backgrounds: `slate-900`, `parchment-100`.
    *   Accents: `gold-500`, `emerald-600` (World), `cyan-400` (Cyberpunk Dojo).
*   **Typography:**
    *   Headings: "MedievalSharp" (Fantasy feel).
    *   Body: "Lato" (Readability).
*   **Components:**
    *   `ParchmentPanel`: Main container with corner rivets and inner borders.
    *   `FantasyButton`: Gold/Stone gradients with bevel effects and click depression.

### 6.2. Animations (Tailwind Config)
*   `pop-in`: Elements scale up from 95% to 100% with opacity fade.
*   `shake`: Horizontal translation for errors/damage.
*   `float`: Vertical sine wave for idle floating elements.
*   `pulse-glow`: Box-shadow intensity pulsing for magical items.

---

## 7. Test Cases

### 7.1. Authentication & Profile
*   [ ] **TC-01:** New user signup creates a row in Supabase `profiles`.
*   [ ] **TC-02:** Login with incorrect password displays error message.
*   [ ] **TC-03:** Character creation saves selected Race, Class, and calculated Stats correctly.

### 7.2. Combat
*   [ ] **TC-04:** Answering correctly increases `Streak` and reduces `EnemyHP`.
*   [ ] **TC-05:** Answering incorrectly resets `Streak` and reduces `PlayerHP`.
*   [ ] **TC-06:** Reaching 0 PlayerHP triggers "Defeat" screen.
*   [ ] **TC-07:** Defeating enemy triggers "Victory" screen and awards XP.
*   [ ] **TC-08:** "Limit Break" activates visually when gauge hits 100%.

### 7.3. World Map
*   [ ] **TC-09:** Pressing 'W' moves player UP (y - 1).
*   [ ] **TC-10:** Player cannot move into Mountain tiles.
*   [ ] **TC-11:** Interacting with NPC (Spacebar) opens Dialogue modal.
*   [ ] **TC-12:** Random encounter triggers correctly on Forest tiles.

### 7.4. Library & Quests
*   [ ] **TC-13:** Quest is locked if User Level < Quest Requirement.
*   [ ] **TC-14:** Completing a Book adds it to `completedBooks` and unlocks associated Cosmetic Item.
*   [ ] **TC-15:** Quest Board cards rotate randomly for visual variety but remain clickable.

### 7.5. Code Dojo
*   [ ] **TC-16:** Clicking outside the green zone resets Combo.
*   [ ] **TC-17:** Speed increases after successful hit.
