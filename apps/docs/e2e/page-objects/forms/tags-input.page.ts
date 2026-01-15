import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Tags Input component documentation page
 */
export class TagsInputPage extends BasePage {
  readonly tagsInputs: Locator
  readonly tags: Locator
  readonly tagRemoveButtons: Locator
  readonly textInputs: Locator
  readonly selectTagsInputs: Locator
  readonly comboboxTagsInputs: Locator
  readonly inputWrappers: Locator
  readonly cards: Locator

  constructor(page: Page) {
    super(page, '/tags-input')
    this.tagsInputs = page.locator('.bc-tags-input')
    this.tags = page.locator('.bc-tag')
    this.tagRemoveButtons = page.locator('.bc-tag-remove, .bc-tag [aria-label*="Remove"]')
    this.textInputs = page.locator('input[type="text"], input:not([type])')
    this.selectTagsInputs = page.locator('.bc-select-tags-input')
    this.comboboxTagsInputs = page.locator('.bc-combobox-tags-input')
    this.inputWrappers = page.locator('.bc-input-wrapper')
    this.cards = page.locator('.bc-card')
  }

  async getTagsInputCount(): Promise<number> {
    return this.tagsInputs.count()
  }

  async getTagCount(): Promise<number> {
    return this.tags.count()
  }

  async addTag(inputIndex: number, tagValue: string): Promise<void> {
    const input = this.textInputs.nth(inputIndex)
    if ((await input.count()) > 0) {
      await input.fill(tagValue)
      await input.blur()
    }
  }

  async removeTag(tagIndex: number): Promise<void> {
    const removeButton = this.tagRemoveButtons.nth(tagIndex)
    if ((await removeButton.count()) > 0) {
      await removeButton.click()
    }
  }

  async getTagText(tagIndex: number): Promise<string> {
    const tag = this.tags.nth(tagIndex)
    if ((await tag.count()) > 0) {
      return tag.textContent() ?? ''
    }
    return ''
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('tags-input'),
    })
  }
}
