# Product Requirements Document (PRD): Season-Aware Scoring & "Gets Votes and Survives" Dynamic Vote Calculation

**Feature Name**: Season-Aware Scoring & "Gets Votes and Survives" Dynamic Vote Calculation  
**Status**: Completed  
**Location**: `features/gets_votes_and_survives_scoring/prd.md`  
**Target Files**: `index.html`, `seasons/season-50.json`, `seasons/season-51.json`  
**Git Branch**: `features/gets-votes-and-survives-scoring`  
**Safety Classification**: 🔒 **Strict Data Isolation** — Test Data Only, Zero Live Production Data Writes  

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
1. **Hardcoded Global Scoring System**: Currently in [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html), the master array of scoring events and point values (`scoringCategories`) is statically defined at the application level. It is shared globally across all seasons. If rules change between seasons, the app has no mechanism to present season-specific scoring rules, nor can a new season customize its scoring independently without affecting past seasons.
2. **"Gets Votes and Survives" Manual Overhead & Rule Change**:
   - For Season 51, the value of each vote received and survived at Tribal Council is updated from `0.5` points to **`1 point per vote`**.
   - Currently, the commissioner must calculate points outside the application and manually override the points input box in the Add Points modal.
   - There is no dedicated input field for `# of Votes Received` or automatic point calculation display.

