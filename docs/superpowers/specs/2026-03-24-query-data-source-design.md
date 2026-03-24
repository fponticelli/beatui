# QueryDataSource Design

## Problem

The `Query` component from `@tempots/ui` and `DataTable`/`DataSource` from BeatUI have a lifecycle mismatch. Query conditionally renders its `success`/`pending`/`failure` children — when a query reloads, the entire success subtree (including DataTable and its internal DataSource) is destroyed and recreated. This loses all sort, filter, pagination, and selection state.

Users work around this by lifting a `prop<T[]>` and DataTable outside of Query, manually wiring `onSuccess` to push data into the signal. This indirection is error-prone and verbose.

## Solution

Two new exports in a `src/components/query/` module:

1. **`createQueryDataSource`** — a utility that bridges `makeQueryResource` with a stable `DataSource`. Returns signals and a DataSource that persist across reloads.
2. **`QueryDataTable`** — a convenience component that composes the utility with `DataTable` and handles loading/error rendering.

## API: `createQueryDataSource`

**File:** `src/components/query/query-data-source.ts`

### Options

```ts
interface QueryDataSourceOptions<Req, T, C extends string, E = unknown> {
  // Query options
  request: Value<Req>
  load: (opts: QueryResourceLoadOptions<Req, T[], E>) => Promise<T[]>
  convertError?: (error: unknown) => E
  onSuccess?: (value: T[], req: Req) => void
  onError?: (error: E, req: Req) => void
  onSettled?: (result: AsyncResult<T[], E>, req: Req) => void

  // DataSource options (passthrough)
  rowId: (row: T) => string
  accessors?: Partial<Record<C, (row: T) => unknown>>
  comparators?: Partial<Record<C, (a: unknown, b: unknown) => number>>
  initialSort?: SortDescriptor<C>[]
  initialFilters?: FilterBase<C>[]
  pageSize?: Value<number>
  multiSort?: Value<boolean>
  serverSide?: Value<boolean>
  totalRows?: Value<number>
  groupBy?: Value<C | undefined>
  evaluateFilter?: (filter: FilterBase<C>, row: T) => boolean
}
```

### Return value

```ts
interface QueryDataSourceResult<T, C extends string, E> {
  /** Stable data signal — updated in-place, never recreated */
  data: Signal<T[]>
  /** The internal DataSource — sort/filter/selection state persists across reloads */
  dataSource: DataSource<T, C>
  /** Whether a request is in flight */
  loading: Signal<boolean>
  /** Last error, or undefined */
  error: Signal<E | undefined>
  /** Re-trigger the load */
  reload: () => void
  /** Clean up QueryResource and DataSource */
  dispose: () => void
}
```

### Internal flow

1. Creates a stable `prop<T[]>([])` that serves as the data signal.
2. Calls `makeQueryResource` with the provided `request` and `load`.
3. Subscribes to the QueryResource's `value` signal — when data arrives, calls `data.set(newData)`.
4. Creates a `DataSource` with the stable `data` signal and all passthrough options.
5. Exposes `loading` and `error` from the QueryResource.
6. `dispose()` cleans up both the QueryResource and DataSource subscriptions.

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
  rowId: u => u.id,
  pageSize: 20,
})

// Use with DataTable
DataTable({
  data: qds.data,
  loading: qds.loading,
  columns: [...],
  rowId: u => u.id,
  onDataSource: ds => { /* same as qds.dataSource */ },
})

// Clean up
OnDispose(() => qds.dispose())
```

## API: `QueryDataTable`

**File:** `src/components/query/query-data-table.ts`

### Options

```ts
type QueryDataTableOptions<Req, T, C extends string, E = unknown> =
  Omit<DataTableOptions<T, C>, 'data'> & {
    // Query options
    request: Value<Req>
    load: (opts: QueryResourceLoadOptions<Req, T[], E>) => Promise<T[]>
    convertError?: (error: unknown) => E
    onSuccess?: (value: T[], req: Req) => void
    onError?: (error: E, req: Req) => void
    onSettled?: (result: AsyncResult<T[], E>, req: Req) => void

    // Error rendering
    errorContent?: (error: Signal<E | undefined>, reload: () => void) => TNode
  }
```

### Rendering behavior

- Always mounts `DataTable` so sort/filter/selection state persists across reloads.
- Passes `loading` signal to DataTable's existing `loading` prop.
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

## Re-fetch behavior

Re-fetch is user-driven only. The load function is called when the `request` signal changes. If users want sort/filter changes to trigger a re-fetch (server-side pattern), they compose their request signal to include table state:

```ts
const params = computedOf(search, sort, filters)(
  (s, sort, filters) => ({ ...s, sort, filters })
)
const qds = createQueryDataSource({ request: params, ... })
```

## Testing

- Unit tests for `createQueryDataSource`: verify data flows from load → stable signal → DataSource, loading/error states, reload, dispose cleanup, state preservation across reloads.
- Unit tests for `QueryDataTable`: verify it renders DataTable, passes loading state, shows error content on first-load failure, keeps stale data on reload failure.

## Dependencies

- `@tempots/ui` — `makeQueryResource`, `QueryResourceLoadOptions`
- `@tempots/std` — `AsyncResult`
- `@tempots/dom` — `prop`, `Signal`, `Value`, `OnDispose`
- Internal — `createDataSource`, `DataTable`, `DataSource` types
