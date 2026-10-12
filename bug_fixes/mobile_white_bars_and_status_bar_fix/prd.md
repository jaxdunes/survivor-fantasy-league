# PRD: Fix Mobile White Bars & App Status Bar Bug

**Status**: Approved & Ready for Execution  
**Location**: `bug_fixes/mobile_white_bars_and_status_bar_fix/prd.md`  
**Target Files**: 
- `index.html` (Main League & Scoring Dashboard)
- `draft.html` (Draft Board)
- `chat.html` (Chat Room)
- `install.html` (PWA Installation Helper)
- `notifications.html` (Notifications Settings)
- `manifest.json` (Web App Manifest)

---

## 1. Problem Statement

When users view the Survivor Fantasy League website on mobile devices and via the installed app (PWA / Home Screen web clip), two distinct visual bugs occur:

1. **Mobile Browser View (Safari / Chrome)**:
   - Visible **white bars appear at the top and bottom** of the screen.
   - During pull-to-refresh or overscroll / elastic bounce, the exposed canvas at the top and bottom is glaring white.
   - The browser interface (URL bar and bottom toolbar) does not blend seamlessly with the app's dark tribal theme.

2. **Installed App / Standalone Mode**:
   - When opened via the installed home screen app or WebKit web view, a prominent **white bar appears across the top** of the screen.
   - The white bar contains dark system icons and abruptly separates the top of the phone screen from the dark tribal night sky background of the app.

---

## 2. Root Cause Analysis

Detailed code and browser engine analysis reveals five interrelated root causes:

### Root Cause 1: `apple-mobile-web-app-status-bar-style` Set to `default`
- **Current State**: `<meta name="apple-mobile-web-app-status-bar-style" content="default">` in `index.html`, `draft.html`, and `chat.html`.
- **Mechanism**: In iOS WebKit standalone mode (PWA / home screen web app), `content="default"` instructs iOS to render a **solid opaque white / light gray status bar** at the top with black system text. Web content is rendered strictly below this bar.
- **Impact**: Because the app uses an earthy dark brown / black Tribal theme (`#0a0604`), this creates an immediate, high-contrast white bar across the top of the display when viewed in the app.

### Root Cause 2: Missing `viewport-fit=cover` in Viewport Meta Tag
- **Current State**: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- **Mechanism**: Without `viewport-fit=cover`, mobile browsers (iOS Safari and Android Chrome) default to `viewport-fit=auto`. On devices with hardware cutouts (iPhone notches, Dynamic Island, rounded screen corners, home indicators), the browser letterboxes the web content inside the safe area rectangle.
- **Impact**: The letterboxed margins at the top (behind the status bar / notch) and bottom (behind the home indicator / navigation bar) are painted using the root window / canvas background.

### Root Cause 3: Undefined `html` and `body` Background Color & Missing `color-scheme: dark`
- **Current State**: `html` has no CSS background color. `body` only sets a background gradient when `.theme-tribal` is applied, but `html` remains transparent.
- **Mechanism**: The default browser canvas color behind `html` is `#ffffff` (pure white). When `viewport-fit=auto` letterboxes the viewport, or when a user overscrolls (rubber-bands), or while dynamic mobile browser toolbars collapse/expand, the white canvas is exposed at the top and bottom. Furthermore, lacking `<meta name="color-scheme" content="dark">`, the browser treats the viewport as light-mode, rendering light browser bars.

### Root Cause 4: Mismatched Theme Color in HTML and Manifest
- **Current State**: `<meta name="theme-color" content="#f97316">` (orange) and `manifest.json` has `"background_color": "#f5f5f5"`.
- **Mechanism**: 
  - `manifest.json` specifies `"background_color": "#f5f5f5"` (light gray / off-white), which the mobile OS uses to paint the initial window canvas and splash surface upon app launch.
  - In mobile Safari (iOS 15+), `<meta name="theme-color">` controls the color of the browser top chrome / tab bar. Setting it to orange or omitting dark-mode theme color causes Safari to fall back to light gray/white in light mode.