### 1.2 Solution & Objectives
1. **Architect Season-Aware Scoring**:
   - Make scoring categories and point values unique to each season.
   - Store baseline rules per season in `seasons/[season-id].json` and synchronize with Firebase `seasons/[season-id]/scoringCategories`.
   - **Inheritance for New Seasons**: When a new season is initialized or loaded without custom scoring defined, it automatically inherits the complete scoring rules from the immediately preceding season (e.g. Season 52 inherits Season 51's rules) as its initial baseline, while keeping its scoring independently tracked and editable.
   - Historical Season 50 retains its original `0.5` points rule, while Season 51 uses the new `1.0` point per vote rule.
2. **Conditional Dynamic UI for "Gets Votes and Survives"**:
   - In the Add Points modal, selecting the event **"Gets Votes and Survives"** reveals a specialized card below the Scoring Category selector.
   - Input box for **"# of Votes Received"** with rapid touch buttons (`1`, `2`, `3`, `4`, `5+`).
   - Live visual calculation display: `🧮 Points Calculated: [N] vote(s) × 1 pt = [N] pts`.
   - Automatically synchronizes with the points field in real-time.
   - Validates that votes received is entered and `>= 1` prior to submission.

---

## 2. Safety & Data Isolation Directive

> [!CRITICAL]
> **Live Production Data Protection**: All development, automated checks, and manual verification MUST run in an isolated test environment using the `dev_testing/` Firebase namespace under `localhost:8000`. Live production Firebase nodes (`leagues/`, `seasons/`) must remain completely untouched.

- **Dev/Test Environment Guard**: The application automatically prefixes all Firebase Realtime Database reads and writes under `dev_testing/` (enforced via `wrapDatabaseInstance` in [`js/config.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/js/config.js)).
- **Production Guard Verification**: Verify the `🧪 DEV MODE | Firebase Path: dev_testing/` indicator is present in the UI during local testing.
- **Zero Live Mutations**: No modifications will be made to production Firebase nodes.

---

## 3. Detailed Functional Requirements

### 3.1 Season-Aware Scoring Architecture & Inheritance

1. **Season Baseline Storage**:
   - Each season preset JSON file (`seasons/season-50.json`, `seasons/season-51.json`, etc.) can specify an explicit `scoringCategories` array.
   - In Firebase: `seasons/${activeSeasonId}/scoringCategories` allows real-time rule synchronization per season.
2. **Previous-Season Inheritance Engine**:
   - When loading `activeSeasonId`:
     - **Step 1**: Check if `seasonData.scoringCategories` exists in Firebase or the season JSON. If yes, use it.
     - **Step 2**: If missing, look up the immediately preceding season:
       - Parse season numbers (e.g., `season-52` -> `season-51`; `season-51` -> `season-50`).
       - If previous season data has `scoringCategories`, inherit those rules as the starting baseline.
     - **Step 3**: If no previous season data is found, fall back to the global default baseline.
3. **Season Rule Isolation**:
   - **Season 50**:
     - `votes-survived` rule remains: `name: 'Gets Votes and Survives (0.5 × # of votes)'`, `points: 0.5`.
   - **Season 51**:
     - `votes-survived` rule is set to: `name: 'Gets Votes and Survives (1 pt per vote)'`, `points: 1`.
   - Switching between Season 50 and Season 51 dynamically updates both the **Scoring Rules** modal and the **Add Points** dropdown to reflect that season's active rules.

### 3.2 Dynamic Vote Calculation Interface in Add Points Modal

1. **Trigger Condition**:
   - Only appears when `selectedCategoryId === 'votes-survived'`.
   - When active, replaces the standard "Points" input box to eliminate duplicate fields.
2. **Compact 2-Column Side-by-Side Layout**:
   - Designed to be space-efficient without unnecessary padding, gradients, or banners.
   - Left Hand Side:
     - Label: `# of Votes Received` (standard `text-sm font-bold text-gray-700 mb-2`).
     - Large number input allowing direct keyboard entry (`min="1"`, `step="1"`, placeholder `e.g. 3`).
     - Standard input formatting matching all other modal inputs (`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-gray-900 bg-white`).
     - No preset chip buttons (removed `1, 2, 3, 4, 5` selectors).
   - Right Hand Side:
     - Label: `Points Awarded` (standard `text-sm font-bold text-gray-700 mb-2`).
     - Prominent display box showing the points to be awarded (e.g. `+3` or `+0` when empty), formatted in a matching border container (`px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center font-black text-xl text-green-700`).
3. **No Duplicate Points Box**:
   - The standalone standard "Points" input box is hidden when `votes-survived` is selected.
   - Points are synchronized to a hidden input `id="points-input"` so submission logic reads the calculated value directly without discrepancy.
4. **No Emojis**:
   - Strictly no emoji characters (`🗳️`, `🧮`, etc.) used in the component.
5. **Validation & Submit Behavior**:
   - When submitting:
     - Validates that `# of Votes Received` is entered and `>= 1`. Displays an alert if empty or invalid.
     - Confirms at least one castaway is selected (`selectedPlayerIds.length > 0`).
     - Points recorded match the calculated points.
   - On submission or modal cancel:
     - `# of Votes Received` state resets cleanly.

---

## 4. Test Data State Initialization Plan

To test this feature immediately on `localhost:8000` under `dev_testing/`:
1. **Season 51 Active Testing**:
   - URL: `http://localhost:8000/index.html?league=jackson-ryan-league&season=season-51`
   - Open **➕ ADD POINTS**, select a castaway and "Gets Votes and Survives (1 pt per vote)".
   - Enter `3` votes -> confirm Points field updates to `3`.
   - Submit -> confirm score event is saved in `dev_testing/` and reflected on leaderboard.
2. **Season 50 Historical Rule Verification**:
   - URL: `http://localhost:8000/index.html?league=jackson-ryan-league&season=season-50`
   - Open **📖 SCORING RULES** -> confirm Season 50 still displays `0.5 × # of votes` (+0.5 pts).
3. **Inheritance Test for New Season**:
   - Test that a hypothetical new season (e.g. `season-52`) without custom rules inherits Season 51's rules (1 pt per vote) as its default.

---

## 5. Acceptance Criteria

- [ ] Season-aware scoring categories resolved per season (`seasons/${seasonId}.json` & Firebase).
- [ ] New season inherits previous season's scoring rules by default if not explicitly defined.
- [ ] Season 50 retains original 0.5 pt rule; Season 51 uses 1.0 pt per vote rule.
- [ ] Selecting "Gets Votes and Survives" in Add Points modal reveals the dynamic `# of Votes Received` interface.
- [ ] Changing vote count dynamically calculates total points in real-time.
- [ ] Switching to another category hides the calculator and restores default points.
- [ ] Validation ensures votes received is >= 1 when this event is selected.
- [ ] Points submitted are properly assigned to selected castaway(s).
- [ ] 100% of data reads and writes remain strictly isolated under `dev_testing/`.
