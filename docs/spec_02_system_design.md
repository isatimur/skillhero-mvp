
# SkillHero Spec 02: High-Load System Design (The Architect's Canvas)

## 1. Overview
A drag-and-drop strategy game mode unlocked at Level 20 (Senior Engineer). The player must design systems to withstand massive traffic spikes.

## 2. The Mechanics: "Architecture Defense"
*   **Objective:** Keep "System Uptime" > 99.9% while "Traffic" increases exponentially.
*   **Inventory (Infrastructure):**
    *   Load Balancers (Nginx, ALB).
    *   Caches (Redis, Memcached).
    *   Message Queues (Kafka, RabbitMQ).
    *   Databases (Sharded SQL, NoSQL).
    *   Microservices.
*   **Gameplay Loop:**
    1.  **Briefing:** "Design a Twitter Newsfeed clone. Expect 100k Write/s."
    2.  **Build Phase:** Drag components onto a canvas. Connect them (e.g., Client -> LB -> API -> Cache -> DB).
    3.  **Stress Test (Battle):** Waves of "Traffic Packets" hit the system.
        *   If DB writes represent > Capacity, the DB node turns red and explodes (latency spike).
        *   Player must active skills like "Auto-Scale Group" or "Circuit Breaker" in real-time.

## 3. Scenarios
1.  **The Black Friday Sale:** Heavy Read/Write mixed load.
2.  **The Viral Video:** Massive Read load (CDN required).
3.  **The Chat App:** WebSocket heavy, high concurrency.

## 4. Visuals
*   Isometric server racks that light up.
*   Traffic represented as flowing particles (color-coded by request type).
*   Explosions/Meltdowns when components fail.
