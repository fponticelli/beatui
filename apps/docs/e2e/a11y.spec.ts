import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { getComponentSlugs } from './fixtures'

// One representative page per major area
const CORE_PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Getting Started', path: '/guides/getting-started' },
  { name: 'Button', path: '/components/button' },
  { name: 'Modal', path: '/components/modal' },
  { name: 'Table', path: '/components/table' },
  { name: 'TextInput', path: '/components/text-input' },
  { name: 'Tabs', path: '/components/tabs' },
  { name: 'API Reference', path: '/api' },
]

test.describe('Accessibility - core pages @a11y', () => {
  for (const { name, path } of CORE_PAGES) {
    test(`${name} has no critical a11y violations`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        // Exclude third-party iframes (PDF viewers, Monaco)
        .exclude('iframe')
        .analyze()

      const critical = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      )

      expect(
        critical,
        `A11y violations on ${path}:\n${critical.map(v => `  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('\n')}`
      ).toHaveLength(0)
    })
  }
})

test.describe('Accessibility - all component pages @a11y', () => {
  const slugs = getComponentSlugs()

  for (const slug of slugs) {
    test(`component ${slug} has no critical a11y violations`, async ({
      page,
    }) => {
      await page.goto(`/components/${slug}`)
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('iframe')
        .analyze()

      const critical = results.violations.filter(
        v => v.impact === 'critical'
      )

      expect(
        critical,
        `Critical a11y violations on /components/${slug}:\n${critical.map(v => `  ${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('\n')}`
      ).toHaveLength(0)
    })
  }
})
