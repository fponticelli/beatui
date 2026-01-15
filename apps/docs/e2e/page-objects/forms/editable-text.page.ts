import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Editable Text component documentation page
 */
export class EditableTextPage extends BasePage {
  readonly editableTexts: Locator
  readonly editableTextDisplays: Locator
  readonly editableTextInputs: Locator
  readonly switches: Locator
  readonly cards: Locator
  readonly currentValueDisplay: Locator

  constructor(page: Page) {
    super(page, '/editable-text')
    this.editableTexts = page.locator('.bc-editable-text')
    this.editableTextDisplays = page.locator('.bc-editable-text-display')
    this.editableTextInputs = page.locator('.bc-editable-text input, .bc-editable-text textarea')
    this.switches = page.locator('.bc-switch')
    this.cards = page.locator('.bc-card')
    this.currentValueDisplay = page.locator('pre')
  }

  async getEditableTextCount(): Promise<number> {
    return this.editableTexts.count()
  }

  async clickToEdit(index: number): Promise<void> {
    const display = this.editableTexts.nth(index)
    if ((await display.count()) > 0) {
      await display.click()
    }
  }

  async editText(index: number, value: string): Promise<void> {
    await this.clickToEdit(index)
    const input = this.editableTextInputs.nth(index)
    if ((await input.count()) > 0) {
      await input.fill(value)
      await input.blur()
    }
  }

  async getDisplayText(index: number): Promise<string> {
    const display = this.editableTexts.nth(index)
    if ((await display.count()) > 0) {
      return display.textContent() ?? ''
    }
    return ''
  }

  async getCurrentValue(): Promise<string> {
    if ((await this.currentValueDisplay.count()) > 0) {
      return this.currentValueDisplay.textContent() ?? ''
    }
    return ''
  }

  async toggleDisabled(): Promise<void> {
    const switchEl = this.switches.first()
    if ((await switchEl.count()) > 0) {
      await switchEl.click()
    }
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('editable-text'),
    })
  }
}
