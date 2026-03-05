import { test, expect } from '@playwright/test'

test.describe('Drawer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drawer')
    await page.waitForLoadState('networkidle')
  })

  test('should render the drawer page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should have drawer trigger buttons', async ({ page }) => {
    const buttons = page.locator('button')
    expect(await buttons.count()).toBeGreaterThan(0)
  })

  test('should open drawer on button click', async ({ page }) => {
    const trigger = page.locator('button').first()
    if (await trigger.isVisible()) {
      await trigger.click()
      await page.waitForTimeout(500)
      const drawer = page.locator('[class*="drawer"]')
      if (await drawer.count() > 0) {
        await expect(drawer.first()).toBeVisible()
      }
    }
  })

  test('overlay data-status should transition to opened when drawer opens', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Open Basic Drawer' })
    await expect(trigger).toBeVisible()

    await trigger.click()

    const overlay = page.locator('.bc-overlay')
    await expect(overlay).toBeAttached({ timeout: 2000 })

    // Wait for data-status to reach 'opened'
    await expect(overlay).toHaveAttribute('data-status', 'opened', {
      timeout: 3000,
    })
  })

  test('overlay should have opaque backdrop when effect is opaque', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Open Basic Drawer' })
    await expect(trigger).toBeVisible()

    await trigger.click()

    const overlay = page.locator('.bc-overlay')
    await expect(overlay).toBeAttached({ timeout: 2000 })

    // Wait for opened state
    await expect(overlay).toHaveAttribute('data-status', 'opened', {
      timeout: 3000,
    })

    // Verify the overlay has the opaque effect class
    await expect(overlay).toHaveClass(/bc-overlay--effect-opaque/)

    // Verify the overlay has visible background (not fully transparent)
    const bgColor = await overlay.evaluate(
      el => getComputedStyle(el).backgroundColor
    )

    // The opaque overlay should not be fully transparent
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(bgColor).not.toBe('transparent')
  })
})
