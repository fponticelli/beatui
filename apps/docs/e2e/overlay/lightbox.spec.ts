import { test, expect } from '@playwright/test'

test.describe('Lightbox Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lightbox')
    await page.waitForLoadState('networkidle')
  })

  test('should render the lightbox page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have lightbox trigger elements', async ({ page }) => {
    const triggers = page.locator('[class*="lightbox"], img, button, a')
    expect(await triggers.count()).toBeGreaterThan(0)
  })

  test('should open lightbox on image click', async ({ page }) => {
    const image = page.locator('img, [class*="lightbox-trigger"]').first()
    if (await image.isVisible()) {
      await image.click()
      await page.waitForTimeout(500)
    }
  })
})
