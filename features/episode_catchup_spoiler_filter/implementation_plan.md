# Implementation Plan: Episode Catch-Up & Spoiler Protection (Time-Travel Mode)

**Target Branch**: `feature/episode-catchup-spoiler-filter`  
**Location**: `features/episode_catchup_spoiler_filter/implementation_plan.md`  
**Status**: Approved & Ready for Execution  
**Target Files**: `index.html`, `js/scoring-engine.js`, `js/config.js`  

---

> [!IMPORTANT]
> **Production Data Safety Directive**: All testing and verification steps must be conducted with isolated datasets under `dev_testing/` namespace or in an offline mock environment. Production Firebase data must remain strictly untouched.

---

## 1. Technical Architecture & State Model

### 1.1 State Schema
In `index.html` (React root component):
```javascript
// Current episode being inspected across all visualizations and leaderboards
const [viewingEpisode, setViewingEpisode] = useState(null);

// Furthest episode confirmed watched by user during this session/cookie
const [maxConfirmedEpisode, setMaxConfirmedEpisode] = useState(null);

// Modal visibility states
const [showCatchUpEntranceModal, setShowCatchUpEntranceModal] = useState(false);
const [pendingConfirmEpisode, setPendingConfirmEpisode] = useState(null); // For spoiler prompt
```

### 1.2 Cookie & Storage Structure
Cookie Name: `survivor_catchup_${seasonId}` (with matching key in `localStorage` for cross-platform resilience).
```json
{
  "maxWatchedEpisode": 2,
  "latestScoredEpisodeAtChoice": 2,
  "isLive": false,
  "updatedAt": 1728750000000
}
```

**Invalidation Logic**:
```javascript
function evaluateCatchUpStatus(currentSeasonId, latestScoredEpisode) {
    const saved = getCatchUpCookie(currentSeasonId);
    if (!saved) {
        return { needsModal: true, initialEp: latestScoredEpisode };
    }
    // If commissioner scored a new episode since the user's last selection
    if (latestScoredEpisode > saved.latestScoredEpisodeAtChoice) {
        return { 
            needsModal: true, 
            initialEp: saved.maxWatchedEpisode, // Hold them safe at last known watched
            isStale: true 
        };
    }
    return { 
        needsModal: false, 
        initialEp: saved.maxWatchedEpisode 
    };
}
```

---

## 2. Implementation Phases & Step-by-Step Breakdown

### Phase 1: Pure Scoring & Masking Engine Utilities (`js/scoring-engine.js`)
- **Step 1.1**: Create `filterScoresByEpisode(scores, targetEpisode)`:
  - Takes raw player scores and strips out all episode keys `ep > targetEpisode`.
- **Step 1.2**: Create `filterEliminationsByEpisode(eliminationOrder, targetEpisode)`:
  - Takes elimination map `{ [playerId]: episodeNumber }` and removes entries where `eliminationOrder[id] > targetEpisode`.
- **Step 1.3**: Create `filterWinnerByEpisode(winner, targetEpisode, finaleEpisode)`:
  - Suppresses winner bonus if `targetEpisode < finaleEpisode`.
- **Step 1.4**: Helper `computeLatestScoredEpisode(scores, eliminationOrder, scoredEpisodes)`:
  - Accurately computes the highest episode number that has scored data or completed status.

### Phase 2: Cookie & Safe State Management (`js/config.js` or `index.html`)
- **Step 2.1**: Implement `setCatchUpCookie(seasonId, data)` and `getCatchUpCookie(seasonId)`:
  - Handles cookie creation with `SameSite=Lax; path=/; max-age=31536000`.
  - Fallback syncing to `localStorage`.
- **Step 2.2**: Implement real-time listener safeguard:
  - If a new episode is scored while user is on the site, prevent auto-updating live scores. Display a non-spoiler notification toast instead.

### Phase 3: UI Components in `index.html`
- **Step 3.1: First-Time Entrance Modal (`CatchUpEntranceModal`)**:
  - Tribal / parchment aesthetic matching Survivor theme.
  - Explains the season is active.
  - Prominent Primary Button: `"⚡ I'm Live! Take me to Episode X"`.
  - Scored Episode Box: Buttons for each earlier episode (`Episode 1`, `Episode 2`, ... up to `X-1`).
  - Stores selection in cookie and sets `viewingEpisode`.
