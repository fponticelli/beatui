/**
 * Authentication Utility Functions
 *
 * Helper functions and constants for authentication components, including
 * provider display metadata, URL construction, popup handling, error formatting,
 * and form validation utilities.
 *
 * @module auth/utils
 */

import { AuthProviderName, PasswordRules } from './types'
import { taskToValidation } from '../form'
import { Validation } from '@tempots/std'

/**
 * Mapping of every supported social provider name to its display metadata.
 *
 * Contains the human-readable name, Iconify icon identifier, and hex brand color
 * for each {@link AuthProviderName}.
 *
 * @example
 * ```ts
 * const info = providerInfo['google']
 * // { name: 'Google', icon: 'logos:google-icon', color: '#4285f4' }
 * ```
 */
export const providerInfo: Record<
  AuthProviderName,
  { name: string; icon: string; color: string }
> = {
  google: { name: 'Google', icon: 'logos:google-icon', color: '#4285f4' },
  github: { name: 'GitHub', icon: 'logos:github-icon', color: '#333' },
  apple: { name: 'Apple', icon: 'logos:apple', color: '#000' },
  facebook: { name: 'Facebook', icon: 'logos:facebook', color: '#1877f2' },
  twitter: { name: 'Twitter', icon: 'logos:twitter', color: '#1da1f2' },
  microsoft: {
    name: 'Microsoft',
    icon: 'logos:microsoft-icon',
    color: '#00a4ef',
  },
  discord: { name: 'Discord', icon: 'logos:discord-icon', color: '#5865f2' },
  linkedin: { name: 'LinkedIn', icon: 'logos:linkedin-icon', color: '#0077b5' },
  instagram: {
    name: 'Instagram',
    icon: 'logos:instagram-icon',
    color: '#e4405f',
  },
  tiktok: { name: 'TikTok', icon: 'logos:tiktok-icon', color: '#000' },
  snapchat: { name: 'Snapchat', icon: 'logos:snapchat-icon', color: '#fffc00' },
  reddit: { name: 'Reddit', icon: 'logos:reddit-icon', color: '#ff4500' },
  pinterest: {
    name: 'Pinterest',
    icon: 'logos:pinterest-icon',
    color: '#bd081c',
  },
  twitch: { name: 'Twitch', icon: 'logos:twitch', color: '#9146ff' },
  steam: { name: 'Steam', icon: 'logos:steam-icon', color: '#000' },
  epic: {
    name: 'Epic Games',
    icon: 'simple-icons:epicgames',
    color: '#313131',
  },
  playstation: {
    name: 'PlayStation',
    icon: 'logos:playstation-icon',
    color: '#003791',
  },
  xbox: { name: 'Xbox', icon: 'logos:xbox-icon', color: '#107c10' },
  whatsapp: { name: 'WhatsApp', icon: 'logos:whatsapp-icon', color: '#25d366' },
  wechat: { name: 'WeChat', icon: 'logos:wechat-icon', color: '#1aad19' },
  amazon: { name: 'Amazon', icon: 'logos:amazon-icon', color: '#ff9900' },
  yahoo: { name: 'Yahoo', icon: 'logos:yahoo-icon', color: '#720e9e' },
  paypal: { name: 'PayPal', icon: 'logos:paypal', color: '#0070ba' },
  x: { name: 'X', icon: 'simple-icons:x', color: '#000' },
}

/**
 * Returns the human-readable display name for a social provider.
 *
 * @param provider - The provider identifier.
 * @returns The formatted provider name (e.g., `'Google'`), or the raw identifier if not found.
 *
 * @example
 * ```ts
 * formatProviderName('github') // 'GitHub'
 * ```
 */
export function formatProviderName(provider: AuthProviderName): string {
  return providerInfo[provider]?.name || provider
}

/**
 * Returns the Iconify icon identifier for a social provider.
 *
 * @param provider - The provider identifier.
 * @returns The icon string (e.g., `'logos:google-icon'`), or `'mdi:account'` as a fallback.
 *
 * @example
 * ```ts
 * getProviderIcon('github') // 'logos:github-icon'
 * ```
 */
export function getProviderIcon(provider: AuthProviderName): string {
  return providerInfo[provider]?.icon || 'mdi:account'
}

/**
 * Returns the brand hex color for a social provider.
 *
 * @param provider - The provider identifier.
 * @returns The hex color string (e.g., `'#4285f4'`), or `'#666'` as a fallback.
 *
 * @example
 * ```ts
 * getProviderColor('google') // '#4285f4'
 * ```
 */
export function getProviderColor(provider: AuthProviderName): string {
  return providerInfo[provider]?.color || '#666'
}

/**
 * Formats a social login button label by replacing `{provider}` in a template string.
 *
 * @param provider - The provider identifier.
 * @param template - The template string containing `{provider}` placeholder. @default 'Continue with {provider}'
 * @returns The formatted string with the provider name substituted.
 *
 * @example
 * ```ts
 * formatSocialLoginText('google') // 'Continue with Google'
 * formatSocialLoginText('github', 'Sign in via {provider}') // 'Sign in via GitHub'
 * ```
 */
