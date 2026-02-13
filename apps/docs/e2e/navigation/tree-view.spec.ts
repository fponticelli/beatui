import { test, expect } from '@playwright/test'

test.describe('TreeView Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tree-view')
    await page.waitForLoadState('networkidle')
  })

  test('should render tree view sections', async ({ page }) => {
    const treeViews = page.locator('.bc-tree-view')
    expect(await treeViews.count()).toBeGreaterThanOrEqual(4)
  })

  test('should render tree item rows', async ({ page }) => {
    const rows = page.locator('.bc-tree-item__row')
    expect(await rows.count()).toBeGreaterThan(0)
  })

  test('should expand parent item on toggle click', async ({ page }) => {
    // First tree view - "Documents" is a parent item
    const firstTree = page.locator('.bc-tree-view').first()
    const documentsRow = firstTree
      .locator('.bc-tree-item', { hasText: 'Documents' })
      .first()
      .locator('> .bc-tree-item__row')

    // Should have aria-expanded="false" initially (collapsed)
    await expect(documentsRow).toHaveAttribute('aria-expanded', 'false')

    // Click the toggle chevron
    const toggle = firstTree
      .locator('.bc-tree-item', { hasText: 'Documents' })
      .first()
      .locator('> .bc-tree-item__row .bc-tree-item__toggle')
    await toggle.click()

    // Should now be expanded
    await expect(documentsRow).toHaveAttribute('aria-expanded', 'true')

    // Children should be visible
    const children = firstTree
      .locator('.bc-tree-item', { hasText: 'Documents' })
      .first()
      .locator('> .bc-tree-item__children')
    await expect(children).toBeVisible()
  })

  test('should collapse parent item on second toggle click', async ({
    page,
  }) => {
    const firstTree = page.locator('.bc-tree-view').first()
    const documentsRow = firstTree
      .locator('.bc-tree-item', { hasText: 'Documents' })
      .first()
      .locator('> .bc-tree-item__row')
    const toggle = firstTree
      .locator('.bc-tree-item', { hasText: 'Documents' })
      .first()
      .locator('> .bc-tree-item__row .bc-tree-item__toggle')

    // Expand
    await toggle.click()
    await expect(documentsRow).toHaveAttribute('aria-expanded', 'true')

    // Collapse
    await toggle.click()
    await expect(documentsRow).toHaveAttribute('aria-expanded', 'false')
  })

  test('should select a leaf item on click', async ({ page }) => {
    const firstTree = page.locator('.bc-tree-view').first()

    // Click on "Notes.txt" (a leaf item)
    const notesRow = firstTree
      .locator('.bc-tree-item__row', { hasText: 'Notes.txt' })
      .first()
    await notesRow.click()

    // Should have selected class
    await expect(notesRow).toHaveClass(/bc-tree-item__row--selected/)
  })

  test('should show selected item text', async ({ page }) => {
    const firstTree = page.locator('.bc-tree-view').first()

    // Click on "Notes.txt"
    const notesRow = firstTree
      .locator('.bc-tree-item__row', { hasText: 'Notes.txt' })
      .first()
    await notesRow.click()

    // Check that the "Selected:" text updates
    const selectedText = page
      .locator('text=Selected:')
      .first()
      .locator('..')
    await expect(selectedText).toContainText('file3')
  })

  test('should show controlled expansion state', async ({ page }) => {
    // Third tree view is the "Controlled Expansion" section
    // It starts with "src" expanded
    const controlledTree = page.locator('.bc-tree-view').nth(2)
    const srcRow = controlledTree
      .locator('.bc-tree-item', { hasText: /^src/ })
      .first()
      .locator('> .bc-tree-item__row')

    // "src" should be expanded by default
    await expect(srcRow).toHaveAttribute('aria-expanded', 'true')

    // "Expanded:" text should contain "src"
    const expandedText = page.locator('text=Expanded:').last().locator('..')
    await expect(expandedText).toContainText('src')
  })

  test('should render size variants with correct classes', async ({
    page,
  }) => {
    // Fourth tree view section has "Sizes" with sm and lg variants
    const allTrees = page.locator('.bc-tree-view')
    const smallTree = allTrees.filter({ hasText: 'Small' }).first()
    const largeTree = allTrees.filter({ hasText: 'Large' }).first()

    // Check for size-specific CSS classes
    // Small trees have rows with --size-sm
    if ((await smallTree.count()) > 0) {
      const smRow = page.locator('.bc-tree-item__row--size-sm')
      expect(await smRow.count()).toBeGreaterThan(0)
    }

    if ((await largeTree.count()) > 0) {
      const lgRow = page.locator('.bc-tree-item__row--size-lg')
      expect(await lgRow.count()).toBeGreaterThan(0)
    }
  })

  test('should not have aria-expanded on leaf items', async ({ page }) => {
    const firstTree = page.locator('.bc-tree-view').first()

    // "Notes.txt" is a leaf item — should NOT have aria-expanded
    const notesRow = firstTree
      .locator('.bc-tree-item__row', { hasText: 'Notes.txt' })
      .first()
    await expect(notesRow).not.toHaveAttribute('aria-expanded')
  })

  test('should have treeitem role on rows', async ({ page }) => {
    const rows = page.locator('.bc-tree-item__row')
    const first = rows.first()
    await expect(first).toHaveAttribute('role', 'treeitem')
  })
})
