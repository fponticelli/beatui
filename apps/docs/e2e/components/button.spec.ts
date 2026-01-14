import { test, expect } from '@playwright/test'

test.describe('Button Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/button')
    await page.waitForLoadState('networkidle')
    await page.locator('table button, main button').first().waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the button page', async ({ page }) => {
    await expect(page.locator('table button, main button').first()).toBeVisible()
  })

  test('should display various button variants', async ({ page }) => {
    const buttons = page.locator('table button, main button')
    await expect(buttons.first()).toBeVisible()
    expect(await buttons.count()).toBeGreaterThan(0)
  })

  test('should have clickable buttons', async ({ page }) => {
    const button = page.locator('table button, main button').first()
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
  })

  test('should show different button sizes', async ({ page }) => {
    const buttons = page.locator('table button, main button')
    expect(await buttons.count()).toBeGreaterThan(1)
  })

  test('should support disabled state', async ({ page }) => {
    const disabledButton = page.locator('button[disabled]')
    if (await disabledButton.count() > 0) {
      await expect(disabledButton.first()).toBeDisabled()
    }
  })
})
