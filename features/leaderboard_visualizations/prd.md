# Product Requirements Document (PRD): Leaderboard Data Visualizations & Parchment Roster Cards

**Version**: 2.0 (Refined User Specs)  
**Status**: Approved & Ready for Execution  
**Location**: `features/leaderboard_visualizations/prd.md`  
**Target Files**: `index.html`, `js/scoring-engine.js`, `js/config.js`  
**Git Branch**: `feature/leaderboard-visualizations-and-roster-cards`  

---

## 1. Feature Overview & Core Objectives

The **Leaderboard Data Visualizations & Parchment Roster Cards** update transforms the main Leaderboard in `index.html` into a highly visual, immersive Survivor experience. It introduces:
1. **In-Line Ripped Tan Parchment Vote Slips & Realistic Torches**:
   - Displayed directly **in-line on the team header card** alongside the team name & rank.
   - Styled as authentic tan parchment vote slips (`#e9d5a1` / `#d4b483` gradient with torn/ragged paper edges).
   - Handwritten Survivor tribal council vote typography (`Caveat`).
   - Realistic lit torch SVG (active player) and realistic unlit torch SVG with rising smoke wisps (eliminated player).
2. **Main League Graph Refinements (4 Interactive Modes)**:
   - **Cumulative Total Score**: Line chart with negative score support, clean round Y-axis ticks, and detailed multi-line hover tooltips showing each player's point contribution for that episode.
   - **Weekly Score Gains**: Grouped bar chart with fixed negative formatting (showing `-10` instead of `+-10`).
   - **Rank Trajectory**: De-cluttered rank trajectory graph with hover team path isolation (dimming non-hovered teams) and clean rank lanes.
   - **Draft Pick Value / ROI**: Sorted strictly by **Draft Pick Order** (Pick #1, Pick #2...) with explicit `Pick #X` labels below contestant names, color-coded by team.
3. **Episode & Player Event Breakdown Graph (Expanded Team View)**:
   - Grouped X-axis by **Episode** (Ep 1, Ep 2, Ep 3...).
   - Within each episode, renders a bar for **each drafted player on that team**.
   - Stacked within each player's bar are segments for the **exact point scoring events** (e.g., `Immunity Win (+15)`, `Idol Found (+10)`, `Survived Tribal (+2)`, `Confessional (+1)`).

---

## 2. Safety & Development Isolation Requirements

> [!IMPORTANT]
> **Production Data Safety Directive**: All manual testing, automated checks, and local dev server runs MUST use isolated testing environments (`dev_testing/` database path under `localhost`). Production Firebase database nodes must remain strictly untouched.

---

## 3. Detailed UI & Functional Specifications

### 3.1 In-Line Tan Ripped Parchment Slips & Realistic Torches
- **Header Placement**: Positioned in-line inside the team header row next to team name and rank (no separate bottom card subsection).
- **Realistic Tan Parchment**: Tan parchment background (`#e9d5a1` to `#c8a86b` gradient with subtle paper grain texture and deckled/ripped paper CSS clip path).
- **Handwritten Typography**: Contestant names styled with Survivor tribal council vote handwriting (`Caveat` font, 16px).
- **Realistic Torch SVGs (No Emojis)**:
  - **Lit Torch**: Realistic wood-grain handle, metallic rim, glowing multi-layer gradient fire flame with subtle pulse.
  - **Unlit Torch**: Charred wood handle, dark soot top, and rising translucent smoke trail wisps.

### 3.2 Main League Graph Refinements (4 Modes)
- **4 Interactive View Modes**:
  1. 📈 **Cumulative Total**: Running total score line chart. Hover tooltip lists every player's exact point contribution for that team on that episode.
  2. 📊 **Weekly Score Gains**: Grouped bar chart of episode gains. Negative gains formatted cleanly as `-10` (never `+-10`).
  3. 🏆 **Rank Trajectory**: Inverted rank lanes (#1, #2, #3...). Hovering a team dims all other team lines to 20% opacity for clear path tracking.
  4. 💡 **Draft Pick Value / ROI**: Arranged in **Draft Pick Order** (Pick 1 to Pick N). Displays `Pick #X` sub-labels on X-axis and total points earned.

### 3.3 Expanded Team Analytics: Player Event Breakdown
- **Episode & Player Event Breakdown Graph**:
  - X-axis: Episode groups (Ep 1, Ep 2, Ep 3...).
  - Within each episode: Individual bars for each drafted contestant on that team.
  - Stacked segments represent **exact point scoring events** (e.g. `Individual Immunity (+15)`, `Idol Found (+10)`, `Survived Tribal (+2)`, `Confessional (+1)`), labeled with exact event titles and point values.

---

## 4. Success Criteria & Verification Checklist

- [x] Dev environment guard (`dev_testing/` path) verified active during local testing.
- [ ] In-line tan ripped parchment slips with handwritten contestant names rendered on team header row.
- [ ] Active players display realistic lit torches; eliminated players display realistic unlit torches with smoke.
- [ ] Main graph negative Y-axis bounds render cleanly with round Y-axis tick labels.
- [ ] Main graph tooltips display multi-line breakdown of player point contributions per episode.
- [ ] Weekly gains chart displays clean `-X` negative formatting.
- [ ] Rank trajectory graph dims non-hovered team paths on hover.
- [ ] Draft ROI graph orders contestants by Pick # with explicit `Pick #X` sub-labels.
- [ ] Expanded team breakdown renders episode-grouped bars per player with stacked exact scoring events.
