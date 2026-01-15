import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Button component documentation page
 */
export class ButtonPage extends BasePage {
  readonly buttons: Locator
  readonly disabledButtons: Locator
  readonly table: Locator

  constructor(page: Page) {
    super(page, '/button')
    this.buttons = page.locator('table button, main button')
    this.disabledButtons = page.locator('button[disabled]')
    this.table = page.locator('table')
  }

  async getAllButtons(): Promise<Locator[]> {
    const count = await this.buttons.count()
    return Array.from({ length: count }, (_, i) => this.buttons.nth(i))
  }

  async getButtonCount(): Promise<number> {
    return this.buttons.count()
  }

  async clickFirstButton(): Promise<void> {
    await this.buttons.first().click()
  }

  async getDisabledButtonCount(): Promise<number> {
    return this.disabledButtons.count()
  }

  async isFirstButtonEnabled(): Promise<boolean> {
    return this.buttons.first().isEnabled()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('button'),
    })
  }
}
