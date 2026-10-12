# Mobile Graph Sticky Team Selection & Tap Behavior Fix: Walkthrough

## Summary of Issue
When accessing the leaderboard score graph on mobile devices:
1. **Selection Disappeared Immediately**: Tapping a team name badge on the graph legend either failed to select the team or highlighted it only for a split second before vanishing.
2. **Ghost Clicks & Synthetic Mouse Events**: Touch devices triggered both `touchstart` and a synthetic `click` in quick succession, toggling the selection state twice (`selected -> unselected`). Furthermore, synthetic `mouseleave` events dispatched by mobile WebKit/Blink erased the hover state (`setHoveredTeamId(null)`).
3. **Missing Persistent Selection State**: The graph previously overloaded a single `hoveredTeamId` state for both mouse hover previews and tap selections, meaning any touch outside or touch scroll cleared the highlight.

---

## Changes Implemented

### 1. Dedicated Sticky Selection State & Active Hierarchy
File: [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html#L966-L1010)

- Introduced separate `selectedTeamId` (persistent toggle state) and `hoveredTeamId` (desktop hover preview state):
  ```javascript
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [hoveredTeamId, setHoveredTeamId] = useState(null);
  const activeTeamId = selectedTeamId !== null ? selectedTeamId : hoveredTeamId;
  ```
- If a team is tapped/selected, it remains the `activeTeamId` regardless of mouse movement or ephemeral touch events until explicitly tapped again ("untapped").

### 2. Touch Debouncing & Scroll vs. Tap Detection
- Added `useRef` trackers:
  - `lastTeamTouchTimeRef`: Stores the timestamp of touch interactions on team buttons. Ignores synthetic `click` events occurring within 450ms of a touch event to eliminate ghost double-toggles.
  - `touchStartXRef` & `touchStartYRef`: Tracks touch initiation coordinates.
  - `isTouchScrollRef`: Flagged if touch movement exceeds 8px, ensuring that scrolling across the legend or graph does not trigger unintended team toggles.
- Added toggle helper:
  ```javascript
  const handleTeamToggle = (teamId, e) => {
    if (e) {
      e.stopPropagation();
      if (e.cancelable && e.type === 'touchstart') e.preventDefault();
    }
    setSelectedTeamId(prev => prev === teamId ? null : teamId);
  };
  ```

### 3. Visual Feedback & Semantic Buttons
- Upgraded legend items from plain `<div>` to semantic `<button type="button">` with `aria-pressed={isSelected}`.
- When selected:
  - Highlighted with `bg-amber-950 border-amber-400 scale-[1.04] shadow-lg text-amber-200 ring-2 ring-amber-400/80`.
  - Added a golden `✓` checkmark badge to give unambiguous visual confirmation that the team is locked.
  - The team's graph line expands to 5px stroke width while all unselected lines dim to opacity 0.2.
- Isolated `onMouseLeave`: Only clears `hoveredTeamId`, never clearing persistent `selectedTeamId`.

### 4. Graph Point Interaction Protection
- Data point tooltips on touch devices now use `handlePointToggle(pointData, e)` with touch debouncing, preventing tooltip taps from interfering with team sticky highlights.

---

## Verification Results

### 1. Automated Integration Tests
Executed test suite:
```bash
osascript -l JavaScript features/episode_catchup_spoiler_filter/tests/test_html_integration.js
```
- **Result**: 31 / 31 tests passed.

### 2. Browser Verification
- Tested with browser automation at `http://localhost:8000/index.html?league=jackson-ryan-league&season=season-51`:
  - **Single Tap Lock**: Tapping "Jackson" locks Jackson's line in bold stroke (5px) and dims other lines to opacity 0.2. The badge displays the `✓` mark and gold border.
  - **Scroll / Tap Elsewhere**: Scrolling the page and tapping outside the legend keeps the team selected continuously.
  - **Team Switching**: Tapping "Ryan" smoothly switches the active locked team to Ryan.
  - **Untap to Deselect**: Tapping "Ryan" a second time deselects the button, returning all lines to full brightness and removing the selection badge.
- Full session recording:
  `verify_graph_tap_1791847809543.webp`
