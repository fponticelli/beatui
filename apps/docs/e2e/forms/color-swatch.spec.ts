import { test, expect } from '@playwright/test'

test.describe('Color Swatch Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/color-swatch')
    await page.waitForLoadState('networkidle')
  })

  test('should render the color swatch page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display color swatches', async ({ page }) => {
    const swatches = page.locator('[class*="swatch"], [class*="color"]')
    expect(await swatches.count()).toBeGreaterThan(0)
  })
})
