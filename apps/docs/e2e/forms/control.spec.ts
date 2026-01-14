import { test, expect } from '@playwright/test'

test.describe('Control Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/control')
    await page.waitForLoadState('networkidle')
  })

  test('should render the control page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display form controls', async ({ page }) => {
    const controls = page.locator('input, select, textarea, [class*="control"]')
    expect(await controls.count()).toBeGreaterThan(0)
  })
})
