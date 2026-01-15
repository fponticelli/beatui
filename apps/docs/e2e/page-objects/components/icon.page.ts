import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Icon component documentation page
 */
export class IconPage extends BasePage {
  readonly icons: Locator
  readonly iconContainers: Locator
  readonly sizeSelector: Locator
  readonly colorSelector: Locator

  constructor(page: Page) {
    super(page, '/icon')
    this.icons = page.locator('.bc-icon')
    this.iconContainers = page.locator('.flex.flex-col.items-center')
    this.sizeSelector = page.locator('header .bc-segmented-control').first()
    this.colorSelector = page.locator('header .bc-segmented-control').nth(1)
  }

  async getAllIcons(): Promise<Locator[]> {
    const count = await this.icons.count()
    return Array.from({ length: count }, (_, i) => this.icons.nth(i))
  }

  async getIconCount(): Promise<number> {
    return this.icons.count()
  }

  async getIconContainerCount(): Promise<number> {
    return this.iconContainers.count()
  }

  async selectSize(size: string): Promise<void> {
    await this.sizeSelector.locator(`button:has-text("${size}")`).click()
  }

  async selectColor(color: string): Promise<void> {
    await this.colorSelector.locator(`button:has-text("${color}")`).click()
  }

  async getIconTitle(index: number): Promise<string | null> {
    return this.icons.nth(index).getAttribute('title')
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('icon'),
    })
  }
}
