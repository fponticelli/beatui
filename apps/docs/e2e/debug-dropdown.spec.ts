import { test, expect } from '@playwright/test'

test.describe('Flyout positioning and animation', () => {
  test('Dropdown flyout should have position:absolute and proper animation classes', async ({
    page,
  }) => {
    await page.goto('/dropdown')
    await page.waitForLoadState('networkidle')

    const trigger = page.locator('.bc-dropdown').first()
    await trigger.click()
    await page.waitForTimeout(500)

    const result = await page.evaluate(() => {
      const fc = document.querySelector('.bc-flyout-container')
      if (!fc) return null

      const computed = window.getComputedStyle(fc)
      return {
        className: fc.className,
        inlineStyle: fc.getAttribute('style'),
        computedPosition: computed.position,
        computedWidth: computed.width,
      }
    })

    expect(result).not.toBeNull()

    // Bug 1 fix: The flyout container (which IS the PopOver's positioned div)
    // must retain position:absolute. Before fix: attr.style() overwrote it.
    expect(result!.computedPosition).toBe('absolute')
    // Width should NOT be full viewport width (was 1280px before fix)
    expect(parseInt(result!.computedWidth)).toBeLessThan(800)

    // Bug 2 fix: Each animation class should be properly prefixed
    const cn = result!.className
    expect(cn).toContain('bc-animated-toggle--fade')
    expect(cn).toContain('bc-animated-toggle--scale')
    expect(cn).toMatch(/bc-animated-toggle--slide-(up|down)/)
    // No unprefixed class names
    expect(cn).not.toMatch(/(?<!\w-)(?:^|\s)scale(?:\s|$)/)
  })

  test('Menu flyout should open with proper positioning', async ({ page }) => {
    await page.goto('/menu')
    await page.waitForLoadState('networkidle')

    const trigger = page.locator('button:has-text("Actions")').first()
    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()
    await page.waitForTimeout(500)

    const result = await page.evaluate(() => {
      const fc = document.querySelector('.bc-flyout-container')
      if (!fc) return null

      const computed = window.getComputedStyle(fc)
      return {
        className: fc.className,
        visible:
          computed.visibility !== 'hidden' && computed.display !== 'none',
        computedPosition: computed.position,
      }
    })

    expect(result).not.toBeNull()
    expect(result!.visible).toBe(true)
    expect(result!.computedPosition).toBe('absolute')
    expect(result!.className).toContain('bc-animated-toggle--fade')
  })
})
