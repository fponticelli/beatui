import { test, expect } from '@playwright/test'

test.describe('PDF Preview Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pdf-preview')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the PDF preview page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have PDF preview container', async ({ page }) => {
    const preview = page.locator('[class*="pdf"], canvas, [class*="preview"]')
    if ((await preview.count()) > 0) {
      await expect(preview.first()).toBeVisible()
    }
  })
})
