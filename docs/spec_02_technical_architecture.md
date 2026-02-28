
# SkillHero Ultimate - Spec 02: Technical Architecture v2.0

## 1. System Architecture

### 1.1. Frontend (Client)
*   **Framework:** React 19 (Concurrent Mode enabled for smooth simulations).
*   **State Management:** React Context + Immer (for complex nested state updates in Architecture Defense).
*   **Visualization:** 
    *   *UI:* Tailwind CSS + Framer Motion.
    *   *Graphs/Topology:* React Flow (for System Design diagrams).
    *   *3D Elements:* CSS 3D Transforms (Performance preferred over Canvas for this specific "Paper RPG" aesthetic).

### 1.2. Backend (Serverless)
*   **Platform:** Supabase (BaaS).
*   **Database:** PostgreSQL 15.
*   **API Layer:** Supabase Auto-generated REST API + Edge Functions (Deno) for cheat-sensitive logic.
*   **Realtime:** Supabase Realtime (WebSockets) for PvP signaling and collaborative whiteboard sessions.

## 2. Database Schema (Entity Relationship Diagram)

### 2.1. Core Identity
*   `profiles` (Public)
    *   `id` (UUID, PK)
    *   `reputation` (Int, default 0)
    *   `seniority_title` (Enum: JUNIOR, MID, SENIOR...)
    *   `specializations` (JSONB: { "frontend": 5, "backend": 20 })

### 2.2. Game Content
*   `quests`
    *   `requirements` (JSONB: { "min_level": 5, "required_quests": ["q1"], "required_items": [] })
    *   `rewards` (JSONB: { "xp": 500, "items": ["sword_1"], "reputation": 10 })
*   `system_design_challenges`
    *   `topology_constraints` (JSONB: Max servers, allowed regions)
    *   `traffic_waves` (JSONB: Array of { "time": 10s, "qps": 500, "type": "READ" })
*   `management_scenarios`
    *   `team_roster` (JSONB: Initial set of dev cards provided)
    *   `victory_conditions` (JSONB: { "features_shipped": 10, "max_bugs": 2 })

### 2.3. User State
*   `user_inventory` (Join table profile <-> item)
*   `user_progress`
    *   `quest_id` (FK)
    *   `status` (Enum: STARTED, COMPLETED, FAILED)
    *   `best_score` (Int)
    *   `attempts` (Int)

## 3. Simulation Engine Logic (Edge Functions)

Complex gameplay calculations are offloaded to Supabase Edge Functions to prevent client-side tampering.

### 3.1. `POST /api/simulate-architecture`
*   **Input:** 
    *   `challengeId`: String
    *   `userTopology`: JSON (Node graph of LB, DB, Caches)
*   **Process:**
    1.  Fetch `traffic_waves` from DB.
    2.  Iterate through time steps (t=0 to t=End).
    3.  For each step:
        *   Distribute QPS across userTopology nodes based on connection types.
        *   Apply `cache_hit_rate` probability.
        *   Check `node_capacity` vs `current_load`.
        *   If `load > capacity`, increment `error_count` and `latency`.
*   **Output:** 
    *   `success`: Boolean
    *   `metrics`: { `avg_latency`: 150ms, `uptime`: 99.9% }
    *   `logs`: Array of failure events.

### 3.2. `POST /api/resolve-sprint`
*   **Input:** `decisions`: Array of Card Swipes (Left/Right).
*   **Process:**
    1.  Apply multipliers based on User's `Management` stat.
    2.  Calculate final `Morale`, `Quality`, `Debt`.
    3.  Check RNG events (e.g., "Critical Bug" chance increases as Quality drops).
*   **Output:** New Resource States.

## 4. Non-Functional Requirements (NFRs)
*   **Data Integrity:** Transaction isolation level `SERIALIZABLE` for inventory items to prevent duplication glitches.
*   **Scalability:** Architecture Defense simulation must run in < 200ms for instant feedback.
*   **Accessibility:** All drag-and-drop interfaces must support Keyboard navigation (Tab/Arrow keys) per WCAG 2.1 AA.
*   **Security:** RLS policies strictly enforce `auth.uid() = id`.

## 5. Endpoints & Interfaces

### 5.1. RPC Methods
```sql
-- Triggered when a user completes a quest
function complete_quest(user_id uuid, quest_id text, score int) returns void;

-- Triggered to craft an item
function craft_item(user_id uuid, recipe_id text) returns new_item_id;
```

### 5.2. Client Interfaces (TypeScript)
```typescript
interface TrafficWave {
  timestamp: number;
  qps: number;
  type: 'HTTP' | 'TCP' | 'UDP';
  payload_size_kb: number;
}

interface ComponentNode {
  id: string;
  type: 'LB' | 'DB' | 'CACHE' | 'WORKER';
  config: {
    replicas: number;
    tier: 'SMALL' | 'LARGE';
  };
}
```
