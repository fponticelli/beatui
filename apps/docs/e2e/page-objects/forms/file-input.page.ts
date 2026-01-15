import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the File Input component documentation page
 */
export class FileInputPage extends BasePage {
  readonly fileInputs: Locator
  readonly dropZones: Locator
  readonly fileList: Locator
  readonly removeButtons: Locator
  readonly switches: Locator
  readonly cards: Locator
  readonly form: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    super(page, '/file-input')
    this.fileInputs = page.locator('input[type="file"]')
    this.dropZones = page.locator('.bc-file-input, .bc-files-input')
    this.fileList = page.locator('.bc-file-input-list, .bc-files-input-list')
    this.removeButtons = page.locator('.bc-file-input-remove, [aria-label*="Remove"]')
    this.switches = page.locator('.bc-switch')
    this.cards = page.locator('.bc-card')
    this.form = page.locator('form')
    this.submitButton = page.locator('button[type="button"]', { hasText: 'Submit' })
  }

  async getFileInputCount(): Promise<number> {
    return this.fileInputs.count()
  }

  async getDropZoneCount(): Promise<number> {
    return this.dropZones.count()
  }

  async uploadFile(index: number, filePath: string): Promise<void> {
    const input = this.fileInputs.nth(index)
    if ((await input.count()) > 0) {
      await input.setInputFiles(filePath)
    }
  }

  async uploadFiles(index: number, filePaths: string[]): Promise<void> {
    const input = this.fileInputs.nth(index)
    if ((await input.count()) > 0) {
      await input.setInputFiles(filePaths)
    }
  }

  async clearFiles(index: number): Promise<void> {
    const input = this.fileInputs.nth(index)
    if ((await input.count()) > 0) {
      await input.setInputFiles([])
    }
  }

  async toggleSwitch(index: number): Promise<void> {
    const switchEl = this.switches.nth(index)
    if ((await switchEl.count()) > 0) {
      await switchEl.click()
    }
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('file-input'),
    })
  }
}
