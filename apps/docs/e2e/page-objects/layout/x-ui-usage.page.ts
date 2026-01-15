import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the x:ui Usage documentation page
 */
export class XUIUsagePage extends BasePage {
  readonly markdownContainer: Locator
  readonly headings: Locator
  readonly paragraphs: Locator
  readonly codeBlocks: Locator
  readonly lists: Locator
  readonly content: Locator

  constructor(page: Page) {
    super(page, '/x-ui-usage')
    this.markdownContainer = page.locator('.bc-markdown, main')
    this.headings = page.locator('main h1, main h2, main h3, main h4, main h5, main h6')
    this.paragraphs = page.locator('main p')
    this.codeBlocks = page.locator('main pre code')
    this.lists = page.locator('main ul, main ol')
    this.content = page.locator('main')
  }

  async getHeadingCount(): Promise<number> {
    return this.headings.count()
  }

  async getCodeBlockCount(): Promise<number> {
    return this.codeBlocks.count()
  }

  async getListCount(): Promise<number> {
    return this.lists.count()
  }

  async getFirstHeadingText(): Promise<string> {
    const count = await this.headings.count()
    if (count === 0) return ''
    return (await this.headings.first().textContent()) ?? ''
  }

  async hasContent(): Promise<boolean> {
    const text = await this.content.textContent()
    return text != null && text.length > 0
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('x-ui-usage'),
    })
  }
}
