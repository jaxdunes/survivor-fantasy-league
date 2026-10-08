# Product Requirements Document (PRD): Dynamic Tribe Swap, Merge & Custom Tribe Management

**Version**: 1.2 (Season-Wide Propagation Update)  
**Status**: Pending Final Review  
**Location**: `features/tribe_swap_and_merge/prd.md`  
**Target Files**: `js/scoring-engine.js`, `js/api.js`, `js/config.js`, `draft.html`, `seasons/season-51.json`  
**Git Branch**: `feature/tribe-swap-and-merge`  

---

## 1. Executive Summary & Core Objectives

The **Dynamic Tribe Swap, Merge & Custom Tribe Management** feature brings full episode-aware tribe management to the Survivor Fantasy League application. In Survivor, tribes shift frequently through tribe swaps (e.g., expanding from 2 to 3 tribes), individual player swaps, and the iconic Merge event. 

This feature enables league admins and users to seamlessly update player tribe affiliations for specific episodes without affecting past episode scoring, historical roster records, or previous point breakdowns.

### Core Objectives:
1. **Season-Wide Propagation Across All Leagues**: Tribe assignments, tribe swaps, merges, and custom tribes are bound to the core **Season dataset** (e.g., `seasons/season-51`). Any tribe swap or merge performed in one league automatically reflects across **all leagues** participating in that season.
2. **Episode-Aware Tribe Swaps**: Allow individual player tribe swaps on `draft.html` specifying the exact starting episode (e.g., Carter switching tribes on Episode 3). Past episode scores and tribe affiliations remain untouched.
3. **Custom Tribe Creation on the Fly**: Allow users to create new tribes (e.g., when the game expands from 2 to 3 tribes) with custom names and primary color themes. Newly created tribes immediately populate across all dropdowns, filters, and the "Add Points" tribe-grouped interface for all leagues running that season.
4. **Visual Drag & Drop Bulk Tribe Management**: Provide an interactive "Edit Tribes" visual dashboard where users drag and drop player name buttons into styled shape containers representing each tribe, committing all changes on "Save".
5. **Automated Merge Execution & Points**: Include a permanent "Merge Tribe" container and a 1-click **"Merge All Players"** button (with safety confirmation listing all players to be merged) that shifts all remaining active players to the Merge tribe starting at a selected episode and automatically awards Merge Points based on the scoring system's active Merge point rule across leagues.
6. **Historical Timeline on Player Cards**: Display tribe movement event badges on player cards detailing episode-by-episode tribe history (`Merged` for merge events, `Tribe Swap` for all other tribe switches).
7. **Strict Database Isolation**: Ensure all development, manual testing, and automated tests run exclusively against isolated test datasets (`dev_testing/` namespace in Firebase / test JSON fixture) to guarantee production live data is never mutated.

---

## 2. Safety & Data Isolation Requirements

> [!IMPORTANT]
> **Imperative Live Data Protection**: Live database and production Firebase entries must NEVER be modified or contaminated during development or testing of this feature.

- **Dev/Test Environment Guard**: The application must automatically detect local development environments (`localhost` or `127.0.0.1`) and enforce the `dev_testing/` namespace prefix for all Firebase Realtime Database reads and writes (as managed by `wrapDatabaseInstance` in `js/config.js`).
- **Test Dataset Fixture**: A dedicated test dataset (`seasons/season-51-test.json` or local memory draft) will be used during feature verification.
- **Production Guard Banner**: A prominent UI indicator will display `🧪 DEV MODE | Firebase Path: dev_testing/` during local testing to confirm isolation.

---

## 3. Data Schema Specifications & Season-Level Architecture

To guarantee season-wide consistency across all leagues, tribe history and custom tribes are stored at the **Season Node** level (`seasons/{seasonId}`), rather than inside league-specific configurations. When any league views contestant data, it fetches from the global season state.

