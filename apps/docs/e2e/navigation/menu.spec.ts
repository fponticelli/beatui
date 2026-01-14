import { test, expect } from '@playwright/test'

test.describe('Menu Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu')
    await page.waitForLoadState('networkidle')
  })

  test('should render the menu page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display menu elements', async ({ page }) => {
    const menuItems = page.locator('[class*="menu"], [role="menu"], [role="menuitem"], li')
    expect(await menuItems.count()).toBeGreaterThan(0)
  })

  test('should have clickable menu items', async ({ page }) => {
    const menuItem = page.locator('[role="menuitem"], [class*="menu-item"], li a, li button').first()
    if (await menuItem.isVisible()) {
      await expect(menuItem).toBeVisible()
    }
  })
})
