# PRD: Mobile Graph Sticky Team Name Selection & Tap Behavior Fix

**Status**: Approved & Ready for Execution  
**Location**: `bug_fixes/mobile_graph_sticky_team_selection/prd.md`  
**Target File**: `index.html` (`TeamScoreGraph` component)

---

## 1. Problem Statement

When users view the leaderboard graphs on mobile touch devices (iOS Safari, Android Chrome, and installed PWA):
1. **Flaky Tap Selection**: Tapping on a team's name badge in the legend often does not keep the team highlighted.
2. **Immediate Deselection**: Even when a team briefly highlights upon touch, it frequently vanishes as soon as the user lifts their finger, scrolls, or interacts with other parts of the graph.
3. **Ghost Clicks & Synthetic Mouse Events**: Because the legend item listened to both `onTouchStart` and `onClick`, mobile browsers dispatched both events in rapid succession, resulting in an immediate double-toggle (toggle on then instantly toggle off). Furthermore, synthetic `mouseleave` events dispatched by mobile WebKit/Blink cleared the temporary hover state (`hoveredTeamId = null`).
4. **Lack of Dedicated Sticky Selection State**: There was no distinction between a temporary mouse hover preview and an intentional persistent tap selection.

---

## 2. Goals & User Requirements

- **Sticky Until Untapped**: When a user taps a team name on mobile (or clicks on desktop), that team must **stay selected** until the user explicitly taps that same team button again to un-select it ("untap").
- **Clean Switching**: Tapping another team switches the persistent selection directly to the newly tapped team.
- **Scroll Resistance**: Scrolling the page vertically or swiping across the graph horizontally must not accidentally toggle or clear the selected team.
- **Visual Feedback**: The selected button must render with unambiguous active feedback (vibrant border, elevation ring, and a checkmark indicator `✓`) so the user knows the team is locked/highlighted.
- **Desktop Hover Harmony**: On desktop with a mouse, hovering over a team when no team is selected provides a temporary preview, while an explicit click locks the selection.

---

## 3. Technical Requirements

### 3.1 State Separation
In `TeamScoreGraph`:
- Maintain two distinct states:
  - `selectedTeamId`: Persistent ID of the team locked by user tap or click (defaults to `null`).
  - `hoveredTeamId`: Ephemeral ID of the team currently under a mouse cursor on desktop (defaults to `null`).
- Compute active highlight:
  ```javascript
  const activeTeamId = selectedTeamId !== null ? selectedTeamId : hoveredTeamId;
  ```
- All chart renderers (`cumulative`, `weekly`, `rank`, `roi`) dim unselected items using `activeTeamId && activeTeamId !== s.id`.

### 3.2 Mobile Touch & Ghost-Click Elimination
- Use `useRef` to track touch coordinates and timestamps:
  - Suppress synthetic `click` events within 450ms of a registered touch.
  - Distinguish genuine taps from scroll gestures (ignore touches with movement > 8px).
  - Prevent synthetic `onMouseLeave` from clearing `selectedTeamId`.

### 3.3 Semantic & Accessible Legend Buttons
- Render each legend item as a `<button type="button">` with `aria-pressed={isSelected}`.
- Include selected indicators (`✓` badge, bright pill ring, elevated background).

---

## 4. Acceptance Criteria

- [ ] Tapping a team name on mobile keeps that team highlighted continuously.
- [ ] Swiping, scrolling, or tapping the graph background does not dismiss the team selection.
- [ ] Tapping the selected team a second time untaps (deselects) it.
- [ ] Tapping a different team smoothly switches the selection to the newly tapped team.
- [ ] Tooltip interactions on data points do not cancel the selected team.
- [ ] Verified on mobile viewport (390x844) and desktop (1280x800).
