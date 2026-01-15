import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the PageDropZone component documentation page
 */
export class PageDropZonePage extends BasePage {
  readonly enableSwitch: Locator
  readonly dropOverlay: Locator
  readonly droppedFilesList: Locator
  readonly droppedFileItems: Locator
  readonly clearFilesButton: Locator
  readonly instructionsCard: Locator

  constructor(page: Page) {
    super(page, '/page-drop-zone')
    this.enableSwitch = page.locator('.bc-switch')
    this.dropOverlay = page.locator('.fixed.inset-0, [data-drop-overlay]')
    this.droppedFilesList = page.locator('ul.space-y-2')
    this.droppedFileItems = page.locator('ul.space-y-2 li')
    this.clearFilesButton = page.locator('button:has-text("Clear Files")')
    this.instructionsCard = page.locator('.bc-card').first()
  }

  async isDropZoneEnabled(): Promise<boolean> {
    return this.enableSwitch.isChecked()
  }

  async toggleDropZone(): Promise<void> {
    await this.enableSwitch.click()
  }

  async enableDropZone(): Promise<void> {
    const isEnabled = await this.isDropZoneEnabled()
    if (!isEnabled) {
      await this.toggleDropZone()
    }
  }

  async disableDropZone(): Promise<void> {
    const isEnabled = await this.isDropZoneEnabled()
    if (isEnabled) {
      await this.toggleDropZone()
    }
  }

  async isDropOverlayVisible(): Promise<boolean> {
    const count = await this.dropOverlay.count()
    if (count === 0) return false
    return this.dropOverlay.first().isVisible()
  }

  async getDroppedFileCount(): Promise<number> {
    return this.droppedFileItems.count()
  }

  async clearDroppedFiles(): Promise<void> {
    const buttonVisible = await this.clearFilesButton.isVisible()
    if (buttonVisible) {
      await this.clearFilesButton.click()
    }
  }

  async simulateDragEnter(): Promise<void> {
    await this.page.dispatchEvent('body', 'dragenter', {
      dataTransfer: { types: ['Files'] },
    })
  }

  async simulateDragLeave(): Promise<void> {
    await this.page.dispatchEvent('body', 'dragleave')
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('page-drop-zone'),
    })
  }
}
