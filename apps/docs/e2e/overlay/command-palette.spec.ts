import { test, expect } from '@playwright/test'

test.describe('CommandPalette Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/command-palette')
    await page.waitForLoadState('networkidle')
  })

  test('should render trigger buttons', async ({ page }) => {
    const basicButton = page.locator('#open-basic-palette')
    await expect(basicButton).toBeVisible()
  })

  test('should open palette on button click', async ({ page }) => {
    const basicButton = page.locator('#open-basic-palette')
    await basicButton.click()
    await page.waitForTimeout(300)

    const palette = page.locator('.bc-command-palette')
    await expect(palette).toBeVisible()
  })

  test('should show items in opened palette', async ({ page }) => {
    const basicButton = page.locator('#open-basic-palette')
    await basicButton.click()
    await page.waitForTimeout(300)

    const items = page.locator('.bc-command-palette__item')
    expect(await items.count()).toBeGreaterThan(0)
  })

  test('should filter items by search input', async ({ page }) => {
    const basicButton = page.locator('#open-basic-palette')
    await basicButton.click()
    await page.waitForTimeout(300)

    const items = page.locator('.bc-command-palette__item')
    const initialCount = await items.count()

    // Type a search query that matches fewer items
    const searchInput = page.locator('.bc-command-palette__input')
    await searchInput.fill('Save')

    const filteredCount = await items.count()
    expect(filteredCount).toBeLessThan(initialCount)
    expect(filteredCount).toBeGreaterThan(0)
  })

  test('should show empty state for non-matching search', async ({
    page,
  }) => {
    const basicButton = page.locator('#open-basic-palette')
    await basicButton.click()
    await page.waitForTimeout(300)

    const searchInput = page.locator('.bc-command-palette__input')
    await searchInput.fill('xyznonexistent')

    const emptyMessage = page.locator('.bc-command-palette__empty')
    await expect(emptyMessage).toBeVisible()
  })

  test('should navigate items with arrow keys', async ({ page }) => {
    const basicButton = page.locator('#open-basic-palette')
    await basicButton.click()
    await page.waitForTimeout(300)

    const searchInput = page.locator('.bc-command-palette__input')

    // First item should be selected by default
    const selectedItem = page.locator('.bc-command-palette__item--selected')
    await expect(selectedItem).toBeVisible()
    const firstText = await selectedItem.textContent()

    // Press ArrowDown to move to next item
    await searchInput.press('ArrowDown')
    const secondText = await selectedItem.textContent()
    expect(secondText).not.toBe(firstText)

    // Press ArrowUp to go back
    await searchInput.press('ArrowUp')
    const backText = await selectedItem.textContent()
    expect(backText).toBe(firstText)
  })

  test('should close palette on Escape', async ({ page }) => {
    const basicButton = page.locator('#open-basic-palette')
    await basicButton.click()
    await page.waitForTimeout(300)

    const palette = page.locator('.bc-command-palette')
    await expect(palette).toBeVisible()

    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    await expect(palette).not.toBeVisible()
  })

  test('should close palette on item click', async ({ page }) => {
    const basicButton = page.locator('#open-basic-palette')
    await basicButton.click()
    await page.waitForTimeout(300)

    const items = page.locator('.bc-command-palette__item')
    await items.first().click()
    await page.waitForTimeout(300)

    const palette = page.locator('.bc-command-palette')
    await expect(palette).not.toBeVisible()
  })

  test('should open sections palette with section headers', async ({
    page,
  }) => {
    // Click the "Open Navigation Menu" button (sections demo)
    const sectionButton = page.locator('button', {
      hasText: 'Open Navigation Menu',
    })
    await sectionButton.click()
    await page.waitForTimeout(300)

    const sectionTitles = page.locator('.bc-command-palette__section-title')
    expect(await sectionTitles.count()).toBeGreaterThan(0)
  })

  test('should open shortcuts palette with kbd elements', async ({
    page,
  }) => {
    // Click the "Open Actions Menu" button (shortcuts demo)
    const shortcutsButton = page.locator('button', {
      hasText: 'Open Actions Menu',
    })
    await shortcutsButton.click()
    await page.waitForTimeout(300)

    const kbdElements = page.locator('.bc-command-palette__item-shortcut kbd')
    expect(await kbdElements.count()).toBeGreaterThan(0)
  })
})
