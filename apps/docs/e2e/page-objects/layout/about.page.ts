import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the About page
 */
export class AboutPage extends BasePage {
  readonly title: Locator
  readonly description: Locator
  readonly card: Locator
  readonly content: Locator

  constructor(page: Page) {
    super(page, '/about')
    this.title = page.locator('h1')
    this.description = page.locator('h1 + p, .text-gray-500').first()
    this.card = page.locator('.bc-card')
    this.content = page.locator('main')
  }

  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? ''
  }

  async getDescriptionText(): Promise<string> {
    return (await this.description.textContent()) ?? ''
  }

  async hasCard(): Promise<boolean> {
    return (await this.card.count()) > 0
  }

  async getCardText(): Promise<string> {
    const count = await this.card.count()
    if (count === 0) return ''
    return (await this.card.first().textContent()) ?? ''
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('about'),
    })
  }
}
