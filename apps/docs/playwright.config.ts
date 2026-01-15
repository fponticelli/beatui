import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PORT || 5180

/**
 * Playwright E2E test configuration for BeatUI docs
 *
 * Features:
 * - Multi-browser support (Chromium, Firefox, WebKit)
 * - Mobile viewport testing
 * - Visual regression with screenshots
 * - Accessibility testing with axe-core
 * - Video/trace capture on failure
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ...(process.env.CI ? [['github' as const]] : []),
  ],

  // Global test timeout
  timeout: 30000,
  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
      animations: 'disabled',
    },
  },

  use: {
    baseURL: `http://localhost:${PORT}`,
    // Capture artifacts on failure
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Consistent viewport for screenshots
    viewport: { width: 1280, height: 720 },
  },

  // Visual baseline storage
  snapshotDir: './e2e/visual-baselines',
  snapshotPathTemplate: '{snapshotDir}/{projectName}/{testFilePath}/{arg}{ext}',

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Run local dev server before starting tests */
  webServer: {
    command: `pnpm vite --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
  },
})
