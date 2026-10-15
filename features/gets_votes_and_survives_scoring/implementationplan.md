# Implementation Plan: Season-Aware Scoring & "Gets Votes and Survives" Dynamic Vote Calculation

**Feature Name**: Season-Aware Scoring & "Gets Votes and Survives" Dynamic Vote Calculation  
**Location**: `features/gets_votes_and_survives_scoring/implementationplan.md`  
**Status**: Completed  
**PRD Reference**: `features/gets_votes_and_survives_scoring/prd.md`  

---

## 1. Safety & Data Isolation Directive

> [!CRITICAL]
> **Production Data Safety Directive**: All testing must be conducted strictly using isolated test datasets (`dev_testing/` database path under local dev server on `http://localhost:8000`). Production database state must remain completely untouched.

---

## 2. Proposed Architectural Changes & Affected Files

### Target Files:
1. [`seasons/season-50.json`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/seasons/season-50.json): Add baseline `scoringCategories` array with Season 50's original rules (`votes-survived` = 0.5 pts).
2. [`seasons/season-51.json`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/seasons/season-51.json): Add baseline `scoringCategories` array with Season 51's updated rules (`votes-survived` = 1.0 pt per vote).
3. [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html):
   - **Default Scoring Categories Fallback**: Keep a master default array (`DEFAULT_SCORING_CATEGORIES`).
   - **Season-Aware Rule Resolution & Inheritance**:
     - Implement helper function `resolveSeasonScoringCategories(seasonId, seasonData)`:
       1. If `seasonData?.scoringCategories` exists (from Firebase or active season JSON), return it.
       2. If not, calculate previous season ID (e.g. `season-52` -> `season-51`, `season-51` -> `season-50`). Check cached/preset data for previous season and inherit its `scoringCategories`.
       3. Fall back to `DEFAULT_SCORING_CATEGORIES`.
     - In the main component, compute `scoringCategories` via `useMemo` based on `activeSeasonId` and `seasonData`:
       ```javascript
       const scoringCategories = useMemo(() => {
           return resolveSeasonScoringCategories(activeSeasonId, seasonData);
       }, [activeSeasonId, seasonData]);
       ```
   - **Season Data Sync Integration**:
     - In `applyMergedSeason()`, merge `scoringCategories` from preset, localStorage, and Firebase:
       ```javascript
       scoringCategories: fb.scoringCategories || localData?.scoringCategories || preset.scoringCategories || null
       ```
   - **"Gets Votes and Survives" Refined Compact Interface**:
     - State: `const [votesReceived, setVotesReceived] = useState('');`
     - When `showAddScore` is reset or category changes, reset `votesReceived`.
     - When `selectedCategoryId === 'votes-survived'`:
       - Render a compact 2-column grid (`grid grid-cols-2 gap-4 items-center`):
         - **Left Hand Side**:
           - Label: `# of Votes Received` (`text-sm font-bold text-gray-700 mb-2`).
           - Input: Number input matching standard modal inputs (`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-xl text-gray-900 bg-white`).
           - Direct keyboard entry only (no preset chip buttons).
         - **Right Hand Side**:
           - Label: `Points Awarded` (`text-sm font-bold text-gray-700 mb-2`).
           - Display: Large box matching modal input styling (`w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center font-black text-2xl text-green-700`).
           - Displays `+${pts}` (e.g. `+3`) or `+0` when empty.
       - Hidden input `id="points-input"` holds the calculated points so form submission logic works seamlessly.
       - Hide the standalone duplicate "Points" input box below when `selectedCategoryId === 'votes-survived'`.
       - Strictly no emojis.
   - **Validation & Points Submission Logic**:
     - When submitting:
       - If `selectedCategoryId === 'votes-survived'`: validate `# of Votes Received >= 1`.
       - Assign the calculated total points to all selected castaways.
       - Clear `votesReceived` state upon submit.

---

## 3. Test Data State Initialization Strategy

### Test Environment:
- Local URL: `http://localhost:8000/index.html?league=jackson-ryan-league&season=season-51`
- Dev Mode Banner: Active (`🧪 DEV MODE | Firebase Path: dev_testing/`)

### Test Scenarios:
1. **Season 51 Live Voting Score Test**:
   - Navigate to Season 51.
   - Open **Add Points**, pick a castaway (e.g., Q), select "Gets Votes and Survives (1 pt per vote)".
   - Enter `3` votes -> verify points auto-calculates to `3`.
   - Submit -> verify points entry saved under `dev_testing/` and reflected on leaderboard.
2. **Season 50 Rule Isolation Test**:
   - Switch to Season 50 (`?league=jackson-ryan-league&season=season-50`).
   - Open **Scoring Rules** modal -> confirm rule displays `0.5 × # of votes` (+0.5 pts).
3. **Inheritance Test for Next Season**:
   - Verify that loading a new season without custom scoring automatically inherits Season 51's rules as its starting default.

---

## 4. Phased Implementation Steps

### Phase 1: Interactive User Sign-Off (MANDATORY GATE)
- [x] Present updated PRD and Implementation Plan with season-aware architecture and previous-season inheritance to the user.
- [x] **STOP** and wait for explicit user continuation signal before writing any code.

### Phase 2: Season Data Configuration
- [x] Add `scoringCategories` array to `seasons/season-50.json` (with 0.5 pt rule).
- [x] Add `scoringCategories` array to `seasons/season-51.json` (with 1.0 pt per vote rule).

### Phase 3: Core Application Architecture (`index.html`)
- [x] Implement `resolveSeasonScoringCategories` with previous-season inheritance logic.
- [x] Wire `scoringCategories` as a season-aware `useMemo` hook in the React app.
- [x] Update `applyMergedSeason` to synchronize `scoringCategories` across JSON, localStorage, and Firebase.
- [x] Add `votesReceived` state and real-time point synchronization.
- [x] Build the conditional `# of Votes Received` calculator UI in the Add Points modal.
- [x] Add validation and submission handlers for the dynamic vote event.

### Phase 4: Verification & Walkthrough
- [x] Test on `http://localhost:8000` under `dev_testing/`.
- [x] Validate Season 51 dynamic calculation and castaway point assignment.
- [x] Validate Season 50 isolation and previous-season inheritance for new seasons.
- [x] Confirm zero modifications to live production Firebase paths.
- [x] Generate initial `features/gets_votes_and_survives_scoring/walkthrough.md`.

### Phase 5: UI Refinement & Verification (Current Gate)
- [x] Remove chip selectors (`1, 2, 3, 4, 5`) to allow direct numeric input only.
- [x] Implement compact 2-column side-by-side layout:
  - Left side: `# of Votes Received` big input box matching standard modal input styling.
  - Right side: `Points Awarded` big number display box.
- [x] Remove duplicate standard "Points" box when `votes-survived` is selected.
- [x] Remove all emojis from the interface.
- [x] Maintain consistent styling matching other modal inputs (`border-2 border-gray-300 rounded-xl focus:border-orange-500`).
- [x] Verify in browser under `dev_testing/` on `http://localhost:8000`.
- [x] Update `walkthrough.md` with new screenshots.
