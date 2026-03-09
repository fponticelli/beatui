import { computedOf, Prop, prop, Signal, TNode, Value } from '@tempots/dom'
import { ControlSize } from '../theme'
import { createDataSource, DataSource, RowGroup } from './data-source'
import {
  DataColumnDef,
  DataTableOptions,
  DataTablePaginationOptions,
  DataTableToolbarOptions,
} from './data-table-types'
import {
  resolveToolbarOptions,
  resolvePaginationOptions,
  paginateGroups,
} from './data-table-resolve'

export interface DataTableContext<T, C extends string = string> {
  // Core
  ds: DataSource<T, C>
  columns: DataColumnDef<T, C>[]
  columnMap: Map<C, DataColumnDef<T, C>>
  getCol: (id: C) => DataColumnDef<T, C>
  rowId: (row: T) => string

  // Column visibility
  visibleColumns: Signal<C[]>
  hiddenColumns: Signal<C[]>
  hideableColumns: DataColumnDef<T, C>[]
  hasColumnVisibility: Value<boolean>
  toggleColumnVisibility: (colId: C) => void
  showAllColumns: () => void

  // Column reordering
  columnOrder: Prop<C[]>
  reorderableColumns: Value<boolean>
  onColumnOrderChange?: (columnIds: C[]) => void
  dragState: { columnId: C | null }

  // Selection
  selectable: Value<boolean>
  selectableSignal: Signal<boolean>
  selectOnRowClickSignal: Signal<boolean>
  selectionAfter: Value<boolean>

  // Display config
  sortable: Value<boolean>
  multiSort: Value<boolean>
  size: Value<ControlSize>
  onRowClick?: (row: T) => void
  filterLayout: Value<'header' | 'row'>
  hasFilters: Value<boolean>
  loading: Value<boolean>
  showFooter: Value<boolean>
  emptyContent?: TNode
  groupCollapsible: boolean
  groupSummary?: (groupKey: string, rows: T[]) => TNode
  hasFooter: boolean

  // Computed display
  rowClickable: Signal<boolean>
  effectiveHoverable: Signal<boolean>
  totalColSpan: Signal<number>

  // Group state
  collapsedGroups: Prop<Set<string>>
  currentGroupPageGroups: Signal<RowGroup<T>[]>

  // Pagination
  toolbarConfig: Signal<DataTableToolbarOptions | false>
  paginationConfig: Value<DataTablePaginationOptions | false>
  paginationEnabledSignal: Signal<boolean>
  pageSizeSignal: Signal<number>
  effectiveTotalPages: Signal<number>
  effectiveCurrentPage: Signal<number>
  setEffectivePage: (page: number) => void
  showPagination: Signal<boolean>

  // Cleanup
  dispose: () => void
}

