import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { zeroOneBackendMiddleware } from './server/zeroOneBackend.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'zero-one-authoritative-backend',
      configureServer(server) {
        server.middlewares.use(zeroOneBackendMiddleware);
      },
      configurePreviewServer(server) {
        server.middlewares.use(zeroOneBackendMiddleware);
      },
    },
  ],
  server: {
    // 5175 = zero-one frontend. Playground owns 5174 — do not reuse it.
    port: 5175,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 5175,
    strictPort: true,
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin.html'),
      },
    },
  },
})

