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
  Signal,
  style,
  TNode,
  Value,
  When,
  Use,
} from '@tempots/dom'
import { BeatUII18n } from '../../beatui-i18n'
import { DataTableContext } from './data-table-context'
import { SelectionCheckbox } from './selection-checkbox'
import { LoadingOverlay } from '../misc/loading-overlay'
import { Icon } from './icon'

/** Render a single data cell. */
function renderDataCell<T, C extends string>(
  colId: Signal<C>,
  colIdx: number,
  rowSignal: Signal<T>,
  ctx: DataTableContext<T, C>
): TNode {
  return MapSignal(colId, id => {
    const col = ctx.getCol(id)
    return html.td(
      col.align != null
        ? style.textAlign(Value.map(col.align, (a): string => a))
        : null,
      col.width != null ? style.width(col.width) : null,
      col.maxWidth != null ? style.maxWidth(col.maxWidth) : null,
      col.cell(rowSignal, colIdx)
    )
  })
}

/** Render non-grouped data rows. */
export function renderBody<T, C extends string>(
  ctx: DataTableContext<T, C>
): TNode {
  return ForEach(ctx.ds.rows, rowSignal => {
    const id = rowSignal.map(ctx.rowId)
    const isSelected = computedOf(
      id,
      ctx.ds.selected
    )((id, selected) => {
      return selected.has(id)
    })
    const selectionCell = (): TNode =>
      When(ctx.selectable, () =>
        html.td(
          on.click(e => e.stopPropagation()),
          html.div(
            attr.class('bc-data-table__selection-cell'),
            SelectionCheckbox({
              dataSource: ctx.ds,
              rowId: id,
              isSelected,
              size: ctx.size,
            })
          )
        )
      )
    const rowClass = computedOf(
      isSelected,
      ctx.rowClickable
    )((sel, clickable): string => {
      let cls = 'bc-data-table__row'
      if (sel) cls += ' bc-data-table__row--selected'
      if (clickable) cls += ' bc-data-table__row--clickable'
      return cls
    })
    // All signals (id, isSelected, rowClass) are auto-disposed by ForEach scope
    return html.tr(
      attr.class(rowClass),
      on.click(() => {
        if (ctx.selectOnRowClickSignal.value && ctx.selectableSignal.value) {
          ctx.ds.toggleSelect(id.value)
        }
        ctx.onRowClick?.(rowSignal.value)
      }),
      When(
        Value.map(ctx.selectionAfter, v => !v),
        () => selectionCell()
      ),
      ForEach(ctx.visibleColumns, (colIdSignal, position) =>
        renderDataCell(colIdSignal, position.index, rowSignal, ctx)
      ),
      When(ctx.selectionAfter, () => selectionCell())
    )
  })
}

/** Render a single row within grouped data. */
function renderGroupRow<T, C extends string>(
  row: T,
  ctx: DataTableContext<T, C>
): TNode {
  const id = ctx.rowId(row)
  const isSelected = computedOf(
    id,
    ctx.ds.selected
  )((id, selected) => selected.has(id))
  const rowSignal = Value.toSignal(row)
  const selectionCell = (): TNode =>
    When(ctx.selectable, () =>
      html.td(
        on.click(e => e.stopPropagation()),
        html.div(
          attr.class('bc-data-table__selection-cell'),
          SelectionCheckbox({
            dataSource: ctx.ds,
            rowId: id,
            isSelected,
            size: ctx.size,
          })
        )
      )
    )
  const rowClass = computedOf(
    isSelected,
    ctx.rowClickable
  )((sel, clickable): string => {
    let cls = 'bc-data-table__row'
    if (sel) cls += ' bc-data-table__row--selected'
    if (clickable) cls += ' bc-data-table__row--clickable'
    return cls
  })
  // All signals (isSelected, rowClass, rowSignal) auto-disposed by When scope
  return html.tr(
    attr.class(rowClass),
    on.click(() => {
      if (ctx.selectOnRowClickSignal.value && ctx.selectableSignal.value) {
        ctx.ds.toggleSelect(id)
      }
      ctx.onRowClick?.(row)
    }),
    When(
      Value.map(ctx.selectionAfter, v => !v),
      () => selectionCell()
    ),
    ForEach(ctx.visibleColumns, (colIdSignal, position) =>
      renderDataCell(colIdSignal, position.index, rowSignal, ctx)
    ),
    When(ctx.selectionAfter, () => selectionCell())
  )
}

