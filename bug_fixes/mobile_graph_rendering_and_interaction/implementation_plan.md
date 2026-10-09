# Implementation Plan: Mobile Graph Rendering & Touch Interactions

## Overview
Fix mobile responsiveness, layout scaling, and touch interaction for all graph modes (`cumulative`, `weekly`, `rank`, `roi`) in `TeamScoreGraph` inside `index.html`.

---

## Proposed Changes

### 1. `TeamScoreGraph` Layout & Container Updates
- Change team legend wrapper from `min-w-[130px]` to `w-full md:w-auto flex flex-row flex-wrap md:flex-col justify-center gap-1.5 md:gap-2`.
- Change chart SVG wrapper to `w-full overflow-x-auto overflow-y-hidden scrollbar-thin py-1`.
- Adjust SVG `className` from `min-w-[450px]` to `min-w-[620px] md:min-w-[650px] w-full h-auto`.

### 2. Touch & Tap Interactions
- Attach `onClick` and `onTouchStart` to all interactive chart elements:
  - Cumulative line chart circles (`onMouseEnter`, `onTouchStart`, `onClick`)
  - Weekly gains bars (`onMouseEnter`, `onTouchStart`, `onClick`)
  - Rank trajectory circles (`onMouseEnter`, `onTouchStart`, `onClick`)
  - Draft ROI rect bars (`onMouseEnter`, `onTouchStart`, `onClick`)
  - Team legend pill cards (`onMouseEnter`, `onMouseLeave`, `onClick`, `onTouchStart`)
- Add container `onClick` / `onTouchStart` handler to dismiss tooltips when tapping empty chart space.

### 3. Tooltip Mobile Bounds Safety
- Adjust `getTooltipPositionStyle` to constrain `left` position between 10% and 90% so mobile tooltips never cut off on screen edges.

---

## Verification Plan
- Use `browser_subagent` in mobile viewport (390x844) to test:
  1. Chart scrollability and clear text rendering.
  2. Tap interactions on bars and data points.
  3. Team legend toggles and tooltip dismissals.
