import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the JSON Structure Custom Widgets page
 */
export class JSONStructureCustomWidgetsPage extends BasePage {
  readonly documentationPanel: Locator
  readonly liveFormPanel: Locator
  readonly form: Locator
  readonly resetButton: Locator
  readonly dataPreview: Locator
  readonly emailWidget: Locator
  readonly uuidWidgets: Locator
  readonly phoneWidget: Locator
  readonly percentageSliders: Locator
  readonly notesTextarea: Locator
  readonly inputs: Locator
  readonly codeExample: Locator

  constructor(page: Page) {
    super(page, '/json-structure-custom-widgets')
    this.documentationPanel = page.locator('h3:has-text("Custom Widgets Documentation")').locator('..')
    this.liveFormPanel = page.locator('h3:has-text("Live Demo with Custom Widgets")').locator('..')
    this.form = page.locator('form, .bc-form, .bc-json-structure-form')
    this.resetButton = page.locator('button:has-text("Reset")')
    this.dataPreview = page.locator('pre').last()
    this.emailWidget = page.locator('label:has-text("Email Address")').locator('..')
    this.uuidWidgets = page.locator('label:has-text("UUID")').locator('..')
    this.phoneWidget = page.locator('label:has-text("Phone Number")').locator('..')
    this.percentageSliders = page.locator('input[type="range"]')
    this.notesTextarea = page.locator('textarea')
    this.inputs = page.locator('main input, main textarea')
    this.codeExample = page.locator('pre code')
  }

  async getEmailWidgetValue(): Promise<string> {
    const input = this.emailWidget.locator('input')
    return input.inputValue()
  }

  async setEmailWidgetValue(value: string): Promise<void> {
    const input = this.emailWidget.locator('input')
    await input.fill(value)
  }

  async getUuidWidgetCount(): Promise<number> {
    return this.uuidWidgets.count()
  }

  async getPercentageSliderCount(): Promise<number> {
    return this.percentageSliders.count()
  }

  async setPercentageSlider(index: number, value: number): Promise<void> {
    await this.percentageSliders.nth(index).fill(String(value))
  }

  async clickReset(): Promise<void> {
    await this.resetButton.click()
  }

  async getDataPreviewContent(): Promise<string> {
    return (await this.dataPreview.textContent()) ?? ''
  }

  async hasDocumentation(): Promise<boolean> {
    const count = await this.documentationPanel.count()
    return count > 0
  }

  async hasCodeExample(): Promise<boolean> {
    const count = await this.codeExample.count()
    return count > 0
  }

  async getInputCount(): Promise<number> {
    return this.inputs.count()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('json-structure-custom-widgets'),
    })
  }
}
