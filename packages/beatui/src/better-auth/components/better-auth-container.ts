import { TNode, Task, Provide } from '@tempots/dom'
import { AuthContainer, AuthContainerOptions } from '../../components/auth'
import { BetterAuthBridge } from '../types'

/**
 * Better-auth wrapper around {@link AuthContainer}.
 *
 * Automatically provides the `AuthI18n` context via lazy import,
 * so consumers don't need to wrap in `BeatUI({ includeAuthI18n: true })`.
 */
export function BetterAuthContainer(
  auth: BetterAuthBridge,
  overrides?: Partial<AuthContainerOptions>,
  ...children: TNode[]
) {
  return Task(
    () => import('../../auth-i18n/translations'),
    ({ AuthI18n }) =>
      Provide(AuthI18n, {}, () =>
        AuthContainer({ ...auth.containerOptions, ...overrides }, ...children)
      )
  )
}
