
# SkillHero Ultimate - Spec 03: Visuals & "WOW" Factor v2.0

## 1. Design Language: "Techno-Arcanum"
The visual identity evolves as the player levels up.
*   **Levels 1-10 (Junior):** "Rustic Parchment". Wood textures, ink animations, simple sprites.
*   **Levels 11-30 (Senior):** "Steampunk Silicon". Brass gears, glowing vacuum tubes, green terminal CRT effects.
*   **Levels 31-50 (Staff):** "Holographic Ethereal". Glassmorphism, neon outlines, particle constellations, floating UI.

## 2. Key Visual Experiences

### 2.1. The Architect's Canvas (System Design Mode)
*   **View:** Isometric Grid (simulating a server room floor).
*   **Interactions:**
    *   *Drag & Drop:* Components "snap" into rack slots with a heavy metallic *clunk* SFX.
    *   *Cabling:* Connecting nodes draws a glowing fiber-optic cable. The pulse speed visualizes bandwidth usage.
*   **Failure VFX:**
    *   *Overload:* A server rack vibrates, emits smoke particles, and turns bright red.
    *   *Crash:* The rack physically "falls" through the floor or explodes into voxel debris.
*   **Success VFX:**
    *   The entire system glows green, and a "High Traffic" stream flows smoothly like a river of light.

### 2.2. The War Room (Management Mode)
*   **View:** First-person view of a messy desk (Junior) -> Mahogany Executive Desk (CTO).
*   **Cards:**
    *   Cards look like Jira tickets but stylized as Tarot cards.
    *   *Holo-foil effect* on rare Hero Cards (e.g., "The Unicorn Developer").
*   **Feedback:**
    *   Swiping a card Left/Right tilts the camera slightly.
    *   Resources (Budget, Morale) act like liquid in vials on the desk. Losing budget creates a leak; gaining budget fills the vial with gold liquid.

### 2.3. The Skill Constellation
*   **View:** A full-screen WebGL (via CSS 3D) galaxy.
*   **Navigation:** Scroll to zoom, drag to rotate.
*   **Nodes:**
    *   *Locked:* Dim stars.
    *   *Unlocked:* Bright white stars.
    *   *Mastered:* Pulsing gold supernovas.
*   **Transitions:** Clicking a node performs a "warp speed" zoom transition into the specific Book/Quest context.

## 3. Sound Design
*   **Ambient:**
    *   *Hub:* Soft tavern chatter mixed with mechanical keyboard clicking sounds.
    *   *System Design:* Low hum of server fans. Pitch increases with traffic load.
*   **UI SFX:**
    *   *Hover:* Subtle electronic chirp.
    *   *Confirm:* Heavy "Commit" stamp sound.
    *   *Level Up:* Orchestral swell + 8-bit coin sound mixture.

## 4. Accessibility & Responsiveness
*   **High Contrast Mode:** Option to strip textures and use solid blacks/whites for visual clarity.
*   **Text Size:** All "Book" content must scale up to 200% without breaking layout.
*   **Motion:** "Reduce Motion" setting disables the 3D galaxy rotation and screen shake effects entirely.
