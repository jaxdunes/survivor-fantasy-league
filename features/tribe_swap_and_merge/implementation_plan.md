# Implementation Plan: Dynamic Tribe Swap, Merge & Custom Tribe Management

**Target Branch**: `main` (merged from `feature/tribe-swap-and-merge`)  
**Location**: `features/tribe_swap_and_merge/implementation_plan.md`  
**Status**: Completed & Merged into `main` (Commit: `0f3f29c`)  

---

> [!NOTE]
> **Implementation Complete**: All feature phases, season-wide propagation, UI refinements, and testing directives have been executed and merged into `main`.
> 
> **Live Data Safety Directive**: All testing must be conducted strictly using isolated test datasets (`dev_testing/` database path under local dev environment). Live production database instances must remain untouched.

---

## Technical Architecture & Core System Changes

```
┌─────────────────────────────────────────────────────────────────────────┐
│              Global Season Data Node (seasons/{seasonId})               │
│              Single Source of Truth Across All Leagues                  │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Single Player    │       │ On-the-Fly       │       │ Drag & Drop      │
│ Tribe Switch     │       │ Custom Tribes    │       │ Bulk Tribe Edit  │
│ - draft.html ONLY│       │ - Name & Primary │       │ - HTML5 Drag/Drop│
│ - Smart Ep Default│      │   Color Palette  │       │ - Shape Cards    │
│ - Ep Guard       │       │ - Dynamic UI     │       │ - Commit on Save │
└──────────────────┘       └──────────────────┘       └──────────────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     ▼
                     ┌───────────────────────────────┐
                     │ Multi-League Propagation      │
                     │ - Realtime Firebase listener  │
                     │   on seasons/{seasonId}       │
                     │ - Updates Jackson/Ryan League │
                     │ - Updates Jordan/Denver League│
                     │ - dev_testing/ Isolation Guard│
                     └───────────────────────────────┘
```

---

## Phase 1: Database Isolation & Season-Level Test Setup

### Step 1.1: Verify Local Dev Environment Guard
- Confirm `IS_DEV_ENV` check in `js/config.js` properly redirects all Firebase Realtime Database queries to `dev_testing/` when running on `localhost` or `127.0.0.1`.
- Ensure visible indicator (`🧪 DEV MODE`) appears on UI.

### Step 1.2: Global Season Path & Test Dataset Setup
- Store `tribeHistory` and `customTribes` at the season root node `seasons/{seasonId}` (and test fixture `seasons/season-51-test.json`).
- Verify that all active fantasy leagues (`jackson-ryan-league`, `jordan-denver-league`, etc.) subscribe to and read contestant tribe data from `seasons/{seasonId}/contestants`.

---

## Phase 2: Schema & Utility Function Extensions (`js/scoring-engine.js` / `js/api.js`)

### Step 2.1: Add `tribeHistory` Support & Smart Episode Defaulting
- Add helper function `getTribeForEpisode(player, episodeNumber)`:
  - Iterates over `player.tribeHistory` sorted by `episode`.
  - Returns the tribe assigned for the highest `episode <= episodeNumber`.
  - Fallbacks to `player.tribe` or `player.startingTribe` for legacy records.
- Add helper function `getSmartDefaultEpisode(seasonId)`:
  - Checks current active scoring episode in tracker.
  - If no active episode is being scored, returns `lastScoredEpisode + 1` (defaulting to 1 if no episodes scored yet).

### Step 2.2: Add Season-Wide Custom Tribe Handler
- Add `addCustomTribe(seasonId, tribeName, colorKey, emoji)`:
  - Generates custom tribe object with primary color styles (Yellow 🟡, Purple 🟣, Blue 🔵, Green 🟢, Red 🔴, Orange 🟠, Pink 🩷, Black 🖤).
  - Persists custom tribe to `customTribes` array at global season path (`dev_testing/seasons/{seasonId}/customTribes`).
  - Broadcasts update to all leagues playing `seasonId`.

