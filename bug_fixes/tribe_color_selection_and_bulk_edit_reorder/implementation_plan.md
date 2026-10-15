# Implementation Plan

## Bug Fix: Tribe Color Selection, Bulk Edit Layout Reordering, and Cross-Screen Tribe Edit Navigation

**Branch**: `bug_fix/tribe-color-selection-and-bulk-edit`  
**Folder**: `bug_fixes/tribe_color_selection_and_bulk_edit_reorder/`  
**Target Files**: `draft.html`, `index.html`, `js/scoring-engine.js`  
**Status**: In Progress  

---

### Step 1: Fix Tribe Color Selection & Live Preview in Add Tribe Modal (`draft.html`)

1. **Root Cause Analysis in CSS**:
   `body.theme-tribal` sets `!important` on `.bg-*-50`, `.border-...`, and `box-shadow` on cards and buttons, blocking Tailwind's `ring-2` focus rings and turning color buttons dark brown. Orange was unaffected because `.bg-orange-50` was omitted from the dark mode CSS list, making it appear stuck as the only selected button.

2. **Implementation**:
   - In `draft.html` (`showAddCustomTribeModal`), re-style the color swatches using explicit inline styles (`style={{ backgroundColor, borderColor, boxShadow }}`) to make them immune to `!important` CSS rules.
   - Add a visible checkmark icon (`✓`) on the actively selected swatch.
   - Add a real-time **Live Tribe Preview Pill** directly inside the modal so administrators can see the exact dot color, gradient, and text badge before clicking "Save Tribe".
   - Reset `customTribeColor` and `customTribeName` when opening and closing the modal.

---

### Step 2: Rearrange Multi-Edit Tribe Screen Layout (`draft.html`)

1. **Current Layout Defect**:
   `availableTribes` combines all tribes in a flat array (`[Toka, Savu, Merge Tribe, Unassigned]`), causing the Merge Tribe container to sit in the 3rd column of the first row alongside the original tribes.

2. **Implementation**:
   - Partition tribes into:
     - `competingTribes`: Original starting tribes (Toka, Savu) followed by any newly created custom tribes.
     - `mergeTribe`: Dedicated container for 'Merge Tribe' arranged at the bottom.
     - `unassignedTribe`: Dedicated container for 'Unassigned' if players exist in this state.
   - Render `competingTribes` side-by-side in the main grid (`md:grid-cols-2 lg:grid-cols-3 gap-4`).
   - Render `mergeTribe` in a dedicated full-width container at the **bottom** of the modal, styled with distinctive purple merge branding and clear instructions.
   - Preserve complete Drag & Drop support between all containers.

---

### Step 3: Implement Deep-Link Auto-Open for Bulk Edit Modal (`draft.html`)

1. **URL Parameter Support**:
   - Read URL search parameters on component mount:
     - `openBulkEdit`: if `'true'` or `'1'`, invoke `handleOpenBulkEdit()`.
     - `ep`: if provided (e.g. `ep=4`), set `bulkEditEpisode` to this episode.
   - Use `window.history.replaceState` to cleanly strip the `openBulkEdit` parameter so page refreshes do not re-trigger the modal.

---

### Step 4: Add "Edit Tribe" Button & Color Fix in "Add Points" Modal (`index.html`)

1. **Add "Edit Tribe" Button in Player Selection**:
   - In `index.html` (inside the "Add Points" modal's "Player Selection" section), add a styled button/link:
     - Label: `🏕️ Edit Tribes`
     - Action: Navigates to `draft.html?league=${activeLeagueId}&season=${activeSeasonId}&openBulkEdit=true&ep=${lastSelectedEpisode || 1}`.
   - Match the UI styling of the surrounding Player Selection header.

2. **Fix Custom Tribe Presentation in `index.html`**:
   - In `getTribeDotColor` and `getTribeBadgeColor` inside `index.html`, pass `seasonData?.customTribes` into `window.getTribeDotColor` and `window.getTribeStyle`.
   - Ensure newly added custom tribes display their proper badge and dot colors instead of defaulting to slate/orange.

---

### Step 5: Verification & Browser Testing with Segregated Test Data

1. **Verification of Data Segregation**:
   - Confirm `IS_DEV_ENV` evaluates to `true` on `localhost:8000` and `dev-env-indicator` is visible.
   - Confirm all Firebase reads/writes are routed to `dev_testing/` namespace.
2. **Interactive Browser Testing**:
   - Test color selection in the "Add New Custom Tribe" modal across multiple colors (Yellow, Purple, Blue, Red, Pink, Black).
   - Verify selected color visually updates with glowing ring and checkmark.
   - Add a new custom tribe and verify it appears next to the original tribes in the top grid.
   - Verify "Merge Tribe" container is positioned at the bottom of the multi-edit dashboard.
   - Navigate to `index.html`, open "➕ ADD POINTS", check "Player Selection", and verify the new "Edit Tribes" button appears and functions.
   - Click "Edit Tribes" and verify it navigates to `draft.html` and automatically opens the Bulk Tribe Edit modal on the target episode.
