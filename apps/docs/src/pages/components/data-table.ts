import {
  DataTable,
  Badge,
  Icon,
  type DataTablePaginationOptions,
  type DataTableToolbarOptions,
} from '@tempots/beatui'
import { html, attr, prop, style, Value, MapSignal } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'DataTable',
  category: 'Tables',
  component: 'DataTable',
  description:
    'A full-featured data table with sorting, filtering, row selection, pagination, and bulk actions. Each feature is opt-in and configurable per column.',
  icon: 'lucide:table-2',
  order: 11,
}

interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Editor' | 'Viewer'
  status: 'Active' | 'Inactive' | 'Pending'
  joined: string
}

const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Admin',
    status: 'Active',
    joined: '2023-01-15',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'Editor',
    status: 'Active',
    joined: '2023-03-22',
  },
  {
    id: '3',
    name: 'Carol White',
    email: 'carol@example.com',
    role: 'Viewer',
    status: 'Inactive',
    joined: '2023-05-10',
  },
  {
    id: '4',
    name: 'David Lee',
    email: 'david@example.com',
    role: 'Editor',
    status: 'Active',
    joined: '2023-07-01',
  },
  {
    id: '5',
    name: 'Eve Martinez',
    email: 'eve@example.com',
    role: 'Viewer',
    status: 'Pending',
    joined: '2023-08-19',
  },
  {
    id: '6',
    name: 'Frank Wilson',
    email: 'frank@example.com',
    role: 'Admin',
    status: 'Active',
    joined: '2022-11-30',
  },
  {
    id: '7',
    name: 'Grace Chen',
    email: 'grace@example.com',
    role: 'Editor',
    status: 'Active',
    joined: '2024-01-05',
  },
  {
    id: '8',
    name: 'Hank Brown',
    email: 'hank@example.com',
    role: 'Viewer',
    status: 'Inactive',
    joined: '2023-09-14',
  },
  {
    id: '9',
    name: 'Iris Taylor',
    email: 'iris@example.com',
    role: 'Editor',
    status: 'Pending',
    joined: '2024-02-20',
  },
  {
    id: '10',
    name: 'Jack Davis',
    email: 'jack@example.com',
    role: 'Viewer',
    status: 'Active',
    joined: '2022-06-08',
  },
  {
    id: '11',
    name: 'Karen Moore',
    email: 'karen@example.com',
    role: 'Admin',
    status: 'Active',
    joined: '2023-12-01',
  },
  {
    id: '12',
    name: 'Leo Garcia',
    email: 'leo@example.com',
    role: 'Viewer',
    status: 'Inactive',
    joined: '2023-04-17',
  },
  {
    id: '13',
    name: 'Mia Hernandez',
    email: 'mia@example.com',
    role: 'Editor',
    status: 'Active',
    joined: '2024-03-10',
  },
  {
    id: '14',
    name: 'Noah Kim',
    email: 'noah@example.com',
    role: 'Viewer',
    status: 'Active',
    joined: '2023-10-25',
  },
  {
    id: '15',
    name: 'Olivia Patel',
    email: 'olivia@example.com',
    role: 'Admin',
    status: 'Active',
    joined: '2022-08-14',
  },
  {
    id: '16',
    name: 'Paul Robinson',
    email: 'paul@example.com',
    role: 'Editor',
    status: 'Inactive',
    joined: '2023-06-30',
  },
  {
    id: '17',
    name: 'Quinn Foster',
    email: 'quinn@example.com',
    role: 'Viewer',
    status: 'Pending',
    joined: '2024-04-02',
  },
  {
    id: '18',
    name: 'Rachel Young',
    email: 'rachel@example.com',
    role: 'Editor',
    status: 'Active',
    joined: '2023-11-18',
  },
  {
    id: '19',
    name: 'Sam Turner',
    email: 'sam@example.com',
    role: 'Viewer',
    status: 'Active',
    joined: '2022-12-05',
  },
  {
    id: '20',
    name: 'Tina Brooks',
    email: 'tina@example.com',
    role: 'Admin',
    status: 'Active',
    joined: '2024-01-22',
  },
  {
    id: '21',
    name: 'Uma Vargas',
    email: 'uma@example.com',
    role: 'Editor',
    status: 'Inactive',
    joined: '2023-07-09',
  },
  {
    id: '22',
    name: 'Victor Nguyen',
    email: 'victor@example.com',
    role: 'Viewer',
    status: 'Active',
    joined: '2023-02-28',
  },
  {
    id: '23',
    name: 'Wendy Scott',
    email: 'wendy@example.com',
    role: 'Editor',
    status: 'Pending',
    joined: '2024-05-15',
  },
  {
    id: '24',
    name: 'Xavier Diaz',
    email: 'xavier@example.com',
    role: 'Viewer',
    status: 'Active',
    joined: '2022-09-20',
  },
  {
    id: '25',
    name: 'Yara Cooper',
    email: 'yara@example.com',
    role: 'Admin',
    status: 'Active',
    joined: '2023-08-03',
  },
]

