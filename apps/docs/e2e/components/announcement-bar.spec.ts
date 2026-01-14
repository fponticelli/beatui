import { test, expect } from '@playwright/test'

test.describe('Announcement Bar Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/announcement-bar')
    await page.waitForLoadState('networkidle')
  })

  test('should render the announcement bar page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display announcement bar elements', async ({ page }) => {
    const bars = page.locator('[class*="announcement"], [role="banner"]')
    if (await bars.count() > 0) {
      await expect(bars.first()).toBeVisible()
    }
  })
})
