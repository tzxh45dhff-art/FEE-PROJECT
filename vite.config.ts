import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Hero models in src/assets/models/ are emitted as hashed asset URLs.
  assetsInclude: ['**/*.glb'],
  server: {
    /*
     * The API and the socket are served same-origin through this proxy, which
     * is what lets the session cookie work without any CORS config.
     * `ws: true` is required — without it the Socket.IO upgrade never lands.
     */
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:4000', ws: true, changeOrigin: true },
      /* Uploaded room videos are served by the API, not by Vite. */
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
