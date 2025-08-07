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
  signInTitle?: () => string
  emailLabel?: () => string
  passwordLabel?: () => string
  rememberMeLabel?: () => string
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

// Component-specific options
export interface AuthContainerOptions {
  mode?: Value<AuthMode>
  className?: Value<string>
  socialProviders?: AuthProviderInfo[]
  passwordRules?: PasswordRules
  showRememberMe?: boolean
  showSocialDivider?: boolean
  allowSignUp?: boolean
  allowPasswordReset?: boolean
  labels?: AuthContainerLabels
  onSignIn?: (data: SignInData) => Promise<string | null>
  onSignUp?: (data: SignUpData) => Promise<string | null>
  onResetPassword?: (data: ResetPasswordData) => Promise<string | null>
  onModeChange?: (mode: AuthMode) => void
  // onSocialLogin?: (provider: AuthProviderName) => Promise<void>
  showPasswordStrength?: boolean
  showAlreadyHaveAccountLink?: boolean
  showNameField?: boolean
  showConfirmPassword?: boolean
  showAcceptTermsAndConditions?: boolean
  termsAndConditions?: TNode
  showContainer?: Value<boolean>
}

export interface SocialProvidersOptions {
  providers: AuthProviderInfo[]
}

export interface SignInFormLabels {
  emailLabel?: () => string
  passwordLabel?: () => string
  rememberMeLabel?: () => string
  signInButton?: () => string
  forgotPasswordLink?: () => string
  noAccountLink?: () => string
}

export interface SignInFormOptions {
  onSignIn?: (data: SignInData) => Promise<string | null>
  passwordRules?: PasswordRules
  labels?: SignInFormLabels
  showRememberMe?: boolean
}

export interface SignUpFormLabels {
  nameLabel?: () => string
  emailLabel?: () => string
  passwordLabel?: () => string
  confirmPasswordLabel?: () => string
  acceptTermsLabel?: () => string
  signUpButton?: () => string
  hasAccountLink?: () => string
}

export interface SignUpFormOptions {
  passwordRules?: PasswordRules
  labels?: SignUpFormLabels
  onSignUp?: (data: SignUpData) => Promise<string | null>
  showPasswordStrength?: boolean
  showAlreadyHaveAccountLink?: boolean
  showNameField?: boolean
  showConfirmPassword?: boolean
  showAcceptTermsAndConditions?: boolean
  termsAndConditions?: TNode
}

export interface ResetPasswordFormLabels {
  resetPasswordButton?: () => string
  resetPasswordDescription?: () => string
  emailLabel?: () => string
  backToSignInLink?: () => string
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