### Step 2.3: Idempotent Merge Point Reward Handler
- Add `awardMergePointsIfNeeded(seasonId, episodeNumber, activePlayers)`:
  - Scopes to active, non-eliminated players as of `episodeNumber`.
  - Retrieves Merge point value directly from the active universe of scoring event rules (`SCORING_CATEGORIES.merge.points` or season rules).
  - For each player shifted to the Merge tribe, checks if a scoring event with `category: "Merge"` already exists in `episodeNumber` log.
  - If not present, inserts point entry (`points: mergeVal`, `category: "Merge"`, `description: "Merged Tribe Bonus"`).

---

## Phase 3: Player Card UI Extensions (`draft.html` Only)

### Step 3.1: Edit Tribe Button on `draft.html` Player Cards
- Render a sleek edit button (✏️) **exclusively on player cards in `draft.html`** (not on `index.html`).
- Include global scope badge notifying users that edits apply season-wide.
- Clicking opens `#edit-player-tribe-modal`.

### Step 3.2: Single Player Edit Tribe Modal
- Form fields:
  - Player Info Header (Name, Avatar, Current Tribe).
  - Episode Dropdown (`Episode 1` .. `Episode 14`) defaulting via `getSmartDefaultEpisode()`.
  - Tribe Selector Dropdown (Lists Starting Tribes, Custom Tribes, Merge Tribe, and `➕ Add New Tribe...`).
- Selecting `➕ Add New Tribe...` opens the **Add Custom Tribe** sub-modal.
- **Save Action**: Appends entry to `tribeHistory` (`type: "Tribe Swap"` or `"Merged"`) under `seasons/{seasonId}` and re-renders UI across leagues.

---

## Phase 4: Drag & Drop Visual Bulk Tribe Edit Screen ("Edit Tribes")

### Step 4.1: "Edit Tribes" Toolbar Button & Modal
- Add an **"Edit Tribes"** primary button in header/admin control bar.
- Opens full-screen `#bulk-tribe-edit-modal`.

### Step 4.2: Drag & Drop Shape Container Layout & Player Buttons
- Render tribe containers as distinct CSS-styled shape cards with background gradients and borders matching each tribe's primary color.
- Always include the **Merge Tribe** container with distinct merge styling (Black/Gold 🖤🏆).
- Render each player as a draggable button (`draggable="true"`) inside their current tribe shape.
- Implement HTML5 Drag and Drop event handlers (`dragstart`, `dragover`, `drop`):
  - Dragging a player button over a tribe shape container highlights the drop target.
  - Dropping moves the player button into the target container visually (transient local state).
- **"Save Changes" Button**: Persists the updated tribe assignments to `seasons/{seasonId}` for all modified players.

### Step 4.3: "Merge All Players" Execution & Player List Confirmation Modal
- Place prominent **"Merge All Players"** button on the bulk screen.
- Triggers modal:  
  > ⚠️ **Confirm Merge**: *Merge all remaining active players into the Merge Tribe starting Episode X? This change will reflect across all leagues running this season.*
- **Roster Disclosure**: Displays list/chips of **all active players about to be merged**.
- Upon confirmation:
  - Updates `tribeHistory` (`type: "Merged"`) for all active non-eliminated players as of target episode in season data.
  - Invokes `awardMergePointsIfNeeded(seasonId, targetEpisode)` using active Merge point value.
  - Re-renders bulk view and player cards for all leagues.

---

## Phase 5: Dynamic Multi-League Propagation & Player Card Timelines

### Step 5.1: Multi-League Realtime Propagation
- Attach Realtime Firebase event listener to `seasons/{seasonId}/contestants` and `customTribes`.
- When tribe data changes, dynamically refresh roster views, tribe dropdowns, and "Add Points" grids in all active leagues without requiring page reloads.

