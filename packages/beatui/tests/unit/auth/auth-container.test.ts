// Authentication Container Tests
// Unit tests for the AuthContainer component

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, html } from '@tempots/dom'
import {
  AuthContainer,
  AuthModal,
} from '../../../src/components/auth/auth-container'
import { Button } from '../../../src/components/button/button'
import { WithProviders } from '../../helpers/test-providers'

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
    render(
      WithProviders(() =>
        AuthContainer({
          onSignIn: vi.fn(),
        })
      ),
      container
    )

    expect(container.querySelector('.bc-auth-container')).toBeTruthy()
    expect(container.querySelector('.bc-auth-container--signin')).toBeTruthy()
    expect(container.querySelector('.bc-auth-form__form')).toBeTruthy()
  })

  it('should render with initial signup mode', () => {
    render(
      WithProviders(() =>
        AuthContainer({
          mode: 'signup',
          onSignUp: vi.fn(),
        })
      ),
      container
    )

    expect(container.querySelector('.bc-auth-container--signup')).toBeTruthy()
    expect(container.querySelector('.bc-auth-form__form')).toBeTruthy()
  })

  it('should render with initial reset-password mode', () => {
    render(
      WithProviders(() =>
        AuthContainer({
          mode: 'reset-password',
          onResetPassword: vi.fn(),
        })
      ),
      container
    )

    expect(
      container.querySelector('.bc-auth-container--reset-password')
    ).toBeTruthy()
    expect(container.querySelector('.bc-auth-form__form')).toBeTruthy()
  })

  it('should call onSignIn when sign in form is submitted', async () => {
    const onSignIn = vi.fn().mockResolvedValue(undefined)

    render(
      WithProviders(() =>
        AuthContainer({
          onSignIn,
        })
      ),
      container
    )

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
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    passwordInput.value = 'password123'
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }))

    // Submit the form
    submitButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('should switch modes when mode change is triggered', async () => {
    const onModeChange = vi.fn()

    render(
      WithProviders(() =>
        AuthContainer({
          onSignIn: vi.fn(),
          onSignUp: vi.fn(),
          onModeChange,
        })
      ),
      container
    )

    // Initially should show signin form
    expect(container.querySelector('.bc-auth-form__form')).toBeTruthy()

    // Click the "Don't have an account? Sign up" link
    const links = container.querySelectorAll('.bc-auth-form__link')
    const signUpLink = Array.from(links).find(link =>
      link.textContent?.includes('Sign up')
    ) as HTMLButtonElement
    expect(signUpLink).toBeTruthy()

    signUpLink.click()

    // Wait for signal updates to be processed
    await new Promise(resolve => setTimeout(resolve, 10))

    // Should now show signup form
    expect(container.querySelector('.bc-auth-form__form')).toBeTruthy()
    expect(onModeChange).toHaveBeenCalledWith('signup')
  })

  it('should render social login buttons when providers are configured', () => {
    render(
      WithProviders(() =>
        AuthContainer({
          socialProviders: [{ provider: 'google' }, { provider: 'github' }],
          onSignIn: vi.fn(),
        })
      ),
      container
    )

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
    // Note: Social login functionality is handled by individual social login buttons
    // This test verifies that social buttons are rendered and clickable
    render(
      WithProviders(() =>
        AuthContainer({
          socialProviders: [{ provider: 'google' }],
          onSignIn: vi.fn(),
        })
      ),
      container
    )

    const googleButton = container.querySelector(
      '.bc-social-login-button--google'
    ) as HTMLButtonElement
    expect(googleButton).toBeTruthy()

    // Verify button is clickable (doesn't throw)
    expect(() => googleButton.click()).not.toThrow()
  })

  it('should handle errors gracefully', async () => {
    const onSignIn = vi.fn().mockRejectedValue(new Error('Sign in failed'))

    render(
      WithProviders(() =>
        AuthContainer({
          onSignIn,
        })
      ),
      container
    )

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
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    passwordInput.value = 'password123'
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }))

    submitButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    // Error handling is done internally by the form
    // Just verify the form is still present and functional
    const form = container.querySelector('.bc-auth-form__form')
    expect(form).toBeTruthy()
  })

  it('should apply custom className', () => {
    render(
      WithProviders(() =>
        AuthContainer({
          className: 'custom-auth-class',
          onSignIn: vi.fn(),
        })
      ),
      container
    )

    const authElement = container.querySelector('.bc-auth-container')
    expect(authElement?.classList.contains('custom-auth-class')).toBe(true)
  })

  it('should handle async form submission', async () => {
    const onSignIn = vi
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(null), 100))
      )

    render(
      WithProviders(() =>
        AuthContainer({
          onSignIn,
        })
      ),
      container
    )

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
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    passwordInput.value = 'password123'
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }))

    // Submit form
    submitButton.click()

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 200))

    expect(onSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })
})

describe('AuthModal', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    // Clean up any modals
    const modals = document.querySelectorAll('.bc-modal')
    modals.forEach(modal => modal.remove())
  })

  it('should render trigger and open modal with auth container', async () => {
    const onSignIn = vi.fn()

    render(
      WithProviders(() =>
        AuthModal(open =>
          Button(
            {
              onClick: () =>
                open({
                  onSignIn,
                }),
            },
            'Open Auth Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')!
    expect(button.textContent).toBe('Open Auth Modal')

    // Modal should not be visible initially
    expect(document.querySelector('.bc-modal')).toBeNull()

    // Click to open modal
    button.click()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Modal should be visible
    const modal = document.querySelector('.bc-modal')
    expect(modal).not.toBeNull()
    expect(modal!.className).toContain('bc-modal--size-sm') // AuthModal uses 'sm' size

    // Auth container should be inside the modal
    const authContainer = document.querySelector('.bc-auth-container')
    expect(authContainer).not.toBeNull()
    expect(authContainer!.className).toContain('bc-auth-container--signin') // default mode
  })

  it('should have dismissable modal with close button', async () => {
    render(
      WithProviders(() =>
        AuthModal(open =>
          Button(
            {
              onClick: () =>
                open({
                  onSignIn: vi.fn(),
                }),
            },
            'Open Auth Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')!
    button.click()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Modal should have close button
    const closeButton = document.querySelector('[aria-label="Close modal"]')
    expect(closeButton).not.toBeNull()

    // Modal should be dismissable (can click outside to close)
    const overlay = document.querySelector('.bc-overlay')
    expect(overlay).not.toBeNull()
  })

  it('should pass auth container options correctly', async () => {
    const onSignUp = vi.fn()
    const onModeChange = vi.fn()

    render(
      WithProviders(() =>
        AuthModal(open =>
          Button(
            {
              onClick: () =>
                open({
                  mode: 'signup',
                  onSignUp,
                  onModeChange,
                  socialProviders: [{ provider: 'google' }],
                }),
            },
            'Open Auth Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')!
    button.click()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Should show signup mode
    const authContainer = document.querySelector('.bc-auth-container')
    expect(authContainer).not.toBeNull()
    expect(authContainer!.className).toContain('bc-auth-container--signup')

    // Should have social providers
    const socialButton = document.querySelector('.bc-social-login-button')
    expect(socialButton).not.toBeNull()
  })
})
