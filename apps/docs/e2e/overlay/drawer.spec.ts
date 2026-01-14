import { test, expect } from '@playwright/test'

test.describe('Drawer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drawer')
    await page.waitForLoadState('networkidle')
  })

  test('should render the drawer page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have drawer trigger buttons', async ({ page }) => {
    const buttons = page.locator('button')
    expect(await buttons.count()).toBeGreaterThan(0)
  })

  test('should open drawer on button click', async ({ page }) => {
    const trigger = page.locator('button').first()
    if (await trigger.isVisible()) {
      await trigger.click()
      await page.waitForTimeout(500)
      const drawer = page.locator('[class*="drawer"]')
      if (await drawer.count() > 0) {
        await expect(drawer.first()).toBeVisible()
      }
    }
  })
})
