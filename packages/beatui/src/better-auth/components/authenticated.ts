import { TNode, When, Unless, Empty } from '@tempots/dom'
import { BetterAuthBridge } from '../types'

/**
 * Options for {@link Authenticated} and {@link Unauthenticated} guard components.
 */
export interface AuthGuardOptions {
  /** Content to render when the guard condition is met. */
  children: () => TNode
  /** Content to render while the initial session fetch is in progress. */
  loading?: () => TNode
}

/**
 * Renders children only when the user is authenticated.
 *
 * While the session is pending (initial fetch), renders the `loading` fallback
 * or nothing (`Empty`) by default.
 */
export function Authenticated(
  auth: BetterAuthBridge,
  options: AuthGuardOptions
) {
  return When(auth.isPending, options.loading ?? (() => Empty), () =>
    When(auth.isAuthenticated, options.children)
  )
}

/**
 * Renders children only when the user is NOT authenticated.
 *
 * While the session is pending, renders children by default (showing the
 * sign-in form during loading is a reasonable default). Provide a `loading`
 * fallback to show a spinner instead.
 *
 * Note: The default behavior causes a brief flash of unauthenticated content
 * if the user is actually authenticated. Use `loading` to avoid this.
 */
export function Unauthenticated(
  auth: BetterAuthBridge,
  options: AuthGuardOptions
) {
  return When(auth.isPending, options.loading ?? options.children, () =>
    Unless(auth.isAuthenticated, options.children)
  )
}
