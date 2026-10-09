# Implementation Plan: Episode Breakdown & Roster Contribution UI Tweaks

## Overview
Implement visual refinements for `TeamEventStackedBarChart` and `TeamRosterContributionBar` in [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html).

---

## Proposed Code Changes

### 1. `TeamEventStackedBarChart` Header Navigation
- Update header container to `flex items-center justify-between flex-wrap gap-2 mb-3 pb-1 w-full`.
- Wrap navigation controls in `flex items-center gap-1.5 ml-auto sm:ml-0 justify-center`.
- Replace `<` and `>` buttons with minimalist SVG path chevrons:
  - Left Chevron: `<svg viewBox="0 0 24 24" className="w-4 h-4 stroke-amber-400 fill-none stroke-[2.5]"><path d="M15 18l-6-6 6-6" /></svg>`
  - Right Chevron: `<svg viewBox="0 0 24 24" className="w-4 h-4 stroke-amber-400 fill-none stroke-[2.5]"><path d="M9 18l6-6-6-6" /></svg>`

### 2. `TeamEventStackedBarChart` Overlap Fix
- Increase chart height to `h-[235px] pt-2 pb-6`.
- Constrain `negPx` to max `36px` (`Math.round((pData.negPts / globalMaxNeg) * 36)`).
- Position player names at `absolute bottom-0 text-center truncate max-w-[85px]`, giving 25px+ clear vertical distance from negative score labels.

### 3. `TeamRosterContributionBar` Label Cleanups
- Update positive items label text from `+${item.score} (${Math.round(pct)}%)` to `${item.score} pts`.

---

## Verification Plan
- Use `browser_subagent` in mobile viewport mode to:
  1. Verify minimalist chevrons and right-aligned mobile Episode# header.
  2. Verify player names in stacked bar chart have zero overlap with negative score labels.
  3. Verify Roster Point Contribution labels display clean points (e.g. `45 pts`).
