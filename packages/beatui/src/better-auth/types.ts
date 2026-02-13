/**
 * Better Auth Types
 *
 * TypeScript interfaces for the better-auth integration layer. Defines structural
 * interfaces for the better-auth client (avoiding hard import dependencies),
 * session types, bridge configuration, and plugin client interfaces for
 * two-factor authentication and passkeys.
 *
 * @module better-auth/types
 */

import { Signal } from '@tempots/dom'
import {
  AuthContainerLabels,
  AuthContainerOptions,
  AuthProviderInfo,
  AuthProviderName,
  PasswordRules,
  ResetPasswordFormOptions,
  SignInFormOptions,
  SignUpFormOptions,
} from '../components/auth'

/**
 * Structural interface for the better-auth client.
 *
 * Defines the expected shape of the better-auth client object without
 * importing the actual library, avoiding a hard dependency. Components
 * that receive a `BetterAuthClient` can work with any object that
 * satisfies this interface.
 */
export interface BetterAuthClient {
  signIn: {
    email: (opts: {
      email: string
      password: string
      rememberMe?: boolean
      callbackURL?: string
    }) => Promise<BetterAuthResult<unknown>>
    social: (opts: {
      provider: string
      callbackURL?: string
      errorCallbackURL?: string
    }) => Promise<BetterAuthResult<unknown>>
    magicLink?: (opts: {
      email: string
      callbackURL?: string
    }) => Promise<BetterAuthResult<unknown>>
    passkey?: (opts?: {
      autoFill?: boolean
    }) => Promise<BetterAuthResult<unknown>>
  }
  signUp: {
    email: (opts: {
      name?: string
      email: string
      password: string
      callbackURL?: string
    }) => Promise<BetterAuthResult<unknown>>
  }
  signOut: (opts?: object) => Promise<BetterAuthResult<unknown>>
  getSession: () => Promise<
    BetterAuthResult<{ session: unknown; user: BetterAuthUser }>
  >
  requestPasswordReset: (opts: {
    email: string
    redirectTo?: string
  }) => Promise<BetterAuthResult<unknown>>
  resetPassword?: (opts: {
    newPassword: string
    token: string
  }) => Promise<BetterAuthResult<unknown>>
  changePassword?: (opts: {
    newPassword: string
    currentPassword: string
    revokeOtherSessions?: boolean
  }) => Promise<BetterAuthResult<unknown>>
  sendVerificationEmail?: (opts: {
    email: string
    callbackURL: string
  }) => Promise<BetterAuthResult<unknown>>
  twoFactor?: TwoFactorClient
  passkey?: PasskeyClient
  magicLink?: {
    verify: (opts: { token: string }) => Promise<BetterAuthResult<unknown>>
  }
}

/**
 * Result type returned by better-auth client methods.
 *
 * Either `data` or `error` will be non-null, but not both.
 *
 * @typeParam T - The type of the success data.
 */
export interface BetterAuthResult<T> {
  /** The success data, or `null` if the operation failed. */
  data: T | null
  /** The error details, or `null` if the operation succeeded. */
  error: { message: string; status: number; statusText: string } | null
}

/**
 * Represents a user object from the better-auth system.
 */
export interface BetterAuthUser {
  /** The unique user identifier. */
  id: string
  /** The user's display name. */
  name?: string
  /** The user's email address. */
  email: string
  /** URL to the user's profile image. */
  image?: string
}

/**
 * Client interface for two-factor authentication operations.
 *
 * Provides methods for enabling/disabling 2FA, verifying TOTP codes,
 * sending and verifying OTP codes, and managing backup codes.
 */
export interface TwoFactorClient {
  enable: (opts: {
    password: string
    issuer?: string
  }) => Promise<BetterAuthResult<{ totpURI: string; backupCodes: string[] }>>
  disable: (opts: { password: string }) => Promise<BetterAuthResult<unknown>>
  getTotpUri: (opts: {
    password: string
  }) => Promise<BetterAuthResult<{ totpURI: string }>>
  verifyTotp: (opts: {
    code: string
    trustDevice?: boolean
  }) => Promise<BetterAuthResult<unknown>>
  sendOtp?: (opts?: {
    trustDevice?: boolean
  }) => Promise<BetterAuthResult<unknown>>
  verifyOtp?: (opts: {
    code: string
    trustDevice?: boolean
  }) => Promise<BetterAuthResult<unknown>>
  generateBackupCodes: (opts: {
    password: string
  }) => Promise<BetterAuthResult<{ backupCodes: string[] }>>
  verifyBackupCode: (opts: {
    code: string
  }) => Promise<BetterAuthResult<unknown>>
}

