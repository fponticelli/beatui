import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Badge component documentation page
 */
export class BadgePage extends BasePage {
  readonly badges: Locator
  readonly cards: Locator
  readonly circleBadges: Locator
  readonly badgesWithIcons: Locator

  constructor(page: Page) {
    super(page, '/badge')
    this.badges = page.locator('.bc-badge')
    this.cards = page.locator('.bc-card')
    this.circleBadges = page.locator('.bc-badge.bc-badge--circle')
    this.badgesWithIcons = page.locator('.bc-badge:has(.bc-icon)')
  }

  async getAllBadges(): Promise<Locator[]> {
    const count = await this.badges.count()
    return Array.from({ length: count }, (_, i) => this.badges.nth(i))
  }

  async getBadgeCount(): Promise<number> {
    return this.badges.count()
  }

  async getCircleBadgeCount(): Promise<number> {
    return this.circleBadges.count()
  }

  async getBadgesWithIconsCount(): Promise<number> {
    return this.badgesWithIcons.count()
  }

  async getCardCount(): Promise<number> {
    return this.cards.count()
  }

  async getBadgeText(index: number): Promise<string | null> {
    return this.badges.nth(index).textContent()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('badge'),
    })
  }
}
