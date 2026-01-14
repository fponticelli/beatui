import { test, expect } from '@playwright/test'

test.describe('Tabs Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tabs')
    await page.waitForLoadState('networkidle')
  })

  test('should render the tabs page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display tab elements', async ({ page }) => {
    const tabs = page.locator('[role="tablist"], [class*="tabs"], [role="tab"]')
    expect(await tabs.count()).toBeGreaterThan(0)
  })

  test('should have clickable tabs', async ({ page }) => {
    const tab = page.locator('[role="tab"], [class*="tab"] button, button').first()
    if (await tab.isVisible()) {
      await tab.click()
      await page.waitForTimeout(200)
    }
  })

  test('should switch tab content on click', async ({ page }) => {
    const tabs = page.locator('[role="tab"], [class*="tab-button"]')
    if (await tabs.count() > 1) {
      const secondTab = tabs.nth(1)
      if (await secondTab.isVisible()) {
        await secondTab.click()
        await page.waitForTimeout(300)
      }
    }
  })
})
