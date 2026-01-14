import { test, expect } from '@playwright/test'

test.describe('Icon Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/icon')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the icon page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should display icons', async ({ page }) => {
    const icons = page.locator('svg, [class*="icon"]')
    expect(await icons.count()).toBeGreaterThan(0)
  })
})
