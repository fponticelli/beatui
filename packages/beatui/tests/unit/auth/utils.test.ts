// Authentication Utils Tests
// Unit tests for authentication utility functions

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mergeAuthLabels,
  isValidEmail,
  generateRandomString,
  createSocialLoginUrl,
  formatAuthError,
  isBrowser,
  saveRememberMe,
  getRememberedEmail,
  clearRememberedEmail,
} from '../../../src/components/auth/utils'
import { defaultAuthLabels } from '../../../src/components/auth/utils'

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Authentication Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('mergeAuthLabels', () => {
    it('should return default labels when no user labels provided', () => {
      const result = mergeAuthLabels()
      expect(result).toEqual(defaultAuthLabels)
    })

    it('should merge user labels with defaults', () => {
      const userLabels = {
        signInTitle: 'Custom Sign In',
        signUpTitle: 'Custom Sign Up',
      }

      const result = mergeAuthLabels(userLabels)

      expect(result.signInTitle).toBe('Custom Sign In')
      expect(result.signUpTitle).toBe('Custom Sign Up')
      expect(result.emailLabel).toBe(defaultAuthLabels.emailLabel) // Should keep default
    })

    it('should handle empty user labels', () => {
      const result = mergeAuthLabels({})
      expect(result).toEqual(defaultAuthLabels)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(isValidEmail('user123@test-domain.org')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('test.domain.com')).toBe(false)
    })
  })

  describe('generateRandomString', () => {
    it('should generate string of correct length', () => {
      const result = generateRandomString(16)
      expect(result).toHaveLength(16)
    })

    it('should generate different strings on multiple calls', () => {
      const result1 = generateRandomString(32)
      const result2 = generateRandomString(32)
      expect(result1).not.toBe(result2)
    })

    it('should use default length when not specified', () => {
      const result = generateRandomString()
      expect(result).toHaveLength(32)
    })

    it('should only contain valid characters', () => {
      const result = generateRandomString(100)
      const validChars = /^[A-Za-z0-9]+$/
      expect(validChars.test(result)).toBe(true)
    })
  })

  describe('createSocialLoginUrl', () => {
    it('should create valid OAuth URL for Google', () => {
      const url = createSocialLoginUrl(
        'google',
        'test-client-id',
        'http://localhost:3000/callback'
      )

      expect(url).toContain('https://accounts.google.com/oauth/authorize')
      expect(url).toContain('client_id=test-client-id')
      expect(url).toContain(
        'redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback'
      )
      expect(url).toContain('scope=openid+email+profile')
      expect(url).toContain('response_type=code')
      expect(url).toContain('state=')
    })

    it('should create valid OAuth URL for GitHub', () => {
      const url = createSocialLoginUrl(
        'github',
        'test-client-id',
        'http://localhost:3000/callback'
      )

      expect(url).toContain('https://github.com/login/oauth/authorize')
      expect(url).toContain('scope=user%3Aemail')
    })

    it('should use custom scopes when provided', () => {
      const url = createSocialLoginUrl(
        'google',
        'test-client-id',
        'http://localhost:3000/callback',
        ['custom', 'scopes']
      )

      expect(url).toContain('scope=custom+scopes')
    })

    it('should include custom parameters', () => {
      const url = createSocialLoginUrl(
        'google',
        'test-client-id',
        'http://localhost:3000/callback',
        [],
        { custom_param: 'value', another: 'param' }
      )

      expect(url).toContain('custom_param=value')
      expect(url).toContain('another=param')
    })

    it('should throw error for unsupported provider', () => {
      expect(() => {
        createSocialLoginUrl(
          'unsupported' as never,
          'test-client-id',
          'http://localhost:3000/callback'
        )
      }).toThrow('Unsupported provider: unsupported')
    })
  })

  describe('formatAuthError', () => {
    it('should format Error objects', () => {
      const error = new Error('Test error message')
      expect(formatAuthError(error)).toBe('Test error message')
    })

    it('should format string errors', () => {
      expect(formatAuthError('String error')).toBe('String error')
    })

    it('should format objects with message property', () => {
      const error = { message: 'Object error message' }
      expect(formatAuthError(error)).toBe('Object error message')
    })

    it('should handle unknown error types', () => {
      expect(formatAuthError(null)).toBe('An unexpected error occurred')
      expect(formatAuthError(undefined)).toBe('An unexpected error occurred')
      expect(formatAuthError(123)).toBe('An unexpected error occurred')
    })
  })

  describe('isBrowser', () => {
    it('should return true in browser environment', () => {
      expect(isBrowser()).toBe(true)
    })
  })

  describe('localStorage helpers', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockClear()
      localStorageMock.setItem.mockClear()
      localStorageMock.removeItem.mockClear()
    })

    describe('saveRememberMe', () => {
      it('should save email to localStorage', () => {
        saveRememberMe('test@example.com')
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'bui_auth_remember_email',
          'test@example.com'
        )
      })
    })

    describe('getRememberedEmail', () => {
      it('should retrieve email from localStorage', () => {
        localStorageMock.getItem.mockReturnValue('test@example.com')

        const result = getRememberedEmail()

        expect(localStorageMock.getItem).toHaveBeenCalledWith(
          'bui_auth_remember_email'
        )
        expect(result).toBe('test@example.com')
      })

      it('should return null when no email is stored', () => {
        localStorageMock.getItem.mockReturnValue(null)

        const result = getRememberedEmail()

        expect(result).toBe(null)
      })
    })

    describe('clearRememberedEmail', () => {
      it('should remove email from localStorage', () => {
        clearRememberedEmail()
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
          'bui_auth_remember_email'
        )
      })
    })
  })
})
