import { SignInData, SignUpData, ResetPasswordData } from '../components/auth'
import {
  BetterAuthClient,
  BetterAuthBridgeOptions,
  BetterAuthResult,
  BetterAuthUser,
  AuthError,
  AuthFieldError,
} from './types'

function handleResult(
  result: BetterAuthResult<unknown>,
  opts: BetterAuthBridgeOptions
): AuthError | null {
  if (result.error) {
    opts.onError?.({
      message: result.error.message,
      status: result.error.status,
    })

    // Check for structured field errors
    const err = result.error as Record<string, unknown>
    if (err.fieldErrors && typeof err.fieldErrors === 'object') {
      const fieldErrors: AuthFieldError[] = []
      for (const [field, message] of Object.entries(
        err.fieldErrors as Record<string, string>
      )) {
        if (typeof message === 'string') {
          fieldErrors.push({ field, message })
        }
      }
      if (fieldErrors.length > 0) {
        return fieldErrors
      }
    }

    return result.error.message
  }
  return null
}

export function createSignInCallback(
  client: BetterAuthClient,
  opts: BetterAuthBridgeOptions,
  onSuccess: () => Promise<void>,
  onAuthSuccess?: (user: BetterAuthUser) => void
): (data: SignInData) => Promise<AuthError | null> {
  return async (data: SignInData) => {
    const result = await client.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: opts.callbackURL,
    })
    const error = handleResult(result, opts)
    if (error) return error
    await onSuccess()
    if (onAuthSuccess) {
      const sessionResult = await client.getSession()
      if (sessionResult.data?.user) {
        onAuthSuccess(sessionResult.data.user)
      }
    }
    return null
  }
}

export function createSignUpCallback(
  client: BetterAuthClient,
  opts: BetterAuthBridgeOptions,
  onSuccess: () => Promise<void>,
  onAuthSuccess?: (user: BetterAuthUser) => void
): (data: SignUpData) => Promise<AuthError | null> {
  return async (data: SignUpData) => {
    const result = await client.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
      callbackURL: opts.callbackURL,
    })
    const error = handleResult(result, opts)
    if (error) return error
    await onSuccess()
    if (onAuthSuccess) {
      const sessionResult = await client.getSession()
      if (sessionResult.data?.user) {
        onAuthSuccess(sessionResult.data.user)
      }
    }
    return null
  }
}

export function createResetPasswordCallback(
  client: BetterAuthClient,
  opts: BetterAuthBridgeOptions
): (data: ResetPasswordData) => Promise<AuthError | null> {
  return async (data: ResetPasswordData) => {
    const result = await client.requestPasswordReset({
      email: data.email,
      redirectTo: opts.callbackURL,
    })
    return handleResult(result, opts)
  }
}

export function createSocialLoginHandler(
  client: BetterAuthClient,
  opts: BetterAuthBridgeOptions
): (provider: string) => Promise<void> {
  return async (provider: string) => {
    const result = await client.signIn.social({
      provider,
      callbackURL: opts.callbackURL,
      errorCallbackURL: opts.errorCallbackURL,
    })
    handleResult(result, opts)
  }
}
