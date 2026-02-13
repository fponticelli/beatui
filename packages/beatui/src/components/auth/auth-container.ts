/**
 * Auth Container Component
 *
 * The main authentication UI container that switches between sign-in,
 * sign-up, and reset-password modes. Coordinates social login buttons,
 * form fields, mode navigation links, and i18n labels.
 *
 * @module auth/auth-container
 */

import {
  attr,
  prop,
  TNode,
  Value,
  OneOfValue,
  Fragment,
  on,
  Use,
  coalesce,
  When,
} from '@tempots/dom'
import { html } from '@tempots/dom'
import { AuthContainerOptions, AuthDivider, AuthMode } from './index'
import { SignInForm } from './signin-form'
import { SignUpForm } from './signup-form'
import { ResetPasswordForm } from './reset-password-form'
import { Modal, ModalContentOptions } from '../overlay'
import { SocialProviders } from './social-providers'
import { AuthI18n } from '../../auth-i18n'
import { Stack } from '../layout'
import { classes } from '@tempots/ui'

/**
 * Renders the main authentication container that switches between sign-in,
 * sign-up, and reset-password modes.
 *
 * The container manages mode state, renders the appropriate form for the
 * current mode, displays optional social login buttons with a divider,
 * and provides navigation links to switch between modes.
 *
 * @param options - Configuration options for the auth container.
 * @param children - Additional child nodes to render inside the container.
 * @returns A `TNode` representing the complete auth container UI.
 *
 * @example
 * ```ts
 * AuthContainer({
 *   mode: 'signin',
 *   socialProviders: [{ provider: 'google' }, { provider: 'github' }],
 *   onSignIn: async (data) => {
 *     const error = await api.signIn(data)
 *     return error ?? null
 *   },
 *   onSignUp: async (data) => {
 *     const error = await api.signUp(data)
 *     return error ?? null
 *   },
 *   onResetPassword: async (data) => {
 *     const error = await api.resetPassword(data)
 *     return error ?? null
 *   },
 *   showRememberMe: true,
 *   showSocialDivider: true,
 * })
 * ```
 */
