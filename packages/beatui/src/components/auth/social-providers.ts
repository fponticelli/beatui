import { Stack } from '../layout'
import { SocialLoginButtons } from './social-login-button'
import { SocialProvidersOptions } from './types'

export function SocialProviders({ providers, onSocialLogin }: SocialProvidersOptions) {
  return Stack(
    SocialLoginButtons({
      providers,
      onProviderClick: onSocialLogin,
    })
  )
}
