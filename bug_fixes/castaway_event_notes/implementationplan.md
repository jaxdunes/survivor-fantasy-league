# Implementation Plan: Edit Castaway Event Notes in Open Team Card

**Location**: `bug_fixes/castaway_event_notes/implementationplan.md`  
**Status**: Completed  
**PRD Reference**: [`bug_fixes/castaway_event_notes/prd.md`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/bug_fixes/castaway_event_notes/prd.md)  
**Target Files**: [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html)  

---

## 1. Safety & Data Isolation Directive

> [!CRITICAL]
> **Production Data Safety Directive**: All testing must be conducted strictly using isolated test datasets (`dev_testing/` database path under local dev server on `localhost:8000` or `localhost:8085`). Production database state (`leagues/`, `seasons/`) must remain completely untouched.

- Development testing executes on `localhost` with the `🧪 DEV MODE | Firebase Path: dev_testing/` guard active.
- Verify `wrapDatabaseInstance` prefixes all reads and writes with `dev_testing/`.

---

## 2. Proposed Architectural Changes & Affected Files

### Target File: `index.html`

1. **State Management**:
   - Add state in the main React component:
     - `editingScoreId`: `string | null` (tracking which event's note is currently being edited).
     - `editingNoteValue`: `string` (storing the current in-progress text of the note input).
     - `isSavingNote`: `boolean` (to prevent duplicate submissions during network roundtrips).

2. **Data Model & Helper (`getPlayerBreakdown`)**:
   - In `getPlayerBreakdown` (lines ~3165-3195), ensure the raw score note from Firebase is exposed cleanly as `rawNote: score.note || ''` alongside the formatted display `note`. This prevents system backfill text like `(Earned prior to backfill - 0 pts for team)` from being accidentally injected into the editable text.

3. **Database Update Handler (`updateScoreNote`)**:
   - Implement `updateScoreNote(playerId, episode, scoreId, newNote)`:
     ```javascript
     const updateScoreNote = async (playerId, episode, scoreId, newNote) => {
         if (isFinishedSeason) return;
         if (!window.firebaseInitialized) return;
         setIsSavingNote(true);
         const trimmedNote = (newNote || '').trim();
         try {
             // Multi-league update across all configured leagues
             const leagueIds = typeof LEAGUES_DATA === 'object' && LEAGUES_DATA !== null 
                 ? Object.keys(LEAGUES_DATA) 
                 : [activeLeagueId];
             
             const promises = leagueIds.map(async (lId) => {
                 const scoreRef = `leagues/${lId}/seasons/${activeSeasonId}/scores/${playerId}/${episode}/${scoreId}`;
                 const snap = await database.ref(scoreRef).once('value');
                 if (snap.exists()) {
                     await database.ref(`${scoreRef}/note`).set(trimmedNote);
                 }
             });
             
             await Promise.all(promises);
             setEditingScoreId(null);
             setEditingNoteValue('');
         } catch (err) {
             console.error('Error updating score note:', err);
             alert('Failed to update note. Please try again.');
         } finally {
             setIsSavingNote(false);
         }
     };
     ```

4. **UI Event Row Rendering (Expanded Team -> Castaway Card)**:
   - In the breakdown mapping under each castaway card (lines ~3571-3588):
     - Check if `editingScoreId === item.scoreId`.
     - **If Editing**: Render an inline input field:
       - `<input>` with `placeholder='e.g., "Won against Jackson", "Found on beach"'`.
       - Auto-focus on mount.
       - Keydown handler: `Enter` calls `updateScoreNote`, `Escape` cancels.
       - Small green Save button (`✓` or `Save`) and gray Cancel button (`✕`).
     - **If Not Editing**: Render the event line with hover affordance:
       - Event text: `E${item.episode}: ${item.category}${item.note ? ` - ${item.note}` : ''}`.
       - If `item.scoreId` is present and season is not finished:
         - Render a hover button beside the event name:
           - Icon: `Icons.Edit` (12px) with `opacity-0 group-hover:opacity-100` (and mobile-friendly touch styling).
           - Title: `item.rawNote ? 'Edit note' : 'Add note'`.
           - Clicking it sets `editingScoreId = item.scoreId` and `editingNoteValue = item.rawNote || ''`.
       - Points badge and delete `×` button remain on the right side.

---

## 3. Test Data State Initialization Strategy

To test this immediately on `localhost:8000/index.html?league=jordan-denver-league&season=season-51`:

### Console Seed Helper:
Run the following helper snippet in the browser console (which operates strictly under `dev_testing/`):
```javascript
// Test Seed: Add a scored event without note, and one with a note
(async () => {
    const baseRef = `dev_testing/leagues/jordan-denver-league/seasons/season-51`;
    // Find first drafted player
    const teamsSnap = await firebase.database().ref(`${baseRef}/teams`).once('value');
    const teams = teamsSnap.val() || {};
    const playerIds = Object.keys(teams);
    if (playerIds.length === 0) {
        console.warn("No drafted players found to seed.");
        return;
    }
    const testPlayerId = playerIds[0];
    const scoreId1 = "test_score_no_note";
    const scoreId2 = "test_score_with_note";
    
    await firebase.database().ref(`${baseRef}/scores/${testPlayerId}/1/${scoreId1}`).set({
        category: "Finds Hidden Immunity Idol",
        points: 5,
        note: ""
    });
    await firebase.database().ref(`${baseRef}/scores/${testPlayerId}/1/${scoreId2}`).set({
        category: "Individual Immunity Win",
        points: 6,
        note: "Won necklace against Jordan"
    });
    console.log(`Seeded test events for Player ID ${testPlayerId}`);
})();
```

---

## 4. Phased Implementation Steps

### Phase 1: Planning & Interactive Review Gate (Completed)
- [x] Create `bug_fixes/castaway_event_notes/prd.md`.
- [x] Create `bug_fixes/castaway_event_notes/implementationplan.md`.
- [x] Present PRD and Implementation Plan to user.
- [x] **STOP** and wait for user sign-off before modifying code.

### Phase 2: Core Logic Implementation (Completed)
- [x] Update `getPlayerBreakdown` in `index.html` to return `rawNote`.
- [x] Add state `editingNoteScoreKey`, `editingNoteValue`, `isSavingNote` in `App`.
- [x] Implement `updateScoreNote(playerId, episode, scoreId, newNote)` to write to Firebase across all leagues.
- [x] Implement inline note editor in the castaway card breakdown list.
- [x] Add hover edit trigger icon button with title `"Add note"` / `"Edit note"`.
- [x] Implement keyboard navigation (`Enter` to save, `Esc` to cancel).

### Phase 3: Mobile & Touch Support (Completed)
- [x] Ensure edit button is accessible on touch screens without requiring a hover state.
- [x] Ensure input field fits comfortably on mobile screens without breaking card layout.

### Phase 4: Verification & Walkthrough (Completed)
- [x] Test in browser on `localhost:8000`:
  - Open team card.
  - Hover over event name without note -> verify `+ Note` / edit icon appears.
  - Click to edit -> verify input with placeholder `e.g., "Won against Jackson", "Found on beach"`.
  - Type note and save -> verify note is appended (`E1: Category - Note`).
  - Refresh or check Firebase `dev_testing/` -> verify persistence.
  - Edit existing note -> change text -> verify update.
  - Clear note -> verify note is removed cleanly.
  - Verify Esc cancels without saving.
  - Verify synthetic events (Swaps, Merge, Elimination/Winner) do not display edit note button.
- [x] Confirm zero modifications to live production nodes (`leagues/`, `seasons/`).
- [x] Create `bug_fixes/castaway_event_notes/walkthrough.md`.
