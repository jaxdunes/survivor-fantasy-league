# Implementation Plan: Mobile Graph Icon-Based Zoom / Unzoom Toggle

**Status**: Implemented & Verified  
**Category**: `bug_fixes`  
**Folder**: `bug_fixes/mobile_graph_view_toggle/`  
**Target File**: `index.html` (`Icons` object and `TeamScoreGraph` component)  

---

## 1. User Review Required (Mandatory Gate)

> [!NOTE]
> User reviewed the icon redesign proposal and provided sign-off ("Go ahead"). All implementation and verification steps are complete.

---

## 2. Proposed Changes & Technical Architecture

### Target File: `index.html`

#### 1. Add `ZoomIn` and `ZoomOut` Icons to `Icons` Dictionary (lines ~590-605)
```javascript
ZoomIn: createIcon('<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line>'),
ZoomOut: createIcon('<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line>')
```

#### 2. Replace the Segmented Text Pill with a Simple Icon Button Above the Graph on the Right
Remove the old pill container and place a compact icon button aligned to the right, directly above the graph area:
```javascript
// Compact Zoom/Unzoom Icon Toggle positioned above graph on the right
h('div', { className: 'graph-mobile-view-toggle flex justify-end items-center mb-1 w-full pr-1' },
    h('button', {
        type: 'button',
        onClick: (e) => {
            e.stopPropagation();
            handleMobileViewToggle(mobileViewMode === 'fit' ? 'scroll' : 'fit');
        },
        title: mobileViewMode === 'fit' ? 'Zoom in (scrollable view)' : 'Zoom out (fit to screen)',
        'aria-label': mobileViewMode === 'fit' ? 'Zoom in graph' : 'Zoom out graph',
        className: 'p-1.5 sm:p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-amber-300 hover:text-amber-100 border border-amber-900/60 hover:border-amber-500/60 shadow-md transition-all cursor-pointer flex items-center justify-center'
    },
        mobileViewMode === 'fit'
            ? h(Icons.ZoomIn, { size: 18, className: 'stroke-[2.5]' })
            : h(Icons.ZoomOut, { size: 18, className: 'stroke-[2.5]' })
    )
)
```

#### 3. Dynamic Fit vs. Zoomed Scroll Behavior
- Retains existing tested logic:
  - In `fit` mode: Container has `overflow-hidden`, SVG scales to 100% width, icon displays `ZoomIn`.
  - In `scroll` mode: Container has `overflow-x-auto min-w-[580px] touch-pan-x`, allowing horizontal scrolling, and icon displays `ZoomOut`.
- Tapping the icon smoothly toggles the mode and switches the icon.

---

## 3. Safe Dev Testing & Environment Isolation

> [!CRITICAL]
> **Live Production Firebase data must NEVER be read, written, or mutated during local development and testing.**

- Dev testing runs on `http://localhost:8000/index.html?league=jackson-ryan-league&season=season-51`.
- `dev_testing/` namespace guard verified active in [`js/config.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/js/config.js).
- Zero live mutations.

---

## 4. Phased Execution Steps

### Phase 1: Planning & Interactive Review Gate (Completed)
- Presented updated plan with icon design and received user sign-off.

### Phase 2: Implementation (Completed)
- Updated `Icons` in `index.html` to add `ZoomIn` and `ZoomOut`.
- Replaced the pill switcher in `TeamScoreGraph` with the right-aligned icon toggle.

### Phase 3: Browser Verification (Completed)
- Validated in browser subagent on mobile viewport (390x844):
  1. Verified the segmented pill is removed.
  2. Verified the simple icon button is placed above the graph on the right.
  3. Verified it shows `ZoomIn` (`🔍+`) when unzoomed (Fit mode).
  4. Tapped the icon: verified graph zoomed in and icon changed to `ZoomOut` (`🔍-`).
  5. Tapped the icon again: verified graph returned to fit mode and icon returned to `ZoomIn` (`🔍+`).
  6. Verified desktop viewport (1280x800) where button is completely hidden.
- Captured screenshots and embedded in `walkthrough.md`.

---

## 5. Verification Checklist

- [x] Segmented text pill is completely removed.
- [x] Simple icon button appears above the graph on the right.
- [x] Icon is `ZoomIn` (`🔍+`) in Fit mode.
- [x] Icon switches to `ZoomOut` (`🔍-`) in Zoom mode.
- [x] Tapping toggles between fitted and scrollable graph states.
- [x] `localStorage` persists the state.
- [x] Desktop remains clean.
