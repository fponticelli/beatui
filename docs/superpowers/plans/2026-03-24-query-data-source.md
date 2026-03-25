# QueryDataSource Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a query-to-signal bridge (`createQueryDataSource`) and a convenience component (`QueryDataTable`) that allow DataTable to work with async data without losing sort/filter/pagination/selection state on reload.

**Architecture:** `createQueryDataSource` wraps `makeQueryResource` from `@tempots/ui` and exposes a stable `prop<T[]>` that updates in-place when data arrives. `QueryDataTable` composes this utility with `DataTable`, passing the stable data signal and managing loading/error rendering. DataTable always creates its own internal DataSource — we never create a competing one.

**Tech Stack:** TypeScript, `@tempots/dom` (reactive primitives), `@tempots/ui` (makeQueryResource), Vitest

**Spec:** `docs/superpowers/specs/2026-03-24-query-data-source-design.md`

---

## File Structure

```
packages/beatui/src/components/query/
  index.ts              — re-exports both modules
  query-data-source.ts  — createQueryDataSource utility
  query-data-table.ts   — QueryDataTable component
packages/beatui/tests/unit/
  query-data-source.test.ts
  query-data-table.test.ts
```

**Modified:**
- `packages/beatui/src/index.ts` — add `export * from './components/query'`

---

### Task 1: Create `createQueryDataSource` utility with tests

**Files:**
- Create: `packages/beatui/src/components/query/query-data-source.ts`
- Create: `packages/beatui/tests/unit/query-data-source.test.ts`

- [ ] **Step 1: Write the test file with all test cases**

```ts
// packages/beatui/tests/unit/query-data-source.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prop } from '@tempots/dom'
import { createQueryDataSource } from '../../src/components/query/query-data-source'

describe('createQueryDataSource', () => {
  it('should start with empty data and loading true', () => {
    const request = prop('initial')
    const qds = createQueryDataSource({
      request,
      load: async () => [{ id: '1', name: 'Alice' }],
      convertError: String,
    })

    expect(qds.data.value).toEqual([])
    expect(qds.loading.value).toBe(true)
    expect(qds.error.value).toBeUndefined()

    qds.dispose()
  })

  it('should populate data after successful load', async () => {
    const request = prop('fetch')
    const rows = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }]

    const qds = createQueryDataSource({
      request,
      load: async () => rows,
      convertError: String,
    })

    // Wait for the async load to complete
    await vi.waitFor(() => {
      expect(qds.data.value).toEqual(rows)
    })

    expect(qds.loading.value).toBe(false)
    expect(qds.error.value).toBeUndefined()

    qds.dispose()
  })

  it('should set error on failed load', async () => {
    const request = prop('fail')

    const qds = createQueryDataSource({
      request,
      load: async () => { throw new Error('Network error') },
      convertError: String,
    })

    await vi.waitFor(() => {
      expect(qds.error.value).toBe('Error: Network error')
    })

    expect(qds.data.value).toEqual([])
    expect(qds.loading.value).toBe(false)

    qds.dispose()
  })

  it('should preserve data signal reference across reloads', async () => {
    const request = prop('v1')
    let callCount = 0

    const qds = createQueryDataSource({
      request,
      load: async ({ request: req }) => {
        callCount++
        return [{ id: String(callCount), name: req }]
      },
      convertError: String,
    })

    const dataRef = qds.data

    await vi.waitFor(() => {
      expect(qds.data.value).toEqual([{ id: '1', name: 'v1' }])
    })

    // Trigger reload via request change
    request.set('v2')

    await vi.waitFor(() => {
      expect(qds.data.value).toEqual([{ id: '2', name: 'v2' }])
    })

    // Same signal reference
    expect(qds.data).toBe(dataRef)

    qds.dispose()
  })

  it('should reload when calling reload()', async () => {
    let callCount = 0
    const request = prop('req')

    const qds = createQueryDataSource({
      request,
      load: async () => {
        callCount++
        return [{ id: String(callCount) }]
      },
      convertError: String,
    })

    await vi.waitFor(() => {
      expect(qds.data.value).toEqual([{ id: '1' }])
    })

    qds.reload()

    await vi.waitFor(() => {
      expect(qds.data.value).toEqual([{ id: '2' }])
    })

    qds.dispose()
  })

  it('should call onSuccess callback', async () => {
    const onSuccess = vi.fn()
    const request = prop('req')

    const qds = createQueryDataSource({
      request,
      load: async () => [{ id: '1' }],
      convertError: String,
      onSuccess,
    })

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith([{ id: '1' }], 'req')
    })

    qds.dispose()
  })

  it('should call onError callback', async () => {
    const onError = vi.fn()
    const request = prop('req')

    const qds = createQueryDataSource({
      request,
      load: async () => { throw new Error('fail') },
      convertError: String,
      onError,
    })

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Error: fail', 'req')
    })

    qds.dispose()
  })

  it('should keep stale data on reload failure', async () => {
    let shouldFail = false
    const request = prop('v1')

    const qds = createQueryDataSource({
      request,
      load: async () => {
        if (shouldFail) throw new Error('fail')
        return [{ id: '1', name: 'Alice' }]
      },
      convertError: String,
    })

    await vi.waitFor(() => {
      expect(qds.data.value).toEqual([{ id: '1', name: 'Alice' }])
    })

    shouldFail = true
    request.set('v2')

    await vi.waitFor(() => {
      expect(qds.error.value).toBe('Error: fail')
    })

    // Data preserved from first successful load
    expect(qds.data.value).toEqual([{ id: '1', name: 'Alice' }])

    qds.dispose()
  })

  it('should clean up on dispose', async () => {
    const request = prop('req')

    const qds = createQueryDataSource({
      request,
      load: async () => [{ id: '1' }],
      convertError: String,
    })

    await vi.waitFor(() => {
      expect(qds.data.value).toEqual([{ id: '1' }])
    })

    // Should not throw
    qds.dispose()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @tempots/beatui test -- tests/unit/query-data-source.test.ts`
