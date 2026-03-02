import { computedOf, prop, Signal, Value } from '@tempots/dom'
import {
  FilterBase,
  TextFilter,
  isBuiltinFilter,
  evaluateBuiltinFilter,
} from './filter'

/**
 * Sort direction for a column.
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Describes how a column should be sorted.
 *
 * @typeParam C - Column identifier type. Defaults to `string`; narrow to a
 *   union of literal column IDs for compile-time safety.
 */
export interface SortDescriptor<C extends string = string> {
  /** Column identifier */
  column: C
  /** Sort direction */
  direction: SortDirection
}

/**
 * An action available when rows are selected.
 */
export interface BulkAction {
  /** Display label */
  label: string
  /** Optional icon identifier */
  icon?: string
  /** Callback receiving the set of selected row IDs */
  onClick: (selected: Set<string>) => void
}

/**
 * Configuration options for {@link createDataSource}.
 *
 * @typeParam T - The type of data rows
 * @typeParam C - Column identifier type (defaults to `string`)
 */
/**
 * A group of rows sharing the same group-by value.
 *
 * @typeParam T - The type of data rows
 */
export interface RowGroup<T> {
  /** The stringified group key */
  key: string
  /** Rows belonging to this group */
  rows: T[]
}

export interface DataSourceOptions<T, C extends string = string> {
  /** The source data array (static or reactive) */
  data: Value<T[]>
  /** Returns a unique string ID for each row */
  rowId: (row: T) => string
  /** Maps column IDs to accessor functions that extract the column value from a row */
  accessors?: Partial<Record<C, (row: T) => unknown>>
  /** Maps column IDs to custom comparator functions for sorting */
  comparators?: Partial<Record<C, (a: unknown, b: unknown) => number>>
  /** Initial sort state */
  initialSort?: SortDescriptor<C>[]
  /** Initial filter state */
  initialFilters?: FilterBase<C>[]
  /** Page size (undefined = no pagination) */
  pageSize?: Value<number>
  /** Allow sorting on multiple columns simultaneously. @default false */
  multiSort?: Value<boolean>
  /** When true, skips client-side sort/filter/paginate (caller drives rows externally). @default false */
  serverSide?: Value<boolean>
  /** Column to group rows by. `undefined` disables grouping. */
  groupBy?: Value<C | undefined>
  /** Called whenever sort state changes */
  onSortChange?: (sort: SortDescriptor<C>[]) => void
  /** Called whenever filter state changes */
  onFilterChange?: (filters: FilterBase<C>[]) => void
  /** Called whenever the current page changes */
  onPageChange?: (page: number) => void
  /** Called whenever selection changes */
  onSelectionChange?: (selected: Set<string>) => void
  /** Evaluate a custom (non-builtin) filter kind. Return `true` to include the row. */
  evaluateFilter?: (filter: FilterBase<C>, row: T) => boolean
}

/**
 * A headless reactive data source managing sort, filter, selection, and pagination state.
 *
 * @typeParam T - The type of data rows
 * @typeParam C - Column identifier type (defaults to `string`)
 */
export interface DataSource<T, C extends string = string> {
  /** Final visible rows (sorted, filtered, paginated) */
  rows: Signal<T[]>
  /** Total number of rows in source data */
  totalRows: Signal<number>
  /** Number of rows after filtering (before pagination) */
  totalFilteredRows: Signal<number>

  // Sort
  /** Current sort descriptors */
  sort: Signal<SortDescriptor<C>[]>
  /** Toggle sort on a column: none → asc → desc → none. Pass `{ multi: true }` to add/modify without replacing other sorts. */
  toggleSort: (column: C, opts?: { multi?: boolean }) => void
  /** Replace the full sort state */
  setSort: (sort: SortDescriptor<C>[]) => void
  /** Reactive sort direction for a specific column */
  getSortDirection: (column: C) => Signal<SortDirection | undefined>
  /** Clear all sorts */
  resetSort: () => void

