import {
  attr,
  computedOf,
  Fragment,
  html,
  on,
  TNode,
  Value,
  When,
  Use,
} from '@tempots/dom'
import { z } from 'zod/v4'
import { useForm } from './use-form'
import { TextControl } from './control/text-control'
import { EmailControl } from './control/email-control'
import { PasswordControl } from './control/password-control'
import { CheckboxInput } from './input/checkbox-input'
import { Button } from '../button/button'
import { Stack } from '../layout/stack'
import { BeatUII18n } from '@/beatui-i18n'
import { Anchor } from '@tempots/ui'
import { Icon } from '../data/icon'

export interface SignUpData {
  name?: string
  email: string
  password: string
  confirmPassword?: string
  acceptTerms?: boolean
}

export interface TermsLink {
  text: string
  href: string
}

export interface SocialProvider {
  /** Provider name (e.g., 'google', 'facebook', 'github') */
  name: string
  /** Display label for the button */
  label: string
  /** Iconify icon name */
  icon: string
  /** Callback when provider button is clicked */
  onClick: () => void
  /** Whether this provider is loading */
  loading?: Value<boolean>
  /** Whether this provider is disabled */
  disabled?: Value<boolean>
}

export interface SignUpOptions {
  /** Whether to show password strength indicator (default: true) */
  showPasswordStrength?: Value<boolean>
  /** Whether to show confirm password field (default: true) */
  showConfirmPassword?: Value<boolean>
  /** Whether to show "already have an account" link (default: true) */
  showAccountLink?: Value<boolean>
  /** Whether to show name field (default: true) */
  showNameField?: Value<boolean>
  /** Whether to show terms and conditions acceptance (default: true) */
  showTermsAcceptance?: Value<boolean>
  /** Links to terms and conditions */
  termsLinks?: TermsLink[]
  /** Social sign-up providers */
  socialProviders?: SocialProvider[]
  /** Whether to show divider between social and form signup (default: true) */
  showSocialDivider?: Value<boolean>
  /** Callback when sign up is submitted */
  onSignUp?: (data: SignUpData) => void
  /** Callback when account link is clicked */
  onAccountLinkClick?: () => void
  /** Custom submit button text */
  submitText?: Value<string>
  /** Custom account link text */
  accountLinkText?: Value<string>
  /** Whether the form is loading/submitting */
  loading?: Value<boolean>
  /** Whether the form is disabled */
  disabled?: Value<boolean>
}

