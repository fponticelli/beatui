import { describe, it, expect, vi } from 'vitest'
import { prop } from '@tempots/dom'
import type { BetterAuthBridge, AuthContainerOptions, SignInFormOptions, SignUpFormOptions, ResetPasswordFormOptions } from '../../../src/better-auth/types'
import { Authenticated, Unauthenticated } from '../../../src/better-auth/components/authenticated'

function createMockBridge(overrides: {
  isPending?: boolean
  isAuthenticated?: boolean
} = {}): BetterAuthBridge {
  return {
    session: prop(null),
    isPending: prop(overrides.isPending ?? false),
    user: prop(null),
    isAuthenticated: prop(overrides.isAuthenticated ?? false),
    containerOptions: {} as unknown as AuthContainerOptions,
    signInOptions: {} as unknown as SignInFormOptions,
    signUpOptions: {} as unknown as SignUpFormOptions,
    resetOptions: {} as unknown as ResetPasswordFormOptions,
    socialProviders: [],
    signOut: vi.fn(),
    refreshSession: vi.fn(),
    dispose: vi.fn(),
  }
}

describe('Authenticated', () => {
  it('accepts options bag with children', () => {
    const bridge = createMockBridge({ isAuthenticated: true })
    const result = Authenticated(bridge, {
      children: () => 'authenticated content',
    })
    expect(result).toBeDefined()
  })

  it('accepts options bag with loading', () => {
    const bridge = createMockBridge({ isPending: true })
    const result = Authenticated(bridge, {
      children: () => 'authenticated content',
      loading: () => 'loading...',
    })
    expect(result).toBeDefined()
  })
})

describe('Unauthenticated', () => {
  it('accepts options bag with children', () => {
    const bridge = createMockBridge({ isAuthenticated: false })
    const result = Unauthenticated(bridge, {
      children: () => 'sign-in form',
    })
    expect(result).toBeDefined()
  })

  it('accepts options bag with loading', () => {
    const bridge = createMockBridge({ isPending: true })
    const result = Unauthenticated(bridge, {
      children: () => 'sign-in form',
      loading: () => 'loading...',
    })
    expect(result).toBeDefined()
  })
})
