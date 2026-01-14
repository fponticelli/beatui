import { test, expect } from '@playwright/test'

test.describe('Notification Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notification')
    await page.waitForLoadState('networkidle')
  })

  test('should render the notification page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have notification trigger buttons', async ({ page }) => {
    const buttons = page.locator('button')
    expect(await buttons.count()).toBeGreaterThan(0)
  })
})
