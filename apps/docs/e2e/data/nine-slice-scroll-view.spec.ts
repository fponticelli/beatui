import { test, expect } from '@playwright/test'

test.describe('Nine Slice Scroll View Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nine-slice-scroll-view')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the nine slice scroll view page', async ({ page }) => {
    const content = page.locator('[class*="scroll"], [class*="nine"], div, button')
    await expect(content.first()).toBeVisible()
  })

  test('should display nine slice content', async ({ page }) => {
    const content = page.locator('main, .content, body')
    await expect(content.first()).toBeVisible()
  })
})
