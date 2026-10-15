# Implementation Plan: Bulk Tribe Visualizer Redesign

**Location**: `features/bulk_tribe_visualizer_redesign/implementationplan.md`  
**Status**: Completed  
**PRD Reference**: [`features/bulk_tribe_visualizer_redesign/prd.md`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/features/bulk_tribe_visualizer_redesign/prd.md)  

---

## 1. Safety & Data Isolation Directive

> [!CRITICAL]
> **Production Data Safety Directive**: All testing must be conducted strictly using isolated test datasets (`dev_testing/` database path under local dev server on `localhost:8000`). Production database state must remain completely untouched.

---

## 2. Approved Architectural Design & Layout Specifications

### Option 1 (Approved): Split-Panel Layout with Dynamic Collapsible 'Unassigned Castaways' Panel
- **Strict Visual Style Rule**: **Zero Emojis**. Use clean modern typography, standard glyphs (`+`, `×`, `‹`, `›`), or SVGs. Remove existing emojis (`🏕️`, `🤝`, `🖐️`, `➕`, etc.) from the bulk visualizer modal.
- **Naming Convention**: Strictly label the container and panel as **"Unassigned Castaways"**.
- **Modal Container**:
  - Max width: `max-w-6xl` (w-full, max-h-[90vh], dark slate `bg-slate-900`, `border-2 border-orange-500/50`).
- **Left Column: Dynamic 'Unassigned Castaways' Panel**:
  - **State**: Track `isUnassignedCollapsed` in React state (`const [isUnassignedCollapsed, setIsUnassignedCollapsed] = useState(false)`).
  - **Auto-Behavior**: When `unassignedCastaways.length === 0`, panel collapses by default to give maximum space to destination tribes. When `unassignedCastaways.length > 0`, panel expands (~280px / 30% width).
  - **Expanded View**:
    - Header: `Unassigned Castaways (X)`, dashed amber/slate border.
    - Quick "Unassign All" button (or "Unassign All Castaways").
    - Collapse toggle icon button (`‹`).
    - Scrollable vertical list of compact castaway pill chips.
    - Full drop zone for unassigning castaways.
  - **Collapsed View (Drop Dock)**:
    - Slim vertical dock (`w-12` / `~48px`) with subtle dashed border and vertical text `Unassigned Castaways (0)`.
    - Still acts as a drop zone (`onDragOver`, `onDrop`)! Dropping a castaway onto the slim dock unassigns them and auto-expands the panel.
    - Clickable to expand manually (`›`).
- **Right Column: Destination Tribes Area**:
  - When panel is collapsed: expands to **100% full width**, offering a spacious multi-column grid.
  - When panel is expanded: takes remaining ~70% width in a clean 2 or 3-column grid.
  - **Active Tribes**:
    - Sleek compact header: tribe color dot, name, player count badge, and small "Edit Tribe" button.
    - Compact drop zone: min-h-[70px], compact player chips (`px-2 py-1`, 18px avatar, tight readable text).
  - **Merge Tribe**:
    - Styled with royal purple / gold gradient, clearly identifiable as the merge destination.
- **Dual Interaction Support (Drag & Drop + Click-to-Move)**:
  - Drag-and-drop works across all containers as before, but with much shorter drag paths.
  - Click-to-Move:
    - State: `const [selectedPlayerToMove, setSelectedPlayerToMove] = useState(null)`.
    - Clicking a player selects/highlights them with an amber ring.
    - Clicking any destination tribe container moves the selected player there immediately and clears selection.
    - Clicking the selected player again or pressing Escape cancels selection.

---

## 3. Affected Files

1. [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html):
   - Update the visual bulk edit modal (`#modal-bulk-edit`, lines ~4792-4975).
   - Implement the selected layout (e.g. Split-Panel Staging Layout or Top Shelf).
   - Update player chip styles, drop zone styling, and add click-to-move support.
2. [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html):
   - Mirror identical bulk edit modal updates (lines ~2802-2980).
   - Ensure consistent visual appearance, responsiveness, and state handling.

---

## 4. Test Data State Initialization Strategy

1. **Local Test Server**: `python3 -m http.server 8000` on `http://localhost:8000`.
2. **Dev Testing Namespace**: Confirmed via `wrapDatabaseInstance` in [`js/config.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/js/config.js) under `dev_testing/`.
3. **Direct Navigation**:
   - `http://localhost:8000/draft.html?league=jackson-ryan-league&season=season-51&openBulkEdit=true`
   - `http://localhost:8000/index.html?league=jackson-ryan-league&season=season-51` -> Click "Add Points" -> Click "Edit Tribe".
4. **State Testing Steps**:
   - Click "Unassign All Players" to test mass transfer into the unassigned staging area.
   - Drag players from Unassigned into Toka, Savu, and custom tribes.
   - Drag players between competing tribes.
   - Drag players into Merge Tribe.
   - Click "Save Changes" and confirm state updates correctly in Firebase `dev_testing/` without console errors.

---

## 5. Phased Implementation Steps

### Phase 1: Interactive Design Turn & User Approval (Current Phase)
- Present PRD, layout options, and implementation plan to the user.
- **STOP and wait for user sign-off** before making any code modifications.

### Phase 2: Refactor Modal Layout in `index.html`
- Adjust modal container size and layout structure based on approved option.
- Redesign the Unassigned staging area (e.g., sticky left panel or top shelf).
- Redesign compact tribe cards and player tokens.
- Add click-to-move interaction alongside existing drag-and-drop.

### Phase 3: Synchronize Modal in `draft.html`
- Apply the same compact structure and styles to `draft.html`'s bulk edit modal.

### Phase 4: Verification & Live Data Safety Confirmation
- Test in browser on both pages.
- Verify drag & drop and quick move workflows.
- Confirm production Firebase data remains completely untouched.
- Create `features/bulk_tribe_visualizer_redesign/walkthrough.md`.