### Step 5.2: Player Card Episode Event Badges
- Add a timeline drawer under player cards rendering tribe history events:
  - E.g. `Ep 1: Savu` ➔ `Ep 3: Tribe Swap to Toka 🔄` ➔ `Ep 7: Merged (+1 pt)`.

---

## Verification & Testing Plan

### Isolated Multi-League Test Procedure:
1. **Database Isolation Check**: Launch app in local dev server (`http://localhost:8000`). Confirm `🧪 DEV MODE` banner is active.
2. **Multi-League Propagation Test**:
   - Open League A (`jackson-ryan-league`) in Tab 1 and League B (`jordan-denver-league`) in Tab 2.
   - On `draft.html` in Tab 1, edit Carter Krull's tribe to Toka on Episode 3. Save.
   - Switch to Tab 2 (League B) and verify Carter Krull's tribe automatically shows Toka on Episode 3.
3. **Draft.html Scope Check**: Confirm Edit button appears ONLY on `draft.html` player cards.
4. **Smart Episode Default Check**: Verify episode dropdown defaults to active scoring episode or `lastScoredEpisode + 1`.
5. **Custom Tribe Test**: Click Edit Tribe -> Add New Tribe. Name: "Vatu", Color: Emerald Green 🟢. Save.
   - Verify "Vatu" appears in tribe filter dropdowns and "Add Points" grid in both League A and League B.
6. **Drag & Drop Bulk Edit Test**: Open "Edit Tribes". Drag player buttons into new tribe shapes. Click "Save Changes". Verify changes reflect across leagues.
7. **Bulk Merge & Roster Disclosure Test**: Click "Merge All Players". Verify confirmation modal lists all active players to be merged. Confirm.
   - Verify all active players shift into Merge container across all leagues.
   - Verify Merge points are awarded based on active scoring event rules under score log.
   - Verify event badge reads `Merged`.
8. **Live Data Audit**: Inspect production database node to confirm 0 changes made to production state.

---

## Execution Summary & Delivered Feature Set

All phases of this implementation plan have been completed and verified:

1. **Global Season-Wide Data Architecture**:
   - `tribeHistory` and `customTribes` are persisted directly under `seasons/{seasonId}` in Firebase Realtime Database and synced across all leagues via `seasonRef.on('value')`.
2. **Pure Engine Utilities (`js/scoring-engine.js`)**:
   - Implemented `getTribeForEpisode(player, epNum)` to resolve episode-specific tribe membership.
   - Implemented `getPlayerTribeProgression(player)` to build structured event timeline histories.
   - Implemented `getSmartDefaultEpisode(...)` to auto-select current active or next scoring episode.
   - Implemented `getTribeStyle(...)` and `getTribeDotColor(...)` for consistent tribe color dots.
3. **Single Player Edit Tribe Modal (`draft.html`)**:
   - Created `#edit-player-tribe-modal` with live styled tribe badge preview and episode selection.
   - Added duplicate swap validation guard preventing no-op saves (e.g. Savu ➔ Savu).
4. **Visual Drag & Drop Bulk Tribe Reorganization (`draft.html`)**:
   - Created full-screen visual bulk edit modal with draggable player buttons and styled tribe shape containers.
   - Added styled `"Unassigned"` tribe container (`bg-slate-950/40 border border-slate-800/80`).
   - Added 1-click **"Merge All Players"** button with confirmation modal listing all active players and automatic merge point awards.
5. **Player Card Timeline Drawer & Deletion**:
   - Rendered "Episode History & Timeline" drawer inside player cards.
   - Added red `✕` delete buttons per event allowing deletion of any tribe event (including starting tribe, which resets player to `Unassigned`).
6. **Add Points Menu Sync (`index.html`)**:
   - Grouped player selection into tribe buckets dynamically via `getTribeForEpisode(player, selectedEpisode)`.
   - Updated individual player button badges to evaluate `getTribeForEpisode(player, selectedEpisode)`.
