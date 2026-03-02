import {
  aria,
  attr,
  computedOf,
  ForEach,
  Fragment,
  html,
  MapSignal,
  on,
  OnDispose,
  prop,
  style,
  TNode,
  Value,
  When,
  Use,
} from '@tempots/dom'
import { BeatUII18n } from '../../beatui-i18n'
import { createDataSource, DataSource } from './data-source'
import {
  DataColumnDef,
  DataTableOptions,
  DataTablePaginationOptions,
  DataTableToolbarOptions,
} from './data-table-types'
import { Table } from './table'
import { Pagination } from '../navigation/pagination'
import { SortableHeader } from './sortable-header'
import { ColumnFilter } from './column-filter'
import { ColumnFilterPanel } from './column-filter-panel'
import { SelectAllCheckbox } from './selection-checkbox'
import { SelectionCheckbox } from './selection-checkbox'
import { DataToolbar } from './data-toolbar'
import { ColumnHeaderMenu } from './column-header-menu'
import { Flyout } from '../navigation/flyout'
import { CheckboxInput } from '../form/input/checkbox-input'
import { Icon } from './icon'
import { Button } from '../button/button'
import { Tooltip } from '../overlay/tooltip'
import {
  describeFilter,
  describeFilterLocalized,
  FilterDescriptionMessages,
} from './filter'
import { computeAggregation, AggregationFunction } from './aggregation'

function resolveToolbarOptions(
  toolbar: boolean | DataTableToolbarOptions
): DataTableToolbarOptions | false {
  if (toolbar === true) return {}
  if (toolbar === false || toolbar == null) return false
  return toolbar
}

function resolvePaginationOptions(
  pagination: boolean | DataTablePaginationOptions
): DataTablePaginationOptions | false {
  if (pagination === true) return { pageSize: 10 }
  if (pagination === false || pagination == null) return false
  return pagination
}

/**
 * A full-featured data table component built by composing headless {@link DataSource}
 * state management with composable UI primitives and the existing {@link Table}
 * and {@link Pagination} components.
 *
 * Supports column-level sorting, filtering, row selection, pagination, bulk actions,
 * and server-side mode. Each feature is opt-in and configurable per column.
 *
 * @typeParam T - The type of data rows
 * @param options - Full configuration for the data table
 * @returns A composed data table element
 *
 * @example
 * ```ts
 * DataTable({
 *   data: prop(users),
 *   columns: [
 *     { id: 'name', header: 'Name', cell: u => u.name, sortable: true, filterable: true },
 *     { id: 'email', header: 'Email', cell: u => u.email, sortable: true },
 *     { id: 'role', header: 'Role', cell: u => u.role, filterable: 'select',
 *       filterOptions: [{ value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }] },
 *   ],
 *   rowId: u => u.id,
 *   sortable: true,
 *   filterable: true,
 *   selectable: true,
 *   pagination: { pageSize: 20 },
 *   toolbar: { bulkActions: [{ label: 'Delete', onClick: sel => deleteUsers(sel) }] },
 *   fullWidth: true,
 * })
 * ```
 */
