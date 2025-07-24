// Password Strength Indicator Component
// Visual feedback component for password complexity and security requirements

import { attr, computedOf, html, TNode, When } from '@tempots/dom'
import {
  PasswordStrengthIndicatorOptions,
  defaultAuthLabels,
  defaultPasswordRules,
} from './index'
import { calculatePasswordStrength } from './schemas'

export function PasswordStrengthIndicator({
  password,
  rules = defaultPasswordRules,
  showLabel = true,
  className,
}: PasswordStrengthIndicatorOptions): TNode {
  const labels = defaultAuthLabels

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

  // Get strength label
  const strengthLabel = computedOf(strength)(str => {
    switch (str) {
      case 'weak':
        return labels.passwordStrengthWeak
      case 'fair':
        return labels.passwordStrengthFair
      case 'good':
        return labels.passwordStrengthGood
      case 'strong':
        return labels.passwordStrengthStrong
      default:
        return labels.passwordStrengthWeak
    }
  })

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
      html.div(attr.class('bc-password-strength__label'), strengthLabel)
    ),

    // Requirements checklist
    html.div(
      attr.class('bc-password-strength__requirements'),

      // Length requirement
      When(rules.minLength !== undefined, () =>
        html.div(
          attr.class('bc-password-strength__requirement'),
          attr.class(
            computedOf(checks)(c =>
              c.length ? 'bc-password-strength__requirement--met' : ''
            ) as any
          ),
          html.span(
            attr.class('bc-password-strength__requirement-icon'),
            computedOf(checks)(c => (c.length ? '✓' : '○')) as any
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
            computedOf(checks)(c =>
              c.uppercase ? 'bc-password-strength__requirement--met' : ''
            ) as any
          ),
          html.span(
            attr.class('bc-password-strength__requirement-icon'),
            computedOf(checks)(c => (c.uppercase ? '✓' : '○')) as any
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
            computedOf(checks)(c =>
              c.lowercase ? 'bc-password-strength__requirement--met' : ''
            ) as any
          ),
          html.span(
            attr.class('bc-password-strength__requirement-icon'),
            computedOf(checks)(c => (c.lowercase ? '✓' : '○')) as any
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
            computedOf(checks)(c =>
              c.numbers ? 'bc-password-strength__requirement--met' : ''
            ) as any
          ),
          html.span(
            attr.class('bc-password-strength__requirement-icon'),
            computedOf(checks)(c => (c.numbers ? '✓' : '○')) as any
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
            computedOf(checks)(c =>
              c.symbols ? 'bc-password-strength__requirement--met' : ''
            ) as any
          ),
          html.span(
            attr.class('bc-password-strength__requirement-icon'),
            computedOf(checks)(c => (c.symbols ? '✓' : '○')) as any
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
}: Omit<PasswordStrengthIndicatorOptions, 'showLabel'>): TNode {
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
  const labels = defaultAuthLabels

  const strength = computedOf(password)(pwd => {
    if (!pwd || pwd.length === 0) {
      return 'weak' as const
    }
    return calculatePasswordStrength(pwd, rules).strength
  })

  const strengthLabel = computedOf(strength)(str => {
    switch (str) {
      case 'weak':
        return labels.passwordStrengthWeak
      case 'fair':
        return labels.passwordStrengthFair
      case 'good':
        return labels.passwordStrengthGood
      case 'strong':
        return labels.passwordStrengthStrong
      default:
        return labels.passwordStrengthWeak
    }
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

  return html.span(attr.class(containerClasses), strengthLabel)
}
