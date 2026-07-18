# 49ers Starting Lineup Studio

Browser-based broadcast graphic for San Francisco 49ers projected starting lineups.

## Open Locally

Open `index.html` in a browser.

- Producer Studio: `index.html`
- Offense view: `index.html?view=offense`
- Defense view: `index.html?view=defense`

The presentation views are designed for StreamYard screen sharing.

## Broadcast Design

- The control room uses a three-zone production workflow: formation, live canvas, and player inspector.
- Keyboard arrows nudge the selected broadcast card; Command/Ctrl + K focuses roster search.
- The roster library supports position, status, and live name filtering without leaving the canvas.
- Presentation views render on a fixed 16:9 canvas and scale to the available window.
- The photographic turf is generated specifically for this project; yard numbers, player graphics, and the team mark remain separate editable layers.
- Formation-aware positioning keeps all 11 player plaques readable on offense and defense.
- Starting-player cutouts use optimized alpha WebP files while the original PNG sources remain available in `src/assets/headshots-display/`.
- Entrance motion respects the operating system's reduced-motion setting.

## Notes

- Player data is merged from the official 49ers roster and NFLVerse 2026 roster/headshot data.
- Optimized presentation cutouts live in `src/assets/headshots-webp/`.
- Original high-resolution cutouts live in `src/assets/headshots-display/`.
- Full-resolution source caches are intentionally ignored from git.
