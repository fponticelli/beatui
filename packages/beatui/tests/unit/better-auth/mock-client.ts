import { vi } from 'vitest'
import type {
  BetterAuthClient,
  BetterAuthResult,
  BetterAuthUser,
  TwoFactorClient,
  PasskeyClient,
} from '../../../src/better-auth/types'

function success<T>(data: T): BetterAuthResult<T> {
  return { data, error: null }
}

function failure(message: string, status = 400): BetterAuthResult<never> {
  return { data: null, error: { message, status, statusText: 'Bad Request' } }
}

export { success, failure }

const defaultUser: BetterAuthUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
}

export function createMockBetterAuthClient(
  overrides: Partial<BetterAuthClient> = {}
): BetterAuthClient {
  return {
    signIn: {
      email: vi.fn().mockResolvedValue(success({ user: defaultUser })),
      social: vi.fn().mockResolvedValue(success({})),
      ...overrides.signIn,
    },
    signUp: {
      email: vi.fn().mockResolvedValue(success({ user: defaultUser })),
      ...overrides.signUp,
    },
    signOut: vi.fn().mockResolvedValue(success({})),
    getSession: vi
      .fn()
      .mockResolvedValue(
        success({ session: { id: 'session-1' }, user: defaultUser })
      ),
    requestPasswordReset: vi.fn().mockResolvedValue(success({})),
    ...overrides,
    // Re-apply nested overrides properly
    signIn: {
      email: vi.fn().mockResolvedValue(success({ user: defaultUser })),
      social: vi.fn().mockResolvedValue(success({})),
      ...overrides.signIn,
    },
    signUp: {
      email: vi.fn().mockResolvedValue(success({ user: defaultUser })),
      ...overrides.signUp,
    },
  }
}

export function createMockTwoFactorClient(): TwoFactorClient {
  return {
    enable: vi.fn().mockResolvedValue(
      success({
        totpURI: 'otpauth://totp/Test:test@example.com?secret=ABC123',
        backupCodes: ['code1', 'code2', 'code3'],
      })
    ),
    disable: vi.fn().mockResolvedValue(success({})),
    getTotpUri: vi.fn().mockResolvedValue(
      success({
        totpURI: 'otpauth://totp/Test:test@example.com?secret=ABC123',
      })
    ),
    verifyTotp: vi.fn().mockResolvedValue(success({})),
    generateBackupCodes: vi.fn().mockResolvedValue(
      success({
        backupCodes: ['new-code1', 'new-code2'],
      })
    ),
    verifyBackupCode: vi.fn().mockResolvedValue(success({})),
  }
}

export function createMockPasskeyClient(): PasskeyClient {
  return {
    addPasskey: vi.fn().mockResolvedValue(success({})),
    listUserPasskeys: vi.fn().mockResolvedValue(
      success([
        { id: 'pk-1', name: 'My Laptop', createdAt: '2024-01-01T00:00:00Z' },
        {
          id: 'pk-2',
          name: 'My Phone',
          createdAt: '2024-06-15T00:00:00Z',
        },
      ])
    ),
    deletePasskey: vi.fn().mockResolvedValue(success({})),
    updatePasskey: vi.fn().mockResolvedValue(success({})),
  }
}
