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

// Structural interface for better-auth client — avoids hard import dependency
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
    verify: (opts: {
      token: string
    }) => Promise<BetterAuthResult<unknown>>
  }
}

export interface BetterAuthResult<T> {
  data: T | null
  error: { message: string; status: number; statusText: string } | null
}

export interface BetterAuthUser {
  id: string
  name?: string
  email: string
  image?: string
}

export interface TwoFactorClient {
  enable: (opts: {
    password: string
    issuer?: string
  }) => Promise<BetterAuthResult<{ totpURI: string; backupCodes: string[] }>>
  disable: (opts: {
    password: string
  }) => Promise<BetterAuthResult<unknown>>
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

export interface PasskeyClient {
  addPasskey: (opts?: {
    name?: string
  }) => Promise<BetterAuthResult<unknown>>
  listUserPasskeys: () => Promise<BetterAuthResult<PasskeyInfo[]>>
  deletePasskey: (opts: { id: string }) => Promise<BetterAuthResult<unknown>>
  updatePasskey: (opts: {
    id: string
    name: string
  }) => Promise<BetterAuthResult<unknown>>
}

export interface PasskeyInfo {
  id: string
  name?: string
  createdAt: string
}

export interface BetterAuthBridgeOptions {
  callbackURL?: string
  errorCallbackURL?: string
  socialProviders?: AuthProviderName[]
  passwordRules?: PasswordRules
  showRememberMe?: boolean
  showNameField?: boolean
  showConfirmPassword?: boolean
  showPasswordStrength?: boolean
  refreshInterval?: number // ms, 0 = disabled (default: 0)
  onSessionChange?: (session: BetterAuthSession | null) => void
  onError?: (error: { message: string; status: number }) => void
  labels?: AuthContainerLabels
}

export interface BetterAuthSession {
  user: BetterAuthUser
  [key: string]: unknown
}

export interface BetterAuthBridge {
  session: Signal<BetterAuthSession | null>
  isPending: Signal<boolean>
  user: Signal<BetterAuthUser | null>
  isAuthenticated: Signal<boolean>
  containerOptions: AuthContainerOptions
  signInOptions: SignInFormOptions
  signUpOptions: SignUpFormOptions
  resetOptions: ResetPasswordFormOptions
  socialProviders: AuthProviderInfo[]
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  dispose: () => void
}
