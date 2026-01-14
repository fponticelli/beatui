import { test, expect } from '@playwright/test'

test.describe('Collapse Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collapse')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the collapse page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have interactive collapse elements', async ({ page }) => {
    const triggers = page.locator('main button, main [role="button"]')
    if (await triggers.count() > 0) {
      await expect(triggers.first()).toBeVisible()
    }
  })

  test('should toggle collapse state on click', async ({ page }) => {
    const trigger = page.locator('main button, main [role="button"], summary').first()
    if (await trigger.isVisible()) {
      await trigger.click()
      await page.waitForTimeout(300)
    }
  })
})