```json
{
  "id": 7,
  "name": "Carter Krull",
  "startingTribe": "Savu",
  "tribe": "Savu",
  "tribeHistory": [
    { "episode": 1, "tribe": "Savu", "type": "Initial" },
    { "episode": 3, "tribe": "Toka", "type": "Tribe Swap" },
    { "episode": 7, "tribe": "Kalo (Merge)", "type": "Merged" }
  ]
}
```

### Dynamic Custom Tribes Schema (Season Node)
```json
{
  "seasonId": "season-51",
  "customTribes": [
    {
      "id": "tribe-vatu",
      "name": "Vatu",
      "color": "emerald",
      "badgeBg": "bg-emerald-100",
      "badgeText": "text-emerald-900",
      "badgeBorder": "border-emerald-300",
      "gradient": "from-emerald-500 to-teal-600",
      "icon": "🌿"
    }
  ]
}
```

---

## 4. UI & Functional Specifications

### 4.1 Individual Player Card Tribe Switch (`draft.html` Only)
- **Edit Button Scope**: The Edit icon/button (✏️) appears **exclusively on player cards on `draft.html`** (not on `index.html`).
- **Season-Wide Scope Notice**: Displays a clear badge: *"Note: Tribe changes apply globally to all leagues playing Season X."*
- **Edit Tribe Modal**:
  - Displays current player name and photo.
  - **Episode Selector Default**: Automatically defaults to:
    - The episode that is currently **actively being scored**, OR
    - If no episode is currently being scored, defaults to **the episode immediately after the last fully scored episode** (`lastScoredEpisode + 1`).
  - **Tribe Dropdown**: Lists all active tribes for the season + permanent Merge option + **"➕ Add New Tribe..."** option.
  - **Historical Impact Warning**: Clearly states: *"Tribe assignment for episodes prior to Episode X will remain unchanged."*
  - **Save Button**: Updates `tribeHistory` at the season level and broadcasts/refreshes UI across all active league views.

### 4.2 On-the-Fly Custom Tribe Creation
- Selecting **"➕ Add New Tribe..."** in any tribe dropdown opens the **Add New Tribe** dialog:
  - **Tribe Name**: Input field (e.g. "Vatu", "Exile").
  - **Tribe Color**: Palette selection from standard primary colors (Yellow 🟡, Purple 🟣, Blue 🔵, Green 🟢, Red 🔴, Orange 🟠, Pink 🩷, Black 🖤).
  - **Icon / Emoji**: Optional emoji picker/preset (☀️, ⚡, 🌊, 🌿, 🔥, 🌋, 🏝️).
- **Global Propagation**: Saving a new tribe adds it immediately to `customTribes` under the season node, updating:
  1. All tribe dropdowns across all leagues in the application.
  2. Main roster filters on `draft.html` and `index.html` for all leagues.
  3. The permanent tribe-grouped button grid on the **"Add Points"** screen for all leagues running that season.

### 4.3 Drag & Drop Visual Bulk Tribe Edit Screen ("Edit Tribes")
- **Header Button**: An **"Edit Tribes"** button in the header/toolbar opens the full-screen visual bulk edit modal.
- **Episode Selection**: Header dropdown to pick target episode for bulk tribe reorganization. Defaults to active scoring episode or `lastScoredEpisode + 1`.
- **Drag & Drop Shape Containers**:
  - Each tribe (Starting Tribes + Custom Tribes + **Merge Tribe**) is rendered as a distinct visual card/shape styled with its primary color theme.
  - Inside each tribe shape container: draggable player name buttons displaying player photo and name.
  - **Drag & Drop Interactivity**: Users can drag any player button and drop it into a different tribe shape container.
  - **Save Commit**: Changes are held in transient visual state and committed to global season state when the user clicks the **"Save Changes"** button.
  - **Add New Tribe Button**: Embedded button to create a new tribe container directly within the bulk view.

