import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ltd-assistant/',
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    include: ['src/test/**/*.test.{ts,tsx}'],
    exclude: ['src/test/e2e/**'],
  },
})
