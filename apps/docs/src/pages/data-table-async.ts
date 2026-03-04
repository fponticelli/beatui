import { html, attr, Fragment, prop, Value, OnDispose } from '@tempots/dom'
import {
  Card,
  DataTable,
  Badge,
  SortDescriptor,
  FilterBase,
} from '@tempots/beatui'

// ── Types ──

type Col = 'name' | 'department' | 'role' | 'salary' | 'location'

interface Employee {
  id: string
  name: string
  department: string
  role: string
  salary: number
  location: string
}

// ── Fake dataset ──

const allEmployees: Employee[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    department: 'Engineering',
    role: 'Senior Engineer',
    salary: 130000,
    location: 'New York',
  },
  {
    id: '2',
    name: 'Bob Smith',
    department: 'Engineering',
    role: 'Staff Engineer',
    salary: 160000,
    location: 'San Francisco',
  },
  {
    id: '3',
    name: 'Carol Williams',
    department: 'Engineering',
    role: 'Junior Engineer',
    salary: 85000,
    location: 'Austin',
  },
  {
    id: '4',
    name: 'Dave Brown',
    department: 'Engineering',
    role: 'Tech Lead',
    salary: 175000,
    location: 'New York',
  },
  {
    id: '5',
    name: 'Eve Davis',
    department: 'Design',
    role: 'UX Designer',
    salary: 110000,
    location: 'San Francisco',
  },
  {
    id: '6',
    name: 'Frank Miller',
    department: 'Design',
    role: 'Senior Designer',
    salary: 125000,
    location: 'Austin',
  },
  {
    id: '7',
    name: 'Grace Wilson',
    department: 'Design',
    role: 'UI Designer',
    salary: 95000,
    location: 'New York',
  },
  {
    id: '8',
    name: 'Hank Moore',
    department: 'Marketing',
    role: 'Marketing Manager',
    salary: 120000,
    location: 'San Francisco',
  },
  {
    id: '9',
    name: 'Ivy Taylor',
    department: 'Marketing',
    role: 'Content Strategist',
    salary: 90000,
    location: 'Austin',
  },
  {
    id: '10',
    name: 'Jack Anderson',
    department: 'Marketing',
    role: 'SEO Specialist',
    salary: 80000,
    location: 'New York',
  },
  {
    id: '11',
    name: 'Karen Thomas',
    department: 'Sales',
    role: 'Account Executive',
    salary: 95000,
    location: 'San Francisco',
  },
  {
    id: '12',
    name: 'Leo Jackson',
    department: 'Sales',
    role: 'Sales Manager',
    salary: 140000,
    location: 'Austin',
  },
  {
    id: '13',
    name: 'Mia White',
    department: 'Sales',
    role: 'SDR',
    salary: 65000,
    location: 'New York',
  },
  {
    id: '14',
    name: 'Nathan Harris',
    department: 'HR',
    role: 'HR Manager',
    salary: 110000,
    location: 'San Francisco',
  },
  {
    id: '15',
    name: 'Olivia Martin',
    department: 'HR',
    role: 'Recruiter',
    salary: 75000,
    location: 'Austin',
  },
  {
    id: '16',
    name: 'Paul Garcia',
    department: 'Engineering',
    role: 'DevOps Engineer',
    salary: 140000,
    location: 'San Francisco',
  },
  {
    id: '17',
    name: 'Quinn Robinson',
    department: 'Engineering',
    role: 'QA Engineer',
    salary: 95000,
    location: 'Austin',
  },
  {
    id: '18',
    name: 'Rachel Clark',
    department: 'Design',
    role: 'Product Designer',
    salary: 115000,
    location: 'New York',
  },
  {
    id: '19',
    name: 'Sam Lewis',
    department: 'Marketing',
    role: 'Growth Lead',
    salary: 130000,
    location: 'San Francisco',
  },
  {
    id: '20',
    name: 'Tina Walker',
    department: 'Sales',
    role: 'VP Sales',
    salary: 180000,
    location: 'New York',
  },
]

// ── Fake async API ──

interface FetchParams {
  sort: SortDescriptor<Col>[]
  filters: FilterBase<Col>[]
  groupBy: Col | undefined
}

