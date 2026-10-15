# Walkthrough: Episode Breakdown UI & Backfill Scoring Bug Fixes

## 1. Overview of Fixes

This bug fix patch resolves four key issues across the Survivor Fantasy League leaderboard, expanded team card views, and scoring engine:

1. **Graph Interaction & Zero Amber Box Around Players**:
   - In the **Episode & Player Event Breakdown** (`TeamEventStackedBarChart`), clicking, hovering, or tapping is bound directly to each player's actual graph area (`w-full max-w-[50px] sm:max-w-[56px] h-[180px]`).
   - Removed all amber rectangle borders and highlights (`ring-2 ring-amber-400`, `bg-amber-950/40`, scale) from lighting up around each player's column.
   - When no graph is hovered or selected, the panel defaults to a subtle, unobtrusive hint line (`💡 Hover, click, or tap a graph above to view episode details`) plus an on-demand `View all X team events →` toggle.
   - When the user hovers over, clicks, or taps the actual graph, the episode details for that contestant smoothly appear below the chart.
   - When clicked/tapped, the episode details pin open with a `✕ Close` button (or clicking the graph again dismisses it). Hovering displays the details dynamically while hovering.
   - A subtle zero-baseline tick mark sits at 128px so contestants with 0 points maintain a visible, easily interactive target.

2. **Episode & Player Event Breakdown Default Episode Sync**:
   - `TeamEventStackedBarChart` now accepts `viewingEpisode` and initializes its episode selector to `Math.max(1, viewingEpisode || 1)` instead of hardcoded Episode 1.
   - When the user changes the viewing episode via the header catch-up filter (e.g., switching to Episode 3 or Episode 4), a `useEffect` dynamically updates the breakdown to match the selected viewing episode.

3. **Voted Out Episode Badge Interpolation**:
   - In each team's expanded card roster, the elimination badge previously rendered as `💀 VOTED OUT (Ep true)` because a boolean flag `isEliminated` was injected into the template string.
   - The badge now resolves the numeric elimination episode (`elimEp`) and renders properly as `💀 VOTED OUT (EP 3)`.

4. **Inclusive Backfill Scoring for Backfill Episode**:
   - The previous scoring engine excluded points earned in episodes where `epNum <= bfEp`. This inadvertently prevented contestants who scored or were eliminated in the episode they were backfilled from receiving credit.
   - Updated condition to `epNum < bfEp` for exclusion and `episode >= bfEp` for inclusion across `getTeamScore`, `getPlayerScore`, `getPlayerBreakdown`, `TeamScoreGraph`, and `TeamEventStackedBarChart`.
   - Pre-backfill episodes (`ep < bfEp`) continue to be excluded (0 pts for team), while the backfill episode itself and subsequent episodes are fully credited.

---

## 2. Changes Implemented

### [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html)

- **`TeamEventStackedBarChart` Signature & Props**:
  - Added `viewingEpisode` prop.
  - Set `const initialEp = Math.max(1, viewingEpisode || 1); const [selectedEp, setSelectedEp] = useState(initialEp);`.
  - Added `useEffect` listening to `viewingEpisode` to sync active episode when the user changes catch-up filters.
  - Clamped `highestEp` to `Math.max(1, viewingEpisode || 1)`.

