import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Collapse component documentation page
 */
export class CollapsePage extends BasePage {
  readonly toggleButton: Locator
  readonly collapseContainers: Locator
  readonly collapsibleContent: Locator

  constructor(page: Page) {
    super(page, '/collapse')
    this.toggleButton = page.locator('button', { hasText: /Collapse|Expand/ })
    this.collapseContainers = page.locator('.bc-collapse')
    this.collapsibleContent = page.locator('.bc-collapse > div')
  }

  async toggleCollapse(): Promise<void> {
    await this.toggleButton.click()
  }

  async getCollapseContainerCount(): Promise<number> {
    return this.collapseContainers.count()
  }

  async isContentVisible(index: number = 0): Promise<boolean> {
    return this.collapsibleContent.nth(index).isVisible()
  }

  async getToggleButtonText(): Promise<string | null> {
    return this.toggleButton.textContent()
  }

  async waitForCollapseAnimation(timeout: number = 500): Promise<void> {
    await this.page.waitForTimeout(timeout)
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('collapse'),
    })
  }
}