function fakeApiFetch(params: FetchParams): Promise<Employee[]> {
  return new Promise(resolve => {
    setTimeout(
      () => {
        let rows = [...allEmployees]

        // Apply text filters (simplified: contains match on the column value)
        for (const f of params.filters) {
          if (
            f.kind === 'text' &&
            'value' in f &&
            typeof f.value === 'string'
          ) {
            const col = f.column as Col
            const query = f.value.toLowerCase()
            rows = rows.filter(r => {
              const val = String(r[col] ?? '').toLowerCase()
              return val.includes(query)
            })
          }
        }

        // Apply sorting
        if (params.sort.length > 0) {
          rows.sort((a, b) => {
            for (const s of params.sort) {
              const av = a[s.column] ?? ''
              const bv = b[s.column] ?? ''
              const cmp = av < bv ? -1 : av > bv ? 1 : 0
              if (cmp !== 0) return s.direction === 'asc' ? cmp : -cmp
            }
            return 0
          })
        }

        // Group-by: sort by group column first to ensure groups are contiguous
        if (params.groupBy) {
          const col = params.groupBy
          rows.sort((a, b) => {
            const av = String(a[col] ?? '')
            const bv = String(b[col] ?? '')
            return av.localeCompare(bv)
          })
        }

        resolve(rows)
      },
      400 + Math.random() * 300
    ) // 400-700ms simulated latency
  })
}

// ── Page ──

export default function DataTableAsyncPage() {
  const data = prop<Employee[]>([])
  const loading = prop(true)
  const log = prop<string[]>([])

  // Current server-side state
  let currentSort: SortDescriptor<Col>[] = []
  let currentFilters: FilterBase<Col>[] = []
  let currentGroupBy: Col | undefined = 'department'

  let fetchId = 0

  function fetchData() {
    const id = ++fetchId
    loading.set(true)
    addLog(
      `Fetching (sort=${currentSort.map(s => `${s.column}:${s.direction}`).join(',') || 'none'}, group=${currentGroupBy ?? 'none'}, filters=${currentFilters.length})`
    )

    fakeApiFetch({
      sort: currentSort,
      filters: currentFilters,
      groupBy: currentGroupBy,
    }).then(rows => {
      // Ignore stale responses
      if (id !== fetchId) return
      data.set(rows)
      loading.set(false)
      addLog(`Received ${rows.length} rows`)
    })
  }

  function addLog(msg: string) {
    const time = new Date().toLocaleTimeString()
    log.set([`[${time}] ${msg}`, ...log.value.slice(0, 9)])
  }

  // Initial fetch
  fetchData()

  return Fragment(
    attr.class('m-4'),
    OnDispose(() => {
      data.dispose()
      loading.dispose()
      log.dispose()
    }),

    html.h2(
      attr.class('text-lg font-semibold mb-2'),
      'Async Server-Side DataTable'
    ),
    html.p(
      attr.class('text-sm text-gray-500 dark:text-gray-400 mb-4'),
      'Demonstrates server-side sorting, filtering, and grouping with a fake async API. ',
      'All data processing happens in the "server" (simulated with setTimeout). ',
      'The DataTable is in ',
      html.code('serverSide'),
      ' mode so it skips client-side processing.'
    ),

    html.div(
      attr.class('flex flex-col space-y-4'),

      // DataTable
      DataTable<Employee, Col>({
        data,
        columns: [
          {
            id: 'name',
            header: 'Name',
            cell: row => row.$.name,
            sortable: true,
            filter: true,
            minWidth: '160px',
          },
          {
            id: 'department',
            header: 'Department',
            cell: row =>
              Badge({ size: 'sm', variant: 'outline' }, row.$.department),
            sortable: true,
            filter: {
              type: 'tags',
              options: [
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Design', label: 'Design' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Sales', label: 'Sales' },
                { value: 'HR', label: 'HR' },
              ],
            },
            align: 'center',
          },
          {
            id: 'role',
            header: 'Role',
            cell: row => row.$.role,
            sortable: true,
            filter: true,
          },
          {
            id: 'salary',
            header: 'Salary',
            cell: row => row.map(r => `$${r.salary.toLocaleString()}`),
            value: row => row.salary,
            sortable: true,
            align: 'right',
            width: '120px',
          },
          {
            id: 'location',
            header: 'Location',
            cell: row => row.$.location,
            sortable: true,
            filter: {
              type: 'tags',
              options: [
                { value: 'New York', label: 'New York' },
                { value: 'San Francisco', label: 'San Francisco' },
                { value: 'Austin', label: 'Austin' },
              ],
            },
          },
        ],
        rowId: row => row.id,
        sortable: true,
        filterable: true,
        serverSide: true,
        loading,
        groupBy: prop<Col | undefined>('department'),
        groupCollapsible: true,
        // fullWidth: true,
        toolbar: true,
        onSortChange: sort => {
          currentSort = sort
          fetchData()
        },
        onFilterChange: filters => {
          currentFilters = filters
          fetchData()
        },
        onGroupByChange: col => {
          currentGroupBy = col
          fetchData()
        },
        emptyContent: 'No employees match your filters',
      }),

      // Request log
      Card(
        {},
        html.h3(attr.class('text-sm font-semibold mb-2'), 'API Request Log'),
        html.div(
          attr.class('font-mono text-xs space-y-1 max-h-48 overflow-y-auto'),
          Value.map(log, entries =>
            entries.length === 0 ? 'No requests yet' : entries.join('\n')
          )
        )
      )
    )
  )
}
