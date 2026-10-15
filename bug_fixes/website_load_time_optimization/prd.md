# Product Requirements Document (PRD): Website Load Time Optimization

**Version**: 1.0  
**Status**: Draft (Awaiting User Review)  
**Location**: `bug_fixes/website_load_time_optimization/prd.md`  
**Target Files**: 
- `index.html`
- `draft.html`
- `chat.html`
- `service-worker.js`
- `css/tailwind.min.css` (new pre-compiled CSS bundle)  
**Git Branch**: `main` (or dedicated fix branch)  

---

## 1. Executive Summary & Problem Statement

### The Problem
The Survivor Fantasy League website exhibits noticeable startup latency on both desktop and mobile devices. A technical audit revealed multiple cascading bottlenecks:
1. **Artificial Delay**: An intentional `setTimeout(..., 500)` runs *after* the window `load` event (which waits for all network assets) before React is even mounted into `#root`.
2. **Dead Code / Redirect Latency**: An unneeded `<script src="https://unpkg.com/lucide@latest"></script>` downloads **443.4 KB** of JavaScript and incurs an HTTP 302 redirect (~450ms delay) on every load, despite the application using custom inline SVGs for all icons.
3. **Heavy In-Browser JIT Compiler**: The production site loads `https://cdn.tailwindcss.com` (**397.7 KB JS**), which is an experimental runtime compiler that blocks the main thread, inspects thousands of DOM nodes on startup, and dynamically generates styles using a `MutationObserver`.
4. **Render-Blocking `<head>` Scripts**: Over **860 KB** of synchronous scripts reside in `<head>`, preventing the browser from rendering the dark background or any visual content until all files finish downloading and compiling.
5. **Ineffective Service Worker Caching**: `service-worker.js` uses strict **Network-First** for all requests with cache fallback only on network failure. As a result, returning users and PWA app users experience zero caching speedup, re-downloading all assets over the network every visit.
6. **Cache-Busting Fetch**: `fetch('seasons/' + activeSeasonId + '.json?t=' + Date.now())` bypasses HTTP and Service Worker caches on every visit, and delays the Firebase real-time listener.
7. **Empty-State Flicker**: Leaderboard scores, draft state, and teams start as empty `{}` objects even when previously cached in `localStorage`, causing an empty state until Firebase completes its WebSocket handshake.
8. **Unused Google Fonts**: The fonts link downloads `Playfair Display` and `Permanent Marker` (which are never styled anywhere in `index.html`), while omitting connection `preconnect` hints.

### The Goal
Group these performance defects into a comprehensive, zero-functionality-loss optimization bug fix. By removing dead weight, pre-compiling Tailwind CSS, optimizing the Service Worker, eliminating the artificial delay, and hydrating state optimistically from `localStorage`, the website will achieve:
- **Instant First Paint (< 200ms)**
- **Instant repeat visits (< 50ms Stale-While-Revalidate)**
- **~65% reduction in total JavaScript bandwidth (~1.1 MB saved)**
- **Zero loss in features, styles, animations, or real-time Firebase capabilities.**

---

## 2. Safety & Data Isolation Directive

> [!IMPORTANT]
> **Live Production Data Protection**: All development, automated checks, and manual verification MUST run in an isolated test environment using the `dev_testing/` Firebase namespace under `localhost`. Live production Firebase nodes (`leagues/`, `seasons/`) must remain strictly untouched.

- **Dev/Test Environment Guard**: The application must automatically enforce the `dev_testing/` namespace prefix for all Firebase Realtime Database reads and writes (managed by `wrapDatabaseInstance` in `js/config.js`).
- **Production Guard Banner**: Verify `🧪 DEV MODE | Firebase Path: dev_testing/` is visible during local testing.
- **Zero Live Mutations**: Live production paths (`leagues/jackson-ryan-league`, `seasons/season-51`, etc.) will not be modified or queried directly.

---

## 3. Functional & Performance Requirements

### Requirement 1: Eliminate Artificial Render Delay & Mount on DOM Ready
- In `index.html` and `draft.html`, replace the `window.addEventListener('load', () => setTimeout(initializeApp, 500))` construct.
- Mount `initializeApp()` immediately once the DOM is interactive (`DOMContentLoaded` or immediate execution if scripts are placed at bottom of body).
- Ensure error boundaries and initialization routines execute without race conditions.

