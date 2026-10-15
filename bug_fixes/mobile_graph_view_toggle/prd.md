# PRD: Mobile Graph View Toggle (Icon-Based Zoom / Unzoom)

**Status**: Implemented & Verified  
**Category**: `bug_fixes`  
**Location**: `bug_fixes/mobile_graph_view_toggle/prd.md`  
**Target File**: `index.html` (`TeamScoreGraph` component, `Icons` definition)  

---

## 1. Problem Statement & User Feedback

In the initial implementation, a dual-button segmented text pill (`[ 📱 Fit to Screen | 🔍 Zoom / Scroll ]`) was placed below the visualization tabs.
**User Feedback**:
> *"I dont lik ethe fit to screen or zoom/scroll selecting. I would like the zoom and unzoom to be a simple icon above the graph on the right. I would like the icons to change to indicate zoom and unzoom"*

The text pill selector was deemed too visually intrusive and took up unnecessary vertical space. Replacing it with a clean, single-action toggle icon button placed above the graph on the right streamlines the UI, keeps the focus on the visualization, and provides immediate visual feedback.

---

## 2. Goals & User Experience

- **Single Compact Icon Button**:
  - Located directly **above the graph on the right** side.
  - Replaces the segmented pill selector.
- **Dynamic Icon State**:
  - When in **Unzoomed / Fit mode** (graph fits 100% of the screen width):
    - Shows a **Zoom In** icon (magnifying glass with a `+` sign) to prompt the user that tapping will zoom in.
    - Tooltip / title: `"Zoom in (scrollable view)"`.
  - When in **Zoomed / Scroll mode** (graph is expanded with horizontal touch-scroll):
    - Shows a **Zoom Out** icon (magnifying glass with a `-` sign) to prompt the user that tapping will fit to screen.
    - Tooltip / title: `"Zoom out (fit to screen)"`.
- **Seamless State Toggle & Persistence**:
  - Tapping the icon toggles `mobileViewMode` between `'fit'` and `'scroll'`.
  - Persists preference in `localStorage` (`survivor_mobile_graph_view: 'fit' | 'scroll'`), defaulting to `'fit'`.
- **Aesthetic Integration**:
  - Button styled in the Survivor dark slate & amber aesthetic:
    - `bg-slate-950/80 hover:bg-slate-800 text-amber-300 hover:text-amber-100 border border-amber-900/60 shadow-md p-2 rounded-xl transition-all cursor-pointer`
- **Responsive Behavior**:
  - Positioned neatly above the graph on the right. On desktop, the graph already renders full-width; the zoom toggle is mobile/small-screen focused (`graph-mobile-view-toggle`).

---

## 3. Detailed Technical Specifications

### 3.1 Icons in `index.html`
Add Lucide/Feather-standard `ZoomIn` and `ZoomOut` SVG paths to `Icons`:
```javascript
ZoomIn: createIcon('<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line>'),
ZoomOut: createIcon('<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line>')
```

### 3.2 Icon Button Placement in `TeamScoreGraph`
Above the graph container on the right side:
```javascript
h('div', { className: 'graph-mobile-view-toggle flex justify-end items-center mb-1.5 w-full px-1' },
    h('button', {
        type: 'button',
        onClick: () => handleMobileViewToggle(mobileViewMode === 'fit' ? 'scroll' : 'fit'),
        title: mobileViewMode === 'fit' ? 'Zoom in (scrollable view)' : 'Zoom out (fit to screen)',
        className: 'p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-amber-300 hover:text-amber-100 border border-amber-900/60 hover:border-amber-500/60 shadow-md transition-all cursor-pointer flex items-center justify-center'
    },
        mobileViewMode === 'fit'
            ? h(Icons.ZoomIn, { size: 18, className: 'stroke-[2.5]' })
            : h(Icons.ZoomOut, { size: 18, className: 'stroke-[2.5]' })
    )
)
```

---

## 4. Acceptance Criteria

- [x] Segmented text selector (`📱 Fit to Screen | 🔍 Zoom / Scroll`) is removed.
- [x] A compact icon button is positioned above the graph on the right.
- [x] In unzoomed (Fit) mode, the icon displays `ZoomIn` (`🔍+`).
- [x] Tapping the icon zooms the graph into scrollable mode (`min-w-[580px]`).
- [x] In zoomed mode, the icon dynamically changes to `ZoomOut` (`🔍-`).
- [x] Tapping the icon again collapses the graph back to fit 100% of the screen width.
- [x] User choice persists in `localStorage`.
- [x] Clean desktop layout without interference.
- [x] Zero live Firebase mutations (`dev_testing/` namespace guard).
