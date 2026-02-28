
# SkillHero Ultimate - Spec 04: QA & Test Plan v2.0

## 1. Test Strategy
Testing operates on three layers:
1.  **Unit Logic:** Verifying combat formulas, XP curves, and resource calculations.
2.  **Simulation Integrity:** Ensuring the Architecture Defense and War Room engines produce deterministic results for valid inputs.
3.  **UI/UX Flow:** Ensuring the "Game Feel" matches specs (animations, transitions, audio).

## 2. Functional Test Cases (Happy Path)

### 2.1. Core Loop
*   [ ] **TC-01 (Progression):** User reaches XP threshold -> Level increments -> MaxXP scales by 1.5x -> Notification triggers.
*   [ ] **TC-02 (Unlock):** User reaches Level 20 -> "System Design" tab in Hub unlocks (visual padlock removed).
*   [ ] **TC-03 (Inventory):** User completes Book with `rewardItemId` -> Item appears in Inventory -> Can be equipped -> Avatar updates visually.

### 2.2. Architecture Defense
*   [ ] **TC-AD1 (Placement):** Dragging "Load Balancer" to grid deducts budget correctly.
*   [ ] **TC-AD2 (Connectivity):** User must connect "Internet" -> "LB" -> "App Server". Disconnected nodes show "Orphaned" warning.
*   [ ] **TC-AD3 (Simulation):** Start Sim -> Traffic Wave 1 hits -> LB CPU% increases.
*   [ ] **TC-AD4 (Win State):** Survive all waves with Uptime > 99% -> Victory Screen -> XP Awarded.

### 2.3. War Room
*   [ ] **TC-WR1 (Choice Impact):** Swipe Left on "Deploy on Friday" -> Morale +5, Stability +10. Swipe Right -> Morale -10, Stability -20.
*   [ ] **TC-WR2 (Game Over):** Morale hits 0 -> "Team Walkout" screen -> Restart Scenario.

## 3. Negative & Edge Case Testing

### 3.1. Data Integrity
*   [ ] **TC-NEG1:** Attempt to equip item user does not own (API injection). Result: 403 Forbidden.
*   [ ] **TC-NEG2:** Attempt to start Level 50 quest as Level 1 user. Result: 403 Forbidden.
*   [ ] **TC-NEG3:** Submit a "System Design" solution with negative budget (API manipulation). Result: 400 Bad Request.

### 3.2. Chaos Engineering (System Design Mode)
*   [ ] **TC-CH1:** "The Monkey": Randomly kill a node during simulation. Does the `Replica Set` logic seamlessly handle the failover?
*   [ ] **TC-CH2:** "Latency Spike": Inject 500ms artificial latency into DB layer. Does the `Circuit Breaker` trip correctly?

## 4. Performance & Load Testing
*   **Target:** The `simulated-architecture` calculation must handle a topology of 50 nodes and 1000 time-steps in < 1 second.
*   **Asset Loading:** Initial load of the "Galaxy Skill Tree" (WebGL) must be < 2 seconds on 4G network (Lighthouse Score > 90).

## 5. User Acceptance Criteria (UAT)
*   "The visuals must feel 'crunchy' - buttons should feel like they have weight."
*   "The System Design mode shouldn't feel like homework; explosions make failure fun."
*   "Management scenarios should reflect real pain points (e.g., conflicting stakeholder requirements)."
