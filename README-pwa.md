PWA integration for Text2 — Calendar
=================================

What I changed
- Added/updated `site.webmanifest` with app name, icons, start_url, theme/background colors and display mode.
- Added PWA meta tags to `index.html` (theme-color, apple/mobile web app flags).
- Added service worker `sw.js` implementing a simple App Shell caching strategy.
- Added service worker registration snippet to `index.html` so the SW will register when loaded.

Files added/edited
- `site.webmanifest` — filled name/short_name/description, colors, start_url and display
- `index.html` — added PWA meta tags and service worker registration
- `sw.js` — new service worker file

How to test locally (Windows PowerShell)

1. Start a local static server from the `d:\website\calendar` folder. From PowerShell run:

```powershell
# change to the project folder
Set-Location -Path 'd:\website\calendar'

# Option A: Python 3 (recommended if available)
python -m http.server 8000

# Option B: If you have Node.js installed, use a simple static server like 'serve' (install once):
# npm install -g serve
# serve -s . -l 8000
```

2. Open a browser and navigate to http://localhost:8000

3. Open DevTools > Application (or Manifest) to verify the manifest is detected and icons load.

4. In DevTools > Application > Service Workers you should see `sw.js` registered. Try "Update on reload" and then reload.

5. Test offline: After the SW has cached assets, disable the network (in DevTools > Network > Offline) and reload — the app shell should still load.

Notes & next steps
- This is a minimal offline-first setup. For production you may want to:
  - Use hashed asset names and a more advanced caching strategy (Workbox recommended).
  - Show an "Install" prompt (listen for beforeinstallprompt on window).
  - Add deep-link handling and better offline fallbacks for images and API calls.

If you'd like, I can implement an in-app "Install" flow and add update notifications when a new SW is available.
