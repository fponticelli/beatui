import { AuthProviderInfo, AuthProviderName } from '../components/auth'

export function mapSocialProviders(
  providers: AuthProviderName[]
): AuthProviderInfo[] {
  return providers.map(provider => ({
    provider,
  }))
}
