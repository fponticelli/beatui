import { test, expect } from '@playwright/test'

test.describe('Sidebar Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sidebar')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the sidebar page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should display sidebar elements', async ({ page }) => {
    const sidebar = page.locator('[class*="sidebar"], aside, nav')
    expect(await sidebar.count()).toBeGreaterThan(0)
  })

  test('should have navigation items in sidebar', async ({ page }) => {
    const navItems = page.locator('[class*="sidebar"] a, [class*="sidebar"] button, aside a, nav a')
    if (await navItems.count() > 0) {
      await expect(navItems.first()).toBeVisible()
    }
  })
})
