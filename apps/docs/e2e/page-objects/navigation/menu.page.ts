import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Menu component documentation page
 */
export class MenuPage extends BasePage {
  readonly menuTriggers: Locator
  readonly menuPanels: Locator
  readonly menuItems: Locator
  readonly menuSeparators: Locator
  readonly disabledMenuItems: Locator
  readonly submenus: Locator

  constructor(page: Page) {
    super(page, '/menu')
    this.menuTriggers = page.locator('button:has(.bc-menu), [data-menu-trigger]')
    this.menuPanels = page.locator('.bc-menu, [role="menu"]')
    this.menuItems = page.locator('.bc-menu-item, [role="menuitem"]')
    this.menuSeparators = page.locator('.bc-menu-separator, [role="separator"]')
    this.disabledMenuItems = page.locator('.bc-menu-item[aria-disabled="true"], [role="menuitem"][aria-disabled="true"]')
    this.submenus = page.locator('.bc-menu .bc-menu, [role="menu"] [role="menu"]')
  }

  async getMenuTriggerCount(): Promise<number> {
    return this.menuTriggers.count()
  }

  async openFirstMenu(): Promise<void> {
    await this.menuTriggers.first().click()
  }

  async isMenuVisible(): Promise<boolean> {
    const count = await this.menuPanels.count()
    if (count === 0) return false
    return this.menuPanels.first().isVisible()
  }

  async getMenuItemCount(): Promise<number> {
    return this.menuItems.count()
  }

  async clickMenuItem(index: number): Promise<void> {
    await this.menuItems.nth(index).click()
  }

  async getDisabledMenuItemCount(): Promise<number> {
    return this.disabledMenuItems.count()
  }

  async closeMenuByEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }

  async navigateWithArrowKeys(direction: 'up' | 'down'): Promise<void> {
    await this.page.keyboard.press(direction === 'up' ? 'ArrowUp' : 'ArrowDown')
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('menu'),
    })
  }
}
