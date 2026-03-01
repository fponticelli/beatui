import {
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
import { createDataSource, DataSource, BulkAction } from './data-source'
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
import { Flyout } from '../navigation/flyout'
import { CheckboxInput } from '../form/input/checkbox-input'
import { Icon } from './icon'
import { Button } from '../button/button'

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
    selectable = false,
    selectionPosition = 'before',
    selectOnRowClick = false,
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
    emptyContent,
    columnVisibility: columnVisibilityOpt,
    onDataSource,
  } = options

  const paginationConfig = Value.map(paginationOpt ?? false, o =>
    resolvePaginationOptions(o ?? false)
  )
  const toolbarConfig = Value.map(toolbarOpt ?? false, resolveToolbarOptions)

  // Column visibility state
  const hideableColumns = columns.filter(c => c.hideable)
  const hasColumnVisibility = columnVisibilityOpt != null && hideableColumns.length > 0
  const hiddenColumns = prop<Set<string>>(
    new Set(columnVisibilityOpt?.defaultHidden ?? [])
  )
  const visibleColumns = hiddenColumns.map(hidden =>
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
    pageSize: Value.map(paginationConfig, p =>
      p === false ? 10 : (p?.pageSize ?? 10)
    ),
    multiSort,
    serverSide,
    onSortChange,
    onFilterChange,
    onPageChange: undefined,
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

  // Helper: render a column header cell
  const renderHeaderCell = (col: DataColumnDef<T, C>): TNode => {
    const headerContent =
      typeof col.header === 'string' ? col.header : col.header()
    const panelInHeader =
      col.filterable === 'panel' && col.filterPosition === 'header'

    if (sortable && col.sortable) {
      return SortableHeader(
        {
          dataSource: ds,
          column: col.id,
          size,
          actions: panelInHeader
            ? ColumnFilterPanel({
                dataSource: ds,
                column: col.id,
                columnType: col.columnType,
                size,
              })
            : undefined,
        },
        headerContent
      )
    }
    if (panelInHeader) {
      return html.th(
        col.width != null ? style.width(col.width) : null,
        col.minWidth != null ? style.minWidth(col.minWidth) : null,
        col.align != null
          ? style.textAlign(Value.map(col.align, (a): string => a))
          : null,
        html.div(
          attr.class('bc-sortable-header__content'),
          html.span(attr.class('bc-sortable-header__label'), headerContent),
          html.span(
            attr.class('bc-sortable-header__icons'),
            ColumnFilterPanel({
              dataSource: ds,
              column: col.id,
              columnType: col.columnType,
              size,
            })
          )
        )
      )
    }
    return html.th(
      col.width != null ? style.width(col.width) : null,
      col.minWidth != null ? style.minWidth(col.minWidth) : null,
      col.align != null
        ? style.textAlign(Value.map(col.align, (a): string => a))
        : null,
      headerContent
    )
  }

  // Helper: render a filter cell
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
              : null
    if (filterType == null) return html.th()

    if (filterType === 'panel') {
      if (col.filterPosition === 'header') return html.th()
      return html.th(
        ColumnFilterPanel({
          dataSource: ds,
          column: col.id,
          columnType: col.columnType,
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

  // Header row
  const renderHeaderRow = (): TNode =>
    MapSignal(visibleColumns, visCols =>
      html.tr(
        !selectionAfter ? selectionHeaderCell() : null,
        ...visCols.map(col => renderHeaderCell(col)),
        selectionAfter ? selectionHeaderCell() : null
      )
    )

  // Filter row
  const renderFilterRow = (): TNode => {
    if (!hasFilters) return null
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
      return MapSignal(visibleColumns, visCols =>
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
    })

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

  return Fragment(
    OnDispose(() => {
      ds.dispose()
      hiddenColumns.dispose()
      visibleColumns.dispose()
      hoverableSignal.dispose()
      selectOnRowClickSignal.dispose()
      selectableSignal.dispose()
      effectiveHoverable.dispose()
      rowClickable.dispose()
    }),

    // Column visibility toggle
    renderColumnToggle(),

    // Toolbar
    When(
      Value.map(toolbarConfig, t => t !== false),
      () =>
        DataToolbar({
          dataSource: ds,
          showSort: Value.map(toolbarConfig, t =>
            t === false ? false : (t.showSort ?? true)
          ),
          showFilters: Value.map(toolbarConfig, t =>
            t === false ? false : (t.showFilters ?? true)
          ),
          showSelection: Value.map(toolbarConfig, t =>
            t === false ? false : (t.showSelection ?? true)
          ),
          bulkActions: Value.map(toolbarConfig, t =>
            t === false ? undefined : t.bulkActions
          ) as unknown as BulkAction[],
        })
    ),

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
        html.tbody(renderBody(), renderEmpty())
      )
    ),

    // Pagination
    When(
      Value.map(paginationConfig, p => p !== false),
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
    )
  )
}
