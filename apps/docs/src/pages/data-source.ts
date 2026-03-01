import {
  html,
  attr,
  computedOf,
  Fragment,
  OnDispose,
  prop,
  ForEach,
  MapSignal,
  When,
} from '@tempots/dom'
import {
  Card,
  Table,
  createDataSource,
  SortableHeader,
  ColumnFilter,
  ColumnFilterPanel,
  SelectAllCheckbox,
  SelectionCheckbox,
  Pagination,
  Button,
  Tag,
  Filter,
  describeFilter,
} from '@tempots/beatui'

interface Employee {
  id: string
  name: string
  department: string
  salary: number
  startDate: string
}

const employees: Employee[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    department: 'Engineering',
    salary: 120000,
    startDate: '2020-03-15',
  },
  {
    id: '2',
    name: 'Bob Smith',
    department: 'Marketing',
    salary: 85000,
    startDate: '2019-07-01',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    department: 'Engineering',
    salary: 110000,
    startDate: '2021-01-10',
  },
  {
    id: '4',
    name: 'Diana Prince',
    department: 'Design',
    salary: 95000,
    startDate: '2022-06-20',
  },
  {
    id: '5',
    name: 'Eve Davis',
    department: 'Engineering',
    salary: 130000,
    startDate: '2018-11-05',
  },
  {
    id: '6',
    name: 'Frank Wilson',
    department: 'Marketing',
    salary: 78000,
    startDate: '2023-02-14',
  },
  {
    id: '7',
    name: 'Grace Lee',
    department: 'Design',
    salary: 102000,
    startDate: '2020-09-01',
  },
  {
    id: '8',
    name: 'Henry Chen',
    department: 'Engineering',
    salary: 115000,
    startDate: '2021-04-22',
  },
]

