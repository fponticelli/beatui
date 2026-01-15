import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Mask Input component documentation page
 */
export class MaskInputPage extends BasePage {
  readonly maskInputs: Locator
  readonly textInputs: Locator
  readonly switches: Locator
  readonly cards: Locator
  readonly form: Locator
  readonly inputWrappers: Locator

  constructor(page: Page) {
    super(page, '/mask-input')
    this.maskInputs = page.locator('.bc-mask-input, input.bc-mask-input')
    this.textInputs = page.locator('input[type="text"], input:not([type])')
    this.switches = page.locator('.bc-switch')
    this.cards = page.locator('.bc-card')
    this.form = page.locator('form')
    this.inputWrappers = page.locator('.bc-input-wrapper')
  }

  async getMaskInputCount(): Promise<number> {
    return this.maskInputs.count()
  }

  async getTextInputCount(): Promise<number> {
    return this.textInputs.count()
  }

  async fillMaskInput(index: number, value: string): Promise<void> {
    const input = this.textInputs.nth(index)
    if ((await input.count()) > 0) {
      await input.fill(value)
    }
  }

  async getMaskInputValue(index: number): Promise<string> {
    const input = this.textInputs.nth(index)
    if ((await input.count()) > 0) {
      return input.inputValue()
    }
    return ''
  }

  async typeMaskInput(index: number, value: string): Promise<void> {
    const input = this.textInputs.nth(index)
    if ((await input.count()) > 0) {
      await input.pressSequentially(value)
    }
  }

  async toggleSwitch(index: number): Promise<void> {
    const switchEl = this.switches.nth(index)
    if ((await switchEl.count()) > 0) {
      await switchEl.click()
    }
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('mask-input'),
    })
  }
}
