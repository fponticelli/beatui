import {
  attr,
  computedOf,
  ForEach,
  Fragment,
  html,
  on,
  OnDispose,
  Use,
  Value,
  When,
} from '@tempots/dom'
import { BulkAction, DataSource } from './data-source'
import {
  describeFilter,
  describeFilterLocalized,
  DescribeFilterOptions,
  FilterBase,
  FilterDescriptionMessages,
} from './filter'
import { Icon } from './icon'
import { Tag } from './tag'
import { BeatUII18n } from '../../beatui-i18n'

/**
 * Options for the {@link DataToolbar} component.
 *
 * @typeParam T - The type of data rows in the data source
 * @typeParam C - Column identifier type (defaults to `string`)
 */
export interface DataToolbarOptions<T, C extends string = string> {
  /** The data source to display state for */
  dataSource: DataSource<T, C>
  /** Show active sort indicators. @default true */
  showSort?: Value<boolean>
  /** Show active filter chips. @default true */
  showFilters?: Value<boolean>
  /** Show selection count and bulk actions. @default true */
  showSelection?: Value<boolean>
  /** Available bulk actions when rows are selected */
  bulkActions?: BulkAction[]
  /** Custom label for the reset button */
  resetLabel?: Value<string>
  /** Optional callback to describe custom (non-builtin) filter kinds */
  describeFilter?: DescribeFilterOptions<C>['describeFilter']
}

/**
 * A toolbar displaying the active state of a {@link DataSource}: active sort indicators,
 * filter chips with remove buttons, selection count, bulk action buttons, and a "Reset all" control.
 *
 * @typeParam T - The type of data rows
 * @param options - Toolbar configuration
 * @returns A toolbar element
 *
 * @example
 * ```ts
 * DataToolbar({
 *   dataSource: ds,
 *   bulkActions: [
 *     { label: 'Delete', icon: 'mdi:delete', onClick: (sel) => deleteRows(sel) },
 *   ],
 * })
 * ```
 */
export function DataToolbar<T, C extends string = string>({
  dataSource,
  showSort = true,
  showFilters = true,
  showSelection = true,
  bulkActions = [],
  resetLabel,
  describeFilter: describeFilterCb,
}: DataToolbarOptions<T, C>) {
  const hasActiveState = computedOf(
    dataSource.sort,
    dataSource.filters,
    dataSource.selectedCount
  )((sorts, filters, selCount) => sorts.length > 0 || filters.length > 0 || selCount > 0)

  // Combine showSelection (Value<boolean>) with selectedCount into a single derived signal
  // so we avoid creating a new computedOf on each render cycle
  const showSelectionSignal = Value.toSignal(showSelection)
  const selectionVisible = computedOf(
    showSelectionSignal,
    dataSource.selectedCount
  )((show, count) => show && count > 0)

  const describeOpts: DescribeFilterOptions<C> | undefined = describeFilterCb
    ? { describeFilter: describeFilterCb }
    : undefined

  function describeFilterChip(f: FilterBase<C>, messages?: FilterDescriptionMessages): string {
    if (messages) {
      return describeFilterLocalized(f, messages, describeOpts)
    }
    return describeFilter(f, describeOpts)
  }

  return Fragment(
    OnDispose(() => {
      hasActiveState.dispose()
      showSelectionSignal.dispose()
      selectionVisible.dispose()
    }),
    Use(BeatUII18n, t =>
      When(hasActiveState, () =>
        html.div(
          attr.class('bc-data-toolbar'),

          // Sort chips
          When(showSort, () =>
            ForEach(dataSource.sort, sortSignal =>
              Tag({
                value: sortSignal.map(s =>
                  `${s.column} ${s.direction === 'asc' ? '\u2191' : '\u2193'}`
                ),
                color: 'green',
                size: 'sm',
                onClose: () => {
                  const s = sortSignal.value
                  const next = dataSource.sort.value.filter(
                    x => x.column !== s.column
                  )
                  dataSource.setSort(next)
                },
              })
            )
          ),

          // Filter chips
          When(showFilters, () =>
            ForEach(dataSource.filters, filterSignal =>
              Tag({
                value: filterSignal.map((f: FilterBase<C>) =>
                  describeFilterChip(
                    f,
                    (t.value.dataTable as Record<string, unknown>).describeFilter as
                      | FilterDescriptionMessages
                      | undefined
                  )
                ),
                color: 'violet',
                size: 'sm',
                onClose: () => {
                  dataSource.removeFilter(filterSignal.value.column)
                },
              })
            )
          ),

          // Selection info and bulk actions
          When(selectionVisible, () =>
            html.div(
              attr.class('bc-data-toolbar__selection'),
              html.span(
                attr.class('bc-data-toolbar__selection-count'),
                dataSource.selectedCount.map(c =>
                  t.value.dataTable.selectedCount(c)
                )
              ),
              ...bulkActions.map(action =>
                html.button(
                  attr.class('bc-data-toolbar__action'),
                  on.click(() => action.onClick(dataSource.selected.value)),
                  action.icon != null
                    ? Icon({ icon: action.icon, size: 'sm' })
                    : null,
                  action.label
                )
              ),
              html.button(
                attr.class('bc-data-toolbar__action bc-data-toolbar__action--secondary'),
                on.click(() => dataSource.deselectAll()),
                t.$.dataTable.map(dt => dt.deselectAll)
              )
            )
          ),

          // Reset all button
          html.button(
            attr.class('bc-data-toolbar__reset'),
            on.click(() => dataSource.resetAll()),
            Icon({ icon: 'line-md:close-small', size: 'sm' }),
            resetLabel ?? t.$.dataTable.map(dt => dt.resetAll)
          )
        )
      )
    )
  )
}
