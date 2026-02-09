import { describe, it, expect } from 'vitest'
import { mapSocialProviders } from '../../../src/better-auth/social-mapping'

describe('mapSocialProviders', () => {
  it('maps provider names to AuthProviderInfo objects', () => {
    const result = mapSocialProviders(['google', 'github', 'apple'])

    expect(result).toEqual([
      { provider: 'google' },
      { provider: 'github' },
      { provider: 'apple' },
    ])
  })

  it('returns empty array for no providers', () => {
    const result = mapSocialProviders([])
    expect(result).toEqual([])
  })

  it('handles single provider', () => {
    const result = mapSocialProviders(['discord'])
    expect(result).toEqual([{ provider: 'discord' }])
  })
})
