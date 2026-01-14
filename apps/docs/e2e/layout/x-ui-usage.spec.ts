import { test, expect } from '@playwright/test'

test.describe('X-UI Usage Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/x-ui-usage')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the x-ui usage page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have content', async ({ page }) => {
    const content = page.locator('p, code, pre, [class*="example"]')
    expect(await content.count()).toBeGreaterThan(0)
  })
})
