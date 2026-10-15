# Implementation Plan: Season 50 Name Correction ("In the Hands of the Fans")

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

## 1. User Review Required (Mandatory Gate)

> [!IMPORTANT]
> **Implementation must NEVER begin without explicit user sign-off.**  
> User explicitly signed off ("Proceed, but you don't have to test for things you have previously fixed. Just fix the Season 50 title"). Implementation completed and verified.

---

## 2. Proposed Changes

### 2.1 Update `seasons/season-50.json`
- **Location**: Line 3.
- **Change**:
  ```diff
  - "title": "Survivor 50: In the Hands of the Gods",
  + "title": "Season 50: In the Hands of the Fans",
  ```

---

### 2.2 Update `js/config.js`
- **Location**: Line 49.
- **Change**:
  ```diff
  - name: 'Season 50: In the Hands of the Gods', 
  + name: 'Season 50: In the Hands of the Fans', 
  ```

---

### 2.3 Update `index.html`
- **Location**: Line 531 & Line 2510.
- **Change**:
  - Updated Season 50 name in config object.
  - Updated `applyMergedSeason` so the preset title takes precedence over stale `localStorage` keys.

---

### 2.4 Update `draft.html`
- **Location**: Line 357, Line 625 & Line 1982.
- **Changes**:
  - Updated Season 50 name in config object.
  - Updated header subtitle fallback.
  - Updated `applyMergedSeason` to prioritize preset title over stale `localStorage` cache.

---

## 3. Safe Dev Testing & Environment Isolation

> [!CRITICAL]
> **Live Production Firebase data must NEVER be read, written, or mutated during local development and testing.**

- All testing occurred on `localhost:8000` under the `dev_testing/` namespace guard.
- Zero production database mutations took place.

---

## 4. Verification Checklist

- [x] `seasons/season-50.json` updated with `"Season 50: In the Hands of the Fans"`.
- [x] `js/config.js` updated with `name: 'Season 50: In the Hands of the Fans'`.
- [x] `index.html` updated with `name: 'Season 50: In the Hands of the Fans'`.
- [x] `draft.html` updated with `name: 'Season 50: In the Hands of the Fans'` and `'In the Hands of the Fans'`.
- [x] Bumped `service-worker.js` cache to `'survivor-51-v12'`.
- [x] Browser verification confirmed headers on both `index.html` and `draft.html` render `SEASON 50: IN THE HANDS OF THE FANS`.
- [x] Zero mutations on live production Firebase nodes.
