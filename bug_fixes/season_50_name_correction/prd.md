# PRD: Season 50 Name Correction ("In the Hands of the Fans")

**Status**: Complete & Verified  
**Category**: `bug_fixes`  
**Folder**: `bug_fixes/season_50_name_correction/`  
**Target Files**:
- [`seasons/season-50.json`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/seasons/season-50.json)
- [`js/config.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/js/config.js)
- [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html)
- [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html)
- [`service-worker.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/service-worker.js)

---

## 1. Problem Statement & Scope

Across the application and data configs, Season 50 is mistakenly referred to with the subtitle `"In the Hands of the Gods"`. The accurate official name for Season 50 is **`"Season 50: In the Hands of the Fans"`** (or subtitle **`"In the Hands of the Fans"`**).

This correction affects:
1. Season JSON metadata definition in `seasons/season-50.json`.
2. League season configuration definitions in `js/config.js`.
3. Hardcoded league fallback configs in `index.html` and `draft.html`.
4. Header subtitle fallback in `draft.html`.

---

## 2. Requirements & User Experience

### 2.1 Season 50 JSON Metadata (`seasons/season-50.json`)
- Update `title` property from `"Survivor 50: In the Hands of the Gods"` to:
  `"Season 50: In the Hands of the Fans"`.

### 2.2 League Configuration Objects (`js/config.js`, `index.html`, `draft.html`)
- In the season definition for `id: 'season-50'`:
  - Change `name: 'Season 50: In the Hands of the Gods'` to:
    `name: 'Season 50: In the Hands of the Fans'`
  - Ensures all season dropdown selectors, sidebars, and badges display the correct title.

### 2.3 Draft Board Header Fallback (`draft.html`)
- In `draft.html` line 1982:
  - Update fallback subtitle from `'In the Hands of the Gods'` to `'In the Hands of the Fans'`.

---

## 3. Acceptance Criteria

- [x] `seasons/season-50.json` reflects `"In the Hands of the Fans"`.
- [x] `js/config.js` season 50 entry reflects `name: 'Season 50: In the Hands of the Fans'`.
- [x] `index.html` season 50 entry reflects `name: 'Season 50: In the Hands of the Fans'`.
- [x] `draft.html` season 50 entry and header fallback reflect `"In the Hands of the Fans"`.
- [x] Switching to Season 50 on `index.html` or `draft.html` renders `"In the Hands of the Fans"` with no remaining occurrences of `"Gods"`.
- [x] Zero live production Firebase mutations; `dev_testing/` isolation remains active.
