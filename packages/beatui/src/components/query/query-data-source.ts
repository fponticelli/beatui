import { prop, Signal, Value } from '@tempots/dom'
import { makeQueryResource, type QueryResourceLoadOptions } from '@tempots/ui'
import type { AsyncResult } from '@tempots/std'

/**
 * Options for {@link createQueryDataSource}.
 *
 * @typeParam Req - The request signal type that triggers loading.
 * @typeParam T - The row type in the data array.
 * @typeParam E - The error type (defaults to `unknown`).
 */
export interface QueryDataSourceOptions<Req, T, E = unknown> {
  /** Signal whose changes trigger a new load. */
  request: Value<Req>
  /** Async function that fetches data. Receives an AbortSignal for cancellation. */
  load: (opts: QueryResourceLoadOptions<Req, T[], E>) => Promise<T[]>
  /** Converts unknown errors into the error type E. Required by makeQueryResource. */
  convertError: (error: unknown) => E
  /** Called on successful load. */
  onSuccess?: (value: T[], req: Req) => void
  /** Called on failed load. */
  onError?: (error: E, req: Req) => void
  /** Called after load completes (success or failure). */
  onSettled?: (result: AsyncResult<T[], E>, req: Req) => void
}

/**
 * The result of {@link createQueryDataSource}.
 *
 * @typeParam T - The row type in the data array.
 * @typeParam E - The error type.
 */
export interface QueryDataSourceResult<T, E> {
  /** Stable data signal — updated in-place on successful loads. */
  readonly data: Signal<T[]>
  /** Whether a request is in flight. */
  readonly loading: Signal<boolean>
  /** Last error, or undefined if last load succeeded. */
  readonly error: Signal<E | undefined>
  /** Re-trigger the load with the current request value. */
  readonly reload: () => void
  /** Clean up the QueryResource and all subscriptions. */
  readonly dispose: () => void
}

/**
 * Creates a query-to-signal bridge for use with {@link DataTable}.
 *
 * Wraps `makeQueryResource` and exposes a stable `prop<T[]>` that updates
 * in-place when data arrives. The data signal never changes identity, so
 * DataTable's internal DataSource (and its sort/filter/selection state)
 * is preserved across reloads.
 *
 * @example
 * ```ts
 * const search = prop({ query: '' })
 * const qds = createQueryDataSource({
 *   request: search,
 *   load: async ({ request, abortSignal }) => {
 *     const res = await fetch(`/api/users?q=${request.query}`, { signal: abortSignal })
 *     return res.json()
 *   },
 *   convertError: String,
 * })
 *
 * DataTable({
 *   data: qds.data,
 *   loading: qds.loading,
 *   columns: [...],
 *   rowId: u => u.id,
 * })
 *
 * OnDispose(() => qds.dispose())
 * ```
 */
export function createQueryDataSource<Req, T, E = unknown>(
  options: QueryDataSourceOptions<Req, T, E>
): QueryDataSourceResult<T, E> {
  const data = prop<T[]>([])

  const qr = makeQueryResource<Req, T[], E>({
    request: options.request,
    load: options.load,
    convertError: options.convertError,
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
  })

  // Subscribe to value changes — update stable data signal in-place
  const disposeValueSync = Value.on(qr.value, v => {
    if (v !== undefined) {
      data.set(v)
    }
  })

  return {
    data,
    loading: qr.loading,
    error: qr.error,
    reload: qr.reload,
    dispose: () => {
      disposeValueSync()
      qr.dispose()
    },
  }
}
