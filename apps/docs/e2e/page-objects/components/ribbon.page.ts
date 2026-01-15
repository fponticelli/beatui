import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Ribbon component documentation page
 */
export class RibbonPage extends BasePage {
  readonly ribbons: Locator
  readonly cards: Locator
  readonly topEndRibbons: Locator
  readonly topStartRibbons: Locator
  readonly bottomEndRibbons: Locator
  readonly bottomStartRibbons: Locator

  constructor(page: Page) {
    super(page, '/ribbon')
    this.ribbons = page.locator('.bc-ribbon')
    this.cards = page.locator('.bc-card')
    this.topEndRibbons = page.locator('.bc-ribbon.bc-ribbon--top-end')
    this.topStartRibbons = page.locator('.bc-ribbon.bc-ribbon--top-start')
    this.bottomEndRibbons = page.locator('.bc-ribbon.bc-ribbon--bottom-end')
    this.bottomStartRibbons = page.locator('.bc-ribbon.bc-ribbon--bottom-start')
  }

  async getAllRibbons(): Promise<Locator[]> {
    const count = await this.ribbons.count()
    return Array.from({ length: count }, (_, i) => this.ribbons.nth(i))
  }

  async getRibbonCount(): Promise<number> {
    return this.ribbons.count()
  }

  async getCardCount(): Promise<number> {
    return this.cards.count()
  }

  async getTopEndRibbonCount(): Promise<number> {
    return this.topEndRibbons.count()
  }

  async getTopStartRibbonCount(): Promise<number> {
    return this.topStartRibbons.count()
  }

  async getBottomEndRibbonCount(): Promise<number> {
    return this.bottomEndRibbons.count()
  }

  async getBottomStartRibbonCount(): Promise<number> {
    return this.bottomStartRibbons.count()
  }

  async getRibbonText(index: number): Promise<string | null> {
    return this.ribbons.nth(index).textContent()
  }

  async isRibbonVisible(index: number): Promise<boolean> {
    return this.ribbons.nth(index).isVisible()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('ribbon'),
    })
  }
}
