// Social Login Button Tests
// Unit tests for the SocialLoginButton component

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import {
  SocialLoginButtons,
  GoogleLoginButton,
  GitHubLoginButton,
} from '../../../src/components/auth/social-login-button'
import { WithProviders } from '../../helpers/test-providers'

describe('SocialLoginButton', () => {
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

  it('should render with correct provider styling', () => {
    render(
      WithProviders(() =>
        GoogleLoginButton({
          onClick: vi.fn(),
        })
      ),
      container
    )

    expect(container.querySelector('.bc-button')).toBeTruthy()
    expect(container.textContent).toContain('Continue with Google')
  })

  it('should display correct provider text', () => {
    render(
      WithProviders(() =>
        GitHubLoginButton({
          onClick: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain('Continue with GitHub')
  })

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn().mockResolvedValue(undefined)

    render(
      WithProviders(() =>
        GoogleLoginButton({
          onClick,
        })
      ),
      container
    )

    const buttonElement = container.querySelector('button') as HTMLButtonElement
    buttonElement.click()

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should show loading state', () => {
    const loading = prop(true)

    render(
      WithProviders(() =>
        GoogleLoginButton({
          loading,
          onClick: vi.fn(),
        })
      ),
      container
    )

    const buttonElement = container.querySelector('button') as HTMLButtonElement
    expect(buttonElement.disabled).toBe(true)
  })

  it('should be disabled when disabled prop is true', () => {
    const disabled = prop(true)

    render(
      WithProviders(() =>
        GoogleLoginButton({
          disabled,
          onClick: vi.fn(),
        })
      ),
      container
    )

    const buttonElement = container.querySelector('button') as HTMLButtonElement
    expect(buttonElement.disabled).toBe(true)
  })

  it('should support different sizes', () => {
    render(
      WithProviders(() =>
        GoogleLoginButton({
          size: 'lg',
          onClick: vi.fn(),
        })
      ),
      container
    )

    const buttonElement = container.querySelector('button')
    expect(buttonElement).toBeTruthy()
  })

  it('should support different variants', () => {
    render(
      WithProviders(() =>
        GoogleLoginButton({
          onClick: vi.fn(),
        })
      ),
      container
    )

    const buttonElement = container.querySelector('button')
    expect(buttonElement).toBeTruthy()
  })

  it('should render custom children when provided', () => {
    render(
      WithProviders(() =>
        GoogleLoginButton({
          onClick: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain('Continue with Google')
  })

  it('should handle onClick errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onClick = vi.fn().mockRejectedValue(new Error('Login failed'))

    render(
      WithProviders(() =>
        GoogleLoginButton({
          onClick,
        })
      ),
      container
    )

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
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  it('should render multiple social login buttons', () => {
    render(
      WithProviders(() =>
        SocialLoginButtons({
          providers: [
            { provider: 'google' },
            { provider: 'github' },
            { provider: 'apple' },
          ],
          onProviderClick: vi.fn(),
        })
      ),
      container
    )

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

    render(
      WithProviders(() =>
        SocialLoginButtons({
          providers: [{ provider: 'google' }, { provider: 'github' }],
          onProviderClick,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)

    // Click first button (Google)
    buttons[0].click()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(onProviderClick).toHaveBeenCalledWith('google')

    // Click second button (GitHub)
    if (buttons[1]) {
      buttons[1].click()
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(onProviderClick).toHaveBeenCalledWith('github')
    }
  })

  it('should apply loading state to all buttons', () => {
    const loading = prop(true)

    render(
      WithProviders(() =>
        SocialLoginButtons({
          providers: [{ provider: 'google' }, { provider: 'github' }],
          loading,
          onProviderClick: vi.fn(),
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    buttons.forEach(button => {
      expect(button.disabled).toBe(true)
    })
  })

  it('should apply custom className', () => {
    render(
      WithProviders(() =>
        SocialLoginButtons({
          providers: [{ provider: 'google' }],
          className: 'custom-buttons-class',
          onProviderClick: vi.fn(),
        })
      ),
      container
    )

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
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  it('should render GoogleLoginButton with correct provider', () => {
    render(
      WithProviders(() =>
        GoogleLoginButton({
          onClick: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain('Continue with Google')
  })

  it('should render GitHubLoginButton with correct provider', () => {
    render(
      WithProviders(() =>
        GitHubLoginButton({
          onClick: vi.fn(),
        })
      ),
      container
    )

    expect(container.textContent).toContain('Continue with GitHub')
  })

  it('should pass through all options to base component', () => {
    const onClick = vi.fn()
    const loading = prop(true)

    render(
      WithProviders(() =>
        GoogleLoginButton({
          onClick,
          loading,
          size: 'lg',
        })
      ),
      container
    )

    const buttonElement = container.querySelector('button') as HTMLButtonElement
    expect(buttonElement.disabled).toBe(true)
  })
})
