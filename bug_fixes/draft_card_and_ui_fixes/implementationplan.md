# Implementation Plan: Draft Card Elimination Badge & UI Polish Bug Fixes

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

## 1. User Review Required (Mandatory Gate)

> [!IMPORTANT]
> **Implementation must NEVER begin without explicit user sign-off.**  
> User explicitly signed off ("alright lets go"). All changes have been implemented and verified.

---

## 2. Proposed Changes & Technical Architecture

### 2.1 Fix "Edit Tribe" Button Copy (`index.html`)
- **Location**: Line 4196 of `index.html` inside `#modal-add-points`.
- **Change**:
  ```diff
  - h('span', {}, 'Edit Tribe')
  + h('span', {}, 'Edit Tribes')
  ```

---

### 2.2 Prevent Castaway Card Elimination Badge from Hiding Behind Head (`draft.html`)
- **Location**: Lines 1813–1825 of `draft.html` inside `PlayerCard`.
- **Change**:
  - Add `min-h-[110px]` to the tribe-colored header banner so the avatar stack (`w-20`, `top-2 right-2`, plus badge) always fits without vertical overflow.
  - Add `pr-24` to the top badge flex container so badges cannot extend into the right 96px coordinate space occupied by the avatar head.
  ```diff
  - h('div', { className: `p-4 bg-gradient-to-r ${getTribeColor(tribeName)} text-white relative` },
  + h('div', { className: `p-4 min-h-[110px] bg-gradient-to-r ${getTribeColor(tribeName)} text-white relative` },
      h('div', { className: 'absolute top-2 right-2 flex flex-col items-center z-10' },
          h('img', { ... }),
          isEliminated && h('span', { className: 'mt-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-md border border-white whitespace-nowrap' }, `OUT EP ${elimEp}`)
      ),
  -   h('div', { className: 'flex justify-between items-start mb-2 flex-wrap gap-1' },
  +   h('div', { className: 'flex justify-between items-start mb-2 flex-wrap gap-1 pr-24' },
          h('div', { className: 'flex items-center gap-1.5 flex-wrap' },
              assignedTeam ? ... : ...,
              isEliminated && h('div', { className: 'px-2.5 py-1 rounded-full text-xs font-black bg-red-600 text-white shadow-md flex items-center gap-1 border border-red-300/50' },
                  `💀 VOTED OUT (EP ${elimEp})`
              )
          )
      ),
  ```

---

### 2.3 Remove Graph Emoji (`📊`) Next to Survivor 51 (`index.html`)
- **Location**: Line 3718 of `index.html`.
- **Change**:
  ```diff
  - }, `📊 ${(seasonData && seasonData.title) ? seasonData.title.toUpperCase() : (activeSeasonId === 'season-50' ? 'SURVIVOR 50' : 'SURVIVOR 51')} SCORING`),
  + }, `${(seasonData && seasonData.title) ? seasonData.title.toUpperCase() : (activeSeasonId === 'season-50' ? 'SURVIVOR 50' : 'SURVIVOR 51')} SCORING`),
  ```

---

### 2.4 Episode Tracker: Remove TV Emoji (`📺`), Rename Box, and Add Explanatory Text (`js/episode-filter.js` & `index.html`)
- **Location**: Lines 184–217 of `js/episode-filter.js` (`UniversalEpisodeTracker`) and lines 1990–2000 of `index.html` (`EpisodesScoredTracker`).
- **Changes**:
  1. Remove `📺` emoji.
  2. Rename title to **`Episode History:`** (user-selected).
  3. Add clear explanatory helper text indicating that selecting an episode reveals the historical competition state at that point in time:
     ```javascript
     h('p', { className: 'text-[11px] text-gray-500 font-medium' },
         'Select any episode to view the historical state of the competition, scores, and rosters as of that episode.'
     )
     ```
  4. Preserved the viewing badge, legend, and interactive episode pill buttons.
  5. Updated `service-worker.js` cache version (`survivor-51-v11`) and added cache buster parameters to ensure fresh script execution.

---

### 2.5 Enable Multi-Line Text Wrapping on Mobile Event Cards (`index.html`)
- **Location**: Lines 1068–1083 (Single Contestant Detail View) and Lines 1110–1133 (All-Team Overview View) in `TeamEventStackedBarChart` of `index.html`.
- **Changes**:
  1. Removed restrictive `truncate` classes from event names (`ev.name`, `item.event.name`) and notes (`ev.note`, `item.event.note`).
  2. Applied `break-words whitespace-normal leading-snug` so event titles wrap naturally onto 2–3 lines on narrow mobile viewports.
  3. Changed the points badge alignment to `shrink-0 self-start sm:self-center mt-0.5 sm:mt-0` so it anchors cleanly alongside multi-line event titles.
  4. Also applied `break-words whitespace-normal leading-snug` to contestant breakdown items in the expanded team view (lines ~3975–3995) to prevent truncation.

---

## 3. Safe Dev Testing & Environment Isolation

> [!CRITICAL]
> **Live Production Firebase data must NEVER be read, written, or mutated during local development and testing.**

- Dev testing runs on `http://localhost:8000/index.html?league=jackson-ryan-league&season=season-51` and `http://localhost:8000/draft.html?league=jackson-ryan-league&season=season-51`.
- `dev_testing/` namespace guard is automatically active in [`js/config.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/js/config.js).
- Zero live mutations will be performed.

---

## 4. Phased Execution Steps

### Phase 1: Planning & Interactive Review Gate (Complete)
- Presented PRD and Implementation Plan. User provided feedback, chose "Episode History", and gave sign-off.

### Phase 2: Implementation (Complete)
- Modified `index.html`:
  - Updated "Edit Tribes" button copy.
  - Removed `📊` from season title.
  - Updated fallback episode tracker.
  - Replaced `truncate` with `break-words whitespace-normal leading-snug` on event cards in `TeamEventStackedBarChart` and expanded team breakdowns.
- Modified `draft.html`: Added `pr-24` and `min-h-[110px]` to `PlayerCard` header.
- Modified `js/episode-filter.js`: Removed `📺` emoji, updated title to "Episode History:", and added explanatory helper copy.
- Updated `service-worker.js` and script tags to invalidate stale caches.

### Phase 3: Browser Verification (Complete)
- Opened `http://localhost:8000/index.html` in browser:
  1. Verified season header displays without `📊`.
  2. Verified episode tracker displays without `📺`, shows "Episode History:", and displays the explanatory helper copy.
  3. Clicked "Add Points" and verified button says "Edit Tribes".
  4. Inspected Episode & Player Event Breakdown on mobile (390px width) and verified long event names wrap fully without truncation ellipses.
- Opened `http://localhost:8000/draft.html`:
  1. Inspected Brady Booker (eliminated in Ep 3) and verified `💀 VOTED OUT (EP 3)` is cleanly rendered on the left, completely clear of the avatar head.
- Captured screenshots and created `walkthrough.md`.

---

## 5. Verification Checklist

- [x] Button in Add Points modal reads "Edit Tribes".
- [x] Elimination badge on `draft.html` castaway cards is never hidden behind the avatar head.
- [x] Season header title does not contain `📊`.
- [x] Episode tracker box does not contain `📺`.
- [x] Episode tracker displays "Episode History:" and clear historical state explanatory text.
- [x] Mobile event cards in Episode & Player Event Breakdown wrap text without truncation cutoff.
- [x] Verified across mobile and desktop viewports.
- [x] Zero live production Firebase data mutations.
