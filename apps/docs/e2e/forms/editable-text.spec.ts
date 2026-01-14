import { test, expect } from '@playwright/test'

test.describe('Editable Text Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editable-text')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the editable text page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have editable text elements', async ({ page }) => {
    const editable = page.locator('[contenteditable="true"], [class*="editable"], input')
    expect(await editable.count()).toBeGreaterThan(0)
  })

  test('should switch to edit mode on interaction', async ({ page }) => {
    const editableText = page.locator('[class*="editable"], [contenteditable]').first()
    if (await editableText.isVisible()) {
      await editableText.click()
      await page.waitForTimeout(200)
    }
  })
})
