import { defineConfig } from 'vite';

// Relative base so the build works at https://<user>.github.io/pam-zelda/ or any other host path.
export default defineConfig({
  base: './',
  build: { assetsInlineLimit: 0, chunkSizeWarningLimit: 1500 }, // Phaser alone is ~1.2 MB
});