export function formatSocialLoginText(
  provider: AuthProviderName,
  template: string = 'Continue with {provider}'
): string {
  return template.replace('{provider}', formatProviderName(provider))
}

/**
 * Default password validation rules used across auth components.
 *
 * Requires at least 8 characters, one uppercase letter, one lowercase letter,
 * and one number. Special characters are not required by default.
 */
export const defaultPasswordRules: PasswordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: false,
}

/**
 * Checks whether a string matches a basic email format.
 *
 * Uses a simple regex for client-side validation. This is not a comprehensive
 * RFC 5322 check but covers common email patterns.
 *
 * @param email - The string to test.
 * @returns `true` if the string looks like a valid email address.
 *
 * @example
 * ```ts
 * isValidEmail('user@example.com') // true
 * isValidEmail('not-an-email')     // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generates a random alphanumeric string, typically used for OAuth state parameters.
 *
 * Note: Uses `Math.random()`, which is not cryptographically secure. For
 * production OAuth flows, consider using `crypto.getRandomValues()` instead.
 *
 * @param length - The length of the generated string. @default 32
 * @returns A random alphanumeric string of the specified length.
 *
 * @example
 * ```ts
 * const state = generateRandomString(16) // e.g., 'aB3kPm7xNq2wLz9R'
 * ```
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * Constructs an OAuth authorization URL for a social login provider.
 *
 * Builds a URL with query parameters for `client_id`, `redirect_uri`, `scope`,
 * `state`, and `response_type`. Provider-specific base URLs and default scopes
 * are built in. Custom scopes and additional query parameters can be provided.
 *
 * This is a basic implementation. For production use, consider using your
 * auth library's built-in OAuth URL construction.
 *
 * @param provider - The social provider to generate the URL for.
 * @param clientId - The OAuth client ID.
 * @param redirectUri - The URI to redirect to after authentication.
 * @param scopes - OAuth scopes to request. Defaults to provider-specific defaults if empty.
 * @param customParams - Additional query parameters to include in the URL.
 * @returns The fully constructed OAuth authorization URL.
 * @throws {Error} If the provider is not supported.
 *
 * @example
 * ```ts
 * const url = createSocialLoginUrl('google', 'my-client-id', 'https://myapp.com/callback')
 * ```
 */
export function createSocialLoginUrl(
  provider: AuthProviderName,
  clientId: string,
  redirectUri: string,
  scopes: string[] = [],
  customParams: Record<string, string> = {}
): string {
  const baseUrls: Record<AuthProviderName, string> = {
    google: 'https://accounts.google.com/oauth/authorize',
    github: 'https://github.com/login/oauth/authorize',
    apple: 'https://appleid.apple.com/auth/authorize',
    facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
    twitter: 'https://twitter.com/i/oauth2/authorize',
    microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    discord: 'https://discord.com/api/oauth2/authorize',
    linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
    instagram: 'https://api.instagram.com/oauth/authorize',
    tiktok: 'https://www.tiktok.com/v2/auth/authorize',
    snapchat: 'https://accounts.snapchat.com/accounts/oauth2/authorize',
    reddit: 'https://www.reddit.com/api/v1/authorize',
    pinterest: 'https://api.pinterest.com/oauth/',
    twitch: 'https://id.twitch.tv/oauth2/authorize',
    steam: 'https://steamcommunity.com/oauth/authorize',
    epic: 'https://auth.epicgames.com/authorize',
    playstation:
      'https://auth.api.sonyentertainmentnetwork.com/oauth/authorize',
    xbox: 'https://login.live.com/oauth20_authorize.srf',
    whatsapp: 'https://web.whatsapp.com/oauth/authorize',
    wechat: 'https://open.weixin.qq.com/connect/qrconnect',
    amazon: 'https://www.amazon.com/ap/oa',
    yahoo: 'https://api.login.yahoo.com/oauth2/request_auth',
    paypal: 'https://www.paypal.com/signin/authorize',
    x: 'https://api.twitter.com/oauth2/authorize',
  }

  const defaultScopes: Record<AuthProviderName, string[]> = {
    google: ['openid', 'email', 'profile'],
    github: ['user:email'],
    apple: ['email', 'name'],
    facebook: ['email'],
    twitter: ['users.read'],
    microsoft: ['openid', 'email', 'profile'],
    discord: ['identify', 'email'],
    linkedin: ['r_liteprofile', 'r_emailaddress'],
    instagram: ['user_profile', 'user_media'],
    tiktok: ['user.info.basic', 'user.external.id'],
    snapchat: ['user.info.basic', 'user.external.id'],
    reddit: ['identity', 'email'],
    pinterest: ['read_public', 'read_relationships'],
    twitch: ['openid', 'email', 'profile'],
    steam: ['openid', 'email', 'profile'],
    epic: ['openid', 'email', 'profile'],
    playstation: ['openid', 'email', 'profile'],
    xbox: ['openid', 'email', 'profile'],
    whatsapp: ['openid', 'email', 'profile'],
    wechat: ['openid', 'email', 'profile'],
    amazon: ['openid', 'email', 'profile'],
    yahoo: ['openid', 'email', 'profile'],
    paypal: ['openid', 'email', 'profile'],
    x: ['openid', 'email', 'profile'],
  }

  const baseUrl = baseUrls[provider]
  if (!baseUrl) {
    throw new Error(`Unsupported provider: ${provider}`)
  }

  const finalScopes = scopes.length > 0 ? scopes : defaultScopes[provider]
  const state = generateRandomString()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: finalScopes.join(' '),
    state,
    response_type: 'code',
    ...customParams,
  })

  return `${baseUrl}?${params.toString()}`
}

