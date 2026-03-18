import {
  attr,
  html,
  on,
  prop,
  Signal,
  style,
  TNode,
  Value,
  When,
} from '@tempots/dom'
import { DataTableContext } from './data-table-context'
import { Icon } from './icon'

/**
 * Render the toggle column header cell (empty th).
 * Only rendered when hasToggleColumn is true.
 */
export function renderToggleHeaderCell<T, C extends string>(
  ctx: DataTableContext<T, C>
): TNode {
  if (!ctx.hasToggleColumn) return null
  return html.th(attr.class('bc-data-table__toggle-header'))
}

/**
 * Render an empty toggle cell for filter rows.
 */
export function renderToggleFilterCell<T, C extends string>(
  ctx: DataTableContext<T, C>
): TNode {
  if (!ctx.hasToggleColumn) return null
  return html.th(attr.class('bc-data-table__toggle-header'))
}

/**
 * Render the toggle cell for a data row.
 * Shows a chevron button if hasDetails passes, empty cell otherwise.
 */
export function renderToggleCell<T, C extends string>(
  rowSignal: Signal<T>,
  rowId: string,
  ctx: DataTableContext<T, C>
): TNode {
  if (!ctx.hasToggleColumn || !ctx.expandedRows || !ctx.rowDetails) return null

  const showDetails = ctx.rowDetails.hasDetails
    ? ctx.rowDetails.hasDetails(rowSignal)
    : true

  if (!showDetails) {
    return html.td(attr.class('bc-data-table__toggle-cell'))
  }

  const isExpanded = ctx.expandedRows.toggledIds.map(() =>
    ctx.expandedRows!.isExpanded(rowId)
  )

  return html.td(
    attr.class('bc-data-table__toggle-cell'),
    html.button(
      attr.class(
        isExpanded.map((exp): string =>
          exp
            ? 'bc-data-table__group-toggle'
            : 'bc-data-table__group-toggle bc-data-table__group-toggle--collapsed'
        )
      ),
      attr.type('button'),
      on.click(e => {
        e.stopPropagation()
        ctx.expandedRows!.toggle(rowId)
      }),
      Icon({ icon: 'lucide:chevron-down', size: 'sm' })
    )
  )
}

/**
 * Render the detail row for a data row.
 * Handles lazy rendering and Collapse animation for collapsible modes.
 */
export function renderDetailRow<T, C extends string>(
  rowSignal: Signal<T>,
  rowId: string,
  ctx: DataTableContext<T, C>
): TNode {
  if (!ctx.rowDetails) return null

  const showDetails = ctx.rowDetails.hasDetails
    ? ctx.rowDetails.hasDetails(rowSignal)
    : true

  if (!showDetails) return null

  const defaultState = ctx.rowDetails.defaultState ?? 'collapsed'

  if (defaultState === 'always-visible') {
    // Always visible: render directly, no Collapse
    return html.tr(
      attr.class('bc-data-table__detail-row'),
      html.td(
        attr.class('bc-data-table__detail-cell'),
        attr.colspan(ctx.totalColSpan),
        html.div(ctx.rowDetails.render(rowSignal))
      )
    )
  }

  // Collapsible mode
  if (!ctx.expandedRows) return null

  const expandedRows = ctx.expandedRows

  const isExpanded = expandedRows.toggledIds.map(() =>
    expandedRows.isExpanded(rowId)
  )

  // Lazy rendering: content is mounted on first expand, then kept in DOM.
  // For 'expanded' default, mount immediately.
  const shouldRender = prop(
    defaultState === 'expanded' || expandedRows.renderedOnce.has(rowId)
  )
  if (defaultState === 'expanded') {
    expandedRows.renderedOnce.add(rowId)
  }

  // One-time listener: on first expand, mount the content
  if (!shouldRender.value) {
    const unsub = Value.on(isExpanded, expanded => {
      if (expanded && !shouldRender.value) {
        expandedRows.renderedOnce.add(rowId)
        shouldRender.set(true)
        unsub()
      }
    })
  }

  return html.tr(
    attr.class('bc-data-table__detail-row'),
    // Hide completely when collapsed so it takes no space
    style.display(isExpanded.map((exp): string => (exp ? '' : 'none'))),
    html.td(
      attr.class('bc-data-table__detail-cell'),
      attr.colspan(ctx.totalColSpan),
      // Content rendered lazily on first expand, kept mounted after
      When(shouldRender, () => html.div(ctx.rowDetails!.render(rowSignal)))
    )
  )
}
