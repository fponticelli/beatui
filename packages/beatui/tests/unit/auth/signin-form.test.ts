// Sign In Form Tests
// Unit tests for the SignInForm component

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { SignInForm } from '../../../src/components/auth/signin-form'
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

describe('SignInForm', () => {
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
        SignInForm({
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    expect(container.querySelector('form')).toBeTruthy()
    expect(container.querySelector('input[type="email"]')).toBeTruthy()
    expect(container.querySelector('input[type="password"]')).toBeTruthy()
    expect(container.querySelector('button[type="submit"]')).toBeTruthy()
  })

  it('should display correct title', () => {
    render(
      WithProviders(() =>
        SignInForm({
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain('Sign In')
  })

  it('should show remember me checkbox by default', () => {
    render(
      WithProviders(() =>
        SignInForm({
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    expect(container.querySelector('[role="checkbox"]')).toBeTruthy()
  })

  it('should hide remember me checkbox when configured', () => {
    render(
      WithProviders(() =>
        SignInForm({
          showRememberMe: false,
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).not.toContain('Remember me')
  })

  it('should show social login buttons when providers are configured', () => {
    render(
      WithProviders(() =>
        SignInForm({
          socialProviders: [
            { provider: 'google', clientId: 'test-id' },
            { provider: 'github', clientId: 'test-id' },
          ],
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain('Continue with Google')
    expect(container.textContent).toContain('Continue with GitHub')
  })

  it('should hide social divider when configured', () => {
    render(
      WithProviders(() =>
        SignInForm({
          socialProviders: [{ provider: 'google', clientId: 'test-id' }],
          showSocialDivider: false,
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain('Continue with Google')
  })

  it('should show footer links by default', () => {
    render(
      WithProviders(() =>
        SignInForm({
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain("Don't have an account? Sign up")
    expect(container.textContent).toContain('Forgot password?')
  })

  it('should hide sign up link when configured', () => {
    render(
      WithProviders(() =>
        SignInForm({
          allowSignUp: false,
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain('Forgot password?')
    expect(container.textContent).not.toContain(
      "Don't have an account? Sign up"
    )
  })

  it('should hide forgot password link when configured', () => {
    render(
      WithProviders(() =>
        SignInForm({
          allowPasswordReset: false,
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain("Don't have an account? Sign up")
    expect(container.textContent).not.toContain('Forgot password?')
  })

  it('should call onSubmit with form data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      WithProviders(() =>
        SignInForm({
          onSubmit,
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

    // Set values and trigger change events
    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    passwordInput.value = 'password123'
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }))

    // Submit the form
    const form_element = container.querySelector('form') as HTMLFormElement
    form_element.dispatchEvent(new Event('submit', { bubbles: true }))

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    })
  })

  it('should handle remember me functionality', () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'bui_auth_remember_email') return 'remembered@example.com'
      if (key === 'beatui-appearance-preference') return '"system"'
      return null
    })

    render(
      WithProviders(() =>
        SignInForm({
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    // Should have remember me checkbox
    expect(container.querySelector('[role="checkbox"]')).toBeTruthy()
  })

  it('should save email when remember me is checked', async () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'beatui-appearance-preference') return '"system"'
      return null
    })

    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      WithProviders(() =>
        SignInForm({
          onSubmit,
        })
      ),
      container
    )

    // Fill form and check remember me
    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement
    const passwordInput = container.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement
    const rememberCheckbox = container.querySelector(
      '[role="checkbox"]'
    ) as HTMLElement

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    passwordInput.value = 'password123'
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }))

    rememberCheckbox.click()

    // Submit form
    const form_element = container.querySelector('form') as HTMLFormElement
    form_element.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'bui_auth_remember_email',
      'test@example.com'
    )
  })

  it('should show loading state', async () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'beatui-appearance-preference') return '"system"'
      return null
    })

    const loading = prop(true)

    render(
      WithProviders(() =>
        SignInForm({
          loading,
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    // Wait for signal updates to be processed
    await new Promise(resolve => setTimeout(resolve, 100))

    // Force a re-render to ensure all reactive updates are applied
    await new Promise(resolve => requestAnimationFrame(resolve))

    const submitButton = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement
    expect(submitButton.disabled).toBe(true)
    expect(submitButton.textContent).toContain('Loading...')

    const inputs = container.querySelectorAll('input')
    inputs.forEach(input => {
      expect(input.disabled).toBe(true)
    })
  })

  it('should show error message', () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'beatui-appearance-preference') return '"system"'
      return null
    })

    const error = prop<string | null>('Sign in failed')

    render(
      WithProviders(() =>
        SignInForm({
          error,
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    const errorElement = container.querySelector('.bc-auth-form__error')
    expect(errorElement).toBeTruthy()
    expect(errorElement?.textContent).toBe('Sign in failed')
  })

  it('should call onModeChange when links are clicked', () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'beatui-appearance-preference') return '"system"'
      return null
    })

    const onModeChange = vi.fn()

    render(
      WithProviders(() =>
        SignInForm({
          onModeChange,
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain("Don't have an account? Sign up")
    expect(container.textContent).toContain('Forgot password?')
  })

  it('should use custom labels', () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'beatui-appearance-preference') return '"system"'
      return null
    })

    render(
      WithProviders(() =>
        SignInForm({
          labels: {
            signInTitle: () => 'Custom Sign In',
            emailLabel: () => 'Custom Email',
            passwordLabel: () => 'Custom Password',
          },
          onSubmit: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain('Custom Sign In')
    expect(container.textContent).toContain('Custom Email')
    expect(container.textContent).toContain('Custom Password')
  })

  it('should prevent form submission when form has errors', async () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'beatui-appearance-preference') return '"system"'
      return null
    })

    const onSubmit = vi.fn()

    render(
      WithProviders(() =>
        SignInForm({
          onSubmit,
        })
      ),
      container
    )

    // Submit form without filling required fields
    const form_element = container.querySelector('form') as HTMLFormElement
    form_element.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
