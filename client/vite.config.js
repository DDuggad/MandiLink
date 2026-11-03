import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'icons/*.png', 'screenshots/*.png'],
      manifest: {
        id: '/?source=pwa',
        name: 'MandiLink — Farmer Market Linkage & Live Prices',
        short_name: 'MandiLink',
        description:
          'Real-time nearby APMC mandi prices, price trend analytics, explainable forecasts, and verified rural transporters for farmers.',
        lang: 'en',
        dir: 'ltr',
        theme_color: '#15803d',
        background_color: '#f0fdf4',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'any',
        start_url: '/',
        scope: '/',
        categories: ['finance', 'business', 'utilities'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/maskable-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/screenshot-mobile.png',
            sizes: '540x960',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Nearby Mandi Prices & 90-Day Trends',
          },
          {
            src: '/screenshots/screenshot-desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'APMC Mandi Rates & Statistical Predictions',
          },
        ],
        shortcuts: [
          {
            name: 'Nearby Mandi Prices',
            short_name: 'Prices',
            description: 'Check today’s mandi modal rates and arrivals',
            url: '/',
            icons: [
              {
                src: '/icons/shortcut-prices.png',
                sizes: '96x96',
                type: 'image/png',
              },
            ],
          },
          {
            name: 'Rural Transporters',
            short_name: 'Transporters',
            description: 'Find verified local drivers with direct dial',
            url: '/#transporters',
            icons: [
              {
                src: '/icons/shortcut-transporters.png',
                sizes: '96x96',
                type: 'image/png',
              },
            ],
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /^\/admin/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            // Cache delta sync and price data
            urlPattern: /^https?:\/\/.*\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
              networkTimeoutSeconds: 4,
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
