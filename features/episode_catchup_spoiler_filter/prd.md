# Product Requirements Document (PRD): Episode Catch-Up & Spoiler Protection (Time-Travel Mode)

**Version**: 2.0 (Approved Design)  
**Status**: Approved & Ready for Execution  
**Target Branch**: `feature/episode-catchup-spoiler-filter`  
**Location**: `features/episode_catchup_spoiler_filter/prd.md`  
**Target Files**: `index.html`, `js/scoring-engine.js`, `js/config.js`  

---

## 1. Executive Summary & Purpose

The **Episode Catch-Up & Spoiler Protection** feature allows fantasy league participants to browse the website safely even if they have not yet watched the most recent episode(s) of Survivor, or are catching up week-by-week.

When a user selects a specific episode (e.g., Episode 2), the entire website enters an authentic **historical state** as of the *end* of that episode:
1. Total team scores, player point tallies, and weekly gains only include points up to that episode.
2. Castaways eliminated in future episodes (e.g., Episode 3+) appear **active, alive, and un-eliminated** (lit torches, no soot/smoke, no elimination bonus awarded).
3. Season winners or future milestones are completely masked.
4. League graphs and deep-dive analytics terminate at the selected episode.

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
     - Sets viewing episode to the latest scored episode.
     - Saves cookie indicating the user was live as of Episode X.
   - **Secondary Selector ("Catch-Up Box")**:
     - Lists all scored episodes prior to the latest episode (e.g. `Episode 1`, `Episode 2`...).
     - Allows users behind on episodes to pick their safe checkpoint.
3. **Cookie / Invalidation Rule**:
   - Stored in a browser cookie (and mirrored in `localStorage`) keyed by season: `survivor_catchup_${seasonId}`.
   - **Automatic Invalidation on New Score**: When commissioner scores a new episode (e.g. Episode X+1), the browser detects that `latestScoredEpisode > savedState.latestScoredAtChoice`. The cookie is marked expired, forcing the safe modal to appear again so the user is never accidentally spoiled on the new episode!

### 3.2 Global Episode Scored Filter Bar
The existing "Episodes Scored" bar at the top of the leaderboard transforms into a global time-travel filter:
1. **Visual State of Badges**:
   - Episodes up to the selected episode: **Lit Up / Active** (green/emerald highlight).
   - Episodes between selected episode and latest scored episode: **Available / Unwatched** (dimmed neutral or amber indicator).
   - Episodes not yet aired or unscored: **Disabled / Locked** (`✗ Unscored`, non-clickable).
2. **Cumulative Selection Model**:
   - Watching Episode 3 implies Episodes 1, 2, and 3 have been watched.
   - Selecting Episode 3 lights up 1, 2, and 3. Disjoint selection (e.g., watching 1 and 3 without 2) is prohibited.
3. **Progressive Confirmation (Spoiler Guard)**:
   - When a user clicks an episode that is **further ahead** than their current confirmed checkpoint, a confirmation dialog appears:
     > *"⚠️ Spoiler Warning: Confirm Episode X? This will reveal scores, tribe changes, and tribal council eliminations through Episode X."*
   - Once confirmed, the checkpoint advances to Episode X.
4. **Historical Scrubbing (Backward Navigation)**:
   - If a user has confirmed watching up to Episode 3, they may freely click Episode 1 or 2 to view historical standings without re-triggering confirmation warnings.

---

## 4. System-Wide State Masking Specifications

When viewing Episode `N`:

| Component / Data Element | Normal (Live) Behavior | Filtered Behavior (Episode N) |
| :--- | :--- | :--- |
| **Team Total Scores** | Sum of all scored episodes (1..Latest) | Sum of episode scores for `ep <= N` |
| **Player Episode Breakdown** | All episodes listed | Episodes `> N` omitted |
| **Elimination Status** | Eliminated if in `eliminationOrder` | If `eliminatedEp > N`, treated as **ALIVE** |
| **Torch SVG Icon** | Unlit torch + smoke if eliminated | Lit glowing torch if `eliminatedEp > N` |
| **Elimination Points Bonus** | Added to team score if eliminated | Only added if `eliminatedEp <= N` |
| **Winner Bonus (+20 pts)** | Added if winner declared | Masked (0 pts) if finale not reached in `N` |
| **Tribe Membership** | Current or latest tribe | Tribe as of Episode `N` via `getTribeForEpisode(p, N)` |
| **Main League Graph** | Plotted through Latest Episode | X-axis and data points cut off at Episode `N` |
| **Expanded Event Breakdown** | Shows all episode event bars | Only renders episode bars for `ep <= N` |
| **Admin Scoring Button** | Dedicated "Add Points" button | "Add Points" remains accessible to admins |

---

## 5. Technical Architecture & State Flow

```
                      ┌───────────────────────────────────────┐
                      │       User Visits Active Season       │
                      └───────────────────────────────────────┘
                                          │
                        Check Cookie: survivor_catchup_s51
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
            [ Valid & Up-to-Date ]                 [ Missing or Stale: ]
            latestScored == saved.maxScored         latestScored > saved.maxScored
                     │                                         │
                     │                                         ▼
                     │                        ┌─────────────────────────────────┐
                     │                        │    First-Time Catch-Up Modal    │
                     │                        │  - "I'm Live! (Episode X)"      │
                     │                        │  - List earlier scored episodes │
                     │                        └─────────────────────────────────┘
                     │                                         │
                     ├─────────────────────────────────────────┘
                     ▼
         ┌────────────────────────────────────────────────────────┐
         │              Global State: viewingEpisode = N          │
         └────────────────────────────────────────────────────────┘
                     │
       ┌─────────────┼────────────────────────┬──────────────────────┐
       ▼             ▼                        ▼                      ▼
┌──────────────┐ ┌───────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Leaderboard  │ │ Torch & Roster│  │ League Line &    │  │ Episode Scored   │
│ Filtered     │ │ Active/Elim   │  │ Bar Graphs       │  │ Tracker Bar      │
│ Score Calc   │ │ Masked at N   │  │ Truncated at N   │  │ 1..N Lit Up      │
└──────────────┘ └───────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 6. Success Metrics & Non-Functional Requirements

1. **Zero Spoiler Leakage**: An eliminated player's name, torch, or points must never leak into views prior to their elimination episode.
2. **Instant Reactive Switching**: Clicking between episodes should update the DOM seamlessly without full-page reloads.
3. **Cookie Reliability**: Persists across tabs and reloads; safely degrades to `localStorage` if cookies are disabled.
4. **Safety from Live Airings**: Automatic cache bust / cookie invalidation as soon as a new episode is scored in Firebase.
