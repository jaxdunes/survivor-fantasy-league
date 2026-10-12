# Implementation Plan: Episode Catch-Up, In-Progress Live Scoring & Global Site-Wide Filter

**Target Branch**: `feature/episode-catchup-spoiler-filter`  
**Location**: `features/episode_catchup_spoiler_filter/implementation_plan.md`  
**Status**: Approved & Ready for Execution  
**Target Files**: `index.html`, `draft.html`, `chat.html`, `js/scoring-engine.js`, `js/config.js`, `js/episode-filter.js`  

---

> [!IMPORTANT]
> **Production Data Safety Directive**: All testing and verification steps must be conducted with isolated datasets under `dev_testing/` namespace or in an offline mock environment. Production Firebase data must remain strictly untouched.

---

## 1. Technical Architecture & Cross-Page State Model

To support universal episode selection across **all pages** (`index.html`, `draft.html`, `chat.html`), core filter logic and UI components will be organized in a modular shared file: [`js/episode-filter.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/js/episode-filter.js).

### 1.1 State Schema & Storage Synchronization
```javascript
// State stored in survivor_catchup_${seasonId} (Cookie + LocalStorage)
{
  "maxWatchedEpisode": 2,             // Furthest confirmed episode watched
  "viewingEpisode": 3,                // Current episode being inspected (or in-progress ep)
  "latestScoredEpisodeAtChoice": 3,   // Latest scored ep when user last made a choice
  "isLiveStreaming": true,            // True if viewing an in-progress episode
  "updatedAt": 1728750000000
}
```

- **Cross-Tab & Cross-Page Sync**:
  - `window.addEventListener('storage', ...)` notifies other open tabs and pages when the episode filter changes.
  - Custom DOM events `window.dispatchEvent(new CustomEvent('episodeFilterChanged', { detail }))` sync state in-memory across loaded components.

### 1.2 In-Progress Live Scoring Mechanism
1. **Firebase Listeners**:
   - `scoresRef.on('value')` and `eliminationRef.on('value')` remain active.
2. **Dynamic Streaming Filter**:
   - When `viewingEpisode === inProgressEpisode`: Newly entered points stream directly into total scores, graphs, and breakdowns in real time.
   - When `viewingEpisode < inProgressEpisode`: Newly entered points for `ep > viewingEpisode` are filtered out in memory, keeping viewers on past episodes 100% spoiler-free.
   - The global tracker bar dynamically updates the in-progress badge in real-time (`⚪ E3: Being Scored (N events)`), alerting all users that scoring is happening live.

---

## 2. Implementation Phases & Step-by-Step Breakdown

### Phase 1: Pure Scoring & Masking Engine Utilities (`js/scoring-engine.js`)
- **Step 1.1**: Implement `filterScoresByEpisode(scores, targetEpisode, allowInProgress)`:
  - Takes raw player scores and strips out all episode keys `ep > targetEpisode`.
  - When `allowInProgress` is true, includes live scores currently logged for `targetEpisode`.
- **Step 1.2**: Implement `filterEliminationsByEpisode(eliminationOrder, targetEpisode)`:
  - Takes elimination map `{ [playerId]: episodeNumber }` and removes entries where `eliminationOrder[id] > targetEpisode`.
- **Step 1.3**: Implement `filterWinnerByEpisode(winner, targetEpisode, finaleEpisode)`:
  - Suppresses winner bonus if `targetEpisode < finaleEpisode`.
- **Step 1.4**: Helper `computeEpisodeStatuses(scores, eliminationOrder, scoredEpisodes)`:
  - Returns status map for episodes 1..14: `completed` (✓), `in-progress` (⚪), or `unscored` (✗).

### Phase 2: Shared Filter Module (`js/episode-filter.js`)
- **Step 2.1**: State management methods:
  - `getCatchUpState(seasonId)` & `setCatchUpState(seasonId, data)` (Cookie + LocalStorage).
  - `evaluateCatchUpStatus(seasonId, currentStatuses)`: Evaluates if modal is needed, whether cookie is stale, and safe initial episode.
- **Step 2.2**: Reusable React Components:
  - `UniversalEpisodeTracker`: Renders the "Episodes Scored" bar with completed, in-progress (pulsing ⚪), unwatched, and disabled states.
  - `CatchUpEntranceModal`: Modal for first-time / stale season entry with "I'm Live!" CTA and earlier episode selector.
  - `SpoilerConfirmModal`: Confirmation prompt when attempting to scrub forward.
  - `HistoricalStatusBanner`: Header banner displaying `"⏳ Historical View: As of Episode N | [⚡ Jump to Live]"`.

### Phase 3: Integration into `index.html`
- **Step 3.1**: Include `js/episode-filter.js`.
- **Step 3.2**: Mount `UniversalEpisodeTracker` at top of leaderboard.
- **Step 3.3**: Connect `viewingEpisode` to:
  - `getTeamScore`, `leaderboard`, and parchment torches (`TorchLit` vs `TorchUnlit`).
  - `TeamScoreGraph` (charts truncated to `viewingEpisode`).
  - Live streaming updates when `viewingEpisode === inProgressEp`.

### Phase 4: Integration into `draft.html`
- **Step 4.1**: Include `js/episode-filter.js` and mount `UniversalEpisodeTracker` in draft board header.
- **Step 4.2**: Mask contestant elimination state (eliminated after `viewingEpisode` shows alive).
- **Step 4.3**: Mask backfilled drafted roster assignments: players backfilled in `ep > viewingEpisode` appear in draft pool, not on team rosters.

### Phase 5: Integration into `chat.html`
- **Step 5.1**: Include `js/episode-filter.js` and mount `UniversalEpisodeTracker` in chat header.
- **Step 5.2**: Render Spoiler Advisory Banner when `viewingEpisode < latestScoredEpisode`:
  > *"⚠️ Spoiler Advisory: You are viewing Episode N. Live chat messages may contain spoilers for later episodes."*
- **Step 5.3**: Render Live Scoring Banner when `viewingEpisode === inProgressEpisode`:
  > *"⚪ Live Scoring Active: Episode N is currently being scored."*

---

## 3. Test Cases & Verification Plan

### Test Environment Setup
- Tests run against isolated mock data in `dev_testing/` Firebase path.
- Mock scenario: Season 51 with Ep 1 & 2 completed, and Ep 3 currently in-progress.

### Test Matrix

| ID | Test Scenario | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **TC-1.1** | User views Episode 1 | Ep 2 & 3 points excluded; contestants eliminated in Ep 2 & 3 show **ALIVE** with lit torches. | Pending |
| **TC-1.2** | User views Episode 2 | Ep 2 points included; Ep 3 points excluded; Ep 3 eliminated contestant shows **ALIVE**. | Pending |
| **TC-1.3** | User views In-Progress Ep 3 | Enters Live Scoring Mode; Ep 3 scores stream in real-time as admin enters them; tracker shows pulsing `⚪ LIVE`. | Pending |
| **TC-1.4** | Live point entered while on Ep 2 | Admin adds point to Ep 3 in Firebase; user on Ep 2 sees Ep 3 tracker badge update to `⚪ (N+1)`, but team scores do NOT change (no spoiler leak). | Pending |
| **TC-2.1** | First visit to active season (no cookie) | Catch-Up Entrance Modal blocks view until user selects "I'm Live!" or an earlier episode. | Pending |
| **TC-2.2** | Select "I'm Live!" when Ep 3 in progress | Site renders Ep 3 live streaming mode; cookie updated to Ep 3. | Pending |
| **TC-3.1** | Return visit when Ep 4 starts being scored | Safe freeze holds view at prior watched episode (e.g. Ep 2); modal triggers to offer Ep 4. | Pending |
| **TC-4.1** | Scrubbing backward (Ep 3 down to Ep 1) | Instant switch to Ep 1 state; no confirmation dialog required; tracker highlights Ep 1. | Pending |
| **TC-4.2** | Scrubbing forward (Ep 1 up to Ep 2) | Spoiler warning modal appears: *"Confirm Episode 2?"*; clicking Cancel retains Ep 1. | Pending |
| **TC-5.1** | Non-selectable future episodes | Unscored episodes (e.g. Ep 5..14) are disabled and cannot be clicked. | Pending |
| **TC-6.1** | Cross-Page State: `index.html` to `draft.html` | Changing episode to Ep 1 on `index.html` persists when navigating to `draft.html`; draft displays Ep 1 state. | Pending |
| **TC-6.2** | Draft Board Backfill Masking | Player backfilled in Ep 3 appears unassigned when viewing Ep 1 or 2 on `draft.html`. | Pending |
| **TC-7.1** | Chat Spoiler Advisory Banner | When viewing Ep 1, `chat.html` renders yellow warning banner alerting user of potential spoilers in chat. | Pending |
| **TC-7.2** | Chat Live Scoring Banner | When viewing in-progress Ep 3, `chat.html` renders live scoring banner. | Pending |
