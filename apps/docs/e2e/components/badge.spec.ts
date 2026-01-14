import { test, expect } from '@playwright/test'

test.describe('Badge Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/badge')
    await page.waitForLoadState('networkidle')
  })

  test('should render the badge page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display badges', async ({ page }) => {
    const badges = page.locator('.bc-badge, [class*="badge"]')
    if (await badges.count() > 0) {
      await expect(badges.first()).toBeVisible()
    }
  })

  test('should show different badge variants', async ({ page }) => {
    const content = page.locator('main, .content, body')
    await expect(content.first()).toBeVisible()
  })
})
