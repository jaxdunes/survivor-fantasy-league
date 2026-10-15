# Product Requirements Document (PRD)

## Bug Fix & Feature: Tribe Color Selection, Bulk Edit Visualizer In-Page Workflow, and Tribe Management Overhaul

**Branch**: `bug_fix/tribe-color-selection-and-bulk-edit`  
**Folder**: `bug_fixes/tribe_color_selection_and_bulk_edit_reorder/`  
**Target Files**: `draft.html`, `index.html`, `js/scoring-engine.js`  
**Status**: Completed  

---

### 1. Problem Statement & Background

In the Survivor Fantasy League platform, administrators manage tribe memberships across episodes using both the **Draft Board** (`draft.html`) and the **Add Points** modal on the scoring dashboard (`index.html`). Multiple usability defects and feature enhancements were identified:

1. **Unwanted Navigation Away from Add Points Modal to `draft.html`**:
   Previously, clicking the "Edit Tribe" button in the "Add Points" modal on `index.html` navigated the user away to `draft.html`. When an administrator is entering weekly episode scores, leaving the page disrupts their workflow and loses entered score form context. The bulk visualizer needed to open directly in-page on `index.html`. Upon exit (Cancel, Close, or Save Changes), the user must immediately return to the Add Points modal with the updated state of the website (new tribes, edited colors/names, player assignments) immediately reflected.

2. **Broken Tribe Color Picker in Add Tribe Modal**:
   When an administrator attempts to add a new custom tribe via the "➕ Add Tribe" sub-modal, clicking on color theme swatches failed to visually update the selected state due to `body.theme-tribal` `!important` CSS rules overriding Tailwind classes.

3. **Suboptimal Multi-Edit Tribe Screen Layout**:
   In the Visual Bulk Tribe Edit Dashboard, the Merge Tribe container was mixed into the top grid. Competing pre-merge tribes (both original and newly added tribes) should be grouped side-by-side at the top, with the destination **Merge Tribe** container arranged distinctly at the bottom of the screen.

4. **Merge Tribe Edit Button Restriction**:
   The Merge Tribe is a permanent, fixed structure in Survivor and must never have an "Edit Tribe" button, whereas regular competing tribes should have an "Edit Tribe" button allowing administrators to rename them and re-select their color theme.

5. **No Emojis in Add / Edit Tribe Screens**:
   The Add/Edit Tribe screens must maintain a clean, professional aesthetic 100% free of emojis.

6. **Unassign All Players Feature**:
   Admins requested an "Unassign all players" action button on the bulk tribe visualizer that moves all active contestants into the Unassigned category for convenient drag-and-drop redistribution.

7. **Test Data Isolation Guard**:
   All verification and automated browser testing must strictly adhere to the `dev_testing/` Firebase namespace guard so that live league and season data remain completely untouched.

---

### 2. Functional Requirements

| ID | Category | Requirement Description | Success Criteria |
|---|---|---|---|
| **FR-1** | In-Page Bulk Visualizer | Embed the Visual Bulk Tribe Edit Dashboard directly on `index.html` as a high z-index modal overlay (`z-[1100]`). | Clicking "Edit Tribe" in the Add Points modal opens the visualizer in-page without navigating to `draft.html`. Exiting returns directly to Add Points with changes reflected. |
| **FR-2** | Color Selection | Overhaul the color theme selector with bulletproof styling immune to theme `!important` overrides. | Clicking any color swatch immediately updates the visual selection with a vibrant border, active ring, and checkmark. A live badge preview displays the tribe name and chosen color in real time. |
| **FR-3** | Emoji-Free Add/Edit Tribe | Ensure Add and Edit Tribe modal headers and previews are 100% emoji-free. | No emojis appear in the Add or Edit Tribe modal title, labels, or preview tags. |
| **FR-4** | Multi-Edit Layout | Reorganize the Visual Bulk Tribe Edit Dashboard container layout. | Active competing tribes (original tribes Toka & Savu, plus any newly added custom tribes) are arranged side-by-side at the top. "Merge Tribe" container is arranged at the bottom as a dedicated merge staging area. |
| **FR-5** | Unassign All Players | Add an "Unassign All Players" button to the bulk visualizer header. | Moves all active non-eliminated players for the selected episode into the Unassigned bucket. |
| **FR-6** | Edit Tribe per Container | Add an "Edit Tribe" button on each competing tribe card in the bulk visualizer; exclude from Merge Tribe. | Admins can edit competing tribe names and colors. Merge Tribe has no edit button. |
| **FR-7** | Dynamic State Update in Add Points | Player Selection in Add Points modal dynamically re-groups contestants and tribes using episode-aware helpers. | Upon closing bulk edit, new tribes and updated assignments appear instantly in Add Points. |
| **FR-8** | Data Isolation | Isolate test mutations during verification. | All testing operates on `localhost` with Firebase writes directed to `dev_testing/` namespace or test leagues. |

---

### 3. User Experience & Design Specifications

- **Add Points Screen - Edit Tribe Trigger**:
  - Located beside the "Player Selection" title in the Add Points modal (`#btn-edit-tribe`).
  - Opens `#modal-bulk-edit` (`z-[1100]`) on top of the Add Points modal backdrop (`z-index: 1000`).
- **Visual Bulk Tribe Dashboard Layout**:
  - **Upper Section**: "Active Competing Tribes" container grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`). Original tribes appear first, with newly added tribes positioned directly next to them in sequence. Each has an "Edit Tribe" button.
  - **Lower Section**: "Merge Tribe" container clearly demarcated at the bottom, without an "Edit Tribe" button.
  - **Action Header**: "➕ Add Tribe" (`#btn-bulk-add-tribe`), "Unassign All Players" (`#btn-bulk-unassign-all`), "🤝 Merge All Players" (`#btn-bulk-merge-all`), and "✕" (`#btn-bulk-close`).
  - **Footer Controls**: "Cancel" (`#btn-bulk-cancel`) and "Save Changes" (`#btn-bulk-save-changes`). Both close the visualizer and return immediately to the Add Points screen.
- **Add / Edit Custom Tribe Modal**:
  - Embedded as `#modal-add-custom-tribe` (`z-[1200]`).
  - Professional tribal typography with clean live preview pill without emojis.
  - Color swatches with distinct glowing borders, contrasting rings, and checkmark badges.
