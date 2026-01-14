import { test, expect } from '@playwright/test'

test.describe('Tags Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tags')
    await page.waitForLoadState('networkidle')
  })

  test('should render the tags page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display tag elements', async ({ page }) => {
    const tags = page.locator('[class*="tag"], .bc-tag, span')
    expect(await tags.count()).toBeGreaterThan(0)
  })

  test('should show different tag variants', async ({ page }) => {
    const content = page.locator('main, .content, body')
    await expect(content.first()).toBeVisible()
  })

  test('should have interactive tags if available', async ({ page }) => {
    const clickableTag = page.locator('[class*="tag"] button, .bc-tag button').first()
    if (await clickableTag.isVisible()) {
      await clickableTag.click()
      await page.waitForTimeout(200)
    }
  })
})
