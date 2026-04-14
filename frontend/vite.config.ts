import { defineConfig } from 'vite'
import vinext from 'vinext'
import path from 'path'
import { fileURLToPath } from 'url'

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src')

export default defineConfig({
  plugins: [vinext()],
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true, // Libera todos os hosts nip.io e outros
  },
})
