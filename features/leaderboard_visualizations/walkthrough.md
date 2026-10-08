# Walkthrough: Leaderboard Visualizations & Parchment Roster Cards

The **Leaderboard Visualizations & Parchment Roster Cards** feature brings immersive Survivor thematic styling and rich data analytics to the Leaderboard.

---

## 📜 1. Collapsed Team Parchment Roster Slips & Custom SVG Torches
- **Parchment Vote Slips**: Each contestant on a fantasy team is displayed as a Survivor tribal council vote slip featuring a warm parchment gradient background, deckled shadow, and handwritten vote typography (`Caveat`).
- **Custom SVG Torches (No Emojis)**:
  - 🔥 **Active Contestants**: Rendered with custom lit torch SVGs featuring animated glowing/pulsing fire flames.
  - 💨 **Eliminated Contestants**: Rendered with custom unlit torch SVGs featuring dark charred tops and translucent rising smoke wisps.
- **Tribe Color Dots**: Includes tribe color dots indicating each contestant's current tribe.

---

## 📊 2. Main League Graph Fixes & 5 Interactive Visualization Modes
- **Negative Y-Axis Scale Fix**: The Y-axis domain dynamically calculates `minScore = Math.min(0, ...allScores)` with negative margin padding so negative scores stay visible above the baseline.
- **Horizontal & Vertical Margin Padding**: Prevents episode dots and labels from being clipped at chart boundaries.
- **5 Interactive Modes**:
  1. 📈 **Cumulative Total Score**: Running score line chart across episodes.
  2. 📊 **Weekly Score Gains**: Grouped bar chart showing points scored in each episode.
  3. 🏆 **Rank Trajectory**: Inverted rank position tracking graph (#1..#N).
  4. 🕯️ **Active Roster Survival**: Line chart showing active vs eliminated players remaining per team.
  5. 💡 **Draft Pick Value / ROI**: Points per draft pick slot to highlight steals vs busts.

---

## 🍩 3. Team-Level Deep-Dive Analytics (Expanded Team View)
- **Roster Contribution Donut Chart**: Interactive SVG donut chart showing the percentage of total team points produced by each drafted contestant.
- **Episode Category Stacked Bar Chart**: Stacked bar chart showing episode-by-episode point breakdowns color-coded by category (*Immunities, Idols, Surviving, Confessionals, Bonuses*).

---

## Verification Summary

All components were verified using automated browser testing and local development guards under `dev_testing/`. Production database instances were strictly protected.
