import { test as base, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Re-export expect for convenience
export { expect }

// Accessibility check result type
export interface A11yCheckResult {
  violations: Array<{
    id: string
    impact: string
    description: string
    help: string
    helpUrl: string
    nodes: Array<{
      target: string[]
      html: string
      failureSummary: string
    }>
  }>
  passes: number
  incomplete: number
}

// Screenshot comparison options
export interface ScreenshotOptions {
  maxDiffPixels?: number
  threshold?: number
  mask?: Array<{ selector: string }>
  fullPage?: boolean
}

/**
 * Custom test fixtures for BeatUI e2e tests
 */
export const test = base.extend<{
  /**
   * Navigate to a path and wait for network idle
   */
  navigateAndWait: (path: string) => Promise<void>

  /**
   * Run accessibility check on current page
   */
  checkA11y: (options?: { exclude?: string[]; selector?: string }) => Promise<A11yCheckResult>

  /**
   * Capture screenshot for visual comparison
   */
  captureVisual: (name: string, options?: ScreenshotOptions) => Promise<void>
}>({
  navigateAndWait: async ({ page }, use) => {
    const navigate = async (path: string) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
    }
    await use(navigate)
  },

  checkA11y: async ({ page }, use) => {
    const check = async (options: { exclude?: string[]; selector?: string } = {}) => {
      let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa'])

      if (options.exclude && options.exclude.length > 0) {
        builder = builder.disableRules(options.exclude)
      }

      if (options.selector) {
        builder = builder.include(options.selector)
      }

      const results = await builder.analyze()

      return {
        violations: results.violations.map((v) => ({
          id: v.id,
          impact: v.impact ?? 'unknown',
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.map((n) => ({
            target: n.target as string[],
            html: n.html,
            failureSummary: n.failureSummary ?? '',
          })),
        })),
        passes: results.passes.length,
        incomplete: results.incomplete.length,
      }
    }
    await use(check)
  },

  captureVisual: async ({ page }, use) => {
    const capture = async (name: string, options: ScreenshotOptions = {}) => {
      const { maxDiffPixels = 100, threshold = 0.2, mask = [], fullPage = false } = options

      const maskLocators = mask.map((m) => page.locator(m.selector))

      await expect(page.locator('main')).toHaveScreenshot(name, {
        maxDiffPixels,
        threshold,
        mask: maskLocators,
        fullPage,
        animations: 'disabled',
      })
    }
    await use(capture)
  },
})
