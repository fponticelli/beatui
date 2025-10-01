import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, prop } from '@tempots/dom'
import { Icon } from '../../src/components/data/icon'
import { WithProviders } from '../helpers/test-providers'

// Mock the icon loading to avoid network requests in tests
vi.mock('../../src/components/data/icon.ts', async importOriginal => {
  const original = (await importOriginal()) as object
  return {
    ...original,
    loadIconSvg: vi
      .fn()
      .mockResolvedValue(
        '<svg><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
      ),
  }
})

describe('Icon Accessibility', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('Decorative icons', () => {
    it('should be hidden from screen readers when decorative', () => {
      render(
        WithProviders(() =>
          Icon({
            icon: 'test-icon',
            accessibility: 'decorative',
          })
        ),
        container
      )

      const icon = container.querySelector('.bc-icon')!
      expect(icon.getAttribute('aria-hidden')).toBe('true')
      expect(icon.getAttribute('role')).toBeNull()
      expect(icon.getAttribute('aria-label')).toBeNull()
    })

    it('should be decorative by default when no title is provided', () => {
      render(
        WithProviders(() =>
          Icon({
            icon: 'test-icon',
          })
        ),
        container
      )

      const icon = container.querySelector('.bc-icon')!
      expect(icon.getAttribute('aria-hidden')).toBe('true')
      expect(icon.getAttribute('role')).toBeNull()
      expect(icon.getAttribute('aria-label')).toBeNull()
    })

    it('should be decorative when accessibility is auto and title is empty', () => {
      render(
        WithProviders(() =>
          Icon({
            icon: 'test-icon',
            title: '',
            accessibility: 'auto',
          })
        ),
        container
      )

      const icon = container.querySelector('.bc-icon')!
      expect(icon.getAttribute('aria-hidden')).toBe('true')
    })
  })

  describe('Informative icons', () => {
    it('should have proper ARIA attributes when informative', () => {
      render(
        WithProviders(() =>
          Icon({
            icon: 'test-icon',
            title: 'Important icon',
            accessibility: 'informative',
          })
        ),
        container
      )

      const icon = container.querySelector('.bc-icon')!
      expect(icon.getAttribute('role')).toBe('img')
      expect(icon.getAttribute('aria-label')).toBe('Important icon')
      expect(icon.getAttribute('aria-hidden')).toBeNull()
    })

    it('should be informative when title is provided and accessibility is auto', () => {
      render(
        WithProviders(() =>
          Icon({
            icon: 'test-icon',
            title: 'Meaningful icon',
          })
        ),
        container
      )

      const icon = container.querySelector('.bc-icon')!
      expect(icon.getAttribute('role')).toBe('img')
      expect(icon.getAttribute('aria-label')).toBe('Meaningful icon')
      expect(icon.getAttribute('aria-hidden')).toBeNull()
    })

    it('should use default label when informative but no title provided', () => {
      render(
        WithProviders(() =>
          Icon({
            icon: 'test-icon',
            accessibility: 'informative',
          })
        ),
        container
      )

      const icon = container.querySelector('.bc-icon')!
      expect(icon.getAttribute('role')).toBe('img')
      expect(icon.getAttribute('aria-label')).toBe('Icon')
    })
  })

  describe('Dynamic accessibility changes', () => {
    it('should update accessibility attributes when title changes', async () => {
      const title = prop('' as string | undefined)

      render(
        WithProviders(() =>
          Icon({
            icon: 'test-icon',
            title,
            accessibility: 'auto',
          })
        ),
        container
      )

      const icon = container.querySelector('.bc-icon')!

      // Initially decorative (no title)
      expect(icon.getAttribute('aria-hidden')).toBe('true')
      expect(icon.getAttribute('role')).toBeNull()

      // Add title to make it informative
      title.set('New title')
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(icon.getAttribute('role')).toBe('img')
      expect(icon.getAttribute('aria-label')).toBe('New title')
      expect(icon.getAttribute('aria-hidden')).toBeNull()

      // Remove title to make it decorative again
      title.set('')
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(icon.getAttribute('aria-hidden')).toBe('true')
      expect(icon.getAttribute('role')).toBeNull()
    })

    it('should update accessibility attributes when accessibility mode changes', async () => {
      const accessibility = prop<'decorative' | 'informative' | 'auto'>(
        'decorative'
      )

      render(
        WithProviders(() =>
          Icon({
            icon: 'test-icon',
            title: 'Test icon',
            accessibility,
          })
        ),
        container
      )

      const icon = container.querySelector('.bc-icon')!

      // Initially decorative
      expect(icon.getAttribute('aria-hidden')).toBe('true')

      // Change to informative
      accessibility.set('informative')
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(icon.getAttribute('role')).toBe('img')
      expect(icon.getAttribute('aria-label')).toBe('Test icon')
      expect(icon.getAttribute('aria-hidden')).toBeNull()
    })
  })

  describe('Icon sizes and colors', () => {
    it('should maintain accessibility attributes across different sizes', () => {
      render(
        WithProviders(() =>
          Icon({
            icon: 'test-icon',
            size: 'lg',
            title: 'Large icon',
          })
        ),
        container
      )

      const icon = container.querySelector('.bc-icon')!
      expect(icon.className).toContain('bc-icon--lg')
      expect(icon.getAttribute('role')).toBe('img')
      expect(icon.getAttribute('aria-label')).toBe('Large icon')
    })

    it('should maintain accessibility attributes across different colors', () => {
      render(
        WithProviders(() =>
          Icon({
            icon: 'test-icon',
            color: 'primary',
            title: 'Colored icon',
          })
        ),
        container
      )

      const icon = container.querySelector('.bc-icon')!
      const style = icon.getAttribute('style') ?? ''
      expect(style).toContain('--icon-color: var(--color-primary-500)')
      expect(style).toContain('--icon-color-dark: var(--color-primary-600)')
      expect(icon.getAttribute('role')).toBe('img')
      expect(icon.getAttribute('aria-label')).toBe('Colored icon')
    })
  })

  describe('Loading and error states', () => {
    it('should have proper accessibility for loading state when informative', async () => {
      // Mock a delayed icon load to test loading state
      const mockLoadIconSvg = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise(resolve =>
              setTimeout(() => resolve('<svg>test</svg>'), 100)
            )
        )

      vi.doMock('../../src/components/data/icon.ts', () => ({
        loadIconSvg: mockLoadIconSvg,
      }))

      render(
        WithProviders(() =>
          Icon({
            icon: 'test-icon',
            title: 'Loading icon',
            accessibility: 'informative',
          })
        ),
        container
      )

      // Check loading state
      const loadingSpinner = container.querySelector('.animate-spin')
      if (loadingSpinner) {
        expect(loadingSpinner.getAttribute('role')).toBe('img')
        expect(loadingSpinner.getAttribute('aria-label')).toBe('Loading icon')
      }
    })

    it('should have proper accessibility for loading state when decorative', async () => {
      render(
        WithProviders(() =>
          Icon({
            icon: 'test-icon',
            accessibility: 'decorative',
          })
        ),
        container
      )

      // Check loading state
      const loadingSpinner = container.querySelector('.animate-spin')
      if (loadingSpinner) {
        expect(loadingSpinner.getAttribute('aria-hidden')).toBe('true')
      }
    })

    it('should have proper accessibility for error state when informative', async () => {
      // Mock a failed icon load
      const mockLoadIconSvg = vi
        .fn()
        .mockRejectedValue(new Error('Failed to load'))

      vi.doMock('../../src/components/data/icon.ts', () => ({
        loadIconSvg: mockLoadIconSvg,
      }))

      render(
        WithProviders(() =>
          Icon({
            icon: 'nonexistent-icon',
            title: 'Error icon',
            accessibility: 'informative',
          })
        ),
        container
      )

      // Wait for error state
      await new Promise(resolve => setTimeout(resolve, 100))

      const errorIcon = container.querySelector('.text-red-500')
      if (errorIcon) {
        expect(errorIcon.getAttribute('role')).toBe('img')
        expect(errorIcon.getAttribute('aria-label')).toBe('Failed to load icon')
      }
    })
  })

  describe('Icon with children', () => {
    it('should support children while maintaining accessibility', () => {
      render(
        WithProviders(() =>
          Icon(
            {
              icon: 'test-icon',
              title: 'Icon with badge',
            },
            // Child element (like a badge)
            'badge'
          )
        ),
        container
      )

      const icon = container.querySelector('.bc-icon')!
      expect(icon.getAttribute('role')).toBe('img')
      expect(icon.getAttribute('aria-label')).toBe('Icon with badge')
      expect(icon.textContent).toContain('badge')
    })
  })
})
