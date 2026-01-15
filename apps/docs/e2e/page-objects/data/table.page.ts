import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Table component documentation page
 */
export class TablePage extends BasePage {
  readonly table: Locator
  readonly tableHead: Locator
  readonly tableBody: Locator
  readonly tableFoot: Locator
  readonly tableRows: Locator
  readonly tableHeaderCells: Locator
  readonly tableDataCells: Locator
  readonly sizeSelector: Locator
  readonly hoverableSwitch: Locator
  readonly fullWidthSwitch: Locator
  readonly stickyHeaderSwitch: Locator
  readonly stripedRowsSwitch: Locator
  readonly tableBorderSwitch: Locator
  readonly columnBordersSwitch: Locator
  readonly rowBordersSwitch: Locator
  readonly borderRadiusSelector: Locator
  readonly controlsCard: Locator

  constructor(page: Page) {
    super(page, '/table')
    this.table = page.locator('.bc-table, table')
    this.tableHead = page.locator('.bc-table thead, table thead')
    this.tableBody = page.locator('.bc-table tbody, table tbody')
    this.tableFoot = page.locator('.bc-table tfoot, table tfoot')
    this.tableRows = page.locator('.bc-table tr, table tr')
    this.tableHeaderCells = page.locator('.bc-table th, table th')
    this.tableDataCells = page.locator('.bc-table td, table td')
    this.sizeSelector = page.locator('.bc-segmented-input').first()
    this.hoverableSwitch = page.locator('.bc-switch').first()
    this.fullWidthSwitch = page.locator('.bc-switch').nth(1)
    this.stickyHeaderSwitch = page.locator('.bc-switch').nth(2)
    this.stripedRowsSwitch = page.locator('.bc-switch').nth(3)
    this.tableBorderSwitch = page.locator('.bc-switch').nth(4)
    this.columnBordersSwitch = page.locator('.bc-switch').nth(5)
    this.rowBordersSwitch = page.locator('.bc-switch').nth(6)
    this.borderRadiusSelector = page.locator('.bc-segmented-input').nth(1)
    this.controlsCard = page.locator('.bc-card')
  }

  async getRowCount(): Promise<number> {
    return this.tableRows.count()
  }

  async getHeaderCellCount(): Promise<number> {
    return this.tableHeaderCells.count()
  }

  async getDataCellCount(): Promise<number> {
    return this.tableDataCells.count()
  }

  async getHeaderCellText(index: number): Promise<string> {
    return (await this.tableHeaderCells.nth(index).textContent()) ?? ''
  }

  async getCellText(rowIndex: number, cellIndex: number): Promise<string> {
    const row = this.tableBody.locator('tr').nth(rowIndex)
    const cell = row.locator('td').nth(cellIndex)
    return (await cell.textContent()) ?? ''
  }

  async toggleHoverable(): Promise<void> {
    await this.hoverableSwitch.click()
  }

  async toggleFullWidth(): Promise<void> {
    await this.fullWidthSwitch.click()
  }

  async toggleStickyHeader(): Promise<void> {
    await this.stickyHeaderSwitch.click()
  }

  async toggleStripedRows(): Promise<void> {
    await this.stripedRowsSwitch.click()
  }

  async toggleTableBorder(): Promise<void> {
    await this.tableBorderSwitch.click()
  }

  async toggleColumnBorders(): Promise<void> {
    await this.columnBordersSwitch.click()
  }

  async toggleRowBorders(): Promise<void> {
    await this.rowBordersSwitch.click()
  }

  async hoverRow(index: number): Promise<void> {
    await this.tableBody.locator('tr').nth(index).hover()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('table'),
    })
  }
}
