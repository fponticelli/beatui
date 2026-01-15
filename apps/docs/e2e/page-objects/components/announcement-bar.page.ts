import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the AnnouncementBar component documentation page
 */
export class AnnouncementBarPage extends BasePage {
  readonly announcementBars: Locator
  readonly colorSelector: Locator
  readonly showIconSwitch: Locator
  readonly closableSwitch: Locator
  readonly closeButtons: Locator
  readonly cards: Locator
  readonly interactiveExample: Locator
  readonly colorVariants: Locator

  constructor(page: Page) {
    super(page, '/announcement-bar')
    this.announcementBars = page.locator('.bc-announcement-bar')
    this.colorSelector = page.locator('header .bc-segmented-control').first()
    this.showIconSwitch = page.locator('header .bc-switch').first()
    this.closableSwitch = page.locator('header .bc-switch').nth(1)
    this.closeButtons = page.locator('.bc-announcement-bar button')
    this.cards = page.locator('.bc-card')
    this.interactiveExample = page.locator('.bc-card').first().locator('.bc-announcement-bar')
    this.colorVariants = page.locator('.grid .bc-announcement-bar')
  }

  async getAllAnnouncementBars(): Promise<Locator[]> {
    const count = await this.announcementBars.count()
    return Array.from({ length: count }, (_, i) => this.announcementBars.nth(i))
  }

  async getAnnouncementBarCount(): Promise<number> {
    return this.announcementBars.count()
  }

  async selectColor(color: 'Primary' | 'Success' | 'Warning' | 'Danger' | 'Info'): Promise<void> {
    await this.colorSelector.locator(`button:has-text("${color}")`).click()
  }

  async toggleShowIcon(): Promise<void> {
    await this.showIconSwitch.click()
  }

  async toggleClosable(): Promise<void> {
    await this.closableSwitch.click()
  }

  async clickCloseButton(index: number = 0): Promise<void> {
    await this.closeButtons.nth(index).click()
  }

  async getCloseButtonCount(): Promise<number> {
    return this.closeButtons.count()
  }

  async getAnnouncementBarText(index: number): Promise<string | null> {
    return this.announcementBars.nth(index).textContent()
  }

  async isAnnouncementBarVisible(index: number): Promise<boolean> {
    return this.announcementBars.nth(index).isVisible()
  }

  async getColorVariantCount(): Promise<number> {
    return this.colorVariants.count()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('announcement-bar'),
    })
  }
}