### Requirement 2: Purge Unused `lucide` Library
- Remove `<script src="https://unpkg.com/lucide@latest"></script>` from `index.html` and `draft.html`.
- Verify all existing inline SVG icons (`Trophy`, `MessageCircle`, `Plus`, `Edit`, `Book`, `Award`, `X`, `ChevronDown`, `Home`, `Users`, `Menu`, `Check`) render identically.

### Requirement 3: Replace In-Browser Tailwind JIT with Pre-Compiled CSS
- Generate a standalone `css/tailwind.min.css` containing all Tailwind utility classes and theme extensions used across `index.html`, `draft.html`, `chat.html`, and `admin-setup.html`.
- Replace `<script src="https://cdn.tailwindcss.com"></script>` with `<link rel="stylesheet" href="css/tailwind.min.css">`.
- Preserve all existing custom classes, animations (`torchFlamePulse`, `smokeRise`, `fireFlicker`), parchment styles, and safe-area utilities.
- Eliminate 398 KB of runtime JavaScript compilation and main-thread blocking.

### Requirement 4: Google Fonts Optimization & Connection Hints
- Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.
- Remove unused font families `Playfair Display` and `Permanent Marker` from `index.html`.
- Retain `Bebas Neue` and `Caveat:wght@700` (used for headings and torch/parchment notes).

### Requirement 5: Upgrade Service Worker to Stale-While-Revalidate & Complete Precache
- In `service-worker.js`:
  - Add missing `./js/episode-filter.js` and `./css/tailwind.min.css` to `urlsToCache`.
  - Bump cache version (e.g. `survivor-51-v8`).
  - Upgrade the fetch handler to **Stale-While-Revalidate** for app files (`.html`, `.js`, `.css`, `.json`), serving cached assets in < 15ms while fetching and caching fresh versions in the background.
  - Implement **Cache-First** for third-party static libraries (React, ReactDOM, Firebase SDKs, Google Fonts).

### Requirement 6: Optimistic State Hydration from `localStorage`
- In `index.html` and `draft.html`:
  - Initialize React state synchronously from `localStorage` for `seasonData`, `playerTeams`, `scores`, and `eliminationOrder`.
  - When Firebase listeners fire, update state and persist the latest snapshot into `localStorage`.
  - Eliminates the empty/blank leaderboard flicker while waiting for Firebase socket connection.

### Requirement 7: Eliminate Cache-Busting Query Parameter on Season JSON
- Remove `?t=' + Date.now()` from `fetch('seasons/' + activeSeasonId + '.json')`.
- Connect the Firebase listener `database.ref('seasons/' + activeSeasonId).on('value', ...)` concurrently with the local preset fetch, preventing unnecessary serialization latency.

---

## 4. Test Data State Initialization Plan

To test the optimizations thoroughly on `localhost`:
1. **Target URL**:
   `http://localhost:8000/index.html?league=jordan-denver-league&season=season-51`
2. **Test State Verification**:
   - Ensure `dev_testing/` banner is displayed.
   - Verify that test data (teams, scores, episode statuses, eliminated players) renders instantly upon refresh.
   - Clear `localStorage` to verify clean initial load behavior, then refresh to verify instant Stale-While-Revalidate cached behavior.

---

## 5. Verification Plan & Acceptance Criteria

- [ ] **Zero Functionality Loss**:
  - Leaderboard scores, episode filter, add points modal, elimination modal, custom tribe editor, chat navigation, and theme toggling work exactly as before.
  - All icons and typography render with exact visual fidelity.
- [ ] **Bandwidth & Load Time Metrics**:
  - Total transferred JavaScript reduced by over 800 KB on fresh load.
  - Lucide script (443 KB) completely removed.
  - `cdn.tailwindcss.com` (398 KB) replaced with lightweight static CSS.
  - Artificial 500ms delay eliminated (mounts immediately on DOM ready).
  - Unused Google Fonts eliminated.
- [ ] **Caching & Performance Verification**:
  - Service Worker serves cached resources on reload in < 25ms.
  - Leaderboard loads immediately from cache without empty-state flashing.
- [ ] **Data Safety**:
  - Zero mutations or calls to live production Firebase paths (`leagues/`, `seasons/`).
