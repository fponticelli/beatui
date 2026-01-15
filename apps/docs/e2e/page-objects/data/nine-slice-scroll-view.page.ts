import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the NineSliceScrollView component documentation page
 */
export class NineSliceScrollViewPage extends BasePage {
  readonly nineSliceScrollView: Locator
  readonly gridCells: Locator
  readonly columnsInput: Locator
  readonly rowsInput: Locator
  readonly startColumnsInput: Locator
  readonly endColumnsInput: Locator
  readonly headerRowsInput: Locator
  readonly footerRowsInput: Locator
  readonly anchorModeSelector: Locator
  readonly headerRegion: Locator
  readonly footerRegion: Locator
  readonly sidebarStartRegion: Locator
  readonly sidebarEndRegion: Locator
  readonly bodyRegion: Locator

  constructor(page: Page) {
    super(page, '/nine-slice-scroll-view')
    this.nineSliceScrollView = page.locator('.bc-nine-slice-scroll-view')
    this.gridCells = page.locator('.bc-nine-slice-scroll-view [class*="flex-row"]')
    this.columnsInput = page.locator('input[type="number"]').first()
    this.rowsInput = page.locator('input[type="number"]').nth(1)
    this.startColumnsInput = page.locator('input[type="number"]').nth(2)
    this.endColumnsInput = page.locator('input[type="number"]').nth(3)
    this.headerRowsInput = page.locator('input[type="number"]').nth(4)
    this.footerRowsInput = page.locator('input[type="number"]').nth(5)
    this.anchorModeSelector = page.locator('select')
    this.headerRegion = page.locator('.bc-nine-slice-scroll-view__header')
    this.footerRegion = page.locator('.bc-nine-slice-scroll-view__footer')
    this.sidebarStartRegion = page.locator('.bc-nine-slice-scroll-view__sidebar-start')
    this.sidebarEndRegion = page.locator('.bc-nine-slice-scroll-view__sidebar-end')
    this.bodyRegion = page.locator('.bc-nine-slice-scroll-view__body')
  }

  async isScrollViewVisible(): Promise<boolean> {
    const count = await this.nineSliceScrollView.count()
    if (count === 0) return false
    return this.nineSliceScrollView.first().isVisible()
  }

  async setColumns(value: number): Promise<void> {
    await this.columnsInput.fill(String(value))
  }

  async setRows(value: number): Promise<void> {
    await this.rowsInput.fill(String(value))
  }

  async setStartColumns(value: number): Promise<void> {
    await this.startColumnsInput.fill(String(value))
  }

  async setEndColumns(value: number): Promise<void> {
    await this.endColumnsInput.fill(String(value))
  }

  async setHeaderRows(value: number): Promise<void> {
    await this.headerRowsInput.fill(String(value))
  }

  async setFooterRows(value: number): Promise<void> {
    await this.footerRowsInput.fill(String(value))
  }

  async selectAnchorMode(mode: string): Promise<void> {
    await this.anchorModeSelector.selectOption(mode)
  }

  async scrollBody(deltaX: number, deltaY: number): Promise<void> {
    const body = this.bodyRegion.first()
    await body.evaluate(
      (el, { dx, dy }) => {
        el.scrollLeft += dx
        el.scrollTop += dy
      },
      { dx: deltaX, dy: deltaY }
    )
  }

  async getBodyScrollPosition(): Promise<{ left: number; top: number }> {
    const body = this.bodyRegion.first()
    return body.evaluate((el) => ({
      left: el.scrollLeft,
      top: el.scrollTop,
    }))
  }

  async getCellText(row: number, column: number): Promise<string> {
    const cell = this.page.locator(
      `.bc-nine-slice-scroll-view [class*="flex-row"]:nth-child(${row + 1}) > div:nth-child(${column + 1})`
    )
    return (await cell.textContent()) ?? ''
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('nine-slice-scroll-view'),
    })
  }
}
