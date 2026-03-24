import {
  computedOf,
  Fragment,
  html,
  attr,
  on,
  OnDispose,
  Signal,
  TNode,
  Value,
  When,
} from '@tempots/dom'
import type { QueryResourceLoadOptions } from '@tempots/ui'
import type { AsyncResult } from '@tempots/std'
import { DataTable } from '../data/data-table'
import type { DataTableOptions } from '../data/data-table-types'
import { createQueryDataSource } from './query-data-source'

/**
 * Options for {@link QueryDataTable}.
 *
 * Combines all {@link DataTableOptions} (except `data` and `loading`, which are
 * managed internally) with query options from {@link QueryDataSourceOptions}.
 *
 * @typeParam Req - The request signal type that triggers loading.
 * @typeParam T - The row type in the data array.
 * @typeParam C - Column ID string union.
 * @typeParam E - The error type (defaults to `unknown`).
 */
export type QueryDataTableOptions<
  Req,
  T,
  C extends string = string,
  E = unknown,
> = Omit<DataTableOptions<T, C>, 'data' | 'loading'> & {
  /** Signal whose changes trigger a new load. */
  request: Value<Req>
  /** Async function that fetches data. */
  load: (opts: QueryResourceLoadOptions<Req, T[], E>) => Promise<T[]>
  /** Converts unknown errors into the error type E. */
  convertError: (error: unknown) => E
  /** Called on successful load. */
  onSuccess?: (value: T[], req: Req) => void
  /** Called on failed load. */
  onError?: (error: E, req: Req) => void
  /** Called after load completes (success or failure). */
  onSettled?: (result: AsyncResult<T[], E>, req: Req) => void
  /**
   * Custom error rendering. When provided, shown instead of default error UI.
   * Only displayed when no data has been loaded yet (first-load failure).
   * On reload failures, stale data remains visible.
   */
  errorContent?: (error: Signal<E | undefined>, reload: () => void) => TNode
}

/**
 * A DataTable that loads data asynchronously via a query.
 *
 * Combines {@link createQueryDataSource} with {@link DataTable} into a single
 * component. The DataTable is always mounted (so sort/filter/selection state
 * persists across reloads), and loading/error states are handled automatically.
 *
 * @example
 * ```ts
 * QueryDataTable({
 *   request: searchParams,
 *   load: async ({ request, abortSignal }) => {
 *     const res = await fetch(`/api/users?q=${request.query}`, { signal: abortSignal })
 *     return res.json()
 *   },
 *   convertError: String,
 *   columns: [
 *     { id: 'name', header: 'Name', cell: row => row.map(r => r.name) },
 *     { id: 'email', header: 'Email', cell: row => row.map(r => r.email) },
 *   ],
 *   rowId: u => u.id,
 *   pagination: { pageSize: 20 },
 *   sortable: true,
 * })
 * ```
 */
export function QueryDataTable<
  Req,
  T,
  C extends string = string,
  E = unknown,
>(options: QueryDataTableOptions<Req, T, C, E>): TNode {
  const {
    request,
    load,
    convertError,
    onSuccess,
    onError,
    onSettled,
    errorContent,
    ...tableOptions
  } = options

  const qds = createQueryDataSource<Req, T, E>({
    request,
    load,
    convertError,
    onSuccess,
    onError,
    onSettled,
  })

  // Track whether we've ever received data
  const hasData = qds.data.map(d => d.length > 0)

  // Show error UI only on first-load failure (no data yet)
  const showError = computedOf(
    qds.error,
    hasData
  )((err, has) => err !== undefined && !has)

  const errorUI: TNode = When(showError, () => {
    if (errorContent) {
      return errorContent(qds.error, qds.reload)
    }
    return html.div(
      attr.class('bc-query-data-table__error'),
      html.p('Failed to load data.'),
      html.button(
        attr.class('bc-query-data-table__retry'),
        on.click(() => qds.reload()),
        'Retry'
      )
    )
  })

  const table = DataTable<T, C>({
    ...(tableOptions as DataTableOptions<T, C>),
    data: qds.data,
    loading: qds.loading,
  })

  return Fragment(
    OnDispose(() => qds.dispose()),
    errorUI,
    table
  )
}
