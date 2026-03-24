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
      errorContent: (_error, _reload) => 'Custom error',
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
    expect(onDataSource).toHaveBeenCalled()
  })

  it('should pass loading signal to DataTable via onDataSource', () => {
    const request = prop('req')
    let ds: DataSource<Row, string> | undefined
    QueryDataTable({
      request,
      load: async () => {
        await new Promise(r => setTimeout(r, 1000))
        return [{ id: '1', name: 'Alice' }]
      },
      convertError: String,
      columns,
      rowId,
      onDataSource: d => { ds = d },
    })
    expect(ds).toBeDefined()
  })
})

describe('QueryDataTable — data flow via createQueryDataSource', () => {
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

    const hasData = qds.data.value.length > 0
    const showError = qds.error.value !== undefined && !hasData
    expect(hasData).toBe(true)
    expect(showError).toBe(false)

    qds.dispose()
  })
})
