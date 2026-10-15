# Implementation Plan: Delete Tribe from Edit Tribe Menu

**Location**: `features/delete_tribe_from_edit_menu/implementationplan.md`  
**Status**: Completed  
**PRD Reference**: [`features/delete_tribe_from_edit_menu/prd.md`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/features/delete_tribe_from_edit_menu/prd.md)  

---

## 1. Safety & Data Isolation Directive

> [!CRITICAL]
> **Production Data Safety Directive**: All testing must be conducted strictly using isolated test datasets (`dev_testing/` database path under local dev server on `localhost:8000`). Live production nodes (`leagues/jackson-ryan-league`, `seasons/season-51`) must remain completely untouched.

---

## 2. Proposed Architectural Changes

### 2.1 UI Component Updates (`#modal-add-custom-tribe`)
In both [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html) and [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html):
- In the Edit Tribe modal, below the `Cancel` and `Save Changes` buttons, render a dedicated danger section when `editingTribeOriginalName` is truthy:
  ```javascript
  editingTribeOriginalName && h('div', { className: 'pt-3 mt-3 border-t border-slate-800/80 flex flex-col' },
      h('button', {
          id: 'btn-delete-tribe',
          type: 'button',
          onClick: handleDeleteTribe,
          className: 'w-full py-2.5 px-4 rounded-xl text-xs font-bold text-red-400 hover:text-white bg-red-950/40 hover:bg-red-600/90 border border-red-800/60 hover:border-red-500 transition-all cursor-pointer flex items-center justify-center'
      }, 'Delete Tribe')
  )
  ```
- **Zero Emojis**: Use clean typography without emojis.

### 2.2 React Handler Implementation (`handleDeleteTribe`)
Add `handleDeleteTribe` handler to `draft.html` and `index.html`:
```javascript
const handleDeleteTribe = async () => {
    if (!editingTribeOriginalName) return;
    const tribeToDelete = editingTribeOriginalName;

    const confirmed = window.confirm(
        `Are you sure you want to delete the "${tribeToDelete}" tribe? All castaways assigned to this tribe will be moved to Unassigned Castaways.`
    );
    if (!confirmed) return;

    // 1. Remove from customTribes
    const existingCustom = (seasonData && seasonData.customTribes) ? ensureArray(seasonData.customTribes) : [];
    const updatedCustom = existingCustom.filter(ct => ct && ct.name && ct.name.toLowerCase() !== tribeToDelete.toLowerCase());

    // 2. Track in deletedTribes
    const existingDeleted = (seasonData && seasonData.deletedTribes) ? ensureArray(seasonData.deletedTribes) : [];
    const updatedDeleted = Array.from(new Set([...existingDeleted, tribeToDelete]));

    // 3. Update contestants: move castaways in this tribe to 'Unassigned'
    const defaultPlayersList = activeSeasonId === 'season-50' ? defaultSeason50Players : defaultSeason51Players;
    const rawContestants = (seasonData && seasonData.contestants) ? seasonData.contestants : defaultPlayersList;
    const updatedContestants = rawContestants.map(p => {
        let updatedP = { ...p };
        if (updatedP.tribe && updatedP.tribe.toLowerCase() === tribeToDelete.toLowerCase()) {
            updatedP.tribe = 'Unassigned';
        }
        if (updatedP.startingTribe && updatedP.startingTribe.toLowerCase() === tribeToDelete.toLowerCase()) {
            updatedP.startingTribe = 'Unassigned';
        }
        if (updatedP.tribeHistory && Array.isArray(updatedP.tribeHistory)) {
            updatedP.tribeHistory = updatedP.tribeHistory.map(h => {
                if (h.tribe && h.tribe.toLowerCase() === tribeToDelete.toLowerCase()) {
                    return {
                        ...h,
                        tribe: 'Unassigned',
                        type: 'Tribe Deleted',
                        label: `Tribe ${tribeToDelete} Deleted`
                    };
                }
                return h;
            });
        }
        return updatedP;
    });

    // 4. Update in-memory bulk assignments if bulk edit modal is open
    setBulkAssignments(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(pid => {
            if (next[pid] && next[pid].toLowerCase() === tribeToDelete.toLowerCase()) {
                next[pid] = 'Unassigned';
            }
        });
        return next;
    });

    // Ensure the Unassigned panel expands so user sees the newly unassigned castaways
    setIsUnassignedCollapsed(false);

    // 5. Update single player edit state if open
    if (editingPlayer && singleEditTribe === tribeToDelete) {
        setSingleEditTribe('Unassigned');
    }

    // 6. Save to Firebase and localStorage
    await saveSeasonDataToFirebase(updatedContestants, updatedCustom, undefined, updatedDeleted);

    // 7. Reset and close modal
    setEditingTribeOriginalName(null);
    setCustomTribeName('');
    setShowAddCustomTribeModal(false);
};
```

