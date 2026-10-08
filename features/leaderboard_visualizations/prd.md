# Product Requirements Document (PRD): Leaderboard Data Visualizations & Parchment Roster Cards

**Version**: 1.1 (Finalized Design & Planning)  
**Status**: Approved & Ready for Execution  
**Location**: `features/leaderboard_visualizations/prd.md`  
**Target Files**: `index.html`, `js/scoring-engine.js`, `js/config.js`  
**Git Branch**: `feature/leaderboard-visualizations-and-roster-cards`  

---

## 1. Feature Overview & Core Objectives

The **Leaderboard Data Visualizations & Parchment Roster Cards** update transforms the main Leaderboard in `index.html` into a highly visual, immersive Survivor experience. It introduces:
1. **Collapsed Team Parchment Vote Cards**: A custom Survivor tribal council vote parchment design on collapsed team cards featuring handwritten-style contestant names paired with custom SVG lit/unlit torches indicating survival status (no emojis).
2. **Main League Graph Mode Toggles**: 5 interactive visualization modes for overall league performance:
   - **Cumulative Total Score** (Line chart)
   - **Weekly Points Heatmap / Bar** (Points earned per episode per team)
   - **Rank Trajectory** (Episode-by-episode rank #1..#N movement)
   - **Active Roster Survival Count** (Active vs eliminated contestants per team over time)
   - **Draft Pick Value / ROI Efficiency** (Points earned per draft pick round/slot to identify steals vs busts)
3. **Team-Level Analytics**: Detailed breakdown charts for individual fantasy teams:
   - **Episode Event Stacked Bar Chart** (Per-episode points breakdown by player, stacked by scoring category)
   - **Roster Contribution Donut Chart** (% of total team points produced by each drafted contestant)
4. **Graph Scale & Boundary Margin Fixes**:
   - Auto-adjusting SVG Y-axis domain calculating `minVal = Math.min(0, ...allScores)` with bottom padding so negative scores stay fully visible.
   - Padded horizontal/vertical margins preventing episode dots and labels from being clipped at chart boundaries.

---

## 2. Safety & Development Isolation Requirements

> [!IMPORTANT]
> **Production Data Safety Directive**: All manual testing, automated checks, and local dev server runs MUST use isolated testing environments (`dev_testing/` database path under `localhost`). Production Firebase database nodes must remain strictly untouched.

---

## 3. Detailed UI & Functional Specifications

### 3.1 Collapsed Team Parchment Roster Cards
- **Survivor Parchment Badges**:
  - Embedded directly on collapsed team header cards.
  - Styled with a warm parchment vote paper texture background and subtle drop shadow.
- **Handwritten Typography**: Contestant names styled with a Survivor tribal council handwritten vote look using Google Fonts (`Caveat` or `Permanent Marker`).
- **Custom SVG Torches (No Emojis)**:
  - **Active Contestant**: Custom lit torch SVG with animated glowing/flickering fire flame.
  - **Eliminated Contestant**: Custom unlit torch SVG with subtle translucent rising smoke wisps.

### 3.2 Main League Graph Toggles (Top Graph)
- **Toggle Control Bar**: Tab buttons rendered above the main graph.
- **5 Interactive Views**:
  1. 📈 **Cumulative Total Score**: Line chart of running totals across episodes.
  2. 📊 **Weekly Score Heatmap / Bar**: High-level view showing which team won/dominated each episode.
  3. 🏆 **Rank Trajectory**: Inverted Y-axis line chart tracking rank positions (#1, #2, #3...).
  4. 🕯️ **Active Roster Survival**: Line/bar chart showing active players remaining per team per episode.
  5. 💡 **Draft Pick Value / ROI Efficiency**: Bar chart comparing total points produced vs draft position (points-per-pick efficiency).

### 3.3 Team-Level Breakdown Visualizations
- **Episode Event Stacked Bar Chart**:
  - Rendered when a team card is expanded.
  - X-axis: Episode 1..N.
  - Stacked bar segments for each player in that episode, color-coded by category:
    - 🛡️ Immunities
    - 🗝️ Idols / Advantages
    - 🏕️ Surviving Tribal
    - 💬 Confessionals
    - 🏆 Bonuses / Elimination
- **Roster Contribution Donut Chart**:
  - Interactive donut/pie chart displaying each drafted contestant's share of total team points.

### 3.4 SVG Boundary & Negative Y-Axis Fixes
- **Negative Scale Math**:
  - `minScore = Math.min(0, ...allTeamScores)`
  - Adds a 10% bottom padding margin so negative scores render cleanly within the SVG viewport without dropping off bottom edge.
- **Graph Padding**:
  - Adds 40px left/right padding to SVG `viewBox` so Episode 1 dots/labels and final Episode dots/labels are completely contained.

---

## 4. Success Criteria & Verification Checklist

- [ ] Dev environment guard (`dev_testing/` path) verified active during local testing.
- [ ] Collapsed team header cards display Survivor parchment vote slips with handwritten contestant names.
- [ ] Active contestants display animated lit SVG torches; eliminated contestants display unlit SVG torches with smoke (no emojis).
- [ ] Main graph toggle bar switches smoothly between Cumulative, Weekly Heatmap, Rank Trajectory, Active Roster Survival, and Draft Pick ROI modes.
- [ ] Negative team scores render cleanly above the bottom edge of the graph SVG.
- [ ] Graph boundary margins prevent point dots and labels from being clipped on Episode 1 and final Episode.
- [ ] Expanded team cards render Episode Event Stacked Bar Chart and Roster Contribution Donut Chart.
