# QueryDataSource Design

## Problem

The `Query` component from `@tempots/ui` and `DataTable`/`DataSource` from BeatUI have a lifecycle mismatch. Query conditionally renders its `success`/`pending`/`failure` children — when a query reloads, the entire success subtree (including DataTable and its internal DataSource) is destroyed and recreated. This loses all sort, filter, pagination, and selection state.

Users work around this by lifting a `prop<T[]>` and DataTable outside of Query, manually wiring `onSuccess` to push data into the signal. This indirection is error-prone and verbose.

## Solution

Two new exports in a `src/components/query/` module:

1. **`createQueryDataSource`** — a query-to-signal bridge. Wraps `makeQueryResource` and exposes a stable `prop<T[]>` that updates in-place when data arrives. No DataSource of its own — DataTable creates its own internally, and the stable signal is what preserves state across reloads.
2. **`QueryDataTable`** — a convenience component that composes the utility with `DataTable` and handles loading/error rendering.

## API: `createQueryDataSource`

**File:** `src/components/query/query-data-source.ts`

### Options

```ts
interface QueryDataSourceOptions<Req, T, E = unknown> {
  /** Signal whose changes trigger a new load. */
  request: Value<Req>
  /** Async function that fetches data. Previous in-flight requests are automatically aborted via AbortSignal. */
  load: (opts: QueryResourceLoadOptions<Req, T[], E>) => Promise<T[]>
  /** Required error converter. When E is `unknown`, use `(e) => e` or `String`. */
  convertError: (error: unknown) => E
  /** Called on successful load. */
  onSuccess?: (value: T[], req: Req) => void
  /** Called on failed load. */
  onError?: (error: E, req: Req) => void
  /** Called after load completes (success or failure). */
  onSettled?: (result: AsyncResult<T[], E>, req: Req) => void
}
```

Note: `convertError` is required because `makeQueryResource` requires it. Users typically pass `String` or `(e) => e as E`.

Note: `onSuccess`/`onError`/`onSettled` are forwarded to `makeQueryResource` as top-level parameters. They are not set inside the `load` function's options object — `createQueryDataSource` handles this wiring.

### Return value

```ts
interface QueryDataSourceResult<T, E> {
  /** Stable data signal — updated in-place, never recreated. This is a Prop<T[]> (writable) exposed as Signal<T[]>. */
  data: Signal<T[]>
  /** Whether a request is in flight. */
  loading: Signal<boolean>
  /** Last error, or undefined. Cleared on next successful load. */
  error: Signal<E | undefined>
  /** Re-trigger the load with the current request value. */
  reload: () => void
  /** Clean up the QueryResource subscription. */
  dispose: () => void
}
```

No `DataSource` is returned. When used with `DataTable`, the table creates its own internal DataSource from the stable `data` signal. Use `DataTable`'s `onDataSource` callback to access it if needed.

### Internal flow

1. Creates a stable `prop<T[]>([])` that serves as the data signal.
2. Calls `makeQueryResource` with the provided `request`, `load`, `convertError`, and callbacks.
3. Subscribes to the QueryResource's `value` signal — when data arrives, calls `data.set(newData)`.
4. Exposes `loading` and `error` directly from the QueryResource.
5. `dispose()` calls `queryResource.dispose()` to abort any in-flight request and clean up subscriptions.

### Cancellation

When `request` changes while a load is in flight, `makeQueryResource` automatically aborts the previous request via `AbortSignal`. The `load` function receives this signal and should forward it to `fetch` or other cancellable APIs. No manual cancellation handling is needed.

### Usage

```ts
const search = prop({ page: 1, query: '' })

const qds = createQueryDataSource({
  request: search,
  load: async ({ request, abortSignal }) => {
    const res = await fetch(`/api/users?q=${request.query}`, { signal: abortSignal })
    return res.json()
  },
  convertError: String,
})

// Use with DataTable — DataTable creates its own internal DataSource
DataTable({
  data: qds.data,
  loading: qds.loading,
  columns: [...],
  rowId: u => u.id,
  pagination: { pageSize: 20 },
  // Access DataTable's internal DataSource if needed:
  onDataSource: ds => { /* ds is the real DataSource driving the table */ },
})

// Clean up
OnDispose(() => qds.dispose())
```

## API: `QueryDataTable`

**File:** `src/components/query/query-data-table.ts`

### Options

```ts
type QueryDataTableOptions<Req, T, C extends string, E = unknown> =
  Omit<DataTableOptions<T, C>, 'data' | 'loading'> & {
    // Query options
    request: Value<Req>
    load: (opts: QueryResourceLoadOptions<Req, T[], E>) => Promise<T[]>
    convertError: (error: unknown) => E
    onSuccess?: (value: T[], req: Req) => void
    onError?: (error: E, req: Req) => void
    onSettled?: (result: AsyncResult<T[], E>, req: Req) => void

    // Error rendering
    errorContent?: (error: Signal<E | undefined>, reload: () => void) => TNode
  }
```

`data` and `loading` are omitted from `DataTableOptions` because `QueryDataTable` manages them internally via `createQueryDataSource`.

### Rendering behavior

- Always mounts `DataTable` so sort/filter/selection state persists across reloads.
- Passes `loading` signal from the query to DataTable's `loading` prop.
- **First load fails (no data yet):** shows `errorContent` (or a default error message with reload button) in place of the table body.
- **Reload fails (stale data exists):** table remains visible with stale data. Does not replace or hide the table.

### Usage

```ts
QueryDataTable({
  request: searchParams,
  load: async ({ request, abortSignal }) => {
    const res = await fetch(`/api/users?q=${request.query}`, { signal: abortSignal })
    return res.json()
  },
  convertError: String,
  columns: [
    { id: 'name', header: 'Name', accessor: u => u.name },
    { id: 'email', header: 'Email', accessor: u => u.email },
  ],
  rowId: u => u.id,
  pagination: { pageSize: 20 },
  sortable: true,
  filterable: 'header',
})
```

## Module structure

```
src/components/query/
  index.ts              — re-exports
  query-data-source.ts  — createQueryDataSource utility
  query-data-table.ts   — QueryDataTable component
```

`src/index.ts` gets a new `export * from './components/query'` line.

`@tempots/ui` is already a peer dependency of `@tempots/beatui` — no changes needed to `package.json`.

## Re-fetch behavior

Re-fetch is user-driven only. The load function is called when the `request` signal changes. When `request` changes while a load is in flight, the previous request is automatically aborted.

If users want sort/filter changes to trigger a re-fetch (server-side pattern), they compose their request signal to include table state:

```ts
const params = computedOf(search, sort, filters)(
  (s, sort, filters) => ({ ...s, sort, filters })
)
const qds = createQueryDataSource({ request: params, ... })
```

## Testing

- Unit tests for `createQueryDataSource`: verify data flows from load → stable signal, loading/error state transitions, reload triggers a new load, dispose cleans up, data signal persists (same reference) across reloads.
- Unit tests for `QueryDataTable`: verify it renders DataTable, passes loading state, shows error content on first-load failure, keeps stale data visible on reload failure.

## Dependencies

- `@tempots/ui` — `makeQueryResource`, `QueryResourceLoadOptions`
- `@tempots/std` — `AsyncResult`
- `@tempots/dom` — `prop`, `Signal`, `Value`, `OnDispose`
- Internal — `DataTable`, `DataTableOptions` types
