import {
  attr,
  html,
  on,
  OnDispose,
  Value,
  WithElement,
} from '@tempots/dom'
import { DataSource } from './data-source'
import { ControlSize } from '../theme'

/**
 * Options for the {@link SelectionCheckbox} component.
 *
 * @typeParam T - The type of data rows in the data source
 */
export interface SelectionCheckboxOptions<T, C extends string = string> {
  /** The data source to wire selection into */
  dataSource: DataSource<T, C>
  /** The unique row ID for this checkbox */
  rowId: string
  /** Size variant. @default 'md' */
  size?: Value<ControlSize>
}

/**
 * A checkbox for selecting/deselecting a single row in a {@link DataSource}.
 *
 * @typeParam T - The type of data rows
 * @param options - Checkbox configuration
 * @returns An `<input type="checkbox">` element wired to the data source selection
 *
 * @example
 * ```ts
 * html.td(
 *   SelectionCheckbox({ dataSource: ds, rowId: row.id })
 * )
 * ```
 */
export function SelectionCheckbox<T, C extends string = string>({
  dataSource,
  rowId,
  size = 'md',
}: SelectionCheckboxOptions<T, C>) {
  const checked = dataSource.isSelected(rowId)

  return html.input(
    attr.type('checkbox'),
    attr.class(
      Value.map(
        size,
        s => `bc-selection-checkbox bc-selection-checkbox--size-${s}`
      )
    ),
    attr.checked(checked),
    on.change(() => dataSource.toggleSelect(rowId))
  )
}

/**
 * Options for the {@link SelectAllCheckbox} component.
 *
 * @typeParam T - The type of data rows in the data source
 */
export interface SelectAllCheckboxOptions<T, C extends string = string> {
  /** The data source to wire selection into */
  dataSource: DataSource<T, C>
  /** Size variant. @default 'md' */
  size?: Value<ControlSize>
}

/**
 * A checkbox for selecting/deselecting all filtered rows in a {@link DataSource}.
 *
 * Shows three states:
 * - Unchecked: no rows selected
 * - Indeterminate: some rows selected
 * - Checked: all rows selected
 *
 * @typeParam T - The type of data rows
 * @param options - Checkbox configuration
 * @returns An `<input type="checkbox">` element with indeterminate support
 *
 * @example
 * ```ts
 * html.th(
 *   SelectAllCheckbox({ dataSource: ds })
 * )
 * ```
 */
export function SelectAllCheckbox<T, C extends string = string>({
  dataSource,
  size = 'md',
}: SelectAllCheckboxOptions<T, C>) {
  const indeterminate = dataSource.isSomeSelected

  return html.input(
    attr.type('checkbox'),
    attr.class(
      Value.map(
        size,
        s => `bc-selection-checkbox bc-selection-checkbox--size-${s}`
      )
    ),
    attr.checked(dataSource.isAllSelected),
    WithElement(el => {
      const unsub = Value.on(indeterminate, ind => {
        ;(el as HTMLInputElement).indeterminate = ind
      })
      return OnDispose(unsub)
    }),
    on.change(() => {
      if (dataSource.isAllSelected.value) {
        dataSource.deselectAll()
      } else {
        dataSource.selectAll()
      }
    })
  )
}
