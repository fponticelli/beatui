import {
  DataTable,
  Badge,
  Icon,
  SortableHeader,
  SelectionCheckbox,
  SelectAllCheckbox,
  DataToolbar,
  createDataSource,
} from '@tempots/beatui'
import { html, attr, prop, Value, MapSignal, Fragment } from '@tempots/dom'
import {
  ComponentPage,
  manualPlayground,
  Section,
} from '../../framework'
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
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', joined: '2023-01-15' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active', joined: '2023-03-22' },
  { id: '3', name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'Inactive', joined: '2023-05-10' },
  { id: '4', name: 'David Lee', email: 'david@example.com', role: 'Editor', status: 'Active', joined: '2023-07-01' },
  { id: '5', name: 'Eve Martinez', email: 'eve@example.com', role: 'Viewer', status: 'Pending', joined: '2023-08-19' },
  { id: '6', name: 'Frank Wilson', email: 'frank@example.com', role: 'Admin', status: 'Active', joined: '2022-11-30' },
  { id: '7', name: 'Grace Chen', email: 'grace@example.com', role: 'Editor', status: 'Active', joined: '2024-01-05' },
  { id: '8', name: 'Hank Brown', email: 'hank@example.com', role: 'Viewer', status: 'Inactive', joined: '2023-09-14' },
  { id: '9', name: 'Iris Taylor', email: 'iris@example.com', role: 'Editor', status: 'Pending', joined: '2024-02-20' },
  { id: '10', name: 'Jack Davis', email: 'jack@example.com', role: 'Viewer', status: 'Active', joined: '2022-06-08' },
  { id: '11', name: 'Karen Moore', email: 'karen@example.com', role: 'Admin', status: 'Active', joined: '2023-12-01' },
  { id: '12', name: 'Leo Garcia', email: 'leo@example.com', role: 'Viewer', status: 'Inactive', joined: '2023-04-17' },
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
      return DataTable<User>({
        data,
        rowId: u => u.id,
        sortable: signals.sortable,
        filterable: signals.filterable,
        selectable: signals.selectable,
        hoverable: signals.hoverable as Value<boolean>,
        size: signals.size,
        withStripedRows: signals.withStripedRows as Value<boolean>,
        withTableBorder: signals.withTableBorder as Value<boolean>,
        withColumnBorders: signals.withColumnBorders as Value<boolean>,
        fullWidth: true,
        pagination: { pageSize: 5 },
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
          },
          {
            id: 'role',
            header: 'Role',
            cell: row =>
              MapSignal(row, r =>
                Badge({ color: roleColor(r.role), size: 'sm' }, r.role)
              ),
            filter: {
              type: 'select',
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
              { id: 'email', header: 'Email', cell: row => row.map(r => r.email) },
              { id: 'role', header: 'Role', cell: row => row.map((r): string => r.role) },
              { id: 'status', header: 'Status', cell: row => row.map((r): string => r.status) },
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
              { id: 'name', header: 'Name', cell: row => row.map(r => r.name), sortable: true },
              { id: 'email', header: 'Email', cell: row => row.map(r => r.email), sortable: true },
              { id: 'role', header: 'Role', cell: row => row.map((r): string => r.role), sortable: true, value: r => r.role },
              { id: 'joined', header: 'Joined', cell: row => row.map(r => r.joined), sortable: true, value: r => r.joined },
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
              { id: 'name', header: 'Name', cell: row => row.map(r => r.name), sortable: true, filter: true },
              { id: 'email', header: 'Email', cell: row => row.map(r => r.email), sortable: true, filter: true },
              {
                id: 'role',
                header: 'Role',
                cell: row => MapSignal(row, r => Badge({ color: roleColor(r.role), size: 'sm' }, r.role)),
                value: r => r.role,
                filter: {
                  type: 'select',
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
                cell: row => MapSignal(row, r => Badge({ color: statusColor(r.status), size: 'sm' }, r.status)),
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
        'Enable filtering with filterable: true and per-column filter config. Text or select filters are supported.'
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
                { id: 'name', header: 'Name', cell: row => row.map(r => r.name) },
                { id: 'role', header: 'Role', cell: row => row.map((r): string => r.role) },
                { id: 'status', header: 'Status', cell: row => row.map((r): string => r.status) },
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
              { id: 'email', header: 'Email', cell: row => row.map(r => r.email) },
              { id: 'role', header: 'Role', cell: row => row.map((r): string => r.role) },
              { id: 'joined', header: 'Joined', cell: row => row.map(r => r.joined) },
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
              { id: 'email', header: 'Email', cell: row => row.map(r => r.email) },
              { id: 'role', header: 'Role', cell: row => row.map((r): string => r.role) },
            ],
          }),
        'Striped rows improve readability for dense tables.'
      ),
      Section(
        'SortableHeader',
        () => {
          const ds = createDataSource<User, 'name' | 'email' | 'role'>({
            data: sampleUsers,
            rowId: u => u.id,
            accessors: {
              name: u => u.name,
              email: u => u.email,
              role: u => u.role,
            },
          })
          return html.div(
            attr.class('overflow-x-auto'),
            html.table(
              attr.class('w-full border-collapse text-sm'),
              html.thead(
                html.tr(
                  SortableHeader({ dataSource: ds, column: 'name' }, 'Name'),
                  SortableHeader({ dataSource: ds, column: 'email' }, 'Email'),
                  SortableHeader({ dataSource: ds, column: 'role' }, 'Role')
                )
              ),
              html.tbody(
                MapSignal(ds.rows, rows =>
                  Fragment(...rows.map(u =>
                    html.tr(
                      html.td(attr.class('px-3 py-2 border-b'), u.name),
                      html.td(attr.class('px-3 py-2 border-b'), u.email),
                      html.td(attr.class('px-3 py-2 border-b'), u.role)
                    )
                  ))
                )
              )
            )
          )
        },
        'SortableHeader is a standalone <th> component that wires click-to-sort into any DataSource. Clicking cycles through ascending, descending, and no-sort states.'
      ),
      Section(
        'SelectionCheckbox and SelectAllCheckbox',
        () => {
          const ds = createDataSource<User, 'name' | 'role'>({
            data: sampleUsers.slice(0, 5),
            rowId: u => u.id,
            accessors: {
              name: u => u.name,
              role: u => u.role,
            },
          })
          return html.div(
            attr.class('overflow-x-auto'),
            html.table(
              attr.class('w-full border-collapse text-sm'),
              html.thead(
                html.tr(
                  html.th(
                    attr.class('px-3 py-2 border-b text-left'),
                    SelectAllCheckbox({ dataSource: ds })
                  ),
                  html.th(attr.class('px-3 py-2 border-b text-left'), 'Name'),
                  html.th(attr.class('px-3 py-2 border-b text-left'), 'Role')
                )
              ),
              html.tbody(
                MapSignal(ds.rows, rows =>
                  Fragment(...rows.map(u => {
                    const rowId = prop(u.id)
                    const isSelected = ds.selected.map(ids => ids.has(u.id))
                    return html.tr(
                      html.td(
                        attr.class('px-3 py-2 border-b'),
                        SelectionCheckbox({ dataSource: ds, rowId, isSelected })
                      ),
                      html.td(attr.class('px-3 py-2 border-b'), u.name),
                      html.td(attr.class('px-3 py-2 border-b'), u.role)
                    )
                  }))
                )
              )
            )
          )
        },
        'SelectionCheckbox and SelectAllCheckbox wire row and header checkboxes into a DataSource. SelectAllCheckbox renders a tri-state checkbox that selects or deselects all visible rows.'
      ),
      Section(
        'DataToolbar',
        () => {
          const ds = createDataSource<User, 'name' | 'role' | 'status'>({
            data: sampleUsers,
            rowId: u => u.id,
            accessors: {
              name: u => u.name,
              role: u => u.role,
              status: u => u.status,
            },
          })
          return html.div(
            attr.class('flex flex-col gap-3'),
            DataToolbar({
              dataSource: ds,
              bulkActions: [
                {
                  label: 'Export',
                  icon: 'lucide:download',
                  onClick: sel => alert(`Exporting: ${[...sel].join(', ')}`),
                },
                {
                  label: 'Delete',
                  icon: 'lucide:trash-2',
                  onClick: sel => alert(`Deleting: ${[...sel].join(', ')}`),
                },
              ],
            }),
            html.table(
              attr.class('w-full border-collapse text-sm'),
              html.thead(
                html.tr(
                  html.th(attr.class('px-3 py-2 border-b text-left'), SelectAllCheckbox({ dataSource: ds })),
                  html.th(attr.class('px-3 py-2 border-b text-left'), 'Name'),
                  html.th(attr.class('px-3 py-2 border-b text-left'), 'Role'),
                  html.th(attr.class('px-3 py-2 border-b text-left'), 'Status')
                )
              ),
              html.tbody(
                MapSignal(ds.rows, rows =>
                  Fragment(...rows.map(u => {
                    const rowId = prop(u.id)
                    const isSelected = ds.selected.map(ids => ids.has(u.id))
                    return html.tr(
                      html.td(attr.class('px-3 py-2 border-b'), SelectionCheckbox({ dataSource: ds, rowId, isSelected })),
                      html.td(attr.class('px-3 py-2 border-b'), u.name),
                      html.td(attr.class('px-3 py-2 border-b'), u.role),
                      html.td(attr.class('px-3 py-2 border-b'), u.status)
                    )
                  }))
                )
              )
            )
          )
        },
        'DataToolbar displays active sort indicators, filter chips, and selection state for a DataSource. It integrates bulk action buttons that fire with the current selection set.'
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
              { id: 'email', header: 'Email', cell: row => row.map(r => r.email), sortable: true },
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
                    Badge({ color: statusColor(r.status), size: 'sm' }, r.status)
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
              { id: 'joined', header: 'Joined', cell: row => row.map(r => r.joined), sortable: true },
            ],
          }),
        'A fully configured DataTable combining sorting, filtering, selection, striped rows, toolbar, and pagination.'
      ),
    ],
  })
}
