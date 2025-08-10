import { html, attr, prop, When } from '@tempots/dom'
import {
  Stack,
  AuthContainer,
  AuthModal,
  Button,
  SignInData,
  SignUpData,
  ResetPasswordData,
} from '@tempots/beatui'

export const AuthenticationPage = () => {
  // Demo state
  const demoMessage = prop<string>('')

  const handleSignIn = async (data: SignInData) => {
    demoMessage.set(`Sign in successful! Email: ${data.email}`)
    setTimeout(() => demoMessage.set(''), 3000)
    return null
  }

  const handleSignUp = async (data: SignUpData) => {
    demoMessage.set(
      `Sign up successful! Email: ${data.email}, Name: ${data.name || 'Not provided'}`
    )
    setTimeout(() => demoMessage.set(''), 3000)
    return null
  }

  const handleResetPassword = async (data: ResetPasswordData) => {
    demoMessage.set(`Password reset email sent to: ${data.email}`)
    setTimeout(() => demoMessage.set(''), 3000)
    return null
  }

  return Stack(
    attr.class('bu-items-center bu-gap-8'),

    // Demo message
    When(
      demoMessage.map(v => v.length > 0),
      () =>
        html.div(
          attr.class(
            'bu-bg-lighter-green bu-text-darker-green bu-p-3 bu-rounded-lg bu-text-sm'
          ),
          demoMessage
        )
    ),

    // Auth container demo
    html.div(
      html.h2(
        attr.class('bu-text-xl bu-font-semibold bu-mb-4'),
        'Auth Container (Direct)'
      ),
      html.div(
        attr.class('bu-w-full bu-max-w-md bu-p-4 bu-border bu-rounded-lg'),
        AuthContainer({
          mode: 'signin',
          onSignIn: handleSignIn,
          onSignUp: handleSignUp,
          onResetPassword: handleResetPassword,
          socialProviders: [{ provider: 'google' }, { provider: 'github' }],
        })
      )
    ),

    // Auth modal demo
    html.div(
      html.h2(
        attr.class('bu-text-xl bu-font-semibold bu-mb-4'),
        'Auth Modal (Modal Wrapper)'
      ),
      html.p(
        attr.class('bu-text-gray bu-mb-4 bu-text-center'),
        'Click the button below to open the authentication form in a modal.'
      ),
      AuthModal(open =>
        Button(
          {
            variant: 'filled',
            onClick: () =>
              open({
                mode: 'signin',
                onSignIn: handleSignIn,
                onSignUp: handleSignUp,
                onResetPassword: handleResetPassword,
                socialProviders: [
                  { provider: 'google' },
                  { provider: 'github' },
                ],
              }),
          },
          'Open Authentication Modal'
        )
      )
    )
  )
}
