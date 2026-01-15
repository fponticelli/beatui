import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Tabs component documentation page
 */
export class TabsPage extends BasePage {
  readonly tabLists: Locator
  readonly tabs: Locator
  readonly tabPanels: Locator
  readonly selectedTabs: Locator
  readonly disabledTabs: Locator

  constructor(page: Page) {
    super(page, '/tabs')
    this.tabLists = page.locator('.bc-tabs, [role="tablist"]')
    this.tabs = page.locator('.bc-tab, [role="tab"]')
    this.tabPanels = page.locator('.bc-tab-panel, [role="tabpanel"]')
    this.selectedTabs = page.locator('[role="tab"][aria-selected="true"], .bc-tab[data-selected="true"]')
    this.disabledTabs = page.locator('[role="tab"][aria-disabled="true"], .bc-tab[disabled]')
  }

  async getTabListCount(): Promise<number> {
    return this.tabLists.count()
  }

  async getTabCount(): Promise<number> {
    return this.tabs.count()
  }

  async getTabPanelCount(): Promise<number> {
    return this.tabPanels.count()
  }

  async selectTab(index: number): Promise<void> {
    await this.tabs.nth(index).click()
  }

  async getSelectedTabCount(): Promise<number> {
    return this.selectedTabs.count()
  }

  async getSelectedTabText(): Promise<string> {
    const firstSelected = this.selectedTabs.first()
    if (await firstSelected.count() === 0) return ''
    return firstSelected.textContent() ?? ''
  }

  async getDisabledTabCount(): Promise<number> {
    return this.disabledTabs.count()
  }

  async isTabSelected(index: number): Promise<boolean> {
    const tab = this.tabs.nth(index)
    const ariaSelected = await tab.getAttribute('aria-selected')
    return ariaSelected === 'true'
  }

  async navigateWithArrowKeys(direction: 'left' | 'right'): Promise<void> {
    await this.page.keyboard.press(direction === 'left' ? 'ArrowLeft' : 'ArrowRight')
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('tabs'),
    })
  }
}
