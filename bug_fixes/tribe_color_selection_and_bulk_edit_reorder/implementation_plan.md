# Implementation Plan: In-Page Bulk Tribe Edit Visualizer, Color Selection & Tribe Management

**Branch**: `bug_fix/tribe-color-selection-and-bulk-edit`  
**Folder**: `bug_fixes/tribe_color_selection_and_bulk_edit_reorder/`  
**Target Files**: `index.html`, `draft.html`, `js/scoring-engine.js`  

---

## 1. Overview & Objectives

Deliver an in-page workflow on `index.html` where clicking the "Edit Tribe" button in the "Add Points" modal opens the Visual Bulk Tribe Edit Dashboard right on top of `index.html` (instead of navigating away to `draft.html`), and upon exiting (via Cancel, Close, or Save Changes), returns directly to the Add Points screen with all updated tribes, colors, and player assignments immediately reflected.

---

## 2. Key Architecture & Design Decisions

### Modal Layering & Stacking Context
- The Add Points modal backdrop in `index.html` uses `.modal-backdrop` (`z-index: 1000`).
- To allow the Bulk Tribe Visualizer to render directly on top of the Add Points modal without dismissing it or navigating away, we established a strict z-index hierarchy:
  - Add Points Modal Backdrop: `z-index: 1000`
  - Visual Bulk Tribe Edit Modal (`#modal-bulk-edit`): `z-[1100]`
  - Add / Edit Custom Tribe Modal (`#modal-add-custom-tribe`): `z-[1200]`
  - Confirm Merge Modal (`#modal-confirm-merge`): `z-[1300]`

### In-Page State Management on `index.html`
- Implemented state hooks directly in `ScoringPage`:
  - `showBulkEditModal`, `bulkEditEpisode`, `bulkAssignments`, `draggedPlayerId`, `showConfirmMergeModal`, `showAddCustomTribeModal`, `editingTribeOriginalName`, `customTribeName`, `customTribeColor`.
- Action handlers:
  - `handleOpenBulkEdit(targetEp)`: Initializes assignments from episode tribe data, sets target episode, and opens `#modal-bulk-edit`.
  - `handleBulkEpisodeChange(newEp)`: Re-indexes assignments for the newly selected episode.
  - `handleUnassignAllPlayers()`: Reassigns all active non-eliminated players for the current episode to 'Unassigned'.
  - `handleOpenAddCustomTribe()` & `handleOpenEditTribe(tribeName)`: Opens the emoji-free custom tribe modal.
  - `handleSaveCustomTribe()`: Creates or updates custom tribe records in `seasonData` and persists to Firebase (`dev_testing/` protected).
  - `handleSaveBulkEdit()`: Builds updated contestant tribe histories, persists them season-wide, and closes `#modal-bulk-edit`.
  - `handleConfirmMergeAll()`: Batches all active players into Merge Tribe and awards merge points.

### Dynamic Player Selection Grouping in Add Points Modal
- Updated `Player Selection` in Add Points to evaluate `scoringTribeMap` dynamically:
  ```javascript
  const selectedEpNum = parseInt(lastSelectedEpisode) || 1;
  const scoringTribeMap = {};
  players.forEach(p => {
      const tName = typeof window.getTribeForEpisode === 'function'
          ? window.getTribeForEpisode(p, selectedEpNum)
          : (p.tribe || p.startingTribe || 'Unassigned');
      if (!scoringTribeMap[tName]) scoringTribeMap[tName] = [];
      scoringTribeMap[tName].push(p);
  });
  ```
- Because `players` is derived from `seasonData.contestants`, saving changes in the bulk visualizer triggers an immediate React state re-render, displaying new tribes and redistributed players without reloading the page.

---

## 3. Verification Plan

1. **Syntax Validation**: Verify `index.html` using JavaScriptCore (`jsc`) with 0 syntax errors.
2. **Browser Subagent End-to-End Test**:
   - Open `index.html?league=jackson-ryan-league&season=season-51`.
   - Open Add Points modal.
   - Click `#btn-edit-tribe`.
   - Verify `#modal-bulk-edit` opens in-page on `index.html` (URL is NOT `draft.html`).
   - Verify Merge Tribe container has no "Edit Tribe" button.
   - Click "Cancel" -> verify return to Add Points modal.
   - Re-open `#btn-edit-tribe`, click "➕ Add Tribe", verify no emojis, add tribe "Solana", save.
   - Click "Save Changes", verify modal closes and returns to Add Points with updated state.
3. **Database Guard Check**: Verify that all writes are routed under `dev_testing/` namespace.
