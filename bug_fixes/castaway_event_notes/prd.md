# Product Requirements Document (PRD): Edit Castaway Event Notes in Open Team Card

**Version**: 1.0  
**Status**: Completed  
**Location**: `bug_fixes/castaway_event_notes/prd.md`  
**Target Files**: `index.html`  
**Git Branch**: `bug_fix/castaway-event-notes`  

---

## 1. Executive Summary & Problem Statement

### Problem
In the Survivor Fantasy League dashboard, when a user expands a team card to inspect each drafted castaway's scoring breakdown, individual events are displayed in a read-only list (e.g., `E1: Finds Hidden Immunity Idol`). Although users can delete a score using the `×` button, there is currently **no ability to edit or add a Note** to an event post-entry. If an administrator or user forgot to enter a note during the "Add Points" flow, or wants to add context (e.g., `"Won against Jackson"`, `"Found on beach"`), they must delete the entire score and re-enter it from scratch.

### Solution / Goal
Provide the ability to edit each scored event directly within the open team card under each castaway's card:
1. **Hover Trigger**: When hovering over the name of the event, an intuitive note editing affordance (e.g., an edit pencil icon / `+ Note` button) appears.
2. **Note Editing Interface**: Clicking the affordance enables the user to add or update the note using an input matching the "Add Points" Note field (placeholder: `e.g., "Won against Jackson", "Found on beach"`).
3. **Appended Note Display**: In accordance with the Add Points behavior, the note is appended to the event name as `E{ep}: {category} - {note}`.
4. **Persistent Update**: Saves directly to Firebase Realtime Database at `scores/{playerId}/{episode}/{scoreId}/note`.
5. **Clear / Remove Note**: If the note input is cleared and saved, the note is removed, returning the event name to `E{ep}: {category}`.

---

## 2. Safety & Data Isolation Directive

> [!CRITICAL]
> **Live Production Data Protection**: All development, automated checks, and manual verification MUST run in an isolated test environment using the `dev_testing/` Firebase namespace under `localhost` (e.g., `http://localhost:8000` or `http://localhost:8085`). Live production Firebase nodes (`leagues/`, `seasons/`) must remain strictly untouched.

