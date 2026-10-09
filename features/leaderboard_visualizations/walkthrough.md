# Walkthrough: Draft ROI Layout Alignment & Point Range Axis

## Overview
Refined the **Draft ROI** chart layout structure in `TeamScoreGraph` on branch `feature/leaderboard-visualizations-and-roster-cards`:
1. **Draft Pick Alignment**: All pick numbers (`1.1`, `1.2`, ..., `BF`) aligned along a single Y position line at the top.
2. **Separation Line**: Added a horizontal line dividing the pick numbers from the rotated castaway names.
3. **Rotated Castaway Names at Top**: Angled player names (`-40°`) positioned at the top right under the separation line.
4. **Minimal Y-Axis Point Range**: Point scale on the left showing exact score ranges (`+45p`, `0p`, `-35p`) with subtle horizontal grid lines.
5. **Graph Plot**: Bar graph extends below the names and zero baseline, color-coded by fantasy team with interactive legend dimming.

---

## 🎨 Layout Structure

| Layer Order | Element | Description |
| :--- | :--- | :--- |
| **Top (y = 16)** | **Draft Pick Badges** | Pick numbers (`1.1`, `1.2`, ..., `BF`) aligned horizontally across all columns |
| **Divider (y = 26)** | **Horizontal Line** | Separation line spanning across the plot width |
| **Header (y = 74)** | **Rotated Names** | Castaway names rotated `-40°` starting under separation line |
| **Y-Axis (Left)** | **Points Range Scale** | Ticks and dashed grid lines indicating point values (`+45p`, `+5p`, `0p`, `-35p`) |
| **Plot (y = 82-275)** | **Bar Graph Plot** | Team color-coded ROI bars radiating from zero baseline |

---

## 🧪 Browser Verification
- Verified via `browser_subagent` on `index.html?league=jacks-league`.
- Captured screenshot artifact: [draft_roi_chart_layout.png](file:///Users/ryantaylor/.gemini/antigravity-ide/brain/61645ed0-1614-4a93-8b68-7ccd78e3c76a/draft_roi_chart_layout_1791505554425.png)

