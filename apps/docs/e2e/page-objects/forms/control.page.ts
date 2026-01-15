import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Control component documentation page
 */
export class ControlPage extends BasePage {
  readonly controls: Locator
  readonly textInputs: Locator
  readonly numberInputs: Locator
  readonly checkboxInputs: Locator
  readonly labels: Locator
  readonly descriptions: Locator
  readonly errorMessages: Locator
  readonly cards: Locator

  constructor(page: Page) {
    super(page, '/control')
    this.controls = page.locator('.bc-control')
    this.textInputs = page.locator('input[type="text"], input:not([type])')
    this.numberInputs = page.locator('input[type="number"]')
    this.checkboxInputs = page.locator('input[type="checkbox"]')
    this.labels = page.locator('.bc-control-label, label')
    this.descriptions = page.locator('.bc-control-description')
    this.errorMessages = page.locator('.bc-control-error')
    this.cards = page.locator('.bc-card')
  }

  async getControlCount(): Promise<number> {
    return this.controls.count()
  }

  async getLabelCount(): Promise<number> {
    return this.labels.count()
  }

  async hasErrorMessages(): Promise<boolean> {
    return (await this.errorMessages.count()) > 0
  }

  async getErrorMessageCount(): Promise<number> {
    return this.errorMessages.count()
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

  async toggleCheckbox(index: number): Promise<void> {
    const checkbox = this.checkboxInputs.nth(index)
    if ((await checkbox.count()) > 0) {
      await checkbox.click()
    }
  }

  async isCheckboxChecked(index: number): Promise<boolean> {
    const checkbox = this.checkboxInputs.nth(index)
    if ((await checkbox.count()) > 0) {
      return checkbox.isChecked()
    }
    return false
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('control'),
    })
  }
}
