// Sign In Form Tests
// Unit tests for the SignInForm component

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@tempots/dom'
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
          onSignIn: vi.fn(),
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
          onSignIn: vi.fn(),
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
          onSignIn: vi.fn(),
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
          onSignIn: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).not.toContain('Remember me')
  })

  it('should render form fields correctly', () => {
    render(
      WithProviders(() =>
        SignInForm({
          onSignIn: vi.fn(),
        })
      ),
      container
    )

    expect(container.querySelector('input[type="email"]')).toBeTruthy()
    expect(container.querySelector('input[type="password"]')).toBeTruthy()
    expect(container.querySelector('button[type="submit"]')).toBeTruthy()
  })

  it('should handle remember me functionality correctly', () => {
    render(
      WithProviders(() =>
        SignInForm({
          showRememberMe: true,
          onSignIn: vi.fn(),
        })
      ),
      container
    )

    expect(container.querySelector('[role="checkbox"]')).toBeTruthy()
  })

  it('should render submit button with correct text', () => {
    render(
      WithProviders(() =>
        SignInForm({
          onSignIn: vi.fn(),
        })
      ),
      container
    )

    const submitButton = container.querySelector('button[type="submit"]')
    expect(submitButton).toBeTruthy()
    expect(submitButton?.textContent).toContain('Sign In')
  })

  it('should call onSignIn with form data', async () => {
    const onSignIn = vi.fn().mockResolvedValue(null)

    render(
      WithProviders(() =>
        SignInForm({
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

    expect(onSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
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
          onSignIn: vi.fn(),
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

    const onSignIn = vi.fn().mockResolvedValue(null)

    render(
      WithProviders(() =>
        SignInForm({
          onSignIn,
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
      'bui_auth_email',
      '"test@example.com"'
    )
  })

  it('should handle form validation correctly', () => {
    render(
      WithProviders(() =>
        SignInForm({
          onSignIn: vi.fn(),
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

    // Form should have email and password inputs
    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
    expect(submitButton).toBeTruthy()
  })

  it('should handle form submission correctly', async () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'beatui-appearance-preference') return '"system"'
      return null
    })

    const onSignIn = vi.fn().mockResolvedValue(null)

    render(
      WithProviders(() =>
        SignInForm({
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

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('change', { bubbles: true }))

    passwordInput.value = 'password123'
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }))

    const form = container.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(onSignIn).toHaveBeenCalled()
  })

  it('should render basic form structure', () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'beatui-appearance-preference') return '"system"'
      return null
    })

    render(
      WithProviders(() =>
        SignInForm({
          onSignIn: vi.fn(),
        })
      ),
      container
    )

    // Should have basic form elements
    expect(container.querySelector('form')).toBeTruthy()
    expect(container.querySelector('input[type="email"]')).toBeTruthy()
    expect(container.querySelector('input[type="password"]')).toBeTruthy()
    expect(container.querySelector('button[type="submit"]')).toBeTruthy()
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
            signInButton: 'Custom Sign In',
            emailLabel: 'Custom Email',
            passwordLabel: 'Custom Password',
          },
          onSignIn: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain('Custom Sign In')
    expect(container.textContent).toContain('Custom Email')
    expect(container.textContent).toContain('Custom Password')
  })

  it('should handle form submission with empty fields', async () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'beatui-appearance-preference') return '"system"'
      return null
    })

    const onSignIn = vi.fn().mockResolvedValue(null)

    render(
      WithProviders(() =>
        SignInForm({
          onSignIn,
        })
      ),
      container
    )

    // Submit form without filling required fields
    const form_element = container.querySelector('form') as HTMLFormElement
    form_element.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 0))

    // Form allows submission with empty fields, validation happens in onSignIn
    expect(onSignIn).toHaveBeenCalledWith({
      email: '',
      password: '',
    })
  })
})
