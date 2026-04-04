import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const isProd = process.env.NODE_ENV === 'production'
const base = isProd ? '/espatifai/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: isProd ? 'auto' : null,
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Espatifai - Music Player',
        short_name: 'Espatifai',
        description: 'Seu player de música pessoal',
        theme_color: '#0f0f0f',
        background_color: '#0f0f0f',
        display: 'standalone',
        orientation: 'portrait',
        scope: base,
        start_url: base,
        icons: [
          {
            src: `${base}pwa-192x192.png`,
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: `${base}pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: `${base}pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: isProd ? {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,jpg}'],
        globIgnores: ['**/*.mp3'],
        navigateFallback: undefined,
        // Runtime caching para MP3s: CacheFirst com expiracao
        // Primeira execucao: baixa da rede e salva no cache
        // Execucoes seguintes: serve do cache (sem re-download)
        runtimeCaching: [
          {
            urlPattern: /\/tracks\/.*\.mp3$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'espatifai-audio-v1',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
              },
            },
          },
        ],
      } : undefined,
      devOptions: {
        enabled: false,
      }
    })
  ],
})
