import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSessionManager } from '../../../src/better-auth/session'
import { createMockBetterAuthClient, failure } from './mock-client'

describe('createSessionManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fetches session on creation', async () => {
    const client = createMockBetterAuthClient()
    const manager = createSessionManager(client)

    // Let the initial fetch resolve
    await vi.runAllTimersAsync()

    expect(client.getSession).toHaveBeenCalled()
    expect(manager.session.value).not.toBeNull()
    expect(manager.user.value).toEqual({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    })
    expect(manager.isAuthenticated.value).toBe(true)
    expect(manager.isPending.value).toBe(false)

    manager.dispose()
  })

  it('sets session to null on error', async () => {
    const client = createMockBetterAuthClient()
    ;(client.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(
      failure('Unauthorized', 401)
    )

    const manager = createSessionManager(client)
    await vi.runAllTimersAsync()

    expect(manager.session.value).toBeNull()
    expect(manager.user.value).toBeNull()
    expect(manager.isAuthenticated.value).toBe(false)
    expect(manager.isPending.value).toBe(false)

    manager.dispose()
  })

  it('sets session to null on exception', async () => {
    const client = createMockBetterAuthClient()
    ;(client.getSession as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    )

    const manager = createSessionManager(client)
    await vi.runAllTimersAsync()

    expect(manager.session.value).toBeNull()
    expect(manager.isPending.value).toBe(false)

    manager.dispose()
  })

  it('polls session at configured interval', async () => {
    const client = createMockBetterAuthClient()
    const manager = createSessionManager(client, {
      refreshInterval: 5000,
    })

    // Let the initial fetch complete
    await vi.advanceTimersByTimeAsync(1)
    expect(client.getSession).toHaveBeenCalledTimes(1)

    // Advance to first poll
    await vi.advanceTimersByTimeAsync(5000)
    expect(client.getSession).toHaveBeenCalledTimes(2)

    // Advance to second poll
    await vi.advanceTimersByTimeAsync(5000)
    expect(client.getSession).toHaveBeenCalledTimes(3)

    manager.dispose()
  })

  it('stops polling on dispose', async () => {
    const client = createMockBetterAuthClient()
    const manager = createSessionManager(client, {
      refreshInterval: 5000,
    })

    // Let the initial fetch complete
    await vi.advanceTimersByTimeAsync(1)
    expect(client.getSession).toHaveBeenCalledTimes(1)

    manager.dispose()

    await vi.advanceTimersByTimeAsync(10000)
    expect(client.getSession).toHaveBeenCalledTimes(1)
  })

  it('calls onSessionChange when session changes', async () => {
    const onSessionChange = vi.fn()
    const client = createMockBetterAuthClient()
    const manager = createSessionManager(client, { onSessionChange })

    await vi.runAllTimersAsync()

    expect(onSessionChange).toHaveBeenCalled()

    manager.dispose()
  })

  it('refresh() updates session', async () => {
    const client = createMockBetterAuthClient()
    ;(client.getSession as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        data: {
          session: { id: 's1' },
          user: { id: 'u1', email: 'a@example.com' },
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          session: { id: 's2' },
          user: { id: 'u2', name: 'Updated', email: 'b@example.com' },
        },
        error: null,
      })

    const manager = createSessionManager(client)
    await vi.runAllTimersAsync()

    expect(manager.user.value?.email).toBe('a@example.com')

    await manager.refresh()
    expect(manager.user.value?.email).toBe('b@example.com')

    manager.dispose()
  })
})
