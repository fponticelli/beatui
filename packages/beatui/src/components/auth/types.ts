// Authentication Component Types
// TypeScript interfaces and types for the BeatUI authentication suite

import { Value } from '@tempots/dom'
import { ControlSize } from '../theme'
import { ThemeColorName } from '@/tokens'

// Core authentication types
export type AuthProviderName =
  | 'google'
  | 'github'
  | 'apple'
  | 'facebook'
  | 'twitter'
  | 'x'
  | 'microsoft'
  | 'discord'
  | 'linkedin'
  | 'instagram'
  | 'tiktok'
  | 'snapchat'
  | 'reddit'
  | 'pinterest'
  | 'twitch'
  | 'steam'
  | 'epic'
  | 'playstation'
  | 'xbox'
  | 'whatsapp'
  | 'wechat'
  | 'amazon'
  | 'yahoo'
  | 'paypal'

export type AuthMode = 'signin' | 'signup' | 'reset-password'

export type SocialLoginFlow = 'redirect' | 'popup'

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

// Form data interfaces
export interface SignInData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignUpData {
  name?: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface ResetPasswordData {
  email: string
}

// Social provider configuration
export interface SocialProviderConfig<T> {
  provider: AuthProviderName
  clientId?: string
  flow?: SocialLoginFlow
  scopes?: string[]
  customParams?: Record<string, string>
  onSuccess?: (result: T) => Promise<void> | void
  onError?: (error: Error) => Promise<void> | void
}

// Password validation rules
export interface PasswordRules {
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumbers?: boolean
  requireSymbols?: boolean
  customValidation?: (password: string) => string | null
}

// Internationalization labels
export interface AuthLabels {
  // Sign In
  signInTitle: string
  signInButton: string
  emailLabel: string
  passwordLabel: string
  rememberMeLabel: string
  forgotPasswordLink: string
  noAccountLink: string

  // Sign Up
  signUpTitle: string
  signUpButton: string
  nameLabel: string
  confirmPasswordLabel: string
  acceptTermsLabel: string
  hasAccountLink: string

  // Reset Password
  resetPasswordTitle: string
  resetPasswordButton: string
  resetPasswordDescription: string
  backToSignInLink: string

  // Social Login
  continueWithProvider: string // "Continue with {provider}"

  // Password Strength
  passwordStrengthWeak: string
  passwordStrengthFair: string
  passwordStrengthGood: string
  passwordStrengthStrong: string

  // Common
  orDivider: string
  loading: string
  error: string
  required: string
}

// Main authentication configuration
export interface AuthConfig {
  // Social providers
  socialProviders?: SocialProviderConfig<unknown>[]

  // Password validation rules
  passwordRules?: PasswordRules

  // UI customization
  showRememberMe?: boolean
  showSocialDivider?: boolean
  allowSignUp?: boolean
  allowPasswordReset?: boolean
  showPasswordStrength?: boolean

  // Internationalization
  labels?: Partial<AuthLabels>

  // Event handlers
  onSignIn?: (data: SignInData) => Promise<void>
  onSignUp?: (data: SignUpData) => Promise<void>
  onResetPassword?: (data: ResetPasswordData) => Promise<void>
  onModeChange?: (mode: AuthMode) => void
  onSocialLogin?: (provider: AuthProviderName) => Promise<void>
}

// Component-specific options
export interface AuthContainerOptions extends AuthConfig {
  initialMode?: AuthMode
  className?: Value<string>
}

export interface SignInFormOptions {
  config?: Partial<AuthConfig>
  onSubmit?: (data: SignInData) => Promise<void>
  onModeChange?: (mode: AuthMode) => void
  loading?: Value<boolean>
  error?: Value<string | null>
}

export interface SignUpFormOptions {
  config?: Partial<AuthConfig>
  onSubmit?: (data: SignUpData) => Promise<void>
  onModeChange?: (mode: AuthMode) => void
  loading?: Value<boolean>
  error?: Value<string | null>
}

export interface ResetPasswordFormOptions {
  config?: Partial<AuthConfig>
  onSubmit?: (data: ResetPasswordData) => Promise<void>
  onModeChange?: (mode: AuthMode) => void
  loading?: Value<boolean>
  error?: Value<string | null>
}

export interface SocialLoginButtonOptions {
  provider: AuthProviderName
  onClick?: () => Promise<void>
  loading?: Value<boolean>
  disabled?: Value<boolean>
  size?: Value<ControlSize>
  flow?: 'redirect' | 'popup'
  name: Value<string>
  icon: Value<string>
  color: Value<ThemeColorName | 'black'>
  labels?: {
    continueWithProvider?: (provider: string) => string
  }
}

export interface PasswordStrengthIndicatorOptions {
  password: Value<string>
  rules?: PasswordRules
  showLabel?: boolean
  className?: Value<string>
}

// Provider display information
export interface ProviderInfo {
  name: string
  icon: string
  color: ThemeColorName
}
