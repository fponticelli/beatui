import { html, attr, prop, When } from '@tempots/dom'
import {
  Stack,
  Group,
  Label,
  Switch,
  AuthContainer,
  SignInForm,
  SignUpForm,
  ResetPasswordForm,
  SocialLoginButton,
  PasswordStrengthIndicator,
  AuthMode,
  AuthProviderName,
  PasswordInput,
  socialProviderInfo,
} from '@tempots/beatui'
import { AuthModeSelector } from '../elements/auth-mode-selector'
import { AuthProviderSelector } from '../elements/auth-provider-selector'

export const AuthenticationComponentsPage = () => {
  // AuthContainer demo state
  const authMode = prop<AuthMode>('signin')
  const showSocial = prop(true)
  const showRememberMe = prop(true)
  const showPasswordStrength = prop(true)
  const demoMessage = prop<string>('')

  // Social login demo state
  const socialProvider = prop<AuthProviderName>('google')
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

  return Stack(
    attr.class('bu-p-6 bu-overflow-y-auto bu-h-full'),

    // Page header
    html.h1(
      attr.class('bu-text-3xl bu-font-bold bu-mb-6'),
      'Authentication Components'
    ),

    // Demo message
    When(
      demoMessage.map(msg => msg.length > 0),
      () =>
        html.div(
          attr.class(
            'bu-bg--info-lighter bu-text--info-darker bu-p-4 bu-rounded-lg bu-mb-6 bu-text-sm bu-font-mono bu-whitespace-pre-wrap'
          ),
          demoMessage
        )
    ),

    // AuthContainer Demo
    Group(
      attr.class('bu-gap-4 bu-flex-wrap'),
      Stack(
        Label('Mode'),
        AuthModeSelector({ mode: authMode, onChange: authMode.set })
      ),
      Stack(
        Label('Social Login'),
        Switch({ value: showSocial, onChange: showSocial.set })
      ),
      Stack(
        Label('Remember Me'),
        Switch({ value: showRememberMe, onChange: showRememberMe.set })
      ),
      Stack(
        Label('Password Strength'),
        Switch({
          value: showPasswordStrength,
          onChange: showPasswordStrength.set,
        })
      )
    ),
    html.div(
      attr.class('bu-flex bu-justify-center'),
      html.div(
        attr.class('bu-w-full bu-max-w-md'),
        AuthContainer({
          initialMode: authMode.value,
          showRememberMe: showRememberMe.value,
          showPasswordStrength: showPasswordStrength.value,
          socialProviders: showSocial.value
            ? [
                { provider: 'google', clientId: 'demo-google-id' },
                { provider: 'github', clientId: 'demo-github-id' },
              ]
            : undefined,
          onSignIn: data => handleAuthAction(data, 'Sign in'),
          onSignUp: data => handleAuthAction(data, 'Sign up'),
          onResetPassword: data => handleAuthAction(data, 'Password reset'),
          onSocialLogin: handleSocialLogin,
          onModeChange: authMode.set,
        })
      )
    ),

    // Individual Forms Demo
    html.div(
      attr.class('bu-grid bu-grid-cols-1 lg:bu-grid-cols-3 bu-gap-6'),

      // SignInForm
      html.div(
        html.h4(attr.class('bu-font-medium bu-mb-3'), 'SignInForm'),
        html.div(
          attr.class('bu-max-w-sm'),
          SignInForm({
            showRememberMe: true,
            onSubmit: data => handleAuthAction(data, 'Individual sign in'),
          })
        )
      ),

      // SignUpForm
      html.div(
        html.h4(attr.class('bu-font-medium bu-mb-3'), 'SignUpForm'),
        html.div(
          attr.class('bu-max-w-sm'),
          SignUpForm({
            showPasswordStrength: true,
            onSubmit: data => handleAuthAction(data, 'Individual sign up'),
          })
        )
      ),

      // ResetPasswordForm
      html.div(
        html.h4(attr.class('bu-font-medium bu-mb-3'), 'ResetPasswordForm'),
        html.div(
          attr.class('bu-max-w-sm'),
          ResetPasswordForm({
            onSubmit: data =>
              handleAuthAction(data, 'Individual password reset'),
          })
        )
      )
    ),

    // Social Login Buttons Demo
    Group(
      attr.class('bu-gap-4'),
      Stack(
        Label('Provider'),
        AuthProviderSelector({
          provider: socialProvider,
          onChange: socialProvider.set,
        })
      )
    ),
    Stack(
      attr.class('bu-gap-4 bu-items-center'),

      // All providers showcase
      html.div(
        attr.class('bu-w-full'),
        html.h4(attr.class('bu-font-medium bu-mb-2'), 'All Providers'),
        html.div(
          attr.class('bu-grid bu-grid-cols-2 md:bu-grid-cols-4 bu-gap-2'),
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
        onInput: passwordValue.set,
        placeholder: 'Type a password to see strength feedback',
      })
    ),
    Stack(
      attr.class('bu-gap-4 bu-w-full bu-max-w-md'),

      html.h4(attr.class('bu-font-medium'), 'Full Indicator'),
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

      html.h4(attr.class('bu-font-medium bu-mt-4'), 'Bar Only'),
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
  )
}
