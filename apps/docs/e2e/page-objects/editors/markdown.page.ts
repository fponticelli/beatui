import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Markdown component documentation page
 */
export class MarkdownPage extends BasePage {
  readonly markdownContainer: Locator
  readonly headings: Locator
  readonly paragraphs: Locator
  readonly codeBlocks: Locator
  readonly blockquotes: Locator
  readonly lists: Locator
  readonly images: Locator
  readonly tables: Locator
  readonly horizontalRules: Locator

  constructor(page: Page) {
    super(page, '/markdown')
    this.markdownContainer = page.locator('.bc-markdown, main')
    this.headings = page.locator('main h1, main h2, main h3, main h4, main h5, main h6')
    this.paragraphs = page.locator('main p')
    this.codeBlocks = page.locator('main pre code')
    this.blockquotes = page.locator('main blockquote')
    this.lists = page.locator('main ul, main ol')
    this.images = page.locator('main img')
    this.tables = page.locator('main table')
    this.horizontalRules = page.locator('main hr')
  }

  async getHeadingCount(): Promise<number> {
    return this.headings.count()
  }

  async getCodeBlockCount(): Promise<number> {
    return this.codeBlocks.count()
  }

  async hasBlockquote(): Promise<boolean> {
    return (await this.blockquotes.count()) > 0
  }

  async hasTable(): Promise<boolean> {
    return (await this.tables.count()) > 0
  }

  async hasImage(): Promise<boolean> {
    return (await this.images.count()) > 0
  }

  async getFirstHeadingText(): Promise<string> {
    const count = await this.headings.count()
    if (count === 0) return ''
    return (await this.headings.first().textContent()) ?? ''
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('markdown'),
    })
  }
}
