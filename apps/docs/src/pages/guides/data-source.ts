import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Icon, Notice, Badge } from '@tempots/beatui'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'DataSource',
  description:
    'Create sortable, filterable, paginated data tables with createDataSource and composable table primitives.',
}

const CREATE_DATA_SOURCE_CODE = `import { createDataSource } from '@tempots/beatui'
import { prop, OnDispose } from '@tempots/dom'

interface Employee {
  id: string
  name: string
  department: string
  salary: number
}

const ds = createDataSource<Employee>({
  data: prop(employees),  // Can be a reactive signal for live data
  rowId: e => e.id,       // Unique row identifier
  pageSize: 5,            // Rows per page
})

// Don't forget cleanup
OnDispose(() => ds.dispose())`

const SORTING_CODE = `import { SortableHeader, Table } from '@tempots/beatui'

Table({ fullWidth: true, hoverable: true },
  html.thead(
    html.tr(
      SortableHeader({ dataSource: ds, column: 'name', size: 'sm' }, 'Name'),
      SortableHeader({ dataSource: ds, column: 'salary', size: 'sm' }, 'Salary'),
    )
  ),
  // ...tbody
)`

const COLUMN_FILTER_CODE = `import { ColumnFilter, ColumnFilterPanel } from '@tempots/beatui'

// Text search filter
ColumnFilter({ dataSource: ds, column: 'name', placeholder: 'Search...' })

// Select filter for enum columns
ColumnFilter({
  dataSource: ds, column: 'department', type: 'select',
  options: [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Marketing', label: 'Marketing' },
  ],
})

// Advanced filter panel (supports number ranges, etc.)
ColumnFilterPanel({ dataSource: ds, column: 'salary', columnType: 'number', size: 'sm' })`

const PROGRAMMATIC_FILTER_CODE = `import { Filter, describeFilter } from '@tempots/beatui'

ds.setFilter(Filter.gt('salary', 100000))
ds.setFilter(Filter.between('salary', 80000, 120000))
ds.setFilter(Filter.oneOf('department', ['Engineering', 'Design']))
ds.setFilter(Filter.startsWith('name', 'A'))

// Combine filters
ds.resetFilters()
ds.setFilter(Filter.gt('salary', 100000))
ds.addFilter(Filter.oneOf('department', ['Engineering']))

// Describe active filters
ds.filters.map(f => f.map(describeFilter))

// Clear all filters
ds.resetFilters()`

const ROW_SELECTION_CODE = `import { SelectAllCheckbox, SelectionCheckbox } from '@tempots/beatui'
import { computedOf } from '@tempots/dom'

// Header: select all checkbox
SelectAllCheckbox({ dataSource: ds, size: 'sm' })

// Per-row checkbox (inside ForEach)
ForEach(ds.rows, rowSignal => {
  const id = rowSignal.$.id
  const isSelected = computedOf(id, ds.selected)((id, sel) => sel.has(id))
  return html.tr(
    html.td(SelectionCheckbox({ dataSource: ds, rowId: id, isSelected, size: 'sm' })),
    // ...other cells
  )
})

// Programmatic selection
ds.selectAll()
ds.deselectAll()
ds.selectedCount // Signal<number>`

const PAGINATION_CODE = `import { Pagination } from '@tempots/beatui'

Pagination({
  currentPage: ds.currentPage,
  totalPages: ds.totalPages,
  onChange: page => ds.setPage(page),
  showPrevNext: true,
  showFirstLast: true,
  siblings: 1,
  size: 'sm',
})

// Info signals
ds.totalFilteredRows  // Signal<number> — rows matching filters
ds.totalRows          // Signal<number> — all rows`

const REACTIVE_ROWS_CODE = `import { ForEach, MapSignal, When } from '@tempots/dom'

html.tbody(
  ForEach(ds.rows, rowSignal =>
    html.tr(
      MapSignal(rowSignal, row => html.td(row.name)),
      MapSignal(rowSignal, row => html.td(\`$\${row.salary.toLocaleString()}\`)),
    )
  ),
  When(
    ds.rows.map(r => r.length === 0),
    () => html.tr(html.td(attr.colspan(5), 'No matching data'))
  )
)`

const QUERY_DATA_SOURCE_CODE = `import { createQueryDataSource, DataTable } from '@tempots/beatui'
import { prop, OnDispose } from '@tempots/dom'

const search = prop({ query: '' })

const qds = createQueryDataSource({
  request: search,
  load: async ({ request, abortSignal }) => {
    const res = await fetch(\`/api/users?q=\${request.query}\`, { signal: abortSignal })
    return res.json()
  },
  convertError: String,
})

// DataTable creates its own DataSource from the stable signal.
// Sort/filter/selection state persists across reloads.
DataTable({
  data: qds.data,
  loading: qds.loading,
  columns: [...],
  rowId: u => u.id,
})

OnDispose(() => qds.dispose())`

