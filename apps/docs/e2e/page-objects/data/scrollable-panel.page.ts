import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the ScrollablePanel component documentation page
 */
export class ScrollablePanelPage extends BasePage {
  readonly scrollablePanel: Locator
  readonly panelHeader: Locator
  readonly panelBody: Locator
  readonly panelFooter: Locator
  readonly displayShadowsSwitch: Locator
  readonly displayHeaderSwitch: Locator
  readonly displayFooterSwitch: Locator
  readonly scrollContent: Locator
  readonly paragraphs: Locator

  constructor(page: Page) {
    super(page, '/scrollable-panel')
    this.scrollablePanel = page.locator('.bc-scrollable-panel')
    this.panelHeader = page.locator('.bc-scrollable-panel__header')
    this.panelBody = page.locator('.bc-scrollable-panel__body')
    this.panelFooter = page.locator('.bc-scrollable-panel__footer')
    this.displayShadowsSwitch = page.locator('.bc-switch').first()
    this.displayHeaderSwitch = page.locator('.bc-switch').nth(1)
    this.displayFooterSwitch = page.locator('.bc-switch').nth(2)
    this.scrollContent = page.locator('.bc-scrollable-panel__body .p-4')
    this.paragraphs = page.locator('.bc-scrollable-panel__body p')
  }

  async getPanelCount(): Promise<number> {
    return this.scrollablePanel.count()
  }

  async isHeaderVisible(): Promise<boolean> {
    // Check in the inner scrollable panel (not the controls panel)
    const innerPanelHeader = this.page.locator('.bc-scrollable-panel .bc-scrollable-panel__header')
    const count = await innerPanelHeader.count()
    if (count === 0) return false
    return innerPanelHeader.first().isVisible()
  }

  async isFooterVisible(): Promise<boolean> {
    // Check in the inner scrollable panel (not the controls panel)
    const innerPanelFooter = this.page.locator('.bc-scrollable-panel .bc-scrollable-panel__footer')
    const count = await innerPanelFooter.count()
    if (count === 0) return false
    return innerPanelFooter.first().isVisible()
  }

  async toggleShadows(): Promise<void> {
    await this.displayShadowsSwitch.click()
  }

  async toggleHeader(): Promise<void> {
    await this.displayHeaderSwitch.click()
  }

  async toggleFooter(): Promise<void> {
    await this.displayFooterSwitch.click()
  }

  async scrollToBottom(): Promise<void> {
    const body = this.panelBody.first()
    await body.evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
  }

  async scrollToTop(): Promise<void> {
    const body = this.panelBody.first()
    await body.evaluate((el) => {
      el.scrollTop = 0
    })
  }

  async getScrollPosition(): Promise<number> {
    const body = this.panelBody.first()
    return body.evaluate((el) => el.scrollTop)
  }

  async getParagraphCount(): Promise<number> {
    return this.paragraphs.count()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('scrollable-panel'),
    })
  }
}
