import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Notice component documentation page
 */
export class NoticePage extends BasePage {
  readonly notices: Locator
  readonly liveNotice: Locator
  readonly variantSelector: Locator
  readonly toneSelector: Locator
  readonly roleSelector: Locator
  readonly closableSwitch: Locator
  readonly iconSelector: Locator
  readonly titleInput: Locator
  readonly customIconInput: Locator

  constructor(page: Page) {
    super(page, '/notice')
    this.notices = page.locator('.bc-notice')
    this.liveNotice = page.locator('section').filter({ hasText: 'Live Notice' }).locator('.bc-notice')
    this.variantSelector = page.locator('header .bc-segmented-control').first()
    this.toneSelector = page.locator('header .bc-segmented-control').nth(1)
    this.roleSelector = page.locator('header .bc-segmented-control').nth(2)
    this.closableSwitch = page.locator('header .bc-switch').first()
    this.iconSelector = page.locator('header .bc-segmented-control').nth(3)
    this.titleInput = page.locator('header input').first()
    this.customIconInput = page.locator('header input').nth(1)
  }

  async getAllNotices(): Promise<Locator[]> {
    const count = await this.notices.count()
    return Array.from({ length: count }, (_, i) => this.notices.nth(i))
  }

  async getNoticeCount(): Promise<number> {
    return this.notices.count()
  }

  async selectVariant(variant: 'Info' | 'Success' | 'Warning' | 'Danger'): Promise<void> {
    await this.variantSelector.locator(`button:has-text("${variant}")`).click()
  }

  async selectTone(tone: 'Subtle' | 'Prominent'): Promise<void> {
    await this.toneSelector.locator(`button:has-text("${tone}")`).click()
  }

  async selectRole(role: 'Auto' | 'Status' | 'Alert'): Promise<void> {
    await this.roleSelector.locator(`button:has-text("${role}")`).click()
  }

  async toggleClosable(): Promise<void> {
    await this.closableSwitch.click()
  }

  async selectIconMode(mode: 'Auto' | 'Custom' | 'None'): Promise<void> {
    await this.iconSelector.locator(`button:has-text("${mode}")`).click()
  }

  async setTitle(title: string): Promise<void> {
    await this.titleInput.fill(title)
  }

  async setCustomIcon(iconName: string): Promise<void> {
    await this.customIconInput.fill(iconName)
  }

  async getNoticeRole(index: number): Promise<string | null> {
    return this.notices.nth(index).getAttribute('role')
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('notice'),
    })
  }
}
