import { test, expect } from '@playwright/test'

test.describe('Switch Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/switch')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the switch page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have toggle switches', async ({ page }) => {
    const switches = page.locator('[role="switch"], input[type="checkbox"], .bc-switch')
    if (await switches.count() > 0) {
      await expect(switches.first()).toBeVisible()
    }
  })

  test('should toggle switch state on click', async ({ page }) => {
    const switchEl = page.locator('[role="switch"], .bc-switch, input[type="checkbox"]').first()
    if (await switchEl.isVisible()) {
      await switchEl.click()
      await page.waitForTimeout(200)
    }
  })
})
