// Auth Container Component
// Main container that switches between signin/signup/reset modes

import {
  attr,
  prop,
  TNode,
  Value,
  OnDispose,
  OneOfValue,
  Fragment,
  on,
  Use,
  coalesce,
} from '@tempots/dom'
import { html } from '@tempots/dom'
import { AuthContainerOptions, AuthDivider, AuthMode } from './index'
import { SignInForm } from './signin-form'
import { SignUpForm } from './signup-form'
import { ResetPasswordForm } from './reset-password-form'
import { Modal, ModalContentOptions } from '../overlay'
import { SocialProviders } from './social-providers'
import { AuthI18n } from '@/auth-i18n'
import { Stack } from '../layout'
import { classes } from '@tempots/ui'

export function AuthContainer(
  {
    mode: initialMode,
    socialProviders,
    passwordRules,
    showRememberMe,
    showSocialDivider,
    showPasswordStrength,
    labels,
    onSignIn,
    onSignUp,
    onResetPassword,
    onModeChange,
    // onSocialLogin,
    showContainer,
  }: AuthContainerOptions,
  ...children: TNode[]
): TNode {
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
      OnDispose(currentMode.dispose),

      OneOfValue(currentMode, {
        signin: () =>
          Fragment(
            html.h2(
              attr.class('bc-auth-form__title'),
              coalesce(labels?.signInTitle, t.$.signInTitle)
            ),
            socialProviders != null
              ? Fragment(
                  SocialProviders({ providers: socialProviders }),
                  showSocialDivider !== false ? AuthDivider() : null
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
                  SocialProviders({ providers: socialProviders }),
                  showSocialDivider !== false ? AuthDivider() : null
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

// Convenience function to create auth container with modal
export function AuthModal(
  fn: (
    open: (
      options: AuthContainerOptions & {
        modalTitle?: () => string
      }
    ) => void
  ) => TNode
): TNode {
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
