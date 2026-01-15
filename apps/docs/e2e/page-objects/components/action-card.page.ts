import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the ActionCard component documentation page
 */
export class ActionCardPage extends BasePage {
  readonly actionCards: Locator
  readonly activeActionCards: Locator
  readonly disabledActionCards: Locator
  readonly cards: Locator
  readonly gridActionCards: Locator

  constructor(page: Page) {
    super(page, '/action-card')
    this.actionCards = page.locator('.bc-action-card')
    this.activeActionCards = page.locator('.bc-action-card.bc-action-card--active')
    this.disabledActionCards = page.locator('.bc-action-card.bc-action-card--disabled')
    this.cards = page.locator('.bc-card')
    this.gridActionCards = page.locator('[style*="grid"] .bc-action-card')
  }

  async getAllActionCards(): Promise<Locator[]> {
    const count = await this.actionCards.count()
    return Array.from({ length: count }, (_, i) => this.actionCards.nth(i))
  }

  async getActionCardCount(): Promise<number> {
    return this.actionCards.count()
  }

  async getActiveActionCardCount(): Promise<number> {
    return this.activeActionCards.count()
  }

  async getDisabledActionCardCount(): Promise<number> {
    return this.disabledActionCards.count()
  }

  async clickActionCard(index: number): Promise<void> {
    await this.actionCards.nth(index).click()
  }

  async getActionCardTitle(index: number): Promise<string | null> {
    const card = this.actionCards.nth(index)
    const title = card.locator('.bc-action-card__title')
    return title.textContent()
  }

  async getActionCardDescription(index: number): Promise<string | null> {
    const card = this.actionCards.nth(index)
    const description = card.locator('.bc-action-card__description')
    return description.textContent()
  }

  async isActionCardActive(index: number): Promise<boolean> {
    const card = this.actionCards.nth(index)
    const classAttr = await card.getAttribute('class')
    return classAttr?.includes('bc-action-card--active') ?? false
  }

  async isActionCardDisabled(index: number): Promise<boolean> {
    const card = this.actionCards.nth(index)
    const classAttr = await card.getAttribute('class')
    return classAttr?.includes('bc-action-card--disabled') ?? false
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('action-card'),
    })
  }
}