- **Dev/Test Environment Guard**: The application must automatically enforce the `dev_testing/` namespace prefix for all Firebase Realtime Database reads and writes (managed by `wrapDatabaseInstance` in [`js/config.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/js/config.js)).
- **Production Guard Banner**: Verify `🧪 DEV MODE | Firebase Path: dev_testing/` is visible during local testing.
- **Data Segregation**: Test data is strictly kept within `dev_testing/` and never merged into live nodes.

---

## 3. Functional Requirements

| ID | Category | Requirement Description | Success Criteria |
|---|---|---|---|
| **FR-1** | Hover Trigger | When hovering over an editable event row/name under a castaway's card in an expanded team card, reveal an edit affordance. | Hovering over the event name reveals a subtle edit button (`Icons.Edit` pencil or `+ Note` / `Edit Note` pill). |
| **FR-2** | Note Input Field | Clicking the edit button activates note editing for that specific score item. | An input field opens pre-populated with any existing note. If empty, it displays placeholder: `e.g., "Won against Jackson", "Found on beach"`. |
| **FR-3** | Save & Cancel Controls | Provide explicit Save (`✓` / `Save` / `Enter`) and Cancel (`✕` / `Cancel` / `Escape`) actions. | Pressing Save or hitting `Enter` updates the note. Pressing Cancel or hitting `Escape` aborts without changes. |
| **FR-4** | Appended Note Display | Format the event title with the note appended at the end. | Renders as `E{ep}: {category} - {note}` (matching the existing Add Points note format in the breakdown). |
| **FR-5** | Database Persistence & Multi-League Sync | Persist the edited note in Firebase Realtime Database across all leagues (`Object.keys(LEAGUES_DATA)`). | Updates `leagues/{leagueId}/seasons/{seasonId}/scores/{playerId}/{episode}/{scoreId}/note` for all leagues where this score exists. Handles empty strings cleanly. |
| **FR-6** | Pre-Backfill Notice Preservation | Protect raw notes from collision with system backfill notes (`(Earned prior to backfill - 0 pts for team)`). | Ensure editing modifies only the user's `score.note` and does not bake the system backfill disclaimer into the database record. |
| **FR-7** | Scope of Editable Events | Only scored events backed by a database `scoreId` are editable. | Synthetic/computed events (Tribe Swaps, Reached Merge, Elimination Bonus, Winner Bonus) that lack a `scoreId` do not display the edit note button. |
| **FR-8** | Mobile & Touch Accessibility | Support mobile and touch devices where `:hover` is not available. | On touch devices or narrow screens, provide a touch-accessible edit button so mobile users can also edit notes. |
| **FR-9** | Inline Editor (Option A) | Provide an inline editing UI directly within the event row. | Clicking the edit button replaces or expands the event name into an inline `<input>` field with `placeholder='e.g., "Won against Jackson", "Found on beach"'`, Save (`✓`), and Cancel (`✕`) buttons, plus `Enter` / `Escape` keyboard shortcuts. |

---

## 4. UI/UX Design Specifications

### Placement in Open Team Card
In the expanded team view (`expandedTeams[team.id]`):
- Each player has a card with their name, tribe badges, total score, and a list of scoring events (`breakdown`).
- Each event row currently renders:
  ```
  [ E1: Finds Hidden Immunity Idol ]                      [ +5 pts ] [ × ]
  ```
  With an existing note:
  ```
  [ E1: Finds Hidden Immunity Idol - Found on beach ]      [ +5 pts ] [ × ]
  ```

### Proposed Hover & Edit Flow (Inline Interaction)
1. **Default State**:
   - `E1: Finds Hidden Immunity Idol` (or `... - Found on beach`)
2. **Hover State**:
   - When hovering over the event name / row, a small edit icon button (`Icons.Edit` or `✎`) appears beside the name with a tooltip: `"Add note"` (if none exists) or `"Edit note"` (if one already exists).
3. **Editing State (Inline Mode)**:
   - The event row expands into an inline edit input:
     - An `<input>` field styled cleanly with `border-orange-300 ring-1 ring-orange-400 rounded-md text-xs px-2 py-1`.
     - Placeholder: `e.g., "Won against Jackson", "Found on beach"`.
     - A green Save button `✓` and gray Cancel button `✕`.
     - Pressing `Enter` saves; pressing `Escape` cancels.
4. **Post-Save State**:
   - The row immediately updates to `E1: Finds Hidden Immunity Idol - [New Note Text]`.
   - The edit input closes.

---

## 5. Test Data State Initialization Plan

To test this feature without manual setup:
1. Target URL: `http://localhost:8000/index.html?league=jordan-denver-league&season=season-51` (or `http://localhost:8085/...`).
2. Verify `dev_testing/` banner is active.
3. Seed or verify at least one drafted team with scored events:
   - For example, ensure a team has a player with at least one event with a note, and one event without a note.
   - A browser console helper will be provided in `implementationplan.md` to quickly seed or reset test scores.

---

## 6. Verification Plan & Acceptance Criteria

- [x] Local environment operates strictly under `dev_testing/` namespace.
- [x] Live production nodes (`leagues/`, `seasons/`) have zero mutations.
- [x] Hovering over an event name reveals the edit note icon/button.
- [x] Clicking the button opens the note input pre-filled with the current note (or empty with placeholder).
- [x] Saving updates the note in Firebase and appends the note to the event name (`E{ep}: {category} - {note}`).
- [x] Clearing the note and saving properly removes the note (`E{ep}: {category}`).
- [x] Canceling discards changes without updating Firebase.
- [x] Pressing `Enter` saves; pressing `Escape` cancels.
- [x] Synthetic events (Swaps, Merge, Elimination/Winner bonuses) gracefully omit the edit affordance.
- [x] Touch/mobile devices provide an accessible tap affordance.
