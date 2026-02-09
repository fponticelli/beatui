import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createBetterAuthBridge } from '../../../src/better-auth/bridge'
import { createMockBetterAuthClient, failure } from './mock-client'

describe('createBetterAuthBridge', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates bridge with session signals', async () => {
    const client = createMockBetterAuthClient()
    const bridge = createBetterAuthBridge(client)

    await vi.runAllTimersAsync()

    expect(bridge.session.value).not.toBeNull()
    expect(bridge.user.value).toEqual({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    })
    expect(bridge.isAuthenticated.value).toBe(true)
    expect(bridge.isPending.value).toBe(false)

    bridge.dispose()
  })

  it('wires sign-in callback correctly', async () => {
    const client = createMockBetterAuthClient()
    const bridge = createBetterAuthBridge(client, {
      callbackURL: '/dashboard',
    })
    await vi.runAllTimersAsync()

    const result = await bridge.containerOptions.onSignIn!({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(result).toBeNull()
    expect(client.signIn.email).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      callbackURL: '/dashboard',
    })

    bridge.dispose()
  })

  it('wires sign-up callback correctly', async () => {
    const client = createMockBetterAuthClient()
    const bridge = createBetterAuthBridge(client)
    await vi.runAllTimersAsync()

    const result = await bridge.containerOptions.onSignUp!({
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
      acceptTerms: true,
    })

    expect(result).toBeNull()
    expect(client.signUp.email).toHaveBeenCalledWith({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      callbackURL: undefined,
    })

    bridge.dispose()
  })

  it('wires reset-password callback correctly', async () => {
    const client = createMockBetterAuthClient()
    const bridge = createBetterAuthBridge(client)
    await vi.runAllTimersAsync()

    const result = await bridge.containerOptions.onResetPassword!({
      email: 'test@example.com',
    })

    expect(result).toBeNull()
    expect(client.requestPasswordReset).toHaveBeenCalledWith({
      email: 'test@example.com',
      redirectTo: undefined,
    })

    bridge.dispose()
  })

  it('sign-in refreshes session on success', async () => {
    const client = createMockBetterAuthClient()
    const bridge = createBetterAuthBridge(client)
    await vi.runAllTimersAsync()

    // Initial fetch + refresh after sign-in
    const initialCallCount = (
      client.getSession as ReturnType<typeof vi.fn>
    ).mock.calls.length

    await bridge.containerOptions.onSignIn!({
      email: 'test@example.com',
      password: 'pass',
    })

    expect(
      (client.getSession as ReturnType<typeof vi.fn>).mock.calls.length
    ).toBeGreaterThan(initialCallCount)

    bridge.dispose()
  })

  it('sign-in does not refresh session on failure', async () => {
    const client = createMockBetterAuthClient({
      signIn: {
        email: vi.fn().mockResolvedValue(failure('Invalid')),
        social: vi.fn(),
      },
    })
    const bridge = createBetterAuthBridge(client)
    await vi.runAllTimersAsync()

    const callCountAfterInit = (
      client.getSession as ReturnType<typeof vi.fn>
    ).mock.calls.length

    await bridge.containerOptions.onSignIn!({
      email: 'test@example.com',
      password: 'wrong',
    })

    expect(
      (client.getSession as ReturnType<typeof vi.fn>).mock.calls.length
    ).toBe(callCountAfterInit)

    bridge.dispose()
  })

  it('configures social providers', async () => {
    const client = createMockBetterAuthClient()
    const bridge = createBetterAuthBridge(client, {
      socialProviders: ['google', 'github'],
    })
    await vi.runAllTimersAsync()

    expect(bridge.socialProviders).toEqual([
      { provider: 'google' },
      { provider: 'github' },
    ])
    expect(bridge.containerOptions.socialProviders).toEqual([
      { provider: 'google' },
      { provider: 'github' },
    ])
    expect(bridge.containerOptions.showSocialDivider).toBe(true)

    bridge.dispose()
  })

  it('social providers are undefined when none configured', async () => {
    const client = createMockBetterAuthClient()
    const bridge = createBetterAuthBridge(client)
    await vi.runAllTimersAsync()

    expect(bridge.socialProviders).toEqual([])
    expect(bridge.containerOptions.socialProviders).toBeUndefined()
    expect(bridge.containerOptions.showSocialDivider).toBe(false)

    bridge.dispose()
  })

  it('signOut calls client and refreshes session', async () => {
    const client = createMockBetterAuthClient()
    const bridge = createBetterAuthBridge(client)
    await vi.runAllTimersAsync()

    await bridge.signOut()

    expect(client.signOut).toHaveBeenCalled()
    // getSession called: initial + after signOut
    expect(
      (client.getSession as ReturnType<typeof vi.fn>).mock.calls.length
    ).toBeGreaterThanOrEqual(2)

    bridge.dispose()
  })

  it('passes labels through to containerOptions', async () => {
    const client = createMockBetterAuthClient()
    const bridge = createBetterAuthBridge(client, {
      labels: {
        signInTitle: 'Log In',
        signUpTitle: 'Register',
      },
    })
    await vi.runAllTimersAsync()

    expect(bridge.containerOptions.labels?.signInTitle).toBe('Log In')
    expect(bridge.containerOptions.labels?.signUpTitle).toBe('Register')

    bridge.dispose()
  })

  it('passes display options through', async () => {
    const client = createMockBetterAuthClient()
    const bridge = createBetterAuthBridge(client, {
      showRememberMe: false,
      showNameField: true,
      showConfirmPassword: true,
      showPasswordStrength: true,
    })
    await vi.runAllTimersAsync()

    expect(bridge.containerOptions.showRememberMe).toBe(false)
    expect(bridge.containerOptions.showNameField).toBe(true)
    expect(bridge.containerOptions.showConfirmPassword).toBe(true)
    expect(bridge.containerOptions.showPasswordStrength).toBe(true)

    bridge.dispose()
  })

  it('dispose cleans up session manager', async () => {
    const client = createMockBetterAuthClient()
    const bridge = createBetterAuthBridge(client, {
      refreshInterval: 5000,
    })
    // Let the initial fetch complete
    await vi.advanceTimersByTimeAsync(1)

    bridge.dispose()

    const callCount = (client.getSession as ReturnType<typeof vi.fn>).mock
      .calls.length
    await vi.advanceTimersByTimeAsync(10000)
    // No additional calls after dispose
    expect(
      (client.getSession as ReturnType<typeof vi.fn>).mock.calls.length
    ).toBe(callCount)
  })
})
