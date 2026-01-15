import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Color Swatch component documentation page
 */
export class ColorSwatchPage extends BasePage {
  readonly colorSwatches: Locator
  readonly colorPreviews: Locator
  readonly textInputs: Locator
  readonly inputWrappers: Locator
  readonly cards: Locator
  readonly buttons: Locator
  readonly contrastInfo: Locator

  constructor(page: Page) {
    super(page, '/color-swatch')
    this.colorSwatches = page.locator('.bc-color-swatch, .bc-color-swatch-input')
    this.colorPreviews = page.locator('[style*="background-color"]')
    this.textInputs = page.locator('input[type="text"], input:not([type])')
    this.inputWrappers = page.locator('.bc-input-wrapper')
    this.cards = page.locator('.bc-card')
    this.buttons = page.locator('button')
    this.contrastInfo = page.locator(':text("Contrast Ratio")')
  }

  async getColorSwatchCount(): Promise<number> {
    return this.colorSwatches.count()
  }

  async clickColorSwatch(index: number): Promise<void> {
    const swatch = this.colorSwatches.nth(index)
    if ((await swatch.count()) > 0) {
      await swatch.click()
    }
  }

  async fillHexInput(index: number, value: string): Promise<void> {
    const input = this.textInputs.nth(index)
    if ((await input.count()) > 0) {
      await input.fill(value)
    }
  }

  async getHexInputValue(index: number): Promise<string> {
    const input = this.textInputs.nth(index)
    if ((await input.count()) > 0) {
      return input.inputValue()
    }
    return ''
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('color-swatch'),
    })
  }
}
