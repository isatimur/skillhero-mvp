
# SkillHero MVP - Product Requirements Document

| Project Name | SkillHero |
| :--- | :--- |
| **Version** | 2.0 (Master Spec) |
| **Status** | Live Development |
| **Theme** | "Obsidian & Gold" - Dark Fantasy RPG |

---

## 1. Executive Summary
**SkillHero** is a gamified educational platform ("Ed-Tech RPG") where software engineering concepts are the weapons. Users create a hero, explore a 2.5D isometric world, and defeat "bugs" (monsters) by answering technical questions. The core loop transforms passive reading into active combat and progression.

---

## 2. UI/UX & HUD Specifications

The interface uses a **"Dark Mode Fantasy"** aesthetic. Key colors are Obsidian (`#1a1c2c`), Blood Red (`#7f1d1d`), and Gold (`#daa520`).

### 2.1. Global HUD (Overlay)
*   **Toast Notifications:**
    *   *Position:* Top-Center, sliding down.
    *   *Design:* Glass-morphism dark panels with colored left borders (Gold=LevelUp, Blue=Info, Red=Error).
    *   *Behavior:* Auto-dismiss after 3.5s. Stacks vertically.
*   **Settings Modal:**
    *   *Trigger:* Gear Icon (Top-Right).
    *   *Content:* Audio Sliders (BGM/SFX), Account Management (Logout).

### 2.2. Profile Screen (The "Character Sheet")
*   **Layout:** 3-Column Grid + Footer.
    *   **Left (Stats):** Characteristics (STR/INT/AGI) and Combat Ratings (Crit/Dodge).
    *   **Center (Paper Doll):** Large Avatar preview surrounded by equipment slots (Head, Body, Weapon, etc.).
    *   **Right (Bio):** Character Lore, Guild, and Achievements grid.
    *   **Footer (Inventory):** Grid of unlocked items (Backpack).
*   **Visuals:** Dark panels with deep red gradient headers. Text is white/gray on dark backgrounds.

### 2.3. Battle HUD (Combat Mode)
*   **Top Bar (Status):**
    *   *Player:* Left aligned. Name, HP Bar (Green -> Red), Limit Break Gauge (Cyan).
    *   *Enemy:* Right aligned. Name, HP Bar (Red), Level Badge.
    *   *Center:* VS Badge (Animated Pulse).
*   **Stage (3D View):**
    *   Perspective-tilted floor.
    *   Player and Enemy sprites positioned with CSS transforms to stand "upright" in 3D space.
    *   **Floating Combat Text (FCT):** Damage numbers fly up and fade out. Crits are larger and yellow.
*   **Command Deck (Bottom):**
    *   *Console:* Black terminal window showing the Question text (Typewriter effect).
    *   *Action Bar:* 4 Large Buttons for Options.
        *   *Idle:* Slate Blue.
        *   *Hover:* Gold Glow.
        *   *Selected Correct:* Flash Green.
        *   *Selected Wrong:* Flash Red + Shake.

### 2.4. World HUD (Exploration)
*   **Camera:** Fixed Isometric View (RotateX 35deg).
*   **Mini-Map/Coords:** Top-Right pill (e.g., "X: 15 Y: 22").
*   **Chat:** Bottom-Left expandable panel. Supports `/g` (Global), `/l` (Local).
*   **D-Pad:** Virtual controls on Bottom-Right (Mobile Only).
*   **Context Action:** "SPACE to Interact" pill appears above the D-Pad when near an NPC.

---

## 3. Database Schema (Supabase)

### 3.1. `profiles`
*   `id`: UUID (PK)
*   `username`: Text
*   `hero_race`: Text (FK)
*   `hero_class`: Text (FK)
*   `level`: Int4 (Default 1)
*   `xp`: Int4
*   `appearance`: JSONB
    ```json
    { "headId": "head_novice", "bodyId": "body_red", "weaponId": "weapon_sword" }
    ```
*   `stats`: JSONB
    ```json
    { "str": 5, "int": 2, "agi": 3 }
    ```
*   `completed_quests`: Text[] (Array of Quest IDs)
*   `unlocked_items`: Text[] (Array of Cosmetic IDs)

### 3.2. `quests`
*   `id`: Text (PK) (e.g., 'q1_legacy')
*   `title`: Text
*   `narrative_intro`: Text[] (Array of strings for cutscene)
*   `enemy_max_hp`: Int4
*   `questions`: *Virtual relationship via `questions` table*