const QUERY_DATA_TABLE_CODE = `import { QueryDataTable } from '@tempots/beatui'

QueryDataTable({
  request: searchParams,
  load: async ({ request, abortSignal }) => {
    const res = await fetch(\`/api/users?q=\${request.query}\`, { signal: abortSignal })
    return res.json()
  },
  convertError: String,
  columns: [
    { id: 'name', header: 'Name', cell: row => row.map(r => r.name), sortable: true },
    { id: 'email', header: 'Email', cell: row => row.map(r => r.email) },
  ],
  rowId: u => u.id,
  sortable: true,
  pagination: { pageSize: 20 },
})`

const API_ROWS: Array<{ name: string; description: string; type: 'signal' | 'method' }> = [
  { name: 'ds.rows', description: 'Current page rows', type: 'signal' },
  { name: 'ds.sort', description: 'Current sort state', type: 'signal' },
  { name: 'ds.filters', description: 'Active filters', type: 'signal' },
  { name: 'ds.selected', description: 'Selected row IDs', type: 'signal' },
  { name: 'ds.selectedCount', description: 'Count of selected rows', type: 'signal' },
  { name: 'ds.currentPage', description: 'Current page number', type: 'signal' },
  { name: 'ds.totalPages', description: 'Total number of pages', type: 'signal' },
  { name: 'ds.totalRows', description: 'All rows (unfiltered)', type: 'signal' },
  { name: 'ds.totalFilteredRows', description: 'Rows matching active filters', type: 'signal' },
  { name: 'ds.setPage(n)', description: 'Navigate to page n', type: 'method' },
  { name: 'ds.resetAll()', description: 'Clear sort, filters, and selection', type: 'method' },
  { name: 'ds.selectAll()', description: 'Select all visible rows', type: 'method' },
  { name: 'ds.deselectAll()', description: 'Deselect all rows', type: 'method' },
  { name: 'ds.resetFilters()', description: 'Remove all active filters', type: 'method' },
]

