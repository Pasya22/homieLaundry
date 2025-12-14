// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-*.png'],
      manifest: {
        name: 'Homie Laundry',
        short_name: 'Homie',
        description: 'Aplikasi manajemen laundry modern',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tailwind-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true, // Enable PWA in dev mode
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  server: {
    host: '0.0.0.0', // Allow external access
    port: 8000,
    // Uncomment untuk HTTPS (butuh cert)
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
    //   cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem'))
    // }
  },
  preview: {
    host: '0.0.0.0',
    port: 8000
  }
});