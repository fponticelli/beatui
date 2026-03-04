import { Value, computedOf } from '@tempots/dom'
import { DataSource } from './data-source'
import { ControlSize } from '../theme'
import { CheckboxInput } from '../form'
import {
  CheckboxState,
  TriStateCheckboxInput,
} from '../form/input/tri-state-checkbox-input'

/**
 * Options for the {@link SelectionCheckbox} component.
 *
 * @typeParam T - The type of data rows in the data source
 */
export interface SelectionCheckboxOptions<T, C extends string = string> {
  /** The data source to wire selection into */
  dataSource: DataSource<T, C>
  /** The unique row ID for this checkbox */
  rowId: Value<string>
  isSelected: Value<boolean>
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
  isSelected,
  size = 'md',
}: SelectionCheckboxOptions<T, C>) {
  return CheckboxInput({
    size,
    value: isSelected,
    onChange: () => dataSource.toggleSelect(Value.get(rowId)),
  })
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
  const checkboxState = computedOf(
    dataSource.isAllSelected,
    dataSource.isSomeSelected
  )(
    (isAll, isSome): CheckboxState =>
      isAll ? 'checked' : isSome ? 'indeterminate' : 'unchecked'
  )

  return TriStateCheckboxInput({
    size,
    value: checkboxState,
    onChange: () => {
      if (dataSource.isAllSelected.value) {
        dataSource.deselectAll()
      } else {
        dataSource.selectAll()
      }
    },
  })
}
