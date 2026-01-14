import { test, expect } from '@playwright/test'

test.describe('JSON Schema Custom Widgets Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/json-schema-custom-widgets')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the JSON schema custom widgets page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have custom widget elements', async ({ page }) => {
    const widgets = page.locator(
      'input, select, textarea, [class*="widget"], [class*="control"]'
    )
    expect(await widgets.count()).toBeGreaterThan(0)
  })

  test('should have form structure', async ({ page }) => {
    const formElements = page.locator('form, [class*="form"], label')
    expect(await formElements.count()).toBeGreaterThan(0)
  })
})
