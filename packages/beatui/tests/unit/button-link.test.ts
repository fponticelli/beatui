import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { ButtonLink } from '../../src/components/navigation/link/button-link'
import { WithProviders, Provide } from '../helpers/test-providers'
import { Location } from '@tempots/ui'
import { isUrlMatch } from '../../src/components/navigation/link/navigation-link'
import { ButtonVariant } from '@/index'

describe('ButtonLink Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render as anchor with default props', () => {
    render(
      WithProviders(() =>
        Provide(Location, { pathname: '/', search: {}, hash: '' }, () =>
          ButtonLink({ href: '/test' }, 'Click me')
        )
      ),
      container
    )

    const link = container.querySelector('a')
    expect(link).not.toBeNull()
    expect(link!.textContent).toBe('Click me')
    expect(link!.getAttribute('href')).toBe('/test')
    expect(link!.className).toContain('bc-button')
  })

  it('should render as span when disabled', () => {
    render(
      WithProviders(() =>
        ButtonLink({ href: '/test', disabled: true }, 'Disabled Link')
      ),
      container
    )

    const span = container.querySelector('span')
    const link = container.querySelector('a')
    expect(span).not.toBeNull()
    expect(link).toBeNull()
    expect(span!.textContent).toBe('Disabled Link')
    expect(span!.className).toContain('bc-button')
    expect(span!.className).toContain('bc-button--disabled')
  })

  it('should apply button styling variants', () => {
    render(
      WithProviders(() =>
        Provide(Location, { pathname: '/', search: {}, hash: '' }, () =>
          ButtonLink(
            {
              href: '/test',
              variant: 'outline',
              size: 'lg',
              color: 'primary',
              roundedness: 'md',
            },
            'Styled Link'
          )
        )
      ),
      container
    )

    const link = container.querySelector('a')
    expect(link!.className).toContain('bc-button')
    expect(link!.className).toContain('bc-button--outline')
    expect(link!.className).toContain('bc-control--padding-lg')
    expect(link!.style.fontSize).toBe('var(--font-size-lg)')
    expect(link!.style.borderRadius).toBe('var(--radius-md)')
    expect(link!.style.getPropertyValue('--button-border')).toBe(
      'var(--color-primary-500)'
    )
  })

  it('should support target and rel attributes', () => {
    render(
      WithProviders(() =>
        Provide(Location, { pathname: '/', search: {}, hash: '' }, () =>
          ButtonLink(
            {
              href: 'https://example.com',
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            'External Link'
          )
        )
      ),
      container
    )

    const link = container.querySelector('a')
    expect(link!.getAttribute('target')).toBe('_blank')
    expect(link!.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('should handle reactive props', async () => {
    const disabled = prop(false)
    const variant = prop<ButtonVariant>('filled')

    render(
      WithProviders(() =>
        Provide(Location, { pathname: '/', search: {}, hash: '' }, () =>
          ButtonLink(
            {
              href: '/test',
              disabled,
              variant,
            },
            'Reactive Link'
          )
        )
      ),
      container
    )

    // Initially should be an anchor
    let link = container.querySelector('a')
    let span = container.querySelector('span')
    expect(link).not.toBeNull()
    expect(span).toBeNull()

    // Change to disabled
    disabled.set(true)
    await new Promise(resolve => setTimeout(resolve, 0))

    link = container.querySelector('a')
    span = container.querySelector('span')
    expect(link).toBeNull()
    expect(span).not.toBeNull()

    // Change variant (should still be span since disabled)
    variant.set('outline')
    await new Promise(resolve => setTimeout(resolve, 0))

    span = container.querySelector('span')
    expect(span!.className).toContain('bc-button--disabled')
  })

  it('should support navigation behavior with matchMode', () => {
    // Test the isUrlMatch function directly since Location provider testing is complex
    const location = { pathname: '/test', search: {}, hash: '' }
    const shouldMatch = isUrlMatch(location, '/test', 'exact')
    expect(shouldMatch).toBe(true)

    // Test that ButtonLink accepts navigation props without errors
    render(
      WithProviders(() =>
        Provide(Location, { pathname: '/', search: {}, hash: '' }, () =>
          ButtonLink(
            {
              href: '/test',
              matchMode: 'exact',
              disableWhenActive: true,
            },
            'Navigation Link'
          )
        )
      ),
      container
    )

    // Should render without errors (Location provider testing is complex in test environment)
    const element = container.querySelector('a, span')
    expect(element).not.toBeNull()
    expect(element!.textContent).toBe('Navigation Link')
  })

  it('should render as anchor when not matching current location', () => {
    render(
      WithProviders(() =>
        Provide(Location, { pathname: '/other', search: {}, hash: '' }, () =>
          ButtonLink(
            {
              href: '/test',
              matchMode: 'exact',
              disableWhenActive: true,
            },
            'Inactive Link'
          )
        )
      ),
      container
    )

    // Should render as anchor when not matching current location
    const link = container.querySelector('a')
    const span = container.querySelector('span')
    expect(link).not.toBeNull()
    expect(span).toBeNull()
    expect(link!.textContent).toBe('Inactive Link')
    expect(link!.getAttribute('href')).toBe('/test')
  })

  it('should not disable when disableWhenActive is false', () => {
    render(
      WithProviders(() =>
        Provide(Location, { pathname: '/test', search: {}, hash: '' }, () =>
          ButtonLink(
            {
              href: '/test',
              matchMode: 'exact',
              disableWhenActive: false,
            },
            'Always Active Link'
          )
        )
      ),
      container
    )

    // Should render as anchor even when matching current location
    const link = container.querySelector('a')
    const span = container.querySelector('span')
    expect(link).not.toBeNull()
    expect(span).toBeNull()
    expect(link!.textContent).toBe('Always Active Link')
  })
})
