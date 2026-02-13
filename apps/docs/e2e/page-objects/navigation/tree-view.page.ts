import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the TreeView component documentation page
 */
export class TreeViewPage extends BasePage {
  readonly treeViews: Locator
  readonly treeItems: Locator
  readonly treeItemRows: Locator
  readonly toggleButtons: Locator
  readonly selectedRows: Locator

  constructor(page: Page) {
    super(page, '/tree-view')
    this.treeViews = page.locator('.bc-tree-view')
    this.treeItems = page.locator('.bc-tree-item')
    this.treeItemRows = page.locator('.bc-tree-item__row')
    this.toggleButtons = page.locator('.bc-tree-item__toggle')
    this.selectedRows = page.locator('.bc-tree-item__row--selected')
  }

  getTreeView(index: number): Locator {
    return this.treeViews.nth(index)
  }

  getTreeItemRow(treeIndex: number, label: string): Locator {
    return this.getTreeView(treeIndex).locator('.bc-tree-item__row', {
      hasText: label,
    })
  }

  getToggle(treeIndex: number, label: string): Locator {
    // The toggle is the chevron span inside the tree item that contains the given label
    return this.getTreeView(treeIndex)
      .locator('.bc-tree-item', { hasText: label })
      .first()
      .locator('> .bc-tree-item__row .bc-tree-item__toggle')
  }

  getChildren(treeIndex: number, label: string): Locator {
    return this.getTreeView(treeIndex)
      .locator('.bc-tree-item', { hasText: label })
      .first()
      .locator('> .bc-tree-item__children')
  }

  async getTreeViewCount(): Promise<number> {
    return this.treeViews.count()
  }

  async getSelectedRowCount(): Promise<number> {
    return this.selectedRows.count()
  }

  async clickRow(treeIndex: number, label: string): Promise<void> {
    await this.getTreeItemRow(treeIndex, label).click()
  }

  async clickToggle(treeIndex: number, label: string): Promise<void> {
    await this.getToggle(treeIndex, label).click()
  }

  async isExpanded(treeIndex: number, label: string): Promise<boolean> {
    const row = this.getTreeItemRow(treeIndex, label)
    const expanded = await row.getAttribute('aria-expanded')
    return expanded === 'true'
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('tree-view'),
    })
  }
}
