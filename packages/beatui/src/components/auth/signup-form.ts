/**
 * Sign Up Form Component
 *
 * Renders the registration form with name, email, password, confirm password,
 * and terms acceptance fields. Includes password strength indicator,
 * schema-based validation, and loading state management.
 *
 * @module auth/signup-form
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
  When,
} from '@tempots/dom'
import { Button } from '../button'
import {
  EmailInput,
  PasswordInput,
  TextInput,
  CheckboxInput,
} from '../form/input'
import { Stack } from '../layout/stack'
import { useForm, UseFormResult } from '../form/use-form'
import {
  SignUpFormOptions,
  defaultPasswordRules,
  requestToControllerValidation,
  SignUpFormData,
} from './index'
import { createSignUpSchema } from './schemas'
import { PasswordStrengthIndicator } from './password-strength-indicator'
import { AuthI18n } from '../../auth-i18n/translations'
import { Control } from '../form'
import { Notice } from '../misc'

/**
 * Renders the sign-up (registration) form.
 *
 * Features include:
 * - Configurable fields: name, email, password, confirm password, terms checkbox
 * - Schema-based validation with configurable password rules
 * - Optional password strength indicator
 * - Loading state and form disabling during submission
 * - Error display via a notice component
 * - i18n support for all labels and button text
 *
 * @param options - Configuration options for the sign-up form.
 * @returns A `Renderable` form element.
 *
 * @example
 * ```ts
 * SignUpForm({
 *   onSignUp: async (data) => {
 *     const error = await api.signUp(data)
 *     return error ?? null
 *   },
 *   showPasswordStrength: true,
 *   showConfirmPassword: true,
 *   showAcceptTermsAndConditions: true,
 * })
 * ```
 */
export function SignUpForm({
  passwordRules,
  labels,
  initialEmail,
  initialName,
  showPasswordStrength,
  onSignUp,
  showNameField,
  showConfirmPassword,
  showAcceptTermsAndConditions,
  termsAndConditions,
}: SignUpFormOptions): Renderable {
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
    onSubmit: requestToControllerValidation({
      task:
        onSignUp != null
          ? (data: SignUpFormData) =>
              onSignUp({
                email: data.email,
                password: data.password,
                name: data.name,
                acceptTerms: data.acceptTerms,
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
      name: initialName ?? '',
      email: initialEmail ?? '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const { controller, submit } = form

  loading.on(controller.setDisabled)

  const nameController = controller.field('name')
  const emailController = controller.field('email')
  const passwordController = controller.field('password')
  const confirmPasswordController = controller.field('confirmPassword')
  const acceptTermsController = controller.field('acceptTerms')

  return Use(AuthI18n, t =>
    // Registration form
    html.form(
      attr.class('bc-auth-form__form'),
      on.submit(submit),

      Stack(
        attr.class('bc-auth-form__fields'),

        Ensure(controller.error, error =>
          Notice(
            { variant: 'danger', tone: 'prominent', role: 'alert' },
            html.div(error)
          )
        ),

        // Name field (optional)
        When(showNameField !== false, () =>
          Control(TextInput, {
            controller: nameController.transform(
              v => v ?? '',
              v => (v === '' ? undefined : v)
            ),
            label: coalesce(labels?.nameLabel, t.$.nameLabel),
          })
        ),

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

        // Password strength indicator
        When(showPasswordStrength ?? false, () =>
          PasswordStrengthIndicator({
            password: passwordController.signal,
            rules: passwordRules_,
            showLabel: true,
          })
        ),

        // Confirm password field
        When(showConfirmPassword ?? false, () =>
          Control(PasswordInput, {
            controller: confirmPasswordController,
            label: coalesce(
              labels?.confirmPasswordLabel,
              t.$.confirmPasswordLabel
            ),
          })
        ),

        // Terms acceptance checkbox
        When(showAcceptTermsAndConditions ?? false, () =>
          html.div(
            attr.class('bc-auth-form__terms'),
            html.label(
              attr.class('bc-auth-form__checkbox-label'),
              CheckboxInput({
                value: acceptTermsController.signal.map(v => v ?? false),
                onChange: checked => acceptTermsController.change(checked),
              }),
              html.span(
                termsAndConditions ||
                  coalesce(labels?.acceptTermsLabel, t.$.acceptTermsLabel)
              )
            ),
            When(acceptTermsController.errorVisible, () =>
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
        coalesce(labels?.signUpButton, t.$.signUpButton)
      )
    )
  )
}
