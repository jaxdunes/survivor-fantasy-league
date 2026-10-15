# Product Requirements Document (PRD): Delete Tribe from Edit Tribe Menu

**Feature Directory**: `features/delete_tribe_from_edit_menu/`  
**Status**: In Review (Awaiting User Sign-Off)  
**Creation Date**: 2026-10-15  

---

## 1. Problem Statement

In the Survivor Fantasy League application, league commissioners and administrators can create new custom tribes and edit existing tribes (updating names and color schemes) via the "Edit Tribe" button on tribe cards within the Bulk Tribe Visualizer. 

However, there is currently **no way to delete an existing tribe**. If a custom tribe is created by mistake (such as a temporary test tribe), dissolved during a tribe swap, or eliminated, it remains permanently in the season data, occupying visual space in the Bulk Tribe Visualizer and dropdown filters across the app. 

Administrators need a straightforward, safe mechanism to delete a tribe directly from the Edit Tribe menu.

---

## 2. Goals & Success Criteria

1. **Delete Action in Edit Tribe Menu**:
   - Provide a prominent yet clearly distinguished **"Delete Tribe"** button at the bottom of the Edit Tribe menu (`#modal-add-custom-tribe`).
   - The button must appear **only** when editing an existing tribe (`editingTribeOriginalName` is set). It must **not** appear when creating a new custom tribe (`Add New Custom Tribe`).
2. **Safe Deletion & Confirmation**:
   - Prompt the user with a confirmation dialog before proceeding with deletion to prevent accidental loss of tribe structure:
     `Are you sure you want to delete the "[Tribe Name]" tribe? All castaways assigned to this tribe will be moved to Unassigned Castaways.`
3. **Graceful Castaway Reassignment**:
   - When a tribe is deleted, all castaways currently assigned to that tribe (in the active bulk editor assignments and the season contestants list) must automatically be moved to `'Unassigned'`.
   - If the left Unassigned Castaways panel was collapsed in the bulk visualizer, it must automatically expand so the administrator can immediately see and reallocate the unassigned castaways.
4. **Clean Tribe Purge & Persistence**:
   - The deleted tribe must be removed from `seasonData.customTribes`.
   - The deleted tribe must be added to a `deletedTribes` list in `seasonData` and filtered out of `availableTribes` so it never resurrects from cached player objects or default starter rosters.
   - Updated contestants, custom tribes, and deleted tribes must be persisted to Firebase (`dev_testing/` during testing) and `localStorage`.
5. **Aesthetic Consistency & Zero Emojis**:
   - Follow the strict **Zero Emojis** directive.
   - Style the Delete button with a dark red border/background treatment (`bg-red-950/40 text-red-400 hover:bg-red-600 hover:text-white border-red-800/60`), clearly distinguishing it from primary save actions while maintaining a cohesive dark tribal aesthetic.
6. **Parity Across Pages**:
   - Implement the identical functionality and styling across both [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html) and [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html).

---

## 3. User Experience & Workflow

### 3.1 Opening the Edit Tribe Menu
1. From the Bulk Tribe Visualizer (`#modal-bulk-edit`), the user clicks the "Edit Tribe" button on any competing tribe card (e.g. `TESTTRIBE`).
2. The Edit Tribe modal opens showing:
   - Header: `EDIT TRIBE`
   - Subtitle: `Update tribe name and primary color theme.`
   - Tribe Name text input
   - Live Tribe Preview chip
   - Primary Color Theme selector (8 color palettes)
   - Bottom Action Row: `Cancel` and `Save Changes` buttons
   - **New Section**: At the very bottom, separated by a subtle divider, a full-width **"Delete Tribe"** button is rendered.

### 3.2 Deletion Confirmation & Execution
1. The user clicks **"Delete Tribe"**.
2. A confirmation prompt appears asking:
   `Are you sure you want to delete the "[Tribe Name]" tribe? All castaways assigned to this tribe will be moved to Unassigned Castaways.`
3. If confirmed:
   - All castaways assigned to the tribe become `'Unassigned'`.
   - The tribe is removed from `customTribes` and registered into `deletedTribes`.
   - The change is saved to Firebase and local state.
   - The Edit Tribe modal closes.
   - The Bulk Tribe Visualizer refreshes instantly: the deleted tribe card disappears, the unassigned staging panel expands, and all affected castaways appear as unassigned chips ready to be dragged or clicked to a new tribe.
4. If cancelled:
   - The modal remains open with no modifications made.

---

## 4. Technical Specifications & Data Schema

### 4.1 Schema Updates (`seasons/{seasonId}`)
```json
{
  "customTribes": [
    {
      "id": "tribe-1712345678",
      "name": "Vatu",
      "color": "green",
      "badgeBg": "rgba(16, 185, 129, 0.22)",
      "badgeText": "#d1fae5",
      "badgeBorder": "#10b981",
      "gradient": "from-emerald-700 to-green-900"
    }
  ],
  "deletedTribes": [
    "TESTTRIBE"
  ]
}
```

### 4.2 State Updates in React
1. `handleDeleteTribe(tribeNameToDelete)`:
   - Validates `tribeNameToDelete` is not empty.
   - Confirms user intent via `window.confirm(...)`.
   - Filters out from `seasonData.customTribes`.
   - Adds to `seasonData.deletedTribes`.
   - Updates `seasonData.contestants`: any contestant where `p.tribe === tribeNameToDelete` or `p.startingTribe === tribeNameToDelete` has their `tribe` and/or `startingTribe` set to `'Unassigned'`.
   - Updates `bulkAssignments`: any castaway assigned to `tribeNameToDelete` is updated to `'Unassigned'`.
   - Calls `setIsUnassignedCollapsed(false)`.
   - Resets `editingTribeOriginalName(null)` and closes `setShowAddCustomTribeModal(false)`.
   - Saves all updates via `saveSeasonDataToFirebase`.

### 4.3 Available Tribes Computation
Update `availableTribes` `useMemo` in both `draft.html` and `index.html`:
```javascript
const deletedTribesList = (seasonData && seasonData.deletedTribes) ? seasonData.deletedTribes : [];
// Filter out any tribe whose name matches an entry in deletedTribesList
```

---

## 5. Non-Functional Requirements & Safety

- **Production Safety**: Zero reads/writes to live production data during testing. All testing must occur locally on `localhost:8000` with the `dev_testing/` namespace prefix.
- **Zero Emojis**: Strictly no emojis in labels, buttons, or confirmation text.
- **Responsive & Accessible**: Button should have distinct hover/focus states, appropriate contrast (`text-red-400` on dark slate), and clear descriptive text.
