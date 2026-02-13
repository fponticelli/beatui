import { prop, Signal, computedOf } from '@tempots/dom'
import { BetterAuthClient, BetterAuthSession, BetterAuthUser } from './types'

export interface SessionManager {
  session: Signal<BetterAuthSession | null>
  isPending: Signal<boolean>
  user: Signal<BetterAuthUser | null>
  isAuthenticated: Signal<boolean>
  refresh: () => Promise<void>
  dispose: () => void
}

export function createSessionManager(
  client: BetterAuthClient,
  options: {
    refreshInterval?: number
    onSessionChange?: (session: BetterAuthSession | null) => void
  } = {}
): SessionManager {
  const session = prop<BetterAuthSession | null>(null)
  const isPending = prop(true)
  const user = computedOf(session)(
    (s): BetterAuthUser | null => s?.user ?? null
  )
  const isAuthenticated = computedOf(session)((s): boolean => s != null)

  let intervalId: ReturnType<typeof setInterval> | undefined

  async function refresh() {
    try {
      const result = await client.getSession()
      if (result.error || !result.data) {
        session.set(null)
      } else {
        session.set({
          user: result.data.user,
          session: result.data.session,
        } as BetterAuthSession)
      }
    } catch {
      session.set(null)
    } finally {
      isPending.set(false)
    }
  }

  // Subscribe to session changes
  if (options.onSessionChange) {
    session.on(options.onSessionChange)
  }

  // Initial fetch
  refresh()

  // Optional polling
  if (options.refreshInterval && options.refreshInterval > 0) {
    intervalId = setInterval(refresh, options.refreshInterval)
  }

  function dispose() {
    if (intervalId != null) {
      clearInterval(intervalId)
      intervalId = undefined
    }
    session.dispose()
    isPending.dispose()
    user.dispose()
    isAuthenticated.dispose()
  }

  return { session, isPending, user, isAuthenticated, refresh, dispose }
}
