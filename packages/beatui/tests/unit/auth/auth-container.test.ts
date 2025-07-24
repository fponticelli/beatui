// Authentication Container Tests
// Unit tests for the AuthContainer component

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@tempots/dom'
import { AuthContainer } from '../../../src/components/auth/auth-container'
import {
  SignInData,
  SignUpData,
  ResetPasswordData,
} from '../../../src/components/auth/types'

describe('AuthContainer', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with default signin mode', () => {
    const authContainer = AuthContainer({
      onSignIn: vi.fn(),
    })

    render(authContainer, container)

    expect(container.querySelector('.bc-auth-container')).toBeTruthy()
    expect(container.querySelector('.bc-auth-container--signin')).toBeTruthy()
    expect(container.querySelector('.bc-signin-form')).toBeTruthy()
  })

  it('should render with initial signup mode', () => {
    const authContainer = AuthContainer({
      initialMode: 'signup',
      onSignUp: vi.fn(),
    })

    render(authContainer, container)

    expect(container.querySelector('.bc-auth-container--signup')).toBeTruthy()
    expect(container.querySelector('.bc-signup-form')).toBeTruthy()
  })

  it('should render with initial reset-password mode', () => {
    const authContainer = AuthContainer({
      initialMode: 'reset-password',
      onResetPassword: vi.fn(),
    })

    render(authContainer, container)

    expect(
      container.querySelector('.bc-auth-container--reset-password')
    ).toBeTruthy()
    expect(container.querySelector('.bc-reset-password-form')).toBeTruthy()
  })

  it('should call onSignIn when sign in form is submitted', async () => {
    const onSignIn = vi.fn().mockResolvedValue(undefined)
    const authContainer = AuthContainer({
      onSignIn,
    })

    render(authContainer, container)

    // Fill in the form
    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement
    const passwordInput = container.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement
    const submitButton = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement

    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
    expect(submitButton).toBeTruthy()

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('input', { bubbles: true }))

    passwordInput.value = 'password123'
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }))

    // Submit the form
    submitButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    })
  })

  it('should switch modes when mode change is triggered', () => {
    const onModeChange = vi.fn()
    const authContainer = AuthContainer({
      onSignIn: vi.fn(),
      onSignUp: vi.fn(),
      onModeChange,
    })

    render(authContainer, container)

    // Initially should show signin form
    expect(container.querySelector('.bc-signin-form')).toBeTruthy()

    // Click the "Don't have an account? Sign up" link
    const signUpLink = container.querySelector(
      '.bc-auth-form__link'
    ) as HTMLButtonElement
    expect(signUpLink).toBeTruthy()

    signUpLink.click()

    // Should now show signup form
    expect(container.querySelector('.bc-signup-form')).toBeTruthy()
    expect(onModeChange).toHaveBeenCalledWith('signup')
  })

  it('should render social login buttons when providers are configured', () => {
    const authContainer = AuthContainer({
      socialProviders: [
        { provider: 'google', clientId: 'test-google-id' },
        { provider: 'github', clientId: 'test-github-id' },
      ],
      onSignIn: vi.fn(),
      onSocialLogin: vi.fn(),
    })

    render(authContainer, container)

    const socialButtons = container.querySelectorAll('.bc-social-login-button')
    expect(socialButtons).toHaveLength(2)

    expect(
      container.querySelector('.bc-social-login-button--google')
    ).toBeTruthy()
    expect(
      container.querySelector('.bc-social-login-button--github')
    ).toBeTruthy()
  })

  it('should call onSocialLogin when social button is clicked', async () => {
    const onSocialLogin = vi.fn().mockResolvedValue(undefined)
    const authContainer = AuthContainer({
      socialProviders: [{ provider: 'google', clientId: 'test-google-id' }],
      onSignIn: vi.fn(),
      onSocialLogin,
    })

    render(authContainer, container)

    const googleButton = container.querySelector(
      '.bc-social-login-button--google'
    ) as HTMLButtonElement
    expect(googleButton).toBeTruthy()

    googleButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onSocialLogin).toHaveBeenCalledWith('google')
  })

  it('should handle errors gracefully', async () => {
    const onSignIn = vi.fn().mockRejectedValue(new Error('Sign in failed'))
    const authContainer = AuthContainer({
      onSignIn,
    })

    render(authContainer, container)

    // Fill and submit form
    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement
    const passwordInput = container.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement
    const submitButton = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('input', { bubbles: true }))

    passwordInput.value = 'password123'
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }))

    submitButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    // Should show error message
    const errorMessage = container.querySelector('.bc-auth-form__error')
    expect(errorMessage).toBeTruthy()
    expect(errorMessage?.textContent).toContain('Sign in failed')
  })

  it('should apply custom className', () => {
    const authContainer = AuthContainer({
      className: 'custom-auth-class',
      onSignIn: vi.fn(),
    })

    render(authContainer, container)

    const authElement = container.querySelector('.bc-auth-container')
    expect(authElement?.classList.contains('custom-auth-class')).toBe(true)
  })

  it('should disable forms when loading', async () => {
    const onSignIn = vi
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

    const authContainer = AuthContainer({
      onSignIn,
    })

    render(authContainer, container)

    const submitButton = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement
    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement
    const passwordInput = container.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement

    // Fill form
    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('input', { bubbles: true }))

    passwordInput.value = 'password123'
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }))

    // Submit form
    submitButton.click()

    // Should be disabled during loading
    expect(submitButton.disabled).toBe(true)
    expect(emailInput.disabled).toBe(true)
    expect(passwordInput.disabled).toBe(true)

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 150))

    // Should be enabled again
    expect(submitButton.disabled).toBe(false)
    expect(emailInput.disabled).toBe(false)
    expect(passwordInput.disabled).toBe(false)
  })
})