export function AuthContainer(
  {
    mode: initialMode,
    socialProviders,
    initialName,
    initialEmail,
    passwordRules,
    showRememberMe,
    showSocialDivider,
    showPasswordStrength,
    labels,
    onSignIn,
    onSignUp,
    onResetPassword,
    onModeChange,
    onSocialLogin,
    showContainer,
  }: AuthContainerOptions,
  ...children: TNode[]
) {
  // Current mode state
  const currentMode =
    initialMode != null
      ? Value.deriveProp(initialMode)
      : prop<AuthMode>('signin')

  currentMode.on(mode => onModeChange?.(mode))

  return Use(AuthI18n, t => {
    function HasAccountLink() {
      const x = coalesce(labels?.hasAccountLink, t.$.hasAccountLink)
      return html.button(
        attr.type('button'),
        attr.class('bc-auth-form__link'),
        on.click(() => currentMode.set('signin')),
        x
      )
    }

    function NoAccountLink() {
      return html.button(
        attr.type('button'),
        attr.class('bc-auth-form__link'),
        on.click(() => currentMode.set('signup')),
        coalesce(labels?.noAccountLink, t.$.noAccountLink)
      )
    }

    function ForgotPasswordLink() {
      return html.button(
        attr.type('button'),
        attr.class('bc-auth-form__link'),
        on.click(() => currentMode.set('reset-password')),
        coalesce(labels?.forgotPasswordLink, t.$.forgotPasswordLink)
      )
    }

    return html.div(
      classes({
        'bc-auth-container': true,
        'bc-auth-container--styled': Value.map(showContainer ?? true, sc => sc),
      }),
      attr.class(currentMode.map(mode => `bc-auth-container--${mode}`)),
      attr.class('bc-auth-form'),

      OneOfValue(currentMode, {
        signin: () =>
          Fragment(
            html.h2(
              attr.class('bc-auth-form__title'),
              coalesce(labels?.signInTitle, t.$.signInTitle)
            ),
            socialProviders != null
              ? Fragment(
                  SocialProviders({
                    providers: socialProviders,
                    onSocialLogin,
                  }),
                  When(showSocialDivider ?? false, AuthDivider)
                )
              : null,
            SignInForm({
              onSignIn,
              showRememberMe,
              passwordRules,
              labels: {
                emailLabel: labels?.emailLabel,
                passwordLabel: labels?.passwordLabel,
                rememberMeLabel: labels?.rememberMeLabel,
                signInButton: labels?.signInButton,
                forgotPasswordLink: labels?.forgotPasswordLink,
                noAccountLink: labels?.noAccountLink,
              },
            }),
            Stack(
              attr.class('bc-auth-form__footer'),
              NoAccountLink(),
              ForgotPasswordLink()
            )
          ),
        signup: () =>
          Fragment(
            html.h2(
              attr.class('bc-auth-form__title'),
              coalesce(labels?.signUpTitle, t.$.signUpTitle)
            ),
            socialProviders != null
              ? Fragment(
                  SocialProviders({
                    providers: socialProviders,
                    onSocialLogin,
                  }),
                  When(showSocialDivider ?? false, AuthDivider)
                )
              : null,
            SignUpForm({
              labels: {
                nameLabel: labels?.nameLabel,
                emailLabel: labels?.emailLabel,
                passwordLabel: labels?.passwordLabel,
                confirmPasswordLabel: labels?.confirmPasswordLabel,
                acceptTermsLabel: labels?.acceptTermsLabel,
                signUpButton: labels?.signUpButton,
                hasAccountLink: labels?.hasAccountLink,
              },
              initialEmail,
              initialName,
              onSignUp,
              passwordRules,
              showPasswordStrength,
            }),
            Stack(attr.class('bc-auth-form__footer'), HasAccountLink())
          ),
        'reset-password': () =>
          Fragment(
            html.h2(
              attr.class('bc-auth-form__title'),
              coalesce(labels?.resetPasswordTitle, t.$.resetPasswordTitle)
            ),
            ResetPasswordForm({
              labels: {
                backToSignInLink: labels?.backToSignInLink,
                emailLabel: labels?.emailLabel,
                resetPasswordButton: labels?.resetPasswordButton,
                resetPasswordDescription: labels?.resetPasswordDescription,
              },
              onResetPassword,
            }),
            Stack(attr.class('bc-auth-form__footer'), HasAccountLink())
          ),
      }),
      ...children
    )
  })
}

/**
 * Creates an authentication container displayed inside a modal dialog.
 *
 * Provides a callback-based API where the consumer receives an `open` function
 * that triggers the modal with auth container content. The modal is small-sized,
 * dismissable, and includes a close button.
 *
 * @param fn - A function that receives an `open` callback and returns the trigger `TNode`.
 *   The `open` callback accepts {@link AuthContainerOptions} plus an optional `modalTitle`.
 * @returns A `TNode` that includes both the trigger element and the modal.
 *
 * @example
 * ```ts
 * AuthModal((open) =>
 *   Button({ onClick: () => open({ onSignIn: handleSignIn }) }, 'Sign In')
 * )
 * ```
 */
export function AuthModal(
  fn: (
    open: (
      options: AuthContainerOptions & {
        modalTitle?: () => string
      }
    ) => void
  ) => TNode
) {
  return Modal(
    {
      size: 'sm',
      dismissable: true,
      showCloseButton: true,
    },
    (open: (content: ModalContentOptions) => void, _close: () => void) => {
      return fn(options =>
        open({
          body: AuthContainer({ showContainer: false, ...options }),
          header: Use(AuthI18n, t =>
            coalesce(options.modalTitle, t.$.authenticationTitle)
          ),
        })
      )
    }
  )
}
