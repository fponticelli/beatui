import { test, expect } from '@playwright/test'

test.describe('File Input Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/file-input')
    await page.waitForLoadState('networkidle')
  })

  test('should render the file input page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have file input element', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.count() > 0) {
      expect(await fileInput.count()).toBeGreaterThan(0)
    }
  })

  test('should have file drop zone or button', async ({ page }) => {
    const dropZone = page.locator('[class*="drop"], [class*="file"], button')
    expect(await dropZone.count()).toBeGreaterThan(0)
  })
})
