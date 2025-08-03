// Reset Password Form Component
// Simple form for password reset flow with email input

import { attr, computedOf, html, on, TNode, Use, When } from '@tempots/dom'
import { Button } from '../button'
import { EmailControl } from '../form/control'
import { Stack } from '../layout/stack'
import { useForm } from '../form/use-form'
import {
  ResetPasswordFormOptions,
  formatAuthError,
  functionOrReactiveMessage,
} from './index'
import { resetPasswordSchema } from './schemas'
import { AuthI18n } from '@/auth-i18n/translations'

export function ResetPasswordForm({
  onSubmit,
  onModeChange,
  onResetPassword,
  loading,
  error,
  labels = {},
}: ResetPasswordFormOptions): TNode {
  const isLoading = computedOf(loading)(l => l ?? false)
  const errorMessage = computedOf(error)(e => (e ? formatAuthError(e) : null))

  // Initialize form
  const controller = useForm({
    schema: resetPasswordSchema,
    defaultValue: {
      email: '',
    },
  })

  const emailController = controller.field('email')

  // Handle loading state - disable/enable form based on loading
  // Set initial state
  if (isLoading.get()) {
    controller.disable()
    emailController.disable()
  }

  // Listen for loading state changes and update controller accordingly
  const unsubscribe = isLoading.on(loading => {
    if (loading) {
      controller.disable()
      emailController.disable()
    } else {
      controller.enable()
      emailController.enable()
    }
  })

  // Clean up the subscription when the component is disposed
  controller.onDispose(() => {
    unsubscribe()
  })

  // Handle form submission
  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    // Trigger validation if it hasn't been triggered yet
    controller.change(controller.value.value)

    // Wait for validation to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    // Check if form has validation errors or is loading
    if (controller.hasError.value || isLoading.value) {
      return
    }

    const formData = controller.value.value

    // Additional validation check - ensure required fields are not empty
    if (!formData.email) {
      return
    }

    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else if (onResetPassword) {
        await onResetPassword(formData)
      }
    } catch (err) {
      console.error('Reset password error:', err)
    }
  }

  // Handle mode changes
  const handleModeChange = (mode: 'signin' | 'signup') => {
    onModeChange?.(mode)
  }

  return html.div(
    attr.class('bc-auth-form bc-reset-password-form'),

    // Form title
    Use(AuthI18n, t =>
      html.h2(
        attr.class('bc-auth-form__title'),
        functionOrReactiveMessage(
          labels?.resetPasswordTitle,
          t.resetPasswordTitle
        )
      )
    ),

    // Description
    Use(AuthI18n, t =>
      html.p(
        attr.class('bc-auth-form__description'),
        functionOrReactiveMessage(
          labels?.resetPasswordDescription,
          t.resetPasswordDescription
        )
      )
    ),

    // Error message
    When(
      errorMessage.map(msg => !!msg),
      () =>
        html.div(
          attr.class('bc-auth-form__error'),
          errorMessage.map(msg => msg || '')
        )
    ),

    // Reset password form
    html.form(
      attr.class('bc-auth-form__form'),
      on.submit(handleSubmit),

      Stack(
        attr.class('bc-auth-form__fields'),

        // Email field
        Use(AuthI18n, t =>
          EmailControl({
            controller: emailController,
            label: functionOrReactiveMessage(labels?.emailLabel, t.emailLabel),
          })
        )
      ),

      // Submit button
      Use(AuthI18n, t =>
        Button(
          {
            type: 'submit',
            variant: 'filled',
            color: 'primary',
            disabled: computedOf(
              controller.hasError,
              isLoading
            )((hasError, loading) => hasError || loading),
          },
          attr.class('bc-auth-form__submit'),
          When(
            isLoading,
            () => functionOrReactiveMessage(labels?.loading, t.loading),
            () =>
              functionOrReactiveMessage(
                labels?.resetPasswordButton,
                t.resetPasswordButton
              )
          )
        )
      )
    ),

    // Footer links
    Use(AuthI18n, t =>
      html.div(
        attr.class('bc-auth-form__footer'),

        // Back to sign in link
        html.button(
          attr.type('button'),
          attr.class('bc-auth-form__link'),
          on.click(() => handleModeChange('signin')),
          functionOrReactiveMessage(
            labels?.backToSignInLink,
            t.backToSignInLink
          )
        )
      )
    )
  )
}
