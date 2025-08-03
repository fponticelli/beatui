// Sign In Form Component
// Main sign-in form with email/password fields and social login options

import { attr, computedOf, html, on, TNode, When } from '@tempots/dom'
import { Button } from '../button'
import { EmailControl, PasswordControl } from '../form/control'
import { CheckboxInput } from '../form/input'
import { Stack } from '../layout/stack'
import { useForm } from '../form/use-form'
import {
  SignInFormOptions,
  formatAuthError,
  getRememberedEmail,
  saveRememberMe,
  clearRememberedEmail,
  defaultAuthLabels,
  AuthProviderName,
} from './index'
import { createSignInSchema } from './schemas'
import { SocialLoginButtons } from './social-login-button'
import { AuthDivider } from './auth-divider'

export function SignInForm({
  config = {},
  onSubmit,
  onModeChange,
  loading,
  error,
}: SignInFormOptions): TNode {
  const labels = { ...defaultAuthLabels, ...config.labels }
  const isLoading = computedOf(loading)(l => l ?? false)
  const errorMessage = computedOf(error)(e => (e ? formatAuthError(e) : null))

  // Initialize form with remembered email if available
  const rememberedEmail = getRememberedEmail()
  const schema = createSignInSchema(config.passwordRules)

  const controller = useForm({
    schema,
    defaultValue: {
      email: rememberedEmail || '',
      password: '',
      rememberMe: !!rememberedEmail,
    },
  })

  const emailController = controller.field('email')
  const passwordController = controller.field('password')
  const rememberMeController = controller.field('rememberMe')

  // Handle loading state - disable/enable form based on loading
  // Set initial state
  if (isLoading.get()) {
    controller.disable()
    emailController.disable()
    passwordController.disable()
  }

  // Listen for loading state changes and update controller accordingly
  const unsubscribe = isLoading.on(loading => {
    if (loading) {
      controller.disable()
      emailController.disable()
      passwordController.disable()
    } else {
      controller.enable()
      emailController.enable()
      passwordController.enable()
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
    if (!formData.email || !formData.password) {
      return
    }

    // Handle remember me functionality
    if (formData.rememberMe) {
      saveRememberMe(formData.email)
    } else {
      clearRememberedEmail()
    }

    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else if (config.onSignIn) {
        await config.onSignIn(formData)
      }
    } catch (err) {
      console.error('Sign in error:', err)
    }
  }

  // Handle social login
  const handleSocialLogin = async (provider: AuthProviderName) => {
    if (config.onSocialLogin) {
      try {
        await config.onSocialLogin(provider)
      } catch (err) {
        console.error(`Social login error for ${provider}:`, err)
      }
    }
  }

  // Handle mode changes
  const handleModeChange = (mode: 'signup' | 'reset-password') => {
    if (onModeChange) {
      onModeChange(mode)
    } else if (config.onModeChange) {
      config.onModeChange(mode)
    }
  }

  return html.div(
    attr.class('bc-auth-form bc-signin-form'),

    // Form title
    html.h2(attr.class('bc-auth-form__title'), labels.signInTitle),

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
    When(!!(config.socialProviders && config.socialProviders.length > 0), () =>
      Stack(
        attr.class('bc-auth-form__social'),
        SocialLoginButtons({
          providers:
            config.socialProviders?.map(p => ({
              provider: p.provider,
              flow: p.flow,
            })) || [],
          onProviderClick: handleSocialLogin,
          loading: isLoading,
          disabled: isLoading,
        }),

        // Divider
        When(config.showSocialDivider !== false, () => AuthDivider())
      )
    ),

    // Email/Password form
    html.form(
      attr.class('bc-auth-form__form'),
      on.submit(handleSubmit),

      Stack(
        attr.class('bc-auth-form__fields'),

        // Email field
        EmailControl({
          controller: emailController,
          label: labels.emailLabel,
        }),

        // Password field
        PasswordControl({
          controller: passwordController,
          label: labels.passwordLabel,
        }),

        // Remember me checkbox
        When(config.showRememberMe !== false, () =>
          html.div(
            attr.class('bc-auth-form__remember-me'),
            html.label(
              attr.class('bc-auth-form__checkbox-label'),
              CheckboxInput({
                value: rememberMeController.value.map(v => v ?? false),
                after: html.span(labels.rememberMeLabel),
                onChange: checked => rememberMeController.change(checked),
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
          disabled: computedOf(
            controller.hasError,
            isLoading
          )((hasError, loading) => hasError || loading),
        },
        attr.class('bc-auth-form__submit'),
        When(
          isLoading,
          () => labels.loading,
          () => labels.signInButton
        )
      )
    ),

    // Footer links
    html.div(
      attr.class('bc-auth-form__footer'),

      // Forgot password link
      When(config.allowPasswordReset !== false, () =>
        html.button(
          attr.type('button'),
          attr.class('bc-auth-form__link'),
          on.click(() => handleModeChange('reset-password')),
          labels.forgotPasswordLink
        )
      ),

      // Sign up link
      When(config.allowSignUp !== false, () =>
        html.button(
          attr.type('button'),
          attr.class('bc-auth-form__link'),
          on.click(() => handleModeChange('signup')),
          labels.noAccountLink
        )
      )
    )
  )
}
