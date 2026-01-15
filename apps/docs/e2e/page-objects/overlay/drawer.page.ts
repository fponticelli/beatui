import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Drawer component documentation page
 */
export class DrawerPage extends BasePage {
  readonly openButtons: Locator
  readonly drawers: Locator
  readonly closeButtons: Locator
  readonly overlays: Locator
  readonly sizeSelector: Locator
  readonly sideSelector: Locator
  readonly overlayEffectSelector: Locator

  constructor(page: Page) {
    super(page, '/drawer')
    this.openButtons = page.locator(
      'button:has-text("Open"), button:has-text("Drawer")'
    )
    this.drawers = page.locator('.bc-drawer')
    this.closeButtons = page.locator('.bc-drawer button:has-text("Close"), .bc-drawer .bc-drawer__close')
    this.overlays = page.locator('.bc-drawer-overlay, [data-drawer-overlay]')
    this.sizeSelector = page.locator('.bc-segmented-input').first()
    this.sideSelector = page.locator('.bc-segmented-input').nth(1)
    this.overlayEffectSelector = page.locator('.bc-segmented-input').nth(2)
  }

  async getOpenButtonCount(): Promise<number> {
    return this.openButtons.count()
  }

  async openFirstDrawer(): Promise<void> {
    await this.openButtons.first().click()
  }

  async openDrawerByText(text: string): Promise<void> {
    await this.page.locator(`button:has-text("${text}")`).click()
  }

  async isDrawerVisible(): Promise<boolean> {
    const count = await this.drawers.count()
    if (count === 0) return false
    return this.drawers.first().isVisible()
  }

  async closeDrawer(): Promise<void> {
    if ((await this.closeButtons.count()) > 0) {
      await this.closeButtons.first().click()
    }
  }

  async closeByOverlayClick(): Promise<void> {
    if ((await this.overlays.count()) > 0) {
      await this.overlays.first().click({ position: { x: 10, y: 10 } })
    }
  }

  async closeByEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('drawer'),
    })
  }
}
