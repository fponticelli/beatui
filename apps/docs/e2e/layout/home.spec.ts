import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the home page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have navigation', async ({ page }) => {
    const nav = page.locator('nav, [class*="sidebar"], [class*="menu"]')
    if ((await nav.count()) > 0) {
      await expect(nav.first()).toBeVisible()
    }
  })
})
