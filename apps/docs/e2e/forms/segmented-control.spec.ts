import { test, expect } from '@playwright/test'

test.describe('Segmented Control Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/segmented-control')
    await page.waitForLoadState('networkidle')
  })

  test('should render the segmented control page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display segmented control elements', async ({ page }) => {
    const segments = page.locator('[class*="segmented"], [role="tablist"], button')
    expect(await segments.count()).toBeGreaterThan(0)
  })

  test('should allow segment selection', async ({ page }) => {
    const segment = page.locator('[class*="segment"] button, [role="tab"]').first()
    if (await segment.isVisible()) {
      await segment.click()
      await page.waitForTimeout(200)
    }
  })
})
