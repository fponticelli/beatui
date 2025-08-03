// Auth Container Component
// Main container that switches between signin/signup/reset modes

import { attr, computedOf, prop, TNode, When } from '@tempots/dom'
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
import { Modal } from '../overlay'

export function AuthContainer({
  initialMode = 'signin',
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
}: AuthContainerOptions): TNode {
  // Current mode state
  const currentMode = prop<AuthMode>(initialMode)

  // Loading and error states for each form
  const signInLoading = prop(false)
  const signUpLoading = prop(false)
  const resetPasswordLoading = prop(false)

  const signInError = prop<string | null>(null)
  const signUpError = prop<string | null>(null)
  const resetPasswordError = prop<string | null>(null)

  // Shared configuration for all forms
  const config = {
    socialProviders,
    passwordRules,
    showRememberMe,
    showSocialDivider,
    allowSignUp,
    allowPasswordReset,
    showPasswordStrength,
    labels,
    onSocialLogin,
  }

  // Handle mode changes
  const handleModeChange = (mode: AuthMode) => {
    // Clear errors when switching modes
    signInError.set(null)
    signUpError.set(null)
    resetPasswordError.set(null)

    currentMode.set(mode)
    onModeChange?.(mode)
  }

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
    attr.class(containerClasses),

    // Sign In Form
    When(
      currentMode.map(mode => mode === 'signin'),
      () =>
        SignInForm({
          config: {
            ...config,
            onSignIn: handleSignIn,
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
          config: {
            ...config,
            onSignUp: handleSignUp,
          },
          onModeChange: handleModeChange,
          loading: signUpLoading,
          error: signUpError,
        })
    ),

    // Reset Password Form
    When(
      currentMode.map(mode => mode === 'reset-password'),
      () =>
        ResetPasswordForm({
          config: {
            ...config,
            onResetPassword: handleResetPassword,
          },
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
  isOpen: any
  onClose?: () => void
}): TNode {
  return Modal(
    {
      size: 'sm',
      dismissable: true,
      showCloseButton: true,
      onClose,
    },
    (open: any, close: any) => {
      // Open modal when isOpen becomes true
      if (isOpen?.value) {
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
  return AuthContainer({ ...options, initialMode: 'signin' })
}

export function SignUpContainer(
  options: Omit<AuthContainerOptions, 'initialMode'>
) {
  return AuthContainer({ ...options, initialMode: 'signup' })
}

export function ResetPasswordContainer(
  options: Omit<AuthContainerOptions, 'initialMode'>
) {
  return AuthContainer({ ...options, initialMode: 'reset-password' })
}
