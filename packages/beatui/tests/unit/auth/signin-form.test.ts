// Sign In Form Tests
// Unit tests for the SignInForm component

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { SignInForm } from './signin-form'
import { SignInData } from './types'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('SignInForm', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with default structure', () => {
    const form = SignInForm({
      onSubmit: vi.fn()
    })

    render(form, container)

    expect(container.querySelector('.bc-signin-form')).toBeTruthy()
    expect(container.querySelector('.bc-auth-form__title')).toBeTruthy()
    expect(container.querySelector('input[type="email"]')).toBeTruthy()
    expect(container.querySelector('input[type="password"]')).toBeTruthy()
    expect(container.querySelector('button[type="submit"]')).toBeTruthy()
  })

  it('should display correct title', () => {
    const form = SignInForm({
      onSubmit: vi.fn()
    })

    render(form, container)

    const title = container.querySelector('.bc-auth-form__title')
    expect(title?.textContent).toBe('Sign In')
  })

  it('should show remember me checkbox by default', () => {
    const form = SignInForm({
      onSubmit: vi.fn()
    })

    render(form, container)

    expect(container.querySelector('.bc-auth-form__remember-me')).toBeTruthy()
    expect(container.querySelector('input[type="checkbox"]')).toBeTruthy()
  })

  it('should hide remember me checkbox when configured', () => {
    const form = SignInForm({
      config: {
        showRememberMe: false
      },
      onSubmit: vi.fn()
    })

    render(form, container)

    expect(container.querySelector('.bc-auth-form__remember-me')).toBeFalsy()
  })

  it('should show social login buttons when providers are configured', () => {
    const form = SignInForm({
      config: {
        socialProviders: [
          { provider: 'google', clientId: 'test-id' },
          { provider: 'github', clientId: 'test-id' }
        ]
      },
      onSubmit: vi.fn()
    })

    render(form, container)

    expect(container.querySelector('.bc-auth-form__social')).toBeTruthy()
    expect(container.querySelectorAll('.bc-social-login-button')).toHaveLength(2)
    expect(container.querySelector('.bc-auth-divider')).toBeTruthy()
  })

  it('should hide social divider when configured', () => {
    const form = SignInForm({
      config: {
        socialProviders: [{ provider: 'google', clientId: 'test-id' }],
        showSocialDivider: false
      },
      onSubmit: vi.fn()
    })

    render(form, container)

    expect(container.querySelector('.bc-auth-divider')).toBeFalsy()
  })

  it('should show footer links by default', () => {
    const form = SignInForm({
      onSubmit: vi.fn()
    })

    render(form, container)

    const footer = container.querySelector('.bc-auth-form__footer')
    expect(footer).toBeTruthy()
    
    const links = footer?.querySelectorAll('.bc-auth-form__link')
    expect(links).toHaveLength(2) // Forgot password + Sign up links
  })

  it('should hide sign up link when configured', () => {
    const form = SignInForm({
      config: {
        allowSignUp: false
      },
      onSubmit: vi.fn()
    })

    render(form, container)

    const footer = container.querySelector('.bc-auth-form__footer')
    const links = footer?.querySelectorAll('.bc-auth-form__link')
    expect(links).toHaveLength(1) // Only forgot password link
  })

  it('should hide forgot password link when configured', () => {
    const form = SignInForm({
      config: {
        allowPasswordReset: false
      },
      onSubmit: vi.fn()
    })

    render(form, container)

    const footer = container.querySelector('.bc-auth-form__footer')
    const links = footer?.querySelectorAll('.bc-auth-form__link')
    expect(links).toHaveLength(1) // Only sign up link
  })

  it('should call onSubmit with form data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const form = SignInForm({
      onSubmit
    })

    render(form, container)

    // Fill in the form
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement
    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('input', { bubbles: true }))
    
    passwordInput.value = 'password123'
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }))

    // Submit the form
    const form_element = container.querySelector('form') as HTMLFormElement
    form_element.dispatchEvent(new Event('submit', { bubbles: true }))

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false
    })
  })

  it('should handle remember me functionality', () => {
    localStorageMock.getItem.mockReturnValue('remembered@example.com')
    
    const form = SignInForm({
      onSubmit: vi.fn()
    })

    render(form, container)

    // Should pre-fill email from localStorage
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement
    expect(emailInput.value).toBe('remembered@example.com')

    // Remember me should be checked
    const rememberCheckbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(rememberCheckbox.checked).toBe(true)
  })

  it('should save email when remember me is checked', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const form = SignInForm({
      onSubmit
    })

    render(form, container)

    // Fill form and check remember me
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement
    const rememberCheckbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement

    emailInput.value = 'test@example.com'
    emailInput.dispatchEvent(new Event('input', { bubbles: true }))
    
    passwordInput.value = 'password123'
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }))

    rememberCheckbox.checked = true
    rememberCheckbox.dispatchEvent(new Event('change', { bubbles: true }))

    // Submit form
    const form_element = container.querySelector('form') as HTMLFormElement
    form_element.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'beatui_auth_remember_email',
      'test@example.com'
    )
  })

  it('should show loading state', () => {
    const loading = prop(true)
    const form = SignInForm({
      loading,
      onSubmit: vi.fn()
    })

    render(form, container)

    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement
    expect(submitButton.disabled).toBe(true)
    expect(submitButton.textContent).toContain('Loading...')

    const inputs = container.querySelectorAll('input')
    inputs.forEach(input => {
      expect(input.disabled).toBe(true)
    })
  })

  it('should show error message', () => {
    const error = prop('Sign in failed')
    const form = SignInForm({
      error,
      onSubmit: vi.fn()
    })

    render(form, container)

    const errorElement = container.querySelector('.bc-auth-form__error')
    expect(errorElement).toBeTruthy()
    expect(errorElement?.textContent).toBe('Sign in failed')
  })

  it('should call onModeChange when links are clicked', () => {
    const onModeChange = vi.fn()
    const form = SignInForm({
      onModeChange,
      onSubmit: vi.fn()
    })

    render(form, container)

    const links = container.querySelectorAll('.bc-auth-form__link')
    
    // Click forgot password link
    const forgotPasswordLink = links[0] as HTMLButtonElement
    forgotPasswordLink.click()
    expect(onModeChange).toHaveBeenCalledWith('reset-password')

    // Click sign up link
    const signUpLink = links[1] as HTMLButtonElement
    signUpLink.click()
    expect(onModeChange).toHaveBeenCalledWith('signup')
  })

  it('should use custom labels', () => {
    const form = SignInForm({
      config: {
        labels: {
          signInTitle: 'Custom Sign In',
          emailLabel: 'Custom Email',
          passwordLabel: 'Custom Password'
        }
      },
      onSubmit: vi.fn()
    })

    render(form, container)

    expect(container.textContent).toContain('Custom Sign In')
    expect(container.textContent).toContain('Custom Email')
    expect(container.textContent).toContain('Custom Password')
  })

  it('should prevent form submission when form has errors', async () => {
    const onSubmit = vi.fn()
    const form = SignInForm({
      onSubmit
    })

    render(form, container)

    // Submit form without filling required fields
    const form_element = container.querySelector('form') as HTMLFormElement
    form_element.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
