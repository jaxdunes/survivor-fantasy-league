# Walkthrough: Leaderboard Visualizations & Roster Cards Enhancement

## Overview
We enhanced the Survivor Fantasy League Leaderboard experience on branch `feature/leaderboard-visualizations-and-roster-cards`.

---

## 🎨 Key Enhancements & Refinements

### 1. In-Line Tan Ripped Parchment Roster Tags
- **Realistic Ripped Paper Aesthetic**: Custom CSS `.parchment-card-tan` featuring an authentic deckled paper clip-path (`clip-path: polygon(...)`), warm tan gradient background, subtle inner drop shadows, and handwritten font (`Caveat`).
- **In-Line Team Header Placement**: Roster tags are arranged directly in-line on each team header row (next to the team rank & name) rather than buried in a bottom card subsection.
- **Realistic SVG Torches (No Emojis)**:
  - **Lit Torch (`TorchLit`)**: Multi-layered SVG flame with outer amber glow and pulsing flame animation (`#ff5500` to `#ffdd00`).
  - **Unlit Torch (`TorchUnlit`)**: Dark soot top with soft translucent smoke wisps (`#aaaaaa`) drifting upward for eliminated contestants.

---

### 2. Main Analytics Graph (4 Optimized Modes)
- **📈 Cumulative Points Mode**:
  - Dynamically calculates negative Y-axis bounds (`Math.min(0, ...)`), displaying baseline zero reference lines cleanly.
  - Multi-line hover tooltips breakdown exact player point contributions for that episode when hovering over any team data point.
- **📊 Weekly Gains Mode**:
  - Displays positive/negative episode point gains per team.
  - Clean minus sign formatting for negative values (e.g. `-10` instead of `+-10`).
- **🏆 Rank Trajectory Mode**:
  - Simplified, de-cluttered rank lanes (#1, #2...).
  - Interactive hover isolation dims non-hovered team lines to 20% opacity for maximum clarity.
- **💡 Draft ROI Mode**:
  - Sorted strictly by Draft Pick Order (Pick #1, Pick #2, Pick #3...).
  - Explicit `Pick #X` sub-labels rendered beneath player contestant names.

---

### 3. Expanded Team View: Episode & Player Event Stacked Bar Chart
- Grouped by **Episode on the X-axis**.
- Within each episode, renders individual bar columns for each drafted team contestant.
- Bars are stacked with exact scoring events (e.g. `Individual Immunity (+15)`, `Idol Found (+10)`, `Survived Tribal (+2)`).

---

## 🧪 Verification Results

- Verified in local browser (`index.html?league=jacks-league`) via `browser_subagent`.
- All 4 graph modes, hover tooltips, in-line parchment tags, and expanded episode event breakdowns verified clean without errors.