  // Filter
  /** Current filter descriptors */
  filters: Signal<FilterBase<C>[]>
  /** Set or replace all filters on a column */
  setFilter: (filter: FilterBase<C>) => void
  /** Add a filter alongside existing ones on the same column */
  addFilter: (filter: FilterBase<C>) => void
  /** Remove all filters from a column */
  removeFilter: (column: C) => void
  /** Reactive list of filters for a specific column */
  getColumnFilters: (column: C) => Signal<FilterBase<C>[]>
  /** Reactive text filter value for a specific column (value from first TextFilter, or '') */
  getTextFilterValue: (column: C) => Signal<string>
  /** Clear all filters */
  resetFilters: () => void

  // Selection
  /** Set of selected row IDs */
  selected: Signal<Set<string>>
  /** Reactive boolean for whether a specific row is selected */
  isSelected: (id: string) => Signal<boolean>
  /** Toggle selection of a row */
  toggleSelect: (id: string) => void
  /** Add rows to selection */
  select: (ids: string[]) => void
  /** Remove rows from selection */
  deselect: (ids: string[]) => void
  /** Select all currently visible (filtered) rows */
  selectAll: () => void
  /** Clear selection */
  deselectAll: () => void
  /** Whether all filtered rows are selected */
  isAllSelected: Signal<boolean>
  /** Whether some (but not all) filtered rows are selected */
  isSomeSelected: Signal<boolean>
  /** Count of selected rows */
  selectedCount: Signal<number>

  // Pagination
  /** Current page (1-indexed) */
  currentPage: Signal<number>
  /** Total number of pages */
  totalPages: Signal<number>
  /** Current page size */
  pageSize: Signal<number>
  /** Navigate to a page */
  setPage: (page: number) => void
  /** Change page size (resets to page 1) */
  setPageSize: (size: number) => void

  // Group by
  /** Current group-by column (undefined = no grouping) */
  groupBy: Signal<C | undefined>
  /** Set or clear group-by column */
  setGroupBy: (column: C | undefined) => void
  /** Grouped rows (empty array when groupBy is undefined) */
  groups: Signal<RowGroup<T>[]>
  /** All rows after sort and filter, before pagination */
  allFilteredRows: Signal<T[]>

  // Reorder
  /** Swap two rows by ID (only effective when no sort active) */
  moveRow: (fromId: string, toId: string) => void

  /** Reset sort, filters, selection, page, and groupBy */
  resetAll: () => void
  /** Clean up all reactive subscriptions */
  dispose: () => void
}

function defaultComparator(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b)
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return (a ? 1 : 0) - (b ? 1 : 0)
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime()
  }
  return String(a).localeCompare(String(b))
}

function defaultAccessor<T>(row: T, column: string): unknown {
  return (row as Record<string, unknown>)[column]
}

/**
 * Creates a headless reactive data source for managing tabular data operations.
 *
 * Provides sorting, filtering, selection, pagination, and manual reorder as
 * reactive signals and imperative methods. All processing happens client-side
 * unless `serverSide` is true.
 *
 * @typeParam T - The type of data rows
 * @param options - Configuration for the data source
 * @returns A {@link DataSource} object with reactive state and methods
 *
 * @example
 * ```ts
 * const ds = createDataSource({
 *   data: prop([
 *     { id: '1', name: 'Alice', age: 30 },
 *     { id: '2', name: 'Bob', age: 25 },
 *   ]),
 *   rowId: row => row.id,
 * })
 *
 * ds.toggleSort('name') // sort by name ascending
 * ds.setFilter(Filter.contains('name', 'ali')) // filter name containing "ali"
 * ds.rows.value // [{ id: '1', name: 'Alice', age: 30 }]
 * ds.dispose()
 * ```
 */
