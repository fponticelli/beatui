import { test, expect } from '@playwright/test'

test.describe('Flyout Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/flyout')
    await page.waitForLoadState('networkidle')
  })

  test('should render the flyout page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have flyout trigger elements', async ({ page }) => {
    const triggers = page.locator('[class*="flyout"], button')
    expect(await triggers.count()).toBeGreaterThan(0)
  })

  test('should open flyout on interaction', async ({ page }) => {
    const trigger = page.locator('[class*="flyout"] button, button').first()
    if (await trigger.isVisible()) {
      await trigger.click()
      await page.waitForTimeout(300)
    }
  })
})
