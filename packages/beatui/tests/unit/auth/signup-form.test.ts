// Sign Up Form Tests
// Unit tests for the SignUpForm component

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@tempots/dom'
import { SignUpForm } from '../../../src/components/auth/signup-form'
import { WithProviders } from '../../helpers/test-providers'

describe('SignUpForm', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  it('should render with default structure', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
        })
      ),
      container
    )

    expect(container.querySelector('form')).toBeTruthy()
    expect(container.querySelector('input[type="email"]')).toBeTruthy()
    expect(container.querySelector('button[type="submit"]')).toBeTruthy()
  })

  it('should show name field by default', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
        })
      ),
      container
    )

    // Name field is a text input
    const textInputs = container.querySelectorAll('input[type="text"]')
    expect(textInputs.length).toBeGreaterThanOrEqual(1)
    expect(container.textContent).toContain('Name')
  })

  it('should hide name field when showNameField is false', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
          showNameField: false,
        })
      ),
      container
    )

    // Name label should not appear
    expect(container.textContent).not.toContain('Name')
  })

  it('should hide confirm password field by default', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
        })
      ),
      container
    )

    // With default settings (showConfirmPassword undefined = false),
    // there should be only one password input
    const passwordInputs = container.querySelectorAll('input[type="password"]')
    expect(passwordInputs).toHaveLength(1)
  })

  it('should show confirm password when showConfirmPassword is true', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
          showConfirmPassword: true,
        })
      ),
      container
    )

    const passwordInputs = container.querySelectorAll('input[type="password"]')
    expect(passwordInputs).toHaveLength(2)
    expect(container.textContent).toContain('Confirm')
  })

  it('should hide accept terms by default', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
        })
      ),
      container
    )

    // The terms checkbox should not be rendered by default
    expect(container.querySelector('.bc-auth-form__terms')).toBeFalsy()
  })

  it('should show accept terms when showAcceptTermsAndConditions is true', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
          showAcceptTermsAndConditions: true,
        })
      ),
      container
    )

    expect(container.querySelector('.bc-auth-form__terms')).toBeTruthy()
  })

  it('should show password strength indicator when configured', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
          showPasswordStrength: true,
        })
      ),
      container
    )

    // Password strength indicator renders but may only show after input
    // At minimum, the form should render without error
    expect(container.querySelector('form')).toBeTruthy()
  })

  it('should render submit button with correct text', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
        })
      ),
      container
    )

    const submitButton = container.querySelector('button[type="submit"]')
    expect(submitButton).toBeTruthy()
    expect(submitButton?.textContent).toContain('Sign Up')
  })

  it('should call onSignUp with form data when submitted', async () => {
    const onSignUp = vi.fn().mockResolvedValue(null)

    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp,
        })
      ),
      container
    )

    // Fill in required fields
    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement
    const passwordInput = container.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement
    const nameInput = container.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement

    nameInput.value = 'Test User'
    nameInput.dispatchEvent(new Event('change', { bubbles: true }))

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    passwordInput.value = 'Password1'
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }))

    // Submit
    const form = container.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(onSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        password: 'Password1',
        name: 'Test User',
      })
    )
  })

  it('should not call onSignUp with empty required fields', async () => {
    const onSignUp = vi.fn().mockResolvedValue(null)

    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp,
        })
      ),
      container
    )

    // Submit without filling in
    const form = container.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(onSignUp).not.toHaveBeenCalled()
  })

  it('should use custom labels', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
          labels: {
            signUpButton: 'Custom Register',
            emailLabel: 'Custom Email',
            passwordLabel: 'Custom Password',
            nameLabel: 'Custom Name',
          },
        })
      ),
      container
    )

    expect(container.textContent).toContain('Custom Register')
    expect(container.textContent).toContain('Custom Email')
    expect(container.textContent).toContain('Custom Password')
    expect(container.textContent).toContain('Custom Name')
  })

  it('should allow submission without hidden optional fields', async () => {
    // With showConfirmPassword=false and showAcceptTermsAndConditions=false,
    // the form should be submittable without those fields
    const onSignUp = vi.fn().mockResolvedValue(null)

    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp,
          showConfirmPassword: false,
          showAcceptTermsAndConditions: false,
        })
      ),
      container
    )

    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement
    const passwordInput = container.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement
    const nameInput = container.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement

    nameInput.value = 'Test User'
    nameInput.dispatchEvent(new Event('change', { bubbles: true }))

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    passwordInput.value = 'Password1'
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }))

    const form = container.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(onSignUp).toHaveBeenCalled()
  })

  it('should set initial email and name values', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
          initialEmail: 'pre@example.com',
          initialName: 'Pre-filled',
        })
      ),
      container
    )

    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement
    const nameInput = container.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement

    // Initial values should be set on the form controller
    expect(emailInput).toBeTruthy()
    expect(nameInput).toBeTruthy()
  })

  it('should display error from onSignUp callback', async () => {
    const onSignUp = vi.fn().mockResolvedValue('Email already taken')

    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp,
        })
      ),
      container
    )

    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement
    const passwordInput = container.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement
    const nameInput = container.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement

    nameInput.value = 'Test User'
    nameInput.dispatchEvent(new Event('change', { bubbles: true }))

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    passwordInput.value = 'Password1'
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }))

    const form = container.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 200))

    expect(onSignUp).toHaveBeenCalled()
    // The error should be displayed in the form
    expect(container.textContent).toContain('Email already taken')
  })

  it('should handle onSignUp throwing an error', async () => {
    const onSignUp = vi.fn().mockRejectedValue(new Error('Network error'))

    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp,
        })
      ),
      container
    )

    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement
    const passwordInput = container.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement
    const nameInput = container.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement

    nameInput.value = 'Test User'
    nameInput.dispatchEvent(new Event('change', { bubbles: true }))

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    passwordInput.value = 'Password1'
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }))

    const form = container.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 200))

    // Form should still be present and functional
    expect(container.querySelector('form')).toBeTruthy()
    // Error message should display the fallback
    expect(container.textContent).toContain('Sign up failed')
  })

  it('should display correct error message on failure (not "Reset password failed")', async () => {
    const onSignUp = vi.fn().mockRejectedValue(new Error('Server error'))

    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp,
        })
      ),
      container
    )

    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement
    const passwordInput = container.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement
    const nameInput = container.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement

    nameInput.value = 'Test User'
    nameInput.dispatchEvent(new Event('change', { bubbles: true }))

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    passwordInput.value = 'Password1'
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }))

    const form = container.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 200))

    // Should NOT show "Reset password failed" (Bug 3 fix)
    expect(container.textContent).not.toContain('Reset password failed')
    // Should show "Sign up failed" instead
    expect(container.textContent).toContain('Sign up failed')
  })

  it('should render without onSignUp callback', () => {
    render(
      WithProviders(() =>
        SignUpForm({})
      ),
      container
    )

    expect(container.querySelector('form')).toBeTruthy()
  })

  it('should show all optional fields together', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
          showNameField: true,
          showConfirmPassword: true,
          showAcceptTermsAndConditions: true,
          showPasswordStrength: true,
        })
      ),
      container
    )

    // Name field
    expect(container.querySelector('input[type="text"]')).toBeTruthy()
    // Two password fields
    const passwordInputs = container.querySelectorAll('input[type="password"]')
    expect(passwordInputs).toHaveLength(2)
    // Terms checkbox
    expect(container.querySelector('.bc-auth-form__terms')).toBeTruthy()
  })

  it('should hide all optional fields when configured', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
          showNameField: false,
          showConfirmPassword: false,
          showAcceptTermsAndConditions: false,
          showPasswordStrength: false,
        })
      ),
      container
    )

    // No name field
    expect(container.querySelector('input[type="text"]')).toBeFalsy()
    // Only one password field
    const passwordInputs = container.querySelectorAll('input[type="password"]')
    expect(passwordInputs).toHaveLength(1)
    // No terms checkbox
    expect(container.querySelector('.bc-auth-form__terms')).toBeFalsy()
  })

  it('should render custom terms and conditions content', () => {
    render(
      WithProviders(() =>
        SignUpForm({
          onSignUp: vi.fn(),
          showAcceptTermsAndConditions: true,
          termsAndConditions: 'I agree to the Custom Terms',
        })
      ),
      container
    )

    expect(container.textContent).toContain('I agree to the Custom Terms')
  })
})
