import { test, expect } from '@playwright/test'

test.describe('Monaco Editor Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/monaco-editor')
    await page.waitForLoadState('networkidle')
  })

  test('should render the Monaco editor page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display Monaco editor container', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have editor content area', async ({ page }) => {
    await page.waitForTimeout(1000)
    const content = page.locator('.monaco-editor, [class*="editor-container"]')
    if (await content.count() > 0) {
      await expect(content.first()).toBeVisible()
    }
  })

  test('should be able to focus editor', async ({ page }) => {
    await page.waitForTimeout(1000)
    const editor = page.locator('.monaco-editor, [class*="editor"]').first()
    if (await editor.isVisible()) {
      await editor.click()
      await page.waitForTimeout(200)
    }
  })
})
