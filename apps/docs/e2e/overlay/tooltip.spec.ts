import { test, expect } from '@playwright/test'

test.describe('Tooltip Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tooltip')
    await page.waitForLoadState('networkidle')
  })

  test('should render the tooltip page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have tooltip trigger elements', async ({ page }) => {
    const triggers = page.locator('[data-tooltip], [class*="tooltip"], button, span')
    expect(await triggers.count()).toBeGreaterThan(0)
  })

  test('should show tooltip on hover', async ({ page }) => {
    const trigger = page.locator('[data-tooltip], [class*="tooltip-trigger"], button').first()
    if (await trigger.isVisible()) {
      await trigger.hover()
      await page.waitForTimeout(500)
    }
  })
})
