import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['apple-touch-icon.png', 'material-symbols.ttf', 'biocore-logo.png'],
      manifest: {
        name: 'BioCore AI',
        short_name: 'BioCore',
        description: 'BioCore AI - Sistema de Controle de Cultivo Inteligente',
        theme_color: '#111417',
        background_color: '#111417',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,jpg}'],
        navigateFallbackDenylist: [/.*\.ts\.net.*/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.includes('ts.net'),
            handler: 'NetworkOnly',
          }
        ]
      }
    })
  ],
})
