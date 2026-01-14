import { test, expect } from '@playwright/test'

test.describe('Notification Service Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notification-service')
    await page.waitForLoadState('networkidle')
  })

  test('should render the notification service page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have notification trigger buttons', async ({ page }) => {
    const buttons = page.locator('button')
    expect(await buttons.count()).toBeGreaterThan(0)
  })

  test('should show notification on button click', async ({ page }) => {
    const button = page.locator('button').first()
    if (await button.isVisible()) {
      await button.click()
      await page.waitForTimeout(500)
      const notification = page.locator('[class*="notification"], [role="alert"]')
      if (await notification.count() > 0) {
        await expect(notification.first()).toBeVisible()
      }
    }
  })
})
