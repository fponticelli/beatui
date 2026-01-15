import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Combobox component documentation page
 */
export class ComboboxPage extends BasePage {
  readonly comboboxes: Locator
  readonly comboboxTriggers: Locator
  readonly comboboxInputs: Locator
  readonly comboboxOptions: Locator
  readonly comboboxDropdowns: Locator
  readonly selectedValueDisplays: Locator
  readonly labels: Locator

  constructor(page: Page) {
    super(page, '/combobox')
    this.comboboxes = page.locator('.bc-combobox')
    this.comboboxTriggers = page.locator('.bc-combobox-trigger, .bc-combobox button')
    this.comboboxInputs = page.locator('.bc-combobox input, .bc-combobox-search')
    this.comboboxOptions = page.locator('.bc-combobox-option, .bc-dropdown-option')
    this.comboboxDropdowns = page.locator('.bc-combobox-dropdown, .bc-combobox-listbox')
    this.selectedValueDisplays = page.locator(':text("Selected:")')
    this.labels = page.locator('label')
  }

  async getComboboxCount(): Promise<number> {
    return this.comboboxes.count()
  }

  async openCombobox(index: number): Promise<void> {
    const trigger = this.comboboxTriggers.nth(index)
    if ((await trigger.count()) > 0) {
      await trigger.click()
    }
  }

  async searchCombobox(index: number, query: string): Promise<void> {
    await this.openCombobox(index)
    const input = this.comboboxInputs.nth(index)
    if ((await input.count()) > 0) {
      await input.fill(query)
    }
  }

  async selectOption(optionText: string): Promise<void> {
    const option = this.page.locator(`.bc-combobox-option, .bc-dropdown-option`, {
      hasText: optionText,
    })
    if ((await option.count()) > 0) {
      await option.first().click()
    }
  }

  async getVisibleOptions(): Promise<string[]> {
    const options = this.comboboxOptions
    const count = await options.count()
    const texts: string[] = []
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent()
      if (text) {
        texts.push(text.trim())
      }
    }
    return texts
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('combobox'),
    })
  }
}
