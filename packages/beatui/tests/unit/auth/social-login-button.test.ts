// Social Login Button Tests
// Unit tests for the SocialLoginButton component

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import {
  SocialLoginButton,
  SocialLoginButtons,
  GoogleLoginButton,
  GitHubLoginButton,
} from '../../../src/components/auth/social-login-button'

describe('SocialLoginButton', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with correct provider styling', () => {
    const button = SocialLoginButton({
      provider: 'google',
      onClick: vi.fn(),
    })

    render(button, container)

    expect(container.querySelector('.bc-social-login-button')).toBeTruthy()
    expect(
      container.querySelector('.bc-social-login-button--google')
    ).toBeTruthy()
    expect(container.querySelector('.bc-button')).toBeTruthy()
  })

  it('should display correct provider text', () => {
    const button = SocialLoginButton({
      provider: 'github',
      onClick: vi.fn(),
    })

    render(button, container)

    expect(container.textContent).toContain('Continue with GitHub')
  })

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn().mockResolvedValue(undefined)
    const button = SocialLoginButton({
      provider: 'google',
      onClick,
    })

    render(button, container)

    const buttonElement = container.querySelector('button') as HTMLButtonElement
    buttonElement.click()

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should show loading state', () => {
    const loading = prop(true)
    const button = SocialLoginButton({
      provider: 'google',
      loading,
      onClick: vi.fn(),
    })

    render(button, container)

    expect(
      container.querySelector('.bc-social-login-button--loading')
    ).toBeTruthy()
    expect(container.textContent).toContain('Loading...')

    const buttonElement = container.querySelector('button') as HTMLButtonElement
    expect(buttonElement.disabled).toBe(true)
  })

  it('should be disabled when disabled prop is true', () => {
    const disabled = prop(true)
    const button = SocialLoginButton({
      provider: 'google',
      disabled,
      onClick: vi.fn(),
    })

    render(button, container)

    const buttonElement = container.querySelector('button') as HTMLButtonElement
    expect(buttonElement.disabled).toBe(true)
  })

  it('should support different sizes', () => {
    const button = SocialLoginButton({
      provider: 'google',
      size: 'lg',
      onClick: vi.fn(),
    })

    render(button, container)

    // Should have large size classes applied through Button component
    const buttonElement = container.querySelector('button')
    expect(buttonElement?.classList.toString()).toContain('lg')
  })

  it('should support different variants', () => {
    const button = SocialLoginButton({
      provider: 'google',
      variant: 'filled',
      onClick: vi.fn(),
    })

    render(button, container)

    // Should have filled variant classes applied through Button component
    const buttonElement = container.querySelector('button')
    expect(buttonElement?.classList.toString()).toContain('filled')
  })

  it('should render custom children when provided', () => {
    const button = SocialLoginButton({
      provider: 'google',
      onClick: vi.fn(),
      children: 'Custom Google Login',
    })

    render(button, container)

    expect(container.textContent).toContain('Custom Google Login')
    expect(container.textContent).not.toContain('Continue with Google')
  })

  it('should handle onClick errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onClick = vi.fn().mockRejectedValue(new Error('Login failed'))

    const button = SocialLoginButton({
      provider: 'google',
      onClick,
    })

    render(button, container)

    const buttonElement = container.querySelector('button') as HTMLButtonElement
    buttonElement.click()

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(consoleError).toHaveBeenCalledWith(
      'Social login error for google:',
      expect.any(Error)
    )

    consoleError.mockRestore()
  })
})

describe('SocialLoginButtons', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render multiple social login buttons', () => {
    const buttons = SocialLoginButtons({
      providers: [
        { provider: 'google' },
        { provider: 'github' },
        { provider: 'apple' },
      ],
      onProviderClick: vi.fn(),
    })

    render(buttons, container)

    expect(container.querySelector('.bc-social-login-buttons')).toBeTruthy()

    const socialButtons = container.querySelectorAll('.bc-social-login-button')
    expect(socialButtons).toHaveLength(3)

    expect(
      container.querySelector('.bc-social-login-button--google')
    ).toBeTruthy()
    expect(
      container.querySelector('.bc-social-login-button--github')
    ).toBeTruthy()
    expect(
      container.querySelector('.bc-social-login-button--apple')
    ).toBeTruthy()
  })

  it('should call onProviderClick with correct provider', async () => {
    const onProviderClick = vi.fn().mockResolvedValue(undefined)
    const buttons = SocialLoginButtons({
      providers: [{ provider: 'google' }, { provider: 'github' }],
      onProviderClick,
    })

    render(buttons, container)

    const googleButton = container.querySelector(
      '.bc-social-login-button--google'
    ) as HTMLButtonElement
    const githubButton = container.querySelector(
      '.bc-social-login-button--github'
    ) as HTMLButtonElement

    googleButton.click()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(onProviderClick).toHaveBeenCalledWith('google')

    githubButton.click()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(onProviderClick).toHaveBeenCalledWith('github')
  })

  it('should apply loading state to all buttons', () => {
    const loading = prop(true)
    const buttons = SocialLoginButtons({
      providers: [{ provider: 'google' }, { provider: 'github' }],
      loading,
      onProviderClick: vi.fn(),
    })

    render(buttons, container)

    const socialButtons = container.querySelectorAll(
      '.bc-social-login-button--loading'
    )
    expect(socialButtons).toHaveLength(2)
  })

  it('should apply custom className', () => {
    const buttons = SocialLoginButtons({
      providers: [{ provider: 'google' }],
      className: 'custom-buttons-class',
      onProviderClick: vi.fn(),
    })

    render(buttons, container)

    const element = container.querySelector('.bc-social-login-buttons')
    expect(element?.classList.contains('custom-buttons-class')).toBe(true)
  })
})

describe('Provider-specific buttons', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render GoogleLoginButton with correct provider', () => {
    const button = GoogleLoginButton({
      onClick: vi.fn(),
    })

    render(button, container)

    expect(
      container.querySelector('.bc-social-login-button--google')
    ).toBeTruthy()
    expect(container.textContent).toContain('Continue with Google')
  })

  it('should render GitHubLoginButton with correct provider', () => {
    const button = GitHubLoginButton({
      onClick: vi.fn(),
    })

    render(button, container)

    expect(
      container.querySelector('.bc-social-login-button--github')
    ).toBeTruthy()
    expect(container.textContent).toContain('Continue with GitHub')
  })

  it('should pass through all options to base component', () => {
    const onClick = vi.fn()
    const loading = prop(true)

    const button = GoogleLoginButton({
      onClick,
      loading,
      size: 'lg',
      variant: 'filled',
    })

    render(button, container)

    expect(
      container.querySelector('.bc-social-login-button--loading')
    ).toBeTruthy()
    const buttonElement = container.querySelector('button') as HTMLButtonElement
    expect(buttonElement.disabled).toBe(true)
  })
})
