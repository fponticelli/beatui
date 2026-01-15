import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Home page
 */
export class HomePage extends BasePage {
  readonly title: Locator
  readonly subtitle: Locator
  readonly cards: Locator
  readonly documentationHeading: Locator
  readonly authenticationCard: Locator
  readonly componentsCard: Locator
  readonly formsCard: Locator
  readonly aboutCard: Locator
  readonly links: Locator

  constructor(page: Page) {
    super(page, '/')
    this.title = page.locator('h1')
    this.subtitle = page.locator('h1 + p, .text-xl')
    this.cards = page.locator('.bc-card, [class*="card"]')
    this.documentationHeading = page.locator('h2:has-text("Documentation")')
    this.authenticationCard = page.locator('a[href="/authentication"]')
    this.componentsCard = page.locator('a[href="/button"]')
    this.formsCard = page.locator('a[href="/form"]')
    this.aboutCard = page.locator('a[href="/about"]')
    this.links = page.locator('a[href^="/"]')
  }

  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? ''
  }

  async getSubtitleText(): Promise<string> {
    return (await this.subtitle.first().textContent()) ?? ''
  }

  async getCardCount(): Promise<number> {
    return this.cards.count()
  }

  async navigateToAuthentication(): Promise<void> {
    await this.authenticationCard.click()
  }

  async navigateToComponents(): Promise<void> {
    await this.componentsCard.click()
  }

  async navigateToForms(): Promise<void> {
    await this.formsCard.click()
  }

  async navigateToAbout(): Promise<void> {
    await this.aboutCard.click()
  }

  async getLinkCount(): Promise<number> {
    return this.links.count()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('home'),
    })
  }
}
