# Implementation Plan: Website Load Time Optimization

**Location**: `bug_fixes/website_load_time_optimization/implementationplan.md`  
**Status**: Proposed (Awaiting User Review)  
**PRD Reference**: `bug_fixes/website_load_time_optimization/prd.md`  

---

## 1. Safety & Data Isolation Directive

> [!CRITICAL]
> **Production Data Safety Directive**: All testing must be conducted strictly using isolated test datasets (`dev_testing/` database path under local dev server on `localhost:8000`). Production database state (`leagues/`, `seasons/`) must remain completely untouched.

- Dev environment auto-guard in `js/config.js` will route all Firebase calls to `dev_testing/`.
- Banner `🧪 DEV MODE | Firebase Path: dev_testing/` must be visible in testing.

---

## 2. Proposed Architectural Changes & Affected Files

### Target Files:
1. **`index.html`**:
   - Remove `<script src="https://unpkg.com/lucide@latest"></script>`.
   - Remove `setTimeout(initializeApp, 500)`; execute immediately on DOM ready.
   - Replace `cdn.tailwindcss.com` with `<link rel="stylesheet" href="css/tailwind.min.css">`.
   - Add Google Fonts `preconnect` hints and prune unused families (`Playfair Display`, `Permanent Marker`).
   - Remove `?t=Date.now()` on season JSON fetch; attach Firebase listener in parallel.
   - Hydrate `seasonData`, `scores`, `playerTeams`, and `eliminationOrder` synchronously from `localStorage`.
   - Persist incoming Firebase snapshots to `localStorage` on update.
2. **`draft.html`**:
   - Remove `<script src="https://unpkg.com/lucide@latest"></script>`.
   - Remove `setTimeout(initializeApp, 500)`.
   - Replace `cdn.tailwindcss.com` with `<link rel="stylesheet" href="css/tailwind.min.css">`.
   - Add font `preconnect` hints.
   - Remove `?t=Date.now()` on season JSON fetch.
   - Hydrate initial draft and team state from `localStorage`.
3. **`chat.html`**:
   - Replace `cdn.tailwindcss.com` with `<link rel="stylesheet" href="css/tailwind.min.css">`.
   - Add font `preconnect` hints.
4. **`service-worker.js`**:
   - Add `./js/episode-filter.js` and `./css/tailwind.min.css` to `urlsToCache`.
   - Increment cache version to `survivor-51-v8`.
   - Implement **Stale-While-Revalidate** for project files and **Cache-First** for third-party libraries and fonts.
5. **`css/tailwind.min.css`** (New File):
   - Pre-compiled CSS file containing the complete set of Tailwind utility classes used across the project, eliminating the 398 KB runtime JavaScript compiler.

---

## 3. Test Data State Initialization Strategy

- Ensure local python dev server is running on `http://localhost:8000`.
- Use test league URL:
  `http://localhost:8000/index.html?league=jordan-denver-league&season=season-51`
- Verify test state:
  - Season 51 active with Jordan / Denver League teams (Ryan, Jordan, Scott, Hayley, Ashlynn).
  - Draft state, scores, and eliminated players present in `dev_testing/`.
  - Check browser console for zero runtime errors and verify load timings.

---

## 4. Phased Implementation Steps

### Phase 1: Pre-Compile Tailwind CSS & Purge Unused Fonts
- [ ] Scan project HTML and JS files for all Tailwind classes used.
- [ ] Generate `css/tailwind.min.css` ensuring all colors, gradients, grid/flex utilities, animations, and responsive breakpoints are preserved.
- [ ] Add `preconnect` links for Google Fonts in `index.html`, `draft.html`, and `chat.html`.
- [ ] Trim font query in `index.html` to `Bebas+Neue&family=Caveat:wght@700`.

### Phase 2: Eliminate Dead Dependencies & Artificial Delay
- [ ] Remove `<script src="https://unpkg.com/lucide@latest"></script>` from `index.html` and `draft.html`.
- [ ] Remove `window.addEventListener('load', () => setTimeout(initializeApp, 500))`. Mount `initializeApp()` immediately upon DOM readiness.
- [ ] Remove `?t=Date.now()` timestamp cache-buster from season JSON fetches in `index.html` and `draft.html`.

### Phase 3: Optimistic State Hydration (Zero-Flicker Leaderboard)
- [ ] In `index.html`, initialize `seasonData`, `scores`, `playerTeams`, and `eliminationOrder` with lazy state initializers from `localStorage`.
- [ ] In Firebase `.on('value')` listeners, mirror latest incoming snapshots into `localStorage` so future reloads paint instantly.
- [ ] Attach `database.ref('seasons/' + activeSeasonId)` concurrently instead of waiting for JSON fetch callback.

### Phase 4: Modernize Service Worker Caching Strategy
- [ ] In `service-worker.js`, add `./js/episode-filter.js` and `./css/tailwind.min.css` to `urlsToCache`.
- [ ] Update `CACHE_NAME` to `survivor-51-v8`.
- [ ] Update `fetch` event handler to implement **Stale-While-Revalidate** (serve immediately from cache if available, while fetching update in background).
- [ ] For CDN scripts (React, Firebase, Fonts), implement **Cache-First** with background update.

### Phase 5: Verification & Safety Audit
- [ ] Test `index.html`, `draft.html`, and `chat.html` on `localhost:8000`.
- [ ] Verify identical visual styling, fonts, icons, modals, and animations.
- [ ] Verify full scoring engine, filter modes, elimination actions, and draft board functionality remain 100% intact.
- [ ] Verify zero mutations to production Firebase paths.
- [ ] Benchmark and record new load time metrics in `walkthrough.md`.