const statusColor = (status: string) => {
  if (status === 'Active') return 'success'
  if (status === 'Inactive') return 'base'
  return 'warning'
}

const roleColor = (role: string) => {
  if (role === 'Admin') return 'danger'
  if (role === 'Editor') return 'primary'
  return 'base'
}

export default function DataTablePage() {
  return ComponentPage(meta, {
    playground: manualPlayground('DataTable', signals => {
      const data = prop(sampleUsers)

      // Convert boolean pagination signal → config object or false
      const paginationConfig = Value.map(
        signals.pagination as Value<boolean>,
        (v): { pageSize: number } | boolean => (v ? { pageSize: 5 } : false)
      ) as Value<{ pageSize: number } | boolean>

      // Convert boolean toolbar signal → true or false
      const toolbarConfig = Value.map(
        signals.toolbar as Value<boolean>,
        (v): boolean => !!v
      ) as Value<boolean>

      // groupBy signal (optional union → string | undefined)
      const groupBySignal = signals.groupBy as Value<string | undefined>

      return DataTable<User>({
        data,
        rowId: u => u.id,
        sortable: signals.sortable,
        filterable: signals.filterable,
        selectable: signals.selectable,
        reorderableColumns: signals.reorderableColumns as Value<boolean>,
        hoverable: signals.hoverable as Value<boolean>,
        size: signals.size,
        withStripedRows: signals.withStripedRows as Value<boolean>,
        withTableBorder: signals.withTableBorder as Value<boolean>,
        withColumnBorders: signals.withColumnBorders as Value<boolean>,
        withRowBorders: signals.withRowBorders as Value<boolean>,
        loading: signals.loading as Value<boolean>,
        showFooter: signals.showFooter as Value<boolean>,
        groupBy: groupBySignal,
        groupCollapsible: Value.get(signals.groupCollapsible) as boolean,
        fullWidth: true,
        pagination: paginationConfig as unknown as Value<
          DataTablePaginationOptions | boolean
        >,
        toolbar: toolbarConfig as unknown as Value<
          DataTableToolbarOptions | boolean
        >,
        columns: [
          {
            id: 'name',
            header: 'Name',
            cell: row => row.map(r => r.name),
            sortable: true,
            filter: true,
            footer: rows => rows.map(r => `${r.length} users`),
          },
          {
            id: 'email',
            header: 'Email',
            cell: row => row.map(r => r.email),
            sortable: true,
          },
          {
            id: 'role',
            header: 'Role',
            cell: row =>
              MapSignal(row, r =>
                Badge({ color: roleColor(r.role), size: 'sm' }, r.role)
              ),
            filter: {
              type: 'tags',
              options: [
                { value: 'Admin', label: 'Admin' },
                { value: 'Editor', label: 'Editor' },
                { value: 'Viewer', label: 'Viewer' },
              ],
            },
            value: r => r.role,
          },
          {
            id: 'status',
            header: 'Status',
            cell: row =>
              MapSignal(row, r =>
                Badge({ color: statusColor(r.status), size: 'sm' }, r.status)
              ),
            filter: {
              type: 'select',
              options: [
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Pending', label: 'Pending' },
              ],
            },
            value: r => r.status,
          },
        ],
      })
    }),
    sections: [
      Section(
        'Basic Table',
        () =>
          DataTable<User>({
            data: sampleUsers,
            rowId: u => u.id,
            fullWidth: true,
            columns: [
              { id: 'name', header: 'Name', cell: row => row.map(r => r.name) },
              {
                id: 'email',
                header: 'Email',
                cell: row => row.map(r => r.email),
              },
              {
                id: 'role',
                header: 'Role',
                cell: row => row.map((r): string => r.role),
              },
              {
                id: 'status',
                header: 'Status',
                cell: row => row.map((r): string => r.status),
              },
            ],
          }),
        'A minimal DataTable with static data. No sorting, filtering, or pagination by default.'
      ),
      Section(
        'Sortable Columns',
        () =>
          DataTable<User>({
            data: sampleUsers,
            rowId: u => u.id,
            sortable: true,
            fullWidth: true,
            hoverable: true,
            columns: [
              {
                id: 'name',
                header: 'Name',
                cell: row => row.map(r => r.name),
                sortable: true,
              },
              {
                id: 'email',
                header: 'Email',
                cell: row => row.map(r => r.email),
                sortable: true,
              },
              {
                id: 'role',
                header: 'Role',
                cell: row => row.map((r): string => r.role),
                sortable: true,
                value: r => r.role,
              },
              {
                id: 'joined',
                header: 'Joined',
                cell: row => row.map(r => r.joined),
                sortable: true,
                value: r => r.joined,
              },
            ],
          }),
        'Enable sorting globally with sortable: true and per-column with column.sortable: true. Click column headers to sort.'
      ),
      Section(
        'With Filtering',
        () =>
          DataTable<User>({
            data: sampleUsers,
            rowId: u => u.id,
            sortable: true,
            filterable: true,
            fullWidth: true,
            columns: [
              {
                id: 'name',
                header: 'Name',
                cell: row => row.map(r => r.name),
                sortable: true,
                filter: true,
              },
              {
                id: 'email',
                header: 'Email',
                cell: row => row.map(r => r.email),
                sortable: true,
                filter: true,
              },
              {
                id: 'role',
                header: 'Role',
                cell: row =>
                  MapSignal(row, r =>
                    Badge({ color: roleColor(r.role), size: 'sm' }, r.role)
                  ),
                value: r => r.role,
                filter: {
                  type: 'tags',
                  options: [
                    { value: 'Admin', label: 'Admin' },
                    { value: 'Editor', label: 'Editor' },
                    { value: 'Viewer', label: 'Viewer' },
                  ],
                },
              },
              {
                id: 'status',
                header: 'Status',
                cell: row =>
                  MapSignal(row, r =>
                    Badge(
                      { color: statusColor(r.status), size: 'sm' },
                      r.status
                    )
                  ),
                value: r => r.status,
                filter: {
                  type: 'select',
                  options: [
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                    { value: 'Pending', label: 'Pending' },
                  ],
                },
              },
            ],
          }),
        'Enable filtering with filterable: true and per-column filter config. Text, select, and tags (multi-select) filters are supported.'
      ),
      Section(
        'Row Selection',
        () => {
          const selected = prop<Set<string>>(new Set())
          return html.div(
            attr.class('flex flex-col gap-3'),
            DataTable<User>({
              data: sampleUsers.slice(0, 5),
              rowId: u => u.id,
              selectable: true,
              hoverable: true,
              fullWidth: true,
              onSelectionChange: s => selected.set(new Set(s)),
              columns: [
                {
                  id: 'name',
                  header: 'Name',
                  cell: row => row.map(r => r.name),
                },
                {
                  id: 'role',
                  header: 'Role',
                  cell: row => row.map((r): string => r.role),
                },
                {
                  id: 'status',
                  header: 'Status',
                  cell: row => row.map((r): string => r.status),
                },
              ],
            }),
            html.p(
              attr.class('text-sm text-gray-500'),
              selected.map(s =>
                s.size > 0
                  ? `Selected ${s.size} row${s.size > 1 ? 's' : ''}: ${Array.from(s).join(', ')}`
                  : 'No rows selected'
              )
            )
          )
        },
        'Enable row selection with selectable: true. A checkbox column appears and onSelectionChange fires with the selected row IDs.'
      ),
      Section(
        'Pagination',
        () =>
          DataTable<User>({
            data: sampleUsers,
            rowId: u => u.id,
            hoverable: true,
            fullWidth: true,
            pagination: { pageSize: 4, showFirstLast: true },
            columns: [
              { id: 'name', header: 'Name', cell: row => row.map(r => r.name) },
              {
                id: 'email',
                header: 'Email',
                cell: row => row.map(r => r.email),
              },
              {
                id: 'role',
                header: 'Role',
                cell: row => row.map((r): string => r.role),
              },
              {
                id: 'joined',
                header: 'Joined',
                cell: row => row.map(r => r.joined),
              },
            ],
          }),
        'Enable client-side pagination with the pagination option. pageSize controls rows per page.'
      ),
      Section(
        'Striped Rows',
        () =>
          DataTable<User>({
            data: sampleUsers.slice(0, 6),
            rowId: u => u.id,
            fullWidth: true,
            withStripedRows: true,
            columns: [
              { id: 'name', header: 'Name', cell: row => row.map(r => r.name) },
              {
                id: 'email',
                header: 'Email',
                cell: row => row.map(r => r.email),
              },
              {
                id: 'role',
                header: 'Role',
                cell: row => row.map((r): string => r.role),
              },
            ],
          }),
        'Striped rows improve readability for dense tables.'
      ),
      Section(
        'Grouped Rows',
        () =>
          DataTable<User>({
            data: sampleUsers,
            rowId: u => u.id,
            fullWidth: true,
            hoverable: true,
            groupBy: 'role',
            groupCollapsible: true,
            columns: [
              { id: 'name', header: 'Name', cell: row => row.map(r => r.name) },
              {
                id: 'email',
                header: 'Email',
                cell: row => row.map(r => r.email),
              },
              {
                id: 'role',
                header: 'Role',
                cell: row =>
                  MapSignal(row, r =>
                    Badge({ color: roleColor(r.role), size: 'sm' }, r.role)
                  ),
              },
              {
                id: 'status',
                header: 'Status',
                cell: row => row.map((r): string => r.status),
              },
            ],
          }),
        'Group rows by a column with groupBy. Collapsible group headers are shown by default when groupCollapsible is true.'
      ),
      Section(
        'Row Details (Collapsible)',
        () =>
          DataTable<User>({
            data: sampleUsers.slice(0, 6),
            rowId: u => u.id,
            fullWidth: true,
            hoverable: true,
            columns: [
              { id: 'name', header: 'Name', cell: row => row.map(r => r.name) },
              {
                id: 'email',
                header: 'Email',
                cell: row => row.map(r => r.email),
              },
              {
                id: 'role',
                header: 'Role',
                cell: row =>
                  MapSignal(row, r =>
                    Badge({ color: roleColor(r.role), size: 'sm' }, r.role)
                  ),
              },
              {
                id: 'status',
                header: 'Status',
                cell: row =>
                  MapSignal(row, r =>
                    Badge(
                      { color: statusColor(r.status), size: 'sm' },
                      r.status
                    )
                  ),
              },
            ],
            rowDetails: {
              render: row =>
                html.div(
                  attr.class('flex flex-col gap-1 p-3 text-sm'),
                  html.div(
                    attr.class('flex gap-2'),
                    html.span(attr.class('font-medium text-gray-500'), 'Email:'),
                    MapSignal(row, r =>
                      html.span(attr.class('text-gray-800'), r.email)
                    )
                  ),
                  html.div(
                    attr.class('flex gap-2'),
                    html.span(attr.class('font-medium text-gray-500'), 'Role:'),
                    MapSignal(row, r =>
                      html.span(attr.class('text-gray-800'), r.role)
                    )
                  )
                ),
            },
          }),
        'Row details panels expand below each row with a smooth animation. Click the chevron to toggle.'
      ),
      Section(
        'Row Details with Grouping & Selection',
        () =>
          DataTable<User>({
            data: sampleUsers.slice(0, 12),
            rowId: u => u.id,
            fullWidth: true,
            hoverable: true,
            selectable: true,
            groupBy: 'role',
            groupCollapsible: true,
            withStripedRows: true,
            columns: [
              { id: 'name', header: 'Name', cell: row => row.map(r => r.name) },
              {
                id: 'email',
                header: 'Email',
                cell: row => row.map(r => r.email),
              },
              {
                id: 'role',
                header: 'Role',
                cell: row =>
                  MapSignal(row, r =>
                    Badge({ color: roleColor(r.role), size: 'sm' }, r.role)
                  ),
                value: r => r.role,
              },
              {
                id: 'status',
                header: 'Status',
                cell: row =>
                  MapSignal(row, r =>
                    Badge(
                      { color: statusColor(r.status), size: 'sm' },
                      r.status
                    )
                  ),
              },
            ],
            rowDetails: {
              render: row =>
                html.div(
                  attr.class('flex flex-col gap-1 p-3 text-sm'),
                  html.div(
                    attr.class('flex gap-2'),
                    html.span(attr.class('font-medium text-gray-500'), 'Email:'),
                    MapSignal(row, r =>
                      html.span(attr.class('text-gray-800'), r.email)
                    )
                  ),
                  html.div(
                    attr.class('flex gap-2'),
                    html.span(
                      attr.class('font-medium text-gray-500'),
                      'Joined:'
                    ),
                    MapSignal(row, r =>
                      html.span(attr.class('text-gray-800'), r.joined)
                    )
                  )
                ),
            },
          }),
        'Row details work alongside grouping, selection, and striped rows. The toggle column appears before the selection checkbox.'
      ),
      Section(
        'Row Details (Always Visible)',
        () =>
          DataTable<User>({
            data: sampleUsers.slice(0, 6),
            rowId: u => u.id,
            fullWidth: true,
            hoverable: true,
            columns: [
              { id: 'name', header: 'Name', cell: row => row.map(r => r.name) },
              {
                id: 'email',
                header: 'Email',
                cell: row => row.map(r => r.email),
              },
              {
                id: 'role',
                header: 'Role',
                cell: row =>
                  MapSignal(row, r =>
                    Badge({ color: roleColor(r.role), size: 'sm' }, r.role)
                  ),
              },
              {
                id: 'status',
                header: 'Status',
                cell: row =>
                  MapSignal(row, r =>
                    Badge(
                      { color: statusColor(r.status), size: 'sm' },
                      r.status
                    )
                  ),
              },
            ],
            rowDetails: {
              defaultState: 'always-visible',
              render: row =>
                html.div(
                  attr.class('flex flex-col gap-1 p-3 text-sm'),
                  html.div(
                    attr.class('flex gap-2'),
                    html.span(attr.class('font-medium text-gray-500'), 'Email:'),
                    MapSignal(row, r =>
                      html.span(attr.class('text-gray-800'), r.email)
                    )
                  ),
                  html.div(
                    attr.class('flex gap-2'),
                    html.span(attr.class('font-medium text-gray-500'), 'Role:'),
                    MapSignal(row, r =>
                      html.span(attr.class('text-gray-800'), r.role)
                    )
                  )
                ),
            },
          }),
        'When set to always-visible, detail panels are always shown with no toggle column.'
      ),
      Section(
        'Row Details (Conditional)',
        () =>
          DataTable<User>({
            data: sampleUsers.slice(0, 8),
            rowId: u => u.id,
            fullWidth: true,
            hoverable: true,
            columns: [
              { id: 'name', header: 'Name', cell: row => row.map(r => r.name) },
              {
                id: 'email',
                header: 'Email',
                cell: row => row.map(r => r.email),
              },
              {
                id: 'role',
                header: 'Role',
                cell: row =>
                  MapSignal(row, r =>
                    Badge({ color: roleColor(r.role), size: 'sm' }, r.role)
                  ),
              },
              {
                id: 'status',
                header: 'Status',
                cell: row =>
                  MapSignal(row, r =>
                    Badge(
                      { color: statusColor(r.status), size: 'sm' },
                      r.status
                    )
                  ),
              },
            ],
            rowDetails: {
              hasDetails: row => Value.get(row).role === 'Admin',
              render: row =>
                html.div(
                  attr.class('flex flex-col gap-1 p-3 text-sm'),
                  html.div(
                    attr.class('flex gap-2'),
                    html.span(attr.class('font-medium text-gray-500'), 'Email:'),
                    MapSignal(row, r =>
                      html.span(attr.class('text-gray-800'), r.email)
                    )
                  ),
                  html.div(
                    attr.class('flex gap-2'),
                    html.span(attr.class('font-medium text-gray-500'), 'Role:'),
                    MapSignal(row, r =>
                      html.span(attr.class('text-gray-800'), r.role)
                    )
                  )
                ),
            },
          }),
        'Use hasDetails to control which rows have expandable details. Only Admin users have details in this example.'
      ),
      Section(
        'Sticky Header',
        () =>
          html.div(
            style.height('400px'),
            DataTable<User>({
              data: sampleUsers,
              rowId: u => u.id,
              stickyHeader: true,
              hoverable: true,
              fullWidth: true,
              sortable: true,
              filterable: true,
              toolbar: true,
              columns: [
                {
                  id: 'name',
                  header: 'Name',
                  cell: row => row.map(r => r.name),
                  sortable: true,
                },
                {
                  id: 'email',
                  header: 'Email',
                  cell: row => row.map(r => r.email),
                  sortable: true,
                },
                {
                  id: 'role',
                  header: 'Role',
                  cell: row =>
                    MapSignal(row, r =>
                      Badge({ color: roleColor(r.role), size: 'sm' }, r.role)
                    ),
                  value: r => r.role,
                },
                {
                  id: 'status',
                  header: 'Status',
                  cell: row =>
                    MapSignal(row, r =>
                      Badge(
                        { color: statusColor(r.status), size: 'sm' },
                        r.status
                      )
                    ),
                  value: r => r.status,
                },
              ],
            })
          ),
        'When stickyHeader is enabled, the toolbar stays pinned at the top and the table header remains fixed while the body scrolls. The parent must provide a height constraint.'
      ),
      Section(
        'Sticky Header with Pagination',
        () =>
          html.div(
            style.height('400px'),
            DataTable<User>({
              data: sampleUsers,
              rowId: u => u.id,
              stickyHeader: true,
              hoverable: true,
              fullWidth: true,
              withStripedRows: true,
              pagination: { pageSize: 15 },
              columns: [
                {
                  id: 'name',
                  header: 'Name',
                  cell: row => row.map(r => r.name),
                },
                {
                  id: 'email',
                  header: 'Email',
                  cell: row => row.map(r => r.email),
                },
                {
                  id: 'role',
                  header: 'Role',
                  cell: row =>
                    MapSignal(row, r =>
                      Badge({ color: roleColor(r.role), size: 'sm' }, r.role)
                    ),
                  value: r => r.role,
                },
                {
                  id: 'status',
                  header: 'Status',
                  cell: row =>
                    MapSignal(row, r =>
                      Badge(
                        { color: statusColor(r.status), size: 'sm' },
                        r.status
                      )
                    ),
                  value: r => r.status,
                },
              ],
            })
          ),
        'With pagination enabled, it sticks to the bottom of the container while the table body scrolls between the fixed header and pagination.'
      ),
      Section(
        'Full Featured',
        () =>
          DataTable<User>({
            data: prop(sampleUsers),
            rowId: u => u.id,
            sortable: true,
            filterable: true,
            selectable: true,
            hoverable: true,
            fullWidth: true,
            withStripedRows: true,
            pagination: { pageSize: 5 },
            toolbar: true,
            columns: [
              {
                id: 'name',
                header: 'Name',
                cell: row =>
                  html.div(
                    attr.class('flex items-center gap-2'),
                    Icon({ icon: 'lucide:user', size: 'xs' }),
                    row.map(r => r.name)
                  ),
                sortable: true,
                filter: true,
              },
              {
                id: 'email',
                header: 'Email',
                cell: row => row.map(r => r.email),
                sortable: true,
              },
              {
                id: 'role',
                header: 'Role',
                cell: row =>
                  MapSignal(row, r =>
                    Badge({ color: roleColor(r.role), size: 'sm' }, r.role)
                  ),
                value: r => r.role,
                filter: {
                  type: 'select',
                  options: [
                    { value: 'Admin', label: 'Admin' },
                    { value: 'Editor', label: 'Editor' },
                    { value: 'Viewer', label: 'Viewer' },
                  ],
                },
                sortable: true,
              },
              {
                id: 'status',
                header: 'Status',
                cell: row =>
                  MapSignal(row, r =>
                    Badge(
                      { color: statusColor(r.status), size: 'sm' },
                      r.status
                    )
                  ),
                value: r => r.status,
                filter: {
                  type: 'select',
                  options: [
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                    { value: 'Pending', label: 'Pending' },
                  ],
                },
              },
              {
                id: 'joined',
                header: 'Joined',
                cell: row => row.map(r => r.joined),
                sortable: true,
              },
            ],
          }),
        'A fully configured DataTable combining sorting, filtering, selection, striped rows, toolbar, and pagination.'
      ),
    ],
  })
}
