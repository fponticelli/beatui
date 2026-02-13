import { AuthContainerOptions } from '../components/auth'
import {
  createSignInCallback,
  createSignUpCallback,
  createResetPasswordCallback,
  createSocialLoginHandler,
} from './callbacks'
import { createSessionManager } from './session'
import { mapSocialProviders } from './social-mapping'
import {
  BetterAuthBridge,
  BetterAuthBridgeOptions,
  BetterAuthClient,
} from './types'

export function createBetterAuthBridge(
  client: BetterAuthClient,
  options: BetterAuthBridgeOptions = {}
): BetterAuthBridge {
  const sessionManager = createSessionManager(client, {
    refreshInterval: options.refreshInterval,
    onSessionChange: options.onSessionChange,
  })

  const refreshSession = () => sessionManager.refresh()

  const onSignIn = createSignInCallback(client, options, refreshSession)
  const onSignUp = createSignUpCallback(client, options, refreshSession)
  const onResetPassword = createResetPasswordCallback(client, options)
  const onSocialLogin = createSocialLoginHandler(client, options)

  const socialProviders = options.socialProviders
    ? mapSocialProviders(options.socialProviders)
    : []

  const signInOptions = {
    onSignIn,
    passwordRules: options.passwordRules,
    showRememberMe: options.showRememberMe,
    labels: options.labels
      ? {
          emailLabel: options.labels.emailLabel,
          passwordLabel: options.labels.passwordLabel,
          rememberMeLabel: options.labels.rememberMeLabel,
          signInButton: options.labels.signInButton,
          forgotPasswordLink: options.labels.forgotPasswordLink,
          noAccountLink: options.labels.noAccountLink,
        }
      : undefined,
  }

  const signUpOptions = {
    onSignUp,
    passwordRules: options.passwordRules,
    showPasswordStrength: options.showPasswordStrength,
    showNameField: options.showNameField,
    showConfirmPassword: options.showConfirmPassword,
    labels: options.labels
      ? {
          nameLabel: options.labels.nameLabel,
          emailLabel: options.labels.emailLabel,
          passwordLabel: options.labels.passwordLabel,
          confirmPasswordLabel: options.labels.confirmPasswordLabel,
          acceptTermsLabel: options.labels.acceptTermsLabel,
          signUpButton: options.labels.signUpButton,
          hasAccountLink: options.labels.hasAccountLink,
        }
      : undefined,
  }

  const resetOptions = {
    onResetPassword,
    labels: options.labels
      ? {
          resetPasswordButton: options.labels.resetPasswordButton,
          resetPasswordDescription: options.labels.resetPasswordDescription,
          emailLabel: options.labels.emailLabel,
          backToSignInLink: options.labels.backToSignInLink,
        }
      : undefined,
  }

  const containerOptions: AuthContainerOptions = {
    onSignIn,
    onSignUp,
    onResetPassword,
    onSocialLogin,
    socialProviders: socialProviders.length > 0 ? socialProviders : undefined,
    showSocialDivider: socialProviders.length > 0 ? true : false,
    passwordRules: options.passwordRules,
    showRememberMe: options.showRememberMe,
    showPasswordStrength: options.showPasswordStrength,
    showNameField: options.showNameField,
    showConfirmPassword: options.showConfirmPassword,
    labels: options.labels,
  }

  async function signOut() {
    await client.signOut()
    await refreshSession()
  }

  function dispose() {
    sessionManager.dispose()
  }

  return {
    session: sessionManager.session,
    isPending: sessionManager.isPending,
    user: sessionManager.user,
    isAuthenticated: sessionManager.isAuthenticated,
    containerOptions,
    signInOptions,
    signUpOptions,
    resetOptions,
    socialProviders,
    signOut,
    refreshSession,
    dispose,
  }
}
