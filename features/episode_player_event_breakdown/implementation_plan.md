# Implementation Plan: Episode & Player Event Breakdown Re-Engineering

**Feature**: Re-engineering Episode & Player Event Breakdown  
**Branch**: `feature/episode-player-event-breakdown`  
**Location**: `features/episode_player_event_breakdown/implementation_plan.md`  
**PRD Reference**: [`features/episode_player_event_breakdown/prd.md`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/features/episode_player_event_breakdown/prd.md)  
**Safety Protocol**: 🔒 **Test Data Only** — Guaranteed zero live database writes  

---

## 1. Overview & Architectural Plan

This plan details the re-engineering of the `TeamEventStackedBarChart` component in [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html) so that hovering or tapping on mobile or desktop shows **all scoring events for that selected episode**, rather than relying on micro-targeting tiny stacked bar segments.

```
┌────────────────────────────────────────────────────────────────────────┐
│ EPISODE & PLAYER EVENT BREAKDOWN              Team Total: +28 pts      │
│                                               < Episode 2 >            │
├────────────────────────────────────────────────────────────────────────┤
│ [Visual Chart Area]                                                    │
│                                                                        │
│   +15 pts            +13 pts             0 pts           -10 pts       │
│    ┌───┐              ┌───┐                                            │
│    │   │              │   │                                            │
│ ───┴───┴──────────────┴───┴───────────────┬───┬───────────┴───┴─────── │
│                                                           │   │        │
│    Jackson            Ryan                Austin          Jordan       │
│  (Selected ✓)       (Dimmed)             (Dimmed)        (Dimmed)      │
├────────────────────────────────────────────────────────────────────────┤
│ 📋 ALL EVENTS FOR JACKSON IN EPISODE 2 (+15 pts)    [✕ Show All Team]  │
│                                                                        │
│  🟢 Individual Immunity Win (+15 pts)                                  │
│     Solved word puzzle in 4m 12s                                       │
│                                                                        │
│  🔵 Survived Tribal Council (+2 pts)                                   │
│     Voted with majority                                                │
│                                                                        │
│  🟣 Confessional (+1 pt)                                               │
│     Discussed strategy at water well                                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Review Required: Architecture & Design Decisions

> [!IMPORTANT]
> **Key Design Decisions**:
> 1. **Default View**: When no player is specifically hovered or tapped, the panel displays **All Team Events for Episode N** (all events from every player on the team who scored in that episode), giving an instant full-team recap.
> 2. **Player Focus View**: Hovering or tapping a player immediately filters the panel to show **all events for that player in Episode N**, with net points, category colors, and notes.
> 3. **Sticky Mobile Tapping**: Tapping a player locks them into view. Tapping them again ("untap") clears the selection back to the All Team view.
> 4. **Hit Target**: The whole player column (net points label, positive bar, negative bar, player name button) acts as a unified interactive element.

---

## 3. Step-by-Step Implementation Tasks

### Task 1: Component State & Helper Refactoring in `index.html`
- In `TeamEventStackedBarChart`:
  - Introduce `selectedPlayerId` (persistent lock) and `hoveredPlayerId` (desktop hover):
    ```javascript
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [hoveredPlayerId, setHoveredPlayerId] = useState(null);
    const activePlayerId = selectedPlayerId !== null ? selectedPlayerId : hoveredPlayerId;
    ```
  - Add touch tracking refs for debounce and scroll detection:
    ```javascript
    const lastPlayerTouchTimeRef = useRef(0);
    const touchStartXRef = useRef(0);
    const touchStartYRef = useRef(0);
    const isTouchScrollRef = useRef(false);
    ```
  - Create toggle handler:
    ```javascript
    const handlePlayerToggle = (playerId, e) => {
      if (e) {
        e.stopPropagation();
        if (e.cancelable && e.type === 'touchstart') e.preventDefault();
      }
      setSelectedPlayerId(prev => prev === playerId ? null : playerId);
    };
    ```

### Task 2: Unified Column Hit Target & Active Visual Highlights
- Refactor the player column mapping:
  - Wrap each contestant column in a clickable, accessible button container (`role="button"`, `tabIndex={0}`, `aria-pressed={isActive}`).
  - Add active styling:
    - If `activePlayerId === player.id`: highlighted with accent border/ring (`ring-2 ring-amber-400/90`), subtle elevation (`scale-[1.03]`), and gold net score badge.
    - If `activePlayerId && activePlayerId !== player.id`: dimmed to `opacity-50` with smooth transition.
  - Attach touch and mouse listeners to the column container rather than tiny bar segments:
    - `onTouchStart`, `onTouchMove`, `onTouchEnd`
    - `onMouseEnter`, `onMouseLeave`, `onClick`

### Task 3: Build the "All Events for Episode" Panel
- Replace the current 1-line tooltip with a responsive event breakdown card container:
  - **Single Player State (`activePlayerId !== null`)**:
    - Header: Player name, tribe badge/icon, episode net score pill, and an explicit `[✕ Show All Team]` button.
    - Event items: Renders all events in `activeEpMap[activePlayerId].events`.
      - Category badge with color swatch.
      - Event title and note.
      - Point value pill (`+X pts` in emerald or `-Y pts` in red).
    - Empty state: If the player was in the game but had 0 events in that episode, display a clear note: `"No scoring events for [Player Name] in Episode [N]"`.
  - **All-Team State (`activePlayerId === null`)**:
    - Header: `Episode [N] Team Events Summary` with `Team Total: +X pts` and total event count.
    - Event items: Lists all events across all roster contestants in that episode, grouped by contestant with player sub-headers.
    - If no one on the team scored any points in that episode, display: `"No scoring events recorded for this team in Episode [N]"`.

### Task 4: Episode Stepper & Catch-Up Integration
- Ensure episode switching via `<` and `>` buttons smoothly updates the event list for the new episode.
- Respect spoiler/catch-up filtering (`activeScores`, `activeEliminationOrder`).

---

## 4. Production Safety & Data Isolation Verification

- [x] **Dev Environment Check**: `js/config.js` automatically wraps Firebase under `dev_testing/` when running on `localhost`.
- [x] **Zero Production Writes**: Verify no code writes to production paths (`leagues/`, `scores/`, etc.).
- [x] **Local Test Fixtures**: All tests use synthetic mock rosters, scores, and elimination orders.

---

## 5. Testing & Verification Plan

### 5.1 Automated Integration Tests
Create `features/episode_player_event_breakdown/tests/test_breakdown_integration.js`:
- Verify `index.html` implements `selectedPlayerId` and `activePlayerId`.
- Verify unified column click/touch targets are present.
- Verify that hovering/tapping a player renders all events for that player.
- Verify that default state renders all team events for the episode.
- Verify `dev_testing/` isolation guard is untouched.

### 5.2 Browser Subagent Verification
Launch browser subagent at `http://localhost:8000/index.html?league=jackson-ryan-league&season=season-51`:
- Expand a team on the leaderboard.
- Observe default state: displays all events for the team in Episode 1.
- Tap a contestant: verify contestant is highlighted, other contestants are dimmed, and all events for that contestant in that episode appear with points and notes.
- Tap elsewhere or tap the contestant again: verify untap returns to All Team Events.
- Tap another contestant: verify smooth transition.
- Change episodes using `<` and `>` buttons: verify events update to the newly selected episode.
- Record session video artifact for walkthrough documentation.
