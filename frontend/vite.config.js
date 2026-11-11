import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // dev: the FastAPI backend (backend/, port 8000) behind the same origin, so its session cookie just works.
  // The Host header is kept (no changeOrigin) so the backend builds the Google callback URL on this port.
  server: {
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: false },
      '/auth': { target: 'http://127.0.0.1:8000', changeOrigin: false }, // string shorthand would rewrite Host
    },
  },
})