export default function DataSourceGuidePage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'DataSource'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          "BeatUI's composable data table system. Build sortable, filterable, paginated tables by wiring reactive signals to individual UI primitives — no monolithic wrapper required."
        ),
        html.div(
          attr.class('flex gap-3 items-center flex-wrap'),
          Badge({ variant: 'light', color: 'primary', size: 'sm' }, 'Sorting'),
          Badge({ variant: 'light', color: 'secondary', size: 'sm' }, 'Filtering'),
          Badge({ variant: 'light', color: 'success', size: 'sm' }, 'Pagination'),
          Badge({ variant: 'light', color: 'warning', size: 'sm' }, 'Row Selection')
        )
      ),

      // Section 1: Overview
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:database', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Overview')
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'createDataSource()'
            ),
            ' function provides sorting, filtering, pagination, and row selection for tabular data. It returns a reactive data source object whose signals can be composed with individual UI primitives — there is no monolithic ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'DataTable'
            ),
            ' wrapper to fight. Use the pieces you need, in the layout you want.'
          ),
          Notice(
            { variant: 'info' },
            'DataSource is composable — use SortableHeader, ColumnFilter, SelectionCheckbox, and Pagination individually, or build your own UI on top of the reactive signals.'
          )
        )
      ),

      // Section 2: Creating a DataSource
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:plus-circle', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Creating a DataSource')
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'Call ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'createDataSource()'
            ),
            ' with your data signal, a row ID extractor, and a page size. The data prop accepts either a static array or a reactive signal — the table updates automatically whenever the signal changes.'
          ),
          CodeBlock(CREATE_DATA_SOURCE_CODE, 'typescript')
        )
      ),

      // Section 3: Sorting
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:arrow-up-down', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Sorting')
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'Drop ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'SortableHeader'
            ),
            ' into any table header cell. It renders the column label with directional indicators and handles click-to-sort cycling (ascending → descending → unsorted) automatically. The ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'ds.sort'
            ),
            ' signal reflects the current sort state, and ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'ds.resetAll()'
            ),
            ' clears sorting alongside filters and selection.'
          ),
          CodeBlock(SORTING_CODE, 'typescript')
        )
      ),

      // Section 4: Filtering
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:filter', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Filtering')
          ),

          // Column filters
          html.div(
            attr.class('space-y-3'),
            html.h3(
              attr.class('text-sm font-semibold text-gray-700 dark:text-gray-300'),
              'Column Filters (inline UI)'
            ),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'Use ',
              html.code(
                attr.class('px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'),
                'ColumnFilter'
              ),
              ' for text search and select filters rendered inline in the table header.',
              ' For numeric ranges and advanced controls, use ',
              html.code(
                attr.class('px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'),
                'ColumnFilterPanel'
              ),
              '.'
            ),
            CodeBlock(COLUMN_FILTER_CODE, 'typescript')
          ),

          // Programmatic filters
          html.div(
            attr.class('space-y-3'),
            html.h3(
              attr.class('text-sm font-semibold text-gray-700 dark:text-gray-300'),
              'Programmatic Filters'
            ),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'The ',
              html.code(
                attr.class('px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'),
                'Filter'
              ),
              ' namespace exposes factory functions for every built-in filter type. Filters are composable — call ',
              html.code(
                attr.class('px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'),
                'ds.addFilter()'
              ),
              ' to stack multiple conditions, or ',
              html.code(
                attr.class('px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'),
                'ds.resetFilters()'
              ),
              ' to clear them all.'
            ),
            CodeBlock(PROGRAMMATIC_FILTER_CODE, 'typescript')
          )
        )
      ),

      // Section 5: Row Selection
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:check-square', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Row Selection')
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'Place ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'SelectAllCheckbox'
            ),
            ' in the header and ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'SelectionCheckbox'
            ),
            ' in each row. Selected IDs accumulate in the ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'ds.selected'
            ),
            ' signal (a ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'Set<string>'
            ),
            ') which you can read anywhere in your UI.'
          ),
          CodeBlock(ROW_SELECTION_CODE, 'typescript')
        )
      ),

      // Section 6: Pagination
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:chevrons-left-right', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Pagination')
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'Wire the standard ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'Pagination'
            ),
            ' component directly to the data source signals. Page navigation and row count information update reactively as filters change.'
          ),
          CodeBlock(PAGINATION_CODE, 'typescript')
        )
      ),

      // Section 7: Reactive Rows
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:zap', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Reactive Rows')
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'ds.rows'
            ),
            ' signal holds the current page\'s rows as an array of signals. Pair it with ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'ForEach'
            ),
            ' for keyed list rendering and ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'MapSignal'
            ),
            ' for fine-grained cell updates — only the cells that actually changed will re-render.'
          ),
          CodeBlock(REACTIVE_ROWS_CODE, 'typescript')
        )
      ),

      // Section 8: API Reference
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:book-open', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'DataSource API Reference')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Quick reference for the signals and methods returned by ',
            html.code(
              attr.class('px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'),
              'createDataSource()'
            ),
            '.'
          ),
          html.div(
            attr.class('overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700'),
            html.table(
              attr.class('w-full text-sm'),
              html.thead(
                html.tr(
                  attr.class('bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'),
                  html.th(
                    attr.class('px-4 py-2.5 text-left font-semibold text-gray-700 dark:text-gray-300'),
                    'Name'
                  ),
                  html.th(
                    attr.class('px-4 py-2.5 text-left font-semibold text-gray-700 dark:text-gray-300'),
                    'Description'
                  ),
                  html.th(
                    attr.class('px-4 py-2.5 text-left font-semibold text-gray-700 dark:text-gray-300'),
                    'Kind'
                  )
                )
              ),
              html.tbody(
                ...API_ROWS.map((row, i) =>
                  html.tr(
                    attr.class(
                      i % 2 === 0
                        ? 'border-b border-gray-100 dark:border-gray-800'
                        : 'border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50'
                    ),
                    html.td(
                      attr.class('px-4 py-2.5'),
                      html.code(
                        attr.class('font-mono text-xs text-primary-600 dark:text-primary-400'),
                        row.name
                      )
                    ),
                    html.td(
                      attr.class('px-4 py-2.5 text-gray-600 dark:text-gray-400'),
                      row.description
                    ),
                    html.td(
                      attr.class('px-4 py-2.5'),
                      Badge(
                        {
                          variant: 'light',
                          color: row.type === 'signal' ? 'primary' : 'secondary',
                          size: 'xs',
                        },
                        row.type
                      )
                    )
                  )
                )
              )
            )
          )
        )
      ),

      // Section 9: Async Data Loading
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:cloud-download', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Async Data Loading')
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'createQueryDataSource'
            ),
            ' bridges async data fetching with DataTable. It watches a reactive request signal, debounces changes, and calls your ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'load'
            ),
            ' function with an abort signal for automatic cancellation. ',
            html.code(
              attr.class('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'),
              'QueryDataTable'
            ),
            ' is the convenience wrapper that combines query data sourcing with the full DataTable UI in a single call.'
          ),

          // Headless usage
          html.div(
            attr.class('space-y-3'),
            html.h3(
              attr.class('text-sm font-semibold text-gray-700 dark:text-gray-300'),
              'createQueryDataSource (headless)'
            ),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'Use ',
              html.code(
                attr.class('px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'),
                'createQueryDataSource'
              ),
              ' when you need full control over the table layout. It returns reactive ',
              html.code(
                attr.class('px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'),
                'data'
              ),
              ' and ',
              html.code(
                attr.class('px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'),
                'loading'
              ),
              ' signals that you wire into DataTable or your own components.'
            ),
            CodeBlock(QUERY_DATA_SOURCE_CODE, 'typescript')
          ),

          // Convenience wrapper
          html.div(
            attr.class('space-y-3'),
            html.h3(
              attr.class('text-sm font-semibold text-gray-700 dark:text-gray-300'),
              'QueryDataTable (convenience)'
            ),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              html.code(
                attr.class('px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'),
                'QueryDataTable'
              ),
              ' combines the query data source with DataTable in a single component. Pass your ',
              html.code(
                attr.class('px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'),
                'load'
              ),
              ' function alongside the standard DataTable options.'
            ),
            CodeBlock(QUERY_DATA_TABLE_CODE, 'typescript')
          )
        )
      )
    ),
  })
}
