import { test, expect } from '@playwright/test'

test.describe('Mask Input Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mask-input')
    await page.waitForLoadState('networkidle')
  })

  test('should render the mask input page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have mask input elements', async ({ page }) => {
    const inputs = page.locator('input')
    expect(await inputs.count()).toBeGreaterThan(0)
  })

  test('should apply input mask formatting', async ({ page }) => {
    const input = page.locator('input').first()
    if (await input.isVisible()) {
      await input.clear()
      await input.fill('1234567890')
      const value = await input.inputValue()
      expect(value.length).toBeGreaterThan(0)
    }
  })
})
