import { test, expect } from '@playwright/test'

test.describe('Authentication Components Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/authentication/components')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the authentication components page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should display authentication components', async ({ page }) => {
    const components = page.locator('input, button, [class*="auth"]')
    expect(await components.count()).toBeGreaterThan(0)
  })
})
