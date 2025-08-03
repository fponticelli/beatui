// Authentication Components Test Suite
// Main test file that imports all authentication component tests

import { describe, it, expect } from 'vitest'

// Import all test files to ensure they run
import './auth-container.test'
import './schemas.test'
import './password-strength-indicator.test'
import './social-login-button.test'
// Note: utils.test is run separately to avoid mock conflicts
import './signin-form.test'

// Import the main auth module to test exports
import * as AuthModule from '../../../src/components/auth/index'

describe('Authentication Module Exports', () => {
  it('should export all required types', () => {
    // Core types
    expect(AuthModule.defaultPasswordRules).toBeDefined()
    expect(AuthModule.providerInfo).toBeDefined()
  })

  it('should export all validation schemas', () => {
    expect(AuthModule.createSignInSchema).toBeDefined()
    expect(AuthModule.createSignUpSchema).toBeDefined()
    expect(AuthModule.resetPasswordSchema).toBeDefined()
    expect(AuthModule.calculatePasswordStrength).toBeDefined()
    expect(AuthModule.validateEmail).toBeDefined()
    expect(AuthModule.validatePassword).toBeDefined()
  })

  it('should export all utility functions', () => {
    expect(AuthModule.formatProviderName).toBeDefined()
    expect(AuthModule.getProviderIcon).toBeDefined()
    expect(AuthModule.getProviderColor).toBeDefined()
    expect(AuthModule.formatSocialLoginText).toBeDefined()
    expect(AuthModule.isValidEmail).toBeDefined()
    expect(AuthModule.generateRandomString).toBeDefined()
    expect(AuthModule.createSocialLoginUrl).toBeDefined()
    expect(AuthModule.formatAuthError).toBeDefined()
    expect(AuthModule.isBrowser).toBeDefined()
    expect(AuthModule.saveRememberMe).toBeDefined()
    expect(AuthModule.getRememberedEmail).toBeDefined()
    expect(AuthModule.clearRememberedEmail).toBeDefined()
  })

  it('should export all components', () => {
    expect(AuthModule.AuthContainer).toBeDefined()
    expect(AuthModule.SignInForm).toBeDefined()
    expect(AuthModule.SignUpForm).toBeDefined()
    expect(AuthModule.ResetPasswordForm).toBeDefined()
    expect(AuthModule.SocialLoginButton).toBeDefined()
    expect(AuthModule.SocialLoginButtons).toBeDefined()
    expect(AuthModule.PasswordStrengthIndicator).toBeDefined()
    expect(AuthModule.PasswordStrengthBar).toBeDefined()
    expect(AuthModule.PasswordStrengthText).toBeDefined()
    expect(AuthModule.AuthDivider).toBeDefined()
  })

  it('should export convenience components', () => {
    expect(AuthModule.GoogleLoginButton).toBeDefined()
    expect(AuthModule.GitHubLoginButton).toBeDefined()
    expect(AuthModule.AppleLoginButton).toBeDefined()
    expect(AuthModule.FacebookLoginButton).toBeDefined()
    expect(AuthModule.TwitterLoginButton).toBeDefined()
    expect(AuthModule.MicrosoftLoginButton).toBeDefined()
    expect(AuthModule.DiscordLoginButton).toBeDefined()
    expect(AuthModule.LinkedInLoginButton).toBeDefined()
  })

  it('should export container variants', () => {
    expect(AuthModule.SignInContainer).toBeDefined()
    expect(AuthModule.SignUpContainer).toBeDefined()
    expect(AuthModule.ResetPasswordContainer).toBeDefined()
  })
})

describe('Authentication Integration', () => {
  it('should have consistent type definitions', () => {
    // Test that types are properly exported and can be used
    const signInData: AuthModule.SignInData = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    }

    const signUpData: AuthModule.SignUpData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      acceptTerms: true,
    }

    const resetData: AuthModule.ResetPasswordData = {
      email: 'test@example.com',
    }

    expect(signInData.email).toBe('test@example.com')
    expect(signUpData.name).toBe('John Doe')
    expect(resetData.email).toBe('test@example.com')
  })

  it('should have working validation schemas', () => {
    const signInSchema = AuthModule.createSignInSchema()
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(result.success).toBe(true)
  })

  it('should have working utility functions', () => {
    expect(AuthModule.formatProviderName('google')).toBe('Google')
    expect(AuthModule.isValidEmail('test@example.com')).toBe(true)
    expect(AuthModule.generateRandomString(10)).toHaveLength(10)
  })

  it('should have working password strength calculation', () => {
    const result = AuthModule.calculatePasswordStrength(
      'StrongPassword123!',
      AuthModule.defaultPasswordRules
    )
    expect(result.strength).toBe('strong')
    expect(result.score).toBeGreaterThan(80)
  })
})
