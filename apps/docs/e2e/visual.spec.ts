import { test, expect } from '@playwright/test'
import { getComponentSlugs } from './fixtures'

test.describe('Visual regression - core pages @visual', () => {
  test('home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('home.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })

  test('getting started guide', async ({ page }) => {
    await page.goto('/guides/getting-started')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('guide-getting-started.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })
})

test.describe('Visual regression - component playgrounds @visual', () => {
  // Test a curated set of components that are visually rich and stable
  const VISUAL_COMPONENTS = [
    'button',
    'badge',
    'card',
    'notice',
    'tabs',
    'accordion',
    'switch',
    'progress-bar',
    'skeleton',
    'avatar',
    'divider',
    'pagination',
    'toolbar',
    'kbd',
  ]

  for (const slug of VISUAL_COMPONENTS) {
    test(`component: ${slug}`, async ({ page }) => {
      await page.goto(`/components/${slug}`)
      await page.waitForLoadState('networkidle')

      // Screenshot the playground area only
      const playground = page.locator('.space-y-2').first()
      await expect(playground).toBeVisible({ timeout: 10_000 })

      await expect(playground).toHaveScreenshot(`component-${slug}.png`, {
        maxDiffPixelRatio: 0.02,
      })
    })
  }
})
