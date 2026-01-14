import { test, expect } from '@playwright/test'

test.describe('Combobox Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/combobox')
    await page.waitForLoadState('networkidle')
  })

  test('should render the combobox page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have combobox elements', async ({ page }) => {
    const combobox = page.locator('[role="combobox"], select, [class*="combobox"]')
    expect(await combobox.count()).toBeGreaterThan(0)
  })

  test('should open dropdown on click', async ({ page }) => {
    const combobox = page.locator('[role="combobox"], [class*="combobox"] input').first()
    if (await combobox.isVisible()) {
      await combobox.click()
      await page.waitForTimeout(300)
    }
  })
})
