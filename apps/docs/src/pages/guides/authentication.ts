import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Icon, Notice, Badge } from '@tempots/beatui'
import { AuthContainer } from '@tempots/beatui/auth'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'Authentication',
  description:
    'Pre-built authentication UI with sign-in, sign-up, password reset, social login, and modal support.',
}

const AUTH_CONTAINER_CODE = `import { AuthContainer, SignInData, SignUpData, ResetPasswordData } from '@tempots/beatui/auth'

AuthContainer({
  mode: 'signin',  // 'signin' | 'signup' | 'reset-password'
  socialProviders: [{ provider: 'google' }, { provider: 'github' }],
  onSignIn: async (data: SignInData) => {
    const result = await api.signIn(data.email, data.password)
    return result.error ?? null  // Return null for success, string for error
  },
  onSignUp: async (data: SignUpData) => {
    await api.signUp(data.email, data.password, data.name)
    return null
  },
  onResetPassword: async (data: ResetPasswordData) => {
    await api.resetPassword(data.email)
    return null
  },
  onModeChange: mode => console.log('Mode changed to:', mode),
  showRememberMe: true,
  showPasswordStrength: true,
})`

const AUTH_MODAL_CODE = `import { AuthModal } from '@tempots/beatui/auth'
import { Button } from '@tempots/beatui'

AuthModal(open =>
  Button({
    variant: 'filled',
    onClick: () => open({
      mode: 'signin',
      onSignIn: handleSignIn,
      onSignUp: handleSignUp,
      onResetPassword: handleResetPassword,
      socialProviders: [{ provider: 'google' }, { provider: 'github' }],
    }),
  }, 'Sign In')
)`

const INDIVIDUAL_FORMS_CODE = `import { SignInForm, SignUpForm, ResetPasswordForm } from '@tempots/beatui/auth'

// Sign-in form only
SignInForm({
  showRememberMe: true,
  onSignIn: async (data) => { /* ... */ return null },
})

// Sign-up form only
SignUpForm({
  showPasswordStrength: true,
  onSignUp: async (data) => { /* ... */ return null },
})

// Password reset form only
ResetPasswordForm({
  onResetPassword: async (data) => { /* ... */ return null },
})`

const SOCIAL_LOGIN_CODE = `import { SocialLoginButton, socialProviderInfo, AuthProviderName } from '@tempots/beatui/auth'

// Individual social login button
SocialLoginButton({
  provider: 'google',
  ...socialProviderInfo['google'],
  onClick: () => handleSocialLogin('google'),
})

// Available providers: google, github, apple, facebook, twitter, x,
// microsoft, discord, linkedin, instagram, tiktok, snapchat, reddit,
// pinterest, twitch, steam, epic, playstation, xbox, whatsapp, wechat,
// amazon, yahoo, paypal`

const PASSWORD_STRENGTH_CODE = `import { PasswordStrengthIndicator } from '@tempots/beatui/auth'
import { prop } from '@tempots/dom'

const password = prop('')

PasswordStrengthIndicator({
  password,
  showLabel: true,
  rules: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
})`

const BETTER_AUTH_CODE = `import { BetterAuthUI } from '@tempots/beatui/auth'

// Wrap your app to connect auth UI to better-auth client
BetterAuthUI({ client: authClient },
  // Auth components will automatically use the better-auth client
  AuthContainer({ mode: 'signin' })
)`

const SOCIAL_PROVIDERS = [
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
]

