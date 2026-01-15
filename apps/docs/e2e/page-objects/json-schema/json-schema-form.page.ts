import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the JSON Schema Form page
 */
export class JSONSchemaFormPage extends BasePage {
  readonly schemaEditor: Locator
  readonly monacoEditor: Locator
  readonly form: Locator
  readonly sampleSelect: Locator
  readonly sanitizeModeSelect: Locator
  readonly resetButton: Locator
  readonly dataPreview: Locator
  readonly errorPanel: Locator
  readonly errorList: Locator
  readonly inputs: Locator
  readonly labels: Locator

  constructor(page: Page) {
    super(page, '/json-schema-form')
    this.schemaEditor = page.locator('.monaco-editor').first()
    this.monacoEditor = page.locator('.monaco-editor')
    this.form = page.locator('form, .bc-form, .bc-json-schema-form')
    this.sampleSelect = page.locator('select').first()
    this.sanitizeModeSelect = page.locator('select').last()
    this.resetButton = page.locator('button:has-text("Reset")')
    this.dataPreview = page.locator('pre').last()
    this.errorPanel = page.locator('h3:has-text("AJV Validation Errors")').locator('..')
    this.errorList = page.locator('ul li')
    this.inputs = page.locator('main input, main textarea, main select')
    this.labels = page.locator('main label')
  }

  async waitForEditorReady(timeout = 10000): Promise<void> {
    await this.schemaEditor.waitFor({ state: 'visible', timeout })
  }

  async selectSample(sampleName: string): Promise<void> {
    await this.sampleSelect.selectOption(sampleName)
  }

  async selectSanitizeMode(mode: 'all' | 'failing' | 'off'): Promise<void> {
    await this.sanitizeModeSelect.selectOption(mode)
  }

  async clickReset(): Promise<void> {
    await this.resetButton.click()
  }

  async getDataPreviewContent(): Promise<string> {
    return (await this.dataPreview.textContent()) ?? ''
  }

  async hasValidationErrors(): Promise<boolean> {
    return (await this.errorPanel.count()) > 0
  }

  async getErrorCount(): Promise<number> {
    if (!(await this.hasValidationErrors())) return 0
    return this.errorList.count()
  }

  async getInputCount(): Promise<number> {
    return this.inputs.count()
  }

  async getLabelCount(): Promise<number> {
    return this.labels.count()
  }

  async getSampleNames(): Promise<string[]> {
    const options = await this.sampleSelect.locator('option').all()
    const names: string[] = []
    for (const option of options) {
      const text = await option.textContent()
      if (text) names.push(text)
    }
    return names
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('json-schema-form'),
    })
  }
}
