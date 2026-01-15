import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the PDF Page Viewer component documentation page
 */
export class PdfPageViewerPage extends BasePage {
  readonly pdfViewer: Locator
  readonly pdfCanvas: Locator
  readonly urlInput: Locator
  readonly pageInput: Locator
  readonly fitModeSelect: Locator
  readonly scaleInput: Locator
  readonly rotationSelect: Locator
  readonly qualityInput: Locator
  readonly textLayerSwitch: Locator
  readonly annotationLayerSwitch: Locator
  readonly previousButton: Locator
  readonly nextButton: Locator
  readonly pageIndicator: Locator

  constructor(page: Page) {
    super(page, '/pdf-page-viewer')
    this.pdfViewer = page.locator('.bc-pdf-page-viewer, [data-pdf-viewer]')
    this.pdfCanvas = page.locator('canvas')
    this.urlInput = page.locator('input[placeholder*="PDF URL"], input[type="text"]').first()
    this.pageInput = page.locator('input[type="number"]').first()
    this.fitModeSelect = page.locator('select').first()
    this.scaleInput = page.locator('input[type="number"]').nth(1)
    this.rotationSelect = page.locator('select').nth(1)
    this.qualityInput = page.locator('input[type="number"]').nth(2)
    this.textLayerSwitch = page.locator('.bc-switch').first()
    this.annotationLayerSwitch = page.locator('.bc-switch').nth(1)
    this.previousButton = page.locator('button:has-text("Previous")')
    this.nextButton = page.locator('button:has-text("Next")')
    this.pageIndicator = page.locator('text=/\\d+\\s*\\/\\s*\\d+/')
  }

  async isPdfVisible(): Promise<boolean> {
    const canvasCount = await this.pdfCanvas.count()
    if (canvasCount === 0) return false
    return this.pdfCanvas.first().isVisible()
  }

  async waitForPdfLoad(timeout = 15000): Promise<void> {
    await this.pdfCanvas.first().waitFor({ state: 'visible', timeout })
  }

  async goToNextPage(): Promise<void> {
    await this.nextButton.click()
  }

  async goToPreviousPage(): Promise<void> {
    await this.previousButton.click()
  }

  async setPage(pageNumber: number): Promise<void> {
    await this.pageInput.fill(String(pageNumber))
  }

  async selectFitMode(value: string): Promise<void> {
    await this.fitModeSelect.selectOption(value)
  }

  async selectRotation(value: string): Promise<void> {
    await this.rotationSelect.selectOption(value)
  }

  async isNextButtonEnabled(): Promise<boolean> {
    return this.nextButton.isEnabled()
  }

  async isPreviousButtonEnabled(): Promise<boolean> {
    return this.previousButton.isEnabled()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('pdf-page-viewer'),
    })
  }
}
