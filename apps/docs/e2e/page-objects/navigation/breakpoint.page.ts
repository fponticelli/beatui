import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Breakpoint component documentation page
 */
export class BreakpointPage extends BasePage {
  readonly breakpointTables: Locator
  readonly viewportWidthDisplay: Locator
  readonly currentBreakpointDisplay: Locator
  readonly breakpointIndicators: Locator
  readonly viewportSection: Locator
  readonly elementSection: Locator

  constructor(page: Page) {
    super(page, '/breakpoint')
    this.breakpointTables = page.locator('table')
    this.viewportWidthDisplay = page.locator('text=Viewport width:').locator('..').locator('span.font-bold')
    this.currentBreakpointDisplay = page.locator('text=Current breakpoint:').locator('..').locator('span.font-bold')
    this.breakpointIndicators = page.locator('table td iconify-icon, table td svg')
    this.viewportSection = page.locator('h1:has-text("Viewport Breakpoints")').locator('..')
    this.elementSection = page.locator('h1:has-text("Element Breakpoints")').locator('..')
  }

  async getTableCount(): Promise<number> {
    return this.breakpointTables.count()
  }

  async getViewportWidth(): Promise<string> {
    if (await this.viewportWidthDisplay.count() === 0) return ''
    return (await this.viewportWidthDisplay.first().textContent()) ?? ''
  }

  async getCurrentBreakpoint(): Promise<string> {
    if (await this.currentBreakpointDisplay.count() === 0) return ''
    return (await this.currentBreakpointDisplay.first().textContent()) ?? ''
  }

  async getBreakpointIndicatorCount(): Promise<number> {
    return this.breakpointIndicators.count()
  }

  async hasViewportSection(): Promise<boolean> {
    return (await this.viewportSection.count()) > 0
  }

  async hasElementSection(): Promise<boolean> {
    return (await this.elementSection.count()) > 0
  }

  async resizeViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height })
  }

  async getViewportSize(): Promise<{ width: number; height: number }> {
    return this.page.viewportSize() ?? { width: 0, height: 0 }
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('breakpoint'),
    })
  }
}
