import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * E2E runs in Node and drives real Chromium via Playwright.
 * This avoids Vitest Browser-Mode import constraints and matches JumpServer console testing.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    name: 'e2e',
    environment: 'node',
    include: ['tests/e2e/**/*.{test,spec}.{js,mjs,ts}'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    fileParallelism: false,
    pool: 'forks'
  }
})
