import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the RTL/LTR internationalization documentation page
 */
export class RtlLtrPage extends BasePage {
  readonly localeSelector: Locator
  readonly directionPreferenceSelector: Locator
  readonly currentDirectionDisplay: Locator
  readonly openDrawerButton: Locator
  readonly openModalButton: Locator
  readonly drawer: Locator
  readonly modal: Locator
  readonly introductionCard: Locator
  readonly directionDetectionCard: Locator
  readonly layoutComponentsCard: Locator
  readonly utilitiesCard: Locator
  readonly migrationGuideCard: Locator
  readonly sampleTextSection: Locator

  constructor(page: Page) {
    super(page, '/rtl-ltr')
    this.localeSelector = page.locator('.bc-segmented-input').first()
    this.directionPreferenceSelector = page.locator('.bc-segmented-input').nth(1)
    this.currentDirectionDisplay = page.locator('span.font-bold.text-primary')
    this.openDrawerButton = page.locator('button:has-text("Open Drawer")')
    this.openModalButton = page.locator('button:has-text("Open Modal")')
    this.drawer = page.locator('.bc-drawer')
    this.modal = page.locator('[role="dialog"], .bc-modal')
    this.introductionCard = page.locator('.bc-card').first()
    this.directionDetectionCard = page.locator('.bc-card').nth(1)
    this.layoutComponentsCard = page.locator('.bc-card').nth(2)
    this.utilitiesCard = page.locator('.bc-card').nth(3)
    this.migrationGuideCard = page.locator('.bc-card').nth(4)
    this.sampleTextSection = page.locator('.p-4.border.rounded')
  }

  async selectLocale(locale: 'en-US' | 'ar-SA' | 'he-IL' | 'fa-IR'): Promise<void> {
    const localeLabels: Record<string, string> = {
      'en-US': 'English',
      'ar-SA': 'العربية',
      'he-IL': 'עברית',
      'fa-IR': 'فارسی',
    }
    await this.page
      .locator(`.bc-segmented-input button:has-text("${localeLabels[locale]}")`)
      .first()
      .click()
  }

  async selectDirectionPreference(preference: 'auto' | 'ltr' | 'rtl'): Promise<void> {
    await this.page
      .locator(`.bc-segmented-input button:has-text("${preference.toUpperCase()}")`)
      .click()
  }

  async getCurrentDirection(): Promise<string> {
    return (await this.currentDirectionDisplay.textContent()) ?? ''
  }

  async openDrawer(): Promise<void> {
    await this.openDrawerButton.click()
  }

  async openModal(): Promise<void> {
    await this.openModalButton.click()
  }

  async isDrawerVisible(): Promise<boolean> {
    const count = await this.drawer.count()
    if (count === 0) return false
    return this.drawer.first().isVisible()
  }

  async isModalVisible(): Promise<boolean> {
    const count = await this.modal.count()
    if (count === 0) return false
    return this.modal.first().isVisible()
  }

  async closeByEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }

  async getDocumentDirection(): Promise<string> {
    return this.page.evaluate(() => {
      return document.documentElement.dir || 'ltr'
    })
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('rtl-ltr'),
    })
  }
}