export function createDataTableContext<T, C extends string = string>(
  options: DataTableOptions<T, C>
): DataTableContext<T, C> {
  const {
    data,
    columns,
    rowId,
    sortable: sortableOpt = false,
    filterable: filterableOpt = false,
    selectable: selectableOpt = false,
    reorderableColumns = false,
    onColumnOrderChange,
    pagination: paginationOpt,
    toolbar: toolbarOpt,
    size = 'md',
    hoverable = false,
    onSortChange,
    onFilterChange,
    onSelectionChange,
    onGroupByChange,
    onRowClick,
    serverSide = false,
    loading = false,
    groupBy: groupByOpt,
    groupCollapsible = true,
    showFooter = false,
    groupSummary,
    emptyContent,
    hiddenColumns: hiddenColumnsOption = [],
    onDataSource,
  } = options

  // Resolve sortable union → boolean + multiSort
  const sortable: Value<boolean> = Value.map(sortableOpt, v => !!v)
  const multiSort: Value<boolean> = Value.map(sortableOpt, v => v === 'multi')

  // Resolve filterable union → boolean + filterLayout
  const filterable: Value<boolean> = Value.map(filterableOpt, v => !!v)
  const filterLayout: Value<'header' | 'row'> = Value.map(filterableOpt, v =>
    v === 'row' ? 'row' : 'header'
  )

  // Resolve selectable union → boolean + options
  const selectable: Value<boolean> = Value.map(selectableOpt, v => !!v)
  const selectionAfter: Value<boolean> = Value.map(selectableOpt, v =>
    typeof v === 'object' ? v.position === 'after' : false
  )
  const selectOnRowClick: Value<boolean> = Value.map(selectableOpt, v =>
    typeof v === 'object' ? (v.selectOnRowClick ?? false) : false
  )

  const hiddenColumns = Value.deriveProp(hiddenColumnsOption)

  const paginationConfig = Value.map(paginationOpt ?? false, o =>
    resolvePaginationOptions(o ?? false)
  )
  const toolbarConfig = Value.toSignal(toolbarOpt ?? false).map(
    resolveToolbarOptions
  )

  // Column visibility state — evaluate hideable at setup time
  const hideableColumns = columns.filter(c => {
    const h = c.hideable
    if (h == null) return false
    return typeof h === 'boolean' ? h : h.value
  })
  const hasColumnVisibility = Value.map(
    hiddenColumns ?? [],
    hc => hc.length > 0
  )

  // Column order state (for drag-to-reorder)
  const columnOrder = prop<C[]>(columns.map(c => c.id))
  const columnMap = new Map(columns.map(c => [c.id, c]))
  const getCol = (id: C) => columnMap.get(id)!

  const visibleColumns = computedOf(
    reorderableColumns,
    hiddenColumns,
    columnOrder
  )((reorder, hidden, order) => {
    if (reorder) {
      return order.filter(id => !hidden.includes(id) && columnMap.has(id))
    } else {
      return columns.filter(c => !hidden.includes(c.id)).map(c => c.id)
    }
  })

  const toggleColumnVisibility = (colId: C) => {
    const next = new Set(hiddenColumns.value)
    if (next.has(colId)) {
      next.delete(colId)
    } else {
      next.add(colId)
    }
    hiddenColumns.set(Array.from(next))
  }

  const showAllColumns = () => {
    hiddenColumns.set(Array.from(columns.map(c => c.id)))
  }

  // Build accessors and comparators from column defs
  const accessors: Partial<Record<C, (row: T) => unknown>> = {}
  const comparatorsMap: Partial<Record<C, (a: unknown, b: unknown) => number>> =
    {}
  for (const col of columns) {
    if (col.value) accessors[col.id] = col.value
    if (col.comparator) comparatorsMap[col.id] = col.comparator
  }

  const ds: DataSource<T, C> = createDataSource<T, C>({
    data,
    rowId,
    accessors,
    comparators: comparatorsMap,
    ...(paginationOpt != null
      ? {
          pageSize: Value.map(paginationConfig, p =>
            p === false ? 0 : (p?.pageSize ?? 10)
          ),
        }
      : {}),
    multiSort,
    serverSide,
    groupBy: groupByOpt,
    onSortChange,
    onFilterChange,
    onSelectionChange,
    onGroupByChange,
  })

  onDataSource?.(ds)

  // Effective hoverable: true when hoverable, selectOnRowClick+selectable, or onRowClick
  const hoverableSignal = Value.toSignal(hoverable)
  const selectOnRowClickSignal = Value.toSignal(selectOnRowClick)
  const selectableSignal = Value.toSignal(selectable)
  const effectiveHoverable = computedOf(
    hoverableSignal,
    selectOnRowClickSignal,
    selectableSignal
  )((h, sorc, sel) => h || (sorc && sel) || onRowClick != null)
  const rowClickable = computedOf(
    selectOnRowClickSignal,
    selectableSignal
  )((sorc, sel) => (sorc && sel) || onRowClick != null)

  const columnsHaveFilters = columns.some(c => c.filter != null)
  const hasFilters: Value<boolean> = columnsHaveFilters
    ? Value.map(filterable, f => !!f)
    : false
  const hasFooter = columns.some(c => c.footer != null)

  const paginationEnabledSignal = Value.toSignal(
    Value.map(paginationConfig, p => p !== false)
  )

  // Collapsed group state (needed by group pagination)
  const collapsedGroups = prop<Set<string>>(new Set())

  // Group-aware pagination
  const pageSizeSignal = Value.toSignal(
    Value.map(paginationConfig, p => (p === false ? 0 : (p?.pageSize ?? 10)))
  )
  const serverSideSignal = Value.toSignal(serverSide)
  const groupCurrentPage = prop(1)
  // In server-side mode, skip client-side group pagination — the server controls pages.
  const groupPages = computedOf(
    ds.groups,
    pageSizeSignal,
    collapsedGroups,
    serverSideSignal
  )((groups, ps, collapsed, ss) =>
    ss ? [groups] : paginateGroups(groups, ps, collapsed)
  )

  const groupTotalPages = groupPages.map(pages => pages.length)

  // Clamp groupCurrentPage when groupTotalPages shrinks
  const groupPageClampUnsub = Value.on(groupTotalPages, tp => {
    const cp = groupCurrentPage.value
    if (cp > tp) groupCurrentPage.set(Math.max(1, tp))
  })

  const currentGroupPageGroups = computedOf(
    groupPages,
    groupCurrentPage
  )((pages, cp) => {
    const idx = Math.max(0, Math.min(cp - 1, pages.length - 1))
    return pages[idx] ?? []
  })

  // Effective total pages & current page: switch between flat and group-aware
  const effectiveTotalPages = computedOf(
    ds.groupBy,
    ds.totalPages,
    groupTotalPages
  )((gb, stdPages, grpPages) => (gb != null ? grpPages : stdPages))

  const effectiveCurrentPage = computedOf(
    ds.groupBy,
    ds.currentPage,
    groupCurrentPage
  )((gb, stdPage, grpPage) => (gb != null ? grpPage : stdPage))

  const setEffectivePage = (page: number) => {
    if (ds.groupBy.value != null) {
      const clamped = Math.max(1, Math.min(page, groupTotalPages.value))
      groupCurrentPage.set(clamped)
    } else {
      ds.setPage(page)
    }
  }

  // Hide pagination when disabled or when all data fits on one page
  const showPagination = computedOf(
    paginationEnabledSignal,
    effectiveTotalPages
  )((pag, tp) => pag && tp > 1)

  const totalColSpan = computedOf(
    visibleColumns,
    selectableSignal
  )((ids, sel) => ids.length + (sel ? 1 : 0))

  const dragState: { columnId: C | null } = { columnId: null }

  const dispose = () => {
    ds.dispose()
    hiddenColumns.dispose()
    visibleColumns.dispose()
    totalColSpan.dispose()
    columnOrder.dispose()
    collapsedGroups.dispose()
    hoverableSignal.dispose()
    selectOnRowClickSignal.dispose()
    selectableSignal.dispose()
    effectiveHoverable.dispose()
    rowClickable.dispose()
    paginationEnabledSignal.dispose()
    pageSizeSignal.dispose()
    serverSideSignal.dispose()
    groupCurrentPage.dispose()
    groupPageClampUnsub()
    groupPages.dispose()
    groupTotalPages.dispose()
    currentGroupPageGroups.dispose()
    effectiveTotalPages.dispose()
    effectiveCurrentPage.dispose()
    showPagination.dispose()
    toolbarConfig.dispose()
  }

  return {
    ds,
    columns,
    columnMap,
    getCol,
    rowId,
    visibleColumns,
    hiddenColumns,
    hideableColumns,
    hasColumnVisibility,
    toggleColumnVisibility,
    showAllColumns,
    columnOrder,
    reorderableColumns,
    onColumnOrderChange,
    dragState,
    selectable,
    selectableSignal,
    selectOnRowClickSignal,
    selectionAfter,
    sortable,
    multiSort,
    size,
    onRowClick,
    filterLayout,
    hasFilters,
    loading,
    showFooter,
    emptyContent,
    groupCollapsible,
    groupSummary,
    hasFooter,
    rowClickable,
    effectiveHoverable,
    totalColSpan,
    collapsedGroups,
    currentGroupPageGroups,
    toolbarConfig,
    paginationConfig,
    paginationEnabledSignal,
    pageSizeSignal,
    effectiveTotalPages,
    effectiveCurrentPage,
    setEffectivePage,
    showPagination,
    dispose,
  }
}
