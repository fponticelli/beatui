import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Segmented Control component documentation page
 */
export class SegmentedControlPage extends BasePage {
  readonly segmentedControls: Locator
  readonly segmentButtons: Locator
  readonly selectedSegments: Locator
  readonly sizeTable: Locator
  readonly tableRows: Locator
  readonly switches: Locator

  constructor(page: Page) {
    super(page, '/segmented-control')
    this.segmentedControls = page.locator(
      '.bc-segmented-input, .bc-segmented-control'
    )
    this.segmentButtons = page.locator(
      '.bc-segmented-input button, .bc-segmented-control button'
    )
    this.selectedSegments = page.locator(
      '.bc-segmented-input button[aria-pressed="true"], .bc-segmented-control button[data-selected="true"]'
    )
    this.sizeTable = page.locator('table')
    this.tableRows = page.locator('tbody tr')
    this.switches = page.locator('.bc-switch')
  }

  async getSegmentedControlCount(): Promise<number> {
    return this.segmentedControls.count()
  }

  async getSegmentButtonCount(): Promise<number> {
    return this.segmentButtons.count()
  }

  async selectSegment(
    controlIndex: number,
    segmentIndex: number
  ): Promise<void> {
    const control = this.segmentedControls.nth(controlIndex)
    const button = control.locator('button').nth(segmentIndex)
    if ((await button.count()) > 0) {
      await button.click()
    }
  }

  async getSelectedSegmentText(controlIndex: number): Promise<string> {
    const control = this.segmentedControls.nth(controlIndex)
    const selected = control.locator(
      'button[aria-pressed="true"], button[data-selected="true"]'
    )
    if ((await selected.count()) > 0) {
      return (await selected.textContent()) ?? ''
    }
    return ''
  }

  async toggleDisabled(): Promise<void> {
    const switchEl = this.switches.first()
    if ((await switchEl.count()) > 0) {
      await switchEl.click()
    }
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('segmented-control'),
    })
  }
}
