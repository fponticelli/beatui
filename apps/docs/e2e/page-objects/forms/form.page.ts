import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Form/Control component documentation page
 */
export class FormPage extends BasePage {
  readonly inputs: Locator
  readonly labels: Locator
  readonly textInputs: Locator
  readonly checkboxes: Locator
  readonly radios: Locator
  readonly selects: Locator
  readonly submitButtons: Locator
  readonly errorMessages: Locator

  constructor(page: Page) {
    super(page, '/control')
    this.inputs = page.locator('input, textarea, select')
    this.labels = page.locator('label')
    this.textInputs = page.locator('input[type="text"], input:not([type]), textarea')
    this.checkboxes = page.locator('input[type="checkbox"]')
    this.radios = page.locator('input[type="radio"]')
    this.selects = page.locator('select')
    this.submitButtons = page.locator('button[type="submit"]')
    this.errorMessages = page.locator('.bc-control-error, [data-error], .error')
  }

  async getInputCount(): Promise<number> {
    return this.inputs.count()
  }

  async getLabelCount(): Promise<number> {
    return this.labels.count()
  }

  async fillFirstInput(value: string): Promise<void> {
    const textInput = this.textInputs.first()
    if (await textInput.count() > 0) {
      await textInput.fill(value)
    }
  }

  async getFirstInputValue(): Promise<string> {
    const textInput = this.textInputs.first()
    if (await textInput.count() > 0) {
      return textInput.inputValue()
    }
    return ''
  }

  async toggleFirstCheckbox(): Promise<void> {
    if (await this.checkboxes.count() > 0) {
      await this.checkboxes.first().click()
    }
  }

  async isFirstCheckboxChecked(): Promise<boolean> {
    if (await this.checkboxes.count() > 0) {
      return this.checkboxes.first().isChecked()
    }
    return false
  }

  async hasErrorMessages(): Promise<boolean> {
    return (await this.errorMessages.count()) > 0
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('form'),
    })
  }
}
