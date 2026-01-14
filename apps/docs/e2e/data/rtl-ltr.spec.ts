import { test, expect } from '@playwright/test'

test.describe('RTL/LTR Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rtl-ltr')
    await page.waitForLoadState('networkidle')
  })

  test('should render the RTL/LTR page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have direction controls', async ({ page }) => {
    const controls = page.locator('button, select, [class*="direction"]')
    expect(await controls.count()).toBeGreaterThan(0)
  })
})
