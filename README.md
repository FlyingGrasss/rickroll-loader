# Rickroll Loader

A tiny, framework-free proof of concept where every page switch rickrolls you. First load shows a full-screen loading overlay for about 2.5 seconds with the official "Never Gonna Give You Up" YouTube embed (autoplay, muted, controls hidden), a centered spinner, and a progress bar; the Home / About / Gallery buttons repeat a 1.2-second version before revealing the next section. If YouTube is blocked or the page is offline and the iframe has not loaded within 1.5 seconds, the video area becomes an animated CSS cassette placeholder so the demo still works. A small "skip" button closes the overlay immediately.

## Run it

Open `index.html` directly in a browser. There is no build step, no package manager, and no server required. For GitHub Pages, push these four files to a repository and publish the root of the branch; all paths are relative.

## Reusing the overlay

- **Markup:** the `#overlay` element near the bottom of `index.html`, which contains the YouTube iframe, cassette fallback, spinner, progress bar, and skip button.
- **Styles:** the `/* Loading overlay */` block in `styles.css`, including `.overlay`, `.media`, `.cassette`, `.status`, `.spinner`, and `.progress`.
- **Behavior:** `openOverlay()`, `closeOverlay()`, `startProgress()`, and `armMediaFallback()` in `script.js`.

Copy those three parts into the same page and script scope, then call `openOverlay(2500)` on page load, or `openOverlay(1200, 'section-name')` before swapping a section. The section wiring uses matching `data-section` / `data-panel` attributes and can be removed if you only need the loader.

## Autoplay and audio

The embed uses `autoplay=1&mute=1` because browsers only permit autoplay when video is muted. The loading screen is therefore silent by design; player controls are hidden. If you want sound, remove `mute=1` and expect the browser to require a user gesture before playback starts.

No external assets are used besides the YouTube iframe. The cassette fallback is pure CSS with an emoji.