### 4.4 Merge Tribe & Automated 1-Click Merge
- **Merge Tribe Container**: The **Merge Tribe** is ALWAYS displayed as a standard tribe container option on the bulk screen.
- **"Merge All Players" Action Button**:
  - Prominent primary action button on the bulk screen.
  - Clicking triggers a confirmation modal:  
    > ⚠️ **Confirm Merge**: *Are you sure you want to merge all remaining active players into the Merge Tribe starting Episode X? This change will reflect across all leagues playing this season.*
  - **Player Roster Disclosure**: The confirmation modal **lists every player that is about to be merged** (all active non-eliminated players as of Episode X).
  - **Merge Point Valuation**:
    - Automatically checks the active scoring rules universe for the "Merge" category point value (e.g., +1 pt or configured value from the Add Points scoring rules).
    - Automatically awards this exact Merge point value to each merged player for Episode X in the score log (Idempotent: prevents duplicate points if executed multiple times).

### 4.5 Player Card Historical Timeline & Event Labels
- Each player card displays an **Episode Event Log / Tribe History** drawer.
- **Event Label Taxonomy**:
  - **"Merged"**: Explicitly reserved for the event where players are merged into the Merge tribe (e.g., `Ep 7: Merged`).
  - **"Tribe Swap"**: Applied to all other tribe change actions (e.g., `Ep 3: Tribe Swap to Toka`).

---

## 5. Architectural Critique & Design Enhancements

We have aligned with your preferences and refined the feature architecture:

| Feature Area | Requirements & Alignment | Resolution & Implementation Details |
| :--- | :--- | :--- |
| **Season-Wide Propagation** | Tribe swaps apply to all leagues playing that season. | **Enhancement**: Persist `tribeHistory` and `customTribes` at the global season path (`seasons/{seasonId}`). All league views query the single source of truth. |
| **Data Model** | Keep existing player data accurate while introducing episode history. | **Enhancement**: Introduce `tribeHistory` array while preserving `startingTribe` and legacy fallback fields. Episode 1-2 scores always evaluate against Episode 1-2 tribe. |
| **Drag & Drop UX** | Drag player buttons into tribe shape containers; commit on "Save". | **Enhancement**: Use HTML5 Drag and Drop API with smooth CSS drop targets. Visual state is local until "Save" button is clicked. |
| **Edit Button Scope** | Restrict single-player tribe edit function to `draft.html`. | **Enhancement**: Edit icon (✏️) is conditionally rendered ONLY inside player cards on `draft.html`. |
| **Episode Defaulting** | Default selector to active scoring episode or `lastScored + 1`. | **Enhancement**: Add `getSmartDefaultEpisode()` helper inspecting `scoringTracker` state. |
| **Confirm Merge Modal** | Explicitly list all active players about to be merged. | **Enhancement**: Confirm modal renders player chips of all active non-eliminated contestants scheduled for Merge. |
| **Merge Point Rule** | Pull point value from active scoring event universe. | **Enhancement**: Read `SCORING_CATEGORIES.merge.points` or active season scoring rules dynamically rather than hardcoding. |
| **Event Labeling** | Use "Merged" for merge, "Tribe Swap" for other changes. | **Enhancement**: Set event type to `"Merged"` or `"Tribe Swap"` in `tribeHistory` and display exact label on cards. |

---

## 6. Success Criteria & Verification Checklist

- [ ] Isolated test database (`dev_testing/`) verified during local testing; live data untouched.
- [ ] Tribe swap executed in one league automatically updates player tribe in all other leagues running that season.
- [ ] Single-player Edit button rendered ONLY on `draft.html` player cards.
- [ ] Episode dropdown defaults to active scoring episode or `lastScoredEpisode + 1`.
- [ ] Changing a player's tribe on Episode 3 updates `tribeHistory`, moving them starting Ep 3 while keeping Ep 1-2 unchanged.
- [ ] Custom Tribe creation (Name + Primary Color) updates all dropdowns, filters, and "Add Points" tribe grid instantly across all leagues.
- [ ] Drag & Drop visual bulk edit screen allows dragging player buttons between tribe shape containers and committing on "Save".
- [ ] "Merge All Players" button lists all players to be merged in confirmation modal and awards Merge points based on active scoring event rules.
- [ ] Player card event logs display `"Merged"` for merge events and `"Tribe Swap"` for other tribe changes.
