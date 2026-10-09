# Walkthrough: Episode Breakdown & Roster Contribution UI Tweaks

## Overview
Implemented UI refinements in `TeamEventStackedBarChart` and `TeamRosterContributionBar` inside [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html).

---

## 🎨 Changes Made

### 1. 🎯 Minimalist Episode Navigation & Right Alignment
- **Minimalist SVG Chevrons**: Replaced literal `<` and `>` text buttons with crisp SVG path chevrons.
- **Mobile Right Alignment**: On mobile viewports, the Episode # navigation box aligns cleanly to the right side of the header container using `ml-auto`.

### 2. 📏 Player Name Overlap Fix
- **Generous Vertical Separation**: Scaled negative bar height (`negPx`) and adjusted baseline layout, ensuring player names sit at the bottom with 25px+ clearance from negative bars or net score labels.

### 3. 🧹 Clean Roster Contribution Labels
- **Redundancy Removal**: Removed `+` and `(%)` from player labels below the Roster Contribution bar, displaying clean point counts (e.g. `45 pts`).

---

## 🧪 Verification
- Verified via `browser_subagent` in mobile viewport mode (**390px × 844px** and **500px × 757px**).

### Captured Screenshots

#### 1. Minimalist SVG Episode Navigation & Name Clearance
![Episode Breakdown Header and Graph](/Users/ryantaylor/.gemini/antigravity-ide/brain/61645ed0-1614-4a93-8b68-7ccd78e3c76a/episode_player_event_breakdown_header_and_graph_1791507746750.png)

#### 2. Clean Roster Contribution Labels (No + or %)
![Roster Point Contribution](/Users/ryantaylor/.gemini/antigravity-ide/brain/61645ed0-1614-4a93-8b68-7ccd78e3c76a/roster_point_contribution_1791507726036.png)