/** Render grouped body with collapse, footers, and group headers. */
export function renderGroupedBody<T, C extends string>(
  ctx: DataTableContext<T, C>
): TNode {
  const groupColSpan = computedOf(
    ctx.visibleColumns,
    ctx.selectableSignal
  )((ids, sel) => ids.length + (sel ? 1 : 0))

  const collapsedGroupColSpan = computedOf(
    ctx.visibleColumns,
    ctx.selectableSignal
  )((ids, sel) => {
    const firstTot = ids.findIndex(id => ctx.getCol(id).footer != null)
    if (firstTot < 0) return ids.length + (sel ? 1 : 0)
    return firstTot + (sel ? 1 : 0)
  })

  const hasFooter = ctx.hasFooter

  return MapSignal(ctx.currentGroupPageGroups, groups =>
    Fragment(
      ...groups.map(group => {
        const isCollapsed = ctx.collapsedGroups.map(s => s.has(group.key))
        const toggleCollapse = () => {
          const next = new Set(ctx.collapsedGroups.value)
          if (next.has(group.key)) {
            next.delete(group.key)
          } else {
            next.add(group.key)
          }
          ctx.collapsedGroups.set(next)
        }
        return Fragment(
          Use(BeatUII18n, t =>
            html.tr(
              attr.class('bc-data-table__group-header'),
              on.click(() => {
                if (ctx.groupCollapsible) toggleCollapse()
              }),
              html.td(
                When(
                  isCollapsed,
                  () => attr.colspan(collapsedGroupColSpan),
                  () => attr.colspan(groupColSpan)
                ),
                html.div(
                  attr.class('bc-data-table__group-header-content'),
                  ctx.groupCollapsible
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
                            const dt = t.value.dataTable as Record<
                              string,
                              unknown
                            >
                            return c
                              ? ((dt.expandGroup as string) ?? 'Expand group')
                              : ((dt.collapseGroup as string) ??
                                  'Collapse group')
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
                      const fn = (t.value.dataTable as Record<string, unknown>)
                        .groupCount as ((count: number) => string) | undefined
                      return fn
                        ? fn(group.rows.length)
                        : `(${group.rows.length})`
                    })()
                  ),
                  // Inline summary when collapsed
                  ctx.groupSummary != null
                    ? When(isCollapsed, () =>
                        html.span(
                          attr.class('bc-data-table__group-footer-summary'),
                          ctx.groupSummary!(group.key, group.rows)
                        )
                      )
                    : null
                )
              ),
              When(isCollapsed, () =>
                hasFooter
                  ? When(ctx.showFooter, () =>
                      ForEach(ctx.visibleColumns, (colIdSignal, position) =>
                        MapSignal(colIdSignal, id => {
                          const col = ctx.getCol(id)
                          return col.footer
                            ? html.td(
                                attr.class(
                                  'bc-data-table__footer-row bc-data-table__group-footer-row'
                                ),
                                col.align != null
                                  ? style.textAlign(
                                      Value.map(col.align, (a): string => a)
                                    )
                                  : null,
                                col.footer(Value.toSignal(group.rows))
                              )
                            : When(
                                collapsedGroupColSpan.map(
                                  s => s < position.index
                                ),
                                () => html.td()
                              )
                        })
                      )
                    )
                  : null
              )
            )
          ),
          When(
            isCollapsed.map(c => !c),
            () =>
              Fragment(
                ...group.rows.map(row => renderGroupRow(row, ctx)),
                // Per-group footer row
                hasFooter
                  ? When(ctx.showFooter, () =>
                      html.tr(
                        attr.class(
                          'bc-data-table__footer-row bc-data-table__group-footer-row'
                        ),
                        When(ctx.selectable, () => html.td()),
                        ForEach(ctx.visibleColumns, colIdSignal =>
                          MapSignal(colIdSignal, id => {
                            const col = ctx.getCol(id)
                            return col.footer
                              ? html.td(
                                  col.align != null
                                    ? style.textAlign(
                                        Value.map(col.align, (a): string => a)
                                      )
                                    : null,
                                  col.footer(Value.toSignal(group.rows))
                                )
                              : html.td()
                          })
                        )
                      )
                    )
                  : null
              )
          )
        )
      })
    )
  )
}

/** Render the "no results" empty state. */
export function renderEmpty<T, C extends string>(
  ctx: DataTableContext<T, C>
): TNode {
  return When(
    ctx.ds.rows.map(r => r.length === 0),
    () =>
      Use(BeatUII18n, t =>
        html.tr(
          html.td(
            attr.colspan(ctx.totalColSpan),
            attr.class('bc-data-table__empty'),
            ctx.emptyContent ?? t.$.dataTable.map(dt => dt.noResults)
          )
        )
      )
  )
}

/** Render the loading overlay. */
export function renderLoading<T, C extends string>(
  ctx: DataTableContext<T, C>
): TNode {
  return Use(BeatUII18n, t =>
    LoadingOverlay({
      visible: ctx.loading,
      message: t.$.dataTable.map(dt => dt.loading),
      size: 'lg',
    })
  )
}

/** Render the footer row with column aggregations. */
export function renderFooter<T, C extends string>(
  ctx: DataTableContext<T, C>
): TNode {
  if (!ctx.hasFooter) return null
  return When(ctx.showFooter, () =>
    html.tr(
      attr.class('bc-data-table__footer-row'),
      When(ctx.selectable, () => html.td()),
      ForEach(ctx.visibleColumns, colIdSignal =>
        MapSignal(colIdSignal, id => {
          const col = ctx.getCol(id)
          return col.footer
            ? html.td(
                col.align != null
                  ? style.textAlign(Value.map(col.align, (a): string => a))
                  : null,
                col.footer(ctx.ds.allFilteredRows)
              )
            : html.td()
        })
      )
    )
  )
}
