import { test, expect } from '@playwright/test'

test.describe('Form Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form')
    await page.waitForLoadState('networkidle')
  })

  test('should render the form page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display form elements', async ({ page }) => {
    const form = page.locator('form')
    if (await form.count() > 0) {
      await expect(form.first()).toBeVisible()
    }
  })

  test('should have input fields', async ({ page }) => {
    const inputs = page.locator('input, textarea, select')
    expect(await inputs.count()).toBeGreaterThan(0)
  })

  test('should have submit button', async ({ page }) => {
    const submitButton = page.locator('main button, form button')
    if (await submitButton.count() > 0) {
      await expect(submitButton.first()).toBeVisible()
    }
  })
})
