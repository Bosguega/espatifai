import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/espatifai/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Espatifai - Music Player',
        short_name: 'Espatifai',
        description: 'Seu player de música pessoal',
        theme_color: '#0f0f0f',
        background_color: '#0f0f0f',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/espatifai/',
        start_url: '/espatifai/',
        icons: [
          {
            src: '/espatifai/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/espatifai/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/espatifai/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache apenas: shell do app (js, css, html, ícones, fontes)
        // MP3 são servidos como streaming — NUNCA cacheados
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,jpg}'],
        globIgnores: ['**/*.mp3'],
        navigateFallback: undefined,
      }
    })
  ],
})
