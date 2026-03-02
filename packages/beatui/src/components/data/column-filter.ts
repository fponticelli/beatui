import { Fragment, OnDispose, prop, Value } from '@tempots/dom'
import { DataSource } from './data-source'
import { Filter, FilterBase, SetFilter, TextOperator } from './filter'
import { ControlSize } from '../theme'
import { TextInput } from '../form/input/text-input'
import { NativeSelect } from '../form/input/native-select'
import { TagInput } from '../form/input/tag-input'
import { Option, SelectOption } from '../form/input/option'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractSetValues<C extends string>(filters: FilterBase<C>[]): string[] {
  for (const f of filters) {
    if (f.kind === 'set' && (f as SetFilter<C>).mode === 'include') {
      return ((f as SetFilter<C>) as { values: unknown[] }).values.map(String)
    }
  }
  return []
}

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
 * Options for a multi-select tags column filter.
 *
 * @typeParam T - The type of data rows in the data source
 */
export interface TagsColumnFilter<T, C extends string = string> extends ColumnFilterBase<T, C> {
  /** Discriminator — must be `'tags'` for a multi-select tag input filter. */
  type: 'tags'
  /** The list of value/label pairs. */
  options: { value: string; label: string }[]
  /** Placeholder text. @default 'Select values...' */
  placeholder?: Value<string>
}

/**
 * Options for the {@link ColumnFilter} component.
 *
 * Use the `type` discriminator to select between `'text'` (default),
 * `'select'`, and `'tags'` variants.
 *
 * @typeParam T - The type of data rows in the data source
 * @typeParam C - Column identifier type (defaults to `string`)
 */
export type ColumnFilterOptions<T, C extends string = string> =
  | TextColumnFilter<T, C>
  | SelectColumnFilter<T, C>
  | TagsColumnFilter<T, C>

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

  // ------------------------------------------------------------------
  // Tags variant
  // ------------------------------------------------------------------
  if (opts.type === 'tags') {
    const { options, placeholder = 'Select values...' } = opts
    const columnFilters = dataSource.getColumnFilters(column)

    // Derive selected values from the set filter
    const selectedValues = prop<string[]>(
      extractSetValues(columnFilters.value)
    )

    // Keep selectedValues in sync when filters change externally
    const unsub = columnFilters.on(filters => {
      selectedValues.set(extractSetValues(filters))
    })

    // Map labels for display
    const labelMap = new Map(options.map(o => [o.value, o.label]))
    const displayValues = selectedValues.map(vals =>
      vals.map(v => labelMap.get(v) ?? v)
    )

    return Fragment(
      OnDispose(() => {
        unsub()
        selectedValues.dispose()
        displayValues.dispose()
      }),
      TagInput({
        values: displayValues,
        onChange: (labels: string[]) => {
          // Map labels back to values
          const reverseLabelMap = new Map(options.map(o => [o.label, o.value]))
          const vals = labels.map(l => reverseLabelMap.get(l) ?? l)
          selectedValues.set(vals)
          if (vals.length === 0) {
            dataSource.removeFilter(column)
          } else {
            dataSource.setFilter(Filter.oneOf(column, vals))
          }
        },
        placeholder,
        size,
      })
    )
  }

  // ------------------------------------------------------------------
  // Select variant
  // ------------------------------------------------------------------
  const filterValue = dataSource.getTextFilterValue(column)

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
