import { test, expect } from '@playwright/test'

test.describe('JSON Schema Form Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/json-schema-form')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the JSON schema form page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have form elements', async ({ page }) => {
    const formElements = page.locator('input, select, textarea, button')
    expect(await formElements.count()).toBeGreaterThan(0)
  })

  test('should have schema-generated controls', async ({ page }) => {
    const controls = page.locator(
      '[class*="control"], [class*="field"], label, input'
    )
    expect(await controls.count()).toBeGreaterThan(0)
  })
})
