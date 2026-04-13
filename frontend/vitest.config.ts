import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src')

export default defineConfig({
  plugins: [react()],
  cacheDir: '/tmp/entregamais-frontend-vite',
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/mocks/setupTests.ts'],
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
  },
})
