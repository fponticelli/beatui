import { Fragment, OnDispose, Value } from '@tempots/dom'
import { DataSource } from './data-source'
import { Filter, TextOperator } from './filter'
import { ControlSize } from '../theme'
import { TextInput } from '../form/input/text-input'
import { NativeSelect } from '../form/input/native-select'
import { Option, SelectOption } from '../form/input/option'

// ---------------------------------------------------------------------------
// Discriminated union types
// ---------------------------------------------------------------------------

/**
 * Base options shared by all {@link ColumnFilter} variants.
 *
 * @typeParam T - The type of data rows in the data source
 * @typeParam C - Column identifier type (defaults to `string`)
 */
export interface ColumnFilterBase<T, C extends string = string> {
  /** The data source to wire filtering into */
  dataSource: DataSource<T, C>
  /** Column identifier */
  column: C
  /** Size variant. @default 'sm' */
  size?: Value<ControlSize>
}

/**
 * Options for a text-input column filter.
 *
 * @typeParam T - The type of data rows in the data source
 */
export interface TextColumnFilter<T, C extends string = string> extends ColumnFilterBase<T, C> {
  /** Discriminator — omit or set to `'text'` for a debounced text input. */
  type?: 'text'
  /** Placeholder text for the text input. @default 'Filter...' */
  placeholder?: Value<string>
  /** Filter operator applied when text is non-empty. @default 'contains' */
  operator?: TextOperator
  /** Debounce delay in milliseconds. @default 300 */
  debounce?: number
}

/**
 * Options for a select-dropdown column filter.
 *
 * @typeParam T - The type of data rows in the data source
 */
export interface SelectColumnFilter<T, C extends string = string> extends ColumnFilterBase<T, C> {
  /** Discriminator — must be `'select'` for a dropdown filter. */
  type: 'select'
  /** The list of value/label pairs to present in the dropdown. */
  options: { value: string; label: string }[]
  /**
   * Label for the "show all rows" option at the top of the dropdown.
   * @default 'All'
   */
  allLabel?: string
}

/**
 * Options for the {@link ColumnFilter} component.
 *
 * Use the `type` discriminator to select between `'text'` (default) and
 * `'select'` variants. The TypeScript compiler will enforce that `options` /
 * `allLabel` are only provided when `type === 'select'`, and that `placeholder`
 * / `operator` / `debounce` are only provided when `type` is `'text'` or
 * omitted.
 *
 * @typeParam T - The type of data rows in the data source
 * @typeParam C - Column identifier type (defaults to `string`)
 */
export type ColumnFilterOptions<T, C extends string = string> =
  | TextColumnFilter<T, C>
  | SelectColumnFilter<T, C>

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A per-column filter input that wires into a {@link DataSource}.
 *
 * Supports two modes:
 * - `'text'` (default): A debounced {@link TextInput} that filters rows by the
 *   specified operator. The debounce timer is automatically cleared on disposal.
 * - `'select'`: A {@link NativeSelect} dropdown that filters rows by exact
 *   match. An "All" option (customisable via `allLabel`) removes the filter.
 *
 * @typeParam T - The type of data rows
 * @param options - Filter configuration (discriminated by `type`)
 * @returns A reactive filter control wired to the given data source
 *
 * @example
 * ```ts
 * // Text filter (default)
 * ColumnFilter({ dataSource: ds, column: 'name', placeholder: 'Search name...' })
 *
 * // Select filter
 * ColumnFilter({
 *   dataSource: ds,
 *   column: 'role',
 *   type: 'select',
 *   options: [
 *     { value: 'admin', label: 'Admin' },
 *     { value: 'user', label: 'User' },
 *   ],
 *   allLabel: 'All roles',
 * })
 * ```
 */
export function ColumnFilter<T, C extends string = string>(opts: ColumnFilterOptions<T, C>) {
  const { dataSource, column, size = 'sm' } = opts
  const filterValue = dataSource.getTextFilterValue(column)

  // ------------------------------------------------------------------
  // Select variant
  // ------------------------------------------------------------------
  if (opts.type === 'select') {
    const { options, allLabel = 'All' } = opts

    // Prepend the "All" option (value '') so that when filterValue is ''
    // NativeSelect marks it as selected automatically.
    const selectOptions: SelectOption<string>[] = [
      Option.value('', allLabel),
      ...options.map(o => Option.value(o.value, o.label)),
    ]

    return NativeSelect<string>({
      value: filterValue,
      options: selectOptions,
      size,
      class: 'bc-column-filter',
      onChange: (value: string) => {
        if (value === '') {
          dataSource.removeFilter(column)
        } else {
          dataSource.setFilter(Filter.equals(column, value))
        }
      },
    })
  }

  // ------------------------------------------------------------------
  // Text variant (default)
  // ------------------------------------------------------------------
  const {
    placeholder = 'Filter...',
    operator = 'contains',
    debounce = 300,
  } = opts as TextColumnFilter<T, C>

  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  return Fragment(
    OnDispose(() => {
      if (debounceTimer != null) clearTimeout(debounceTimer)
    }),
    TextInput({
      value: filterValue,
      size,
      class: 'bc-column-filter',
      placeholder,
      onInput: (value: string) => {
        if (debounceTimer != null) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          if (value === '') {
            dataSource.removeFilter(column)
          } else {
            dataSource.setFilter(Filter.text(column, operator, value))
          }
        }, debounce)
      },
    })
  )
}
