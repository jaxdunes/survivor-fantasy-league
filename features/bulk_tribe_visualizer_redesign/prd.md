# Product Requirements Document (PRD): Bulk Tribe Visualizer Redesign

**Version**: 1.0  
**Status**: Draft (Awaiting User Review & Design Turn)  
**Location**: `features/bulk_tribe_visualizer_redesign/prd.md`  
**Target Files**: `index.html`, `draft.html`  
**Git Branch**: `main`  

---

## 1. Executive Summary & Problem Statement

### Problem
In the current Bulk Tribe Edit Visualizer modal (`#modal-bulk-edit` in `index.html` and `draft.html`):
- **Oversized Tribe Boxes**: The cards have excessive padding, large headers, and wide player pill buttons that wrap vertically, causing cards to become very tall.
- **Excessive Drag Distances & Vertical Scrolling**: The modal body is a single vertical scrolling container (`max-h-[55vh] overflow-y-auto`). Competing tribes sit at the top, while the "Merge Tribe" and "Unassigned" boxes are placed at the very bottom in a separate section.
- **Dragging Friction from "Unassigned"**: When an admin uses "Unassign All Players" or redistributes contestants during a tribe swap, contestants are placed in the Unassigned box at the bottom. Because the target tribes at the top are scrolled out of view, dragging a player from Unassigned up to Toka or Savu is extremely awkward, requiring manual scrolling during drag (which native HTML5 drag-and-drop often fails to handle smoothly).

### Solution / Goal
Redesign the Bulk Tribe Visualizer dashboard into a compact, ergonomic layout where:
1. **Unassigned Contestants are Always Accessible**: The Unassigned pool acts as an intuitive staging bench (e.g., sticky left-hand staging panel or docked top shelf) that never scrolls out of view and is positioned immediately adjacent to destination tribes.
2. **Compact Card Density & Streamlined Player Chips**: Reduce container padding, streamline header elements, and use compact player chips (with avatar and readable name) so multiple tribes fit neatly in the viewport.
3. **Short Drag Paths & Dual Interaction (Drag + Click-to-Move)**: Eliminate long drag paths across scrolled viewports. Provide both smooth HTML5 drag-and-drop and an optional quick click-to-move / quick-select transfer interaction so users can redistribute castaways effortlessly.
4. **Consistency Across Pages**: Keep the implementation identical and synchronized across both `index.html` (the in-page Add Points modal) and `draft.html` (the draft management dashboard).

---

## 2. Safety & Data Isolation Directive

> [!IMPORTANT]
> **Live Production Data Protection**: All development, automated checks, and manual verification MUST run in an isolated test environment using the `dev_testing/` Firebase namespace under `localhost`. Live production Firebase nodes (`leagues/`, `seasons/`) must remain strictly untouched.

- **Dev/Test Environment Guard**: The application must automatically enforce the `dev_testing/` namespace prefix for all Firebase Realtime Database reads and writes (managed by `wrapDatabaseInstance` in [`js/config.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/js/config.js)).
- **Production Guard Banner**: Verify `🧪 DEV MODE | Firebase Path: dev_testing/` is visible during local testing.
- **Data Segregation**: Test data is strictly kept within `dev_testing/` and never merged into live nodes.

---

## 3. Functional Requirements

| ID | Requirement | Description | Acceptance Criteria |
|---|---|---|---|
| **FR-1** | **Split-Panel Layout Architecture** | Display a dedicated persistent panel on the left for Unassigned Castaways (~28–30% width) alongside a multi-column grid of destination tribes on the right (~70–72% width). | When unassigned castaways are present, both the Unassigned Castaways panel and destination tribes are visible simultaneously; dragging distance is minimal (<250px). |
| **FR-2** | **Dynamic Collapsible Panel (Auto-Expand / Collapse)** | When there are 0 unassigned castaways, the left panel collapses into a slim drop dock (~44px width), expanding the tribe grid to 100% full width. When unassigned castaways exist or "Unassign All" is clicked, it expands back to full width. | Tribes take 100% full-width view when no castaways are unassigned. Collapsed dock remains a valid drag-and-drop target to unassign individual castaways and can be manually toggled. |
| **FR-3** | **Zero Emojis & Clean Typography** | Strictly avoid all emojis throughout the bulk visualizer dashboard (e.g., no emojis in headers, buttons, dock labels, or instructions). Use clean text, standard symbols (+, ×, ‹, ›), or subtle SVG icons. | Zero emojis rendered anywhere in the bulk tribe visualizer modal. |
| **FR-4** | **Standardized Naming: 'Unassigned Castaways'** | Explicitly label the staging panel and container as "Unassigned Castaways". | Header and collapsed dock display "Unassigned Castaways" or "Unassigned Castaways (X)". |
| **FR-5** | **Compact Tribe Card & Player Chip Styling** | Streamline tribe cards and castaway tokens (compact pill buttons with 18px avatar, tight padding, and clean typography). | Tribe cards fit neatly in view; headers display tribe color dot, name, player count badge, and Edit button. |
| **FR-6** | **Dual Interaction (Drag & Drop + Click-to-Move)** | Support both HTML5 drag-and-drop between all containers and a click-to-transfer mechanism (clicking a castaway highlights them, clicking a destination tribe moves them). | Users can reorganize contestants via smooth drag-and-drop OR via quick 1-click targeting. |
| **FR-7** | **Integrated Merge Tribe Placement** | Display Merge Tribe within the destination grid with distinct royal purple/gold styling and clean drop zone. | Merge Tribe card accepts drops and click-to-move targets reliably. |
| **FR-8** | **Batch Controls & Episode Filtering** | Maintain "+ Add Tribe", "Unassign All Castaways", "Merge All Players", and "Target Episode" dropdown selector without emojis. | All actions work seamlessly with instant state updates. Clicking "Unassign All Castaways" automatically expands the Unassigned Castaways panel. |
| **FR-9** | **Cross-Page Synchronization** | Implement identically across `index.html` (in-page Add Points modal) and `draft.html` (draft dashboard). | Both pages offer the identical modern visualizer experience. |

---

## 4. Test Data State Initialization Plan

To verify the redesign immediately without manual data entry:
- **Test URL**: `http://localhost:8000/index.html?league=jackson-ryan-league&season=season-51` and `http://localhost:8000/draft.html?league=jackson-ryan-league&season=season-51&openBulkEdit=true`
- **Initial State**:
  - Season 51 test data in `dev_testing/seasons/season-51/contestants` contains 18 castaways distributed across Toka, Savu, and custom tribes.
  - Clicking "Unassign All Players" puts all 18 contestants into Unassigned, allowing direct testing of the staging bench.
  - Moving players into Toka, Savu, or Merge Tribe tests drop zone feedback and compact chip re-rendering.

---

## 5. Verification Plan & Acceptance Criteria

- [ ] Local dev environment runs on `localhost:8000` under `dev_testing/` namespace.
- [ ] Zero live production data modified.
- [ ] Unassigned pool is immediately accessible without vertical scrolling.
- [ ] Tribe boxes are compact and fit naturally within standard screen viewports (1280px-1512px width, 700px-900px height).
- [ ] Drag-and-drop between all containers operates smoothly with short travel distances.
- [ ] Quick-move / click-to-move interaction works as a smooth alternative to dragging.
- [ ] "Unassign All Players", "➕ Add Tribe", and "🤝 Merge All Players" function reliably.
- [ ] Modal behaves consistently on both `index.html` and `draft.html`.
- [ ] Test data segregated and reset instructions documented in `walkthrough.md`.
