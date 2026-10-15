# Implementation Plan: Episode Breakdown UI & Backfill Scoring Bug Fixes

**Feature/Bug Fix**: Episode Breakdown UI & Backfill Scoring Patch  
**Location**: `bug_fixes/episode_breakdown_and_backfill_fixes/implementationplan.md`  
**Target Files**: `index.html`  

---

## 1. Architectural Changes & Affected Areas

### Target File: `index.html`

1. **`TeamEventStackedBarChart` (`index.html`)**:
   - Add `viewingEpisode` prop to component signature.
   - Set initial `selectedEp` state to `Math.max(1, viewingEpisode || 1)`.
   - Add `useEffect` to update `selectedEp` when `viewingEpisode` changes.
   - Ensure `highestEp` in `useMemo` is at least `Math.max(1, viewingEpisode || 1)`.
   - Update backfill condition: `bfEp === null || ep >= bfEp` for both event points and elimination bonus.
   - Refactor column structure:
     - Outer div: column layout wrapper (`flex-1 flex flex-col items-center h-full relative max-w-[90px] select-none group`).
     - Graph wrapper div: contains net pts, pos bar, neg bar, and baseline mark. Receives interactive handlers (`onClick`, `onTouchStart`, `onTouchMove`, `onTouchEnd`, `onMouseEnter`, `onMouseLeave`, `onKeyDown`), `role="button"`, and highlight classes (`ring-2 ring-amber-400/90 bg-amber-950/40 shadow-lg` when `isActive`).
     - Player name label: positioned at the bottom of the outer column, cleanly outside the graph wrapper.

2. **Component Call Site (`index.html#L3495`)**:
   - Pass `viewingEpisode: viewingEpisode` to `TeamEventStackedBarChart`.

3. **Expanded Team Card Roster Badge (`index.html#L3503-3528`)**:
   - Extract `elimEp` from `activeEliminationOrder`.
   - Determine `isEliminated = elimEp !== undefined && elimEp !== null && elimEp !== false`.
   - Update string interpolation from `💀 VOTED OUT (EP ${isEliminated})` to `💀 VOTED OUT (EP ${elimEp})`.

4. **Backfill Scoring Logic (`index.html`)**:
   - `getTeamScore(teamId)`:
     - Change `if (bfEp !== null && epNum <= bfEp) return;` to `if (bfEp !== null && epNum < bfEp) return;`.
     - Change `if (bfEp === null || episode > bfEp)` to `if (bfEp === null || episode >= bfEp)`.
   - `getPlayerScore(playerId)`:
     - Change `if (bfEp !== null && epNum <= bfEp) return;` to `if (bfEp !== null && epNum < bfEp) return;`.
     - Change `if (bfEp === null || episode > bfEp)` to `if (bfEp === null || episode >= bfEp)`.
   - `getPlayerBreakdown(playerId)`:
     - Change `const isPreBackfill = bfEp !== null && epNum <= bfEp;` to `const isPreBackfill = bfEp !== null && epNum < bfEp;`.
     - Change `const isPreBackfill = bfEp !== null && episode <= bfEp;` to `const isPreBackfill = bfEp !== null && episode < bfEp;`.
   - `TeamScoreGraph`:
     - Change `if (bfEp === null || ep > bfEp)` to `if (bfEp === null || ep >= bfEp)`.

---

## 2. Step-by-Step Implementation Phases

### Phase 1: Backfill Scoring Scoping Fix
- Update `getTeamScore`, `getPlayerScore`, `getPlayerBreakdown`, `TeamScoreGraph`, and `TeamEventStackedBarChart` in `index.html`.
- Verify that points from `ep < bfEp` are excluded, while points from `ep >= bfEp` are included.

### Phase 2: Voted Out Episode Badge Fix
- Update `index.html` lines 3503-3528 to read `elimEp` and render `💀 VOTED OUT (EP ${elimEp})`.

### Phase 3: Episode & Player Event Breakdown Default Episode Sync
- Pass `viewingEpisode` into `TeamEventStackedBarChart`.
- Initialize and synchronize `selectedEp` state to `viewingEpisode`.
- Clamp `maxEp` calculation to include `viewingEpisode`.

### Phase 4: Graph Interaction & Rectangle Bounds Limitation
- Reorganize the DOM in `TeamEventStackedBarChart` so that the interactive listeners and visual rectangle (`ring-2 ring-amber-400`, `bg-amber-950/40`) are confined to the graph element, leaving the castaway name outside.
- Add baseline zero tick mark so contestants with 0 points have a clear graph touch target.

---

## 3. Verification Plan

1. **Test State Initialization**:
   - Seed `jordan-denver-league` or `jackson-ryan-league` in `dev_testing` with a backfilled player (e.g. Ana backfilled in Ep 2 and eliminated in Ep 2).
   - Check that Ana's Episode 2 points (and elimination points) are reflected in Jordan's team total.
2. **Elimination Badge Check**:
   - Expand Ray's team card (with Brady Booker voted out in Ep 3).
   - Verify badge displays `💀 VOTED OUT (EP 3)` instead of `💀 VOTED OUT (EP true)`.
3. **Default Episode Sync Check**:
   - Set viewing episode to Episode 3 in the catch-up filter.
   - Expand any team card.
   - Verify the breakdown shows "Episode 3" and its team total for Episode 3 by default.
4. **Graph Interaction & Rectangle Visual Check**:
   - Hover and tap on a player's graph in the breakdown.
   - Verify the illuminated amber rectangle is tightly wrapped around the graph bar area and does not encompass the castaway's name.
