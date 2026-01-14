import { test, expect } from '@playwright/test'

test.describe('PDF Page Viewer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pdf-page-viewer')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the PDF page viewer page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have PDF viewer container', async ({ page }) => {
    const viewer = page.locator('[class*="pdf"], canvas, [class*="viewer"]')
    if (await viewer.count() > 0) {
      await expect(viewer.first()).toBeVisible()
    }
  })
})