export default function DataSourcePage() {
  const ds = createDataSource<Employee>({
    data: prop(employees),
    rowId: e => e.id,
    pageSize: 5,
  })

  return Fragment(
    OnDispose(() => ds.dispose()),
    attr.class('m-4'),
    html.h2(
      attr.class('text-lg font-semibold mb-2'),
      'DataSource + Composable Primitives'
    ),
    html.p(
      attr.class('text-sm text-gray-600 dark:text-gray-400 mb-4'),
      'This example uses createDataSource() with individual SortableHeader, ColumnFilter, SelectionCheckbox, and Pagination components composed manually. No DataTable wrapper needed.'
    ),

    // Controls row
    Card(
      {},
      attr.class('flex flex-row items-center gap-3 mb-4 flex-wrap'),
      html.span(attr.class('text-sm font-medium'), 'Actions:'),
      Button(
        { size: 'sm', variant: 'outline', onClick: () => ds.resetAll() },
        'Reset All'
      ),
      Button(
        { size: 'sm', variant: 'outline', onClick: () => ds.selectAll() },
        'Select All'
      ),
      Button(
        { size: 'sm', variant: 'outline', onClick: () => ds.deselectAll() },
        'Deselect All'
      ),
      // Selection count
      When(
        ds.selectedCount.map(c => c > 0),
        () =>
          Tag({
            value: ds.selectedCount.map(c => `${c} selected`),
            color: 'blue',
            size: 'sm',
          })
      ),
      // Active sort indicator
      When(
        ds.sort.map(s => s.length > 0),
        () =>
          Tag({
            value: ds.sort.map(s =>
              s.map(x => `${x.column} ${x.direction}`).join(', ')
            ),
            color: 'green',
            size: 'sm',
          })
      )
    ),

    // Advanced filter controls
    Card(
      {},
      attr.class('flex flex-col gap-3 mb-4'),
      html.span(attr.class('text-sm font-medium'), 'Programmatic Filters:'),
      html.div(
        attr.class('flex flex-row flex-wrap gap-2'),
        Button(
          {
            size: 'sm',
            variant: 'light',
            onClick: () =>
              ds.setFilter(Filter.gt('salary', 100000)),
          },
          'Salary > $100k'
        ),
        Button(
          {
            size: 'sm',
            variant: 'light',
            onClick: () =>
              ds.setFilter(Filter.between('salary', 80000, 120000)),
          },
          'Salary $80k-$120k'
        ),
        Button(
          {
            size: 'sm',
            variant: 'light',
            onClick: () =>
              ds.setFilter(
                Filter.oneOf('department', ['Engineering', 'Design'])
              ),
          },
          'Dept: Eng or Design'
        ),
        Button(
          {
            size: 'sm',
            variant: 'light',
            onClick: () =>
              ds.setFilter(Filter.startsWith('name', 'A')),
          },
          'Name starts with A'
        ),
        Button(
          {
            size: 'sm',
            variant: 'light',
            onClick: () => {
              ds.resetFilters()
              ds.setFilter(Filter.gt('salary', 100000))
              ds.addFilter(Filter.oneOf('department', ['Engineering']))
            },
          },
          'Combined: Salary > $100k AND Engineering'
        ),
        Button(
          {
            size: 'sm',
            variant: 'outline',
            onClick: () => ds.resetFilters(),
          },
          'Clear Filters'
        ),
      ),
      // Active filters display
      When(
        ds.filters.map(f => f.length > 0),
        () =>
          html.div(
            attr.class('flex flex-row flex-wrap gap-2 items-center'),
            html.span(
              attr.class('text-xs font-medium text-gray-500'),
              'Active:'
            ),
            ForEach(ds.filters, filterSignal =>
              Tag({
                value: filterSignal.map(f => describeFilter(f)),
                color: 'violet',
                size: 'sm',
              })
            )
          )
      )
    ),

    // Table with composable primitives
    Table(
      {
        fullWidth: true,
        hoverable: true,
        withRowBorders: true,
        withTableBorder: true,
      },
      html.thead(
        // Header row with sortable headers
        html.tr(
          html.th(
            attr.class('bc-data-table__selection-cell'),
            SelectAllCheckbox({ dataSource: ds, size: 'sm' })
          ),
          SortableHeader(
            { dataSource: ds, column: 'name', size: 'sm' },
            'Name'
          ),
          SortableHeader(
            { dataSource: ds, column: 'department', size: 'sm' },
            'Department'
          ),
          SortableHeader(
            { dataSource: ds, column: 'salary', size: 'sm' },
            'Salary'
          ),
          SortableHeader(
            { dataSource: ds, column: 'startDate', size: 'sm' },
            'Start Date'
          )
        ),
        // Filter row
        html.tr(
          html.th(), // selection column - no filter
          html.th(
            ColumnFilter({
              dataSource: ds,
              column: 'name',
              placeholder: 'Search name...',
            })
          ),
          html.th(
            ColumnFilter({
              dataSource: ds,
              column: 'department',
              type: 'select',
              options: [
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Design', label: 'Design' },
              ],
            })
          ),
          html.th(
            ColumnFilterPanel({
              dataSource: ds,
              column: 'salary',
              columnType: 'number',
              size: 'sm',
            })
          ),
          html.th(
            ColumnFilterPanel({
              dataSource: ds,
              column: 'startDate',
              columnType: 'text',
              size: 'sm',
            })
          )
        )
      ),
      html.tbody(
        ForEach(ds.rows, rowSignal => {
          // Capture ID once — stable per ForEach slot, used to wire reactive selection
          const id = rowSignal.value.id
          return html.tr(
            attr.class(
              ds
                .isSelected(id)
                .map((sel): string =>
                  sel ? 'bc-data-table__row bc-data-table__row--selected' : ''
                )
            ),
            html.td(
              attr.class('bc-data-table__selection-cell'),
              SelectionCheckbox({ dataSource: ds, rowId: id, size: 'sm' })
            ),
            // Use MapSignal so cells re-render reactively when row data changes
            MapSignal(rowSignal, row => html.td(row.name)),
            MapSignal(rowSignal, row => html.td(row.department)),
            MapSignal(rowSignal, row =>
              html.td(
                attr.class('text-right'),
                `$${row.salary.toLocaleString()}`
              )
            ),
            MapSignal(rowSignal, row => html.td(row.startDate))
          )
        }),
        When(
          ds.rows.map(r => r.length === 0),
          () =>
            html.tr(
              html.td(
                attr.colspan(5),
                attr.class('text-center py-8 text-gray-500 italic'),
                'No matching employees found'
              )
            )
        )
      )
    ),

    // Pagination
    html.div(
      attr.class('flex justify-center mt-4'),
      Pagination({
        currentPage: ds.currentPage,
        totalPages: ds.totalPages,
        onPageChange: page => ds.setPage(page),
        showPrevNext: true,
        showFirstLast: true,
        siblings: 1,
        size: 'sm',
      })
    ),

    // Info footer — use computedOf so both signals are tracked reactively
    html.div(
      attr.class('flex justify-between mt-2 text-xs text-gray-500'),
      computedOf(
        ds.totalFilteredRows,
        ds.totalRows
      )((filtered, total) => `${filtered} of ${total} employees`),
      computedOf(
        ds.currentPage,
        ds.totalPages
      )((page, total) => `Page ${page} of ${total}`)
    )
  )
}
