import {
  attr,
  computedOf,
  ForEach,
  html,
  MapSignal,
  on,
  Signal,
  style,
  TNode,
  Value,
  When,
  Use,
} from '@tempots/dom'
import { BeatUII18n } from '../../beatui-i18n'
import { DataTableContext } from './data-table-context'
import { DataColumnDef } from './data-table-types'
import {
  getFilterConfig,
  colHasFilter,
  resolveFilterContent,
  resolveFilterCell,
} from './data-table-resolve'
import { SortableHeader } from './sortable-header'
import { ColumnHeaderMenu } from './column-header-menu'
import { SelectAllCheckbox } from './selection-checkbox'
import { Flyout } from '../navigation/flyout'
import { Icon } from './icon'
import { Tooltip } from '../overlay/tooltip'
import { describeFilterLocalized } from './filter'

/** Build filter content for embedding in the column header menu. */
function buildFilterContent<T, C extends string>(
  col: DataColumnDef<T, C>,
  ctx: DataTableContext<T, C>
): TNode | undefined {
  if (!colHasFilter(col)) return undefined
  const config = getFilterConfig(col)
  return resolveFilterContent(config, ctx.ds, col.id, ctx.size) ?? undefined
}

/** Build the column header menu for a column. */
function buildColumnMenu<T, C extends string>(
  col: DataColumnDef<T, C>,
  includeFilter: boolean,
  ctx: DataTableContext<T, C>
): TNode {
  const columnFilters = ctx.ds.getColumnFilters(col.id)
  const hasActiveFilter = columnFilters.map(f => f.length > 0)
  const colSortable =
    col.sortable != null
      ? typeof col.sortable === 'boolean'
        ? col.sortable
        : col.sortable.value
      : false
  const colHideable =
    col.hideable != null
      ? typeof col.hideable === 'boolean'
        ? col.hideable
        : col.hideable.value
      : false
  const hasFilter = colHasFilter(col)
  return html.span(
    attr.class('bc-column-header-menu'),
    includeFilter && hasFilter
      ? When(hasActiveFilter, () =>
          html.span(
            attr.class(
              'bc-sortable-header__icon bc-sortable-header__icon--active'
            ),
            on.click(e => e.stopPropagation()),
            Icon({ icon: 'lucide:filter', size: ctx.size }),
            Flyout({
              content: () =>
                html.div(
                  attr.class('bc-column-filter-panel'),
                  on.click(e => e.stopPropagation()),
                  buildFilterContent(col, ctx) ?? null
                ),
              placement: 'bottom-end',
              showOn: 'click',
              showDelay: 0,
              hideDelay: 0,
            }),
            Use(BeatUII18n, t => {
              const trans = computedOf(
                t.$.dataTable.$.describeFilter,
                columnFilters
              )((describe, filters) => {
                return filters
                  .map(v => describeFilterLocalized(v, describe))
                  .join(', ')
              })
              return Tooltip({
                content: trans,
                showDelay: 300,
              })
            })
          )
        )
      : null,
    Icon({ icon: 'lucide:ellipsis-vertical', size: ctx.size }),
    ColumnHeaderMenu({
      dataSource: ctx.ds,
      column: col.id,
      sortable: !!(ctx.sortable && colSortable),
      hideable: colHideable,
      size: ctx.size,
      onHideColumn: colHideable
        ? () => ctx.toggleColumnVisibility(col.id)
        : undefined,
      filterContent: includeFilter ? buildFilterContent(col, ctx) : undefined,
      hasActiveFilter: includeFilter ? hasActiveFilter : undefined,
      onClearFilter:
        includeFilter && hasFilter
          ? () => ctx.ds.removeFilter(col.id)
          : undefined,
    })
  )
}

