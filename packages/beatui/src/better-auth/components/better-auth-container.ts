import { TNode } from '@tempots/dom'
import { AuthContainer, AuthContainerOptions } from '../../components/auth'
import { BetterAuthBridge } from '../types'

export function BetterAuthContainer(
  auth: BetterAuthBridge,
  overrides?: Partial<AuthContainerOptions>,
  ...children: TNode[]
): TNode {
  return AuthContainer(
    { ...auth.containerOptions, ...overrides },
    ...children
  )
}
