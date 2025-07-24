// Authentication Utility Functions
// Helper functions for authentication components

import { AuthProviderName } from './types'

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

export const REMEMBER_EMAIL_KEY = 'bui_auth_remember_email'

// Local storage helpers for remember me functionality
export function saveRememberMe(email: string): void {
  if (isBrowser()) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email)
  }
}

export function getRememberedEmail(): string | null {
  if (isBrowser()) {
    return localStorage.getItem(REMEMBER_EMAIL_KEY)
  }
  return null
}

export function clearRememberedEmail(): void {
  if (isBrowser()) {
    localStorage.removeItem(REMEMBER_EMAIL_KEY)
  }
}

export const defaultAuthLabels = {
  signInTitle: 'Sign In',
  signInButton: 'Sign In',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  rememberMeLabel: 'Remember me',
  forgotPasswordLink: 'Forgot password?',
  noAccountLink: "Don't have an account? Sign up",

  signUpTitle: 'Sign Up',
  signUpButton: 'Sign Up',
  nameLabel: 'Name',
  confirmPasswordLabel: 'Confirm Password',
  acceptTermsLabel: 'I accept the terms and conditions',
  hasAccountLink: 'Already have an account? Sign in',

  resetPasswordTitle: 'Reset Password',
  resetPasswordButton: 'Reset Password',
  resetPasswordDescription: 'Enter your email to reset your password.',
  backToSignInLink: 'Back to sign in',

  continueWithProvider: 'Continue with {provider}',
  orDivider: 'or',
  loading: 'Loading...',
  error: 'An error occurred',
  required: 'Required',

  passwordStrengthWeak: 'Weak',
  passwordStrengthFair: 'Fair',
  passwordStrengthGood: 'Good',
  passwordStrengthStrong: 'Strong',
}
