import { describe, it, expect, vi } from 'vitest'
import { prop } from '@tempots/dom'
import { createDataSource } from '../src/components/data/data-source'
import { Filter, FilterBase } from '../src/components/data/filter'

interface User {
  id: string
  name: string
  age: number
  role: string
}

const sampleUsers: User[] = [
  { id: '1', name: 'Alice', age: 30, role: 'admin' },
  { id: '2', name: 'Bob', age: 25, role: 'user' },
  { id: '3', name: 'Charlie', age: 35, role: 'admin' },
  { id: '4', name: 'Diana', age: 28, role: 'user' },
  { id: '5', name: 'Eve', age: 22, role: 'moderator' },
]

function createTestSource(overrides = {}) {
  return createDataSource<User>({
    data: prop([...sampleUsers]),
    rowId: u => u.id,
    ...overrides,
  })
}

describe('createDataSource', () => {
  describe('initial state', () => {
    it('should expose all rows when no operations applied', () => {
      const ds = createTestSource()
      expect(ds.rows.value).toEqual(sampleUsers)
      expect(ds.totalRows.value).toBe(5)
      expect(ds.totalFilteredRows.value).toBe(5)
      ds.dispose()
    })

    it('should start with empty sort, filter, and selection', () => {
      const ds = createTestSource()
      expect(ds.sort.value).toEqual([])
      expect(ds.filters.value).toEqual([])
      expect(ds.selected.value.size).toBe(0)
      expect(ds.selectedCount.value).toBe(0)
      ds.dispose()
    })

    it('should apply initial sort', () => {
      const ds = createTestSource({
        initialSort: [{ column: 'name', direction: 'asc' }],
      })
      expect(ds.rows.value[0].name).toBe('Alice')
      expect(ds.rows.value[4].name).toBe('Eve')
      ds.dispose()
    })

    it('should apply initial filters', () => {
      const ds = createTestSource({
        initialFilters: [Filter.equals('role', 'admin')],
      })
      expect(ds.rows.value).toHaveLength(2)
      expect(ds.rows.value.every(u => u.role === 'admin')).toBe(true)
      ds.dispose()
    })
  })

  describe('sorting', () => {
    it('should sort ascending on first toggle', () => {
      const ds = createTestSource()
      ds.toggleSort('name')
      expect(ds.sort.value).toEqual([{ column: 'name', direction: 'asc' }])
      expect(ds.rows.value[0].name).toBe('Alice')
      expect(ds.rows.value[4].name).toBe('Eve')
      ds.dispose()
    })

    it('should sort descending on second toggle', () => {
      const ds = createTestSource()
      ds.toggleSort('name')
      ds.toggleSort('name')
      expect(ds.sort.value).toEqual([{ column: 'name', direction: 'desc' }])
      expect(ds.rows.value[0].name).toBe('Eve')
      expect(ds.rows.value[4].name).toBe('Alice')
      ds.dispose()
    })

    it('should clear sort on third toggle', () => {
      const ds = createTestSource()
      ds.toggleSort('name')
      ds.toggleSort('name')
      ds.toggleSort('name')
      expect(ds.sort.value).toEqual([])
      ds.dispose()
    })

    it('should replace sort column in single-sort mode', () => {
      const ds = createTestSource()
      ds.toggleSort('name')
      ds.toggleSort('age')
      expect(ds.sort.value).toEqual([{ column: 'age', direction: 'asc' }])
      ds.dispose()
    })

    it('should support multi-column sort', () => {
      const ds = createTestSource({ multiSort: true })
      ds.toggleSort('role')
      ds.toggleSort('name')
      expect(ds.sort.value).toHaveLength(2)
      // admin: Alice, Charlie; moderator: Eve; user: Bob, Diana
      const rows = ds.rows.value
      expect(rows[0].name).toBe('Alice')
      expect(rows[1].name).toBe('Charlie')
      ds.dispose()
    })

    it('should sort numbers correctly', () => {
      const ds = createTestSource()
      ds.toggleSort('age')
      expect(ds.rows.value.map(u => u.age)).toEqual([22, 25, 28, 30, 35])
      ds.dispose()
    })

    it('should use custom comparator', () => {
      const ds = createTestSource({
        comparators: {
          name: (a: unknown, b: unknown) =>
            (b as string).localeCompare(a as string), // reverse
        },
      })
      ds.toggleSort('name')
      // Custom comparator reverses, but direction is 'asc' so no negation
      expect(ds.rows.value[0].name).toBe('Eve')
      ds.dispose()
    })

    it('should reset sort', () => {
      const ds = createTestSource()
      ds.toggleSort('name')
      ds.resetSort()
      expect(ds.sort.value).toEqual([])
      ds.dispose()
    })

    it('should provide reactive sort direction per column', () => {
      const ds = createTestSource()
      const nameDir = ds.getSortDirection('name')
      expect(nameDir.value).toBeUndefined()
      ds.toggleSort('name')
      expect(nameDir.value).toBe('asc')
      ds.toggleSort('name')
      expect(nameDir.value).toBe('desc')
      ds.toggleSort('name')
      expect(nameDir.value).toBeUndefined()
      ds.dispose()
    })

    it('should call onSortChange callback', () => {
      const onSortChange = vi.fn()
      const ds = createTestSource({ onSortChange })
      ds.toggleSort('name')
      expect(onSortChange).toHaveBeenCalledWith([
        { column: 'name', direction: 'asc' },
      ])
      ds.dispose()
    })

    it('should set sort directly', () => {
      const ds = createTestSource()
      ds.setSort([{ column: 'age', direction: 'desc' }])
      expect(ds.sort.value).toEqual([{ column: 'age', direction: 'desc' }])
      expect(ds.rows.value[0].age).toBe(35)
      ds.dispose()
    })
  })

  describe('filtering', () => {
    it('should filter by contains (default)', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.contains('name', 'li'))
      expect(ds.rows.value).toHaveLength(2) // Alice, Charlie
      expect(ds.totalFilteredRows.value).toBe(2)
      ds.dispose()
    })

    it('should filter by equals', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.equals('role', 'admin'))
      expect(ds.rows.value).toHaveLength(2)
      expect(ds.rows.value.every(u => u.role === 'admin')).toBe(true)
      ds.dispose()
    })

    it('should filter by startsWith', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.startsWith('name', 'al'))
      expect(ds.rows.value).toHaveLength(1)
      expect(ds.rows.value[0].name).toBe('Alice')
      ds.dispose()
    })

    it('should filter by endsWith', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.endsWith('name', 'ie'))
      expect(ds.rows.value).toHaveLength(1)
      expect(ds.rows.value[0].name).toBe('Charlie')
      ds.dispose()
    })

    it('should filter case-insensitively', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.contains('name', 'ALICE'))
      expect(ds.rows.value).toHaveLength(1)
      ds.dispose()
    })

    it('should support multiple column filters', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.equals('role', 'admin'))
      ds.setFilter(Filter.contains('name', 'charlie'))
      expect(ds.rows.value).toHaveLength(1)
      expect(ds.rows.value[0].name).toBe('Charlie')
      ds.dispose()
    })

    it('should remove filter by column', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.contains('name', 'li'))
      expect(ds.rows.value).toHaveLength(2)
      ds.removeFilter('name')
      expect(ds.rows.value).toHaveLength(5)
      ds.dispose()
    })

    it('should reset all filters', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.contains('name', 'a'))
      ds.setFilter(Filter.equals('role', 'admin'))
      ds.resetFilters()
      expect(ds.filters.value).toEqual([])
      expect(ds.rows.value).toHaveLength(5)
      ds.dispose()
    })

    it('should provide reactive text filter value per column', () => {
      const ds = createTestSource()
      const nameFilter = ds.getTextFilterValue('name')
      expect(nameFilter.value).toBe('')
      ds.setFilter(Filter.contains('name', 'test'))
      expect(nameFilter.value).toBe('test')
      ds.removeFilter('name')
      expect(nameFilter.value).toBe('')
      ds.dispose()
    })

    it('should call onFilterChange callback', () => {
      const onFilterChange = vi.fn()
      const ds = createTestSource({ onFilterChange })
      ds.setFilter(Filter.contains('name', 'alice'))
      expect(onFilterChange).toHaveBeenCalled()
      ds.dispose()
    })

    it('should reset page when filter changes', () => {
      const ds = createTestSource({ pageSize: 2 })
      ds.setPage(2)
      ds.setFilter(Filter.contains('name', 'a'))
      expect(ds.currentPage.value).toBe(1)
      ds.dispose()
    })

    it('should add filter alongside existing ones on same column', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.contains('name', 'a'))
      ds.addFilter(Filter.contains('name', 'l'))
      expect(ds.filters.value).toHaveLength(2)
      // Both filters apply: must contain 'a' AND 'l' → Alice, Charlie
      expect(ds.rows.value).toHaveLength(2)
      ds.dispose()
    })

    it('should provide reactive column filters', () => {
      const ds = createTestSource()
      const nameFilters = ds.getColumnFilters('name')
      expect(nameFilters.value).toEqual([])
      ds.setFilter(Filter.contains('name', 'x'))
      expect(nameFilters.value).toHaveLength(1)
      expect(nameFilters.value[0].kind).toBe('text')
      ds.removeFilter('name')
      expect(nameFilters.value).toEqual([])
      ds.dispose()
    })

    it('should support custom filter kind via evaluateFilter callback', () => {
      const ds = createTestSource({
        evaluateFilter: (f: FilterBase, row: User) => {
          if (f.kind === 'age-range') {
            const meta = f as FilterBase & { min: number; max: number }
            return row.age >= meta.min && row.age <= meta.max
          }
          return true
        },
      })
      const customFilter: FilterBase & { min: number; max: number } = {
        kind: 'age-range',
        column: 'age',
        min: 25,
        max: 30,
      }
      ds.setFilter(customFilter)
      // Ages 25-30: Bob(25), Diana(28), Alice(30)
      expect(ds.rows.value).toHaveLength(3)
      ds.dispose()
    })

    it('should skip text filters with empty value', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.contains('name', ''))
      expect(ds.rows.value).toHaveLength(5)
      ds.dispose()
    })

    it('should filter with compare filter', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.gt('age', 28))
      // Alice(30), Charlie(35)
      expect(ds.rows.value).toHaveLength(2)
      expect(ds.rows.value.every(u => u.age > 28)).toBe(true)
      ds.dispose()
    })
  })

  describe('selection', () => {
    it('should toggle individual row selection', () => {
      const ds = createTestSource()
      ds.toggleSelect('1')
      expect(ds.selected.value.has('1')).toBe(true)
      expect(ds.selectedCount.value).toBe(1)
      ds.toggleSelect('1')
      expect(ds.selected.value.has('1')).toBe(false)
      expect(ds.selectedCount.value).toBe(0)
      ds.dispose()
    })

    it('should report selected reactively', () => {
      const ds = createTestSource()
      expect(ds.selected.value.has('1')).toBe(false)
      ds.toggleSelect('1')
      expect(ds.selected.value.has('1')).toBe(true)
      ds.dispose()
    })

    it('should select multiple rows', () => {
      const ds = createTestSource()
      ds.select(['1', '2', '3'])
      expect(ds.selectedCount.value).toBe(3)
      ds.dispose()
    })

    it('should deselect specific rows', () => {
      const ds = createTestSource()
      ds.select(['1', '2', '3'])
      ds.deselect(['2'])
      expect(ds.selected.value.has('2')).toBe(false)
      expect(ds.selectedCount.value).toBe(2)
      ds.dispose()
    })

    it('should select all filtered rows', () => {
      const ds = createTestSource()
      ds.selectAll()
      expect(ds.selectedCount.value).toBe(5)
      expect(ds.isAllSelected.value).toBe(true)
      expect(ds.isSomeSelected.value).toBe(false)
      ds.dispose()
    })

    it('should deselect all', () => {
      const ds = createTestSource()
      ds.selectAll()
      ds.deselectAll()
      expect(ds.selectedCount.value).toBe(0)
      expect(ds.isAllSelected.value).toBe(false)
      ds.dispose()
    })

    it('should report isSomeSelected when partial selection', () => {
      const ds = createTestSource()
      ds.toggleSelect('1')
      expect(ds.isSomeSelected.value).toBe(true)
      expect(ds.isAllSelected.value).toBe(false)
      ds.dispose()
    })

    it('should selectAll based on filtered rows', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.equals('role', 'admin'))
      ds.selectAll()
      expect(ds.selectedCount.value).toBe(2)
      ds.dispose()
    })

    it('should call onSelectionChange callback', () => {
      const onSelectionChange = vi.fn()
      const ds = createTestSource({ onSelectionChange })
      ds.toggleSelect('1')
      expect(onSelectionChange).toHaveBeenCalledWith(new Set(['1']))
      ds.dispose()
    })
  })

  describe('pagination', () => {
    it('should paginate rows', () => {
      const ds = createTestSource({ pageSize: 2 })
      expect(ds.rows.value).toHaveLength(2)
      expect(ds.totalPages.value).toBe(3)
      expect(ds.currentPage.value).toBe(1)
      ds.dispose()
    })

    it('should navigate to next page', () => {
      const ds = createTestSource({ pageSize: 2 })
      ds.setPage(2)
      expect(ds.currentPage.value).toBe(2)
      expect(ds.rows.value).toHaveLength(2)
      expect(ds.rows.value[0].id).toBe('3')
      ds.dispose()
    })

    it('should navigate to last page', () => {
      const ds = createTestSource({ pageSize: 2 })
      ds.setPage(3)
      expect(ds.rows.value).toHaveLength(1) // only Eve on last page
      ds.dispose()
    })

    it('should clamp page number', () => {
      const ds = createTestSource({ pageSize: 2 })
      ds.setPage(100)
      expect(ds.currentPage.value).toBe(3)
      ds.setPage(-1)
      expect(ds.currentPage.value).toBe(1)
      ds.dispose()
    })

    it('should change page size and reset to page 1', () => {
      const ds = createTestSource({ pageSize: 2 })
      ds.setPage(2)
      ds.setPageSize(3)
      expect(ds.currentPage.value).toBe(1)
      expect(ds.totalPages.value).toBe(2)
      expect(ds.rows.value).toHaveLength(3)
      ds.dispose()
    })

    it('should not paginate when no pageSize', () => {
      const ds = createTestSource()
      expect(ds.rows.value).toHaveLength(5)
      expect(ds.totalPages.value).toBe(1)
      ds.dispose()
    })

    it('should paginate filtered rows', () => {
      const ds = createTestSource({ pageSize: 2 })
      ds.setFilter(Filter.equals('role', 'admin'))
      expect(ds.totalFilteredRows.value).toBe(2)
      expect(ds.totalPages.value).toBe(1)
      expect(ds.rows.value).toHaveLength(2)
      ds.dispose()
    })

    it('should clamp current page when filter reduces total pages', () => {
      const ds = createTestSource({ pageSize: 2 })
      ds.setPage(3) // page 3 of 3
      ds.setFilter(Filter.equals('role', 'admin')) // 2 results, only 1 page
      expect(ds.currentPage.value).toBe(1)
      ds.dispose()
    })

    it('should react to external pageSize signal changes', async () => {
      const pageSizeSignal = prop(2)
      const ds = createTestSource({ pageSize: pageSizeSignal })
      expect(ds.pageSize.value).toBe(2)
      expect(ds.rows.value).toHaveLength(2)
      expect(ds.totalPages.value).toBe(3)

      pageSizeSignal.set(5)
      // Value.on subscriptions fire asynchronously on a microtask
      await Promise.resolve()
      expect(ds.pageSize.value).toBe(5)
      expect(ds.rows.value).toHaveLength(5)
      expect(ds.totalPages.value).toBe(1)
      expect(ds.currentPage.value).toBe(1)

      pageSizeSignal.dispose()
      ds.dispose()
    })
  })

  describe('reorder', () => {
    it('should move row to a new position', () => {
      const ds = createTestSource()
      ds.moveRow('5', '1') // move Eve before Alice
      expect(ds.rows.value[0].id).toBe('5')
      expect(ds.rows.value[1].id).toBe('1')
      ds.dispose()
    })

    it('should not reorder when sort is active', () => {
      const ds = createTestSource()
      ds.toggleSort('name')
      ds.moveRow('5', '1')
      // Sort should still dictate order
      expect(ds.rows.value[0].name).toBe('Alice')
      ds.dispose()
    })

    it('should preserve reorder after reset sort', () => {
      const ds = createTestSource()
      ds.moveRow('5', '1')
      const reorderedFirst = ds.rows.value[0].id
      expect(reorderedFirst).toBe('5')
      ds.toggleSort('name')
      ds.resetSort()
      // Manual order should still be applied
      expect(ds.rows.value[0].id).toBe('5')
      ds.dispose()
    })

    it('should move rows within the first page when pagination is active', () => {
      const ds = createTestSource({ pageSize: 3 })
      // First page: Alice(1), Bob(2), Charlie(3)
      ds.moveRow('3', '1') // move Charlie before Alice
      expect(ds.rows.value[0].id).toBe('3')
      expect(ds.rows.value[1].id).toBe('1')
      expect(ds.rows.value[2].id).toBe('2')
      ds.dispose()
    })

    it('should show correct rows on each page after reordering', () => {
      const ds = createTestSource({ pageSize: 2 })
      // Original order: Alice(1), Bob(2), Charlie(3), Diana(4), Eve(5)
      ds.moveRow('5', '1') // move Eve before Alice → [5,1,2,3,4]
      // Page 1 should be Eve and Alice
      expect(ds.rows.value[0].id).toBe('5')
      expect(ds.rows.value[1].id).toBe('1')
      // Page 2 should be Bob and Charlie
      ds.setPage(2)
      expect(ds.rows.value[0].id).toBe('2')
      expect(ds.rows.value[1].id).toBe('3')
      // Page 3 should be Diana
      ds.setPage(3)
      expect(ds.rows.value[0].id).toBe('4')
      ds.dispose()
    })
  })

  describe('server-side mode', () => {
    it('should not sort client-side when serverSide is true', () => {
      const ds = createTestSource({ serverSide: true })
      ds.toggleSort('name')
      // Rows should still be in original order
      expect(ds.rows.value[0].name).toBe('Alice')
      ds.dispose()
    })

    it('should not filter client-side when serverSide is true', () => {
      const ds = createTestSource({ serverSide: true })
      ds.setFilter(Filter.contains('name', 'xyz'))
      expect(ds.rows.value).toHaveLength(5)
      ds.dispose()
    })
  })

  describe('resetAll', () => {
    it('should reset sort, filters, selection, page, and manual order', () => {
      const ds = createTestSource({ pageSize: 2 })
      ds.toggleSort('name')
      ds.setFilter(Filter.equals('role', 'admin'))
      ds.selectAll()
      ds.setPage(2)

      ds.resetAll()

      expect(ds.sort.value).toEqual([])
      expect(ds.filters.value).toEqual([])
      expect(ds.selectedCount.value).toBe(0)
      expect(ds.currentPage.value).toBe(1)
      expect(ds.rows.value).toHaveLength(2) // still paginated
      ds.dispose()
    })

    it('should restore original row order after resetAll when manualOrder was set', () => {
      const ds = createTestSource()
      // Move Eve(5) before Alice(1) → [5,1,2,3,4]
      ds.moveRow('5', '1')
      expect(ds.rows.value[0].id).toBe('5')

      ds.resetAll()

      // Original order should be restored: Alice, Bob, Charlie, Diana, Eve
      expect(ds.rows.value[0].id).toBe('1')
      expect(ds.rows.value[1].id).toBe('2')
      expect(ds.rows.value[2].id).toBe('3')
      expect(ds.rows.value[3].id).toBe('4')
      expect(ds.rows.value[4].id).toBe('5')
      ds.dispose()
    })
  })

  describe('groupBy', () => {
    it('should return empty groups when no groupBy is set', () => {
      const ds = createTestSource()
      expect(ds.groups.value).toEqual([])
      ds.dispose()
    })

    it('should produce groups with correct keys and row counts after setGroupBy', () => {
      const ds = createTestSource()
      ds.setGroupBy('role')
      const groups = ds.groups.value
      // Roles: admin(Alice,Charlie), user(Bob,Diana), moderator(Eve)
      expect(groups).toHaveLength(3)
      const adminGroup = groups.find(g => g.key === 'admin')
      expect(adminGroup).toBeDefined()
      expect(adminGroup!.rows).toHaveLength(2)
      expect(adminGroup!.rows.every(u => u.role === 'admin')).toBe(true)
      const userGroup = groups.find(g => g.key === 'user')
      expect(userGroup).toBeDefined()
      expect(userGroup!.rows).toHaveLength(2)
      const moderatorGroup = groups.find(g => g.key === 'moderator')
      expect(moderatorGroup).toBeDefined()
      expect(moderatorGroup!.rows).toHaveLength(1)
      ds.dispose()
    })

    it('should compute groups from filtered data', () => {
      const ds = createTestSource()
      ds.setFilter(Filter.equals('role', 'admin'))
      ds.setGroupBy('role')
      const groups = ds.groups.value
      // Only admin rows remain after filter
      expect(groups).toHaveLength(1)
      expect(groups[0].key).toBe('admin')
      expect(groups[0].rows).toHaveLength(2)
      ds.dispose()
    })

    it('should compute groups respecting sort order', () => {
      const ds = createTestSource()
      ds.toggleSort('name')
      ds.setGroupBy('role')
      const adminGroup = ds.groups.value.find(g => g.key === 'admin')
      expect(adminGroup).toBeDefined()
      // With name sort asc, admin rows should be Alice then Charlie
      expect(adminGroup!.rows[0].name).toBe('Alice')
      expect(adminGroup!.rows[1].name).toBe('Charlie')
      ds.dispose()
    })

    it('should clear groupBy when resetAll is called', () => {
      const ds = createTestSource()
      ds.setGroupBy('role')
      expect(ds.groupBy.value).toBe('role')
      ds.resetAll()
      expect(ds.groupBy.value).toBeUndefined()
      expect(ds.groups.value).toEqual([])
      ds.dispose()
    })

    it('should disable grouping when setGroupBy is called with undefined', () => {
      const ds = createTestSource()
      ds.setGroupBy('role')
      expect(ds.groups.value).toHaveLength(3)
      ds.setGroupBy(undefined)
      expect(ds.groupBy.value).toBeUndefined()
      expect(ds.groups.value).toEqual([])
      ds.dispose()
    })

    it('should update groups when filter is applied after groupBy', () => {
      const ds = createTestSource()
      ds.setGroupBy('role')
      expect(ds.groups.value).toHaveLength(3)
      // Apply filter while groupBy is active
      ds.setFilter(Filter.equals('role', 'admin'))
      expect(ds.groups.value).toHaveLength(1)
      expect(ds.groups.value[0].key).toBe('admin')
      expect(ds.groups.value[0].rows).toHaveLength(2)
      ds.dispose()
    })

    it('should update groups when filter is removed while groupBy is active', () => {
      const ds = createTestSource()
      ds.setGroupBy('role')
      ds.setFilter(Filter.equals('role', 'admin'))
      expect(ds.groups.value).toHaveLength(1)
      ds.removeFilter('role')
      expect(ds.groups.value).toHaveLength(3)
      ds.dispose()
    })

    it('should update groups reactively when external groupBy signal changes', async () => {
      const groupBySignal = prop<string | undefined>(undefined)
      const ds = createTestSource({ groupBy: groupBySignal })
      expect(ds.groups.value).toEqual([])

      groupBySignal.set('role')
      await Promise.resolve()
      expect(ds.groups.value).toHaveLength(3)

      // Now apply filter while grouped
      ds.setFilter(Filter.equals('role', 'admin'))
      expect(ds.groups.value).toHaveLength(1)

      groupBySignal.dispose()
      ds.dispose()
    })

    it('should notify on() listeners when groups change after filter', async () => {
      const ds = createTestSource()
      ds.setGroupBy('role')
      expect(ds.groups.value).toHaveLength(3)

      const updates: number[] = []
      const unsub = ds.groups.on(groups => updates.push(groups.length))

      ds.setFilter(Filter.equals('role', 'admin'))
      // on() listeners fire asynchronously — wait several microtasks for the chain
      // filterState → filteredData → sortedData → groups
      for (let i = 0; i < 5; i++) await Promise.resolve()

      expect(updates).toContain(1) // should have received update with 1 group
      unsub()
      ds.dispose()
    })

    it('should correctly paginate when groupBy is active with pagination', () => {
      const ds = createTestSource({ pageSize: 2 })
      ds.setGroupBy('role')
      // Groups should be computed from ALL sorted+filtered data, not just paginated rows
      expect(ds.groups.value).toHaveLength(3)
      const totalRows = ds.groups.value.reduce((sum, g) => sum + g.rows.length, 0)
      expect(totalRows).toBe(5) // all 5 users, not just page of 2
      ds.dispose()
    })
  })

  describe('reactive data source', () => {
    it('should reprocess when source data changes', () => {
      const data = prop([...sampleUsers])
      const ds = createDataSource<User>({ data, rowId: u => u.id })
      expect(ds.rows.value).toHaveLength(5)

      data.set([...sampleUsers, { id: '6', name: 'Frank', age: 40, role: 'user' }])
      expect(ds.rows.value).toHaveLength(6)
      expect(ds.totalRows.value).toBe(6)
      ds.dispose()
    })

    it('should maintain filters when data changes', () => {
      const data = prop([...sampleUsers])
      const ds = createDataSource<User>({ data, rowId: u => u.id })
      ds.setFilter(Filter.equals('role', 'admin'))
      expect(ds.rows.value).toHaveLength(2)

      data.set([
        ...sampleUsers,
        { id: '6', name: 'Frank', age: 40, role: 'admin' },
      ])
      expect(ds.rows.value).toHaveLength(3)
      ds.dispose()
    })
  })

  describe('custom accessors', () => {
    it('should use custom accessor for sort and filter', () => {
      const ds = createTestSource({
        accessors: {
          fullInfo: (u: User) => `${u.name}-${u.role}`,
        },
      })
      ds.setFilter(Filter.contains('fullInfo', 'Alice-admin'))
      expect(ds.rows.value).toHaveLength(1)
      expect(ds.rows.value[0].name).toBe('Alice')
      ds.dispose()
    })
  })

  describe('dispose', () => {
    it('should clean up without errors', () => {
      const ds = createTestSource()
      ds.toggleSort('name')
      ds.setFilter(Filter.equals('role', 'admin'))
      ds.getSortDirection('name')
      ds.getTextFilterValue('role')
      ds.getColumnFilters('role')
      ds.selected.value.has('1')
      expect(() => ds.dispose()).not.toThrow()
    })
  })
})
