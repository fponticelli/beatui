import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Toolbar component documentation page
 */
export class ToolbarPage extends BasePage {
  readonly toolbars: Locator
  readonly toolbarButtons: Locator
  readonly toolbarGroups: Locator
  readonly toolbarDividers: Locator
  readonly toolbarInputs: Locator
  readonly toolbarSelects: Locator

  constructor(page: Page) {
    super(page, '/toolbar')
    this.toolbars = page.locator('.bc-toolbar, [role="toolbar"]')
    this.toolbarButtons = page.locator('.bc-toolbar-button, .bc-toolbar button')
    this.toolbarGroups = page.locator('.bc-toolbar-group, [data-toolbar-group]')
    this.toolbarDividers = page.locator('.bc-toolbar-divider, [data-toolbar-divider]')
    this.toolbarInputs = page.locator('.bc-toolbar input')
    this.toolbarSelects = page.locator('.bc-toolbar select')
  }

  async getToolbarCount(): Promise<number> {
    return this.toolbars.count()
  }

  async getToolbarButtonCount(): Promise<number> {
    return this.toolbarButtons.count()
  }

  async clickToolbarButton(index: number): Promise<void> {
    await this.toolbarButtons.nth(index).click()
  }

  async getToolbarGroupCount(): Promise<number> {
    return this.toolbarGroups.count()
  }

  async getToolbarDividerCount(): Promise<number> {
    return this.toolbarDividers.count()
  }

  async hasToolbarInputs(): Promise<boolean> {
    return (await this.toolbarInputs.count()) > 0
  }

  async hasToolbarSelects(): Promise<boolean> {
    return (await this.toolbarSelects.count()) > 0
  }

  async fillToolbarInput(index: number, value: string): Promise<void> {
    const input = this.toolbarInputs.nth(index)
    if (await input.count() > 0) {
      await input.fill(value)
    }
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('toolbar'),
    })
  }
}
