// Password Strength Indicator Tests
// Unit tests for the PasswordStrengthIndicator component

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import {
  PasswordStrengthIndicator,
  PasswordStrengthBar,
  PasswordStrengthText,
} from '../../../src/components/auth/password-strength-indicator'
import { defaultPasswordRules } from '../../../src/components/auth/utils'

describe('PasswordStrengthIndicator', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with default structure', () => {
    const password = prop('')
    const indicator = PasswordStrengthIndicator({
      password,
      rules: defaultPasswordRules,
      showLabel: true,
    })

    render(indicator, container)

    expect(container.querySelector('.bc-password-strength')).toBeTruthy()
    expect(container.querySelector('.bc-password-strength__bar')).toBeTruthy()
    expect(container.querySelector('.bc-password-strength__fill')).toBeTruthy()
    expect(container.querySelector('.bc-password-strength__label')).toBeTruthy()
    expect(
      container.querySelector('.bc-password-strength__requirements')
    ).toBeTruthy()
  })

  it('should show weak strength for empty password', () => {
    const password = prop('')
    const indicator = PasswordStrengthIndicator({
      password,
      rules: defaultPasswordRules,
      showLabel: true,
    })

    render(indicator, container)

    expect(container.querySelector('.bc-password-strength--weak')).toBeTruthy()
    const fill = container.querySelector(
      '.bc-password-strength__fill'
    ) as HTMLElement
    expect(fill.style.width).toBe('0%')
  })

  it('should update strength when password changes', async () => {
    const password = prop('weak')
    const indicator = PasswordStrengthIndicator({
      password,
      rules: defaultPasswordRules,
      showLabel: true,
    })

    render(indicator, container)

    // Initially weak
    expect(container.querySelector('.bc-password-strength--weak')).toBeTruthy()

    // Update to strong password
    password.set('StrongPassword123!')

    // Wait for signal updates to be processed
    await new Promise(resolve => setTimeout(resolve, 10))

    // Should update to strong
    expect(
      container.querySelector('.bc-password-strength--strong')
    ).toBeTruthy()
    const fill = container.querySelector(
      '.bc-password-strength__fill'
    ) as HTMLElement
    expect(parseInt(fill.style.width)).toBeGreaterThan(80)
  })

  it('should show requirements checklist', () => {
    const password = prop('Test123!')
    const indicator = PasswordStrengthIndicator({
      password,
      rules: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
      },
      showLabel: true,
    })

    render(indicator, container)

    const requirements = container.querySelectorAll(
      '.bc-password-strength__requirement'
    )
    expect(requirements.length).toBe(5) // 5 requirements

    // Check that some requirements are met
    const metRequirements = container.querySelectorAll(
      '.bc-password-strength__requirement--met'
    )
    expect(metRequirements.length).toBeGreaterThan(0)
  })

  it('should hide label when showLabel is false', () => {
    const password = prop('test')
    const indicator = PasswordStrengthIndicator({
      password,
      rules: defaultPasswordRules,
      showLabel: false,
    })

    render(indicator, container)

    expect(container.querySelector('.bc-password-strength__label')).toBeFalsy()
  })

  it('should apply custom className', () => {
    const password = prop('test')
    const indicator = PasswordStrengthIndicator({
      password,
      rules: defaultPasswordRules,
      className: 'custom-strength-class',
    })

    render(indicator, container)

    const element = container.querySelector('.bc-password-strength')
    expect(element?.classList.contains('custom-strength-class')).toBe(true)
  })

  it('should handle custom password rules', () => {
    const password = prop('CustomPassword123!')
    const indicator = PasswordStrengthIndicator({
      password,
      rules: {
        minLength: 16,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: false, // Don't require symbols
      },
      showLabel: true,
    })

    render(indicator, container)

    const requirements = container.querySelectorAll(
      '.bc-password-strength__requirement'
    )
    expect(requirements.length).toBe(3) // Only 3 requirements (no symbols requirement)
  })
})

describe('PasswordStrengthBar', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render simplified bar', () => {
    const password = prop('test')
    const bar = PasswordStrengthBar({
      password,
      rules: defaultPasswordRules,
    })

    render(bar, container)

    expect(container.querySelector('.bc-password-strength-bar')).toBeTruthy()
    expect(
      container.querySelector('.bc-password-strength-bar__fill')
    ).toBeTruthy()
    expect(container.querySelector('.bc-password-strength__label')).toBeFalsy()
    expect(
      container.querySelector('.bc-password-strength__requirements')
    ).toBeFalsy()
  })

  it('should update bar width based on password strength', async () => {
    const password = prop('')
    const bar = PasswordStrengthBar({
      password,
      rules: defaultPasswordRules,
    })

    render(bar, container)

    const fill = container.querySelector(
      '.bc-password-strength-bar__fill'
    ) as HTMLElement
    expect(fill.style.width).toBe('0%')

    password.set('StrongPassword123!')

    // Wait for signal updates to be processed
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(parseInt(fill.style.width)).toBeGreaterThan(80)
  })
})

describe('PasswordStrengthText', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render text indicator', () => {
    const password = prop('test')
    const text = PasswordStrengthText({
      password,
      rules: defaultPasswordRules,
    })

    render(text, container)

    expect(container.querySelector('.bc-password-strength-text')).toBeTruthy()
    expect(container.textContent).toBeTruthy()
  })

  it('should show correct strength labels', async () => {
    const password = prop('')
    const text = PasswordStrengthText({
      password,
      rules: defaultPasswordRules,
    })

    render(text, container)

    // Empty password should be weak
    expect(container.textContent).toContain('Weak')
    expect(
      container.querySelector('.bc-password-strength-text--weak')
    ).toBeTruthy()

    // Strong password
    password.set('VeryStrongPassword123!')

    // Wait for signal updates to be processed
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(container.textContent).toContain('Strong')
    expect(
      container.querySelector('.bc-password-strength-text--strong')
    ).toBeTruthy()
  })

  it('should apply custom className', () => {
    const password = prop('test')
    const text = PasswordStrengthText({
      password,
      rules: defaultPasswordRules,
      className: 'custom-text-class',
    })

    render(text, container)

    const element = container.querySelector('.bc-password-strength-text')
    expect(element?.classList.contains('custom-text-class')).toBe(true)
  })
})
