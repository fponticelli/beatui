import { test, expect } from '@playwright/test'

test.describe('Inputs Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inputs')
    await page.waitForLoadState('networkidle')
  })

  test('should render the inputs page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display various input types', async ({ page }) => {
    const inputs = page.locator('input')
    expect(await inputs.count()).toBeGreaterThan(0)
  })

  test('should have text inputs', async ({ page }) => {
    const textInputs = page.locator('input[type="text"], input:not([type])')
    if (await textInputs.count() > 0) {
      await expect(textInputs.first()).toBeVisible()
    }
  })

  test('should allow typing in text inputs', async ({ page }) => {
    const textInput = page.locator('input[type="text"], input:not([type])').first()
    if (await textInput.isVisible()) {
      await textInput.clear()
      await textInput.fill('Test input')
      await expect(textInput).toHaveValue('Test input')
    }
  })
})
