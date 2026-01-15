import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Monaco Editor component documentation page
 */
export class MonacoEditorPage extends BasePage {
  readonly editor: Locator
  readonly languageSelect: Locator
  readonly codePreview: Locator
  readonly editorContainer: Locator

  constructor(page: Page) {
    super(page, '/monaco-editor')
    this.editor = page.locator('.monaco-editor')
    this.languageSelect = page.locator('select')
    this.codePreview = page.locator('pre')
    this.editorContainer = page.locator('[data-monaco-editor], .monaco-editor').first()
  }

  async isEditorVisible(): Promise<boolean> {
    return this.editor.first().isVisible()
  }

  async getEditorCount(): Promise<number> {
    return this.editor.count()
  }

  async selectLanguage(index: number): Promise<void> {
    await this.languageSelect.selectOption({ index })
  }

  async getPreviewContent(): Promise<string> {
    return (await this.codePreview.first().textContent()) ?? ''
  }

  async waitForEditorReady(timeout = 10000): Promise<void> {
    await this.editor.first().waitFor({ state: 'visible', timeout })
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('monaco-editor'),
    })
  }
}
