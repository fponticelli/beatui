import { attr, html, on, TNode, When, Use } from '@tempots/dom'
import { BeatUII18n } from '../../beatui-i18n'
import { DataTableContext } from './data-table-context'
import { Flyout } from '../navigation/flyout'
import { CheckboxInput } from '../form/input/checkbox-input'
import { Icon } from './icon'
import { Button } from '../button/button'

/** Render the column visibility toggle button + flyout. */
export function renderColumnToggle<T, C extends string>(
  ctx: DataTableContext<T, C>
): TNode {
  if (ctx.hideableColumns.length === 0) return null
  const hasHiddenColumns = ctx.hiddenColumns.map(h => h.length > 0)
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
        Icon({ icon: 'lucide:columns-3', size: ctx.size }),
        html.span(
          attr.class('bc-data-table__column-toggle-label'),
          t.$.dataTable.map(dt => dt.columnVisibility)
        ),
        Flyout({
          content: () =>
            html.div(
              attr.class('bc-data-table__column-toggle-panel'),
              on.click(e => e.stopPropagation()),
              ...ctx.hideableColumns.map(col =>
                CheckboxInput({
                  value: ctx.hiddenColumns.map(h => !h.includes(col.id)),
                  onChange: () => ctx.toggleColumnVisibility(col.id),
                  placeholder:
                    typeof col.header === 'string' ? col.header : col.id,
                  size: 'sm',
                })
              ),
              When(hasHiddenColumns, () =>
                Button(
                  {
                    size: 'xs',
                    variant: 'outline',
                    onClick: () => ctx.showAllColumns(),
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
