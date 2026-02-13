/**
 * Better Auth integration bridge for `@tempots/beatui/better-auth`.
 *
 * Connects a `better-auth` client to the BeatUI auth UI components, with
 * support for session management, passkeys, two-factor authentication,
 * magic links, and social provider mapping.
 *
 * ```ts
 * import { createBetterAuthBridge, BetterAuth } from '@tempots/beatui/better-auth'
 * ```
 *
 * @module
 */

export type {
  BetterAuthClient,
  BetterAuthResult,
  BetterAuthUser,
  BetterAuthSession,
  BetterAuthBridge,
  BetterAuthBridgeOptions,
  TwoFactorClient,
  PasskeyClient,
  PasskeyInfo,
} from './types'

export { createBetterAuthBridge } from './bridge'
export { createSessionManager } from './session'
export type { SessionManager } from './session'
export { mapSocialProviders } from './social-mapping'
export { BetterAuth } from './provider'
export type { BetterAuthProviderOptions } from './provider'

// Convenience components
export { BetterAuthContainer } from './components/better-auth-container'
export { BetterAuthModal } from './components/better-auth-modal'
export { Authenticated, Unauthenticated } from './components/authenticated'

// Plugin components
export { TwoFactorSetup } from './components/two-factor-setup'
export type { TwoFactorSetupOptions } from './components/two-factor-setup'
export { TwoFactorVerify } from './components/two-factor-verify'
export type {
  TwoFactorVerifyOptions,
  TwoFactorMethod,
} from './components/two-factor-verify'
export { MagicLinkForm } from './components/magic-link-form'
export type { MagicLinkFormOptions } from './components/magic-link-form'
export { PasskeySignIn } from './components/passkey-signin'
export type { PasskeySignInOptions } from './components/passkey-signin'
export { PasskeyManagement } from './components/passkey-management'
export type { PasskeyManagementOptions } from './components/passkey-management'

// i18n
export { BetterAuthI18n } from './i18n/translations'
export type { BetterAuthMessages } from './i18n/default'
