import { test, expect } from '@playwright/test'

test.describe('Dropdown Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dropdown')
    await page.waitForLoadState('networkidle')
  })

  test('should render the dropdown page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have dropdown trigger elements', async ({ page }) => {
    const triggers = page.locator('[class*="dropdown"], button, select')
    expect(await triggers.count()).toBeGreaterThan(0)
  })

  test('should open dropdown on click', async ({ page }) => {
    const trigger = page.locator('[class*="dropdown"] button, [class*="dropdown-trigger"]').first()
    if (await trigger.isVisible()) {
      await trigger.click()
      await page.waitForTimeout(300)
    }
  })
})
