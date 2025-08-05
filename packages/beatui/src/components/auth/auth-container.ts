// Auth Container Component
// Main container that switches between signin/signup/reset modes

import {
  attr,
  computedOf,
  prop,
  TNode,
  Value,
  OnDispose,
  OneOfValue,
  Fragment,
  on,
  Use,
} from '@tempots/dom'
import { html } from '@tempots/dom'
import {
  AuthContainerOptions,
  AuthDivider,
  AuthMode,
  functionOrReactiveMessage,
} from './index'
import { SignInForm } from './signin-form'
import { SignUpForm } from './signup-form'
import { ResetPasswordForm } from './reset-password-form'
import { Modal, ModalContentOptions } from '../overlay'
import { SocialProviders } from './social-providers'
import { AuthI18n } from '@/auth-i18n'
import { Stack } from '../layout'

export function AuthContainer({
  mode: initialMode,
  className,
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
}: AuthContainerOptions): TNode {
  // Current mode state
  const currentMode =
    initialMode != null
      ? Value.deriveProp(initialMode)
      : prop<AuthMode>('signin')

  currentMode.on(mode => onModeChange?.(mode))

  // Container classes
  const containerClasses = computedOf(
    currentMode,
    className
  )((mode, cls) => {
    const classes = [
      'bc-auth-container',
      `bc-auth-container--${mode}`,
      cls,
    ].filter(Boolean)
    return classes.join(' ')
  })

  return Use(AuthI18n, t => {
    function HasAccountLink() {
      return html.button(
        attr.type('button'),
        attr.class('bc-auth-form__link'),
        on.click(() => currentMode.set('signin')),
        functionOrReactiveMessage(labels?.hasAccountLink, t.hasAccountLink)
      )
    }

    function NoAccountLink() {
      return html.button(
        attr.type('button'),
        attr.class('bc-auth-form__link'),
        on.click(() => currentMode.set('signup')),
        functionOrReactiveMessage(labels?.noAccountLink, t.noAccountLink)
      )
    }

    function ForgotPasswordLink() {
      return html.button(
        attr.type('button'),
        attr.class('bc-auth-form__link'),
        on.click(() => currentMode.set('reset-password')),
        functionOrReactiveMessage(
          labels?.forgotPasswordLink,
          t.forgotPasswordLink
        )
      )
    }

    return html.div(
      attr.class(containerClasses),
      attr.class('bc-auth-form'),
      OnDispose(currentMode.dispose),

      OneOfValue(currentMode, {
        signin: () =>
          Fragment(
            html.h2('Sign In'), // TODO translation
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
            html.h2('Sign Up'), // TODO translation
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
            html.h2('Reset Password'), // TODO translation
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
      })
    )
  })
}

// Convenience function to create auth container with modal
export function AuthModal({
  isOpen,
  onClose,
  ...authOptions
}: AuthContainerOptions & {
  isOpen: Value<boolean>
  onClose?: () => void
}): TNode {
  return Modal(
    {
      size: 'sm',
      dismissable: true,
      showCloseButton: true,
      onClose,
    },
    (open: (content: ModalContentOptions) => void, _close: () => void) => {
      // Open modal when isOpen becomes true
      if (Value.get(isOpen)) {
        open({
          body: AuthContainer(authOptions),
        })
      }

      return html.div() // Empty placeholder
    }
  )
}
