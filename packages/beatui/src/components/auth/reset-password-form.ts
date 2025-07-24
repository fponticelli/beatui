// Reset Password Form Component
// Simple form for password reset flow with email input

import { attr, computedOf, html, on, TNode, When } from '@tempots/dom'
import { Button } from '../button'
import { EmailControl } from '../form/control'
import { Stack } from '../layout/stack'
import { useForm } from '../form/use-form'
import {
  ResetPasswordFormOptions,
  defaultAuthLabels,
  formatAuthError,
} from './index'
import { resetPasswordSchema } from './schemas'

export function ResetPasswordForm({
  config = {},
  onSubmit,
  onModeChange,
  loading,
  error,
}: ResetPasswordFormOptions): TNode {
  const labels = { ...defaultAuthLabels, ...config.labels }
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

  // Handle form submission
  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    if (controller.hasError.value || isLoading.value) {
      return
    }

    const formData = controller.value.value

    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else if (config.onResetPassword) {
        await config.onResetPassword(formData)
      }
    } catch (err) {
      console.error('Reset password error:', err)
    }
  }

  // Handle mode changes
  const handleModeChange = (mode: 'signin' | 'signup') => {
    if (onModeChange) {
      onModeChange(mode)
    } else if (config.onModeChange) {
      config.onModeChange(mode)
    }
  }

  return html.div(
    attr.class('bc-auth-form bc-reset-password-form'),

    // Form title
    html.h2(attr.class('bc-auth-form__title'), labels.resetPasswordTitle),

    // Description
    html.p(
      attr.class('bc-auth-form__description'),
      labels.resetPasswordDescription
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
        EmailControl({
          controller: emailController,
          label: labels.emailLabel,
        })
      ),

      // Submit button
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
          () => labels.loading,
          () => labels.resetPasswordButton
        )
      )
    ),

    // Footer links
    html.div(
      attr.class('bc-auth-form__footer'),

      // Back to sign in link
      html.button(
        attr.type('button'),
        attr.class('bc-auth-form__link'),
        on.click(() => handleModeChange('signin')),
        labels.backToSignInLink
      )
    )
  )
}