### 3.3. `questions`
*   `id`: Text (PK)
*   `quest_id`: Text (FK)
*   `text`: Text ("The Question?")
*   `options`: JSONB
    ```json
    ["Option A", "Option B", "Option C", "Option D"]
    ```
*   `correct_index`: Int4 (0-3)
*   `explanation`: Text ("Shown after answer")

### 3.4. `cosmetic_items`
*   `id`: Text (PK)
*   `type`: Text ('HEAD', 'BODY', 'WEAPON')
*   `style_class`: Text (Tailwind classes for CSS rendering)
*   `rarity`: Text ('common', 'rare', 'legendary')

---

## 4. Business Processes (Content Operations)

**Scenario: Adding a New Quest "The Docker Whale"**

1.  **Asset Prep:**
    *   Find/Create an emoji or sprite for the enemy (e.g., 🐋).
    *   Draft 3-5 questions about Docker/Containers.
2.  **Database Injection (SQL):**
    ```sql
    -- 1. Create Quest
    INSERT INTO public.quests (id, title, enemy_name, enemy_image, level_required, reward_xp)
    VALUES ('q_docker', 'The Container Whale', 'Moby Dock', '🐋', 5, 800);

    -- 2. Add Questions
    INSERT INTO public.questions (quest_id, text, options, correct_index, explanation)
    VALUES 
    ('q_docker', 'What creates a container?', '["Image", "Network", "Volume", "Port"]', 0, 'Containers are runnable instances of images.');
    ```
3.  **Validation:**
    *   Login as Admin/User > Lvl 5.
    *   Navigate to Quest Board.
    *   Verify "The Container Whale" appears.
    *   Play through battle to verify XP reward triggers.

**Scenario: Creating a "Holiday Event" Item**

1.  **SQL Injection:**
    ```sql
    INSERT INTO public.cosmetic_items (id, name, type, icon_id, style_class, rarity)
    VALUES ('head_santa', 'Santa Hat', 'HEAD', 'Smile', 'bg-red-600 border-white', 'epic');
    ```
2.  **Distribution:**
    *   Create a "Gift NPC" in `WORLD_NPCS` constant (requires code deploy for NPC logic currently, or move NPCs to DB in v2).
    *   Add dialogue trigger `UNLOCK_ITEM` with ID `head_santa`.

---

## 5. Test Strategy & Cases

### 5.1. Authentication (Critical)
| ID | Title | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-A1** | New User Signup | 1. Enter valid email/pass.<br>2. Select Race/Class.<br>3. Click "Begin". | Profile row created in DB. User redirected to Hub. Default stats applied correctly. |
| **TC-A2** | Login Persistence | 1. Log in.<br>2. Refresh page. | User remains logged in. Session restored without re-entry. |

### 5.2. Gameplay - Battle (High)
| ID | Title | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-B1** | Damage Calculation | 1. Answer Correctly.<br>2. Check Logs. | Enemy HP decreases. Streak increases. Limit Gauge fills. |
| **TC-B2** | Defeat State | 1. Answer incorrectly until HP=0. | Screen flashes Red. "Defeat" modal appears. Option to "Resurrect" (Exit). |
| **TC-B3** | Limit Break | 1. Reach 100% Gauge.<br>2. Answer Correctly. | Visual flare triggers. Damage is approx 3x base. Gauge resets. |

### 5.3. World Interaction (Medium)
| ID | Title | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-W1** | Movement & Collision | 1. Press Arrow Keys.<br>2. Try to walk into Water. | Avatar moves on Grid. Avatar stops at Water/Mountain tiles. |
| **TC-W2** | Fog of War | 1. Move to new area. | Previously black tiles become visible. Minimap updates. |
| **TC-W3** | NPC Dialogue | 1. Press Space near NPC. | Modal opens. Options appear based on Quest State (e.g., "Quest Done" option). |

### 5.4. Data Persistence (Critical)
| ID | Title | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-P1** | XP Save | 1. Complete Quest.<br>2. Refresh Page. | XP bar retains progress. Level remains updated. |
| **TC-P2** | Inventory | 1. Unlock item.<br>2. Equip item.<br>3. Relogin. | Item remains equipped on Avatar. |

---

## 6. Future Roadmap
*   **Guilds System:** Shared XP pools and raid bosses.
*   **PvP Arena:** Real-time WebSocket duels using the Question mechanic.
*   **Code Editor:** Replace multiple-choice with Monaco Editor for syntax challenges.
