import {
  attr,
  computedOf,
  Fragment,
  html,
  MapSignal,
  OnDispose,
  TNode,
  Use,
  Value,
  When,
} from '@tempots/dom'
import { BeatUII18n } from '../../beatui-i18n'
import { DataTableOptions } from './data-table-types'
import { Table } from './table'
import { Pagination } from '../navigation/pagination'
import { DataToolbar } from './data-toolbar'
import { createDataTableContext } from './data-table-context'
import { renderHeaderRow, renderFilterRow } from './data-table-header'
import {
  renderBody,
  renderGroupedBody,
  renderEmpty,
  renderFooter,
  renderLoading,
} from './data-table-body'
import { renderColumnToggle } from './data-table-column-toggle'

/**
 * A full-featured data table component built by composing headless {@link DataSource}
 * state management with composable UI primitives and the existing {@link Table}
 * and {@link Pagination} components.
 *
 * Supports column-level sorting, filtering, row selection, pagination, bulk actions,
 * and server-side mode. Each feature is opt-in and configurable per column.
 *
 * When `stickyHeader` is enabled, the DataTable renders inside a flex column
 * container where the toolbar and pagination are pinned (top and bottom
 * respectively) and only the table body scrolls. The container fills its
 * parent's height — the parent must provide a height constraint (explicit
 * height, flex layout, grid layout, etc.).
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
 *     { id: 'name', header: 'Name', cell: row => Value.map(row, r => r.name),
 *       sortable: true, filter: true },
 *     { id: 'email', header: 'Email', cell: row => Value.map(row, r => r.email),
 *       sortable: true },
 *     { id: 'role', header: 'Role', cell: row => Value.map(row, r => r.role),
 *       filter: { type: 'select', options: [
 *         { value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }
 *       ] } },
 *   ],
 *   rowId: u => u.id,
 *   sortable: 'multi',
 *   filterable: 'header',
 *   selectable: { position: 'before', selectOnRowClick: true },
 *   pagination: { pageSize: 20 },
 *   toolbar: { bulkActions: [{ label: 'Delete', onClick: sel => deleteUsers(sel) }] },
 *   stickyHeader: true,
 *   fullWidth: true,
 * })
 * ```
 */
export function DataTable<T, C extends string = string>(
  options: DataTableOptions<T, C>
) {
  const {
    size = 'md',
    stickyHeader = false,
    fullWidth = false,
    withStripedRows = false,
    withTableBorder = true,
    withColumnBorders = false,
    withRowBorders = true,
  } = options

  const ctx = createDataTableContext(options)

  // Row count signal — created here so it can be properly disposed
  const rowCounts = computedOf(
    ctx.ds.totalFilteredRows,
    ctx.ds.totalRows
  )((filtered, total) => ({ filtered, total }))

  const columnToggle = renderColumnToggle(ctx)

  const toolbar: TNode = MapSignal(ctx.toolbarConfig, tc => {
    if (tc === false) return null
    return DataToolbar({
      dataSource: ctx.ds,
      showSort: tc.showSort ?? true,
      showFilters: tc.showFilters ?? true,
      showSelection: tc.showSelection ?? true,
      bulkActions: tc.bulkActions ?? [],
    })
  })

  const tableWrapper = html.div(
    attr.class('bc-data-table__wrapper'),
    renderLoading(ctx),
    Table(
      {
        size,
        hoverable: ctx.effectiveHoverable,
        stickyHeader,
        fullWidth,
        withStripedRows,
        withTableBorder,
        withColumnBorders,
        withRowBorders,
      },
      html.thead(renderHeaderRow(ctx), renderFilterRow(ctx)),
      html.tbody(
        When(
          ctx.ds.groupBy.map(g => g != null),
          () => Fragment(renderGroupedBody(ctx), renderEmpty(ctx)),
          () => Fragment(renderBody(ctx), renderEmpty(ctx))
        )
      ),
      html.tfoot(renderFooter(ctx))
    )
  )

  const pagination: TNode = When(ctx.showPagination, () =>
    html.div(
      attr.class('bc-data-table__pagination'),
      Use(BeatUII18n, t =>
        html.div(
          attr.class('bc-data-table__row-count'),
          computedOf(
            ctx.pageSizeSignal,
            ctx.effectiveCurrentPage,
            rowCounts.$.filtered,
            rowCounts.$.total
          )((pageSize, page, filtered, total) => {
            const from = (page - 1) * pageSize + 1
            const to = Math.min(page * pageSize, filtered)
            return t.value.paginationRange(from, to, filtered, total)
          })
        )
      ),
      Pagination({
        currentPage: ctx.effectiveCurrentPage,
        totalPages: ctx.effectiveTotalPages,
        onChange: page => ctx.setEffectivePage(page),
        siblings: Value.map(ctx.paginationConfig, p =>
          p === false ? 1 : (p.siblings ?? 1)
        ),
        showFirstLast: Value.map(ctx.paginationConfig, p =>
          p === false ? false : (p.showFirstLast ?? false)
        ),
        showPrevNext: true,
        size,
        responsive: Value.map(ctx.paginationConfig, p =>
          p === false ? false : (p.responsive ?? false)
        ),
      })
    )
  )

  const content = Fragment(columnToggle, toolbar, tableWrapper, pagination)

  const sticky = Value.get(stickyHeader)

  if (sticky) {
    return html.div(
      attr.class('bc-data-table'),
      OnDispose(() => {
        ctx.dispose()
        rowCounts.dispose()
      }),
      content
    )
  }

  return Fragment(
    OnDispose(() => {
      ctx.dispose()
      rowCounts.dispose()
    }),
    content
  )
}
