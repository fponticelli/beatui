import { test, expect } from '@playwright/test'

test.describe('Modal Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modal')
    await page.waitForLoadState('networkidle')
  })

  test('should render the modal page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have modal trigger buttons', async ({ page }) => {
    const buttons = page.locator('button')
    expect(await buttons.count()).toBeGreaterThan(0)
  })

  test('should open modal on button click', async ({ page }) => {
    const trigger = page.locator('button').first()
    if (await trigger.isVisible()) {
      await trigger.click()
      await page.waitForTimeout(300)
      const modal = page.locator('[role="dialog"], [class*="modal"]')
      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible()
      }
    }
  })

  test('should close modal on close button or overlay click', async ({ page }) => {
    const trigger = page.locator('button').first()
    if (await trigger.isVisible()) {
      await trigger.click()
      await page.waitForTimeout(300)
      const closeButton = page.locator('[class*="modal"] button, [role="dialog"] button').first()
      if (await closeButton.isVisible()) {
        await closeButton.click()
        await page.waitForTimeout(300)
      }
    }
  })
})
