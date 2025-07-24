// Authentication Schemas Tests
// Unit tests for validation schemas and password strength calculation

import { describe, it, expect } from 'vitest'
import {
  createSignInSchema,
  createSignUpSchema,
  resetPasswordSchema,
  calculatePasswordStrength,
  validateEmail,
  validatePassword
} from '../../../src/components/auth/schemas'
import { defaultPasswordRules } from '../../../src/components/auth/types'

describe('Authentication Schemas', () => {
  describe('createSignInSchema', () => {
    it('should validate valid sign in data', () => {
      const schema = createSignInSchema()
      const result = schema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
        expect(result.data.password).toBe('password123')
        expect(result.data.rememberMe).toBe(true)
      }
    })

    it('should reject invalid email', () => {
      const schema = createSignInSchema()
      const result = schema.safeParse({
        email: 'invalid-email',
        password: 'password123'
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('valid email')
      }
    })

    it('should reject empty password', () => {
      const schema = createSignInSchema()
      const result = schema.safeParse({
        email: 'test@example.com',
        password: ''
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Password is required')
      }
    })

    it('should default rememberMe to false', () => {
      const schema = createSignInSchema()
      const result = schema.safeParse({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.rememberMe).toBe(false)
      }
    })
  })

  describe('createSignUpSchema', () => {
    it('should validate valid sign up data', () => {
      const schema = createSignUpSchema()
      const result = schema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true
      })

      expect(result.success).toBe(true)
    })

    it('should reject mismatched passwords', () => {
      const schema = createSignUpSchema()
      const result = schema.safeParse({
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        acceptTerms: true
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.error.errors.find(e => e.path.includes('confirmPassword'))
        expect(error?.message).toContain("Passwords don't match")
      }
    })

    it('should reject password that does not meet requirements', () => {
      const schema = createSignUpSchema({
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true
      })

      const result = schema.safeParse({
        email: 'john@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        acceptTerms: true
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const errors = result.error.errors.map(e => e.message)
        expect(errors.some(msg => msg.includes('8 characters'))).toBe(true)
        expect(errors.some(msg => msg.includes('uppercase'))).toBe(true)
        expect(errors.some(msg => msg.includes('number'))).toBe(true)
      }
    })

    it('should reject when terms are not accepted', () => {
      const schema = createSignUpSchema()
      const result = schema.safeParse({
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: false
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.error.errors.find(e => e.path.includes('acceptTerms'))
        expect(error?.message).toContain('accept the terms')
      }
    })

    it('should work with custom password validation', () => {
      const schema = createSignUpSchema({
        customValidation: (password) => {
          if (password.includes('password')) {
            return 'Password cannot contain the word "password"'
          }
          return null
        }
      })

      const result = schema.safeParse({
        email: 'john@example.com',
        password: 'mypassword123',
        confirmPassword: 'mypassword123',
        acceptTerms: true
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.error.errors.find(e => e.path.includes('password'))
        expect(error?.message).toContain('cannot contain the word "password"')
      }
    })
  })

  describe('resetPasswordSchema', () => {
    it('should validate valid email', () => {
      const result = resetPasswordSchema.safeParse({
        email: 'test@example.com'
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
      }
    })

    it('should reject invalid email', () => {
      const result = resetPasswordSchema.safeParse({
        email: 'invalid-email'
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('valid email')
      }
    })
  })

  describe('calculatePasswordStrength', () => {
    it('should calculate weak strength for simple password', () => {
      const result = calculatePasswordStrength('weak', defaultPasswordRules)

      expect(result.strength).toBe('weak')
      expect(result.score).toBeLessThan(40)
      expect(result.checks.length).toBe(false)
      expect(result.checks.uppercase).toBe(false)
      expect(result.checks.numbers).toBe(false)
    })

    it('should calculate strong strength for complex password', () => {
      const result = calculatePasswordStrength('StrongPassword123!', defaultPasswordRules)

      expect(result.strength).toBe('strong')
      expect(result.score).toBeGreaterThanOrEqual(80)
      expect(result.checks.length).toBe(true)
      expect(result.checks.uppercase).toBe(true)
      expect(result.checks.lowercase).toBe(true)
      expect(result.checks.numbers).toBe(true)
    })

    it('should handle empty password', () => {
      const result = calculatePasswordStrength('', defaultPasswordRules)

      expect(result.strength).toBe('weak')
      expect(result.score).toBe(0)
      expect(Object.values(result.checks).every(check => !check)).toBe(true)
    })

    it('should respect custom password rules', () => {
      const customRules = {
        minLength: 12,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true
      }

      const result = calculatePasswordStrength('Password123!', customRules)

      expect(result.checks.length).toBe(false) // Only 12 chars required
      expect(result.checks.symbols).toBe(true)
    })
  })

  describe('validateEmail', () => {
    it('should return null for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(null)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(null)
    })

    it('should return error message for invalid email', () => {
      expect(validateEmail('invalid-email')).toBeTruthy()
      expect(validateEmail('')).toBeTruthy()
      expect(validateEmail('test@')).toBeTruthy()
    })
  })

  describe('validatePassword', () => {
    it('should return null for valid password', () => {
      expect(validatePassword('StrongPassword123!', defaultPasswordRules)).toBe(null)
    })

    it('should return error message for invalid password', () => {
      expect(validatePassword('weak', defaultPasswordRules)).toBeTruthy()
      expect(validatePassword('', defaultPasswordRules)).toBeTruthy()
    })

    it('should respect custom rules', () => {
      const customRules = {
        minLength: 20,
        requireSymbols: true
      }

      expect(validatePassword('ShortPassword123', customRules)).toBeTruthy()
      expect(validatePassword('VeryLongPasswordWithSymbols123!@#', customRules)).toBe(null)
    })
  })
})
