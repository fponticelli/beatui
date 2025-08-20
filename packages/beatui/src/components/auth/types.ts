// Authentication Component Types
// TypeScript interfaces and types for the BeatUI authentication suite

import { TNode, Value } from '@tempots/dom'
import { ControlSize } from '../theme'
import { ThemeColorName } from '@/tokens'
import { AuthProviderInfo } from './social-login-button'

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
}

export type SignInFormData = SignInData

export interface SignUpData {
  name?: string
  email: string
  password: string
}

export interface SignUpFormData extends SignUpData {
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

export interface AuthContainerLabels {
  signInTitle?: Value<string>
  emailLabel?: Value<string>
  passwordLabel?: Value<string>
  rememberMeLabel?: Value<string>
  signInButton?: Value<string>
  forgotPasswordLink?: Value<string>
  noAccountLink?: Value<string>
  acceptTermsLabel?: Value<string>
  confirmPasswordLabel?: Value<string>
  signUpTitle?: Value<string>
  signUpButton?: Value<string>
  nameLabel?: Value<string>
  hasAccountLink?: Value<string>
  resetPasswordTitle?: Value<string>
  resetPasswordButton?: Value<string>
  resetPasswordDescription?: Value<string>
  backToSignInLink?: Value<string>
}

// Component-specific options
export interface AuthContainerOptions {
  mode?: Value<AuthMode>
  className?: Value<string>
  socialProviders?: AuthProviderInfo[]
  passwordRules?: PasswordRules
  showRememberMe?: Value<boolean>
  showSocialDivider?: Value<boolean>
  labels?: AuthContainerLabels
  onSignIn?: (data: SignInData) => Promise<string | null>
  onSignUp?: (data: SignUpData) => Promise<string | null>
  onResetPassword?: (data: ResetPasswordData) => Promise<string | null>
  onModeChange?: (mode: AuthMode) => void
  // onSocialLogin?: (provider: AuthProviderName) => Promise<void>
  showPasswordStrength?: Value<boolean>
  showAlreadyHaveAccountLink?: boolean
  showNameField?: boolean
  showConfirmPassword?: Value<boolean>
  showAcceptTermsAndConditions?: Value<boolean>
  termsAndConditions?: TNode
  showContainer?: Value<boolean>
}

export interface SocialProvidersOptions {
  providers: AuthProviderInfo[]
}

export interface SignInFormLabels {
  emailLabel?: Value<string>
  passwordLabel?: Value<string>
  rememberMeLabel?: Value<string>
  signInButton?: Value<string>
  forgotPasswordLink?: Value<string>
  noAccountLink?: Value<string>
}

export interface SignInFormOptions {
  onSignIn?: (data: SignInData) => Promise<string | null>
  passwordRules?: PasswordRules
  labels?: SignInFormLabels
  showRememberMe?: Value<boolean>
}

export interface SignUpFormLabels {
  nameLabel?: Value<string>
  emailLabel?: Value<string>
  passwordLabel?: Value<string>
  confirmPasswordLabel?: Value<string>
  acceptTermsLabel?: Value<string>
  signUpButton?: Value<string>
  hasAccountLink?: Value<string>
}

export interface SignUpFormOptions {
  passwordRules?: PasswordRules
  labels?: SignUpFormLabels
  onSignUp?: (data: SignUpData) => Promise<string | null>
  showPasswordStrength?: Value<boolean>
  showAlreadyHaveAccountLink?: boolean
  showNameField?: boolean
  showConfirmPassword?: Value<boolean>
  showAcceptTermsAndConditions?: Value<boolean>
  termsAndConditions?: TNode
}

export interface ResetPasswordFormLabels {
  resetPasswordButton?: Value<string>
  resetPasswordDescription?: Value<string>
  emailLabel?: Value<string>
  backToSignInLink?: Value<string>
}

export interface ResetPasswordFormOptions {
  onResetPassword?: (data: ResetPasswordData) => Promise<string | null>
  labels?: ResetPasswordFormLabels
}

export interface SocialLoginButtonOptions {
  provider: Value<AuthProviderName>
  onClick?: () => Promise<void>
  disabled?: Value<boolean>
  size?: Value<ControlSize>
  flow?: Value<'redirect' | 'popup' | undefined>
  name: Value<string>
  icon: Value<string>
  color: Value<ThemeColorName | 'black'>
  labels?: {
    continueWithProvider?: Value<(provider: string) => string>
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
