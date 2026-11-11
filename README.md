# Pam's Quest

A Zelda 1-style browser game: Pam delivers presents to her grandkids.

- Phaser 3 + TypeScript, built with Vite. Pixel-art screen (256x240 by default, set in `src/config.ts`) scaled up with crisp pixels.
- Keyboard (arrows/WASD, Space/J) and USB gamepad (D-pad or stick, A/B) supported.
- Every push to `main` builds and deploys to GitHub Pages via `.github/workflows/pages.yml`.

## The overworld

- The map lives in `src/map/overworld-map.json`, exported from the map draft (`assets/overworld-map.json` in the project files). It is 64x44 tiles of 16px: a 4x4 grid of 16x11-tile screens.
- Each char in `rows` is one tile. The `legend` gives each char a name, a color sampled from photos of the yard, and a `solid` flag (solid tiles block walking).
- To change the map, edit the draft and copy the new JSON over `src/map/overworld-map.json`. Tile textures are drawn in code (`src/art/tiles.ts`) from the legend colors.
- Pam is a stand-in sprite (`src/art/pam.ts`) until real sprite art is made.

## Develop

```
npm install
npm run dev      # local preview with hot reload
npm run build    # type-check and build to dist/
```
