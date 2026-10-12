# Product Requirements Document (PRD): Episode Catch-Up, In-Progress Live Scoring & Global Site-Wide Filter

**Version**: 3.0 (Site-Wide & In-Progress Live Updates)  
**Status**: Approved & Ready for Execution  
**Target Branch**: `feature/episode-catchup-spoiler-filter`  
**Location**: `features/episode_catchup_spoiler_filter/prd.md`  
**Target Files**: `index.html`, `draft.html`, `chat.html`, `js/scoring-engine.js`, `js/config.js`, `js/episode-filter.js`  

---

## 1. Executive Summary & Core Objectives

The **Episode Catch-Up & Spoiler Protection** system empowers fantasy league participants to browse the entire website safely at their own pace, even if they have not yet watched the most recent episode(s) of Survivor. 

Furthermore, when an episode is **in the process of being scored live** by the commissioner:
- The in-progress episode is **fully selectable** from the global tracker.
- If a user selects viewing that in-progress episode, they enter **Live Scoring Mode**, streaming real-time updates and score events **immediately as they happen**.
- The Episode Selection Tracker bar is elevated into a **universal global component displayed across all pages of the site** (`index.html`, `draft.html`, `chat.html`), ensuring an unbroken, synchronized time-travel and spoiler-free experience.

---

## 2. Production Safety & Isolated Data Directive

> [!IMPORTANT]
> **Strict Data Isolation Directive**: All development, automated test cases, and manual verification MUST run in an isolated test environment using the `dev_testing/` Firebase namespace under `localhost`. Under no circumstances will live production Firebase nodes be modified or exposed during testing.

---

## 3. User Experience & Key Flows

### 3.1 First-Time Entrance Modal (Active Season)
When a user visits the site during an **active season** (e.g. `Season 51: Open Era`) and has no valid saved catch-up cookie/storage:
1. **Welcome & Spoiler Alert Screen**:
   - Explains that the season is currently in progress.
   - Instructs the user to select the latest episode they have personally watched to prevent unwanted spoilers.
2. **Action Options**:
   - **Primary CTA ("I'm live!")**: A prominent button labeled:
     `"⚡ I'm Live! Take me to the latest episode (Episode X)"`
     - If Episode X is completed, sets view to Episode X.
     - If Episode X is currently in progress / being scored, clearly indicates: `"⚡ I'm Live! Stream Episode X as it's scored"`.
   - **Secondary Selector ("Catch-Up Box")**:
     - Lists all scored episodes prior to the latest episode (e.g. `Episode 1`, `Episode 2`...).
     - Allows users behind on episodes to pick their safe checkpoint.
   - **Pre-Season Option ("I have not seen any episodes!")**:
     - Rendered in small text below the episode selector: `"I have not seen any episodes!"`.
     - Clicking this option sets the state to `viewingEpisode: 0` (Pre-Season state).
     - Renders the site completely free of scores (0 points for all teams and contestants), all contestants alive with starting tribes, all torches lit, and graph displaying Pre-Season prior to Episode 1, as if the season had not started yet.
3. **Cookie / Invalidation Rule**:
   - Stored in a browser cookie (and mirrored in `localStorage`) keyed by season: `survivor_catchup_${seasonId}`.
   - **Automatic Invalidation on New Score**: When commissioner scores a new episode (e.g. Episode X+1), the browser detects that `latestScoredEpisode > savedState.latestScoredAtChoice`. The cookie is marked expired, forcing the safe modal to appear again so the user is never accidentally spoiled on the new episode!
   - **Safe Freeze**: The underlying view remains safely frozen at their last confirmed episode until they make a choice.

### 3.2 In-Progress Episode Scoring & Live Streaming
When an episode is in the middle of being scored (`status: 'in-progress'` / points currently being entered):
1. **Selectable In-Progress Badge**:
   - The badge in the "Episodes Scored" bar is fully interactive and styled with a distinct live state: `⚪ E3 (Being Scored)` with an animated subtle pulse.
2. **Streaming Live Updates**:
   - When the user selects the in-progress episode, they enter **Live Scoring Mode**.
   - Firebase Realtime Database `on('value')` listeners immediately stream newly added points, confessional counts, immunity badges, and eliminations directly to the UI without requiring page refreshes.
3. **Spoiler Shield for Viewers on Earlier Episodes**:
   - If User A chooses Episode 2 while Episode 3 is actively being scored, all Episode 3 live stream updates are strictly filtered out of User A's view.
   - The tracker badge for Episode 3 updates in real-time to show `⚪ Being Scored (N points entered)` so User A knows an episode is being scored, but zero point details or eliminated contestants leak into their view.

### 3.3 Global Episode Scored Filter Bar (Universal Across All Pages)
The Episode Selection Tracker appears across **all pages** (`index.html`, `draft.html`, `chat.html`), serving as the persistent filter:
1. **Visual State of Badges**:
   - Episodes up to the selected episode: **Lit Up / Active** (green/emerald highlight).
   - In-Progress episode (if viewing): **Pulsing Live Indicator** (cyan/emerald glow with `⚪ LIVE`).
   - Episodes between selected episode and latest scored: **Available / Unwatched** (dimmed neutral).
   - Episodes not yet aired or unscored: **Disabled / Locked** (`✗ Unscored`, non-clickable).
