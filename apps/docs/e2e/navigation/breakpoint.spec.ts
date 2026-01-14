import { test, expect } from '@playwright/test'

test.describe('Breakpoint Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/breakpoint')
    await page.waitForLoadState('networkidle')
  })

  test('should render the breakpoint page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display breakpoint information', async ({ page }) => {
    const content = page.locator('main, .content, body')
    await expect(content.first()).toBeVisible()
  })
})
