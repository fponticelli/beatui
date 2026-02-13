/**
 * Authentication Component Types
 *
 * TypeScript interfaces and types for the BeatUI authentication suite.
 * These types define the contracts for all auth-related UI components,
 * including sign-in, sign-up, reset password forms, social login,
 * and password validation.
 *
 * @module auth/types
 */

import { TNode, Value } from '@tempots/dom'
import { ControlSize } from '../theme'
import { ThemeColorName } from '../../tokens'
import { AuthProviderInfo } from './social-login-button'

/**
 * Supported social authentication provider names.
 *
 * Represents all OAuth/social login providers that BeatUI auth components
 * can render buttons for. Each provider name maps to display information
 * (icon, color, label) in the social login button components.
 *
 * @example
 * ```ts
 * const provider: AuthProviderName = 'google'
 * ```
 */
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

/**
 * The current mode of the authentication container.
 *
 * Determines which form is displayed: sign-in, sign-up, or reset password.
 *
 * @example
 * ```ts
 * const mode: AuthMode = 'signin'
 * ```
 */
export type AuthMode = 'signin' | 'signup' | 'reset-password'

/**
 * The OAuth flow type for social login.
 *
 * - `'redirect'` - Navigates the user to the provider's login page.
 * - `'popup'` - Opens the provider's login page in a popup window.
 */
export type SocialLoginFlow = 'redirect' | 'popup'

/**
 * Password strength levels used by the password strength indicator.
 *
 * Computed based on how many configured password rules are satisfied.
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

/**
 * Data submitted by the sign-in form.
 */
export interface SignInData {
  /** The user's email address. */
  email: string
  /** The user's password. */
  password: string
}

/**
 * Alias for {@link SignInData}, used as the form data type for the sign-in form.
 */
export type SignInFormData = SignInData

/**
 * Data submitted by the sign-up form (without confirm password).
 *
 * This is the cleaned data passed to the `onSignUp` callback, after
 * the confirm password field has been validated and removed.
 */
export interface SignUpData {
  /** The user's display name. */
  name?: string
  /** The user's email address. */
  email: string
  /** The user's chosen password. */
  password: string
  /** Whether the user accepted the terms and conditions. */
  acceptTerms: boolean
}

/**
 * Internal form data for the sign-up form, including the confirm password field.
 *
 * Extends {@link SignUpData} with the `confirmPassword` field used for
 * client-side validation before submission.
 */
export interface SignUpFormData extends SignUpData {
  /** The password confirmation value, validated to match `password`. */
  confirmPassword: string
}

/**
 * Data submitted by the reset password form.
 */
export interface ResetPasswordData {
  /** The email address to send the password reset link to. */
  email: string
}

/**
 * Configuration for a social login provider.
 *
 * @typeParam T - The type of the success result returned by the OAuth flow.
 */
export interface SocialProviderConfig<T> {
  /** The name of the social provider (e.g., `'google'`, `'github'`). */
  provider: AuthProviderName
  /** The OAuth client ID for this provider. */
  clientId?: string
  /** The OAuth flow type: `'redirect'` or `'popup'`. */
  flow?: SocialLoginFlow
  /** OAuth scopes to request from the provider. */
  scopes?: string[]
  /** Additional query parameters to include in the OAuth URL. */
  customParams?: Record<string, string>
  /** Callback invoked on successful authentication. */
  onSuccess?: (result: T) => Promise<void> | void
  /** Callback invoked when authentication fails. */
  onError?: (error: Error) => Promise<void> | void
}

/**
 * Password validation rules used by the sign-up form and password strength indicator.
 *
 * Each rule is optional. When enabled, it adds a corresponding validation
 * check to the password schema and a requirement line to the strength indicator.
 *
 * @example
 * ```ts
 * const rules: PasswordRules = {
 *   minLength: 8,
 *   requireUppercase: true,
 *   requireLowercase: true,
 *   requireNumbers: true,
 *   requireSymbols: false,
 * }
 * ```
 */
