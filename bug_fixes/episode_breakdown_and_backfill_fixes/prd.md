# Product Requirements Document (PRD): Episode Breakdown UI & Backfill Scoring Bug Fixes

**Version**: 1.0  
**Status**: Ready for Implementation  
**Location**: `bug_fixes/episode_breakdown_and_backfill_fixes/prd.md`  
**Target Files**: `index.html`  
**Git Branch**: `bugfix/episode-breakdown-and-backfill-fixes`

---

## 1. Problem Statement & Background

A collection of related UI defects and scoring discrepancies have been identified across the Survivor Fantasy League leaderboard and expanded team views:

1. **Player Graph Interaction & Highlight Target**:
   - In the **Episode & Player Event Breakdown** (`TeamEventStackedBarChart`), clicking, hovering, or tapping is attached to the entire player column, causing a large rectangular highlight (`ring-2 ring-amber-400`, `bg-amber-950/40`) to light up around the entire player slot (including the castaway name label at the bottom and empty vertical space).
   - *Expected*: The interactive click/hover/tap action and visual highlight rectangle should be limited strictly to each player's graph itself.

2. **Episode & Player Event Breakdown Default Episode**:
   - The breakdown component currently initializes with a hardcoded `useState(1)`, defaulting to Episode 1 even when the user is actively viewing Episode 4 or another later episode via the catch-up filter.
   - *Expected*: The breakdown should default to whatever episode the user is currently viewing (`viewingEpisode`), and update dynamically whenever `viewingEpisode` changes.

3. **Voted Out Episode Display on Expanded Team Card**:
   - In each team's expanded card roster, an eliminated player displays the badge `💀 VOTED OUT (Ep true)`. This occurs because a boolean variable `isEliminated` was injected into the badge template string instead of the numeric episode value `elimEp`.
   - *Expected*: The badge must display the actual episode number the player was voted out on, e.g., `💀 VOTED OUT (EP 3)`.

4. **Backfilled Player Scoring for Backfill Episode**:
   - Currently, point-scoping logic strictly checks `epNum > bfEp` and `epNum <= bfEp`. This excludes all points earned by a backfilled player in the episode they joined the team. For example, if Ana is backfilled onto Jordan's team in Episode 2 and is eliminated in Episode 2, neither her Episode 2 scoring events nor her Episode 2 elimination bonus are credited to Jordan's team.
   - *Expected*: Any backfilled player's score must apply starting in the episode they were backfilled in (`epNum >= bfEp`). Only episodes prior to the backfill episode (`epNum < bfEp`) should be excluded.

---

## 2. Functional Requirements & Scope

### Req 1: Interactive Graph Trigger & Zero Amber Rectangle Around Players
- In `TeamEventStackedBarChart`:
  - Eliminate any amber rectangle outline, ring, or colored background (`ring-2 ring-amber-400`, `bg-amber-950/40`, scale) from lighting up around each player's column.
  - Bind hover, click, and tap listeners (`onClick`, `onTouchStart`, `onTouchMove`, `onTouchEnd`, `onMouseEnter`, `onMouseLeave`, `onKeyDown`) directly to each player's graph container.
  - By default, do not display the full all-team events list (which previously cluttered the card and made the amber box feel like the only interactive feedback); instead, render a clean, unobtrusive hint row: `💡 Hover, click, or tap a graph above to view episode details`, with an on-demand `View all X team events →` toggle.
  - When the user hovers over, clicks, or taps a contestant's graph, that contestant's episode details smoothly appear directly below the chart.
  - Clicking/tapping pins the details open with a `✕ Close` button (and clicking the graph again dismisses it).
  - Hovering displays the details dynamically while the cursor is over the graph.
  - Maintain a subtle baseline tick indicator at 128px so contestants with 0 points have a clear visual and interactive reference point.

### Req 2: Synchronize Default Breakdown Episode with Viewing Episode
- `TeamEventStackedBarChart` must accept `viewingEpisode` as a prop.
- Initialize `selectedEp` state to `Math.max(1, viewingEpisode || 1)`.
- Use a `useEffect` on `viewingEpisode` so if the user switches viewing episodes via the header filter, `selectedEp` automatically switches to the newly viewed episode.
- Ensure `maxEp` in `TeamEventStackedBarChart` is at least `Math.max(1, viewingEpisode || 1)` so navigation buttons and bounds allow viewing the selected episode even if that specific team has no scores yet.

### Req 3: Correct Eliminated Badge String Interpolation
- In the expanded team roster mapping (`index.html`), resolve the numeric elimination episode:
  ```javascript
  const elimEp = activeEliminationOrder && (activeEliminationOrder[player.id] !== undefined ? activeEliminationOrder[player.id] : activeEliminationOrder[String(player.id)]);
  const isEliminated = elimEp !== undefined && elimEp !== null && elimEp !== false;
  ```
- Render badge as:
  ```javascript
  `💀 VOTED OUT (EP ${elimEp})`
  ```

### Req 4: Inclusive Backfill Episode Scoring
- When calculating team and player scores, include points for episodes where `episode >= bfEp`:
  - `getTeamScore(teamId)`:
    - Score events: exclude only when `bfEp !== null && epNum < bfEp` (allow `epNum === bfEp`).
    - Elimination bonus: include when `bfEp === null || episode >= bfEp`.
  - `getPlayerScore(playerId)`:
    - Score events: exclude only when `bfEp !== null && epNum < bfEp`.
    - Elimination bonus: include when `bfEp === null || episode >= bfEp`.
  - `getPlayerBreakdown(playerId)`:
    - `isPreBackfill`: `bfEp !== null && epNum < bfEp`.
    - Elimination bonus `isPreBackfill`: `bfEp !== null && episode < bfEp`.
  - `TeamEventStackedBarChart`:
    - Event filtering: `bfEp === null || ep >= bfEp`.
    - Elimination bonus: `bfEp === null || ep >= bfEp`.
  - `TeamScoreGraph`:
    - History calculation: `bfEp === null || ep >= bfEp`.

---

## 3. Data Schema & Isolation

- **Firebase Data Safety**:
  - Live production paths remain strictly untouched.
  - Testing is executed exclusively on `localhost:8000` under the `dev_testing/` prefix via `js/config.js`.
- **Data Schema**:
  - `draftState.backfilledPlayers[playerId] = { episode: Number, replacedPlayerId: Number, timestamp: Number }`
  - When `episode` is recorded (e.g. `2`), points in Episode 2 belong to the receiving team. Points in Episode 1 belong to no team.

---

## 4. Acceptance Criteria

1. **Graph Interaction & Rectangle Bounds**:
   - In `TeamEventStackedBarChart`, hovering or tapping on a player's graph illuminates only the graph container.
   - The player's name at the bottom remains outside the amber highlight rectangle.
   - Players with 0 points display a visible baseline bar and can be tapped/hovered.
2. **Default Episode Sync**:
   - If viewing Episode 4 on the leaderboard, opening the expanded team view displays Episode 4 by default in the Episode & Player Event Breakdown.
   - Changing the episode in the catch-up filter updates the breakdown's selected episode accordingly.
3. **Voted Out Badge**:
   - An eliminated player's badge in the expanded team card displays `💀 VOTED OUT (EP <num>)` with the actual episode number (e.g., `EP 3`), never `EP true`.
4. **Backfilled Scoring**:
   - A player backfilled in Episode 2 receives points for Episode 2 scoring events and elimination bonus on their new team.
   - Pre-backfill points from Episode 1 are not added to the team total and are marked `(Earned prior to backfill - 0 pts for team)`.
