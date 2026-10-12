# Walkthrough - Mobile White Bars & App Status Bar Fix

Resolved the issue where white bars appeared at the top and bottom on mobile browsers, and an opaque white status bar appeared across the top when the website was viewed via the installed app (PWA / Home Screen).

---

## What Caused the Bug?

1. **Standalone App Mode Status Bar (`apple-mobile-web-app-status-bar-style: default`)**:
   - In iOS WebKit standalone mode (PWA / home screen web app), setting `apple-mobile-web-app-status-bar-style` to `default` forces iOS to render an **opaque solid white / light gray bar across the top of the display** with dark status icons.
   - Because the fantasy league theme is earthy dark brown / black (`#0a0604`), this caused a jarring white stripe across the top of the app.

2. **Missing `viewport-fit=cover` in Viewport Meta Tag**:
   - Modern mobile devices (iPhone with notch/Dynamic Island, modern Androids) feature hardware cutouts.
   - Without `viewport-fit=cover`, mobile browsers default to `viewport-fit=auto`, letterboxing the page inside the safe area and painting the top status area and bottom home bar area with the default document canvas background.

3. **Missing `html` and `body` Background Color & Missing `color-scheme: dark`**:
   - `html` had no CSS background color, so the browser's root canvas defaulted to pure white (`#ffffff`).
   - Any rubber-band elastic overscroll or toolbar adjustment exposed white bars at the top and bottom.

4. **Mismatched Manifest and HTML Theme Colors**:
   - `manifest.json` had `"background_color": "#f5f5f5"`, which mobile operating systems used to paint the window canvas before styles loaded.
   - HTML meta tags had `<meta name="theme-color" content="#f97316">` instead of the dark background color `#0a0604`.

5. **Lack of Safe Area Inset Support**:
   - Content had no safe-area insets (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`), which caused layout collisions when full bleed was enabled.

---

## How It Was Fixed

### 1. Viewport & Status Bar Meta Tags
Updated [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html), [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html), [`chat.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/chat.html), [`install.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/install.html), and [`notifications.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/notifications.html):
- Added `viewport-fit=cover`:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  ```
- Switched status bar to `black-translucent`:
  ```html
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  ```
- Added `<meta name="color-scheme" content="dark">`.
- Updated `<meta name="theme-color" content="#0a0604">`.

### 2. Root Canvas & Background Styling
Set explicit dark background and dark color-scheme on `html` and `body`:
```css
html {
    background-color: #0a0604;
    color-scheme: dark;
    min-height: 100%;
}
body { 
    margin: 0; 
    padding: 0; 
    font-family: system-ui, -apple-system, sans-serif; 
    background-color: #0a0604;
    min-height: 100%;
    min-height: 100dvh;
}
#root { 
    min-height: 100%; 
    min-height: 100dvh; 
}
.grey-ombre-bg {
    background: linear-gradient(135deg, #f5f5f5 0%, #9e9e9e 50%, #424242 100%);
    min-height: 100vh;
    min-height: 100dvh;
}
/* Safe Area Inset Support */
.pt-safe {
    padding-top: max(1rem, env(safe-area-inset-top, 0px));
}
.pb-safe {
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 0px));
}
```

### 3. Dynamic Theme Synchronization
Updated the theme `useEffect` in [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html) and [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html):
```javascript
useEffect(() => {
    document.body.classList.toggle('theme-tribal', theme === 'tribal');
    const isTribal = theme === 'tribal';
    document.documentElement.style.backgroundColor = isTribal ? '#0a0604' : '#f5f5f5';
    document.body.style.backgroundColor = isTribal ? '#0a0604' : '#f5f5f5';
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
        themeMeta.setAttribute('content', isTribal ? '#0a0604' : '#f5f5f5');
    }
}, [theme]);
```

### 4. PWA Web App Manifest Update
Updated [`manifest.json`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/manifest.json):
```json
  "background_color": "#0a0604",
  "theme_color": "#0a0604",
```

### 5. Safe Area Inset Padding Applied to Containers
Added `.pt-safe` and `.pb-safe` to the main application container, side menu drawer panel, and chat views to guarantee that headers, navigation icons, and buttons clear the notch/Dynamic Island and bottom home bar.

---

## Verification Results

Verified on mobile viewport (`390 x 844 px`):
- `meta[name="viewport"]` contains `viewport-fit=cover`.
- `meta[name="apple-mobile-web-app-status-bar-style"]` is `black-translucent`.
- `meta[name="color-scheme"]` is `dark`.
- `window.getComputedStyle(document.documentElement).backgroundColor` and `window.getComputedStyle(document.body).backgroundColor` both evaluate to `rgb(10, 6, 4)`.
- Zero console runtime errors.
- Both [`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html) and [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html) render edge-to-edge without white bars.

---

## Bonus Fix: Episode Scored Box & Ep 1 Clipping Issue

### What Caused the Bug?
1. **Container Overflow Clipping (`overflow-x-auto`)**:
   - The badge wrapper inside `UniversalEpisodeTracker` had `overflow-x-auto` paired with `py-1` (4px).
   - In CSS, setting `overflow-x: auto` automatically forces `overflow-y` to compute as `auto`, creating a strict clipping boundary.
   - When **Ep 1** was clicked, its active ring style (`ring-2 ring-emerald-400 ring-offset-2`) extended 4px outward beyond the button boundary, which collided with and was clipped off by the container's 4px vertical padding and overflow boundary.
2. **Badge Wrapping & Container Alignment**:
   - The container had `flex-col md:flex-row items-start md:items-center justify-between gap-4`.
   - On desktop and tablet viewports, having 14 episode badges combined with the title/legend caused the badges to wrap onto a second line, but layout flex properties caused buttons to overflow past the card boundary.
3. **Floating Leagues Tab Collision**:
   - The floating side menu trigger button (`fixed left-0 top-1/2 -translate-y-1/2`) hovered at exactly 50% screen height on mobile/tablet viewports, which placed it directly on top of the left side of the "Episodes Scored" card, clipping into the TV icon and "EPISODES SCORED:" header text.

### How It Was Fixed
1. **Removed `overflow-x-auto` & Adjusted Spacing** ([`js/episode-filter.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/js/episode-filter.js)):
   - Replaced `overflow-x-auto` with clean flex-wrapping (`flex flex-wrap items-center gap-1.5 w-full xl:w-auto py-1`).
   - Adjusted badge padding from `px-2.5` to `px-2` and gap to `gap-1`, allowing badges to fit comfortably without clipping rings or outlines.
   - Updated the ring offset color in tribal mode to `ring-offset-[#1a120d]`.
2. **Repositioned Floating Leagues Tab** ([`index.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/index.html) & [`draft.html`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/draft.html)):
   - Shifted the floating Leagues trigger tab from `top-1/2` to `top-[65%]` so it remains easily thumb-accessible on mobile without ever overlapping or clipping into the Episodes Scored box.
3. **Verified Across Viewports**:
   - Tested on desktop (1280x800) and mobile (390x844). Clicking Ep 1 now toggles cleanly with glowing ring, no clipping boundaries, and zero collisions with the Leagues tab.
