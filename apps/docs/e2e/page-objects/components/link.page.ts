import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Link component documentation page
 */
export class LinkPage extends BasePage {
  readonly links: Locator
  readonly variantSelector: Locator
  readonly externalLink: Locator
  readonly defaultVariantLink: Locator
  readonly plainVariantLink: Locator
  readonly hoverVariantLink: Locator

  constructor(page: Page) {
    super(page, '/link')
    this.links = page.locator('.bc-link')
    this.variantSelector = page.locator('header .bc-segmented-control')
    this.externalLink = page.locator('.bc-link[target="_blank"]')
    this.defaultVariantLink = page.locator('.bc-link.bc-link--default')
    this.plainVariantLink = page.locator('.bc-link.bc-link--plain')
    this.hoverVariantLink = page.locator('.bc-link.bc-link--hover')
  }

  async getAllLinks(): Promise<Locator[]> {
    const count = await this.links.count()
    return Array.from({ length: count }, (_, i) => this.links.nth(i))
  }

  async getLinkCount(): Promise<number> {
    return this.links.count()
  }

  async selectVariant(variant: 'Default' | 'Plain' | 'Hover'): Promise<void> {
    await this.variantSelector.locator(`button:has-text("${variant}")`).click()
  }

  async getLinkHref(index: number): Promise<string | null> {
    return this.links.nth(index).getAttribute('href')
  }

  async clickLink(index: number): Promise<void> {
    await this.links.nth(index).click()
  }

  async getExternalLinkCount(): Promise<number> {
    return this.externalLink.count()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('link'),
    })
  }
}
