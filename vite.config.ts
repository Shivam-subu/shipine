import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { ASSET_HERO, HERO_SIZES, responsiveImage } from './src/lib/images.ts';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), {
      name: 'preload-hero-image',
      transformIndexHtml() {
        return [{
          tag: 'link',
          attrs: {
            rel: 'preload',
            as: 'image',
            type: 'image/avif',
            imagesrcset: responsiveImage(ASSET_HERO).srcSet,
            imagesizes: HERO_SIZES,
            fetchpriority: 'high',
          },
          injectTo: 'head-prepend',
        }];
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
