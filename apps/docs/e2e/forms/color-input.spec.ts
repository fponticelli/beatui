import { test, expect } from '@playwright/test'

test.describe('Color Input Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/color-input')
    await page.waitForLoadState('networkidle')
  })

  test('should render the color input page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have color input elements', async ({ page }) => {
    const colorInputs = page.locator('input[type="color"], [class*="color"]')
    expect(await colorInputs.count()).toBeGreaterThan(0)
  })
})
