import { TNode, Value } from '@tempots/dom'
import { ControlSize } from '../theme'
import {
  BulkAction,
  DataSource,
  SortDescriptor,
} from './data-source'
import { FilterBase } from './filter'

/** The value type of a column, used by the filter panel to determine available operators. */
export type ColumnValueType = 'text' | 'number'

/**
 * Column definition for a {@link DataTable}.
 *
 * @typeParam T - The type of data rows
 * @typeParam C - Column identifier type (defaults to `string`)
 */
export interface DataColumnDef<T, C extends string = string> {
  /** Unique column identifier. Used as key for accessor, sort, and filter. */
  id: C
  /** Column header content. String or render function. */
  header: string | (() => TNode)
  /** Render function for cell content. Receives the row data and row index. */
  cell: (row: T, index: number) => TNode
  /**
   * Accessor function to extract the column value from a row.
   * If omitted, defaults to `row[id]`.
   */
  accessor?: (row: T) => unknown
  /** Whether this column is sortable. @default false */
  sortable?: boolean
  /**
   * Whether this column is filterable.
   * - `true` or `'text'`: text input filter
   * - `'select'`: dropdown filter (requires `filterOptions`)
   * - `'panel'`: advanced flyout filter panel with multiple conditions and AND/OR logic
   * @default false
   */
  filterable?: boolean | 'text' | 'select' | 'panel'
  /** Options for select-type filter */
  filterOptions?: { value: string; label: string }[]
  /** The column value type, used by `'panel'` filter to determine available operators. @default 'text' */
  columnType?: ColumnValueType
  /** Where to render the filter panel trigger. @default 'filter-row' */
  filterPosition?: 'header' | 'filter-row'
  /** Custom comparator for sorting this column */
  comparator?: (a: unknown, b: unknown) => number
  /** Column width (e.g., '200px', '20%') */
  width?: Value<string>
  /** Minimum column width */
  minWidth?: Value<string>
  /** Text alignment within cells. @default 'left' */
  align?: Value<'left' | 'center' | 'right'>
  /** Whether this column can be hidden via the column visibility toggle. @default false */
  hideable?: boolean
}

/**
 * Pagination options for {@link DataTable}.
 */
export interface DataTablePaginationOptions {
  /** Number of rows per page. @default 10 */
  pageSize?: number
  /** Show first/last page buttons. @default false */
  showFirstLast?: boolean
  /** Number of page siblings to show. @default 1 */
  siblings?: number
  /** Enable responsive page number display. @default false */
  responsive?: boolean
}

/**
 * Toolbar options for {@link DataTable}.
 */
export interface DataTableToolbarOptions {
  /** Show active sort indicators in toolbar. @default true */
  showSort?: boolean
  /** Show active filter chips in toolbar. @default true */
  showFilters?: boolean
  /** Show selection count in toolbar. @default true */
  showSelection?: boolean
  /** Bulk actions available when rows are selected */
  bulkActions?: BulkAction[]
}

/**
 * Configuration options for the {@link DataTable} component.
 *
 * @typeParam T - The type of data rows
 * @typeParam C - Column identifier type (defaults to `string`)
 */
export interface DataTableOptions<T, C extends string = string> {
  /** Source data array (static or reactive) */
  data: Value<T[]>
  /** Column definitions */
  columns: DataColumnDef<T, C>[]
  /** Returns a unique string ID for each row */
  rowId: (row: T) => string

  // Feature toggles
  /** Enable sorting (columns opt-in via `column.sortable`). @default false */
  sortable?: Value<boolean>
  /** Allow sorting by multiple columns. @default false */
  multiSort?: Value<boolean>
  /** Enable filtering (columns opt-in via `column.filterable`). @default false */
  filterable?: Value<boolean>
  /** Show selection checkboxes. @default false */
  selectable?: Value<boolean>
  /** Position of selection checkboxes. @default 'before' */
  selectionPosition?: 'before' | 'after'
  /** Toggle row selection when clicking anywhere on the row. @default false */
  selectOnRowClick?: Value<boolean>

  /** Pagination config. `true` uses defaults, `false`/undefined disables. */
  pagination?: Value<DataTablePaginationOptions | boolean>
  /** Toolbar config. `true` uses defaults, `false`/undefined disables. */
  toolbar?: Value<DataTableToolbarOptions | boolean>

  // Table styling (pass-through to Table component)
  /** Size variant. @default 'md' */
  size?: Value<ControlSize>
  /** Enable hover effect on rows. @default false */
  hoverable?: Value<boolean>
  /** Make header sticky. @default false */
  stickyHeader?: Value<boolean>
  /** Full width table. @default false */
  fullWidth?: Value<boolean>
  /** Striped rows. @default false */
  withStripedRows?: Value<boolean>
  /** Table border. @default true */
  withTableBorder?: Value<boolean>
  /** Column borders. @default false */
  withColumnBorders?: Value<boolean>
  /** Row borders. @default true */
  withRowBorders?: Value<boolean>

  // Callbacks
  /** Called when sort state changes */
  onSortChange?: (sort: SortDescriptor<C>[]) => void
  /** Called when filter state changes */
  onFilterChange?: (filters: FilterBase<C>[]) => void
  /** Called when selection changes */
  onSelectionChange?: (selected: Set<string>) => void
  /** Called when a row is clicked */
  onRowClick?: (row: T) => void

  // Server-side mode
  /** Skip client-side processing. @default false */
  serverSide?: Value<boolean>
  /** Total rows for server-side pagination */
  totalRows?: Value<number>
  /** Loading state */
  loading?: Value<boolean>

  /** Content to show when no rows match */
  emptyContent?: TNode

  /** Column visibility options. When set, a column toggle button appears. */
  columnVisibility?: {
    /** Column IDs hidden by default */
    defaultHidden?: C[]
  }

  /** Callback to receive the internal DataSource for external integration */
  onDataSource?: (ds: DataSource<T, C>) => void
}