/**
 * Client interface for passkey (WebAuthn) operations.
 *
 * Provides methods for adding, listing, deleting, and renaming passkeys.
 */
export interface PasskeyClient {
  addPasskey: (opts?: { name?: string }) => Promise<BetterAuthResult<unknown>>
  listUserPasskeys: () => Promise<BetterAuthResult<PasskeyInfo[]>>
  deletePasskey: (opts: { id: string }) => Promise<BetterAuthResult<unknown>>
  updatePasskey: (opts: {
    id: string
    name: string
  }) => Promise<BetterAuthResult<unknown>>
}

/**
 * Information about a registered passkey.
 */
export interface PasskeyInfo {
  /** The unique passkey identifier. */
  id: string
  /** The user-assigned name for this passkey. */
  name?: string
  /** The ISO 8601 date string when the passkey was created. */
  createdAt: string
}

/**
 * Configuration options for the better-auth bridge.
 *
 * Controls OAuth callback URLs, social providers, form display options,
 * session polling, and event callbacks.
 */
export interface BetterAuthBridgeOptions {
  /** The URL to redirect to after successful authentication. */
  callbackURL?: string
  /** The URL to redirect to when an authentication error occurs. */
  errorCallbackURL?: string
  /** List of social provider names to display login buttons for. */
  socialProviders?: AuthProviderName[]
  /** Password validation rules for sign-in and sign-up forms. */
  passwordRules?: PasswordRules
  /** Whether to show the "remember me" checkbox. */
  showRememberMe?: boolean
  /** Whether to show the name field on the sign-up form. */
  showNameField?: boolean
  /** Whether to show the confirm password field on the sign-up form. */
  showConfirmPassword?: boolean
  /** Whether to show the password strength indicator on the sign-up form. */
  showPasswordStrength?: boolean
  /** Session polling interval in milliseconds. Set to `0` to disable. @default 0 */
  refreshInterval?: number
  /**
   * Callback invoked whenever the session state changes.
   * @param session - The new session, or `null` if the user signed out.
   */
  onSessionChange?: (session: BetterAuthSession | null) => void
  /**
   * Callback invoked when an authentication error occurs.
   * @param error - The error details including message and HTTP status.
   */
  onError?: (error: { message: string; status: number }) => void
  /** Custom label overrides for all auth form text. */
  labels?: AuthContainerLabels
}

/**
 * Represents an active authentication session.
 *
 * Contains the authenticated user and any additional session data
 * from the better-auth backend.
 */
export interface BetterAuthSession {
  /** The authenticated user. */
  user: BetterAuthUser
  /** Additional session properties from the backend. */
  [key: string]: unknown
}

/**
 * The bridge object returned by {@link createBetterAuthBridge}.
 *
 * Provides reactive session state, pre-configured form options for auth
 * components, and methods for sign-out and session management.
 *
 * @example
 * ```ts
 * const bridge = createBetterAuthBridge(authClient, { socialProviders: ['google'] })
 *
 * // Use reactive state
 * When(bridge.isAuthenticated, () => html.div('Welcome!'))
 *
 * // Use pre-configured options
 * AuthContainer(bridge.containerOptions)
 * ```
 */
export interface BetterAuthBridge {
  /** Reactive signal containing the current session, or `null` if not authenticated. */
  session: Signal<BetterAuthSession | null>
  /** Reactive signal that is `true` while the initial session fetch is in progress. */
  isPending: Signal<boolean>
  /** Reactive signal containing the current user, or `null` if not authenticated. */
  user: Signal<BetterAuthUser | null>
  /** Reactive signal that is `true` when the user is authenticated. */
  isAuthenticated: Signal<boolean>
  /** Pre-configured options for the {@link AuthContainer} component. */
  containerOptions: AuthContainerOptions
  /** Pre-configured options for the {@link SignInForm} component. */
  signInOptions: SignInFormOptions
  /** Pre-configured options for the {@link SignUpForm} component. */
  signUpOptions: SignUpFormOptions
  /** Pre-configured options for the {@link ResetPasswordForm} component. */
  resetOptions: ResetPasswordFormOptions
  /** The list of social provider configurations derived from bridge options. */
  socialProviders: AuthProviderInfo[]
  /** Signs the user out and refreshes the session state. */
  signOut: () => Promise<void>
  /** Manually refreshes the session by re-fetching from the server. */
  refreshSession: () => Promise<void>
  /** Disposes all reactive signals and clears any polling intervals. */
  dispose: () => void
}
