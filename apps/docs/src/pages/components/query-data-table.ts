import {
  QueryDataTable,
  createQueryDataSource,
  DataTable,
  Badge,
} from '@tempots/beatui'
import { html, attr, prop, on, MapSignal, OnDispose, Fragment, Signal } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'QueryDataTable',
  category: 'Tables & Data',
  component: 'QueryDataTable',
  description:
    'A DataTable that loads data asynchronously. Wraps createQueryDataSource with DataTable so sort, filter, and selection state persist across reloads.',
  icon: 'lucide:database',
  order: 12,
}

interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Editor' | 'Viewer'
}

const sampleUsers: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Editor' },
  { id: '3', name: 'Carol White', email: 'carol@example.com', role: 'Viewer' },
  { id: '4', name: 'David Lee', email: 'david@example.com', role: 'Editor' },
  { id: '5', name: 'Eve Martinez', email: 'eve@example.com', role: 'Admin' },
  { id: '6', name: 'Frank Wilson', email: 'frank@example.com', role: 'Viewer' },
  { id: '7', name: 'Grace Chen', email: 'grace@example.com', role: 'Editor' },
  { id: '8', name: 'Hank Brown', email: 'hank@example.com', role: 'Viewer' },
  { id: '9', name: 'Iris Taylor', email: 'iris@example.com', role: 'Admin' },
  { id: '10', name: 'Jack Davis', email: 'jack@example.com', role: 'Editor' },
  { id: '11', name: 'Karen Moore', email: 'karen@example.com', role: 'Viewer' },
  { id: '12', name: 'Leo Garcia', email: 'leo@example.com', role: 'Admin' },
]

const roleColor = (role: string) => {
  if (role === 'Admin') return 'danger'
  if (role === 'Editor') return 'primary'
  return 'base'
}

function fakeLoad(
  delay = 500
): (opts: { request: unknown; abortSignal: AbortSignal }) => Promise<User[]> {
  return async ({ abortSignal }) => {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, delay)
      abortSignal.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      })
    })
    return sampleUsers
  }
}

function fakeFailingLoad(): (opts: {
  request: unknown
  abortSignal: AbortSignal
}) => Promise<User[]> {
  return async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 300))
    throw new Error('Network error: failed to fetch users')
  }
}

export default function QueryDataTablePage() {
  const playgroundRequest = prop(0)
  const playground = QueryDataTable<number, User, string, string>({
    request: playgroundRequest,
    load: fakeLoad(500),
    convertError: String,
    columns: [
      { id: 'name', header: 'Name', cell: row => row.map(r => r.name), sortable: true, filter: true },
      { id: 'email', header: 'Email', cell: row => row.map(r => r.email) },
      { id: 'role', header: 'Role', cell: row => row.map((r): string => r.role) },
    ],
    rowId: u => u.id,
    fullWidth: true,
    hoverable: true,
    sortable: true,
    pagination: { pageSize: 5 },
  })

  return ComponentPage(meta, {
    playground,
    sections: [
      Section(
        'Basic Usage',
        () => {
          const request = prop(0)
          return QueryDataTable<number, User, string, string>({
            request,
            load: fakeLoad(500),
            convertError: String,
            rowId: u => u.id,
            fullWidth: true,
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
              },
            ],
          })
        },
        'A minimal QueryDataTable that loads data asynchronously. A loading skeleton is shown while the simulated API call completes.'
      ),
      Section(
        'With Sorting & Filtering',
        () => {
          const request = prop(0)
          return QueryDataTable<number, User, string, string>({
            request,
            load: fakeLoad(500),
            convertError: String,
            rowId: u => u.id,
            fullWidth: true,
            sortable: true,
            filterable: true,
            hoverable: true,
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
            ],
          })
        },
        'Sorting and filtering work the same as DataTable. State persists across reloads because the underlying DataSource is stable.'
      ),
      Section(
        'Custom Error Content',
        () => {
          const request = prop(0)
          return QueryDataTable<number, User, string, string>({
            request,
            load: fakeFailingLoad(),
            convertError: String,
            rowId: u => u.id,
            fullWidth: true,
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
                cell: row => row.map((r): string => r.role),
              },
            ],
            errorContent: (error: Signal<string | undefined>, reload: () => void) =>
              html.div(
                attr.class(
                  'flex flex-col items-center gap-3 p-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                ),
                html.p(
                  attr.class('text-red-600 dark:text-red-400 font-medium'),
                  error.map(e => e ?? 'Unknown error')
                ),
                html.button(
                  attr.class(
                    'px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700'
                  ),
                  on.click(() => reload()),
                  'Try Again'
                )
              ),
          })
        },
        'Use errorContent to render a custom error UI on first-load failure. The callback receives the error signal and a reload function.'
      ),
      Section(
        'With Pagination',
        () => {
          const request = prop(0)
          return QueryDataTable<number, User, string, string>({
            request,
            load: fakeLoad(500),
            convertError: String,
            rowId: u => u.id,
            fullWidth: true,
            hoverable: true,
            pagination: { pageSize: 5 },
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
            ],
          })
        },
        'Client-side pagination works out of the box. The page size is set to 5 rows per page.'
      ),
      Section(
        'Headless Usage (createQueryDataSource)',
        () => {
          const request = prop(0)
          const qds = createQueryDataSource<number, User, string>({
            request,
            load: fakeLoad(500),
            convertError: String,
          })

          return Fragment(
            OnDispose(() => qds.dispose()),
            html.div(
              attr.class('flex flex-col gap-3'),
              html.button(
                attr.class(
                  'self-start px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                ),
                on.click(() => request.set(Date.now())),
                'Reload Data'
              ),
              html.p(
                attr.class('text-sm text-gray-500'),
                qds.loading.map((l): string => (l ? 'Loading...' : 'Ready'))
              ),
              DataTable<User>({
                data: qds.data,
                loading: qds.loading,
                rowId: u => u.id,
                fullWidth: true,
                hoverable: true,
                sortable: true,
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
                ],
              })
            )
          )
        },
        'Use createQueryDataSource directly for full control. It returns data, loading, and error signals that you wire into a regular DataTable. Changing the request signal triggers a reload.'
      ),
    ],
  })
}
