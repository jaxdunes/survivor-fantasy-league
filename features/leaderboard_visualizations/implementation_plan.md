# Implementation Plan: Leaderboard Data Visualizations & Parchment Roster Cards

**Target Branch**: `feature/leaderboard-visualizations-and-roster-cards`  
**Location**: `features/leaderboard_visualizations/implementation_plan.md`  
**Status**: Ready for Implementation  

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
│ Collapsed Parchment│        │ Main League Graph │        │ Team Breakdown    │
│ Roster Cards      │        │ Mode Toggles (5)  │        │ Deep-Dive Analytics│
│ - Parchment Texture│        │ - Cumulative Line │        │ - Stacked Event   │
│ - Tribal Vote Font│        │ - Weekly Heatmap  │        │   Bar Chart       │
│ - Lit/Unlit Torches│        │ - Rank Trajectory │        │ - Roster Donut    │
│   (Custom SVGs)   │        │ - Roster Survival │        │   Contribution    │
│                   │        │ - Draft ROI Value │        │                   │
└───────────────────┘        └───────────────────┘        └───────────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │ SVG Bounds & Negative Y   │
                         │ - Dynamic min/max domain  │
                         │ - Padded plot boundary    │
                         └───────────────────────────┘
```

---

## Implementation Steps & Component Breakdown

### Phase 1: Custom SVG Torch Components & Survivor Parchment Roster Cards
- **Step 1.1**: Define SVG `TorchLit` and `TorchUnlit` React components in `index.html`:
  - `TorchLit`: Wooden handle, metallic rim, glowing fire flame with CSS `@keyframes` pulse.
  - `TorchUnlit`: Charred handle, dark torch head, translucent rising smoke wisps.
- **Step 1.2**: Import Google Font `Caveat` or `Permanent Marker` for tribal vote typography.
- **Step 1.3**: Update collapsed team cards in `index.html` to render a parchment vote badge grid for all drafted contestants on that team, featuring:
  - Contestant name in tribal vote font.
  - SVG Lit/Unlit torch depending on elimination status (`eliminationOrder[p.id]`).
  - Tribe dot badge for current episode tribe assignment.

### Phase 2: Main League Graph Fixes & 5 Interactive Mode Toggles
- **Step 2.1**: Fix SVG Y-axis scale and padding in `TeamScoreGraph`:
  - `minScore = Math.min(0, ...allTeamScores)`
  - Add 10% bottom padding so negative score lines stay well above bottom axis.
  - Add 40px left/right padding to `viewBox` so Episode 1 and final Episode dots/labels aren't clipped.
- **Step 2.2**: Implement Tab Controls Bar for `TeamScoreGraph`:
  - Mode 1: 📈 **Cumulative Total** (Enhanced line chart).
  - Mode 2: 📊 **Weekly Score Heatmap / Grouped Bar** (Points per episode).
  - Mode 3: 🏆 **Rank Trajectory** (Inverted rank #1..#N position tracking).
  - Mode 4: 🕯️ **Active Roster Survival** (Active players remaining over time).
  - Mode 5: 💡 **Draft Pick Value / ROI** (Points produced vs draft pick order).

### Phase 3: Participant Team-Level Analytics
- **Step 3.1**: Create `TeamEventStackedBarChart` component:
  - Rendered when a team card is expanded.
  - Episode-by-episode stacked bars color-coded by category (Immunities, Idols, Surviving, Confessionals, Bonuses).
- **Step 3.2**: Create `TeamRosterDonutChart` component:
  - Interactive SVG donut chart displaying percentage contribution of total points per drafted contestant.

---

## Verification & Testing Plan

1. Verify local dev server runs under `dev_testing/` path without touching live data.
2. Verify negative team scores render cleanly above the bottom edge of the graph SVG.
3. Test parchment cards & SVG torch states (lit for active, unlit for eliminated).
4. Verify main chart toggles update dynamically on click.
5. Verify team-level stacked bar chart and donut chart render accurately inside expanded team cards.