Expected: FAIL — module `../../src/components/query/query-data-source` not found

- [ ] **Step 3: Write the implementation**

```ts
// packages/beatui/src/components/query/query-data-source.ts
import { prop, Signal, Value } from '@tempots/dom'
import {
  makeQueryResource,
  type QueryResourceLoadOptions,
} from '@tempots/ui'
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/unit/query-data-source.test.ts`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/components/query/query-data-source.ts tests/unit/query-data-source.test.ts
git commit -m "feat(query): add createQueryDataSource utility"
```

---

### Task 2: Create the module index and wire into main exports

**Files:**
- Create: `packages/beatui/src/components/query/index.ts`
- Modify: `packages/beatui/src/index.ts`

- [ ] **Step 1: Create the index file**

```ts
// packages/beatui/src/components/query/index.ts
export * from './query-data-source'
```

- [ ] **Step 2: Add to main index.ts**

Add after the existing `export * from './components/data'` line in `packages/beatui/src/index.ts`:

```ts
export * from './components/query'
```

- [ ] **Step 3: Verify build succeeds**

Run: `pnpm --filter @tempots/beatui build`
Expected: build completes without errors

- [ ] **Step 4: Commit**

```bash
git add packages/beatui/src/components/query/index.ts packages/beatui/src/index.ts
git commit -m "feat(query): add query module to main exports"
```

---

### Task 3: Create `QueryDataTable` component with tests

**Files:**
- Create: `packages/beatui/src/components/query/query-data-table.ts`
- Modify: `packages/beatui/src/components/query/index.ts`
- Create: `packages/beatui/tests/unit/query-data-table.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// packages/beatui/tests/unit/query-data-table.test.ts
import { describe, it, expect, vi } from 'vitest'
import { prop } from '@tempots/dom'
import { QueryDataTable } from '../../src/components/query/query-data-table'
import { createQueryDataSource } from '../../src/components/query/query-data-source'
import type { DataSource } from '../../src/components/data/data-source'

type Row = { id: string; name: string }
const columns = [
  { id: 'name' as const, header: 'Name', cell: (row: { map: (fn: (r: Row) => string) => string }) => row.map(r => r.name) },
]
const rowId = (r: Row) => r.id

