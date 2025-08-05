// Sign Up Form Component
// Registration form with validation and password strength indicator

import { attr, html, on, OnDispose, prop, TNode, Use, When } from '@tempots/dom'
import { Button } from '../button'
import { EmailControl, PasswordControl, TextControl } from '../form/control'
import { CheckboxInput } from '../form/input'
import { Stack } from '../layout/stack'
import { useForm, UseFormResult } from '../form/use-form'
import {
  SignUpFormOptions,
  defaultPasswordRules,
  functionOrReactiveMessage,
  requestToControllerValidation,
  SignUpFormData,
} from './index'
import { createSignUpSchema } from './schemas'
import { PasswordStrengthIndicator } from './password-strength-indicator'
import { AuthI18n } from '@/auth-i18n/translations'

export function SignUpForm({
  passwordRules,
  labels,
  showPasswordStrength,
  onSignUp,
  showNameField,
  showConfirmPassword,
  showAcceptTermsAndConditions,
  termsAndConditions,
}: SignUpFormOptions): TNode {
  const loading = prop(false)
  const passwordRules_ = passwordRules || defaultPasswordRules

  // Initialize form
  const schema = createSignUpSchema(passwordRules_, {
    showNameField: showNameField !== false,
    showConfirmPassword: showConfirmPassword !== false,
    showAcceptTermsAndConditions: showAcceptTermsAndConditions !== false,
  })

  const form: UseFormResult<SignUpFormData> = useForm({
    schema,
    submit: requestToControllerValidation({
      task:
        onSignUp != null
          ? (data: SignUpFormData) =>
              onSignUp({
                email: data.email,
                password: data.password,
                name: data.name,
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
    defaultValue: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const { controller, onSubmit } = form

  loading.on(controller.setDisabled)

  const nameController = controller.field('name')
  const emailController = controller.field('email')
  const passwordController = controller.field('password')
  const confirmPasswordController = controller.field('confirmPassword')
  const acceptTermsController = controller.field('acceptTerms')

  return Use(AuthI18n, t =>
    // Registration form
    html.form(
      OnDispose(controller.dispose, loading.dispose),
      attr.class('bc-auth-form__form'),
      on.submit(onSubmit),

      Stack(
        attr.class('bc-auth-form__fields'),

        // Name field (optional)
        When(showNameField !== false, () =>
          TextControl({
            controller: nameController.transform(
              v => v ?? '',
              v => (v === '' ? undefined : v)
            ),
            label: functionOrReactiveMessage(labels?.nameLabel, t.nameLabel),
          })
        ),

        // Email field
        EmailControl({
          controller: emailController,
          label: functionOrReactiveMessage(labels?.emailLabel, t.emailLabel),
        }),
        // Password field
        PasswordControl({
          controller: passwordController,
          label: functionOrReactiveMessage(
            labels?.passwordLabel,
            t.passwordLabel
          ),
        }),

        // Password strength indicator
        When(showPasswordStrength !== false, () =>
          PasswordStrengthIndicator({
            password: passwordController.value,
            rules: passwordRules_,
            showLabel: true,
          })
        ),

        // Confirm password field
        When(showConfirmPassword !== false, () =>
          PasswordControl({
            controller: confirmPasswordController,
            label: functionOrReactiveMessage(
              labels?.confirmPasswordLabel,
              t.confirmPasswordLabel
            ),
          })
        ),

        // Terms acceptance checkbox
        When(showAcceptTermsAndConditions !== false, () =>
          html.div(
            attr.class('bc-auth-form__terms'),
            html.label(
              attr.class('bc-auth-form__checkbox-label'),
              CheckboxInput({
                value: acceptTermsController.value.map(v => v ?? false),
                onChange: checked => acceptTermsController.change(checked),
              }),
              html.span(
                termsAndConditions ||
                  functionOrReactiveMessage(
                    labels?.acceptTermsLabel,
                    t.acceptTermsLabel
                  )
              )
            ),
            When(acceptTermsController.hasError, () =>
              html.div(
                attr.class('bc-auth-form__field-error'),
                acceptTermsController.error.map(err => err || '')
              )
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
        functionOrReactiveMessage(labels?.signUpButton, t.signUpButton)
      )
    )
  )
}
