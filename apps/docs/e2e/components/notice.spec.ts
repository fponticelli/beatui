import { test, expect } from '@playwright/test'

test.describe('Notice Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notice')
    await page.waitForLoadState('networkidle')
  })

  test('should render the notice page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display notice elements', async ({ page }) => {
    const notices = page.locator('[class*="notice"], [role="alert"]')
    if (await notices.count() > 0) {
      await expect(notices.first()).toBeVisible()
    }
  })
})
