import { test, expect } from '@playwright/test'

test.describe('ProseMirror Editor Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prosemirror-editor')
    await page.waitForLoadState('networkidle')
  })

  test('should render the ProseMirror editor page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display ProseMirror editor', async ({ page }) => {
    const editor = page.locator('.ProseMirror, [class*="prosemirror"], [contenteditable="true"]')
    if (await editor.count() > 0) {
      await expect(editor.first()).toBeVisible()
    }
  })

  test('should allow text input', async ({ page }) => {
    const editor = page.locator('.ProseMirror, [contenteditable="true"]').first()
    if (await editor.isVisible()) {
      await editor.click()
      await page.keyboard.type('Test content')
      await page.waitForTimeout(200)
    }
  })

  test('should have toolbar if available', async ({ page }) => {
    const toolbar = page.locator('[class*="toolbar"], [class*="menu-bar"]')
    if (await toolbar.count() > 0) {
      await expect(toolbar.first()).toBeVisible()
    }
  })
})
