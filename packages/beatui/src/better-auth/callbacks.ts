import { SignInData, SignUpData, ResetPasswordData } from '../components/auth'
import { BetterAuthClient, BetterAuthBridgeOptions, BetterAuthResult } from './types'

function handleResult(
  result: BetterAuthResult<unknown>,
  opts: BetterAuthBridgeOptions
): string | null {
  if (result.error) {
    opts.onError?.({
      message: result.error.message,
      status: result.error.status,
    })
    return result.error.message
  }
  return null
}

export function createSignInCallback(
  client: BetterAuthClient,
  opts: BetterAuthBridgeOptions,
  onSuccess: () => Promise<void>
): (data: SignInData) => Promise<string | null> {
  return async (data: SignInData) => {
    const result = await client.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: opts.callbackURL,
    })
    const error = handleResult(result, opts)
    if (error) return error
    await onSuccess()
    return null
  }
}

export function createSignUpCallback(
  client: BetterAuthClient,
  opts: BetterAuthBridgeOptions,
  onSuccess: () => Promise<void>
): (data: SignUpData) => Promise<string | null> {
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
    return null
  }
}

export function createResetPasswordCallback(
  client: BetterAuthClient,
  opts: BetterAuthBridgeOptions
): (data: ResetPasswordData) => Promise<string | null> {
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
