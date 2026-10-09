# PRD: Episode Breakdown & Roster Contribution UI Tweaks

## Problem Statement
Four visual refinement issues exist in the team leaderboard view:
1. **Episode Navigation Arrows & Alignment**: In `TeamEventStackedBarChart`, the Episode navigation uses literal text arrows (`<` and `>`), and on mobile viewports the navigation control is not aligned on the right side of the section header box.
2. **Chart Bar & Player Name Overlap**: In `TeamEventStackedBarChart`, tall negative bars or net point labels can overlap player names positioned at the bottom of the chart.
3. **Redundant Percentage & Plus Sign in Roster Contribution**: In `TeamRosterContributionBar`, player labels display `+45 (35%)`, creating visual redundancy since percentages are already shown directly inside the stacked bar segments.

---

## Requirements

### 1. Minimalist Episode Navigation Header
- On mobile viewports, center/align the Episode # navigation container on the right side of the header box.
- Replace literal `<` and `>` text with sleek, minimalist SVG chevrons aligned vertically with the "Episode X" text label.

### 2. Zero Overlap for Player Names
- Adjust chart heights, negative bar scaling (`negPx`), and player name positioning in `TeamEventStackedBarChart` to guarantee zero visual overlap between negative bars/labels and player names on all screen sizes.

### 3. Clean Roster Contribution Labels
- In `TeamRosterContributionBar`, remove the `+` prefix and `(%)` suffix from player label text below the bar. Display clean point values (e.g. `45 pts`).

---

## Success Criteria
- [x] Episode navigation uses minimalist SVG chevrons aligned cleanly with episode title.
- [x] On mobile viewports, Episode navigation sits aligned on the right side of the header box.
- [x] Player names in `TeamEventStackedBarChart` have generous clearance and never overlap with negative bars or score labels.
- [x] Roster contribution labels show clean point counts (e.g. `45 pts`) without redundant `+` or `(%)`.