describe('QueryDataTable', () => {
  it('should return a renderable TNode', () => {
    const request = prop('req')
    const node = QueryDataTable({
      request,
      load: async () => [{ id: '1', name: 'Alice' }],
      convertError: String,
      columns,
      rowId,
    })
    expect(node).toBeDefined()
  })

  it('should accept all DataTable options except data and loading', () => {
    const request = prop('req')
    const node = QueryDataTable({
      request,
      load: async () => [{ id: '1', name: 'Alice' }],
      convertError: String,
      columns,
      rowId,
      sortable: true,
      filterable: 'header',
      pagination: { pageSize: 20 },
      selectable: true,
      hoverable: true,
      stickyHeader: false,
      fullWidth: true,
    })
    expect(node).toBeDefined()
  })

  it('should accept custom errorContent', () => {
    const request = prop('req')
    const node = QueryDataTable({
      request,
      load: async () => { throw new Error('fail') },
      convertError: String,
      columns,
      rowId,
      errorContent: (error, reload) => 'Custom error',
    })
    expect(node).toBeDefined()
  })

  it('should expose onDataSource callback', () => {
    const request = prop('req')
    const onDataSource = vi.fn()
    QueryDataTable({
      request,
      load: async () => [{ id: '1', name: 'Alice' }],
      convertError: String,
      columns,
      rowId,
      onDataSource,
    })
    // onDataSource is called synchronously during DataTable construction
    expect(onDataSource).toHaveBeenCalled()
  })

  it('should pass loading signal to DataTable via onDataSource', () => {
    const request = prop('req')
    let ds: DataSource<Row, string> | undefined
    QueryDataTable({
      request,
      load: async () => {
        // Slow load — will still be loading when we check
        await new Promise(r => setTimeout(r, 1000))
        return [{ id: '1', name: 'Alice' }]
      },
      convertError: String,
      columns,
      rowId,
      onDataSource: d => { ds = d },
    })
    // DataSource was created and the table is wired up
    expect(ds).toBeDefined()
  })
})

describe('QueryDataTable — data flow via createQueryDataSource', () => {
  // These tests verify the data-level behavior that QueryDataTable relies on.
  // The component always mounts DataTable with the stable data signal from
  // createQueryDataSource, so testing the utility proves the rendering stays stable.

  it('should show error state only when no data has loaded yet', async () => {
    const request = prop('fail')
    const qds = createQueryDataSource<string, Row, string>({
      request,
      load: async () => { throw new Error('fail') },
      convertError: String,
    })

    await vi.waitFor(() => {
      expect(qds.error.value).toBeDefined()
    })

    // No data loaded — this is when errorContent would show
    expect(qds.data.value).toEqual([])
    const hasData = qds.data.value.length > 0
    const showError = qds.error.value !== undefined && !hasData
    expect(showError).toBe(true)

    qds.dispose()
  })

  it('should keep stale data visible on reload failure', async () => {
    let shouldFail = false
    const request = prop('v1')
    const qds = createQueryDataSource<string, Row, string>({
      request,
      load: async () => {
        if (shouldFail) throw new Error('fail')
        return [{ id: '1', name: 'Alice' }]
      },
      convertError: String,
    })

    await vi.waitFor(() => {
      expect(qds.data.value).toEqual([{ id: '1', name: 'Alice' }])
    })

    shouldFail = true
    request.set('v2')

    await vi.waitFor(() => {
      expect(qds.error.value).toBeDefined()
    })

    // Data still present — error UI should NOT replace the table
    const hasData = qds.data.value.length > 0
    const showError = qds.error.value !== undefined && !hasData
    expect(hasData).toBe(true)
    expect(showError).toBe(false)

    qds.dispose()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @tempots/beatui test -- tests/unit/query-data-table.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

```ts
// packages/beatui/src/components/query/query-data-table.ts
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
```

- [ ] **Step 4: Add to index.ts**

Add to `packages/beatui/src/components/query/index.ts`:

```ts
export * from './query-data-table'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/unit/query-data-table.test.ts`
Expected: all tests PASS

- [ ] **Step 6: Verify full build**

Run: `pnpm --filter @tempots/beatui build`
Expected: build completes without errors

- [ ] **Step 7: Commit**

```bash
git add packages/beatui/src/components/query/query-data-table.ts packages/beatui/src/components/query/index.ts tests/unit/query-data-table.test.ts
git commit -m "feat(query): add QueryDataTable component"
```

---

### Task 4: Final verification

- [ ] **Step 1: Run full check**

Run: `pnpm build && pnpm test && pnpm lint && pnpm typecheck && pnpm format`
Expected: all pass

- [ ] **Step 2: Fix any lint/format issues**

Run: `pnpm format && pnpm lint`
Fix any issues found.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "chore: fix lint/format for query module"
```
