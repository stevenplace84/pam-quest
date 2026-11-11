# Pam's Quest

A Zelda 1-style browser game: Pam delivers presents to her grandkids.

- Phaser 3 + TypeScript, built with Vite. Pixel-art screen (256x240 by default, set in `src/config.ts`) scaled up with crisp pixels.
- Keyboard (arrows/WASD, Space/J) and USB gamepad (D-pad or stick, A/B) supported.
- Every push to `main` builds and deploys to GitHub Pages via `.github/workflows/pages.yml`.

## Develop

```
npm install
npm run dev      # local preview with hot reload
npm run build    # type-check and build to dist/
```
