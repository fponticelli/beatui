// Sign Up Form Component
// Registration form with validation and password strength indicator

import { attr, computedOf, html, on, TNode, Use, When } from '@tempots/dom'
import { Button } from '../button'
import { EmailControl, PasswordControl, TextControl } from '../form/control'
import { CheckboxInput } from '../form/input'
import { Stack } from '../layout/stack'
import { useForm } from '../form/use-form'
import {
  SignUpFormOptions,
  formatAuthError,
  defaultPasswordRules,
  AuthProviderName,
  functionOrReactiveMessage,
} from './index'
import { createSignUpSchema } from './schemas'
import { SocialLoginButtons } from './social-login-button'
import { AuthDivider } from './auth-divider'
import { PasswordStrengthIndicator } from './password-strength-indicator'
import { AuthI18n } from '@/auth-i18n/translations'

export function SignUpForm({
  onSubmit,
  onModeChange,
  loading,
  error,
  passwordRules,
  labels,
  socialProviders,
  showSocialDivider,
  showPasswordStrength,
  onSignUp,
  onSocialLogin,
}: SignUpFormOptions): TNode {
  const isLoading = computedOf(loading)(l => l ?? false)
  const errorMessage = computedOf(error)(e => (e ? formatAuthError(e) : null))
  const passwordRules_ = passwordRules || defaultPasswordRules

  // Initialize form
  const schema = createSignUpSchema(passwordRules_)

  const controller = useForm({
    schema,
    defaultValue: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const nameController = controller.field('name')
  const emailController = controller.field('email')
  const passwordController = controller.field('password')
  const confirmPasswordController = controller.field('confirmPassword')
  const acceptTermsController = controller.field('acceptTerms')

  // Handle loading state - disable/enable form based on loading
  // Set initial state
  if (isLoading.get()) {
    controller.disable()
    nameController.disable()
    emailController.disable()
    passwordController.disable()
    confirmPasswordController.disable()
  }

  // Listen for loading state changes and update controller accordingly
  const unsubscribe = isLoading.on(loading => {
    if (loading) {
      controller.disable()
      nameController.disable()
      emailController.disable()
      passwordController.disable()
      confirmPasswordController.disable()
    } else {
      controller.enable()
      nameController.enable()
      emailController.enable()
      passwordController.enable()
      confirmPasswordController.enable()
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
    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.acceptTerms
    ) {
      return
    }

    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else if (onSignUp) {
        await onSignUp(formData)
      }
    } catch (err) {
      console.error('Sign up error:', err)
    }
  }

  // Handle social login
  const handleSocialLogin = async (provider: AuthProviderName) => {
    if (onSocialLogin) {
      try {
        await onSocialLogin(provider)
      } catch (err) {
        console.error(`Social login error for ${provider}:`, err)
      }
    }
  }

  // Handle mode changes
  const handleModeChange = (mode: 'signin' | 'reset-password') => {
    onModeChange?.(mode)
  }

  return html.div(
    attr.class('bc-auth-form bc-signup-form'),

    // Form title
    Use(AuthI18n, t =>
      html.h2(
        attr.class('bc-auth-form__title'),
        functionOrReactiveMessage(labels?.signUpTitle, t.signUpTitle)
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

    // Social login buttons
    When(!!(socialProviders && socialProviders.length > 0), () =>
      Stack(
        attr.class('bc-auth-form__social'),
        SocialLoginButtons({
          providers:
            socialProviders?.map(p => ({
              provider: p.provider,
              flow: p.flow,
            })) || [],
          onProviderClick: handleSocialLogin,
          loading: isLoading,
          disabled: isLoading,
        }),

        // Divider
        When(showSocialDivider !== false, () => AuthDivider())
      )
    ),

    // Registration form
    html.form(
      attr.class('bc-auth-form__form'),
      on.submit(handleSubmit),

      Stack(
        attr.class('bc-auth-form__fields'),

        // Name field (optional)
        Use(AuthI18n, t =>
          TextControl({
            controller: nameController.transform(
              v => v ?? '',
              v => (v === '' ? undefined : v)
            ),
            label: functionOrReactiveMessage(labels?.nameLabel, t.nameLabel),
          })
        ),

        // Email field
        Use(AuthI18n, t =>
          EmailControl({
            controller: emailController,
            label: functionOrReactiveMessage(labels?.emailLabel, t.emailLabel),
          })
        ),

        // Password field
        Use(AuthI18n, t =>
          PasswordControl({
            controller: passwordController,
            label: functionOrReactiveMessage(
              labels?.passwordLabel,
              t.passwordLabel
            ),
          })
        ),

        // Password strength indicator
        When(showPasswordStrength !== false, () =>
          PasswordStrengthIndicator({
            password: passwordController.value,
            rules: passwordRules_,
            showLabel: true,
          })
        ),

        // Confirm password field
        Use(AuthI18n, t =>
          PasswordControl({
            controller: confirmPasswordController,
            label: functionOrReactiveMessage(
              labels?.confirmPasswordLabel,
              t.confirmPasswordLabel
            ),
          })
        ),

        // Terms acceptance checkbox
        Use(AuthI18n, t =>
          html.div(
            attr.class('bc-auth-form__terms'),
            html.label(
              attr.class('bc-auth-form__checkbox-label'),
              CheckboxInput({
                value: acceptTermsController.value.map(v => v ?? false),
                onChange: checked => acceptTermsController.change(checked),
              }),
              html.span(
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
              functionOrReactiveMessage(labels?.signUpButton, t.signUpButton)
          )
        )
      )
    ),

    // Footer links
    Use(AuthI18n, t =>
      html.div(
        attr.class('bc-auth-form__footer'),

        // Sign in link
        html.button(
          attr.type('button'),
          attr.class('bc-auth-form__link'),
          on.click(() => handleModeChange('signin')),
          functionOrReactiveMessage(labels?.hasAccountLink, t.hasAccountLink)
        )
      )
    )
  )
}
