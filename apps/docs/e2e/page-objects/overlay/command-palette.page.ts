import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the CommandPalette component documentation page
 */
export class CommandPalettePage extends BasePage {
  readonly basicButton: Locator
  readonly triggerButtons: Locator
  readonly palette: Locator
  readonly searchInput: Locator
  readonly items: Locator
  readonly selectedItem: Locator
  readonly emptyMessage: Locator
  readonly sectionTitles: Locator

  constructor(page: Page) {
    super(page, '/command-palette')
    this.basicButton = page.locator('#open-basic-palette')
    this.triggerButtons = page.locator('button')
    this.palette = page.locator('.bc-command-palette')
    this.searchInput = page.locator('.bc-command-palette__input')
    this.items = page.locator('.bc-command-palette__item')
    this.selectedItem = page.locator('.bc-command-palette__item--selected')
    this.emptyMessage = page.locator('.bc-command-palette__empty')
    this.sectionTitles = page.locator('.bc-command-palette__section-title')
  }

  async openBasicPalette(): Promise<void> {
    await this.basicButton.click()
  }

  async isPaletteVisible(): Promise<boolean> {
    const count = await this.palette.count()
    if (count === 0) return false
    return this.palette.first().isVisible()
  }

  async typeSearch(text: string): Promise<void> {
    await this.searchInput.fill(text)
  }

  async getItemCount(): Promise<number> {
    return this.items.count()
  }

  async getSelectedItemText(): Promise<string | null> {
    const count = await this.selectedItem.count()
    if (count === 0) return null
    return this.selectedItem.first().textContent()
  }

  async pressArrowDown(): Promise<void> {
    await this.searchInput.press('ArrowDown')
  }

  async pressArrowUp(): Promise<void> {
    await this.searchInput.press('ArrowUp')
  }

  async pressEnter(): Promise<void> {
    await this.searchInput.press('Enter')
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }

  async clickItem(index: number): Promise<void> {
    await this.items.nth(index).click()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('command-palette'),
    })
  }
}
