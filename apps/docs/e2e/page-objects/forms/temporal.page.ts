import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Temporal component documentation page
 */
export class TemporalPage extends BasePage {
  readonly temporalDisplays: Locator
  readonly dateDisplays: Locator
  readonly timeDisplays: Locator
  readonly stack: Locator

  constructor(page: Page) {
    super(page, '/temporal')
    this.temporalDisplays = page.locator('p')
    this.dateDisplays = page.locator('p:has-text("date")')
    this.timeDisplays = page.locator('p:has-text("time")')
    this.stack = page.locator('.bc-stack')
  }

  async getTemporalDisplayCount(): Promise<number> {
    return this.temporalDisplays.count()
  }

  async getTodayDisplay(): Promise<string> {
    const todayEl = this.page.locator('p:has-text("Today:")')
    if ((await todayEl.count()) > 0) {
      return todayEl.textContent() ?? ''
    }
    return ''
  }

  async getNowDisplay(): Promise<string> {
    const nowEl = this.page.locator('p:has-text("Now:")')
    if ((await nowEl.count()) > 0) {
      return nowEl.textContent() ?? ''
    }
    return ''
  }

  async getPlainDateDisplay(): Promise<string> {
    const dateEl = this.page.locator('p:has-text("Plain date:")')
    if ((await dateEl.count()) > 0) {
      return dateEl.textContent() ?? ''
    }
    return ''
  }

  async getPlainTimeDisplay(): Promise<string> {
    const timeEl = this.page.locator('p:has-text("Plain time:")')
    if ((await timeEl.count()) > 0) {
      return timeEl.textContent() ?? ''
    }
    return ''
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('temporal'),
    })
  }
}
