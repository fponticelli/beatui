import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, prop, Value } from '@tempots/dom'
import { DataTable } from '../../src/components/data/data-table'
import { DataColumnDef } from '../../src/components/data/data-table-types'
import { WithProviders } from '../helpers/test-providers'

type User = { id: string; name: string; email: string; role: string }

const users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@test.com', role: 'Admin' },
  { id: '2', name: 'Bob', email: 'bob@test.com', role: 'Editor' },
  { id: '3', name: 'Carol', email: 'carol@test.com', role: 'Viewer' },
]

const columns: DataColumnDef<User, string>[] = [
  { id: 'name', header: 'Name', cell: row => Value.map(row, r => r.name) },
  { id: 'email', header: 'Email', cell: row => Value.map(row, r => r.email) },
]

function flush(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

describe('DataTable Row Details', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  // -------------------------------------------------------------------------
  // T010 – Always-Visible Mode
  // -------------------------------------------------------------------------
  describe('T010: Always-Visible Mode', () => {
    it('renders a detail <tr> with class bc-data-table__detail-row below each data row', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'always-visible',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const detailRows = container.querySelectorAll('.bc-data-table__detail-row')
      // One detail row per data row
      expect(detailRows.length).toBe(users.length)
    })

    it('detail <td> has colspan matching the number of visible columns', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'always-visible',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const detailCells = container.querySelectorAll('.bc-data-table__detail-cell')
      expect(detailCells.length).toBe(users.length)

      // 2 visible data columns → colspan should be 2
      for (const cell of detailCells) {
        const td = cell as HTMLTableCellElement
        expect(td.colSpan).toBe(columns.length)
      }
    })

    it('does not render a toggle column header when always-visible', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'always-visible',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const toggleHeader = container.querySelector('.bc-data-table__toggle-header')
      expect(toggleHeader).toBeNull()
    })

    it('does not render a detail row when hasDetails returns false', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'always-visible',
              render: row => Value.map(row, r => `Details for ${r.name}`),
              // Only the first user (Alice, id='1') has details
              hasDetails: row => row.value.id === '1',
            },
          })
        ),
        container
      )

      await flush()

      const detailRows = container.querySelectorAll('.bc-data-table__detail-row')
      // Only one detail row (for Alice)
      expect(detailRows.length).toBe(1)
    })

    it('renders detail content immediately (no lazy loading)', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'always-visible',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      // Content is present without any interaction
      const detailCells = container.querySelectorAll('.bc-data-table__detail-cell')
      expect(detailCells.length).toBeGreaterThan(0)
      expect(detailCells[0].textContent).toContain('Details for Alice')
    })
  })

  // -------------------------------------------------------------------------
  // T015 – Collapsible Mode – Start Collapsed
  // -------------------------------------------------------------------------
  describe('T015: Collapsible Mode – Start Collapsed', () => {
    it('renders a toggle column header with bc-data-table__toggle-header class', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'collapsed',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const toggleHeader = container.querySelector('.bc-data-table__toggle-header')
      expect(toggleHeader).not.toBeNull()
      expect(toggleHeader!.tagName.toLowerCase()).toBe('th')
    })

    it('each data row has a bc-data-table__toggle-cell with a button', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'collapsed',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const toggleCells = container.querySelectorAll('.bc-data-table__toggle-cell')
      expect(toggleCells.length).toBe(users.length)

      for (const cell of toggleCells) {
        const btn = cell.querySelector('button')
        expect(btn).not.toBeNull()
      }
    })

    it('chevron button has bc-data-table__group-toggle--collapsed class when collapsed', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'collapsed',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const toggleButtons = container.querySelectorAll(
        '.bc-data-table__toggle-cell button'
      )
      expect(toggleButtons.length).toBe(users.length)

      for (const btn of toggleButtons) {
        expect(btn.className).toContain('bc-data-table__group-toggle--collapsed')
      }
    })

    it('clicking toggle button removes --collapsed class (expands row)', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'collapsed',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const firstToggleBtn = container.querySelector(
        '.bc-data-table__toggle-cell button'
      ) as HTMLButtonElement
      expect(firstToggleBtn).not.toBeNull()
      expect(firstToggleBtn.className).toContain('bc-data-table__group-toggle--collapsed')

      firstToggleBtn.click()
      await flush()

      expect(firstToggleBtn.className).not.toContain(
        'bc-data-table__group-toggle--collapsed'
      )
      expect(firstToggleBtn.className).toContain('bc-data-table__group-toggle')
    })

    it('clicking toggle button again re-collapses the row', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'collapsed',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const firstToggleBtn = container.querySelector(
        '.bc-data-table__toggle-cell button'
      ) as HTMLButtonElement

      // expand
      firstToggleBtn.click()
      await flush()
      expect(firstToggleBtn.className).not.toContain('bc-data-table__group-toggle--collapsed')

      // collapse again
      firstToggleBtn.click()
      await flush()
      expect(firstToggleBtn.className).toContain('bc-data-table__group-toggle--collapsed')
    })

    it('when hasDetails returns false: toggle cell is empty (no button)', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'collapsed',
              render: row => Value.map(row, r => `Details for ${r.name}`),
              // Only Alice has details
              hasDetails: row => row.value.id === '1',
            },
          })
        ),
        container
      )

      await flush()

      const toggleCells = container.querySelectorAll('.bc-data-table__toggle-cell')
      // Should still render all toggle cells (3 rows)
      expect(toggleCells.length).toBe(users.length)

      // Only first row (Alice) has a button
      const buttonsInToggleCells = container.querySelectorAll(
        '.bc-data-table__toggle-cell button'
      )
      expect(buttonsInToggleCells.length).toBe(1)
    })

    it('when hasDetails returns false: no detail row is rendered for that row', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'collapsed',
              render: row => Value.map(row, r => `Details for ${r.name}`),
              // Only Alice (id='1') has details
              hasDetails: row => row.value.id === '1',
            },
          })
        ),
        container
      )

      await flush()

      const detailRows = container.querySelectorAll('.bc-data-table__detail-row')
      // Only Alice's row has a detail row
      expect(detailRows.length).toBe(1)
    })

    it('calls onExpandedChange callback when toggling a row', async () => {
      const onExpandedChange = vi.fn()

      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'collapsed',
              render: row => Value.map(row, r => `Details for ${r.name}`),
              onExpandedChange,
            },
          })
        ),
        container
      )

      await flush()

      const firstToggleBtn = container.querySelector(
        '.bc-data-table__toggle-cell button'
      ) as HTMLButtonElement

      firstToggleBtn.click()
      await flush()

      expect(onExpandedChange).toHaveBeenCalledTimes(1)
      // The callback receives the Set of toggled IDs
      const [toggledIds] = onExpandedChange.mock.calls[0] as [Set<string>]
      expect(toggledIds).toBeInstanceOf(Set)
      // Row '1' (Alice) was toggled (collapsed → in toggledIds means expanded)
      expect(toggledIds.has('1')).toBe(true)
    })

    it('detail rows exist in the DOM (for Collapse wrapper)', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'collapsed',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      // Detail rows should be in the DOM even before any toggle
      const detailRows = container.querySelectorAll('.bc-data-table__detail-row')
      expect(detailRows.length).toBe(users.length)
    })
  })

  // -------------------------------------------------------------------------
  // T018 – Collapsible Mode – Start Expanded
  // -------------------------------------------------------------------------
  describe('T018: Collapsible Mode – Start Expanded', () => {
    it('detail rows start in open state (chevron does NOT have --collapsed class)', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'expanded',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const toggleButtons = container.querySelectorAll(
        '.bc-data-table__toggle-cell button'
      )
      expect(toggleButtons.length).toBe(users.length)

      for (const btn of toggleButtons) {
        expect(btn.className).not.toContain('bc-data-table__group-toggle--collapsed')
        expect(btn.className).toContain('bc-data-table__group-toggle')
      }
    })

    it('renders toggle column header even when starting expanded', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'expanded',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const toggleHeader = container.querySelector('.bc-data-table__toggle-header')
      expect(toggleHeader).not.toBeNull()
    })

    it('clicking chevron collapses the row (adds --collapsed class)', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'expanded',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const firstToggleBtn = container.querySelector(
        '.bc-data-table__toggle-cell button'
      ) as HTMLButtonElement
      expect(firstToggleBtn).not.toBeNull()

      // Initially expanded – no --collapsed class
      expect(firstToggleBtn.className).not.toContain('bc-data-table__group-toggle--collapsed')

      // Click to collapse
      firstToggleBtn.click()
      await flush()

      expect(firstToggleBtn.className).toContain('bc-data-table__group-toggle--collapsed')
    })

    it('content is pre-rendered for initially expanded rows', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'expanded',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      // Content should be in the DOM immediately (no interaction needed)
      const detailCells = container.querySelectorAll('.bc-data-table__detail-cell')
      expect(detailCells.length).toBe(users.length)
      expect(detailCells[0].textContent).toContain('Details for Alice')
    })
  })

  // -------------------------------------------------------------------------
  // T023 – Integration Tests
  // -------------------------------------------------------------------------
  describe('T023: Integration Tests', () => {
    it('with selection enabled: toggle column appears, detail row colspan includes toggle and selection columns', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            selectable: true,
            rowDetails: {
              defaultState: 'collapsed',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      // Toggle header should be present
      const toggleHeader = container.querySelector('.bc-data-table__toggle-header')
      expect(toggleHeader).not.toBeNull()

      // colspan = 2 data columns + 1 toggle + 1 selection = 4
      const detailCells = container.querySelectorAll('.bc-data-table__detail-cell')
      expect(detailCells.length).toBe(users.length)

      for (const cell of detailCells) {
        const td = cell as HTMLTableCellElement
        expect(td.colSpan).toBe(columns.length + 2) // +1 toggle, +1 selection
      }
    })

    it('colspan updates when column count changes via hiddenColumns', async () => {
      const hiddenColumns = prop<string[]>([])

      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            hiddenColumns,
            rowDetails: {
              defaultState: 'always-visible',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      // Initially 2 columns visible → colspan 2
      let detailCells = container.querySelectorAll('.bc-data-table__detail-cell')
      for (const cell of detailCells) {
        expect((cell as HTMLTableCellElement).colSpan).toBe(2)
      }

      // Hide one column
      hiddenColumns.set(['email'])
      await flush()

      detailCells = container.querySelectorAll('.bc-data-table__detail-cell')
      for (const cell of detailCells) {
        // Now only 1 column visible → colspan 1
        expect((cell as HTMLTableCellElement).colSpan).toBe(1)
      }
    })

    it('only other rows remain unaffected when a single row is expanded', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'collapsed',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const toggleButtons = container.querySelectorAll(
        '.bc-data-table__toggle-cell button'
      ) as NodeListOf<HTMLButtonElement>

      // Expand the first row (Alice)
      toggleButtons[0].click()
      await flush()

      // First row toggle should be expanded
      expect(toggleButtons[0].className).not.toContain('bc-data-table__group-toggle--collapsed')

      // Other rows remain collapsed
      expect(toggleButtons[1].className).toContain('bc-data-table__group-toggle--collapsed')
      expect(toggleButtons[2].className).toContain('bc-data-table__group-toggle--collapsed')
    })

    it('detail rows are in correct DOM position (immediately after their data row)', async () => {
      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'always-visible',
              render: row => Value.map(row, r => `Details for ${r.name}`),
            },
          })
        ),
        container
      )

      await flush()

      const tbody = container.querySelector('tbody')!
      const rows = Array.from(tbody.querySelectorAll('tr'))

      // There should be 6 rows total: 3 data rows + 3 detail rows, interleaved
      expect(rows.length).toBe(users.length * 2)

      // Every odd-indexed row should be a detail row
      for (let i = 0; i < rows.length; i++) {
        if (i % 2 === 0) {
          // Data row – should have bc-data-table__row class
          expect(rows[i].className).toContain('bc-data-table__row')
        } else {
          // Detail row
          expect(rows[i].className).toContain('bc-data-table__detail-row')
        }
      }
    })

    it('onExpandedChange is called with correct set after multiple toggles', async () => {
      const onExpandedChange = vi.fn()

      render(
        WithProviders(() =>
          DataTable<User>({
            data: users,
            columns,
            rowId: u => u.id,
            rowDetails: {
              defaultState: 'collapsed',
              render: row => Value.map(row, r => `Details for ${r.name}`),
              onExpandedChange,
            },
          })
        ),
        container
      )

      await flush()

      const toggleButtons = container.querySelectorAll(
        '.bc-data-table__toggle-cell button'
      ) as NodeListOf<HTMLButtonElement>

      // Expand Alice (id='1')
      toggleButtons[0].click()
      await flush()

      expect(onExpandedChange).toHaveBeenCalledTimes(1)
      let [ids] = onExpandedChange.mock.calls[0] as [Set<string>]
      expect(ids.has('1')).toBe(true)
      expect(ids.size).toBe(1)

      // Expand Bob (id='2')
      toggleButtons[1].click()
      await flush()

      expect(onExpandedChange).toHaveBeenCalledTimes(2)
      ;[ids] = onExpandedChange.mock.calls[1] as [Set<string>]
      expect(ids.has('1')).toBe(true)
      expect(ids.has('2')).toBe(true)
      expect(ids.size).toBe(2)

      // Collapse Alice (id='1')
      toggleButtons[0].click()
      await flush()

      expect(onExpandedChange).toHaveBeenCalledTimes(3)
      ;[ids] = onExpandedChange.mock.calls[2] as [Set<string>]
      expect(ids.has('1')).toBe(false)
      expect(ids.has('2')).toBe(true)
      expect(ids.size).toBe(1)
    })
  })
})
