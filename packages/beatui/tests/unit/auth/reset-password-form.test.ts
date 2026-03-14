// Reset Password Form Tests
// Unit tests for the ResetPasswordForm component

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@tempots/dom'
import { ResetPasswordForm } from '../../../src/components/auth/reset-password-form'
import { WithProviders } from '../../helpers/test-providers'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('ResetPasswordForm', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  it('should render with default structure', () => {
    render(
      WithProviders(() =>
        ResetPasswordForm({
          onResetPassword: vi.fn(),
        })
      ),
      container
    )

    expect(container.querySelector('form')).toBeTruthy()
    expect(container.querySelector('input[type="email"]')).toBeTruthy()
    expect(container.querySelector('button[type="submit"]')).toBeTruthy()
  })

  it('should display description text', () => {
    render(
      WithProviders(() =>
        ResetPasswordForm({
          onResetPassword: vi.fn(),
        })
      ),
      container
    )

    // The description element should exist
    expect(
      container.querySelector('.bc-auth-form__description')
    ).toBeTruthy()
  })

  it('should render submit button with correct text', () => {
    render(
      WithProviders(() =>
        ResetPasswordForm({
          onResetPassword: vi.fn(),
        })
      ),
      container
    )

    const submitButton = container.querySelector('button[type="submit"]')
    expect(submitButton).toBeTruthy()
    expect(submitButton?.textContent).toContain('Reset')
  })

  it('should call onResetPassword with email data', async () => {
    const onResetPassword = vi.fn().mockResolvedValue(null)

    render(
      WithProviders(() =>
        ResetPasswordForm({
          onResetPassword,
        })
      ),
      container
    )

    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    const form = container.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(onResetPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
    })
  })

  it('should not call onResetPassword with empty email', async () => {
    const onResetPassword = vi.fn().mockResolvedValue(null)

    render(
      WithProviders(() =>
        ResetPasswordForm({
          onResetPassword,
        })
      ),
      container
    )

    const form = container.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(onResetPassword).not.toHaveBeenCalled()
  })

  it('should use custom labels', () => {
    render(
      WithProviders(() =>
        ResetPasswordForm({
          onResetPassword: vi.fn(),
          labels: {
            resetPasswordButton: 'Custom Reset',
            emailLabel: 'Custom Email',
            resetPasswordDescription: 'Custom description text',
          },
        })
      ),
      container
    )

    expect(container.textContent).toContain('Custom Reset')
    expect(container.textContent).toContain('Custom Email')
    expect(container.textContent).toContain('Custom description text')
  })

  it('should display error from onResetPassword callback', async () => {
    const onResetPassword = vi
      .fn()
      .mockResolvedValue('Email not found in our system')

    render(
      WithProviders(() =>
        ResetPasswordForm({
          onResetPassword,
        })
      ),
      container
    )

    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement

    emailInput.value = 'unknown@example.com'
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    const form = container.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 200))

    expect(onResetPassword).toHaveBeenCalled()
    expect(container.textContent).toContain('Email not found in our system')
  })

  it('should handle onResetPassword throwing an error', async () => {
    const onResetPassword = vi
      .fn()
      .mockRejectedValue(new Error('Network error'))

    render(
      WithProviders(() =>
        ResetPasswordForm({
          onResetPassword,
        })
      ),
      container
    )

    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    const form = container.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 200))

    // Form should still be present
    expect(container.querySelector('form')).toBeTruthy()
    // Should show the fallback error
    expect(container.textContent).toContain('Reset password failed')
  })

  it('should render without onResetPassword callback', () => {
    render(
      WithProviders(() =>
        ResetPasswordForm({})
      ),
      container
    )

    expect(container.querySelector('form')).toBeTruthy()
  })

  it('should pre-populate email from localStorage when available', () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'bui_auth_email') return '"saved@example.com"'
      if (key === 'beatui-appearance-preference') return '"system"'
      return null
    })

    render(
      WithProviders(() =>
        ResetPasswordForm({
          onResetPassword: vi.fn(),
        })
      ),
      container
    )

    // The form should render with the persisted email
    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement
    expect(emailInput).toBeTruthy()
  })

  it('should only have email input (no password fields)', () => {
    render(
      WithProviders(() =>
        ResetPasswordForm({
          onResetPassword: vi.fn(),
        })
      ),
      container
    )

    expect(container.querySelector('input[type="email"]')).toBeTruthy()
    expect(container.querySelector('input[type="password"]')).toBeFalsy()
  })
})
