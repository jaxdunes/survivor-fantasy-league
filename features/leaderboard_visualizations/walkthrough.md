# Walkthrough: Leaderboard Visualizations & Roster Cards Refinement

## Overview
Refined all Leaderboard visualizations, tooltips, torn parchment roster tags, Survivor Tiki Torches, and single-episode event breakdowns on branch `feature/leaderboard-visualizations-and-roster-cards`.

---

## 🎨 Implemented Refinements & Bug Fixes

### 1. 📈 Cumulative Graph Cumulative Player Score Breakdown
- **Cumulative Contribution Tooltip**: Hovering over any team data point at Episode $N$ now lists each player's **cumulative point contribution through Episode $N$**.
- **Exact Addition**: Player scores listed in the tooltip sum up directly to the team's total cumulative score at that episode.

### 2. 🛡️ Smart Tooltip Positioning & Zero Clipping
- **Dynamic Orientation & Offsets**: Tooltips automatically detect bounding edges:
  - Positioned *below* data points when near top (`cy < 110`).
  - Shifted left or right near horizontal boundaries (`cx > 72%` or `cx < 28%`).
  - Styled with `overflow-visible` and `z-30` so tooltips never get clipped by chart boxes.

### 3. 🎯 Rank Trajectory Hover Dot Stability Fix
- **No Dot Spasm / Flickering**: Removed `setHoveredTeamId` thrashing from circle enter events and introduced an expanded 12px transparent target hit circle behind each point. Dot mouse events are 100% stable.

### 4. 💡 Draft ROI [Round].[Pick] Formatting & High Contrast Labels
- **Pick Format `[Round].[PickNumber]`**:
  - Displays draft pick order as `1.1` (1st pick Round 1), `1.2`, `1.3`... `2.1` (1st pick Round 2) on top of each bar in bold vibrant orange text (`#f97316`).
- **High Contrast Castaway Names**: Rendered below X-axis in clean, readable slate font (`#334155`).

### 5. 🗿 Standing Tiki Torches & Darker Tan Ripped Parchment Slips
- **Darker Tan Parchment (`.parchment-card-tan`)**:
  - Rich weathered tan paper gradient (`#d3b484` to `#a4814d`), rough jagged ripped clip-path, dark burnt borders, and inner drop shadow.
  - Handwritten dark sepia vote text (`Caveat` font, `#241404`).
- **Full Standing Tiki Torches (`TorchLit` & `TorchUnlit`)**:
  - **Not bound inside parchment**: Placed as a vertical standing torch right beside the parchment slip.
  - **Lit Torch**: Bamboo shaft, woven basket head, multi-stage flickering flame with radial light aura glow.
  - **Extinguished Torch**: Charred basket top, ember bed, and translucent rising smoke wisps.

### 6. 📊 Single-Episode & Player Breakdown (Expanded Team View)
- **Single Episode Focus**: Rebuilt `TeamEventStackedBarChart` to display one episode at a time.
- **Navigation Controls**: Includes `◄ Prev Ep`, episode selector pills (`Ep 1`, `Ep 2`...), and `Next Ep ►` buttons.
- **Interactive Event Tooltips**: Hovering or clicking over any stacked bar section displays an interactive detail card with event title, point value (`+15 pts`), category color badge, and notes.

---

## 🧪 Verification Summary
- Verified in local browser (`index.html`) across all graph modes, tooltips, single-episode navigation, and standing tiki torch parchment tags.
