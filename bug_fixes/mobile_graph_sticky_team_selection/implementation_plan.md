# Implementation Plan: Mobile Graph Sticky Team Name Selection

**Target File**: `index.html` (`TeamScoreGraph` component, lines 966-1540)

---

## 1. Overview
Implement dedicated sticky selection state (`selectedTeamId`) and touch gesture handling in `TeamScoreGraph` so that tapping a team name locks its selection until explicitly untapped.

---

## 2. Step-by-Step Implementation

### Step 1: State & Ref Architecture
In `TeamScoreGraph`:
- Destructure `useRef` from `React`.
- Add state: `const [selectedTeamId, setSelectedTeamId] = useState(null);`.
- Retain state: `const [hoveredTeamId, setHoveredTeamId] = useState(null);`.
- Compute: `const activeTeamId = selectedTeamId !== null ? selectedTeamId : hoveredTeamId;`.
- Add refs:
  - `lastTouchTimeRef`: timestamp of last touch event to debounce synthetic clicks.
  - `touchStartXRef`, `touchStartYRef`: start coordinates to distinguish taps from vertical/horizontal scrolls.
  - `isTouchScrollRef`: boolean flag set if touch movement exceeds 8px.
  - `lastPointTouchTimeRef`: debounce ref for chart data points and bars.

### Step 2: Touch & Click Handlers for Legend
Implement `handleTeamToggle`:
```javascript
const handleTeamToggle = (teamId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setSelectedTeamId(prev => (prev === teamId ? null : teamId));
};
```
Attach to legend buttons:
- `onTouchStart`: record initial `clientX` and `clientY`, reset `isTouchScrollRef.current = false`.
- `onTouchMove`: if `|dx| > 8` or `|dy| > 8`, set `isTouchScrollRef.current = true`.
- `onTouchEnd`: if not scrolling, call `handleTeamToggle(s.id, e)` and record `lastTouchTimeRef.current = Date.now()`.
- `onClick`: if `Date.now() - lastTouchTimeRef.current < 450`, ignore; otherwise call `handleTeamToggle(s.id, e)`.
- `onMouseEnter`: if `Date.now() - lastTouchTimeRef.current > 600`, call `setHoveredTeamId(s.id)`.
- `onMouseLeave`: call `setHoveredTeamId(null)`.

### Step 3: Visual Polish for Selected Team Button
Update legend item styles:
- `<button type="button" aria-pressed={isSelected}>`
- If `isSelected`: `bg-amber-950 border-amber-400 scale-[1.04] shadow-lg text-amber-200 ring-2 ring-amber-400/80` with golden `✓` checkmark.
- If `isHovered`: `bg-amber-950/70 border-amber-500/70 scale-[1.02] shadow-md text-amber-200`.
- If `isDimmed`: `bg-slate-800/40 border-slate-800/60 text-slate-400 opacity-60 hover:opacity-90`.
- Default: `bg-slate-800/80 border-amber-900/40 text-slate-300 hover:bg-slate-800`.

### Step 4: Update All Chart Renderers
Replace `hoveredTeamId` with `activeTeamId`:
- Cumulative chart polylines: `isDimmed = activeTeamId && activeTeamId !== s.id`, `strokeWidth = activeTeamId === s.id ? 5 : 3.5`.
- Weekly gains bars: `isDimmed = activeTeamId && activeTeamId !== s.id`.
- Rank trajectory polylines: `isDimmed = activeTeamId && activeTeamId !== s.id`, `strokeWidth = activeTeamId === s.id ? 5 : 3.5`.
- Draft ROI bars: `isDimmed = activeTeamId && activeTeamId !== item.teamId`.
- Add ghost-click debounce to data points and bars so tooltips don't double-toggle.

---

## 3. Verification Plan
1. Run automated test suites via `osascript -l JavaScript`.
2. Launch `browser_subagent` at mobile viewport (390x844):
   - Tap team name (e.g. "Jackson") -> verify locked selection with checkmark and highlighted polyline.
   - Scroll page and tap chart -> verify team remains selected.
   - Tap another team (e.g. "Ryan") -> verify selection transfers cleanly.
   - Tap "Ryan" again -> verify deselection (all teams restore full visibility).
3. Test desktop hover and click behavior.
