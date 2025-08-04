import { attr, html, prop } from '@tempots/dom'
import {
  SignUp,
  SignUpData,
  TermsLink,
  SocialProvider,
  Stack,
  Group,
  Switch,
  Label,
  ScrollablePanel,
} from '@tempots/beatui'

export const SignUpPage = () => {
  // Configuration options
  const showPasswordStrength = prop(true)
  const showConfirmPassword = prop(true)
  const showAccountLink = prop(true)
  const showNameField = prop(true)
  const showTermsAcceptance = prop(true)
  const loading = prop(false)
  const disabled = prop(false)

  // Terms links
  const termsLinks: TermsLink[] = [
    { text: 'Terms of Service', href: '/terms' },
    { text: 'Privacy Policy', href: '/privacy' },
  ]

  // Social providers
  const socialProviders: SocialProvider[] = [
    {
      name: 'google',
      label: 'Continue with Google',
      icon: 'logos:google-icon',
      onClick: () => alert('Google sign-up clicked'),
    },
    {
      name: 'github',
      label: 'Continue with GitHub',
      icon: 'logos:github-icon',
      onClick: () => alert('GitHub sign-up clicked'),
    },
    {
      name: 'facebook',
      label: 'Continue with Facebook',
      icon: 'logos:facebook',
      onClick: () => alert('Facebook sign-up clicked'),
    },
  ]

  const handleSignUp = (data: SignUpData) => {
    console.log('Sign up data:', data)
    loading.set(true)
    
    // Simulate API call
    setTimeout(() => {
      loading.set(false)
      alert('Sign up successful!')
    }, 2000)
  }

  const handleAccountLinkClick = () => {
    alert('Navigate to sign in page')
  }

  return ScrollablePanel(
    {
      header: {
        content: html.h1('SignUp Component Demo'),
      },
    },
    html.div(
      attr.class('bu-p-4 bu-max-w-4xl bu-mx-auto'),
      
      Stack(
        attr.class('bu-gap-6'),
        
        // Configuration Controls
        html.div(
          attr.class('bu-p-4 bu-border bu-rounded-lg'),
          html.h2(
            attr.class('bu-text-lg bu-font-semibold bu-mb-4'),
            'Configuration Options'
          ),
          html.div(
            attr.class('bu-grid bu-grid-cols-2 bu-gap-4'),
            
            Group(
              Switch({
                value: showPasswordStrength,
                onChange: (value) => showPasswordStrength.set(value),
              }),
              Label('Show Password Strength')
            ),
            
            Group(
              Switch({
                value: showConfirmPassword,
                onChange: (value) => showConfirmPassword.set(value),
              }),
              Label('Show Confirm Password')
            ),
            
            Group(
              Switch({
                value: showAccountLink,
                onChange: (value) => showAccountLink.set(value),
              }),
              Label('Show Account Link')
            ),
            
            Group(
              Switch({
                value: showNameField,
                onChange: (value) => showNameField.set(value),
              }),
              Label('Show Name Field')
            ),
            
            Group(
              Switch({
                value: showTermsAcceptance,
                onChange: (value) => showTermsAcceptance.set(value),
              }),
              Label('Show Terms Acceptance')
            ),
            
            Group(
              Switch({
                value: loading,
                onChange: (value) => loading.set(value),
              }),
              Label('Loading State')
            ),
            
            Group(
              Switch({
                value: disabled,
                onChange: (value) => disabled.set(value),
              }),
              Label('Disabled State')
            )
          )
        ),
        
        // SignUp Component Demo
        html.div(
          attr.class('bu-flex bu-justify-center bu-p-8 bu-border bu-rounded-lg bu-bg-gray-50'),
          SignUp({
            showPasswordStrength,
            showConfirmPassword,
            showAccountLink,
            showNameField,
            showTermsAcceptance,
            termsLinks,
            socialProviders,
            loading,
            disabled,
            onSignUp: handleSignUp,
            onAccountLinkClick: handleAccountLinkClick,
            submitText: 'Create Account',
            accountLinkText: 'Sign in instead',
          })
        ),
        
        // Usage Example
        html.div(
          attr.class('bu-p-4 bu-border bu-rounded-lg'),
          html.h2(
            attr.class('bu-text-lg bu-font-semibold bu-mb-4'),
            'Usage Example'
          ),
          html.pre(
            attr.class('bu-bg-gray-100 bu-p-4 bu-rounded bu-text-sm bu-overflow-x-auto'),
            `import { SignUp, SignUpData, TermsLink, SocialProvider } from '@tempots/beatui'

const termsLinks: TermsLink[] = [
  { text: 'Terms of Service', href: '/terms' },
  { text: 'Privacy Policy', href: '/privacy' },
]

const socialProviders: SocialProvider[] = [
  {
    name: 'google',
    label: 'Continue with Google',
    icon: 'logos:google-icon',
    onClick: () => handleGoogleSignUp(),
  },
  {
    name: 'github',
    label: 'Continue with GitHub',
    icon: 'logos:github-icon',
    onClick: () => handleGitHubSignUp(),
  },
]

const handleSignUp = (data: SignUpData) => {
  console.log('Sign up data:', data)
  // Handle sign up logic
}

const handleAccountLinkClick = () => {
  // Navigate to sign in page
}

SignUp({
  showPasswordStrength: true,
  showConfirmPassword: true,
  showAccountLink: true,
  showNameField: true,
  showTermsAcceptance: true,
  termsLinks,
  socialProviders,
  onSignUp: handleSignUp,
  onAccountLinkClick: handleAccountLinkClick,
  submitText: 'Create Account',
  accountLinkText: 'Sign in instead',
})`
          )
        )
      )
    )
  )
}
