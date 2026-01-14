import { test, expect } from '@playwright/test'

test.describe('Scrollable Panel Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scrollable-panel')
    await page.waitForLoadState('networkidle')
  })

  test('should render the scrollable panel page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have scrollable content', async ({ page }) => {
    const scrollable = page.locator('[class*="scroll"], [style*="overflow"]')
    if (await scrollable.count() > 0) {
      await expect(scrollable.first()).toBeVisible()
    }
  })
})
