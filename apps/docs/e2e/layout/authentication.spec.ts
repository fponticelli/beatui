import { test, expect } from '@playwright/test'

test.describe('Authentication Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/authentication')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the authentication page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have authentication form elements', async ({ page }) => {
    const formElements = page.locator('input, button, form')
    expect(await formElements.count()).toBeGreaterThan(0)
  })
})