export const SignUp = (options: SignUpOptions = {}) => {
  const {
    showPasswordStrength = true,
    showConfirmPassword = true,
    showAccountLink = true,
    showNameField = true,
    showTermsAcceptance = true,
    termsLinks = [],
    socialProviders = [],
    showSocialDivider = true,
    onSignUp,
    onAccountLinkClick,
    submitText,
    accountLinkText,
    loading = false,
    disabled = false,
  } = options

  return Use(BeatUII18n, t => {
    // Create dynamic schema based on options
    const createSchema = () => {
      let schema: any = {
        email: z.string().email(),
        password: z.string().min(8),
      }

      if (Value.get(showNameField)) {
        schema.name = z.string().min(1)
      }

      if (Value.get(showConfirmPassword)) {
        schema.confirmPassword = z.string().min(8)
      }

      if (Value.get(showTermsAcceptance)) {
        schema.acceptTerms = z.boolean().refine(val => val === true, {
          message: 'You must accept the terms and conditions',
        })
      }

      const baseSchema = z.object(schema)

      // Add password confirmation validation if enabled
      if (Value.get(showConfirmPassword)) {
        return baseSchema.refine(
          data => data.password === data.confirmPassword,
          {
            message: 'Passwords do not match',
            path: ['confirmPassword'],
          }
        )
      }

      return baseSchema
    }

    const controller = useForm({
      schema: createSchema(),
      defaultValue: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
      },
    })

    const handleSubmit = () => {
      const formData = controller.value.get()
      if (controller.status.get().type === 'Valid') {
        onSignUp?.(formData)
      }
    }

    const renderPasswordStrength = () => {
      if (!Value.get(showPasswordStrength)) return Fragment()
      
      const password = controller.field('password').value
      return computedOf(password)(pwd => {
        if (!pwd) return Fragment()
        
        const strength = calculatePasswordStrength(pwd)
        const strengthClass = `bc-password-strength bc-password-strength--${strength.level}`
        
        return html.div(
          attr.class('bc-password-strength-container'),
          html.div(
            attr.class(strengthClass),
            html.div(attr.class('bc-password-strength__bar')),
            html.span(
              attr.class('bc-password-strength__text'),
              strength.text
            )
          )
        )
      })
    }

    const renderTermsLinks = () => {
      if (termsLinks.length === 0) return Fragment()

      return html.div(
        attr.class('bc-signup__terms-links'),
        ...termsLinks.map((link, index) =>
          Fragment(
            index > 0 ? html.span(' • ') : Fragment(),
            Anchor(
              { href: link.href, target: '_blank' },
              attr.class('bc-signup__terms-link'),
              link.text
            )
          )
        )
      )
    }

    const renderSocialProviders = () => {
      if (socialProviders.length === 0) return Fragment()

      return html.div(
        attr.class('bc-signup__social-section'),
        html.div(
          attr.class('bc-signup__social-providers'),
          ...socialProviders.map(provider =>
            Button(
              {
                variant: 'outline',
                loading: provider.loading,
                disabled: computedOf(
                  disabled,
                  provider.disabled ?? false
                )((disabled, providerDisabled) => disabled || providerDisabled),
                onClick: provider.onClick,
              },
              attr.class('bc-signup__social-button'),
              Icon({ icon: provider.icon }),
              html.span(provider.label)
            )
          )
        )
      )
    }

    const renderSocialDivider = () => {
      if (socialProviders.length === 0 || !Value.get(showSocialDivider)) {
        return Fragment()
      }

      return html.div(
        attr.class('bc-signup__divider'),
        html.span(
          attr.class('bc-signup__divider-text'),
          t.orContinueWith()
        )
      )
    }

    return html.form(
      attr.class('bc-signup'),
      on.submit(e => {
        e.preventDefault()
        handleSubmit()
      }),
      Stack(
        attr.class('bc-signup__fields'),

        // Social providers
        renderSocialProviders(),

        // Divider
        renderSocialDivider(),

        // Name field
        When(
          showNameField,
          () => TextControl({
            controller: controller.field('name'),
            label: t.name(),
            placeholder: t.enterYourName(),
            disabled,
          })
        ),

        // Email field
        EmailControl({
          controller: controller.field('email'),
          label: t.email(),
          disabled,
        }),

        // Password field
        PasswordControl({
          controller: controller.field('password'),
          label: t.password(),
          disabled,
        }),

        // Password strength indicator
        renderPasswordStrength(),

        // Confirm password field
        When(
          showConfirmPassword,
          () => PasswordControl({
            controller: controller.field('confirmPassword'),
            label: t.confirmPassword(),
            placeholder: t.confirmYourPassword(),
            disabled,
          })
        ),

        // Terms and conditions
        When(
          showTermsAcceptance,
          () => Stack(
            CheckboxInput({
              value: controller.field('acceptTerms').value,
              onChange: (value) => controller.field('acceptTerms').change(value),
              placeholder: t.acceptTermsAndConditions(),
              disabled,
            }),
            renderTermsLinks()
          )
        ),

        // Submit button
        Button(
          {
            type: 'submit',
            variant: 'filled',
            color: 'primary',
            loading,
            disabled: computedOf(
              disabled,
              controller.status
            )((disabled, status) => disabled || status.type !== 'Valid'),
            onClick: handleSubmit,
          },
          submitText ?? t.signUp()
        ),

        // Account link
        When(
          showAccountLink,
          () => html.div(
            attr.class('bc-signup__account-link'),
            html.span(t.alreadyHaveAccount()),
            html.button(
              attr.type('button'),
              attr.class('bc-signup__link-button'),
              attr.disabled(disabled),
              onAccountLinkClick ? on.click(onAccountLinkClick) : Fragment(),
              accountLinkText ?? t.signIn()
            )
          )
        )
      )
    )
  })
}

// Helper function to calculate password strength
function calculatePasswordStrength(password: string): { level: string; text: string } {
  let score = 0
  
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  if (score < 3) return { level: 'weak', text: 'Weak' }
  if (score < 5) return { level: 'medium', text: 'Medium' }
  return { level: 'strong', text: 'Strong' }
}