export interface PasswordRules {
  /** Minimum number of characters required. @default 8 */
  minLength?: number
  /** Whether at least one uppercase letter is required. @default true */
  requireUppercase?: boolean
  /** Whether at least one lowercase letter is required. @default true */
  requireLowercase?: boolean
  /** Whether at least one digit is required. @default true */
  requireNumbers?: boolean
  /** Whether at least one special character is required. @default false */
  requireSymbols?: boolean
  /**
   * Custom validation function for additional password checks.
   * @param password - The password to validate.
   * @returns An error message string if invalid, or `null` if valid.
   */
  customValidation?: (password: string) => string | null
}

/**
 * Customizable label overrides for the {@link AuthContainer} component.
 *
 * All labels are optional reactive `Value<string>` values. When not provided,
 * the component falls back to the current locale's i18n translations.
 */
export interface AuthContainerLabels {
  /** Title displayed on the sign-in form. */
  signInTitle?: Value<string>
  /** Label for the email input field. */
  emailLabel?: Value<string>
  /** Label for the password input field. */
  passwordLabel?: Value<string>
  /** Label for the "remember me" checkbox. */
  rememberMeLabel?: Value<string>
  /** Text for the sign-in submit button. */
  signInButton?: Value<string>
  /** Text for the "forgot password?" link. */
  forgotPasswordLink?: Value<string>
  /** Text for the "don't have an account?" link. */
  noAccountLink?: Value<string>
  /** Label for the "accept terms" checkbox. */
  acceptTermsLabel?: Value<string>
  /** Label for the confirm password input field. */
  confirmPasswordLabel?: Value<string>
  /** Title displayed on the sign-up form. */
  signUpTitle?: Value<string>
  /** Text for the sign-up submit button. */
  signUpButton?: Value<string>
  /** Label for the name input field. */
  nameLabel?: Value<string>
  /** Text for the "already have an account?" link. */
  hasAccountLink?: Value<string>
  /** Title displayed on the reset password form. */
  resetPasswordTitle?: Value<string>
  /** Text for the reset password submit button. */
  resetPasswordButton?: Value<string>
  /** Description text shown on the reset password form. */
  resetPasswordDescription?: Value<string>
  /** Text for the "back to sign in" link. */
  backToSignInLink?: Value<string>
}

/**
 * Options for the {@link AuthContainer} component.
 *
 * The AuthContainer is the main authentication UI that switches between
 * sign-in, sign-up, and reset-password modes. It coordinates social login
 * buttons, form fields, and mode navigation.
 *
 * @example
 * ```ts
 * AuthContainer({
 *   mode: 'signin',
 *   socialProviders: [{ provider: 'google' }, { provider: 'github' }],
 *   onSignIn: async (data) => { /* handle sign in *\/ return null },
 *   onSignUp: async (data) => { /* handle sign up *\/ return null },
 *   showRememberMe: true,
 * })
 * ```
 */
