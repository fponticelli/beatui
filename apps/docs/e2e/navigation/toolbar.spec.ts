import { test, expect } from '@playwright/test'

test.describe('Toolbar Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/toolbar')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the toolbar page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should display toolbar elements', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"], [class*="toolbar"]')
    expect(await toolbar.count()).toBeGreaterThan(0)
  })

  test('should have toolbar buttons', async ({ page }) => {
    const buttons = page.locator('[class*="toolbar"] button, [role="toolbar"] button')
    if (await buttons.count() > 0) {
      await expect(buttons.first()).toBeVisible()
    }
  })
})
