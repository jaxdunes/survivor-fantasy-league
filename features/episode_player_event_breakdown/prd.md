# Product Requirements Document (PRD): Episode & Player Event Breakdown Re-Engineering

**Feature Name**: Episode & Player Event Breakdown Re-Engineering  
**Status**: In Planning / Design Phase  
**Branch**: `feature/episode-player-event-breakdown`  
**Location**: `features/episode_player_event_breakdown/prd.md`  
**Target Files**: `index.html` (`TeamEventStackedBarChart` component), `js/scoring-engine.js` (if helper extensions needed)  
**Safety Classification**: 🔒 **Strict Data Isolation** — Test Data Only, Zero Live Production Data Writes  

---

## 1. Executive Summary & Problem Statement

### 1.1 The Problem with the Current Implementation
Inside the expanded team view on the leaderboard, the **Episode & Player Event Breakdown** (`TeamEventStackedBarChart`) provides a stacked bar visualization intended to show each player's scoring events for a selected episode. However, the current user experience has severe flaws:
1. **Unusable Micro-Targets**: Each scoring event is rendered as an isolated vertical segment inside a stacked bar. For low-point events (e.g., +1 pt confessional or +2 pt tribal survival), these segments are often only 2px to 6px tall. Precision hovering with a mouse is awkward and frustrating.
2. **Failure on Mobile Touch Devices**: On touchscreens (iOS Safari, Android Chrome, mobile PWA), finger taps cannot reliably hit a 4px sliver. Taps frequently miss, trigger page scrolls, or fire synthetic mouse events that dismiss immediately.
3. **One-At-A-Time Event Fragmentation**: Even if a user manages to hit a tiny segment, the UI only shows *that single event* in a 1-line footer tooltip. If a contestant participated in 4 distinct events in an episode (e.g., Tribal Survival, Reward Win, Confessionals, and an Advantage find), the user has no way to see all events at once.
4. **No Comprehensive Episode Overview**: When no bar segment is actively hovered, the component displays a generic placeholder tip (`💡 Hover or click over any stacked bar section...`) rather than showing the team's complete event log for that episode.

### 1.2 Core Objective
Re-engineer the **Episode & Player Event Breakdown** so that:
- On **hover** (desktop preview) or **click / tap** (desktop & mobile lock), the UI displays **all scoring events for that contestant in the selected episode** in an organized, beautiful card list.
- Clicking or tapping a contestant locks that contestant's complete event breakdown until explicitly clicked/tapped again to un-select ("untap"), clicking another contestant, or clicking "✕ Show All Team".
- When no contestant is selected (or when "All Team Events" is active), the component displays **all scoring events across the entire team for that episode**.
- The entire contestant column (bars, labels, and contestant name) functions as a generous, responsive hit target with visual focus and dimming.

---

## 2. Production Safety & Data Isolation Directive

> [!IMPORTANT]
> **Strict Test Data Isolation**: Under no circumstances will live production Firebase nodes be modified or accessed during development, testing, or automated test runs.
> - All local development and automated testing must run against mock fixtures or the isolated `dev_testing/` namespace configured in `js/config.js`.
> - Component logic is strictly read-only with respect to scoring data props (`scores`, `roster`, `draftState`, `eliminationOrder`).
> - Verification will be performed on localhost (`http://localhost:8000`) where Firebase writes/reads are automatically prefixed with `dev_testing/`.

---

## 3. User Experience & Detailed Requirements

### 3.1 Interactive Contestant Column Hit Targets
- Rather than listening for events on individual 3px stacked segments, the **entire vertical column for each contestant** becomes an interactive target:
  - Header: Net points badge (`+X pts`, `-Y pts`, or `0 pts`).
  - Bar Area: Both positive stack and negative stack containers.
  - Footer: Contestant name badge.
- **Visual Feedback on Hover/Selection**:
  - The active contestant column is highlighted with an accent ring (`ring-2 ring-amber-400/80` or team color glow) and subtle elevation (`scale-[1.03]`).
  - Unselected contestant columns in the chart are gently dimmed (`opacity-60`) to provide instant visual focus.
  - Hover cursor is styled as `cursor-pointer`.

### 3.2 "All Events for Selected Episode" Display Area
Below the chart, replace the fragile 1-line tooltip with a responsive, glassmorphic **Episode Event Breakdown Panel**:

#### A. Contestant Selected (Filtered View)
When a contestant is hovered or tapped:
1. **Header**:
   - Contestant name and avatar/icon or tribe pill.
   - Total Episode Points summary (`Total: +X pts` or `-Y pts`).
   - Quick "✕ Show All Team Events" badge/button to reset selection.
