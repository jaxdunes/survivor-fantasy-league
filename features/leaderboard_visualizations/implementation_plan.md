# Implementation Plan: Leaderboard Data Visualizations & Parchment Roster Cards

**Target Branch**: `feature/leaderboard-visualizations-and-roster-cards`  
**Location**: `features/leaderboard_visualizations/implementation_plan.md`  
**Status**: Ready for Refined Implementation  

---

> [!IMPORTANT]
> **Production Data Safety Directive**: All testing must be conducted strictly using isolated test datasets (`dev_testing/` database path under local dev server). Production database state must remain completely untouched.

---

## Technical Architecture & Planned Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Leaderboard Visualizations Architecture                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌───────────────────┐        ┌───────────────────┐        ┌───────────────────┐
│ In-Line Ripped    │        │ Main League Graph │        │ Team Breakdown    │
│ Parchment Slips   │        │ Mode Toggles (4)  │        │ Deep-Dive Analytics│
│ - Tan Paper Texture│        │ - Cumulative Line │        │ - Episode Grouped │
│ - Ragged Paper    │        │   (Player Hover)  │        │   Bars per Player │
│   Clip-Path       │        │ - Weekly Gains    │        │ - Stacked Exact   │
│ - Realistic Torches│        │   (Clean -10 format)│       │   Scoring Events  │
│   (In-Line Header)│        │ - Rank Trajectory │        │ - Roster Donut    │
│                   │        │   (De-cluttered)  │        │   Contribution    │
│                   │        │ - Draft ROI       │        │                   │
│                   │        │   (Sorted by Pick#│        │                   │
└───────────────────┘        └───────────────────┘        └───────────────────┘
```

---

## Implementation Steps & Component Breakdown

### Phase 1: Realistic Tan Ripped Parchment Slips & In-Line Header Placement
- **Step 1.1**: Enhance SVG `TorchLit` and `TorchUnlit` components in `index.html`:
  - `TorchLit`: Detailed wooden handle texture, brass cup rim, glowing multi-gradient fire flame with subtle `@keyframes` pulse.
  - `TorchUnlit`: Charred wood handle, dark soot top, translucent rising smoke trail wisps.
- **Step 1.2**: Update `ParchmentContestantTag`:
  - Tan parchment gradient (`#e9d5a1` to `#c8a86b` with deckled/ragged torn paper CSS clip path).
  - Handwritten vote typography (`Caveat` font, 16px).
- **Step 1.3**: Move parchment slips in-line inside the team header row next to team name & rank.

### Phase 2: Main League Graph Refinements & 4 Mode Toggles
- **Step 2.1**: Update `TeamScoreGraph` modes & scale:
  - **Mode 1: 📈 Cumulative Total**: Line chart with multi-line hover tooltip listing each drafted contestant's point contribution for that team in that episode.
  - **Mode 2: 📊 Weekly Gains**: Grouped bar chart with clean negative formatting (e.g. `-10` instead of `+-10`).
  - **Mode 3: 🏆 Rank Trajectory**: Inverted rank lanes (#1, #2, #3...). Hovering over a team line dims all other team lines to 20% opacity.
  - **Mode 4: 💡 Draft Pick Value / ROI**: Sorted strictly by **Draft Pick Order** (Pick 1, Pick 2...) with explicit `Pick #X` sub-labels on X-axis.

### Phase 3: Episode & Player Exact Scoring Event Stacked Bar Chart
- **Step 3.1**: Rebuild `TeamEventStackedBarChart`:
  - X-axis grouped by **Episode** (Ep 1, Ep 2, Ep 3...).
  - Within each episode: Individual bars for each player on that team.
  - Bar height matches player's total episode score.
  - Stacked segments represent **exact scoring events** (e.g., `Immunity Win (+15)`, `Idol Found (+10)`, `Survived Tribal (+2)`, `Confessional (+1)`).

---

## Verification & Testing Plan

1. Verify local dev server runs under `dev_testing/` path without touching live data.
2. Verify in-line tan ripped parchment slips with realistic torches display on team header row.
3. Test 4 main chart modes: Cumulative (multi-line player tooltips), Weekly Gains (clean `-X`), Rank Trajectory (dimming non-selected teams), and Draft ROI (ordered by Pick #).
4. Verify expanded team breakdown renders episode-grouped bars per player with exact stacked scoring events.