### Root Cause 5: Lack of Safe Area Inset Handling
- **Current State**: No CSS utilizes `env(safe-area-inset-top)` or `env(safe-area-inset-bottom)`.
- **Mechanism**: When `viewport-fit=cover` and transparent status bar are enabled, web content extends all the way to the physical screen boundaries. Without safe area padding, top headers, titles, and bottom navigation could collide with the Dynamic Island, notch, or home indicator bar.

---

## 3. Technical Requirements

### 3.1 Viewport Configuration
- Update `<meta name="viewport">` across all HTML entry points to:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  ```
- Add `<meta name="color-scheme" content="dark">` to signal native dark mode rendering to WebKit and Chromium.

### 3.2 Apple Mobile Status Bar Style
- Update `<meta name="apple-mobile-web-app-status-bar-style">` across all HTML entry points from `default` to `black-translucent`:
  ```html
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  ```
- This renders status bar icons (clock, battery, Wi-Fi) in crisp white and allows the app background to seamlessly bleed to the physical top edge.

### 3.3 Root HTML & Body Canvas Styling
- Explicitly style `html` and `body` in CSS across all pages:
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
  }
  ```
- Ensure dynamic theme switching updates the `html` background color and `<meta name="theme-color">` if the user toggles between Tribal and Classic themes.

### 3.4 PWA Manifest Synchronization
- In `manifest.json`:
  - Update `"background_color"` from `"#f5f5f5"` to `"#0a0604"`.
  - Update `"theme_color"` from `"#f97316"` to `"#0a0604"`.
- In HTML meta tags:
  - Update `<meta name="theme-color" content="#0a0604">`.

### 3.5 Safe Area Inset Padding
- Introduce reusable safe area utility classes:
  ```css
  .pt-safe {
      padding-top: env(safe-area-inset-top, 0px);
  }
  .pb-safe {
      padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  ```
- Apply safe area top padding to the header / top container so that app navigation, commissioner menu buttons, and titles have generous clearance below the camera notch / Dynamic Island.
- Apply safe area bottom padding to the main page container so bottom content clears the iOS home indicator bar.

---

## 4. Acceptance Criteria & Success Metrics

- [ ] **Mobile Browser View**: Zero white bars visible at the top (status/URL bar) or bottom (home bar / navigation toolbar) when viewed on mobile Safari or mobile Chrome.
- [ ] **App / Standalone View**: Zero white bar visible at the top when running as an installed PWA or home screen web app. Status bar icons display in white over the dark background.
- [ ] **Overscroll / Bounce**: Pulling down past the top or pushing up past the bottom exposes a consistent dark background (`#0a0604`), never a white canvas.
- [ ] **Hardware Cutout Safety**: All headers, buttons, navigation links, and text remain fully visible and clickable, properly respecting `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
- [ ] **Cross-Page Consistency**: Fix is applied across `index.html`, `draft.html`, `chat.html`, `install.html`, `notifications.html`, and `manifest.json`.
- [ ] **Theme Switcher Compatibility**: Toggling between Tribal and Classic themes smoothly transitions background and theme-color without visual glitches.

---

## 5. Addendum: Episode Scored Box & Ep 1 Clipping Fix

### Problem
When tapping/clicking **Ep 1** in the "Episodes Scored" interactive filter box:
- The active ring/focus outline and badge container suffered from clipping boundaries induced by `overflow-x-auto`.
- On desktop/tablet screen sizes, wrapped episode pills were prone to overflow.
- On mobile/tablet screens, the floating Leagues trigger tab (`top-1/2`) hovered directly over the left edge of the Episodes Scored card, cutting into the television icon and header text.

### Acceptance Criteria
- [ ] **No Ring Clipping**: When clicking Ep 1 (or any other episode button), the active ring (`ring-2 ring-emerald-400 ring-offset-2`) and box shadow render cleanly without being clipped or chopped off by container overflow.
- [ ] **Dynamic Container Expansion**: The Episodes Scored card dynamically sizes to contain all 14 episode badges without horizontal scrollbars or bottom border clipping.
- [ ] **Floating Tab Non-Interference**: The floating Leagues button is positioned at `top-[65%]` so it does not collide with or obscure the Episodes Scored box.
