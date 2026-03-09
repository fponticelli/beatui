import { aria, attr, html, on, TNode, Use, Value, When } from '@tempots/dom'
import { DataSource } from './data-source'
import { Icon } from './icon'
import { Tooltip } from '../overlay/tooltip'
import { ControlSize } from '../theme'
import { BeatUII18n } from '../../beatui-i18n'

/**
 * Options for the {@link SortableHeader} component.
 *
 * @typeParam T - The type of data rows in the data source
 * @typeParam C - Column identifier type (defaults to `string`)
 */
export interface SortableHeaderOptions<T, C extends string = string> {
  /** The data source to wire sorting into */
  dataSource: DataSource<T, C>
  /** Column identifier matching the accessor key */
  column: C
  /** Size variant. @default 'md' */
  size?: Value<ControlSize>
  /** Extra actions (e.g. filter panel) rendered alongside the sort icon */
  actions?: TNode
  /** Column menu (e.g. kebab ⋮ with sort/hide/columns actions) */
  menu?: TNode
  /** Hide the sort icon when no sort is active. @default false */
  hideInactiveIcon?: boolean
  /** Whether multi-sort is enabled (shows "Hold Shift" hint). @default true */
  multiSort?: Value<boolean>
  /** Whether this header is draggable (for column reordering). @default false */
  draggable?: Value<boolean>
  /** Drag start handler */
  onDragStart?: (e: DragEvent) => void
  /** Drag over handler */
  onDragOver?: (e: DragEvent) => void
  /** Drop handler */
  onDrop?: (e: DragEvent) => void
  /** Drag end handler */
  onDragEnd?: (e: DragEvent) => void
}

/**
 * A table header cell (`<th>`) that enables click-to-sort on a data source column.
 *
 * Clicking cycles through: none → ascending → descending → none.
 * Displays an icon indicating the current sort direction.
 *
 * @typeParam T - The type of data rows
 * @param options - Configuration for the sortable header
 * @param children - Header label content
 * @returns A `<th>` element with sort interaction
 *
 * @example
 * ```ts
 * html.thead(
 *   html.tr(
 *     SortableHeader({ dataSource: ds, column: 'name' }, 'Name'),
 *     SortableHeader({ dataSource: ds, column: 'age' }, 'Age'),
 *   )
 * )
 * ```
 */
export function SortableHeader<T, C extends string = string>(
  {
    dataSource,
    column,
    size,
    actions,
    menu,
    hideInactiveIcon = false,
    multiSort: multiSortEnabled = true,
    draggable: isDraggable,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  }: SortableHeaderOptions<T, C>,
  ...children: TNode[]
) {
  const direction = dataSource.getSortDirection(column)

  const iconName = direction.map((d): string => {
    switch (d) {
      case 'asc':
        return 'line-md:arrow-small-up'
      case 'desc':
        return 'line-md:arrow-small-down'
      default:
        return 'line-md:arrows-vertical'
    }
  })

  const classes = direction.map((d): string => {
    const base = 'bc-sortable-header'
    if (d === 'asc') return `${base} ${base}--asc`
    if (d === 'desc') return `${base} ${base}--desc`
    return base
  })

  return html.th(
    attr.class(classes),
    attr.role('columnheader'),
    isDraggable != null
      ? attr.draggable(Value.map(isDraggable, v => (v ? 'true' : undefined)))
      : null,
    onDragStart != null ? on.dragstart(onDragStart) : null,
    onDragOver != null ? on.dragover(onDragOver) : null,
    onDrop != null ? on.drop(onDrop) : null,
    onDragEnd != null ? on.dragend(onDragEnd) : null,
    aria.sort(
      direction.map((d): 'none' | 'ascending' | 'descending' | 'other' => {
        if (d === 'asc') return 'ascending'
        if (d === 'desc') return 'descending'
        return 'none'
      })
    ),
    on.click((e: MouseEvent) =>
      dataSource.toggleSort(column, { multi: e.shiftKey })
    ),
    html.div(
      attr.class('bc-sortable-header__content'),
      html.span(attr.class('bc-sortable-header__label'), ...children),
      html.span(
        attr.class('bc-sortable-header__icons'),
        hideInactiveIcon
          ? When(
              direction.map(d => d != null),
              () =>
                html.span(
                  attr.class(
                    'bc-sortable-header__icon bc-sortable-header__icon--active'
                  ),
                  Icon({ icon: iconName, size: size ?? 'md' }),
                  When(multiSortEnabled, () =>
                    Use(BeatUII18n, t =>
                      Tooltip({
                        content: t.$.dataTable.map(dt => dt.sortMultiHint),
                        showDelay: 800,
                      })
                    )
                  )
                )
            )
          : html.span(
              attr.class(
                direction.map((d): string =>
                  d != null
                    ? 'bc-sortable-header__icon bc-sortable-header__icon--active'
                    : 'bc-sortable-header__icon'
                )
              ),
              Icon({ icon: iconName, size: size ?? 'md' }),
              When(multiSortEnabled, () =>
                Use(BeatUII18n, t =>
                  Tooltip({
                    content: t.$.dataTable.map(dt => dt.sortMultiHint),
                    showDelay: 800,
                  })
                )
              )
            ),
        actions ?? null,
        menu != null
          ? html.span(
              attr.class('bc-sortable-header__menu'),
              on.click(e => e.stopPropagation()),
              menu
            )
          : null
      )
    )
  )
}
