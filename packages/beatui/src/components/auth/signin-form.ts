// Sign In Form Component
// Main sign-in form with email/password fields and social login options

import {
  attr,
  coalesce,
  html,
  on,
  OnDispose,
  prop,
  Renderable,
  Use,
  When,
} from '@tempots/dom'
import { Button } from '../button'
import { EmailInput, PasswordInput, CheckboxInput } from '../form/input'
import { Stack } from '../layout/stack'
import { useForm } from '../form/use-form'
import {
  SignInFormData,
  SignInFormOptions,
  requestToControllerValidation,
} from './index'
import { createSignInSchema } from './schemas'
import { AuthI18n } from '@/auth-i18n/translations'
import { useAuthEmailProp } from './auth-email-prop'
import { Control } from '../form'

export function SignInForm({
  onSignIn,
  passwordRules,
  labels,
  showRememberMe,
}: SignInFormOptions): Renderable {
  const loading = prop(false)

  // Initialize form with remembered email if available
  const persistedEmail = useAuthEmailProp()
  const schema = createSignInSchema(passwordRules)

  const form = useForm({
    schema,
    onSubmit: requestToControllerValidation({
      task:
        onSignIn != null
          ? (data: SignInFormData) =>
              onSignIn({
                email: data.email,
                password: data.password,
              })
          : undefined,
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
      password: '',
    },
  })

  const { controller, submit } = form

  loading.on(controller.setDisabled)

  const emailController = controller.field('email')
  const passwordController = controller.field('password')

  persistedEmail.on(email => {
    if (email != null) {
      emailController.change(email)
    }
  })
  emailController.value.on(email => {
    if (persistedEmail.value != null) {
      persistedEmail.value = email
    }
  })

  return Use(AuthI18n, t =>
    // Email/Password form
    html.form(
      OnDispose(controller.dispose, persistedEmail.dispose, loading.dispose),
      attr.class('bc-auth-form__form'),
      on.submit(submit),

      Stack(
        attr.class('bc-auth-form__fields'),

        // Email field
        Control(EmailInput, {
          controller: emailController,
          label: coalesce(labels?.emailLabel, t.$.emailLabel),
        }),
        // Password field
        Control(PasswordInput, {
          controller: passwordController,
          label: coalesce(labels?.passwordLabel, t.$.passwordLabel),
        }),

        // Remember me checkbox
        When(showRememberMe ?? true, () =>
          html.div(
            attr.class('bc-auth-form__remember-me'),
            html.label(
              attr.class('bc-auth-form__checkbox-label'),
              CheckboxInput({
                value: persistedEmail.map(v => v != null),
                after: html.span(
                  coalesce(labels?.rememberMeLabel, t.$.rememberMeLabel)
                ),
                onChange: checked => {
                  if (checked) {
                    persistedEmail.value = emailController.value.value ?? ''
                  } else {
                    persistedEmail.value = null
                  }
                },
              })
            )
          )
        )
      ),

      // Submit button
      Button(
        {
          type: 'submit',
          variant: 'filled',
          color: 'primary',
          loading,
          disabled: controller.disabledOrHasErrors,
        },
        attr.class('bc-auth-form__submit'),
        coalesce(labels?.signInButton, t.$.signInButton)
      )
    )
  )
}