### 2.3 `saveSeasonDataToFirebase` Signature & Updates
Enhance `saveSeasonDataToFirebase` to handle `newDeletedTribes`:
- In `draft.html`: `saveSeasonDataToFirebase = async (newContestants, newCustomTribes, newDeletedTribes)`
- In `index.html`: `saveSeasonDataToFirebase = async (newContestants, newCustomTribes, newScoringCategories, newDeletedTribes)`
- Persist `deletedTribes: updatedDeletedTribes` to Firebase `seasons/${activeSeasonId}` and `localStorage`.

### 2.4 `availableTribes` Filtering
Update `availableTribes` `useMemo` in both files:
```javascript
const deletedTribesList = (seasonData && seasonData.deletedTribes) ? ensureArray(seasonData.deletedTribes).map(t => (t || '').toLowerCase()) : [];

// When adding tribes from players or customTribesList, skip any tribe where:
if (deletedTribesList.includes(tribeName.toLowerCase())) {
    return; // Don't include deleted tribe
}
```

---

## 3. Affected Files

1. [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html):
   - Update `saveSeasonDataToFirebase` to accept and persist `deletedTribes`.
   - Update `availableTribes` `useMemo` to exclude deleted tribes.
   - Add `handleDeleteTribe` handler.
   - Update `#modal-add-custom-tribe` to render the "Delete Tribe" button at the bottom when `editingTribeOriginalName` is set.
2. [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html):
   - Mirror identical updates to `saveSeasonDataToFirebase`, `availableTribes`, `handleDeleteTribe`, and `#modal-add-custom-tribe`.

---

## 4. Test Data State Initialization Strategy

1. **Local Test Environment**: Running on `http://localhost:8000` (Python HTTP server).
2. **Dev Testing Verification**: Confirm `🧪 DEV MODE | Firebase Path: dev_testing/` banner is active.
3. **Test Scenarios**:
   - Open `#modal-bulk-edit` on `draft.html` and `index.html`.
   - Create a test custom tribe named "TemporaryTribe" with a color (e.g. Yellow).
   - Assign 2 castaways to "TemporaryTribe".
   - Click "Edit Tribe" on "TemporaryTribe" card to open the Edit Tribe menu.
   - Verify that the "Delete Tribe" button is clearly visible at the bottom of the modal.
   - Click "Delete Tribe" and confirm the deletion prompt.
   - Verify that:
     1. The Edit Tribe modal closes.
     2. "TemporaryTribe" disappears completely from the bulk visualizer and available tribes list.
     3. The 2 assigned castaways are moved to "Unassigned Castaways".
     4. The left staging panel is expanded to display the unassigned castaways.
     5. Changes persist on page reload.
     6. Production Firebase data remains completely untouched.

---

## 5. Phased Execution Plan

### Phase 1: Interactive Planning & Design Gate (Current Phase)
- Formulate and present PRD and Implementation Plan.
- **STOP and wait for user sign-off** before making any code modifications.

### Phase 2: Implementation in `draft.html`
- Update `saveSeasonDataToFirebase`, `availableTribes`, `handleDeleteTribe`, and modal JSX in `draft.html`.

### Phase 3: Implementation in `index.html`
- Replicate the exact logic and modal JSX in `index.html`.

### Phase 4: Verification & Live Data Safety Confirmation
- Test end-to-end via automated browser subagent.
- Verify visual styling, confirmation dialog, castaway re-assignment, and persistence.
- Create `features/delete_tribe_from_edit_menu/walkthrough.md`.