export function createDataSource<T, C extends string = string>(
  options: DataSourceOptions<T, C>
): DataSource<T, C> {
  const {
    data,
    rowId,
    accessors = {} as Partial<Record<C, (row: T) => unknown>>,
    comparators = {} as Partial<Record<C, (a: unknown, b: unknown) => number>>,
    initialSort = [],
    initialFilters = [],
    pageSize: pageSizeValue,
    multiSort = false,
    serverSide = false,
    groupBy: groupByValue,
    onSortChange,
    onFilterChange,
    onPageChange,
    onSelectionChange,
    evaluateFilter: evaluateFilterCb,
  } = options

  const disposables: (() => void)[] = []

  // Mutable state
  const sortState = prop<SortDescriptor<C>[]>(initialSort)
  const filterState = prop<FilterBase<C>[]>(initialFilters)
  const selectionState = prop<Set<string>>(new Set())
  const currentPageState = prop(1)
  const pageSizeState = prop(
    pageSizeValue != null ? Value.get(pageSizeValue) : 0
  )
  disposables.push(
    () => sortState.dispose(),
    () => filterState.dispose(),
    () => selectionState.dispose(),
    () => currentPageState.dispose(),
    () => pageSizeState.dispose()
  )

  // Track external pageSize changes
  if (pageSizeValue != null) {
    const pageSizeSignal = Value.toSignal(pageSizeValue)
    const unsub = Value.on(pageSizeSignal, size => {
      pageSizeState.set(size)
      currentPageState.set(1)
    })
    disposables.push(unsub)
    disposables.push(() => pageSizeSignal.dispose())
  }

  // Manual reorder: stores user-defined order as array of IDs (empty = use source order)
  const manualOrder = prop<string[]>([])
  disposables.push(() => manualOrder.dispose())

  const getAccessor = (column: C): ((row: T) => unknown) =>
    accessors[column] ?? ((row: T) => defaultAccessor(row, column))

  const getComparator = (column: C): ((a: unknown, b: unknown) => number) =>
    comparators[column] ?? defaultComparator

  // Source data signal
  const sourceData = Value.toSignal(data)
  disposables.push(() => sourceData.dispose())

  // Total rows
  const totalRows = sourceData.map(d => d.length)
  disposables.push(() => totalRows.dispose())

  // Pipeline: source → manual reorder → filter → sort → paginate

  // Step 1: Apply manual reorder
  const reorderedData = computedOf(
    sourceData,
    manualOrder
  )((items, order) => {
    if (order.length === 0) return items
    const map = new Map(items.map(item => [rowId(item), item]))
    const result: T[] = []
    for (const id of order) {
      const item = map.get(id)
      if (item != null) {
        result.push(item)
        map.delete(id)
      }
    }
    // Append any items not in the manual order
    for (const item of map.values()) {
      result.push(item)
    }
    return result
  })
  disposables.push(() => reorderedData.dispose())

  // Step 2: Filter
  const filteredData = serverSide
    ? reorderedData
    : computedOf(
        reorderedData,
        filterState
      )((items, filters) => {
        if (filters.length === 0) return items
        return items.filter(row =>
          filters.every(f => {
            if (isBuiltinFilter(f)) {
              // Skip text filters with empty value
              if (f.kind === 'text' && (f as TextFilter<C>).value === '')
                return true
              const accessor = getAccessor(f.column)
              return evaluateBuiltinFilter(f, accessor(row))
            }
            // Custom filter kind — delegate to callback
            if (evaluateFilterCb) {
              return evaluateFilterCb(f, row)
            }
            // No handler — include the row
            return true
          })
        )
      })
  if (!serverSide) disposables.push(() => filteredData.dispose())

  const totalFilteredRows = filteredData.map(d => d.length)
  disposables.push(() => totalFilteredRows.dispose())

  // Step 3: Sort
  const sortedData = serverSide
    ? filteredData
    : computedOf(
        filteredData,
        sortState
      )((items, sorts) => {
        if (sorts.length === 0) return items
        const sorted = [...items]
        sorted.sort((a, b) => {
          for (const s of sorts) {
            const accessor = getAccessor(s.column)
            const comparator = getComparator(s.column)
            const result = comparator(accessor(a), accessor(b))
            if (result !== 0) {
              return s.direction === 'desc' ? -result : result
            }
          }
          return 0
        })
        return sorted
      })
  if (!serverSide) disposables.push(() => sortedData.dispose())

  // Group-by state
  const groupByState = prop<C | undefined>(
    groupByValue != null ? Value.get(groupByValue) : undefined
  )
  disposables.push(() => groupByState.dispose())

  // Track external groupBy changes
  if (groupByValue != null) {
    const groupBySignal = Value.toSignal(groupByValue)
    const unsub = Value.on(groupBySignal, col => {
      groupByState.set(col)
    })
    disposables.push(unsub)
    disposables.push(() => groupBySignal.dispose())
  }

  // Groups computed from sortedData + groupBy
  const groups = computedOf(
    sortedData,
    groupByState
  )((items, col): RowGroup<T>[] => {
    if (col == null) return []
    const accessor = getAccessor(col)
    const map = new Map<string, T[]>()
    const keys: string[] = []
    for (const row of items) {
      const key = String(accessor(row) ?? '')
      if (!map.has(key)) {
        map.set(key, [])
        keys.push(key)
      }
      map.get(key)!.push(row)
    }
    return keys.map(key => ({ key, rows: map.get(key)! }))
  })
  disposables.push(() => groups.dispose())

  // Step 4: Paginate
  const hasPagination = pageSizeValue != null
  const totalPages = hasPagination
    ? computedOf(
        totalFilteredRows,
        pageSizeState
      )((total, size) => (size > 0 ? Math.max(1, Math.ceil(total / size)) : 1))
    : prop(1)
  disposables.push(() => totalPages.dispose())

  // Clamp current page when total pages changes
  if (hasPagination) {
    const unsub = Value.on(totalPages, tp => {
      const cp = currentPageState.value
      if (cp > tp) currentPageState.set(Math.max(1, tp))
    })
    disposables.push(unsub)
  }

  const rows =
    serverSide || !hasPagination
      ? sortedData
      : computedOf(
          sortedData,
          currentPageState,
          pageSizeState
        )((items, page, size) => {
          if (size <= 0) return items
          const start = (page - 1) * size
          return items.slice(start, start + size)
        })
  if (!serverSide && hasPagination) disposables.push(() => rows.dispose())

  // Selection derived signals
  const selectedCount = selectionState.map(s => s.size)
  disposables.push(() => selectedCount.dispose())

  const isAllSelected = computedOf(
    selectionState,
    totalFilteredRows
  )((sel, total) => total > 0 && sel.size >= total)
  disposables.push(() => isAllSelected.dispose())

  const isSomeSelected = computedOf(
    selectionState,
    isAllSelected
  )((sel, all) => sel.size > 0 && !all)
  disposables.push(() => isSomeSelected.dispose())

  // Cached derived signals
  const sortDirectionCache = new Map<C, Signal<SortDirection | undefined>>()
  const columnFiltersCache = new Map<C, Signal<FilterBase<C>[]>>()
  const textFilterValueCache = new Map<C, Signal<string>>()
  const isSelectedCache = new Map<string, Signal<boolean>>()

  // Methods
  const toggleSort = (column: C, opts?: { multi?: boolean }) => {
    const useMulti = opts?.multi ?? Value.get(multiSort)
    const current = sortState.value
    const existing = current.find(s => s.column === column)
    let next: SortDescriptor<C>[]
    if (!existing) {
      next = useMulti
        ? [...current, { column, direction: 'asc' }]
        : [{ column, direction: 'asc' }]
    } else if (existing.direction === 'asc') {
      next = current.map(s =>
        s.column === column ? { ...s, direction: 'desc' as const } : s
      )
    } else {
      next = current.filter(s => s.column !== column)
    }
    sortState.set(next)
    onSortChange?.(next)
  }

  const setSort = (sort: SortDescriptor<C>[]) => {
    sortState.set(sort)
    onSortChange?.(sort)
  }

  const resetSort = () => {
    sortState.set([])
    onSortChange?.([])
  }

  const getSortDirection = (column: C): Signal<SortDirection | undefined> => {
    let cached = sortDirectionCache.get(column)
    if (!cached) {
      cached = sortState.map(
        sorts => sorts.find(s => s.column === column)?.direction
      )
      sortDirectionCache.set(column, cached)
      disposables.push(() => cached!.dispose())
    }
    return cached
  }

  const setFilter = (filter: FilterBase<C>) => {
    const current = filterState.value
    // Replace all filters on that column
    const next = [...current.filter(f => f.column !== filter.column), filter]
    filterState.set(next)
    currentPageState.set(1)
    onFilterChange?.(next)
  }

  const addFilter = (filter: FilterBase<C>) => {
    const next = [...filterState.value, filter]
    filterState.set(next)
    currentPageState.set(1)
    onFilterChange?.(next)
  }

  const removeFilter = (column: C) => {
    const next = filterState.value.filter(f => f.column !== column)
    filterState.set(next)
    currentPageState.set(1)
    onFilterChange?.(next)
  }

  const resetFilters = () => {
    filterState.set([])
    currentPageState.set(1)
    onFilterChange?.([])
  }

  const getColumnFilters = (column: C): Signal<FilterBase<C>[]> => {
    let cached = columnFiltersCache.get(column)
    if (!cached) {
      cached = filterState.map(filters =>
        filters.filter(f => f.column === column)
      )
      columnFiltersCache.set(column, cached)
      disposables.push(() => cached!.dispose())
    }
    return cached
  }

  const getTextFilterValue = (column: C): Signal<string> => {
    let cached = textFilterValueCache.get(column)
    if (!cached) {
      cached = filterState.map(filters => {
        const tf = filters.find(
          f => f.column === column && f.kind === 'text'
        ) as TextFilter<C> | undefined
        return tf?.value ?? ''
      })
      textFilterValueCache.set(column, cached)
      disposables.push(() => cached!.dispose())
    }
    return cached
  }

  const isSelected = (id: string): Signal<boolean> => {
    let cached = isSelectedCache.get(id)
    if (!cached) {
      cached = selectionState.map(s => s.has(id))
      isSelectedCache.set(id, cached)
      disposables.push(() => cached!.dispose())
    }
    return cached
  }

  const updateSelection = (next: Set<string>) => {
    selectionState.set(next)
    onSelectionChange?.(next)
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectionState.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    updateSelection(next)
  }

  const select = (ids: string[]) => {
    const next = new Set(selectionState.value)
    for (const id of ids) next.add(id)
    updateSelection(next)
  }

  const deselect = (ids: string[]) => {
    const next = new Set(selectionState.value)
    for (const id of ids) next.delete(id)
    updateSelection(next)
  }

  const selectAll = () => {
    const allIds = filteredData.value.map(row => rowId(row))
    updateSelection(new Set(allIds))
  }

  const deselectAll = () => {
    updateSelection(new Set())
  }

  const setPage = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages.value))
    currentPageState.set(clamped)
    onPageChange?.(clamped)
  }

  const setPageSize = (size: number) => {
    pageSizeState.set(size)
    currentPageState.set(1)
    onPageChange?.(1)
  }

  const moveRow = (fromId: string, toId: string) => {
    if (fromId === toId) return
    // Only allow reorder when no sort is active
    if (sortState.value.length > 0) return

    const currentData = sourceData.value
    const order =
      manualOrder.value.length > 0
        ? [...manualOrder.value]
        : currentData.map(row => rowId(row))

    const fromIdx = order.indexOf(fromId)
    const toIdx = order.indexOf(toId)
    if (fromIdx < 0 || toIdx < 0) return

    order.splice(fromIdx, 1)
    order.splice(toIdx, 0, fromId)
    manualOrder.set(order)
  }

  const setGroupBy = (column: C | undefined) => {
    groupByState.set(column)
  }

  const resetAll = () => {
    resetSort()
    resetFilters()
    deselectAll()
    currentPageState.set(1)
    manualOrder.set([])
    groupByState.set(undefined)
  }

  const dispose = () => {
    for (const d of disposables) d()
    disposables.length = 0
    sortDirectionCache.clear()
    columnFiltersCache.clear()
    textFilterValueCache.clear()
    isSelectedCache.clear()
  }

  return {
    rows,
    totalRows,
    totalFilteredRows,
    sort: sortState,
    toggleSort,
    setSort,
    getSortDirection,
    resetSort,
    filters: filterState,
    setFilter,
    addFilter,
    removeFilter,
    getColumnFilters,
    getTextFilterValue,
    resetFilters,
    selected: selectionState,
    isSelected,
    toggleSelect,
    select,
    deselect,
    selectAll,
    deselectAll,
    isAllSelected,
    isSomeSelected,
    selectedCount,
    currentPage: currentPageState,
    totalPages,
    pageSize: pageSizeState,
    setPage,
    setPageSize,
    groupBy: groupByState,
    setGroupBy,
    groups,
    allFilteredRows: sortedData,
    moveRow,
    resetAll,
    dispose,
  }
}
