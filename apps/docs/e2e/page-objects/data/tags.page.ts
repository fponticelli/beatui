import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Tags component documentation page
 */
export class TagsPage extends BasePage {
  readonly tags: Locator
  readonly closableTags: Locator
  readonly tagCloseButtons: Locator
  readonly basicTagsSection: Locator
  readonly sizesSection: Locator
  readonly closableSection: Locator

  constructor(page: Page) {
    super(page, '/tags')
    this.tags = page.locator('.bc-tag')
    this.closableTags = page.locator('.bc-tag:has(.bc-tag__close)')
    this.tagCloseButtons = page.locator('.bc-tag__close, .bc-tag button')
    this.basicTagsSection = page.locator('.bc-card').first()
    this.sizesSection = page.locator('.bc-card').nth(1)
    this.closableSection = page.locator('.bc-card').nth(2)
  }

  async getTagCount(): Promise<number> {
    return this.tags.count()
  }

  async getClosableTagCount(): Promise<number> {
    return this.closableTags.count()
  }

  async getTagText(index: number): Promise<string> {
    return (await this.tags.nth(index).textContent()) ?? ''
  }

  getTagByText(text: string): Locator {
    return this.page.locator(`.bc-tag:has-text("${text}")`)
  }

  async closeTagByIndex(index: number): Promise<void> {
    const closeButton = this.closableTags.nth(index).locator('.bc-tag__close, button')
    if ((await closeButton.count()) > 0) {
      await closeButton.click()
    }
  }

  async closeTagByText(text: string): Promise<void> {
    const tag = this.page.locator(`.bc-tag:has-text("${text}")`)
    const closeButton = tag.locator('.bc-tag__close, button')
    if ((await closeButton.count()) > 0) {
      await closeButton.click()
    }
  }

  async isTagVisible(text: string): Promise<boolean> {
    const tag = this.page.locator(`.bc-tag:has-text("${text}")`)
    const count = await tag.count()
    if (count === 0) return false
    return tag.first().isVisible()
  }

  async getTagsInSection(sectionIndex: number): Promise<number> {
    const section = this.page.locator('.bc-card').nth(sectionIndex)
    return section.locator('.bc-tag').count()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('tags'),
    })
  }
}