export interface AuthContainerOptions {
  /** The initial or controlled authentication mode. @default 'signin' */
  mode?: Value<AuthMode>
  /** Additional CSS class names to apply to the container. */
  className?: Value<string>
  /** Social login providers to display as buttons above the form. */
  socialProviders?: AuthProviderInfo[]
  /** Initial value for the name field on the sign-up form. */
  initialName?: string
  /** Initial value for the email field on the sign-up form. */
  initialEmail?: string
  /** Password validation rules applied to sign-in and sign-up forms. */
  passwordRules?: PasswordRules
  /** Whether to show the "remember me" checkbox on the sign-in form. */
  showRememberMe?: Value<boolean>
  /** Whether to show the "or" divider between social buttons and the form. */
  showSocialDivider?: Value<boolean>
  /** Custom label overrides for all form text. */
  labels?: AuthContainerLabels
  /**
   * Callback invoked when the sign-in form is submitted.
   * @param data - The sign-in form data.
   * @returns An error message string to display, or `null` on success.
   */
  onSignIn?: (data: SignInData) => Promise<string | null>
  /**
   * Callback invoked when the sign-up form is submitted.
   * @param data - The sign-up form data.
   * @returns An error message string to display, or `null` on success.
   */
  onSignUp?: (data: SignUpData) => Promise<string | null>
  /**
   * Callback invoked when the reset password form is submitted.
   * @param data - The reset password form data.
   * @returns An error message string to display, or `null` on success.
   */
  onResetPassword?: (data: ResetPasswordData) => Promise<string | null>
  /**
   * Callback invoked when the user switches between auth modes.
   * @param mode - The new authentication mode.
   */
  onModeChange?: (mode: AuthMode) => void
  /**
   * Callback invoked when a social login button is clicked.
   * @param provider - The name of the social provider.
   */
  onSocialLogin?: (provider: AuthProviderName) => Promise<void>
  /** Whether to show the password strength indicator on the sign-up form. */
  showPasswordStrength?: Value<boolean>
  /** Whether to show the "already have an account?" link on the sign-up form. */
  showAlreadyHaveAccountLink?: boolean
  /** Whether to show the name field on the sign-up form. */
  showNameField?: boolean
  /** Whether to show the confirm password field on the sign-up form. */
  showConfirmPassword?: Value<boolean>
  /** Whether to show the "accept terms and conditions" checkbox on the sign-up form. */
  showAcceptTermsAndConditions?: Value<boolean>
  /** Custom terms and conditions content to display next to the checkbox. */
  termsAndConditions?: TNode
  /** Whether to render the styled container wrapper. @default true */
  showContainer?: Value<boolean>
}

/**
 * Options for the {@link SocialProviders} component, which renders a list of social login buttons.
 */
export interface SocialProvidersOptions {
  /** The list of social login providers to display. */
  providers: AuthProviderInfo[]
  /**
   * Callback invoked when a social login button is clicked.
   * @param provider - The name of the social provider that was clicked.
   */
  onSocialLogin?: (provider: AuthProviderName) => Promise<void>
}

/**
 * Customizable label overrides for the {@link SignInForm} component.
 */
export interface SignInFormLabels {
  /** Label for the email input field. */
  emailLabel?: Value<string>
  /** Label for the password input field. */
  passwordLabel?: Value<string>
  /** Label for the "remember me" checkbox. */
  rememberMeLabel?: Value<string>
  /** Text for the sign-in submit button. */
  signInButton?: Value<string>
  /** Text for the "forgot password?" link. */
  forgotPasswordLink?: Value<string>
  /** Text for the "don't have an account?" link. */
  noAccountLink?: Value<string>
}

/**
 * Options for the {@link SignInForm} component.
 */
export interface SignInFormOptions {
  /**
   * Callback invoked when the sign-in form is submitted.
   * @param data - The sign-in form data.
   * @returns An error message string to display, or `null` on success.
   */
  onSignIn?: (data: SignInData) => Promise<string | null>
  /** Password validation rules for the password field. */
  passwordRules?: PasswordRules
  /** Custom label overrides for form text. */
  labels?: SignInFormLabels
  /** Whether to show the "remember me" checkbox. */
  showRememberMe?: Value<boolean>
}

/**
 * Customizable label overrides for the {@link SignUpForm} component.
 */
export interface SignUpFormLabels {
  /** Label for the name input field. */
  nameLabel?: Value<string>
  /** Label for the email input field. */
  emailLabel?: Value<string>
  /** Label for the password input field. */
  passwordLabel?: Value<string>
  /** Label for the confirm password input field. */
  confirmPasswordLabel?: Value<string>
  /** Label for the "accept terms" checkbox. */
  acceptTermsLabel?: Value<string>
  /** Text for the sign-up submit button. */
  signUpButton?: Value<string>
  /** Text for the "already have an account?" link. */
  hasAccountLink?: Value<string>
}

/**
 * Options for the {@link SignUpForm} component.
 */
