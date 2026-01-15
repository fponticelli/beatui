import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the PDF Preview component documentation page
 */
export class PdfPreviewPage extends BasePage {
  readonly pdfPreview: Locator
  readonly pdfIframe: Locator
  readonly engineSelector: Locator
  readonly pageInput: Locator
  readonly zoomSelect: Locator
  readonly toolbarSwitch: Locator
  readonly viewSelect: Locator
  readonly scrollbarSwitch: Locator
  readonly pageModeSelect: Locator
  readonly searchInput: Locator
  readonly fullscreenSwitch: Locator

  constructor(page: Page) {
    super(page, '/pdf-preview')
    this.pdfPreview = page.locator('.bc-pdf-preview, iframe, [data-pdf-preview]')
    this.pdfIframe = page.locator('iframe')
    this.engineSelector = page.locator('.bc-segmented-input, [role="radiogroup"]')
    this.pageInput = page.locator('input[type="number"]').first()
    this.zoomSelect = page.locator('select').first()
    this.toolbarSwitch = page.locator('.bc-switch').first()
    this.viewSelect = page.locator('select').nth(1)
    this.scrollbarSwitch = page.locator('.bc-switch').nth(1)
    this.pageModeSelect = page.locator('select').nth(2)
    this.searchInput = page.locator('input[type="text"]')
    this.fullscreenSwitch = page.locator('.bc-switch').last()
  }

  async isPdfPreviewVisible(): Promise<boolean> {
    const iframeCount = await this.pdfIframe.count()
    if (iframeCount === 0) return false
    return this.pdfIframe.first().isVisible()
  }

  async waitForPdfLoad(timeout = 15000): Promise<void> {
    await this.pdfIframe.first().waitFor({ state: 'visible', timeout })
  }

  async selectEngine(engine: 'pdfjs' | 'native'): Promise<void> {
    const button = this.page.locator(`button:has-text("${engine === 'pdfjs' ? 'PDF.js' : 'Native'}")`)
    await button.click()
  }

  async setPage(pageNumber: number): Promise<void> {
    await this.pageInput.fill(String(pageNumber))
  }

  async setSearchText(text: string): Promise<void> {
    await this.searchInput.fill(text)
  }

  async selectPageMode(mode: string): Promise<void> {
    await this.pageModeSelect.selectOption(mode)
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('pdf-preview'),
    })
  }
}
