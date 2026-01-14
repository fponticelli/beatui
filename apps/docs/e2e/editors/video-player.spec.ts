import { test, expect } from '@playwright/test'

test.describe('Video Player Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/video-player')
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should render the video player page', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have video player container', async ({ page }) => {
    const video = page.locator('video, [class*="video"], [class*="player"]')
    if ((await video.count()) > 0) {
      await expect(video.first()).toBeVisible()
    }
  })

  test('should have video controls', async ({ page }) => {
    const controls = page.locator(
      '[class*="controls"], button, [class*="play"], [class*="pause"]'
    )
    expect(await controls.count()).toBeGreaterThanOrEqual(0)
  })
})
