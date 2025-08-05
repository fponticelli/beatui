// Authentication Utility Functions
// Helper functions for authentication components

import { computedOf, GetValueTypes, prop, Signal, Value } from '@tempots/dom'
import { AuthProviderName, PasswordRules } from './types'
import { taskToValidation } from '../form'
import { Validation } from '@tempots/std'

// Provider information and utilities
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

// Format provider name for display
export function formatProviderName(provider: AuthProviderName): string {
  return providerInfo[provider]?.name || provider
}

// Get provider icon
export function getProviderIcon(provider: AuthProviderName): string {
  return providerInfo[provider]?.icon || 'mdi:account'
}

// Get provider color
export function getProviderColor(provider: AuthProviderName): string {
  return providerInfo[provider]?.color || '#666'
}

// Format social login text with provider name
export function formatSocialLoginText(
  provider: AuthProviderName,
  template: string = 'Continue with {provider}'
): string {
  return template.replace('{provider}', formatProviderName(provider))
}

// Default password rules for validation
export const defaultPasswordRules: PasswordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: false,
}

// Validate email format (simple client-side check)
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate secure random string for state parameters
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

// Create social login URL (basic implementation - should be customized per provider)
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

// Handle social login popup
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

// Format error messages for display
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

// Check if running in browser environment
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export function functionOrReactiveMessage<T extends Value<unknown>[]>(
  fn: undefined | ((...args: GetValueTypes<T>) => string),
  reactiveFn: (...args: T) => Signal<string>,
  ...args: T
): Signal<string> {
  if (fn == null) {
    return reactiveFn(...args)
  }
  // Handle case where no reactive arguments are provided
  if (args.length === 0) {
    return prop((fn as () => string)())
  }
  return computedOf(...args)(fn as (...args: GetValueTypes<T>) => string)
}

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
