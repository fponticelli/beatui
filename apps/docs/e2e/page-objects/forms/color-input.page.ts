import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Color Input component documentation page
 */
export class ColorInputPage extends BasePage {
  readonly colorInputs: Locator
  readonly colorPreviews: Locator
  readonly inputWrappers: Locator
  readonly cards: Locator

  constructor(page: Page) {
    super(page, '/color-input')
    this.colorInputs = page.locator('input[type="color"]')
    this.colorPreviews = page.locator('.bc-color-input-preview, [style*="background-color"]')
    this.inputWrappers = page.locator('.bc-input-wrapper')
    this.cards = page.locator('.bc-card')
  }

  async getColorInputCount(): Promise<number> {
    return this.colorInputs.count()
  }

  async setColor(index: number, color: string): Promise<void> {
    const input = this.colorInputs.nth(index)
    if ((await input.count()) > 0) {
      await input.fill(color)
    }
  }

  async getColorValue(index: number): Promise<string> {
    const input = this.colorInputs.nth(index)
    if ((await input.count()) > 0) {
      return input.inputValue()
    }
    return ''
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('color-input'),
    })
  }
}