export default function AuthenticationGuidePage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'Authentication'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'BeatUI ships pre-built authentication UI components for sign-in, sign-up, password reset, social login, and modal-based flows. Components handle presentation and form validation; you supply the backend callbacks.'
        ),
        html.div(
          attr.class('flex gap-3 items-center'),
          Badge({ variant: 'light', color: 'primary', size: 'sm' }, 'Callback-based'),
          Badge({ variant: 'light', color: 'secondary', size: 'sm' }, 'Social Login'),
          Badge({ variant: 'light', color: 'success', size: 'sm' }, 'better-auth')
        )
      ),

      // Section 1: Overview
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:shield', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Overview')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'BeatUI provides complete authentication UI components via the ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              '@tempots/beatui/auth'
            ),
            ' entry point. Components are UI-only and callback-based — they handle presentation and form validation but delegate actual authentication to your backend. This means they work with any auth provider or custom implementation.'
          ),
          Notice(
            { variant: 'info', title: 'Callback-based design' },
            'Auth components are callback-based — pass ',
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              'onSignIn'
            ),
            ', ',
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              'onSignUp'
            ),
            ', and ',
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              'onResetPassword'
            ),
            ' handlers that call your backend. Return ',
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              'null'
            ),
            ' for success or an error string to display.'
          )
        )
      ),

      // Section 2: AuthContainer
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:box', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'AuthContainer')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The main all-in-one auth component that includes sign-in, sign-up, and password reset forms with tab navigation. Pass the initial ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'mode'
            ),
            ' to control which form is shown first. Users can navigate between modes via the built-in tab bar.'
          ),
          CodeBlock(AUTH_CONTAINER_CODE, 'typescript'),
          // Live preview
          html.div(
            attr.class('space-y-2 pt-2'),
            html.div(
              attr.class('flex items-center gap-2'),
              Icon({ icon: 'lucide:eye', size: 'xs' }),
              html.span(attr.class('text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'), 'Live Preview')
            ),
            html.div(
              attr.class('rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900'),
              AuthContainer({
                mode: 'signin',
                socialProviders: [{ provider: 'google' }, { provider: 'github' }],
                onSignIn: async () => {
                  await new Promise(r => setTimeout(r, 1000))
                  return 'Demo mode — sign-in is not connected to a backend.'
                },
                onSignUp: async () => {
                  await new Promise(r => setTimeout(r, 1000))
                  return 'Demo mode — sign-up is not connected to a backend.'
                },
                onResetPassword: async () => {
                  await new Promise(r => setTimeout(r, 1000))
                  return 'Demo mode — password reset is not connected to a backend.'
                },
                showRememberMe: true,
                showPasswordStrength: true,
              })
            )
          )
        )
      ),

      // Section 3: AuthModal
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:layout-template', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'AuthModal')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Wraps the auth UI in a modal dialog. ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'AuthModal'
            ),
            ' receives a render callback that is called with an ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'open'
            ),
            ' function. Call ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'open(options)'
            ),
            ' with the same options as ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'AuthContainer'
            ),
            ' to present the modal.'
          ),
          CodeBlock(AUTH_MODAL_CODE, 'typescript')
        )
      ),

      // Section 4: Individual Forms
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:file-text', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Individual Forms')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'For more control over layout and flow you can use the individual form components directly. Each form is fully self-contained and accepts its own set of options and callback handlers.'
          ),
          CodeBlock(INDIVIDUAL_FORMS_CODE, 'typescript')
        )
      ),

      // Section 5: Social Login
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:users', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Social Login')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Social login buttons are available as both the ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'socialProviders'
            ),
            ' prop on ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'AuthContainer'
            ),
            ' and as standalone ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'SocialLoginButton'
            ),
            ' components. Provider icons, labels, and brand colors are supplied by ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'socialProviderInfo'
            ),
            '.'
          ),
          CodeBlock(SOCIAL_LOGIN_CODE, 'typescript'),
          html.div(
            attr.class('space-y-2 pt-1'),
            html.p(
              attr.class(
                'text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide'
              ),
              'Available providers'
            ),
            html.div(
              attr.class('flex flex-wrap gap-2'),
              ...SOCIAL_PROVIDERS.map(provider =>
                Badge({ variant: 'subtle', size: 'xs', color: 'base' }, provider)
              )
            )
          )
        )
      ),

      // Section 6: Password Strength
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:lock', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Password Strength')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'PasswordStrengthIndicator'
            ),
            ' component accepts a reactive password signal and renders a live strength meter with configurable validation rules. Pass ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'showPasswordStrength: true'
            ),
            ' to ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'SignUpForm'
            ),
            ' or ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'AuthContainer'
            ),
            ' to enable it inline, or use it standalone for custom layouts.'
          ),
          CodeBlock(PASSWORD_STRENGTH_CODE, 'typescript')
        )
      ),

      // Section 7: Better-Auth Integration
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:link', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Better-Auth Integration')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'BeatUI ships a bridge layer for ',
            html.a(
              attr.href('https://better-auth.com'),
              attr.class(
                'text-primary-600 dark:text-primary-400 hover:underline'
              ),
              attr.target('_blank'),
              'better-auth'
            ),
            '. Wrap your component tree in ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'BetterAuthUI'
            ),
            ' with your better-auth client and all nested auth components will use it automatically — no need to pass callbacks manually.'
          ),
          CodeBlock(BETTER_AUTH_CODE, 'typescript'),
          Notice(
            { variant: 'warning', title: 'Peer dependency' },
            'The better-auth bridge is at ',
            html.code(
              attr.class(
                'font-mono text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded'
              ),
              '@tempots/beatui/auth'
            ),
            '. Make sure to install ',
            html.code(
              attr.class(
                'font-mono text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded'
              ),
              'better-auth'
            ),
            ' as a peer dependency.'
          )
        )
      )
    ),
  })
}
