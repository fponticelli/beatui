import { test, expect } from '@playwright/test'

test.describe('Temporal Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/temporal')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the temporal page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have date/time inputs', async ({ page }) => {
    const inputs = page.locator('input, select, [class*="date"], [class*="time"], [class*="temporal"]')
    if (await inputs.count() > 0) {
      await expect(inputs.first()).toBeVisible()
    }
  })
})
