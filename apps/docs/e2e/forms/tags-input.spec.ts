import { test, expect } from '@playwright/test'

test.describe('Tags Input Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tags-input')
    await page.waitForLoadState('networkidle')
  })

  test('should render the tags input page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have tags input element', async ({ page }) => {
    const tagsInput = page.locator('[class*="tags"], input')
    expect(await tagsInput.count()).toBeGreaterThan(0)
  })

  test('should allow adding tags', async ({ page }) => {
    const input = page.locator('input').first()
    if (await input.isVisible()) {
      await input.fill('new-tag')
      await input.press('Enter')
      await page.waitForTimeout(200)
    }
  })
})
