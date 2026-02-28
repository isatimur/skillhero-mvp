
# SkillHero Ultimate - Spec 01: Business & Gameplay Logic v2.0

## 1. Executive Summary & Vision
**SkillHero** is a "Career Simulation RPG" designed to bridge the gap between theoretical computer science and practical software engineering leadership. It gamifies the journey from `Junior Developer` to `Distinguished Fellow` through four distinct gameplay pillars: **Coding (Combat)**, **Architecture (Tower Defense)**, **Management (Resource Strategy)**, and **Deep CS (Dungeon Crawler)**.

## 2. The Grand Engineering Ladder (Progression System)
Progression is non-linear but gated by "Promotion Exams" (Boss Fights).

### 2.1. Tiers & Titles
| Tier | Levels | Title | Responsibilities (Gameplay Unlocks) |
| :--- | :--- | :--- | :--- |
| **I** | 1-10 | **Junior Engineer** | **Core Loop:** Syntax Combat, Bug Hunting. <br> **Unlock:** The IDE Arena. |
| **II** | 11-20 | **Mid-Level Engineer** | **Core Loop:** Refactoring, Unit Testing. <br> **Unlock:** Design Patterns Dojo. |
| **III** | 21-30 | **Senior Engineer** | **Core Loop:** System Design, Mentorship. <br> **Unlock:** Architecture Defense (High Load Sim). |
| **IV** | 31-40 | **Staff Engineer** | **Core Loop:** Cross-Team Strategy, Tech Debt Management. <br> **Unlock:** The War Room (Management Sim). |
| **V** | 41-50 | **Principal / CTO** | **Core Loop:** Organizational Vision, Crisis Management. <br> **Unlock:** IPO/Acquisition Scenarios. |

### 2.2. The Economy: XP & Reputation
*   **XP (Experience Points):** Raw technical knowledge. Gained from Quests and Books. Used to Level Up.
*   **Reputation (REP):** Social capital. Gained from Mentorship (Reviewing others' code) and War Room victories. Used to unlock "Soft Skill" dialogue options and hire better NPCs.
*   **Tech Stack Mastery:** Specific sub-levels for languages (e.g., Python Lvl 5, Rust Lvl 1). Unlocks language-specific spells.

## 3. Detailed Game Mode Specifications

### 3.1. The Algo-Crypt (Deep CS Dungeon)
*   **Objective:** Visualize memory and algorithms.
*   **Grid Logic:**
    *   **The Heap:** A chaotic open area where dynamic memory allocation occurs. Moving here costs variable AP (Action Points).
    *   **The Stack:** A linear corridor. You can only move LIFO (Last-In, First-Out) unless you have the "Pointer Arithmetic" key.
*   **Enemies:**
    *   *The Garbage Collector:* A sweeper boss that deletes everything in its path every 10 turns.
    *   *The Deadlock:* Two enemies that are invulnerable unless attacked simultaneously (requires multi-threading clone spell).
*   **Puzzles:**
    *   *Invert the Tree:* Physically rotate room tiles to connect the exit.
    *   *Shortest Path:* Use Dijkstra’s algorithm logic to navigate a weighted graph floor without running out of AP.

### 3.2. Architecture Defense (High-Load Simulator)
*   **Objective:** Survive traffic waves without blowing the SLA (Service Level Agreement).
*   **Resources:** `Budget` ($), `CPU Cycles`, `Bandwidth`.
*   **Components (Towers):**
    *   **Load Balancer (L4/L7):** Splits traffic. L4 is cheap/fast; L7 allows content-based routing rules.
    *   **Cache (Redis/Memcached):** Absorbs 90% of "Read" traffic. Vulnerable to "Cache Stampede" events.
    *   **Message Queue (Kafka):** Buffers "Write" spikes. If queue fills, messages drop (Data Loss = XP Penalty).
    *   **Circuit Breaker:** Passive upgrade. Prevents cascading failures.
*   **Enemy Waves:**
    *   *The Crawler:* Low intensity, constant read traffic.
    *   *The Black Friday:* Exponentially increasing mixed traffic.
    *   *The DDoS:* Massive volumetric attack. Requires "WAF" (Web App Firewall) shield or auto-scaling wallet burn.

### 3.3. The War Room (Management Strategy)
*   **Format:** Turn-based card strategy (similar to *Reigns* or *Gwent*).
*   **The Board:** A Kanban board with columns (ToDo, In Progress, Review, Done).
*   **Cards:**
    *   *Hero Cards:* Your team members (e.g., "The 10x Dev", "The Junior", "The QA Lead").
    *   *Task Cards:* Features, Bugs, Spikes.
*   **Metrics (Health Bars):**
    *   `Velocity` (Speed of clearing ToDo).
    *   `Quality` (Inverse of Bugs generated).
    *   `Morale` (If 0, team members quit/freeze).
    *   `Stakeholder Trust` (If 0, Game Over - Fired).
*   **Mechanics:**
    *   *Crunch Time:* Boost Velocity +50%, Drain Morale -20%.
    *   *Refactor Week:* Velocity -50%, Quality +40%, Tech Debt -30%.
    *   *Pizza Party:* Cost $500, Morale +10%.

## 4. Anti-Patterns & Failure States
*   **Tutorial Hell:** If a player fails 3 quizzes in a row, they are sent to the "Tutorial Purgatory" (a simplified zone) until they pass a basics check.
*   **Burnout:** In War Room, if you overuse a specific Hero Card, they gain the "Burnout" debuff (Stats halved).
