import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

export interface AccessibilityCheckOptions {
  tags?: string[]
  exclude?: string[]
  selector?: string
}

export interface AccessibilityViolation {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  help: string
  helpUrl: string
  nodes: Array<{
    target: string[]
    html: string
    failureSummary: string
  }>
}

export interface ScreenshotOptions {
  maxDiffPixels?: number
  threshold?: number
  mask?: Locator[]
  animations?: 'disabled' | 'allow'
}

/**
 * Base page object providing common functionality for all page objects
 */
export abstract class BasePage {
  readonly page: Page
  readonly path: string

  constructor(page: Page, path: string) {
    this.page = page
    this.path = path
  }

  async navigateTo(): Promise<void> {
    await this.page.goto(this.path)
    await this.page.waitForLoadState('networkidle')
  }

  getMain(): Locator {
    return this.page.locator('main')
  }

  async checkAccessibility(options: AccessibilityCheckOptions = {}): Promise<AccessibilityViolation[]> {
    const { tags = ['wcag2a', 'wcag2aa'], exclude = [], selector } = options

    let builder = new AxeBuilder({ page: this.page }).withTags(tags)

    if (exclude.length > 0) {
      builder = builder.disableRules(exclude)
    }

    if (selector) {
      builder = builder.include(selector)
    }

    const results = await builder.analyze()

    // eslint-disable-next-line tempots/require-async-signal-disposal
    return results.violations.map((v) => ({
      id: v.id,
      impact: v.impact as AccessibilityViolation['impact'],
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      // eslint-disable-next-line tempots/require-async-signal-disposal
      nodes: v.nodes.map((n) => ({
        target: n.target as string[],
        html: n.html,
        failureSummary: n.failureSummary ?? '',
      })),
    }))
  }

  async captureScreenshot(name: string, options: ScreenshotOptions = {}): Promise<void> {
    const {
      maxDiffPixels = 100,
      threshold = 0.2,
      mask = [],
      animations = 'disabled',
    } = options

    await expect(this.getMain()).toHaveScreenshot(name, {
      maxDiffPixels,
      threshold,
      mask,
      animations,
    })
  }

  async waitForReady(locator?: Locator, timeout = 5000): Promise<void> {
    const target = locator ?? this.getMain()
    await target.waitFor({ state: 'visible', timeout })
  }
}
