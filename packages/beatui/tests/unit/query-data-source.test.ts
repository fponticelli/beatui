import { describe, it, expect, vi } from 'vitest'
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

    request.set('v2')

    await vi.waitFor(() => {
      expect(qds.data.value).toEqual([{ id: '2', name: 'v2' }])
    })

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

    qds.dispose()
  })
})
