import { TNode } from '@tempots/dom'
import { AuthModal, AuthContainerOptions } from '../../components/auth'
import { BetterAuthBridge } from '../types'

export function BetterAuthModal(
  auth: BetterAuthBridge,
  fn: (open: (overrides?: Partial<AuthContainerOptions>) => void) => TNode
) {
  return AuthModal(open =>
    fn(overrides => open({ ...auth.containerOptions, ...overrides }))
  )
}
