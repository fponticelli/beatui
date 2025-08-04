// Auth Container Component
// Main container that switches between signin/signup/reset modes

import {
  attr,
  computedOf,
  prop,
  TNode,
  When,
  Value,
  OnDispose,
} from '@tempots/dom'
import { html } from '@tempots/dom'
import {
  AuthContainerOptions,
  AuthMode,
  SignInData,
  SignUpData,
  ResetPasswordData,
} from './index'
import { SignInForm } from './signin-form'
import { SignUpForm } from './signup-form'
import { ResetPasswordForm } from './reset-password-form'
import { Modal, ModalContentOptions } from '../overlay'

export function AuthContainer({
  mode: initialMode,
  className,
  socialProviders,
  passwordRules,
  showRememberMe,
  showSocialDivider,
  allowSignUp,
  allowPasswordReset,
  showPasswordStrength,
  labels,
  onSignIn,
  onSignUp,
  onResetPassword,
  onModeChange,
  onSocialLogin,
  onSubmitSignIn,
  onSubmitSignUp,
  onSubmitResetPassword,
}: AuthContainerOptions): TNode {
  // Current mode state
  const currentMode =
    initialMode != null
      ? Value.deriveProp(initialMode)
      : prop<AuthMode>('signin')

  // Loading and error states for each form
  const signInLoading = prop(false)
  const signUpLoading = prop(false)
  const resetPasswordLoading = prop(false)

  const signInError = prop<string | null>(null)
  const signUpError = prop<string | null>(null)
  const resetPasswordError = prop<string | null>(null)

  // Handle mode changes
  const handleModeChange = (mode: AuthMode) => {
    currentMode.set(mode)
  }

  const disposeModeChange = currentMode.on(mode => {
    signInLoading.set(false)
    signUpLoading.set(false)
    resetPasswordLoading.set(false)
    onModeChange?.(mode)
  })

  // Handle sign in
  const handleSignIn = async (data: SignInData) => {
    signInLoading.set(true)
    signInError.set(null)

    try {
      if (onSignIn) {
        await onSignIn(data)
      }
    } catch (error) {
      signInError.set(error instanceof Error ? error.message : 'Sign in failed')
    } finally {
      signInLoading.set(false)
    }
  }

  // Handle sign up
  const handleSignUp = async (data: SignUpData) => {
    signUpLoading.set(true)
    signUpError.set(null)

    try {
      if (onSignUp) {
        await onSignUp(data)
      }
    } catch (error) {
      signUpError.set(error instanceof Error ? error.message : 'Sign up failed')
    } finally {
      signUpLoading.set(false)
    }
  }

  // Handle reset password
  const handleResetPassword = async (data: ResetPasswordData) => {
    resetPasswordLoading.set(true)
    resetPasswordError.set(null)

    try {
      if (onResetPassword) {
        await onResetPassword(data)
      }
    } catch (error) {
      resetPasswordError.set(
        error instanceof Error ? error.message : 'Reset password failed'
      )
    } finally {
      resetPasswordLoading.set(false)
    }
  }

  // Container classes
  const containerClasses = computedOf(
    currentMode,
    className
  )((mode, cls) => {
    const classes = [
      'bc-auth-container',
      `bc-auth-container--${mode}`,
      cls,
    ].filter(Boolean)
    return classes.join(' ')
  })

  return html.div(
    OnDispose(disposeModeChange),
    attr.class(containerClasses),

    // Sign In Form
    When(
      currentMode.map(mode => mode === 'signin'),
      () =>
        SignInForm({
          allowPasswordReset,
          allowSignUp,
          onSignIn: handleSignIn,
          onSubmit: onSubmitSignIn,
          onSocialLogin,
          socialProviders,
          showRememberMe,
          passwordRules,
          showSocialDivider,
          labels: {
            signInTitle: labels?.signInTitle,
            emailLabel: labels?.emailLabel,
            passwordLabel: labels?.passwordLabel,
            rememberMeLabel: labels?.rememberMeLabel,
            loading: labels?.loading,
            signInButton: labels?.signInButton,
            forgotPasswordLink: labels?.forgotPasswordLink,
            noAccountLink: labels?.noAccountLink,
          },
          onModeChange: handleModeChange,
          loading: signInLoading,
          error: signInError,
        })
    ),

    // Sign Up Form
    When(
      currentMode.map(mode => mode === 'signup'),
      () =>
        SignUpForm({
          labels: {
            signUpTitle: labels?.signUpTitle,
            nameLabel: labels?.nameLabel,
            emailLabel: labels?.emailLabel,
            passwordLabel: labels?.passwordLabel,
            confirmPasswordLabel: labels?.confirmPasswordLabel,
            acceptTermsLabel: labels?.acceptTermsLabel,
            loading: labels?.loading,
            signUpButton: labels?.signUpButton,
            hasAccountLink: labels?.hasAccountLink,
          },
          onSignUp: handleSignUp,
          onModeChange: handleModeChange,
          onSocialLogin,
          onSubmit: onSubmitSignUp,
          passwordRules,
          socialProviders,
          showPasswordStrength,
          showSocialDivider,
          loading: signUpLoading,
          error: signUpError,
        })
    ),

    // Reset Password Form
    When(
      currentMode.map(mode => mode === 'reset-password'),
      () =>
        ResetPasswordForm({
          labels: {
            backToSignInLink: labels?.backToSignInLink,
            emailLabel: labels?.emailLabel,
            resetPasswordTitle: labels?.resetPasswordTitle,
            loading: labels?.loading,
            resetPasswordButton: labels?.resetPasswordButton,
            resetPasswordDescription: labels?.resetPasswordDescription,
          },
          onSubmit: onSubmitResetPassword,
          onResetPassword: handleResetPassword,
          onModeChange: handleModeChange,
          loading: resetPasswordLoading,
          error: resetPasswordError,
        })
    )
  )
}

// Convenience function to create auth container with modal
export function AuthModal({
  isOpen,
  onClose,
  ...authOptions
}: AuthContainerOptions & {
  isOpen: Value<boolean>
  onClose?: () => void
}): TNode {
  return Modal(
    {
      size: 'sm',
      dismissable: true,
      showCloseButton: true,
      onClose,
    },
    (open: (content: ModalContentOptions) => void, _close: () => void) => {
      // Open modal when isOpen becomes true
      if (Value.get(isOpen)) {
        open({
          body: AuthContainer(authOptions),
        })
      }

      return html.div() // Empty placeholder
    }
  )
}

// Convenience function to create auth container with specific mode
export function SignInContainer(
  options: Omit<AuthContainerOptions, 'initialMode'>
) {
  return AuthContainer({ ...options, mode: 'signin' })
}

export function SignUpContainer(
  options: Omit<AuthContainerOptions, 'initialMode'>
) {
  return AuthContainer({ ...options, mode: 'signup' })
}

export function ResetPasswordContainer(
  options: Omit<AuthContainerOptions, 'initialMode'>
) {
  return AuthContainer({ ...options, mode: 'reset-password' })
}
