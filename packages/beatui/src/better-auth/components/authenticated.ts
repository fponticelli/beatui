import { TNode, When, Unless } from '@tempots/dom'
import { BetterAuthBridge } from '../types'

export function Authenticated(
  auth: BetterAuthBridge,
  children: () => TNode
) {
  return When(auth.isAuthenticated, children)
}

export function Unauthenticated(
  auth: BetterAuthBridge,
  children: () => TNode
) {
  return Unless(auth.isAuthenticated, children)
}
