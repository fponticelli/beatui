import { test, expect } from '@playwright/test'

test.describe('Link Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/link')
    await page.waitForLoadState('networkidle')
  })

  test('should render the link page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display link examples', async ({ page }) => {
    const links = page.locator('a')
    expect(await links.count()).toBeGreaterThan(0)
  })
})
