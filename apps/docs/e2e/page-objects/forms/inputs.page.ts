import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Inputs component documentation page
 */
export class InputsPage extends BasePage {
  readonly textInputs: Locator
  readonly numberInputs: Locator
  readonly checkboxInputs: Locator
  readonly colorInputs: Locator
  readonly fileInputs: Locator
  readonly dropdowns: Locator
  readonly selects: Locator
  readonly switches: Locator
  readonly sliders: Locator
  readonly textareas: Locator
  readonly inputWrappers: Locator

  constructor(page: Page) {
    super(page, '/inputs')
    this.textInputs = page.locator('input[type="text"], input:not([type])')
    this.numberInputs = page.locator('input[type="number"]')
    this.checkboxInputs = page.locator('input[type="checkbox"]')
    this.colorInputs = page.locator('input[type="color"]')
    this.fileInputs = page.locator('input[type="file"]')
    this.dropdowns = page.locator('.bc-dropdown')
    this.selects = page.locator('select')
    this.switches = page.locator('.bc-switch')
    this.sliders = page.locator('input[type="range"]')
    this.textareas = page.locator('textarea')
    this.inputWrappers = page.locator('.bc-input-wrapper')
  }

  async getTextInputCount(): Promise<number> {
    return this.textInputs.count()
  }

  async getInputWrapperCount(): Promise<number> {
    return this.inputWrappers.count()
  }

  async fillTextInput(index: number, value: string): Promise<void> {
    const input = this.textInputs.nth(index)
    if ((await input.count()) > 0) {
      await input.fill(value)
    }
  }

  async getTextInputValue(index: number): Promise<string> {
    const input = this.textInputs.nth(index)
    if ((await input.count()) > 0) {
      return input.inputValue()
    }
    return ''
  }

  async toggleSwitch(index: number): Promise<void> {
    const switchEl = this.switches.nth(index)
    if ((await switchEl.count()) > 0) {
      await switchEl.click()
    }
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('inputs'),
    })
  }
}