/**
 * Opens a popup window for social login and listens for the result via `postMessage`.
 *
 * The popup is monitored for closure (user cancellation) and for messages from
 * the popup window. Expected message types are `SOCIAL_LOGIN_SUCCESS` and
 * `SOCIAL_LOGIN_ERROR`, sent from the OAuth callback page.
 *
 * @typeParam T - The type of the success result data.
 * @param url - The OAuth authorization URL to open in the popup.
 * @param provider - The social provider name (used for the popup window name).
 * @param onSuccess - Callback invoked with the result data on successful login.
 * @param onError - Callback invoked with an error on failure or cancellation.
 *
 * @example
 * ```ts
 * openSocialLoginPopup<{ token: string }>(
 *   authUrl,
 *   'google',
 *   (result) => console.log('Token:', result.token),
 *   (error) => console.error('Failed:', error.message)
 * )
 * ```
 */
export function openSocialLoginPopup<T>(
  url: string,
  provider: AuthProviderName,
  onSuccess?: (result: T) => void,
  onError?: (error: Error) => void
): void {
  const popup = window.open(
    url,
    `${provider}_login`,
    'width=500,height=600,scrollbars=yes,resizable=yes'
  )

  if (!popup) {
    onError?.(new Error('Failed to open popup window'))
    return
  }

  // Poll for popup closure or message
  const checkClosed = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkClosed)
      onError?.(new Error('Login cancelled'))
    }
  }, 1000)

  // Listen for messages from popup
  const messageListener = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) {
      return
    }

    if (event.data.type === 'SOCIAL_LOGIN_SUCCESS') {
      clearInterval(checkClosed)
      popup.close()
      window.removeEventListener('message', messageListener)
      onSuccess?.(event.data.result)
    } else if (event.data.type === 'SOCIAL_LOGIN_ERROR') {
      clearInterval(checkClosed)
      popup.close()
      window.removeEventListener('message', messageListener)
      onError?.(new Error(event.data.error))
    }
  }

  window.addEventListener('message', messageListener)
}

/**
 * Formats an unknown error value into a human-readable error message string.
 *
 * Handles `Error` instances, plain strings, objects with a `message` property,
 * and falls back to a generic error message.
 *
 * @param error - The error value to format.
 * @returns A human-readable error message string.
 *
 * @example
 * ```ts
 * formatAuthError(new Error('Invalid credentials')) // 'Invalid credentials'
 * formatAuthError('Something went wrong')           // 'Something went wrong'
 * formatAuthError(42)                               // 'An unexpected error occurred'
 * ```
 */
export function formatAuthError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return 'An unexpected error occurred'
}

/**
 * Checks whether the code is running in a browser environment.
 *
 * @returns `true` if `window` and `document` are available, `false` otherwise.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Wraps an async form submission task into a form controller validation function.
 *
 * Creates a function that can be passed to `useForm`'s `onSubmit` option. It
 * handles loading state (via `onStart`/`onEnd` callbacks), invokes the task,
 * and converts the result into a `Validation` value compatible with the form
 * controller system.
 *
 * @typeParam T - The form data type.
 * @param options - Configuration for the validation wrapper.
 * @param options.task - The async function to call with the form value. Returns an error message or `null`.
 * @param options.message - A fallback error message used if the task throws.
 * @param options.onStart - Called before the task begins (e.g., to set loading state).
 * @param options.onEnd - Called after the task completes (e.g., to clear loading state).
 * @returns An async function that accepts a value of type `T` and returns a `Validation`.
 *
 * @example
 * ```ts
 * const onSubmit = requestToControllerValidation({
 *   task: async (data) => {
 *     const error = await api.signIn(data)
 *     return error ?? null
 *   },
 *   message: 'Sign in failed',
 *   onStart: () => loading.set(true),
 *   onEnd: () => loading.set(false),
 * })
 * ```
 */
export function requestToControllerValidation<T>({
  task,
  message,
  onStart,
  onEnd,
}: {
  task: undefined | ((value: T) => Promise<string | null>)
  message: string
  onStart?: () => void
  onEnd?: () => void
}) {
  return async (value: T) => {
    onStart?.()
    const result = await taskToValidation({
      task: task != null ? () => task(value) : async () => null,
      errorMessage: message,
      errorPath: ['root'],
      validation: result => {
        if (result != null) {
          return Validation.invalid({ message: result })
        }
        return Validation.valid
      },
    })
    onEnd?.()
    return result
  }
}
