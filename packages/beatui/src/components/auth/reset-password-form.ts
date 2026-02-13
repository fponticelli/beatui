/**
 * Reset Password Form Component
 *
 * Renders a simple form for initiating the password reset flow. Contains
 * a description, email input, and submit button with validation and
 * loading state management.
 *
 * @module auth/reset-password-form
 */

import {
  attr,
  coalesce,
  Ensure,
  html,
  on,
  prop,
  Renderable,
  Use,
} from '@tempots/dom'
import { Button } from '../button'
import { EmailInput } from '../form/input'
import { Stack } from '../layout/stack'
import { useForm, UseFormResult } from '../form/use-form'
import {
  ResetPasswordData,
  ResetPasswordFormOptions,
  requestToControllerValidation,
} from './index'
import { resetPasswordSchema } from './schemas'
import { AuthI18n } from '../../auth-i18n/translations'
import { useAuthEmailProp } from './auth-email-prop'
import { Control } from '../form'
import { Notice } from '../misc'

/**
 * Renders the reset password form with an email input field.
 *
 * Features include:
 * - Schema-based email validation
 * - Pre-population from persisted email (if "remember me" was used)
 * - Loading state and form disabling during submission
 * - Error display via a notice component
 * - Descriptive text explaining the reset flow
 * - i18n support for all labels and button text
 *
 * @param options - Configuration options for the reset password form.
 * @returns A `Renderable` form element.
 *
 * @example
 * ```ts
 * ResetPasswordForm({
 *   onResetPassword: async (data) => {
 *     const error = await api.requestPasswordReset(data.email)
 *     return error ?? null
 *   },
 * })
 * ```
 */
export function ResetPasswordForm({
  onResetPassword,
  labels = {},
}: ResetPasswordFormOptions): Renderable {
  const persistedEmail = useAuthEmailProp()
  const loading = prop(false)

  // Initialize form
  const form: UseFormResult<ResetPasswordData> = useForm({
    schema: resetPasswordSchema,
    onSubmit: requestToControllerValidation({
      task: onResetPassword,
      message: 'Reset password failed',
      onStart: () => {
        loading.set(true)
        form.controller.disable()
      },
      onEnd: () => {
        loading.set(false)
        form.controller.enable()
      },
    }),
    initialValue: {
      email: '',
    },
  })

  const { controller, submit } = form

  loading.on(controller.setDisabled)

  const emailController = controller.field('email')

  persistedEmail.on(email => {
    if (email != null) {
      emailController.change(email)
    }
  })

  return Use(AuthI18n, t =>
    // Reset password form
    html.form(
      attr.class('bc-auth-form__form'),

      Ensure(controller.error, error =>
        Notice(
          { variant: 'danger', tone: 'prominent', role: 'alert' },
          html.div(error)
        )
      ),

      // Description
      html.p(
        attr.class('bc-auth-form__description'),
        coalesce(labels?.resetPasswordDescription, t.$.resetPasswordDescription)
      ),
      on.submit(submit),
      Stack(
        attr.class('bc-auth-form__fields'),
        // Email field
        Control(EmailInput, {
          controller: emailController,
          label: coalesce(labels?.emailLabel, t.$.emailLabel),
        })
      ),
      // Submit button
      Button(
        {
          loading,
          type: 'submit',
          variant: 'filled',
          color: 'primary',
          disabled: controller.disabledOrHasErrors,
        },
        attr.class('bc-auth-form__submit'),
        coalesce(labels?.resetPasswordButton, t.$.resetPasswordButton)
      )
    )
  )
}
