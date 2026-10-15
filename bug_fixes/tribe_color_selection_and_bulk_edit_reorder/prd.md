# Product Requirements Document (PRD)

## Bug Fix: Tribe Color Selection, Bulk Edit Layout Reordering, and Cross-Screen Tribe Edit Navigation

**Branch**: `bug_fix/tribe-color-selection-and-bulk-edit`  
**Folder**: `bug_fixes/tribe_color_selection_and_bulk_edit_reorder/`  
**Target Files**: `draft.html`, `index.html`, `js/scoring-engine.js`  
**Status**: In Progress  

---

### 1. Problem Statement & Background

In the Survivor Fantasy League platform, administrators manage tribe memberships across episodes using both the **Draft Board** (`draft.html`) and the **Add Points** modal on the scoring dashboard (`index.html`). Several usability and functional defects have been identified in the tribe management workflow:

1. **Broken Tribe Color Picker in Add Tribe Modal**:
   When an administrator attempts to add a new custom tribe via the "➕ Add Tribe" sub-modal, clicking on color theme swatches (Yellow, Purple, Blue, Green, Red, Orange, Pink, Black) fails to visually update the selected state. The Tribal Council theme CSS (`body.theme-tribal`) applies aggressive `!important` declarations to background colors, border colors, and box shadows (specifically targeting Tailwind's `bg-*-50` and border utilities). This completely suppresses Tailwind's `ring-2` active state indicators and forces all swatches into a dark brown box with an amber border—except Orange, which lacked the override and appeared permanently selected. As a result, the administrator cannot perceive or confirm their color selection.

2. **Missing Custom Tribe Color Presentation in Menus & Modals**:
   In `index.html`, custom tribes are not rendered with their chosen color themes in the "Add Points" modal's Player Selection section. `getTribeDotColor` was invoked without passing `customTribes`, and `getTribeBadgeColor` hardcoded only the standard Season 50/51 tribes, causing any newly created custom tribe to default to generic dark slate with orange dots.

3. **Suboptimal Multi-Edit Tribe Screen Layout**:
   In the Visual Bulk Tribe Edit Dashboard (`draft.html`), all tribe containers (`availableTribes`) were rendered in an unsegmented 3-column grid. Because "Merge Tribe" was inserted immediately after the starting tribes, it occupied Column 3 alongside the two original tribes (Toka and Savu). When a new tribe was added, it bumped Merge Tribe or caused awkward grid wraps. Competing pre-merge tribes (both original and newly added tribes) should be grouped side-by-side at the top, with the destination **Merge Tribe** container arranged distinctly at the bottom of the screen.

4. **Missing "Edit Tribe" Button in Add Points Player Selection**:
   When entering scores in `index.html` via the "➕ ADD POINTS" modal, administrators often discover that a contestant was swapped or belongs to a different tribe for that episode. Currently, there is no direct action to adjust tribes from this section; the admin must dismiss the modal and leave the page. An **"Edit Tribe"** button is needed directly in the Player Selection section of the "Add Points" modal that navigates seamlessly to the Visual Bulk Tribe Edit Dashboard in `draft.html` and automatically opens the bulk edit modal.

5. **Test Data Isolation Guard**:
   All verification and automated browser testing must strictly adhere to the `dev_testing/` Firebase namespace guard so that live league and season data remain completely untouched.

---

### 2. Functional Requirements

| ID | Category | Requirement Description | Success Criteria |
|---|---|---|---|
| **FR-1** | Color Selection | Overhaul the color theme selector in `showAddCustomTribeModal` (`draft.html`) with bulletproof styling immune to theme `!important` overrides. | Clicking any color swatch (Yellow, Purple, Blue, Green, Red, Orange, Pink, Black) immediately updates the visual selection with a vibrant border, active ring, and checkmark. A live badge preview displays the tribe name and chosen color in real time. |
| **FR-2** | Color Reset | Cleanly reset modal state upon opening or dismissing. | Opening "Add Tribe" initializes with a clean state and highlights the selected color correctly. |
| **FR-3** | Multi-Edit Layout | Reorganize the Visual Bulk Tribe Edit Dashboard container layout. | Active competing tribes (original tribes e.g. Toka & Savu, plus any newly added custom tribes) are arranged side-by-side at the top. The "Merge Tribe" container is arranged at the bottom as a dedicated merge staging area. Drag-and-drop between all containers remains fully functional. |
| **FR-4** | Cross-Screen Colors | Ensure custom tribe colors and icons render consistently in `index.html`. | Custom tribes created in `draft.html` reflect their assigned colors and dot colors in `index.html`'s "Add Points" Player Selection section and ParchmentContestantTag. |
| **FR-5** | "Edit Tribe" Button | Add an "Edit Tribe" button to the Player Selection header in the "Add Points" modal (`index.html`). | The button is prominently displayed in the Player Selection header. Clicking it links to `draft.html?league={activeLeagueId}&season={activeSeasonId}&openBulkEdit=true&ep={selectedEp}`. |
| **FR-6** | Deep-Link Auto-Open | Support `openBulkEdit` query parameter in `draft.html`. | When `draft.html` loads with `openBulkEdit=true` or `openBulkEdit=1`, it automatically opens the Visual Bulk Tribe Edit Dashboard, initializes the target episode from the `ep` parameter if provided, and cleans up the URL query parameter. |
| **FR-7** | Data Isolation | Isolate test mutations during verification. | All testing operates on `localhost` with Firebase writes directed to `dev_testing/` namespace or test leagues. No production nodes are modified. |

---

### 3. User Experience & Design Specifications

- **Add Tribe Modal Color Swatches**:
  - Grid of color swatches styled with explicit inline CSS / scoped classes to resist `theme-tribal` overrides.
  - Active swatch state: distinct glowing border (`box-shadow`), white/contrasting ring, scale bump (105%), and an explicit checkmark (`✓`) badge over the color circle.
  - Live Preview Pill: Displays `[Dot/Emoji] Tribe Name` using the chosen palette gradient and badge text so administrators preview the exact look before saving.
- **Visual Bulk Tribe Dashboard Layout**:
  - **Upper Section**: "Active Competing Tribes" container grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`). Original tribes appear first, with newly added tribes positioned directly next to them in sequence.
  - **Lower Section**: "Merge Tribe" container clearly demarcated at the bottom (`w-full mt-4 bg-purple-950/30 border-2 border-purple-500/50 rounded-2xl p-4`), offering a dedicated drag-and-drop target for merged players.
- **Add Points Modal - Player Selection Header**:
  - Located beside the "Player Selection" title and count badge.
  - Styled as a compact, sleek button: `🏕️ Edit Tribes` with subtle amber/orange outline matching the tribal theme.
  - On click: redirects to `draft.html?league=...&season=...&openBulkEdit=true&ep=...`.

---

### 4. Non-Functional & Safety Requirements

- **Theme Compatibility**: Must work seamlessly across both standard light mode and `theme-tribal` dark mode.
- **Data Integrity**: Season custom tribes and contestants must serialize cleanly to Firebase Realtime Database.
- **Zero Production Mutation**: Local execution on `localhost:8000` must remain trapped in the `dev_testing/` prefix as verified by `js/config.js`.
