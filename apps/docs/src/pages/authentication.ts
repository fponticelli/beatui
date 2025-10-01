import { html, attr, prop, When } from '@tempots/dom'
import { Stack, Button } from '@tempots/beatui'
import {
  AuthContainer,
  AuthModal,
  SignInData,
  SignUpData,
  ResetPasswordData,
} from '@tempots/beatui/auth'

export default function AuthenticationPage() {
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
    attr.class('items-center gap-8'),

    // Demo message
    When(
      demoMessage.map(v => v.length > 0),
      () =>
        html.div(
          attr.class('bg-green-100 text-green-800 p-3 rounded-lg text-sm'),
          demoMessage
        )
    ),

    // Auth container demo
    html.div(
      html.h2(
        attr.class('text-xl font-semibold mb-4'),
        'Auth Container (Direct)'
      ),
      html.div(
        attr.class('w-full max-w-64 p-4 border rounded-lg'),
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
        attr.class('text-xl font-semibold mb-4'),
        'Auth Modal (Modal Wrapper)'
      ),
      html.p(
        attr.class('text-gray-600 mb-4 text-center'),
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
