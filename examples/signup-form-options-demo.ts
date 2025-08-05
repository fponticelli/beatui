// SignUpForm Options Demo
// Demonstrates the new conditional rendering options for SignUpForm

import { html, signal } from '@tempots/dom'
import { SignUpForm } from '../packages/beatui/src/components/auth/signup-form'

// Create reactive signals for the options
const showNameField = signal(true)
const showConfirmPassword = signal(true)
const showAcceptTermsAndConditions = signal(true)
const showAlreadyHaveAccountLink = signal(true)

// Custom terms and conditions content
const customTerms = html.span(
  'I agree to the ',
  html.a(
    { href: '/terms', target: '_blank' },
    'Terms of Service'
  ),
  ' and ',
  html.a(
    { href: '/privacy', target: '_blank' },
    'Privacy Policy'
  )
)

// Demo form with all options
export function SignUpFormOptionsDemo() {
  return html.div(
    { style: 'max-width: 400px; margin: 0 auto; padding: 2rem;' },
    
    html.h1('SignUpForm Options Demo'),
    
    // Controls to toggle options
    html.div(
      { style: 'margin-bottom: 2rem; padding: 1rem; border: 1px solid #ccc; border-radius: 4px;' },
      html.h3('Options'),
      
      html.label(
        { style: 'display: block; margin-bottom: 0.5rem;' },
        html.input({
          type: 'checkbox',
          checked: showNameField,
          onchange: (e: Event) => showNameField.set((e.target as HTMLInputElement).checked)
        }),
        ' Show Name Field'
      ),
      
      html.label(
        { style: 'display: block; margin-bottom: 0.5rem;' },
        html.input({
          type: 'checkbox',
          checked: showConfirmPassword,
          onchange: (e: Event) => showConfirmPassword.set((e.target as HTMLInputElement).checked)
        }),
        ' Show Confirm Password'
      ),
      
      html.label(
        { style: 'display: block; margin-bottom: 0.5rem;' },
        html.input({
          type: 'checkbox',
          checked: showAcceptTermsAndConditions,
          onchange: (e: Event) => showAcceptTermsAndConditions.set((e.target as HTMLInputElement).checked)
        }),
        ' Show Accept Terms & Conditions'
      ),
      
      html.label(
        { style: 'display: block; margin-bottom: 0.5rem;' },
        html.input({
          type: 'checkbox',
          checked: showAlreadyHaveAccountLink,
          onchange: (e: Event) => showAlreadyHaveAccountLink.set((e.target as HTMLInputElement).checked)
        }),
        ' Show "Already Have Account" Link'
      )
    ),
    
    // The actual SignUpForm with conditional options
    SignUpForm({
      // Required handlers
      onSubmit: async (data) => {
        console.log('Form submitted:', data)
        alert('Form submitted! Check console for data.')
      },
      
      onModeChange: (mode) => {
        console.log('Mode changed to:', mode)
        alert(`Mode changed to: ${mode}`)
      },
      
      // Conditional rendering options
      showNameField,
      showConfirmPassword,
      showAcceptTermsAndConditions,
      showAlreadyHaveAccountLink,
      
      // Custom terms and conditions content
      termsAndConditions: customTerms,
      
      // Optional: Custom labels
      labels: {
        signUpTitle: () => 'Create Your Account',
        nameLabel: () => 'Full Name',
        emailLabel: () => 'Email Address',
        passwordLabel: () => 'Password',
        confirmPasswordLabel: () => 'Confirm Password',
        acceptTermsLabel: () => 'I accept the terms and conditions',
        signUpButton: () => 'Create Account',
        hasAccountLink: () => 'Already have an account? Sign in'
      }
    }),
    
    // Usage instructions
    html.div(
      { style: 'margin-top: 2rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;' },
      html.h3('Usage'),
      html.p('Toggle the checkboxes above to see how the form changes dynamically.'),
      html.ul(
        html.li(html.strong('showNameField'), ': Controls whether the name field is displayed'),
        html.li(html.strong('showConfirmPassword'), ': Controls whether the confirm password field is displayed'),
        html.li(html.strong('showAcceptTermsAndConditions'), ': Controls whether the terms acceptance checkbox is displayed'),
        html.li(html.strong('showAlreadyHaveAccountLink'), ': Controls whether the "already have account" link is displayed'),
        html.li(html.strong('termsAndConditions'), ': Allows custom content for the terms acceptance label')
      )
    )
  )
}
