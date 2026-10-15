# PRD: Draft Card Elimination Badge & UI Polish Bug Fixes

**Status**: Complete & Verified  
**Category**: `bug_fixes`  
**Folder**: `bug_fixes/draft_card_and_ui_fixes/`  
**Target Files**:
- [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html)
- [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html)
- [`js/episode-filter.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/js/episode-filter.js)
- [`service-worker.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/service-worker.js)
- [`chat.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/chat.html)

---

## 1. Problem Statement & Scope

A collection of specific UI polish bugs and copy inconsistencies were identified across the application:

1. **Button Text in Add Points Modal**:
   - In the "Add Points" modal on `index.html`, the button next to "Player Selection" currently reads `"Edit Tribe"`, whereas it opens the Bulk Tribe Management visualizer and should read **`"Edit Tribes"`** (plural), consistent with the rest of the application.

2. **Draft Board Castaway Card Elimination Badge Overlap**:
   - On `draft.html` castaway cards, when a player is voted out, the elimination badge (`💀 VOTED OUT (EP ${elimEp})`) is placed in the top badge flex row next to the assigned team badge.
   - Because this row does not reserve space (`pr-24`) for the absolutely positioned avatar head (`top-2 right-2`), the elimination badge collides with or tucks partially/fully behind the castaway's head avatar, especially in multi-column desktop grids or with longer team names.

3. **Season Header Graph Emoji**:
   - On `index.html`, the main title currently renders with a chart emoji prefix: `📊 SURVIVOR 51 SCORING`. The graph emoji should be removed so it cleanly renders as `SURVIVOR 51 SCORING` (or the dynamic season title).

4. **Episode Tracker TV Emoji, Title Rename, and Historical State Explanatory Copy**:
   - The TV emoji (`📺`) preceding "Episodes Scored:" in the tracker box should be removed.
   - The box will be renamed to **`"Episode History"`**.
   - Clear explanatory helper copy needs to be added to inform users that selecting an episode allows them to view the historical state of the competition (scores, standings, tribe rosters) as of that specific episode.

5. **Mobile Event Breakdown Text Cutoff**:
   - In the "Episode & Player Event Breakdown" below the progression graph on `index.html` (`TeamEventStackedBarChart`), event cards use strict `truncate` classes on the event name and note.
   - On mobile screens, the narrow card width causes event names (e.g., "Gets Votes and Survives (1 pt per vote)", "Voted out with idol in pocket") and notes to be severely cut off into ellipses, making them unreadable.
   - Text must be allowed to wrap naturally (`break-words whitespace-normal`) across both the All-Team and Single-Contestant event lists so mobile users can clearly read every event and note.

---

## 2. Requirements & User Experience

### 2.1 "Edit Tribes" Button Copy (`index.html`)
- In `index.html` within the Add Points modal (`#modal-add-points`), line 4196:
  - Change `h('span', {}, 'Edit Tribe')` to `h('span', {}, 'Edit Tribes')`.
  - Maintain the existing `🏕️` icon and click behavior.

### 2.2 Draft Board Elimination Badge Layout (`draft.html`)
- On castaway cards (`PlayerCard` in `draft.html`):
  - Add `pr-24` to the top badge flex container (`h('div', { className: 'flex justify-between items-start mb-2 flex-wrap gap-1 pr-24' })`).
  - Add a minimum header height (`min-h-[110px]`) to the tribe color header to guarantee the avatar and its status indicators never overflow the banner.
  - When a contestant is eliminated and has an assigned team, badges wrap cleanly within the left column without extending into the right 96px coordinate space occupied by the avatar head.

### 2.3 Season Title Emoji Removal (`index.html`)
- In `index.html` line 3718:
  - Remove `📊 ` from the `h1` title text template so it cleanly displays `${(seasonData && seasonData.title) ? seasonData.title.toUpperCase() : ...} SCORING`.

### 2.4 Episode Tracker Renaming, TV Emoji Removal, and Explanatory Text (`js/episode-filter.js` & `index.html`)
- In `UniversalEpisodeTracker` (`js/episode-filter.js`) and `EpisodesScoredTracker` (`index.html`):
  - Remove the `📺` emoji.
  - Rename `"Episodes Scored:"` to **`"Episode History:"`** (user confirmed).
  - Add a dedicated, responsive explanatory subtitle:
    > *"Select any episode to view the historical state of the competition, scores, and rosters as of that episode."*
  - Ensure clear typography and spacing across both desktop and mobile viewports.

### 2.5 Mobile Event Breakdown Full Text Wrapping (`index.html`)
- In `TeamEventStackedBarChart` (`index.html`):
  - In the All-Team event cards (lines ~1110–1133) and Single-Contestant event cards (lines ~1068–1083):
    - Replace restrictive `truncate` classes with `break-words whitespace-normal leading-snug`.
    - Allow event names and notes to wrap onto multiple lines cleanly on mobile viewports.
    - Set the points badge to `shrink-0 self-start sm:self-center` so it aligns neatly alongside wrapped event descriptions.
  - Also ensure expanded contestant breakdown items (lines ~3975–3995) wrap cleanly without truncation.

---

## 3. Acceptance Criteria

- [x] Button in Add Points modal reads **"Edit Tribes"** (not "Edit Tribe").
- [x] On `draft.html` castaway cards, the elimination badge `💀 VOTED OUT (EP X)` is never hidden behind the avatar head.
- [x] The graph emoji (`📊`) is removed from the season scoring heading (`Survivor 51 Scoring`).
- [x] The TV emoji (`📺`) is removed from the episode tracker box.
- [x] The episode tracker box is renamed to **"Episode History"**.
- [x] Clear explanatory text is displayed indicating users can select an episode to view historical competition state.
- [x] On mobile viewports, event cards in the Episode & Player Event Breakdown display full text without truncation cutoff.
- [x] Dev environment isolation remains intact (`dev_testing/` path guard).
- [x] Zero live production Firebase mutations.
