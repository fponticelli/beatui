// Reset Password Form Component
// Simple form for password reset flow with email input

import {
  attr,
  coalesce,
  html,
  on,
  OnDispose,
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
import { AuthI18n } from '@/auth-i18n/translations'
import { useAuthEmailProp } from './auth-email-prop'
import { Control } from '../form'

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

  const { controller, onSubmit } = form

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
      OnDispose(controller.dispose, persistedEmail.dispose, loading.dispose),
      attr.class('bc-auth-form__form'),
      // Description
      html.p(
        attr.class('bc-auth-form__description'),
        coalesce(labels?.resetPasswordDescription, t.$.resetPasswordDescription)
      ),
      on.submit(onSubmit),
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
