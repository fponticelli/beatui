import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Tooltip component documentation page
 */
export class TooltipPage extends BasePage {
  readonly triggerButtons: Locator
  readonly tooltips: Locator
  readonly placementSelector: Locator
  readonly showOnSelector: Locator
  readonly showDelayInput: Locator
  readonly hideDelayInput: Locator

  constructor(page: Page) {
    super(page, '/tooltip')
    this.triggerButtons = page.locator('.bc-button')
    this.tooltips = page.locator('.bc-tooltip, [role="tooltip"]')
    this.placementSelector = page.locator('select').first()
    this.showOnSelector = page.locator('select').nth(1)
    this.showDelayInput = page.locator('input[type="number"]').first()
    this.hideDelayInput = page.locator('input[type="number"]').nth(1)
  }

  async getTriggerButtonCount(): Promise<number> {
    return this.triggerButtons.count()
  }

  async hoverFirstTrigger(): Promise<void> {
    await this.triggerButtons.first().hover()
  }

  async hoverTriggerByText(text: string): Promise<void> {
    await this.page.locator(`button:has-text("${text}")`).hover()
  }

  async focusTriggerByText(text: string): Promise<void> {
    await this.page.locator(`button:has-text("${text}")`).focus()
  }

  async isTooltipVisible(): Promise<boolean> {
    const count = await this.tooltips.count()
    if (count === 0) return false
    return this.tooltips.first().isVisible()
  }

  async getTooltipText(): Promise<string> {
    if ((await this.tooltips.count()) > 0) {
      return (await this.tooltips.first().textContent()) ?? ''
    }
    return ''
  }

  async waitForTooltip(timeout = 1000): Promise<void> {
    await this.tooltips.first().waitFor({ state: 'visible', timeout })
  }

  async waitForTooltipHidden(timeout = 1000): Promise<void> {
    await this.tooltips.first().waitFor({ state: 'hidden', timeout })
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('tooltip'),
    })
  }
}
