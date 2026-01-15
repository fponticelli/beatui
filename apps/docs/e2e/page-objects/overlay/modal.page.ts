import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Modal component documentation page
 */
export class ModalPage extends BasePage {
  readonly openButtons: Locator
  readonly modals: Locator
  readonly closeButtons: Locator
  readonly overlays: Locator

  constructor(page: Page) {
    super(page, '/modal')
    this.openButtons = page.locator('button:has-text("Open"), button:has-text("Show")')
    this.modals = page.locator('[role="dialog"], .bc-modal')
    this.closeButtons = page.locator('[role="dialog"] button:has-text("Close"), .bc-modal button:has-text("Close")')
    this.overlays = page.locator('.bc-modal-overlay, [data-modal-overlay]')
  }

  async getOpenButtonCount(): Promise<number> {
    return this.openButtons.count()
  }

  async openFirstModal(): Promise<void> {
    await this.openButtons.first().click()
  }

  async isModalVisible(): Promise<boolean> {
    const count = await this.modals.count()
    if (count === 0) return false
    return this.modals.first().isVisible()
  }

  async closeModal(): Promise<void> {
    if (await this.closeButtons.count() > 0) {
      await this.closeButtons.first().click()
    }
  }

  async closeByOverlayClick(): Promise<void> {
    if (await this.overlays.count() > 0) {
      await this.overlays.first().click({ position: { x: 10, y: 10 } })
    }
  }

  async closeByEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('modal'),
    })
  }
}
