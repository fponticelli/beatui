import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the ProseMirror Editor component documentation page
 */
export class ProseMirrorEditorPage extends BasePage {
  readonly editor: Locator
  readonly toolbar: Locator
  readonly sampleSelect: Locator
  readonly showToolbarSwitch: Locator
  readonly readOnlySwitch: Locator
  readonly featureToggles: Locator
  readonly markdownPreview: Locator

  constructor(page: Page) {
    super(page, '/prosemirror-editor')
    this.editor = page.locator('.ProseMirror, [contenteditable="true"]')
    this.toolbar = page.locator('.bc-prosemirror-toolbar, [role="toolbar"]')
    this.sampleSelect = page.locator('select').first()
    this.showToolbarSwitch = page.locator('label:has-text("Show Toolbar") input, label:has-text("Show Toolbar") .bc-switch')
    this.readOnlySwitch = page.locator('label:has-text("Read Only") input, label:has-text("Read Only") .bc-switch')
    this.featureToggles = page.locator('.bc-switch')
    this.markdownPreview = page.locator('pre')
  }

  async isEditorVisible(): Promise<boolean> {
    return this.editor.first().isVisible()
  }

  async isToolbarVisible(): Promise<boolean> {
    const count = await this.toolbar.count()
    if (count === 0) return false
    return this.toolbar.first().isVisible()
  }

  async selectSample(index: number): Promise<void> {
    await this.sampleSelect.selectOption({ index })
  }

  async typeInEditor(text: string): Promise<void> {
    await this.editor.first().click()
    await this.editor.first().pressSequentially(text)
  }

  async getMarkdownPreview(): Promise<string> {
    return (await this.markdownPreview.first().textContent()) ?? ''
  }

  async getFeatureToggleCount(): Promise<number> {
    return this.featureToggles.count()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('prosemirror-editor'),
    })
  }
}
