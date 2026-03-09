import { html, attr, on, Signal, TNode, Value, Use, When } from '@tempots/dom'
import { DataSource, SortDirection } from './data-source'
import { ControlSize } from '../theme'
import { Icon } from './icon'
import { Menu, MenuItem, MenuSeparator } from '../navigation/menu'
import { CheckboxInput } from '../form/input/checkbox-input'
import { Button } from '../button/button'
import { BeatUII18n } from '../../beatui-i18n'

/**
 * Options for the {@link ColumnHeaderMenu} component.
 */
export interface ColumnHeaderMenuOptions<T, C extends string = string> {
  /** The data source for sort state */
  dataSource: DataSource<T, C>
  /** Column identifier */
  column: C
  /** Whether this column supports sorting */
  sortable?: boolean
  /** Whether this column can be hidden */
  hideable?: boolean
  /** Size variant. @default 'md' */
  size?: Value<ControlSize>
  /** Callback to hide this column */
  onHideColumn?: () => void
  /** Columns that can be shown/hidden */
  hideableColumns?: { id: string; label: string }[]
  /** Currently hidden column IDs (reactive) */
  hiddenColumns?: Signal<Set<string>>
  /** Toggle a column's visibility */
  onToggleColumn?: (colId: string) => void
  /** Show all hidden columns */
  onResetColumns?: () => void
  /** Filter content to embed as a submenu (ColumnFilterPanel, ColumnFilter, etc.) */
  filterContent?: TNode
  /** Whether this column has an active filter (reactive) */
  hasActiveFilter?: Signal<boolean>
  /** Callback to clear all filters on this column */
  onClearFilter?: () => void
}

/**
 * A kebab menu (⋮) for a column header providing sort, filter, hide, and column
 * management actions. Uses the existing {@link Menu} component.
 */
export function ColumnHeaderMenu<T, C extends string = string>(
  opts: ColumnHeaderMenuOptions<T, C>
): TNode {
  const {
    dataSource,
    column,
    sortable = false,
    hideable = false,
    size = 'md',
    onHideColumn,
    hideableColumns,
    hiddenColumns,
    onToggleColumn,
    onResetColumns,
    filterContent,
    hasActiveFilter,
    onClearFilter,
  } = opts

  const direction = sortable ? dataSource.getSortDirection(column) : undefined

  return Use(BeatUII18n, t => {
    const dt = t.$.dataTable
    return Menu({
      items: () => {
        const sections: TNode[][] = []
        // Read current values at menu-open time
        const dir: SortDirection | undefined = direction?.value

        if (sortable) {
          const section: TNode[] = [
            MenuItem({
              key: 'sort-asc',
              content: dt.map(d => d.menuSortAsc),
              before: Icon({ icon: 'line-md:arrow-small-up', size }),
              disabled: direction?.map(d => d === 'asc'),
              onClick: () => dataSource.setSort([{ column, direction: 'asc' }]),
            }),
            MenuItem({
              key: 'sort-desc',
              content: dt.map(d => d.menuSortDesc),
              before: Icon({ icon: 'line-md:arrow-small-down', size }),
              disabled: direction?.map(d => d === 'desc'),
              onClick: () =>
                dataSource.setSort([{ column, direction: 'desc' }]),
            }),
          ]
          if (dir != null) {
            section.push(
              MenuItem({
                key: 'clear-sort',
                content: dt.map(d => d.menuClearSort),
                before: Icon({
                  icon: 'line-md:arrows-vertical',
                  size,
                }),
                onClick: () => {
                  const next = dataSource.sort.value.filter(
                    s => s.column !== column
                  )
                  dataSource.setSort(next)
                },
              })
            )
          }
          sections.push(section)
        }

        // Filter submenu
        if (filterContent != null) {
          const section: TNode[] = [
            MenuItem({
              key: 'filter',
              content: dt.map(d => d.menuFilter ?? 'Filter'),
              before: Icon({ icon: 'lucide:filter', size }),
              submenu: () => [
                html.div(
                  on.click(e => e.stopPropagation()),
                  filterContent
                ),
              ],
            }),
          ]

          // Clear filter — reactively shown when a filter is active
          if (onClearFilter && hasActiveFilter) {
            section.push(
              When(hasActiveFilter, () =>
                MenuItem({
                  key: 'clear-filter',
                  content: dt.map(d => d.clearFilter),
                  before: Icon({ icon: 'lucide:filter-x', size }),
                  onClick: onClearFilter,
                })
              )
            )
          }

          sections.push(section)
        }

        if (hideable && onHideColumn) {
          sections.push([
            MenuItem({
              key: 'hide-column',
              content: dt.map(d => d.menuHideColumn),
              before: Icon({ icon: 'lucide:eye-off', size }),
              onClick: onHideColumn,
            }),
          ])
        }

        // Column chooser submenu
        if (
          hideableColumns &&
          hideableColumns.length > 0 &&
          hiddenColumns &&
          onToggleColumn
        ) {
          const section: TNode[] = [
            MenuItem({
              key: 'choose-columns',
              content: dt.map(d => d.menuChooseColumns),
              before: Icon({ icon: 'lucide:columns-3', size }),
              submenu: () => [
                html.div(
                  attr.class('bc-data-table__column-toggle-panel'),
                  on.click(e => e.stopPropagation()),
                  ...hideableColumns.map(col =>
                    CheckboxInput({
                      value: hiddenColumns.map(h => !h.has(col.id)),
                      onChange: () => onToggleColumn(col.id),
                      placeholder: col.label,
                    })
                  ),
                  When(
                    hiddenColumns.map(h => h.size > 0),
                    () =>
                      onResetColumns
                        ? Button(
                            {
                              size: 'xs',
                              variant: 'outline',
                              onClick: () => onResetColumns(),
                            },
                            dt.$.showAllColumns
                          )
                        : null
                  )
                ),
              ],
            }),
          ]

          // Reset columns — reactively shown when columns are hidden
          if (onResetColumns) {
            section.push(
              When(
                hiddenColumns.map(h => h.size > 0),
                () =>
                  MenuItem({
                    key: 'reset-columns',
                    content: dt.map(d => d.menuResetColumns),
                    before: Icon({ icon: 'lucide:rotate-ccw', size }),
                    onClick: onResetColumns,
                  })
              )
            )
          }

          sections.push(section)
        }

        // Join sections with separators
        const items: TNode[] = []
        for (let i = 0; i < sections.length; i++) {
          if (i > 0) items.push(MenuSeparator())
          items.push(...sections[i])
        }
        return items
      },
      placement: 'bottom-end',
      showOn: 'click',
    })
  })
}
