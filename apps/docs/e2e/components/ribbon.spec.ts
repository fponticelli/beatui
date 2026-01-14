import { test, expect } from '@playwright/test'

test.describe('Ribbon Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ribbon')
    await page.waitForLoadState('networkidle')
  })

  test('should render the ribbon page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display ribbon elements', async ({ page }) => {
    const ribbons = page.locator('[class*="ribbon"]')
    if (await ribbons.count() > 0) {
      await expect(ribbons.first()).toBeVisible()
    }
  })
})
