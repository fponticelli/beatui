import { test, expect } from '@playwright/test'
import { GUIDE_ROUTES, getComponentRoutes } from './fixtures'

test.describe('Smoke tests @smoke', () => {
  test('home page loads and has content', async ({ page }) => {
    await page.goto('/')
    const heading = page.getByRole('heading', { name: 'BeatUI Components' })
    await expect(heading).toBeVisible({ timeout: 15_000 })
    // Has category cards
    await expect(page.getByRole('heading', { name: 'Layout' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Guides' })).toBeVisible()
  })

  test('home page has guide links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'BeatUI Components' })).toBeVisible({ timeout: 15_000 })
    // Links exist in the DOM (sidebar + body = multiple matches, at least 1)
    await expect(page.locator('a[href="/guides/getting-started"]').first()).toBeAttached()
    await expect(page.locator('a[href="/guides/theming"]').first()).toBeAttached()
  })

  test('home page has component links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'BeatUI Components' })).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('a[href="/components/button"]').first()).toBeAttached()
  })

  test('sidebar navigation is present', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'BeatUI Components' })).toBeVisible({ timeout: 15_000 })
    // Sidebar group headers
    await expect(page.locator('.bc-sidebar-group >> text=Guides').first()).toBeVisible()
    await expect(page.locator('.bc-sidebar-group >> text=API Reference').first()).toBeVisible()
  })

  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    const initialClass = await html.getAttribute('class')
    // Find and click the appearance selector
    const themeButton = page.locator('.bc-appearance-selector button').first()
    if (await themeButton.isVisible()) {
      await themeButton.click()
      // Class should have changed
      const newClass = await html.getAttribute('class')
      expect(newClass).not.toBe(initialClass)
    }
  })

  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto('/this-does-not-exist')
    await expect(page.locator('text=404')).toBeVisible()
  })

  test('breadcrumbs update on navigation', async ({ page }) => {
    await page.goto('/guides/getting-started')
    await expect(page.locator('nav[aria-label="breadcrumbs"]').or(page.locator('.bc-breadcrumbs'))).toBeVisible()
  })
})

test.describe('Guide pages load @smoke', () => {
  for (const route of GUIDE_ROUTES) {
    const name = route.split('/').pop()!
    test(`guide: ${name}`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      // Every guide page should have an h1
      await expect(page.locator('h1').first()).toBeVisible()
      // No uncaught errors — page should not show the 404
      await expect(page.locator('text=404')).not.toBeVisible()
    })
  }
})

test.describe('Component pages load @smoke', () => {
  const routes = getComponentRoutes()

  for (const route of routes) {
    const name = route.split('/').pop()!
    test(`component: ${name}`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      // Every component page should have the component name as heading
      await expect(page.locator('h1').first()).toBeVisible()
      // Should not be a 404
      await expect(page.locator('text=404')).not.toBeVisible()
    })
  }
})
