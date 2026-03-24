import { describe, it, expect, vi, afterEach } from 'vitest'

describe('useAuthEmailProp', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('returns a localStorage-backed prop in browser environment', async () => {
    const { useAuthEmailProp } = await import(
      '../../../src/components/auth/auth-email-prop'
    )
    const emailProp = useAuthEmailProp()
    // In jsdom, window and document exist, so it should use localStorageProp
    expect(emailProp.value).toBeNull()
    emailProp.value = 'test@example.com'
    expect(emailProp.value).toBe('test@example.com')
  })

  it('returns a plain prop in SSR environment', async () => {
    vi.resetModules()

    // Mock isBrowser to return false
    vi.doMock('../../../src/components/auth/utils', () => ({
      isBrowser: () => false,
      // Re-export other utils to avoid missing exports
      defaultPasswordRules: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: false,
      },
    }))

    const { useAuthEmailProp } = await import(
      '../../../src/components/auth/auth-email-prop'
    )
    const emailProp = useAuthEmailProp()
    expect(emailProp.value).toBeNull()
    // Should work as a plain prop without localStorage
    emailProp.value = 'ssr@example.com'
    expect(emailProp.value).toBe('ssr@example.com')

    vi.doUnmock('../../../src/components/auth/utils')
  })
})
