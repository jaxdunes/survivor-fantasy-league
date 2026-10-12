# Implementation Plan: Fix Mobile White Bars & App Status Bar Bug

## Overview
Eliminate white bars at the top and bottom on mobile browsers and the white bar at the top in standalone/app mode across [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html), [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html), [`chat.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/chat.html), [`install.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/install.html), [`notifications.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/notifications.html), and [`manifest.json`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/manifest.json).

---

## Proposed Changes

### 1. Viewport & Status Bar Meta Tags
In all HTML files:
- **Add `viewport-fit=cover`**:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  ```
- **Update Apple Status Bar Style**:
  Change `apple-mobile-web-app-status-bar-style` from `default` to `black-translucent`:
  ```html
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  ```
- **Add `color-scheme` Meta**:
  ```html
  <meta name="color-scheme" content="dark">
  ```
- **Update `theme-color`**:
  Change from `#f97316` to `#0a0604` (matching the dark tribal background).

### 2. Root Canvas & Background Styling
In all HTML files (`<style>` block):
- **Set `html` and `body` base background and dimensions**:
  ```css
  html {
      background-color: #0a0604;
      color-scheme: dark;
      min-height: 100%;
  }
  body {
      background-color: #0a0604;
      min-height: 100%;
      min-height: 100dvh;
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
  }
  ```
- **Add Safe Area Utility Classes**:
  ```css
  .pt-safe {
      padding-top: env(safe-area-inset-top, 0px);
  }
  .pb-safe {
      padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  ```

### 3. Safe Area Inset Layout Padding
- In [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html):
  - Add safe area top padding to the header / main container: `pt-safe` or `paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)'`.
  - Add safe area bottom padding to the main root container: `pb-safe` or `paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)'`.
  - Update drawer sidebar and fixed modals to account for safe area insets.
- In [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html) and [`chat.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/chat.html):
  - Add safe area top and bottom padding to top headers and containers.

### 4. Dynamic Theme Switching Integration
- In [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html) and [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html):
  - In the theme effect (`useEffect` on `theme`), update:
    - `document.documentElement.style.backgroundColor = theme === 'tribal' ? '#0a0604' : '#f5f5f5';`
    - Update `<meta name="theme-color">` content attribute to `#0a0604` for tribal and `#f5f5f5` for classic.

### 5. Web App Manifest
- In [`manifest.json`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/manifest.json):
  - Update `"background_color"` from `"#f5f5f5"` to `"#0a0604"`.
  - Update `"theme_color"` from `"#f97316"` to `"#0a0604"`.

---

## Verification Plan

### Automated / Browser Verification
1. Open the website using `browser_subagent` in a mobile viewport (e.g. 390x844 px, iPhone 14/15/16 dimensions).
2. Inspect computed styles on `<html>` and `<body>`:
   - Verify `background-color` is `#0a0604`.
   - Verify `color-scheme` is `dark`.
   - Verify `meta[name="viewport"]` contains `viewport-fit=cover`.
   - Verify `meta[name="apple-mobile-web-app-status-bar-style"]` is `black-translucent`.
3. Check top header spacing to confirm safe-area insets prevent notch/Dynamic Island collision.
4. Check bottom of the screen to confirm content extends to the bottom without white bands or clipping by the home indicator bar.
5. Toggle theme from Tribal to Classic and back, verifying background and theme-color update smoothly.