export interface SignUpFormOptions {
  /** Initial value for the name field. */
  initialName?: string
  /** Initial value for the email field. */
  initialEmail?: string
  /** Password validation rules for the password and confirm password fields. */
  passwordRules?: PasswordRules
  /** Custom label overrides for form text. */
  labels?: SignUpFormLabels
  /**
   * Callback invoked when the sign-up form is submitted.
   * @param data - The sign-up form data (without confirmPassword).
   * @returns An error message string to display, or `null` on success.
   */
  onSignUp?: (data: SignUpData) => Promise<string | null>
  /** Whether to show the password strength indicator. */
  showPasswordStrength?: Value<boolean>
  /** Whether to show the "already have an account?" link. */
  showAlreadyHaveAccountLink?: boolean
  /** Whether to show the name field. @default true */
  showNameField?: boolean
  /** Whether to show the confirm password field. */
  showConfirmPassword?: Value<boolean>
  /** Whether to show the "accept terms and conditions" checkbox. */
  showAcceptTermsAndConditions?: Value<boolean>
  /** Custom terms and conditions content to display next to the checkbox. */
  termsAndConditions?: TNode
}

/**
 * Customizable label overrides for the {@link ResetPasswordForm} component.
 */
export interface ResetPasswordFormLabels {
  /** Text for the reset password submit button. */
  resetPasswordButton?: Value<string>
  /** Description text shown above the email field. */
  resetPasswordDescription?: Value<string>
  /** Label for the email input field. */
  emailLabel?: Value<string>
  /** Text for the "back to sign in" link. */
  backToSignInLink?: Value<string>
}

/**
 * Options for the {@link ResetPasswordForm} component.
 */
export interface ResetPasswordFormOptions {
  /**
   * Callback invoked when the reset password form is submitted.
   * @param data - The reset password form data containing the email.
   * @returns An error message string to display, or `null` on success.
   */
  onResetPassword?: (data: ResetPasswordData) => Promise<string | null>
  /** Custom label overrides for form text. */
  labels?: ResetPasswordFormLabels
}

/**
 * Options for the {@link SocialLoginButton} component.
 *
 * Renders a branded button for a specific social authentication provider.
 */
export interface SocialLoginButtonOptions {
  /** The social provider this button represents. */
  provider: Value<AuthProviderName>
  /** Click handler invoked when the button is pressed. */
  onClick?: () => Promise<void>
  /** Whether the button is disabled. */
  disabled?: Value<boolean>
  /** The size of the button. @default 'md' */
  size?: Value<ControlSize>
  /** The OAuth flow type: `'redirect'` or `'popup'`. */
  flow?: Value<'redirect' | 'popup' | undefined>
  /** The display name of the provider (e.g., `'Google'`). */
  name: Value<string>
  /** The icon identifier for the provider (e.g., `'logos:google-icon'`). */
  icon: Value<string>
  /** The theme color to use for the button. */
  color: Value<ThemeColorName>
  /** Optional label overrides for the button text. */
  labels?: {
    /**
     * Function that formats the button label given a provider name.
     * @default (provider) => `Continue with ${provider}`
     */
    continueWithProvider?: Value<(provider: string) => string>
  }
}

/**
 * Options for the {@link PasswordStrengthIndicator} component.
 *
 * Displays a visual bar, label, and requirements checklist for password strength.
 */
export interface PasswordStrengthIndicatorOptions {
  /** Reactive password value to evaluate strength for. */
  password: Value<string>
  /** Password rules to evaluate against. Falls back to default rules if not provided. */
  rules?: PasswordRules
  /** Whether to show the strength label text (e.g., "Weak", "Strong"). @default true */
  showLabel?: boolean
  /** Additional CSS class names to apply to the indicator container. */
  className?: Value<string>
}

/**
 * Display information for a social authentication provider.
 *
 * Contains the human-readable name, icon identifier, and theme color
 * used to render the provider's social login button.
 */
export interface ProviderInfo {
  /** The human-readable display name (e.g., `'Google'`). */
  name: string
  /** The icon identifier compatible with the Icon component (e.g., `'logos:google-icon'`). */
  icon: string
  /** The theme color name used for the button styling. */
  color: ThemeColorName
}