export function DataTable<T, C extends string = string>(options: DataTableOptions<T, C>) {
  const {
    data,
    columns,
    rowId,
    sortable = false,
    multiSort = false,
    filterable = false,
    filterLayout = 'header',
    selectable = false,
    selectionPosition = 'before',
    selectOnRowClick = false,
    reorderableColumns = false,
    onColumnOrderChange,
    pagination: paginationOpt,
    toolbar: toolbarOpt,
    size = 'md',
    hoverable = false,
    stickyHeader = false,
    fullWidth = false,
    withStripedRows = false,
    withTableBorder = true,
    withColumnBorders = false,
    withRowBorders = true,
    onSortChange,
    onFilterChange,
    onSelectionChange,
    onRowClick,
    serverSide = false,
    loading = false,
    groupBy: groupByOpt,
    groupCollapsible = true,
    showAggregation = false,
    emptyContent,
    columnVisibility: columnVisibilityOpt,
    onDataSource,
  } = options

  const paginationConfig = Value.map(paginationOpt ?? false, o =>
    resolvePaginationOptions(o ?? false)
  )
  const toolbarConfig = Value.map(toolbarOpt ?? false, resolveToolbarOptions)
  const toolbarConfigSignal = Value.toSignal(toolbarConfig)

  // Column visibility state
  const hideableColumns = columns.filter(c => c.hideable)
  const hasColumnVisibility = columnVisibilityOpt != null && hideableColumns.length > 0
  const hiddenColumns = prop<Set<string>>(
    new Set(columnVisibilityOpt?.defaultHidden ?? [])
  )

  // Column order state (for drag-to-reorder)
  const columnOrder = prop<C[]>(columns.map(c => c.id))
  const columnMap = new Map(columns.map(c => [c.id, c]))

  const visibleColumns = reorderableColumns
    ? computedOf(hiddenColumns, columnOrder)((hidden, order) =>
        order
          .filter(id => !hidden.has(id) && columnMap.has(id))
          .map(id => columnMap.get(id)!)
      )
    : hiddenColumns.map(hidden =>
        columns.filter(c => !hidden.has(c.id))
      )

  const toggleColumnVisibility = (colId: string) => {
    const next = new Set(hiddenColumns.value)
    if (next.has(colId)) {
      next.delete(colId)
    } else {
      next.add(colId)
    }
    hiddenColumns.set(next)
  }

  const showAllColumns = () => {
    hiddenColumns.set(new Set())
  }

  // Build accessors and comparators from column defs
  const accessors: Partial<Record<C, (row: T) => unknown>> = {}
  const comparatorsMap: Partial<Record<C, (a: unknown, b: unknown) => number>> = {}
  for (const col of columns) {
    if (col.accessor) accessors[col.id] = col.accessor
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

  const hasFilters = filterable && columns.some(c => c.filterable)

  // Pagination should be hidden when groupBy is active (groups render all rows)
  const paginationEnabledSignal = Value.toSignal(
    Value.map(paginationConfig, p => p !== false)
  )
  const showPagination = computedOf(
    paginationEnabledSignal,
    ds.groupBy
  )((pag, gb) => pag && gb == null)

  // Hideable column metadata for the menu
  const hideableColumnMeta = hideableColumns.map(c => ({
    id: c.id,
    label: typeof c.header === 'string' ? c.header : c.id,
  }))

  // Helper: build filter content for embedding in the menu
  const buildFilterContent = (col: DataColumnDef<T, C>): TNode | undefined => {
    if (!col.filterable) return undefined
    if (col.filterable === 'panel') {
      return ColumnFilterPanel({
        dataSource: ds,
        column: col.id,
        columnType: col.columnType,
        size,
        embedded: true,
      })
    }
    if (col.filterable === 'select') {
      return html.div(
        attr.class('bc-column-filter-panel'),
        ColumnFilter({
          dataSource: ds,
          column: col.id,
          type: 'select',
          options: col.filterOptions ?? [],
          size,
        })
      )
    }
    if (col.filterable === 'tags') {
      return html.div(
        attr.class('bc-column-filter-panel'),
        ColumnFilter({
          dataSource: ds,
          column: col.id,
          type: 'tags',
          options: col.filterOptions ?? [],
          size,
        })
      )
    }
    // Auto-detect: if filterOptions exist, use select; if number column, use panel
    if (col.filterOptions && col.filterOptions.length > 0) {
      return html.div(
        attr.class('bc-column-filter-panel'),
        ColumnFilter({
          dataSource: ds,
          column: col.id,
          type: 'select',
          options: col.filterOptions,
          size,
        })
      )
    }
    if (col.columnType === 'number') {
      return ColumnFilterPanel({
        dataSource: ds,
        column: col.id,
        columnType: 'number',
        size,
        embedded: true,
      })
    }
    // Default: text filter
    return html.div(
      attr.class('bc-column-filter-panel'),
      ColumnFilter({
        dataSource: ds,
        column: col.id,
        size,
      })
    )
  }

  // Helper: build the column header menu for a column
  const buildColumnMenu = (col: DataColumnDef<T, C>, includeFilter = true): TNode => {
    const columnFilters = ds.getColumnFilters(col.id)
    const hasActiveFilter = columnFilters.map(f => f.length > 0)
    return html.span(
      attr.class('bc-column-header-menu'),
      // Filter active indicator (shown on header, with tooltip describing the filter)
      includeFilter && col.filterable
        ? When(hasActiveFilter, () =>
            html.span(
              attr.class('bc-sortable-header__icon bc-sortable-header__icon--active'),
              Icon({ icon: 'lucide:filter', size }),
              Use(BeatUII18n, t => {
                const messages = (
                  t.value.dataTable as Record<string, unknown>
                ).describeFilter as FilterDescriptionMessages | undefined
                return Tooltip({
                  content: columnFilters.map(filters => {
                    if (filters.length === 0) return ''
                    return filters
                      .map(f =>
                        messages
                          ? describeFilterLocalized(f, messages)
                          : describeFilter(f)
                      )
                      .join(', ')
                  }),
                  showDelay: 300,
                })
              })
            )
          )
        : null,
      Icon({ icon: 'lucide:ellipsis-vertical', size }),
      ColumnHeaderMenu({
        dataSource: ds,
        column: col.id,
        sortable: !!(sortable && col.sortable),
        hideable: col.hideable,
        size,
        onHideColumn: col.hideable
          ? () => toggleColumnVisibility(col.id)
          : undefined,
        hideableColumns: hasColumnVisibility ? hideableColumnMeta : undefined,
        hiddenColumns: hasColumnVisibility ? hiddenColumns : undefined,
        onToggleColumn: hasColumnVisibility ? toggleColumnVisibility : undefined,
        onResetColumns: hasColumnVisibility ? showAllColumns : undefined,
        filterContent: includeFilter ? buildFilterContent(col) : undefined,
        hasActiveFilter: includeFilter ? hasActiveFilter : undefined,
        onClearFilter: includeFilter && col.filterable ? () => ds.removeFilter(col.id) : undefined,
      })
    )
  }

  // Column reorder drag state
  let dragColumnId: C | null = null

  const makeDragHandlers = (colId: C) => {
    if (!reorderableColumns) return {}
    return {
      draggable: true as const,
      onDragStart: (e: DragEvent) => {
        dragColumnId = colId
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', colId)
        }
        const th = e.currentTarget as HTMLElement
        th.classList.add('bc-data-table__header--dragging')
      },
      onDragOver: (e: DragEvent) => {
        if (dragColumnId == null || dragColumnId === colId) return
        e.preventDefault()
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
        const th = e.currentTarget as HTMLElement
        th.classList.add('bc-data-table__header--drag-over')
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault()
        const th = e.currentTarget as HTMLElement
        th.classList.remove('bc-data-table__header--drag-over')
        if (dragColumnId == null || dragColumnId === colId) return
        const order = [...columnOrder.value]
        const fromIdx = order.indexOf(dragColumnId)
        const toIdx = order.indexOf(colId)
        if (fromIdx < 0 || toIdx < 0) return
        order.splice(fromIdx, 1)
        order.splice(toIdx, 0, dragColumnId)
        columnOrder.set(order)
        onColumnOrderChange?.(order)
        dragColumnId = null
      },
      onDragEnd: (e: DragEvent) => {
        dragColumnId = null
        const th = e.currentTarget as HTMLElement
        th.classList.remove('bc-data-table__header--dragging')
        // Clean up any lingering drag-over classes
        th.closest('tr')?.querySelectorAll('.bc-data-table__header--drag-over').forEach(el =>
          el.classList.remove('bc-data-table__header--drag-over')
        )
      },
    }
  }

  // Helper: render a column header cell
  const renderHeaderCell = (col: DataColumnDef<T, C>): TNode => {
    const headerContent =
      typeof col.header === 'string' ? col.header : col.header()
    const menu = buildColumnMenu(col, filterLayout === 'header')
    const drag = makeDragHandlers(col.id)

    if (sortable && col.sortable) {
      return SortableHeader(
        {
          dataSource: ds,
          column: col.id,
          size,
          menu,
          hideInactiveIcon: filterLayout === 'header',
          ...drag,
        },
        headerContent
      )
    }
    // Non-sortable header with menu (only in header mode)
    return html.th(
      drag.draggable ? attr.draggable('true') : null,
      drag.onDragStart ? on.dragstart(drag.onDragStart) : null,
      drag.onDragOver ? on.dragover(drag.onDragOver) : null,
      drag.onDrop ? on.drop(drag.onDrop) : null,
      drag.onDragEnd ? on.dragend(drag.onDragEnd) : null,
      col.width != null ? style.width(col.width) : null,
      col.minWidth != null ? style.minWidth(col.minWidth) : null,
      col.align != null
        ? style.textAlign(Value.map(col.align, (a): string => a))
        : null,
      html.div(
        attr.class('bc-sortable-header__content'),
        html.span(attr.class('bc-sortable-header__label'), headerContent),
        menu != null
          ? html.span(
              attr.class('bc-sortable-header__icons'),
              html.span(
                attr.class('bc-sortable-header__menu'),
                on.click(e => e.stopPropagation()),
                menu
              )
            )
          : null
      )
    )
  }

  // Helper: render a filter cell (used in 'row' layout mode)
  const renderFilterCell = (col: DataColumnDef<T, C>): TNode => {
    const filterType =
      col.filterable === true
        ? 'text'
        : col.filterable === 'text'
          ? 'text'
          : col.filterable === 'select'
            ? 'select'
            : col.filterable === 'panel'
              ? 'panel'
              : col.filterable === 'tags'
                ? 'tags'
                : null
    if (filterType == null) return html.th()

    if (filterType === 'panel') {
      return html.th(
        ColumnFilterPanel({
          dataSource: ds,
          column: col.id,
          columnType: col.columnType,
          size,
        })
      )
    }

    if (filterType === 'tags') {
      return html.th(
        ColumnFilter({
          dataSource: ds,
          column: col.id,
          type: 'tags',
          options: col.filterOptions ?? [],
          size,
        })
      )
    }

    return html.th(
      filterType === 'select'
        ? ColumnFilter({
            dataSource: ds,
            column: col.id,
            type: 'select',
            options: col.filterOptions ?? [],
            size,
          })
        : ColumnFilter({
            dataSource: ds,
            column: col.id,
            size,
          })
    )
  }

  // Helper: render a data cell
  const renderDataCell = (
    col: DataColumnDef<T, C>,
    colIdx: number,
    rowSignal: Value<T>
  ): TNode =>
    html.td(
      col.align != null
        ? style.textAlign(Value.map(col.align, (a): string => a))
        : null,
      col.width != null ? style.width(col.width) : null,
      MapSignal(rowSignal, row => col.cell(row, colIdx))
    )

  const selectionAfter = selectionPosition === 'after'

  // Selection cells — use When() for reactive selectable support
  const selectionHeaderCell = (): TNode =>
    When(selectable, () =>
      html.th(
        attr.class('bc-data-table__selection-cell'),
        SelectAllCheckbox({ dataSource: ds, size })
      )
    )

  const selectionEmptyCell = (): TNode =>
    When(selectable, () => html.th())

  // Header row — uses ForEach so toggling column visibility doesn't
  // destroy existing header cells (which would close open menus).
  const renderHeaderRow = (): TNode =>
    html.tr(
      !selectionAfter ? selectionHeaderCell() : null,
      ForEach(visibleColumns, colSignal =>
        MapSignal(colSignal, col => renderHeaderCell(col))
      ),
      selectionAfter ? selectionHeaderCell() : null
    )

  // Filter row (only shown when filterLayout is 'row')
  const renderFilterRow = (): TNode => {
    if (!hasFilters || filterLayout === 'header') return null
    return MapSignal(visibleColumns, visCols =>
      html.tr(
        attr.class('bc-data-table__filter-row'),
        !selectionAfter ? selectionEmptyCell() : null,
        ...visCols.map(col => renderFilterCell(col)),
        selectionAfter ? selectionEmptyCell() : null
      )
    )
  }

  // Data rows — always track isSelected (harmless when selectable is false)
  const renderBody = (): TNode =>
    ForEach(ds.rows, rowSignal => {
      const id = rowId(rowSignal.value)
      const selectionCell = (): TNode =>
        When(selectable, () =>
          html.td(
            attr.class('bc-data-table__selection-cell'),
            on.click(e => e.stopPropagation()),
            SelectionCheckbox({ dataSource: ds, rowId: id, size })
          )
        )
      const rowClass = computedOf(
        ds.isSelected(id),
        rowClickable
      )((sel, clickable): string => {
        let cls = 'bc-data-table__row'
        if (sel) cls += ' bc-data-table__row--selected'
        if (clickable) cls += ' bc-data-table__row--clickable'
        return cls
      })
      return Fragment(
        OnDispose(() => rowClass.dispose()),
        MapSignal(visibleColumns, visCols =>
          html.tr(
            attr.class(rowClass),
            on.click(() => {
              if (selectOnRowClickSignal.value && selectableSignal.value) {
                ds.toggleSelect(id)
              }
              onRowClick?.(rowSignal.value)
            }),
            !selectionAfter ? selectionCell() : null,
            ...visCols.map((col, colIdx) =>
              renderDataCell(col, colIdx, rowSignal)
            ),
            selectionAfter ? selectionCell() : null
          )
        )
      )
    })

  // Grouped body rendering
  const collapsedGroups = prop<Set<string>>(new Set())

  const renderGroupRow = (row: T): TNode => {
    const id = rowId(row)
    const selectionCell = (): TNode =>
      When(selectable, () =>
        html.td(
          attr.class('bc-data-table__selection-cell'),
          on.click(e => e.stopPropagation()),
          SelectionCheckbox({ dataSource: ds, rowId: id, size })
        )
      )
    const rowClass = computedOf(
      ds.isSelected(id),
      rowClickable
    )((sel, clickable): string => {
      let cls = 'bc-data-table__row'
      if (sel) cls += ' bc-data-table__row--selected'
      if (clickable) cls += ' bc-data-table__row--clickable'
      return cls
    })
    return Fragment(
      OnDispose(() => rowClass.dispose()),
      MapSignal(visibleColumns, visCols =>
        html.tr(
          attr.class(rowClass),
          on.click(() => {
            if (selectOnRowClickSignal.value && selectableSignal.value) {
              ds.toggleSelect(id)
            }
            onRowClick?.(row)
          }),
          !selectionAfter ? selectionCell() : null,
          ...visCols.map((col, colIdx) =>
            html.td(
              col.align != null
                ? style.textAlign(Value.map(col.align, (a): string => a))
                : null,
              col.width != null ? style.width(col.width) : null,
              col.cell(row, colIdx)
            )
          ),
          selectionAfter ? selectionCell() : null
        )
      )
    )
  }

  const renderGroupedBody = (): TNode => {
    const groupColSpan = computedOf(
      visibleColumns,
      selectableSignal
    )((visCols, sel) => visCols.length + (sel ? 1 : 0))

    return Fragment(
      OnDispose(() => groupColSpan.dispose()),
      MapSignal(ds.groups, groups => Fragment(
        ...groups.map(group => {
          const isCollapsed = collapsedGroups.map(s => s.has(group.key))
          const toggleCollapse = () => {
            const next = new Set(collapsedGroups.value)
            if (next.has(group.key)) {
              next.delete(group.key)
            } else {
              next.add(group.key)
            }
            collapsedGroups.set(next)
          }
          return Fragment(
            OnDispose(() => isCollapsed.dispose()),
            Use(BeatUII18n, t =>
              html.tr(
                attr.class('bc-data-table__group-header'),
                on.click(() => {
                  if (groupCollapsible) toggleCollapse()
                }),
                html.td(
                  attr.colspan(groupColSpan),
                  html.div(
                    attr.class('bc-data-table__group-header-content'),
                    groupCollapsible
                      ? html.span(
                          attr.class(
                            isCollapsed.map((c): string =>
                              c
                                ? 'bc-data-table__group-toggle bc-data-table__group-toggle--collapsed'
                                : 'bc-data-table__group-toggle'
                            )
                          ),
                          aria.label(
                            isCollapsed.map((c): string => {
                              const dt = t.value.dataTable as Record<string, unknown>
                              return c
                                ? ((dt.expandGroup as string) ?? 'Expand group')
                                : ((dt.collapseGroup as string) ?? 'Collapse group')
                            })
                          ),
                          Icon({ icon: 'lucide:chevron-down', size: 'sm' })
                        )
                      : null,
                    html.span(
                      attr.class('bc-data-table__group-label'),
                      group.key
                    ),
                    html.span(
                      attr.class('bc-data-table__group-count'),
                      (() => {
                        const fn = (
                          t.value.dataTable as Record<string, unknown>
                        ).groupCount as ((count: number) => string) | undefined
                        return fn ? fn(group.rows.length) : `(${group.rows.length})`
                      })()
                    ),
                    // Inline aggregation summary when collapsed
                    hasAggregation
                      ? When(
                          computedOf(isCollapsed, Value.toSignal(showAggregation))(
                            (c, agg) => c && agg
                          ),
                          () =>
                            html.span(
                              attr.class('bc-data-table__group-aggregation-summary'),
                              computeGroupAggSummary(group.rows, t)
                            )
                        )
                      : null
                  )
                )
              )
            ),
            When(
              isCollapsed.map(c => !c),
              () =>
                Fragment(
                  ...group.rows.map(row => renderGroupRow(row)),
                  // Per-group aggregation row
                  hasAggregation
                    ? When(showAggregation, () =>
                        Use(BeatUII18n, t =>
                          MapSignal(visibleColumns, visCols =>
                            html.tr(
                              attr.class(
                                'bc-data-table__aggregation-row bc-data-table__group-aggregation-row'
                              ),
                              When(selectable, () => html.td()),
                              ...visCols.map(col => {
                                if (!col.aggregation) return html.td()
                                const { fn, format, label } = col.aggregation
                                const accessor =
                                  col.accessor ??
                                  ((row: T) =>
                                    (row as Record<string, unknown>)[col.id])
                                const values = group.rows.map(row => accessor(row))
                                const result = computeAggregation(values, fn)
                                const formatted = format
                                  ? format(result)
                                  : String(result)
                                const defaultLabel = (
                                  t.value.dataTable as Record<string, unknown>
                                )[aggLabelMap[fn]] as string | undefined
                                const displayLabel =
                                  label ?? defaultLabel ?? fn
                                return html.td(
                                  col.align != null
                                    ? style.textAlign(
                                        Value.map(
                                          col.align,
                                          (a): string => a
                                        )
                                      )
                                    : null,
                                  `${displayLabel}: ${formatted}`
                                )
                              })
                            )
                          )
                        )
                      )
                    : null
                )
            )
          )
        })
      ))
    )
  }

  // Empty state
  const renderEmpty = (): TNode =>
    When(
      ds.rows.map(r => r.length === 0),
      () =>
        Use(BeatUII18n, t =>
          MapSignal(visibleColumns, visCols =>
            html.tr(
              html.td(
                attr.colspan(
                  Value.map(selectable, (sel): number =>
                    visCols.length + (sel ? 1 : 0)
                  )
                ),
                attr.class('bc-data-table__empty'),
                emptyContent ?? t.$.dataTable.map(dt => dt.noResults)
              )
            )
          )
        )
    )

  // Column visibility toggle
  const renderColumnToggle = (): TNode => {
    if (!hasColumnVisibility) return null
    const hasHiddenColumns = hiddenColumns.map(h => h.size > 0)
    return Use(BeatUII18n, t =>
      html.div(
        attr.class('bc-data-table__column-toggle'),
        html.button(
          attr.type('button'),
          attr.class(
            hasHiddenColumns.map((h): string =>
              h
                ? 'bc-data-table__column-toggle-btn bc-data-table__column-toggle-btn--active'
                : 'bc-data-table__column-toggle-btn'
            )
          ),
          Icon({ icon: 'lucide:columns-3', size }),
          html.span(
            attr.class('bc-data-table__column-toggle-label'),
            t.$.dataTable.map(dt => dt.columnVisibility)
          ),
          Flyout({
            content: () =>
              html.div(
                attr.class('bc-data-table__column-toggle-panel'),
                on.click(e => e.stopPropagation()),
                ...hideableColumns.map(col =>
                  CheckboxInput({
                    value: hiddenColumns.map(h => !h.has(col.id)),
                    onChange: () => toggleColumnVisibility(col.id),
                    placeholder:
                      typeof col.header === 'string'
                        ? col.header
                        : col.id,
                    size: 'sm',
                  })
                ),
                When(hasHiddenColumns, () =>
                  Button(
                    {
                      size: 'xs',
                      variant: 'outline',
                      onClick: () => showAllColumns(),
                    },
                    t.$.dataTable.map(dt => dt.showAllColumns)
                  )
                )
              ),
            placement: 'bottom-end',
            showOn: 'click',
            showDelay: 0,
            hideDelay: 0,
          })
        )
      )
    )
  }

  // Loading overlay
  const renderLoading = (): TNode =>
    When(loading, () =>
      Use(BeatUII18n, t =>
        html.div(
          attr.class('bc-data-table__loading'),
          t.$.dataTable.map(dt => dt.loading)
        )
      )
    )

  // Aggregation labels
  const aggLabelMap: Record<AggregationFunction, string> = {
    sum: 'aggregationSum',
    count: 'aggregationCount',
    avg: 'aggregationAvg',
    min: 'aggregationMin',
    max: 'aggregationMax',
  }

  const hasAggregation = columns.some(c => c.aggregation != null)
  const aggColumns = columns.filter(c => c.aggregation != null)

  /** Compute a compact aggregation summary string for a set of rows. */
  const computeGroupAggSummary = (
    rows: T[],
    t: { value: { dataTable: unknown } }
  ): string => {
    const dt = t.value.dataTable as Record<string, unknown>
    return aggColumns
      .map(col => {
        const { fn, format, label } = col.aggregation!
        const accessor =
          col.accessor ?? ((row: T) => (row as Record<string, unknown>)[col.id])
        const values = rows.map(row => accessor(row))
        const result = computeAggregation(values, fn)
        const formatted = format ? format(result) : String(result)
        const defaultLabel = dt[aggLabelMap[fn]] as string | undefined
        const displayLabel = label ?? defaultLabel ?? fn
        return `${displayLabel}: ${formatted}`
      })
      .join('  ·  ')
  }

  // Row count signal — created here so it can be properly disposed
  const rowCounts = computedOf(ds.totalFilteredRows, ds.totalRows)(
    (filtered, total) => ({ filtered, total })
  )

  // Aggregation footer
  const renderAggregationFooter = (): TNode => {
    if (!hasAggregation) return null
    return When(showAggregation, () =>
      Use(BeatUII18n, t =>
        MapSignal(visibleColumns, visCols =>
          html.tr(
            attr.class('bc-data-table__aggregation-row'),
            When(selectable, () => html.td()),
            ...visCols.map(col => {
              if (!col.aggregation) return html.td()
              const { fn, format, label } = col.aggregation
              const accessor = col.accessor ?? ((row: T) => (row as Record<string, unknown>)[col.id])
              return html.td(
                col.align != null
                  ? style.textAlign(Value.map(col.align, (a): string => a))
                  : null,
                MapSignal(ds.allFilteredRows, rows => {
                  const values = rows.map(row => accessor(row))
                  const result = computeAggregation(values, fn)
                  const formatted = format ? format(result) : String(result)
                  const defaultLabel = (
                    t.value.dataTable as Record<string, unknown>
                  )[aggLabelMap[fn]] as string | undefined
                  const displayLabel = label ?? defaultLabel ?? fn
                  return `${displayLabel}: ${formatted}`
                })
              )
            })
          )
        )
      )
    )
  }

  return Fragment(
    OnDispose(() => {
      ds.dispose()
      hiddenColumns.dispose()
      visibleColumns.dispose()
      columnOrder.dispose()
      collapsedGroups.dispose()
      hoverableSignal.dispose()
      selectOnRowClickSignal.dispose()
      selectableSignal.dispose()
      effectiveHoverable.dispose()
      rowClickable.dispose()
      paginationEnabledSignal.dispose()
      showPagination.dispose()
      toolbarConfigSignal.dispose()
      rowCounts.dispose()
    }),

    // Column visibility toggle (only in row mode; in header mode it's in the menu)
    filterLayout !== 'header' ? renderColumnToggle() : null,

    // Toolbar
    MapSignal(toolbarConfigSignal, tc => {
      if (tc === false) return null
      return DataToolbar({
        dataSource: ds,
        showSort: tc.showSort ?? true,
        showFilters: tc.showFilters ?? true,
        showSelection: tc.showSelection ?? true,
        bulkActions: tc.bulkActions ?? [],
      })
    }),

    // Table with loading overlay
    html.div(
      attr.class('bc-data-table__wrapper'),
      renderLoading(),
      Table(
        {
          size,
          hoverable: effectiveHoverable,
          stickyHeader,
          fullWidth,
          withStripedRows,
          withTableBorder,
          withColumnBorders,
          withRowBorders,
        },
        html.thead(renderHeaderRow(), renderFilterRow()),
        html.tbody(
          When(
            ds.groupBy.map(g => g != null),
            () => Fragment(renderGroupedBody(), renderEmpty()),
            () => Fragment(renderBody(), renderEmpty())
          )
        ),
        html.tfoot(renderAggregationFooter())
      )
    ),

    // Pagination (hidden when groupBy is active)
    When(
      showPagination,
      () =>
        html.div(
          attr.class('bc-data-table__pagination'),
          Pagination({
            currentPage: ds.currentPage,
            totalPages: ds.totalPages,
            onPageChange: page => ds.setPage(page),
            siblings: Value.map(paginationConfig, p =>
              p === false ? 1 : (p.siblings ?? 1)
            ),
            showFirstLast: Value.map(paginationConfig, p =>
              p === false ? false : (p.showFirstLast ?? false)
            ),
            showPrevNext: true,
            size,
            responsive: Value.map(paginationConfig, p =>
              p === false ? false : (p.responsive ?? false)
            ),
          })
        )
    ),

    // Row count footer
    Use(BeatUII18n, t =>
      html.div(
        attr.class('bc-data-table__row-count'),
        MapSignal(rowCounts, ({ filtered, total }) => {
          const fn = (
            t.value.dataTable as Record<string, unknown>
          ).rowCount as ((f: number, t: number) => string) | undefined
          return fn ? fn(filtered, total) : `Rows: ${filtered}  Total Rows: ${total}`
        })
      )
    )
  )
}
