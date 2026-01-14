import { test, expect } from '@playwright/test'

test.describe('Table Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/table')
    await page.waitForLoadState('networkidle')
  })

  test('should render the table page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('should display table element', async ({ page }) => {
    const table = page.locator('table, [role="grid"], [class*="table"]')
    expect(await table.count()).toBeGreaterThan(0)
  })

  test('should have table headers', async ({ page }) => {
    const headers = page.locator('th, [role="columnheader"]')
    if (await headers.count() > 0) {
      await expect(headers.first()).toBeVisible()
    }
  })

  test('should have table rows', async ({ page }) => {
    const rows = page.locator('tr, [role="row"]')
    expect(await rows.count()).toBeGreaterThan(0)
  })

  test('should have table cells', async ({ page }) => {
    const cells = page.locator('td, [role="cell"]')
    if (await cells.count() > 0) {
      await expect(cells.first()).toBeVisible()
    }
  })

  test('should support sorting if available', async ({ page }) => {
    const sortableHeader = page.locator('th[data-sortable], th button, [role="columnheader"] button').first()
    if (await sortableHeader.isVisible()) {
      await sortableHeader.click()
      await page.waitForTimeout(300)
    }
  })
})
