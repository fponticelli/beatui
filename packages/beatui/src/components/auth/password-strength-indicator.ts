// Password Strength Indicator Component
// Visual feedback component for password complexity and security requirements

import {
  attr,
  computedOf,
  html,
  Renderable,
  TNode,
  Use,
  When,
} from '@tempots/dom'
import { PasswordStrengthIndicatorOptions, defaultPasswordRules } from './index'
import { calculatePasswordStrength } from './schemas'
import { AuthI18n } from '@/auth-i18n/translations'

export function PasswordStrengthIndicator({
  password,
  rules = defaultPasswordRules,
  showLabel = true,
  className,
}: PasswordStrengthIndicatorOptions): Renderable {
  // Calculate password strength reactively
  const strengthData = computedOf(password)(pwd => {
    if (!pwd || pwd.length === 0) {
      return {
        strength: 'weak' as const,
        score: 0,
        checks: {
          length: false,
          uppercase: false,
          lowercase: false,
          numbers: false,
          symbols: false,
          custom: false,
        },
      }
    }
    return calculatePasswordStrength(pwd, rules)
  })

  const strength = strengthData.map(data => data.strength)
  const score = strengthData.map(data => data.score)
  const checks = strengthData.map(data => data.checks)

  // Generate CSS classes
  const containerClasses = computedOf(
    strength,
    className
  )((str, cls) => {
    const classes = [
      'bc-password-strength',
      `bc-password-strength--${str}`,
      cls,
    ].filter(Boolean)
    return classes.join(' ')
  })

  return html.div(
    attr.class(containerClasses),

    // Strength bar
    html.div(
      attr.class('bc-password-strength__bar'),
      html.div(
        attr.class('bc-password-strength__fill'),
        attr.style(score.map(s => `width: ${s}%`))
      )
    ),

    // Strength label (optional)
    When(showLabel, () =>
      Use(AuthI18n, t =>
        html.div(
          attr.class('bc-password-strength__label'),
          computedOf(
            strength,
            t
          )((str, t) => {
            switch (str) {
              case 'weak':
                return t.passwordStrengthWeak
              case 'fair':
                return t.passwordStrengthFair
              case 'good':
                return t.passwordStrengthGood
              case 'strong':
                return t.passwordStrengthStrong
              default:
                return t.passwordStrengthWeak
            }
          })
        )
      )
    ),

    // Requirements checklist
    html.div(
      attr.class('bc-password-strength__requirements'),

      // Length requirement
      When(rules.minLength !== undefined, () =>
        html.div(
          attr.class('bc-password-strength__requirement'),
          attr.class(
            computedOf(checks)((c): string =>
              c.length ? 'bc-password-strength__requirement--met' : ''
            )
          ),
          html.span(
            attr.class('bc-password-strength__requirement-icon'),
            computedOf(checks)((c): string => (c.length ? '✓' : '○'))
          ),
          html.span(
            attr.class('bc-password-strength__requirement-text'),
            `At least ${rules.minLength} characters`
          )
        )
      ),

      // Uppercase requirement
      When(rules.requireUppercase === true, () =>
        html.div(
          attr.class('bc-password-strength__requirement'),
          attr.class(
            computedOf(checks)((c): string =>
              c.uppercase ? 'bc-password-strength__requirement--met' : ''
            )
          ),
          html.span(
            attr.class('bc-password-strength__requirement-icon'),
            computedOf(checks)((c): string => (c.uppercase ? '✓' : '○'))
          ),
          html.span(
            attr.class('bc-password-strength__requirement-text'),
            'One uppercase letter'
          )
        )
      ),

      // Lowercase requirement
      When(rules.requireLowercase === true, () =>
        html.div(
          attr.class('bc-password-strength__requirement'),
          attr.class(
            computedOf(checks)((c): string =>
              c.lowercase ? 'bc-password-strength__requirement--met' : ''
            )
          ),
          html.span(
            attr.class('bc-password-strength__requirement-icon'),
            computedOf(checks)((c): string => (c.lowercase ? '✓' : '○'))
          ),
          html.span(
            attr.class('bc-password-strength__requirement-text'),
            'One lowercase letter'
          )
        )
      ),

      // Numbers requirement
      When(rules.requireNumbers === true, () =>
        html.div(
          attr.class('bc-password-strength__requirement'),
          attr.class(
            computedOf(checks)((c): string =>
              c.numbers ? 'bc-password-strength__requirement--met' : ''
            )
          ),
          html.span(
            attr.class('bc-password-strength__requirement-icon'),
            computedOf(checks)((c): string => (c.numbers ? '✓' : '○'))
          ),
          html.span(
            attr.class('bc-password-strength__requirement-text'),
            'One number'
          )
        )
      ),

      // Symbols requirement
      When(rules.requireSymbols === true, () =>
        html.div(
          attr.class('bc-password-strength__requirement'),
          attr.class(
            computedOf(checks)((c): string =>
              c.symbols ? 'bc-password-strength__requirement--met' : ''
            )
          ),
          html.span(
            attr.class('bc-password-strength__requirement-icon'),
            computedOf(checks)((c): string => (c.symbols ? '✓' : '○'))
          ),
          html.span(
            attr.class('bc-password-strength__requirement-text'),
            'One special character'
          )
        )
      )
    )
  )
}

// Simplified password strength indicator (just the bar)
export function PasswordStrengthBar({
  password,
  rules = defaultPasswordRules,
  className,
}: Omit<PasswordStrengthIndicatorOptions, 'showLabel'>): Renderable {
  const strengthData = computedOf(password)(pwd => {
    if (!pwd || pwd.length === 0) {
      return { strength: 'weak' as const, score: 0 }
    }
    return calculatePasswordStrength(pwd, rules)
  })

  const strength = strengthData.map(data => data.strength)
  const score = strengthData.map(data => data.score)

  const containerClasses = computedOf(
    strength,
    className
  )((str, cls) => {
    const classes = [
      'bc-password-strength-bar',
      `bc-password-strength-bar--${str}`,
      cls,
    ].filter(Boolean)
    return classes.join(' ')
  })

  return html.div(
    attr.class(containerClasses),
    html.div(
      attr.class('bc-password-strength-bar__fill'),
      attr.style(score.map(s => `width: ${s}%`))
    )
  )
}

// Password strength text indicator
export function PasswordStrengthText({
  password,
  rules = defaultPasswordRules,
  className,
}: Omit<PasswordStrengthIndicatorOptions, 'showLabel'>): TNode {
  const strength = computedOf(password)(pwd => {
    if (!pwd || pwd.length === 0) {
      return 'weak' as const
    }
    return calculatePasswordStrength(pwd, rules).strength
  })

  const containerClasses = computedOf(
    strength,
    className
  )((str, cls) => {
    const classes = [
      'bc-password-strength-text',
      `bc-password-strength-text--${str}`,
      cls,
    ].filter(Boolean)
    return classes.join(' ')
  })

  return Use(AuthI18n, t =>
    html.span(
      attr.class(containerClasses),
      computedOf(
        strength,
        t
      )((str, t) => {
        switch (str) {
          case 'weak':
            return t.passwordStrengthWeak
          case 'fair':
            return t.passwordStrengthFair
          case 'good':
            return t.passwordStrengthGood
          case 'strong':
            return t.passwordStrengthStrong
          default:
            return t.passwordStrengthWeak
        }
      })
    )
  )
}
