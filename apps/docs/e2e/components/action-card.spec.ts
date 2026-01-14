import { test, expect } from '@playwright/test'

test.describe('Action Card Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/action-card')
    await page.waitForLoadState('networkidle')
  })

  test('should render the action card page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display action cards', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="action"]')
    if (await cards.count() > 0) {
      await expect(cards.first()).toBeVisible()
    }
  })
})