- **Graph DOM Layout & Interactions**:
  - Separated the column wrapper (`max-w-[90px]`) from the graph container (`max-w-[50px] sm:max-w-[56px] h-[194px]`).
  - Transferred `role="button"`, touch handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`), hover handlers (`onMouseEnter`, `onMouseLeave`), keyboard handlers (`onKeyDown`), and click handler (`onClick`) to the graph container.
  - Confined highlight classes (`scale-[1.05] bg-amber-950/40 ring-2 ring-amber-400/90 shadow-lg`) strictly to the graph container.
  - Added a baseline tick indicator at 128px for zero-point contestants.
  - Castaway name label sits below at `-bottom-1`, outside the graph container and outside the glowing rectangle.

- **Voted Out Badge Interpolation**:
  - Extracted `elimEp` from `activeEliminationOrder[player.id]`.
  - Rendered `💀 VOTED OUT (EP ${elimEp})`.

- **Backfill Episode Point Scoping**:
  - `TeamEventStackedBarChart`: Changed `ep > bfEp` to `ep >= bfEp`.
  - `TeamScoreGraph`: Changed `ep > bfEp` to `ep >= bfEp`.
  - `getTeamScore`: Changed `epNum <= bfEp` to `epNum < bfEp`, and `episode > bfEp` to `episode >= bfEp`.
  - `getPlayerScore`: Changed `epNum <= bfEp` to `epNum < bfEp`, and `episode > bfEp` to `episode >= bfEp`.
- **UI Cleanups (Labels & Redundancies)**:
  - Removed redundant `Team Score: +<points>pts` from the top-right of `ROSTER POINT CONTRIBUTION` since total team score is already prominently displayed right above on the team card header.
  - In `TeamEventStackedBarChart`, removed the `+` sign and `pts` suffix from the number above each player's graph, displaying clean numbers (e.g. `17`, `0`).

---

## 3. Verification & Testing

Testing was conducted using the local test server on `http://localhost:8000/` under the automatic `dev_testing/` Firebase namespace guard.

### Test 1: Voted Out Episode Display
- **Setup**: Ray's team in `jackson-ryan-league` with Brady Booker voted out in Episode 3 (`activeEliminationOrder["5"] = 3`).
- **Result**: Brady Booker's badge renders as `💀 VOTED OUT (EP 3)` instead of `💀 VOTED OUT (Ep true)`.

### Test 2: Breakdown Default Episode Sync
- **Setup**: Set viewing episode to Episode 3 via the header catch-up filter.
- **Result**: Expanding any team card displays `EPISODE 3` selected by default with Episode 3's points and event breakdown.

### Test 3: Backfilled Player Scoring in Backfill Episode
- **Setup**: `jordan-denver-league` seeded in `dev_testing/`:
  - Player 1 (Aaliyah) eliminated in Ep 1 (1 pt).
  - Player 4 (Ana) backfilled onto Jordan's team in Ep 2. Ana scored 15 pts in Ep 1, 15 pts in Ep 2, and was eliminated in Ep 2 (+2 elimination bonus).
- **Result**:
  - Jordan's team total is correctly calculated as **18 pts** (1 pt from Aaliyah Ep 1, + 17 pts from Ana in Ep 2: 15 pts idol + 2 pts elimination bonus).
  - Ana's Ep 1 points correctly display as `(Earned prior to backfill - 0 pts for team)` in the detailed breakdown.

### Test 4: Graph Interaction & Default All Episode Events View
- **Setup**: Navigated to Episode 2 breakdown for Jordan's team.
- **Result**:
  - **Default View**: By default, the panel directly renders all events that occurred during the episode (`Episode 2 Events`, showing Ana's idol find and elimination placement bonus) alongside the hint `💡 Hover, click, or tap a graph above to filter`.
  - **Numbers Above Graphs**: Clean numbers (`17` for Ana, `0` for others) without any `+` or `pts`.
  - **Zero Amber Rectangles**: No amber border or rectangle wraps around Ana or any player's area.
  - **Hovering**: Hovering over a contestant's graph immediately filters the list down to that contestant's events; moving the mouse away smoothly restores all episode events.
  - **Clicking / Tapping**: Clicking on a contestant's graph pins the filtered list open with a `Pinned ✓` badge and a `✕ Show All Events` button.
  - **Restore Default**: Clicking `✕ Show All Events` or clicking the graph again instantly returns to all events that occurred during the episode.

---

## 4. Production Data Safety & Isolation

- **Automatic Environment Guard**: All reads and writes were automatically directed to the `dev_testing/` namespace by `js/config.js` on `localhost:8000`.
- **Zero Production Mutations**: Live production Firebase nodes (`leagues/`, `seasons/`) remained 100% untouched.

### Test State Reset / Cleanup
To reset the test data in `dev_testing/`, run the following snippet in the browser developer console:
```javascript
import { rtdb } from './js/config.js';
import { ref, set } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';

// Reset test leagues in dev_testing
await set(ref(rtdb, 'dev_testing/leagues/jordan-denver-league'), null);
console.log('dev_testing state reset successfully');
```
