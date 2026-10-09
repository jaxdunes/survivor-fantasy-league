# PRD: Mobile Graph Rendering & Touch Interaction Fix

## Problem Statement
On mobile viewports (e.g. 375px - 430px screens), the `TeamScoreGraph` visualization suffers from rendering and interaction issues:
1. **Hardcoded Minimum Widths**: The SVG element enforces `min-w-[450px]` within a fixed horizontal flex container, causing labels to compress, cut off, or force unwanted page layout shifts.
2. **Missing Touch Events**: SVG elements (bars, line chart data points, legend cards) rely solely on `onMouseEnter` / `onMouseLeave`, which fail to trigger reliably on iOS/Android touch devices.
3. **Sticky/Un-dismissable Tooltips**: Once triggered on mobile, tooltips cannot be dismissed by tapping outside.
4. **Desktop-First Legend Layout**: The vertical legend occupies 130px on the left side of the chart, crowding out the graph on narrow mobile screens.

## Target Audience & Devices
- Mobile web users on iOS Safari, Chrome for Android, and small tablet screens (<768px width).

## Requirements

### 1. Responsive Layout & Mobile Scrollability
- Wrap the chart SVG in an `overflow-x-auto` touch-scrollable container on mobile viewports so all 20+ draft ROI columns and episode data points render crisply without text clipping.
- Set responsive breakpoint rules (`md:flex-row`, `flex-col`) for the team legend so it stacks above/below the chart on mobile and beside it on desktop.

### 2. Full Mobile Touch Interaction Support
- Add explicit `onClick` and `onTouchStart` event handlers to all interactive SVG elements (bars, line points, rank nodes).
- Implement tap-to-toggle tooltip behavior: tapping a bar or point displays its tooltip; tapping it again or tapping outside dismisses the tooltip.

### 3. Mobile-Optimized Tooltip Positioning
- Ensure tooltips remain fully visible within the mobile viewport without overflowing off-screen edges.

---

## Success Criteria
- [x] Graphs render clearly without clipping or illegible text overlap on screens as small as 360px width.
- [x] Tapping any bar or chart node on mobile opens the score breakdown tooltip immediately.
- [x] Tapping outside or tapping another point dismisses or switches tooltips seamlessly.
