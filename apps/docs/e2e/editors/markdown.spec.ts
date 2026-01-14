import { test, expect } from '@playwright/test'

test.describe('Markdown Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/markdown')
    await page.waitForLoadState('networkidle')
  })

  test('should render the Markdown page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display markdown content', async ({ page }) => {
    const markdownContent = page.locator('[class*="markdown"], article, .prose')
    if (await markdownContent.count() > 0) {
      await expect(markdownContent.first()).toBeVisible()
    }
  })

  test('should render markdown elements', async ({ page }) => {
    const content = page.locator('p, ul, ol, code, pre, blockquote')
    expect(await content.count()).toBeGreaterThan(0)
  })
})
