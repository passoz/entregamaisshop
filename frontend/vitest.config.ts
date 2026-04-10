import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  cacheDir: '/tmp/entregamais-frontend-vite',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/mocks/setupTests.ts'],
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
  },
})
