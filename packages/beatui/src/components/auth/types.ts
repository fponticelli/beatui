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

// Main authentication configuration
// export interface AuthConfig {
//   // Social providers
//   socialProviders?: SocialProviderConfig<unknown>[]

//   // Password validation rules
//   passwordRules?: PasswordRules

//   // UI customization
//   showRememberMe?: boolean
//   showSocialDivider?: boolean
//   allowSignUp?: boolean
//   allowPasswordReset?: boolean
//   showPasswordStrength?: boolean

//   // Event handlers
//   onSignIn?: (data: SignInData) => Promise<void>
//   onSignUp?: (data: SignUpData) => Promise<void>
//   onResetPassword?: (data: ResetPasswordData) => Promise<void>
//   onModeChange?: (mode: AuthMode) => void
//   onSocialLogin?: (provider: AuthProviderName) => Promise<void>
// }

// Component-specific options
export interface AuthContainerOptions {
  initialMode?: AuthMode
  className?: Value<string>
  socialProviders?: SocialProviderConfig<unknown>[]
  passwordRules?: PasswordRules
  showRememberMe?: Value<boolean>
  showSocialDivider?: Value<boolean>
  allowSignUp?: Value<boolean>
  allowPasswordReset?: Value<boolean>
  showPasswordStrength?: Value<boolean>
  labels?: {
    signInTitle?: () => string
    emailLabel?: () => string
    passwordLabel?: () => string
    rememberMeLabel?: () => string
    loading?: () => string
    signInButton?: () => string
    forgotPasswordLink?: () => string
    noAccountLink?: () => string
    acceptTermsLabel?: () => string
    confirmPasswordLabel?: () => string
    signUpTitle?: () => string
    signUpButton?: () => string
    nameLabel?: () => string
    hasAccountLink?: () => string
    resetPasswordTitle?: () => string
    resetPasswordButton?: () => string
    resetPasswordDescription?: () => string
    backToSignInLink?: () => string
  }
  onSignIn?: (data: SignInData) => Promise<void>
  onSignUp?: (data: SignUpData) => Promise<void>
  onResetPassword?: (data: ResetPasswordData) => Promise<void>
  onModeChange?: (mode: AuthMode) => void
  onSocialLogin?: (provider: AuthProviderName) => Promise<void>
  onSubmitSignIn?: (data: SignInData) => Promise<void>
  onSubmitSignUp?: (data: SignUpData) => Promise<void>
  onSubmitResetPassword?: (data: ResetPasswordData) => Promise<void>
}

export interface SignInFormOptions {
  onSubmit?: (data: SignInData) => Promise<void>
  onModeChange?: (mode: AuthMode) => void
  onSignIn?: (data: SignInData) => Promise<void>
  onSocialLogin?: (provider: AuthProviderName) => Promise<void>
  loading?: Value<boolean>
  error?: Value<string | null>
  passwordRules?: PasswordRules
  labels?: {
    signInTitle?: () => string
    emailLabel?: () => string
    passwordLabel?: () => string
    rememberMeLabel?: () => string
    loading?: () => string
    signInButton?: () => string
    forgotPasswordLink?: () => string
    noAccountLink?: () => string
  }
  socialProviders?: SocialProviderConfig<unknown>[]
  showSocialDivider?: Value<boolean>
  showRememberMe?: Value<boolean>
  allowPasswordReset?: Value<boolean>
  allowSignUp?: Value<boolean>
}

export interface SignUpFormOptions {
  onSubmit?: (data: SignUpData) => Promise<void>
  onModeChange?: (mode: AuthMode) => void
  loading?: Value<boolean>
  error?: Value<string | null>
  passwordRules?: PasswordRules
  labels?: {
    signUpTitle?: () => string
    nameLabel?: () => string
    emailLabel?: () => string
    passwordLabel?: () => string
    confirmPasswordLabel?: () => string
    acceptTermsLabel?: () => string
    loading?: () => string
    signUpButton?: () => string
    hasAccountLink?: () => string
  }
  socialProviders?: SocialProviderConfig<unknown>[]
  showSocialDivider?: Value<boolean>
  showPasswordStrength?: Value<boolean>
  onSignUp?: (data: SignUpData) => Promise<void>
  onSocialLogin?: (provider: AuthProviderName) => Promise<void>
}

export interface ResetPasswordFormOptions {
  onSubmit?: (data: ResetPasswordData) => Promise<void>
  onModeChange?: (mode: AuthMode) => void
  onResetPassword?: (data: ResetPasswordData) => Promise<void>
  loading?: Value<boolean>
  error?: Value<string | null>
  labels?: {
    resetPasswordTitle?: () => string
    resetPasswordButton?: () => string
    resetPasswordDescription?: () => string
    emailLabel?: () => string
    loading?: () => string
    backToSignInLink?: () => string
  }
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