2. **Cumulative Selection Model**:
   - Watching Episode 3 implies Episodes 1, 2, and 3 have been watched.
   - Selecting Episode 3 lights up 1, 2, and 3. Disjoint selection is prohibited.
3. **Progressive Confirmation (Spoiler Guard)**:
   - When a user clicks an episode that is **further ahead** than their current confirmed checkpoint, a confirmation dialog appears:
     > *"⚠️ Spoiler Warning: Confirm Episode X? This will reveal scores, tribe changes, and tribal council eliminations through Episode X."*
   - Once confirmed, the checkpoint advances to Episode X.
4. **Historical Scrubbing (Backward Navigation)**:
   - If a user has confirmed watching up to Episode 3, they may freely click Episode 1 or 2 to view historical standings without re-triggering confirmation warnings.
5. **Cross-Page & Cross-Tab Synchronization**:
   - Episode selection is synchronized across pages and open browser tabs via `storage` events and shared cookie/localStorage.

---

## 4. Multi-Page State Masking Specifications

When viewing Episode `N`:

### 4.1 Leaderboard & Dashboard (`index.html`)
| Component / Data Element | Live Behavior | Filtered Behavior (Episode N) |
| :--- | :--- | :--- |
| **Team Total Scores** | Sum of all scored episodes (1..Latest) | Sum of episode scores for `ep <= N` |
| **In-Progress Points** | Excluded unless viewing in-progress ep | Streams live if `N == inProgressEp` |
| **Player Episode Breakdown** | All episodes listed | Episodes `> N` omitted |
| **Elimination Status** | Eliminated if in `eliminationOrder` | If `eliminatedEp > N`, treated as **ALIVE** |
| **Torch SVG Icon** | Unlit torch + smoke if eliminated | Lit glowing torch if `eliminatedEp > N` |
| **Elimination Points Bonus** | Added to team score if eliminated | Only added if `eliminatedEp <= N` |
| **Winner Bonus (+20 pts)** | Added if winner declared | Masked (0 pts) if finale not reached in `N` |
| **Tribe Membership** | Current or latest tribe | Tribe as of Episode `N` via `getTribeForEpisode(p, N)` |
| **Main League Graph** | Plotted through Latest Episode | X-axis and data points cut off at Episode `N` |
| **Expanded Event Breakdown** | Shows all episode event bars | Only renders episode bars for `ep <= N` |

### 4.2 Draft Board (`draft.html`)
| Component / Data Element | Live Behavior | Filtered Behavior (Episode N) |
| :--- | :--- | :--- |
| **Episode Tracker Bar** | Not present | Rendered at top of draft board |
| **Contestant Alive/Eliminated** | Shows current season elimination state | Shows contestant alive if `eliminatedEp > N` |
| **Backfilled Roster Assignments** | Shows all backfilled players | Only shows backfill if `backfillEp <= N` |
| **Eliminated Card Styling** | Red strikethrough & unlit torch | Lit torch and active styling if `eliminatedEp > N` |

### 4.3 League Chat (`chat.html`)
| Component / Data Element | Live Behavior | Filtered Behavior (Episode N) |
| :--- | :--- | :--- |
| **Episode Tracker Bar** | Not present | Rendered at top of chat |
| **Spoiler Advisory Banner** | None | If `N < latestScored`: Prominent warning banner: *"⚠️ You are viewing Episode N. Live chat messages may contain spoilers for later episodes."* |
| **Live Scoring Banner** | None | If `N == inProgressEp`: *"⚪ Live Scoring Active: Episode N is currently being scored."* |

---

## 5. Technical Architecture & Cross-Page Integration

```
                         ┌──────────────────────────────────────┐
                         │   Shared Module: js/episode-filter.js │
                         └──────────────────────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
         ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
         │     index.html      │ │     draft.html      │ │      chat.html      │
         ├─────────────────────┤ ├─────────────────────┤ ├─────────────────────┤
         │ • Global Tracker    │ │ • Global Tracker    │ │ • Global Tracker    │
         │ • Catch-Up Modal    │ │ • Roster Backfills  │ │ • Spoiler Advisory  │
         │ • Live Streaming Ep │ │ • Active Torches    │ │ • Live Score Banner │
         │ • Truncated Charts  │ │                     │ │                     │
         └─────────────────────┘ └─────────────────────┘ └─────────────────────┘
                                            ▲
                                            │
                          ┌─────────────────┴─────────────────┐
                          │ Cookie / LocalStorage Sync Engine  │
                          │   survivor_catchup_${seasonId}     │
                          └───────────────────────────────────┘
```

---

## 6. Success Metrics & Non-Functional Requirements

1. **Zero Spoiler Leakage**: An eliminated player's name, torch, or points must never leak into views prior to their elimination episode.
2. **Instant Live Stream Reactivity**: When viewing an in-progress episode, updates from Firebase must reflect in the UI immediately without manual page refreshes.
3. **Seamless Cross-Page Experience**: The episode selector appears consistently across all pages, with view state preserved when moving between pages.
4. **Cookie & Storage Reliability**: Persists across tabs and reloads; safely synchronizes via `storage` events.
5. **Safety from Live Airings**: Automatic cache bust / cookie invalidation as soon as a new episode begins scoring in Firebase.
