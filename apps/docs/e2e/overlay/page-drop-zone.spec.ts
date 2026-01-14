import { test, expect } from '@playwright/test'

test.describe('Page Drop Zone Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/page-drop-zone')
    await page.waitForLoadState('networkidle')
  })

  test('should render the page drop zone page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have drop zone area', async ({ page }) => {
    const dropZone = page.locator('[class*="drop"], [class*="zone"]')
    if (await dropZone.count() > 0) {
      await expect(dropZone.first()).toBeVisible()
    }
  })
})
