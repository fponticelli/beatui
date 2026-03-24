import { describe, it, expect, vi } from 'vitest'
import {
  createSignInCallback,
  createSignUpCallback,
  createResetPasswordCallback,
  createSocialLoginHandler,
} from '../../../src/better-auth/callbacks'
import { createMockBetterAuthClient, failure } from './mock-client'

describe('createSignInCallback', () => {
  it('returns null on successful sign-in', async () => {
    const client = createMockBetterAuthClient()
    const onSuccess = vi.fn()
    const callback = createSignInCallback(client, {}, onSuccess)

    const result = await callback({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(result).toBeNull()
    expect(client.signIn.email).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      callbackURL: undefined,
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  it('returns error message on failure', async () => {
    const client = createMockBetterAuthClient({
      signIn: {
        email: vi.fn().mockResolvedValue(failure('Invalid credentials')),
        social: vi.fn(),
      },
    })
    const onSuccess = vi.fn()
    const callback = createSignInCallback(client, {}, onSuccess)

    const result = await callback({
      email: 'test@example.com',
      password: 'wrong',
    })

    expect(result).toBe('Invalid credentials')
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError when sign-in fails', async () => {
    const onError = vi.fn()
    const client = createMockBetterAuthClient({
      signIn: {
        email: vi
          .fn()
          .mockResolvedValue(failure('Invalid credentials', 401)),
        social: vi.fn(),
      },
    })
    const callback = createSignInCallback(
      client,
      { onError },
      vi.fn()
    )

    await callback({ email: 'test@example.com', password: 'wrong' })

    expect(onError).toHaveBeenCalledWith({
      message: 'Invalid credentials',
      status: 401,
    })
  })

  it('passes callbackURL to client', async () => {
    const client = createMockBetterAuthClient()
    const callback = createSignInCallback(
      client,
      { callbackURL: '/dashboard' },
      vi.fn()
    )

    await callback({ email: 'test@example.com', password: 'password123' })

    expect(client.signIn.email).toHaveBeenCalledWith(
      expect.objectContaining({ callbackURL: '/dashboard' })
    )
  })

  it('calls onAuthSuccess with user after successful sign-in', async () => {
    const client = createMockBetterAuthClient()
    const onSuccess = vi.fn()
    const onAuthSuccess = vi.fn()
    const callback = createSignInCallback(client, {}, onSuccess, onAuthSuccess)

    await callback({ email: 'test@example.com', password: 'password123' })

    expect(onAuthSuccess).toHaveBeenCalledWith({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    })
  })

  it('does not call onAuthSuccess on failure', async () => {
    const client = createMockBetterAuthClient({
      signIn: {
        email: vi.fn().mockResolvedValue(failure('Invalid credentials')),
        social: vi.fn(),
      },
    })
    const onAuthSuccess = vi.fn()
    const callback = createSignInCallback(client, {}, vi.fn(), onAuthSuccess)

    await callback({ email: 'test@example.com', password: 'wrong' })

    expect(onAuthSuccess).not.toHaveBeenCalled()
  })
})

describe('createSignUpCallback', () => {
  it('returns null on successful sign-up', async () => {
    const client = createMockBetterAuthClient()
    const onSuccess = vi.fn()
    const callback = createSignUpCallback(client, {}, onSuccess)

    const result = await callback({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      acceptTerms: true,
    })

    expect(result).toBeNull()
    expect(client.signUp.email).toHaveBeenCalledWith({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      callbackURL: undefined,
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  it('returns error message on failure', async () => {
    const client = createMockBetterAuthClient({
      signUp: {
        email: vi
          .fn()
          .mockResolvedValue(failure('Email already exists')),
      },
    })
    const onSuccess = vi.fn()
    const callback = createSignUpCallback(client, {}, onSuccess)

    const result = await callback({
      email: 'test@example.com',
      password: 'password123',
      acceptTerms: true,
    })

    expect(result).toBe('Email already exists')
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onAuthSuccess with user after successful sign-up', async () => {
    const client = createMockBetterAuthClient()
    const onSuccess = vi.fn()
    const onAuthSuccess = vi.fn()
    const callback = createSignUpCallback(client, {}, onSuccess, onAuthSuccess)

    await callback({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      acceptTerms: true,
    })

    expect(onAuthSuccess).toHaveBeenCalledWith({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    })
  })
})

describe('createResetPasswordCallback', () => {
  it('returns null on success', async () => {
    const client = createMockBetterAuthClient()
    const callback = createResetPasswordCallback(client, {})

    const result = await callback({ email: 'test@example.com' })

    expect(result).toBeNull()
    expect(client.requestPasswordReset).toHaveBeenCalledWith({
      email: 'test@example.com',
      redirectTo: undefined,
    })
  })

  it('returns error message on failure', async () => {
    const client = createMockBetterAuthClient()
    ;(client.requestPasswordReset as ReturnType<typeof vi.fn>).mockResolvedValue(
      failure('User not found')
    )
    const callback = createResetPasswordCallback(client, {})

    const result = await callback({ email: 'notfound@example.com' })

    expect(result).toBe('User not found')
  })
})

describe('createSocialLoginHandler', () => {
  it('calls client.signIn.social with provider', async () => {
    const client = createMockBetterAuthClient()
    const handler = createSocialLoginHandler(client, {
      callbackURL: '/home',
      errorCallbackURL: '/error',
    })

    await handler('google')

    expect(client.signIn.social).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: '/home',
      errorCallbackURL: '/error',
    })
  })

  it('calls onError when social login fails', async () => {
    const onError = vi.fn()
    const client = createMockBetterAuthClient({
      signIn: {
        email: vi.fn(),
        social: vi
          .fn()
          .mockResolvedValue(failure('Provider error', 500)),
      },
    })
    const handler = createSocialLoginHandler(client, { onError })

    await handler('github')

    expect(onError).toHaveBeenCalledWith({
      message: 'Provider error',
      status: 500,
    })
  })
})

describe('handleResult with structured errors', () => {
  it('returns AuthFieldError array when error contains fieldErrors', async () => {
    const client = createMockBetterAuthClient({
      signUp: {
        email: vi.fn().mockResolvedValue({
          data: null,
          error: {
            message: 'Validation failed',
            status: 422,
            statusText: 'Unprocessable Entity',
            fieldErrors: { email: 'Domain not allowed' },
          },
        }),
      },
    })
    const callback = createSignUpCallback(client, {}, vi.fn())

    const result = await callback({
      email: 'user@blocked.com',
      password: 'password123',
      acceptTerms: true,
    })

    expect(result).toEqual([{ field: 'email', message: 'Domain not allowed' }])
  })

  it('returns plain string for non-structured errors', async () => {
    const client = createMockBetterAuthClient({
      signIn: {
        email: vi.fn().mockResolvedValue(failure('Invalid credentials')),
        social: vi.fn(),
      },
    })
    const callback = createSignInCallback(client, {}, vi.fn())

    const result = await callback({
      email: 'test@example.com',
      password: 'wrong',
    })

    expect(result).toBe('Invalid credentials')
  })
})
