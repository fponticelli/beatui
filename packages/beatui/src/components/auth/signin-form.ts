// Sign In Form Component
// Main sign-in form with email/password fields and social login options

import { attr, computedOf, html, on, TNode, Use, When } from '@tempots/dom'
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
  functionOrReactiveMessage,
  AuthProviderName,
} from './index'
import { createSignInSchema } from './schemas'
import { SocialLoginButtons } from './social-login-button'
import { AuthDivider } from './auth-divider'
import { AuthI18n } from '@/auth-i18n/translations'

export function SignInForm({
  onSubmit,
  onModeChange,
  onSignIn,
  onSocialLogin,
  loading,
  error,
  passwordRules,
  labels,
  socialProviders,
  showSocialDivider,
  showRememberMe,
  allowPasswordReset,
  allowSignUp,
}: SignInFormOptions): TNode {
  const isLoading = computedOf(loading)(l => l ?? false)
  const errorMessage = computedOf(error)(e => (e ? formatAuthError(e) : null))

  // Initialize form with remembered email if available
  const rememberedEmail = getRememberedEmail()
  const schema = createSignInSchema(passwordRules)

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

  // Set initial state after setting up the listener
  if (isLoading.get()) {
    controller.disable()
    emailController.disable()
    passwordController.disable()
  }

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
      } else if (onSignIn) {
        await onSignIn(formData)
      }
    } catch (err) {
      console.error('Sign in error:', err)
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
  const handleModeChange = (mode: 'signup' | 'reset-password') => {
    onModeChange?.(mode)
  }

  return html.div(
    attr.class('bc-auth-form bc-signin-form'),

    // Form title
    Use(AuthI18n, t =>
      html.h2(
        attr.class('bc-auth-form__title'),
        functionOrReactiveMessage(labels?.signInTitle, t.signInTitle)
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
    When(!!(socialProviders != null && socialProviders.length > 0), () =>
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

    // Email/Password form
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

        // Remember me checkbox
        When(showRememberMe !== false, () =>
          Use(AuthI18n, t =>
            html.div(
              attr.class('bc-auth-form__remember-me'),
              html.label(
                attr.class('bc-auth-form__checkbox-label'),
                CheckboxInput({
                  value: rememberMeController.value.map(v => v ?? false),
                  after: html.span(
                    functionOrReactiveMessage(
                      labels?.rememberMeLabel,
                      t.rememberMeLabel
                    )
                  ),
                  onChange: checked => rememberMeController.change(checked),
                })
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
              functionOrReactiveMessage(labels?.signInButton, t.signInButton)
          )
        )
      )
    ),

    // Footer links
    Use(AuthI18n, t =>
      html.div(
        attr.class('bc-auth-form__footer'),

        // Forgot password link
        When(allowPasswordReset !== false, () =>
          html.button(
            attr.type('button'),
            attr.class('bc-auth-form__link'),
            on.click(() => handleModeChange('reset-password')),
            functionOrReactiveMessage(
              labels?.forgotPasswordLink,
              t.forgotPasswordLink
            )
          )
        ),

        // Sign up link
        When(allowSignUp !== false, () =>
          html.button(
            attr.type('button'),
            attr.class('bc-auth-form__link'),
            on.click(() => handleModeChange('signup')),
            functionOrReactiveMessage(labels?.noAccountLink, t.noAccountLink)
          )
        )
      )
    )
  )
}