/** Create drag handlers for column reordering. */
function makeDragHandlers<T, C extends string>(
  colId: C,
  ctx: DataTableContext<T, C>
) {
  if (!ctx.reorderableColumns) return {}
  return {
    draggable: true as const,
    onDragStart: (e: DragEvent) => {
      ctx.dragState.columnId = colId
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', colId)
      }
      const th = e.currentTarget as HTMLElement
      th.classList.add('bc-data-table__header--dragging')
    },
    onDragOver: (e: DragEvent) => {
      if (ctx.dragState.columnId == null || ctx.dragState.columnId === colId)
        return
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
      const th = e.currentTarget as HTMLElement
      th.classList.add('bc-data-table__header--drag-over')
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      const th = e.currentTarget as HTMLElement
      th.classList.remove('bc-data-table__header--drag-over')
      if (ctx.dragState.columnId == null || ctx.dragState.columnId === colId)
        return
      const order = [...ctx.columnOrder.value]
      const fromIdx = order.indexOf(ctx.dragState.columnId)
      const toIdx = order.indexOf(colId)
      if (fromIdx < 0 || toIdx < 0) return
      order.splice(fromIdx, 1)
      order.splice(toIdx, 0, ctx.dragState.columnId)
      ctx.columnOrder.set(order)
      ctx.onColumnOrderChange?.(order)
      ctx.dragState.columnId = null
    },
    onDragEnd: (e: DragEvent) => {
      ctx.dragState.columnId = null
      const th = e.currentTarget as HTMLElement
      th.classList.remove('bc-data-table__header--dragging')
      th.closest('tr')
        ?.querySelectorAll('.bc-data-table__header--drag-over')
        .forEach(el =>
          el.classList.remove('bc-data-table__header--drag-over')
        )
    },
  }
}

/** Render a single column header cell. */
function renderHeaderCell<T, C extends string>(
  colId: Signal<C>,
  ctx: DataTableContext<T, C>
): TNode {
  return MapSignal(colId, id => {
    const col = ctx.getCol(id)
    const headerContent =
      typeof col.header === 'string' ? col.header : col.header()
    const menu = buildColumnMenu(col, ctx.filterLayout === 'header', ctx)
    const drag = makeDragHandlers(col.id, ctx)

    const colSortable =
      col.sortable != null
        ? typeof col.sortable === 'boolean'
          ? col.sortable
          : col.sortable.value
        : false

    if (ctx.sortable && colSortable) {
      return SortableHeader(
        {
          dataSource: ctx.ds,
          column: col.id,
          size: ctx.size,
          menu,
          hideInactiveIcon: ctx.filterLayout === 'header',
          ...drag,
        },
        headerContent
      )
    }
    return html.th(
      drag.draggable ? attr.draggable('true') : null,
      drag.onDragStart ? on.dragstart(drag.onDragStart) : null,
      drag.onDragOver ? on.dragover(drag.onDragOver) : null,
      drag.onDrop ? on.drop(drag.onDrop) : null,
      drag.onDragEnd ? on.dragend(drag.onDragEnd) : null,
      col.width != null ? style.width(col.width) : null,
      col.minWidth != null ? style.minWidth(col.minWidth) : null,
      col.maxWidth != null ? style.maxWidth(col.maxWidth) : null,
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
  })
}

/** Render a single filter cell. */
function renderFilterCellItem<T, C extends string>(
  colId: Signal<C>,
  ctx: DataTableContext<T, C>
): TNode {
  return MapSignal(colId, id => {
    const col = ctx.getCol(id)
    const config = getFilterConfig(col)
    return resolveFilterCell(config, ctx.ds, id, ctx.size)
  })
}

function selectionHeaderCell<T, C extends string>(
  ctx: DataTableContext<T, C>
): TNode {
  return When(ctx.selectable, () =>
    html.th(
      attr.class('bc-data-table__selection-header'),
      html.div(
        attr.class('bc-data-table__selection-cell'),
        SelectAllCheckbox({
          dataSource: ctx.ds,
          size: ctx.size,
        })
      )
    )
  )
}

function selectionEmptyCell<T, C extends string>(
  ctx: DataTableContext<T, C>
): TNode {
  return When(ctx.selectable, () => html.th())
}

/** Render the header row. */
export function renderHeaderRow<T, C extends string>(
  ctx: DataTableContext<T, C>
): TNode {
  return html.tr(
    !ctx.selectionAfter ? selectionHeaderCell(ctx) : null,
    ForEach(ctx.visibleColumns, colIdSignal =>
      renderHeaderCell(colIdSignal, ctx)
    ),
    ctx.selectionAfter ? selectionHeaderCell(ctx) : null
  )
}

/** Render the filter row (only when filterLayout is 'row'). */
export function renderFilterRow<T, C extends string>(
  ctx: DataTableContext<T, C>
): TNode {
  if (!ctx.hasFilters || ctx.filterLayout === 'header') return null
  return html.tr(
    attr.class('bc-data-table__filter-row'),
    !ctx.selectionAfter ? selectionEmptyCell(ctx) : null,
    ForEach(ctx.visibleColumns, colIdSignal =>
      renderFilterCellItem(colIdSignal, ctx)
    ),
    ctx.selectionAfter ? selectionEmptyCell(ctx) : null
  )
}
