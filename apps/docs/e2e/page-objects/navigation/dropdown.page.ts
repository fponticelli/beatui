import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Dropdown component documentation page
 */
export class DropdownPage extends BasePage {
  readonly dropdowns: Locator
  readonly dropdownTriggers: Locator
  readonly dropdownPanels: Locator
  readonly dropdownOptions: Locator
  readonly selectedOptions: Locator
  readonly optionGroups: Locator
  readonly placeholders: Locator

  constructor(page: Page) {
    super(page, '/dropdown')
    this.dropdowns = page.locator('.bc-dropdown, [data-dropdown]')
    this.dropdownTriggers = page.locator('.bc-dropdown-trigger, [data-dropdown-trigger]')
    this.dropdownPanels = page.locator('.bc-dropdown-panel, [data-dropdown-panel]')
    this.dropdownOptions = page.locator('.bc-dropdown-option, [data-dropdown-option]')
    this.selectedOptions = page.locator('.bc-dropdown-option[data-selected="true"], .bc-dropdown-option.selected')
    this.optionGroups = page.locator('.bc-dropdown-group, [data-dropdown-group]')
    this.placeholders = page.locator('.bc-dropdown-placeholder, [data-placeholder]')
  }

  async getDropdownCount(): Promise<number> {
    return this.dropdowns.count()
  }

  async openDropdown(index: number): Promise<void> {
    await this.dropdownTriggers.nth(index).click()
  }

  async isDropdownOpen(): Promise<boolean> {
    const count = await this.dropdownPanels.count()
    if (count === 0) return false
    return this.dropdownPanels.first().isVisible()
  }

  async getOptionCount(): Promise<number> {
    return this.dropdownOptions.count()
  }

  async selectOption(index: number): Promise<void> {
    await this.dropdownOptions.nth(index).click()
  }

  async getSelectedOptionCount(): Promise<number> {
    return this.selectedOptions.count()
  }

  async getOptionGroupCount(): Promise<number> {
    return this.optionGroups.count()
  }

  async closeDropdownByEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }

  async navigateWithArrowKeys(direction: 'up' | 'down'): Promise<void> {
    await this.page.keyboard.press(direction === 'up' ? 'ArrowUp' : 'ArrowDown')
  }

  async selectWithEnter(): Promise<void> {
    await this.page.keyboard.press('Enter')
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('dropdown'),
    })
  }
}