2. **Events List**:
   - Every scoring event for that contestant in the selected episode rendered as a distinct event item:
     - **Category & Color**: Category swatch / badge (Immunity, Tribal, Idol, Reward, Confessional, Placement Bonus, Penalty, etc.).
     - **Title & Description**: Event title (e.g. `Individual Immunity Win`) and optional commissioner note (e.g. `Solved word puzzle in 4m 12s`).
     - **Points Pill**: Styled point indicator (`+15 pts` in vibrant emerald, `-10 pts` in bold crimson).
3. **Empty State**:
   - If a contestant was active but scored 0 points in that episode:
     - Clean, friendly card: `"No scoring events for [Player Name] in Episode [N]"`.

#### B. Default / All Team Events View
When no specific contestant is hovered or selected:
1. **Header**:
   - Title: `Episode [N] Team Events Summary`.
   - Team total for the episode: `Team Total: +X pts`.
   - Badge count of total events in the episode (e.g., `5 events`).
2. **Events List**:
   - Displays all scoring events across all drafted contestants for that episode, grouped by contestant.
   - Allows users to instantly scan how the team performed overall without needing to click each individual player.

### 3.3 Sticky Mobile & Touch Architecture
- **Persistent Selection State**:
  - `selectedPlayerId`: Stores the ID of the locked contestant (defaults to `null`).
  - `hoveredPlayerId`: Ephemeral ID from mouse hover on desktop.
  - `activePlayerId = selectedPlayerId !== null ? selectedPlayerId : hoveredPlayerId`.
- **Untap Toggle**:
  - Tapping a contestant button/column toggles selection:
    - If unselected -> locks that contestant.
    - If already selected -> untaps and returns to "All Team Events".
    - If another contestant is tapped -> smoothly transfers selection to the new contestant.
- **Ghost Click & Scroll Protection**:
  - Uses `useRef` to track touch timestamps, ignoring synthetic `click` events within 450ms of a touch event.
  - Measures touch movement: gestures with `> 8px` displacement are treated as scrolling and do not trigger selection changes.
  - `onMouseLeave` resets only `hoveredPlayerId`, never clearing persistent `selectedPlayerId`.

### 3.4 Episode Stepper Navigation
- Retain the responsive episode navigation controls (`< Episode N >`) in the header.
- Switching episodes updates both the chart bars and the "All Events" breakdown list for the newly selected episode.
- If a contestant is locked when switching episodes, their selection persists for the new episode, displaying their events for that new episode (or "No scoring events" if none occurred).

---

## 4. Technical Specifications & Data Mapping

### 4.1 Component Props Contract
`TeamEventStackedBarChart` receives:
```javascript
{
  roster: Array<Player>,            // Team's drafted castaways
  scores: Object,                   // Filtered scores by episode (activeScores)
  draftState: Object,               // Draft & backfill metadata
  eliminationOrder: Object          // Elimination episode per contestant
}
```

### 4.2 Event Extraction & Aggregation
For each episode `ep` and each contestant `player.id`:
- Aggregate all point scoring events from `scores[player.id][ep]`.
- Check elimination placement bonus / penalty from `eliminationOrder[player.id]`.
- Structure each event:
  ```javascript
  {
    id: string,
    playerId: string,
    playerName: string,
    category: string,
    points: number,
    color: string,
    note: string
  }
  ```
- Calculate:
  - `contestantEpisodeEvents`: Array of events for the active contestant.
  - `teamEpisodeEvents`: Array of all events across all contestants for that episode.
  - `contestantNetPoints`: Sum of positive and negative points.
  - `teamNetPoints`: Sum of all contestant points for the episode.

---

## 5. Acceptance Criteria

- [ ] **Generous Hit Targets**: Hovering or tapping anywhere on a contestant's column (bars, points, or name) activates that contestant.
- [ ] **All Events Displayed**: Selecting a contestant displays *every* scoring event (positive, negative, placement bonuses, notes) for that contestant in that episode in a clean card list.
- [ ] **Default All-Team Events**: When no contestant is selected, the panel displays all scoring events for the entire team in the selected episode.
- [ ] **Sticky Mobile Tapping**: Tapping a contestant on mobile keeps their events displayed continuously.
- [ ] **Untap Capability**: Tapping the selected contestant a second time untaps them, returning to the All-Team overview.
- [ ] **Switching Contestants**: Tapping another contestant immediately switches to that contestant's events.
- [ ] **Zero Live Data Writes**: All test and dev interactions are strictly read-only or routed to `dev_testing/`.
- [ ] **Automated Test Coverage**: Automated integration tests verify component mounting, event rendering, and selection toggles.
