/**
 * Social Providers Component
 *
 * Renders a stack of social login buttons based on the provided configuration.
 *
 * @module auth/social-providers
 */

import { Stack } from '../layout'
import { SocialLoginButtons } from './social-login-button'
import { SocialProvidersOptions } from './types'

/**
 * Renders a vertical stack of social login buttons for the configured providers.
 *
 * A thin wrapper around {@link SocialLoginButtons} that maps `onSocialLogin`
 * to the `onProviderClick` callback.
 *
 * @param options - Configuration for which providers to display and how to handle clicks.
 * @returns A `TNode` containing a stack of social login buttons.
 *
 * @example
 * ```ts
 * SocialProviders({
 *   providers: [{ provider: 'google' }, { provider: 'github' }],
 *   onSocialLogin: async (provider) => {
 *     await authClient.signIn.social({ provider })
 *   },
 * })
 * ```
 */
export function SocialProviders({
  providers,
  onSocialLogin,
}: SocialProvidersOptions) {
  return Stack(
    SocialLoginButtons({
      providers,
      onProviderClick: onSocialLogin,
    })
  )
}