- **Step 3.2: Episode Confirmation Prompt (`SpoilerConfirmModal`)**:
  - Intercepts clicks on episodes ahead of `maxConfirmedEpisode`.
  - Displays clear spoiler warning asking for explicit confirmation.
- **Step 3.3: Global `EpisodesScoredTracker` Updates**:
  - Episodes `1..viewingEpisode` render as **Lit Up / Active** (green/emerald).
  - Episodes `viewingEpisode+1 .. latestScoredEpisode` render as **Unwatched / Dimmed**.
  - Future unscored episodes render as **Disabled / Locked**.
  - Free backward scrubbing: Clicking an episode `<= maxConfirmedEpisode` switches view instantly without warning prompt.
- **Step 3.4: Visual Indicator Bar ("Historical View Banner")**:
  - When `viewingEpisode < latestScoredEpisode`, display a clean header pill/banner:
    `"⏳ Time-Travel View: As of Episode N | [⚡ Jump to Live (Episode X)]"`.

### Phase 4: System-Wide Integration in `index.html`
- **Step 4.1**: Feed masked `filteredScores` and `filteredEliminations` into:
  - `getTeamScore(teamId)`
  - `leaderboard` calculation
  - Roster card torches (`TorchLit` vs `TorchUnlit`)
  - Elimination bonus calculations
  - `playersByTribe` via `window.getTribeForEpisode(p, viewingEpisode)`
- **Step 4.2**: Feed `viewingEpisode` into `TeamScoreGraph`:
  - Main league charts (Cumulative, Weekly Gains, Rank Trajectory, Draft ROI) truncated to `viewingEpisode`.
  - Expanded team breakdown stacked bars truncated to `viewingEpisode`.

---

## 3. Test Cases & Verification Plan

### Test Environment Setup
- Tests run against isolated mock data in `dev_testing/` Firebase path.
- Mock scenario: Season 51 with 3 completed episodes:
  - Ep 1: Contestant A scores 15 pts, Contestant B eliminated (Ep 1).
  - Ep 2: Contestant C scores 10 pts, Contestant D eliminated (Ep 2).
  - Ep 3: Contestant A scores 10 pts, Contestant E eliminated (Ep 3).

### Test Matrix

| ID | Test Scenario | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **TC-1.1** | User views Episode 1 | Contestant D and E show **ALIVE** with lit torches; Ep 2 & 3 points are 0; Team scores only reflect Ep 1. | Pending |
| **TC-1.2** | User views Episode 2 | Contestant D shows **ELIMINATED** (unlit torch); Contestant E shows **ALIVE** (lit torch); Ep 3 points excluded. | Pending |
| **TC-1.3** | User views Episode 3 (Live) | Contestants B, D, and E all show eliminated; all points included. | Pending |
| **TC-2.1** | First visit to active season (no cookie) | Catch-Up Entrance Modal appears; background content blurred/shielded; user cannot see scores until selection made. | Pending |
| **TC-2.2** | Click "I'm Live! (Episode 3)" | Modal closes; site renders Episode 3; cookie set to `{ maxWatched: 3, latestScored: 3 }`. | Pending |
| **TC-2.3** | Select "Episode 1" in modal | Modal closes; site renders Episode 1; cookie set to `{ maxWatched: 1, latestScored: 3 }`. | Pending |
| **TC-3.1** | Return visit when no new episodes scored | Site loads directly into user's saved episode view without modal popping up. | Pending |
| **TC-3.2** | Return visit after Episode 4 is scored | Cookie detects `latestScored (4) > choice (3)`; modal triggers; site safely remains masked at Ep 1 or Ep 3 until user confirms. | Pending |
| **TC-4.1** | Scrubbing backward (Ep 3 down to Ep 1) | Instant switch to Ep 1 state; no confirmation dialog required; tracker highlights Ep 1. | Pending |
| **TC-4.2** | Scrubbing forward (Ep 1 up to Ep 2) | Spoiler warning modal appears: *"Confirm Episode 2?"*; clicking Cancel retains Ep 1; clicking Confirm advances to Ep 2. | Pending |
| **TC-5.1** | Non-selectable future episodes | Unscored episodes (e.g. Ep 5..14) are disabled and cannot be clicked. | Pending |
| **TC-6.1** | League Graph truncation | Main graph X-axis terminates at `viewingEpisode`; tooltip only contains scores up to `viewingEpisode`. | Pending |
