import { Stack } from '../layout'
import { SocialLoginButtons } from './social-login-button'
import { SocialProvidersOptions } from './types'

export function SocialProviders({ providers }: SocialProvidersOptions) {
  return Stack(
    SocialLoginButtons({
      providers,
    })
  )
}
