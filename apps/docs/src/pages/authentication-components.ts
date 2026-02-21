import { html, attr, prop, When } from '@tempots/dom'
import {
  Stack,
  Group,
  Label,
  PasswordInput,
  Switch,
  ScrollablePanel,
} from '@tempots/beatui'
import {
  AuthContainer,
  SignInForm,
  SignUpForm,
  ResetPasswordForm,
  SocialLoginButton,
  PasswordStrengthIndicator,
  AuthMode,
  AuthProviderName,
  socialProviderInfo,
} from '@tempots/beatui/auth'
import { AuthModeSelector } from '../elements/auth-mode-selector'
import { AuthProviderSelector } from '../elements/auth-provider-selector'
import { ControlsHeader } from '../elements/controls-header'
import type { AuthProviderKey } from '../elements/auth-provider-selector'

export default function AuthenticationComponentsPage() {
  // AuthContainer demo state
  const authMode = prop<AuthMode>('signin')
  const showSocial = prop(true)
  const showRememberMe = prop(true)
  const showPasswordStrength = prop(true)
  const demoMessage = prop<string>('')

  // Social login demo state
  const socialProvider = prop<AuthProviderKey>('google')
  const socialLoading = prop(false)

  // Password strength demo state
  const passwordValue = prop('')

  const handleAuthAction = async (data: unknown, action: string) => {
    demoMessage.set(
      `${action} successful! Data: ${JSON.stringify(data, null, 2)}`
    )
    setTimeout(() => demoMessage.set(''), 5000)
  }

  const handleSocialLogin = async (provider: AuthProviderName) => {
    socialLoading.set(true)
    demoMessage.set(`Initiating ${provider} login...`)

    setTimeout(() => {
      socialLoading.set(false)
      demoMessage.set(`${provider} login successful! (demo mode)`)
      setTimeout(() => demoMessage.set(''), 3000)
    }, 1500)
  }

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(
        Label('Mode'),
        AuthModeSelector({ mode: authMode, onChange: v => authMode.set(v) })
      ),
      Stack(
        Label('Social Login'),
        Switch({ value: showSocial, onChange: v => showSocial.set(v) })
      ),
      Stack(
        Label('Remember Me'),
        Switch({ value: showRememberMe, onChange: v => showRememberMe.set(v) })
      ),
      Stack(
        Label('Password Strength'),
        Switch({
          value: showPasswordStrength,
          onChange: v => showPasswordStrength.set(v),
        })
      )
    ),
    body: Stack(
      attr.class('p-4'),
      // Demo message
      When(
        demoMessage.map(msg => msg.length > 0),
        () =>
          html.div(
            attr.class(
              'bg-cyan-200 dark:bg-cyan-800 text-gray-800 dark:text-gray-200 p-4 rounded-lg mb-6 text-sm font-mono whitespace-pre-wrap'
            ),
            demoMessage
          )
      ),
      AuthContainer({
        mode: authMode,
        showRememberMe,
        showPasswordStrength,
        socialProviders: showSocial
          ? [{ provider: 'google' }, { provider: 'github' }]
          : undefined,
        onSignIn: async data => {
          await handleAuthAction(data, 'Sign in')
          return null
        },
        onSignUp: async data => {
          await handleAuthAction(data, 'Sign up')
          return null
        },
        onResetPassword: async data => {
          await handleAuthAction(data, 'Password reset')
          return null
        },
        onModeChange: v => authMode.set(v),
      }),

      // Individual Forms Demo
      html.div(
        attr.class('grid grid-cols-1 lg:grid-cols-3 gap-6'),

        // SignInForm
        html.div(
          html.h4(attr.class('font-medium mb-3'), 'SignInForm'),
          html.div(
            attr.class('max-w-48'),
            SignInForm({
              showRememberMe: true,
              onSignIn: async data => {
                await handleAuthAction(data, 'Individual sign in')
                return null
              },
            })
          )
        ),

        // SignUpForm
        html.div(
          html.h4(attr.class('font-medium mb-3'), 'SignUpForm'),
          html.div(
            attr.class('max-w-48'),
            SignUpForm({
              showPasswordStrength: true,
              onSignUp: async data => {
                await handleAuthAction(data, 'Individual sign up')
                return null
              },
            })
          )
        ),

        // ResetPasswordForm
        html.div(
          html.h4(attr.class('font-medium mb-3'), 'ResetPasswordForm'),
          html.div(
            attr.class('max-w-48'),
            ResetPasswordForm({
              onResetPassword: async data => {
                await handleAuthAction(data, 'Individual password reset')
                return null
              },
            })
          )
        )
      ),

      // Social Login Buttons Demo
      Group(
        attr.class('gap-4'),
        Stack(
          Label('Provider'),
          AuthProviderSelector({
            provider: socialProvider,
            onChange: v => socialProvider.set(v),
          })
        )
      ),
      Stack(
        attr.class('gap-4 items-center'),

        // All providers showcase
        html.div(
          attr.class('w-full'),
          html.h4(attr.class('font-medium mb-2'), 'All Providers'),
          html.div(
            attr.class('grid grid-cols-2 md:grid-cols-4 gap-2'),
            ...(
              [
                'google',
                'github',
                'apple',
                'facebook',
                'twitter',
                'x',
                'microsoft',
                'discord',
                'linkedin',
                'instagram',
                'tiktok',
                'snapchat',
                'reddit',
                'pinterest',
                'twitch',
                'steam',
                'epic',
                'playstation',
                'xbox',
                'whatsapp',
                'wechat',
                'amazon',
                'yahoo',
                'paypal',
              ] as AuthProviderName[]
            ).map(provider =>
              SocialLoginButton({
                provider,
                ...socialProviderInfo[provider],
                onClick: () => handleSocialLogin(provider),
              })
            )
          )
        )
      ),

      // Password Strength Indicator Demo
      Stack(
        Label('Test Password'),
        PasswordInput({
          value: passwordValue,
          onInput: v => passwordValue.set(v),
          placeholder: 'Type a password to see strength feedback',
        })
      ),
      Stack(
        attr.class('gap-4 w-full max-w-128'),

        html.h4(attr.class('font-medium'), 'Full Indicator'),
        PasswordStrengthIndicator({
          password: passwordValue,
          showLabel: true,
          rules: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: true,
          },
        }),

        html.h4(attr.class('font-medium mt-4'), 'Bar Only'),
        PasswordStrengthIndicator({
          password: passwordValue,
          showLabel: false,
          rules: {
            minLength: 8,
            requireUppercase: true,
            requireNumbers: true,
          },
        })
      )
    ),
  })
}
