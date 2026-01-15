import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Flyout component documentation page
 */
export class FlyoutPage extends BasePage {
  readonly flyoutTriggers: Locator
  readonly flyouts: Locator
  readonly flyoutContents: Locator
  readonly closeButtons: Locator
  readonly placementButtons: Locator

  constructor(page: Page) {
    super(page, '/flyout')
    this.flyoutTriggers = page.locator('button:has(+ .bc-flyout), [data-flyout-trigger]')
    this.flyouts = page.locator('.bc-flyout, [data-flyout]')
    this.flyoutContents = page.locator('.bc-flyout > *, [data-flyout-content]')
    this.closeButtons = page.locator('.bc-flyout-close, [data-flyout-close]')
    this.placementButtons = page.locator('main button')
  }

  async getTriggerCount(): Promise<number> {
    return this.placementButtons.count()
  }

  async hoverTrigger(index: number): Promise<void> {
    await this.placementButtons.nth(index).hover()
  }

  async clickTrigger(index: number): Promise<void> {
    await this.placementButtons.nth(index).click()
  }

  async doubleClickTrigger(index: number): Promise<void> {
    await this.placementButtons.nth(index).dblclick()
  }

  async isFlyoutVisible(): Promise<boolean> {
    const count = await this.flyouts.count()
    if (count === 0) return false
    return this.flyouts.first().isVisible()
  }

  async getFlyoutCount(): Promise<number> {
    return this.flyouts.count()
  }

  async closeFlyoutByEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }

  async closeFlyoutByButton(): Promise<void> {
    if (await this.closeButtons.count() > 0) {
      await this.closeButtons.first().click()
    }
  }

  async waitForFlyoutToAppear(timeout: number = 1000): Promise<void> {
    await this.flyouts.first().waitFor({ state: 'visible', timeout })
  }

  async waitForFlyoutToDisappear(timeout: number = 1000): Promise<void> {
    await this.flyouts.first().waitFor({ state: 'hidden', timeout })
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('flyout'),
    })
  }
}
